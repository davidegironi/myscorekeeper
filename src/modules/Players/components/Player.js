// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import React, {
  useContext, useState, useEffect, useRef
} from 'react';
import {
  KeyboardAvoidingView,
  TextInput,
  Text,
  View,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import useIsMounted from 'ismounted';

// load contexts
import MainContext from '../../../contexts/MainContext';

// load settings
import I18n from '../../../locales/locales';
import theme from '../../../themes/themes.default';
import s from '../../../themes/styles';

// load pages
import navpages from '../../AppMain/components/AppNavigator.pages';

// load helpers
import ToastHelper from '../../../helpers/Toast.helpers';
import ButtonTouch from '../../ButtonTouch/components/ButtonTouch';

// load images
const imageSave = require('../../../images/save.png');

/**
 * component
 */
export default function Match() {
  const { state } = useContext(MainContext);
  const { db } = state;
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const isMounted = useIsMounted();

  // states
  const [id, setId] = useState(route.params.id);
  const [obj, setObj] = useState(route.params.obj);
  const [isloading, setIsloading] = useState(true);
  const [forcerefresh, setForcerefresh] = useState(true);
  const [isediting, setIsediting] = useState(false);
  const [matchid] = useState(route.params.matchid);

  // db schemas
  const match = db.Matches.find(matchid);

  // refs
  const nameRef = useRef(null);

  // effects - request refresh
  useEffect(() => {
    if (!isMounted.current) { return; }
    if (route.params?.refresh) {
      setForcerefresh(!forcerefresh);
    }
  }, [route.params?.refresh]);

  // effects - page load
  useEffect(() => {
    if (!isMounted.current) { return; }
    if (isFocused) {
      if (id != null) {
        // check editing mode
        if (route.params.isediting != null) {
          setIsediting(route.params.isediting);
        }
        // load current object
        const objfind = db.Players.find(id);
        setObj(objfind);
      } else {
        // load void object
        setIsediting(true);
        const newobj = db.Players.void();
        newobj.id = db.Players.newid();
        setObj(newobj);
      }
    }
  }, [forcerefresh, isFocused]);

  // effects - object validator
  useEffect(() => {
    if (!isMounted.current) { return; }
    if (obj != null && typeof obj.isValid !== 'undefined' && !obj.isValid()) { setForcerefresh(!forcerefresh); }
  }, [obj]);

  // effects - focus
  useEffect(() => {
    if (!isMounted.current) { return; }
    if (nameRef.current != null && isediting) { nameRef.current.focus(); }
  }, [isloading]);

  // effects - reset loading
  useEffect(() => {
    if (!isMounted.current) { return; }
    if (isloading) {
      setIsloading(false);
    }
  }, [isloading]);

  // loader action
  if (isloading) {
    return (
      <View style={s.container}>
        <View style={s.loadingcontainer}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
      <View style={s.formcontainer}>
        <View style={s.formrow}>
          <View style={s.formlabel}>
            <Text style={s.formlabeltext}>{I18n.t('player.propertyname')}</Text>
          </View>
          <TextInput
            style={[
              s.forminputtextinput,
              isediting ? s.forminputtextinputenabled : s.forminputtextinputdisabled
            ]}
            value={obj.name}
            editable={isediting}
            placeholder={I18n.t('player.placeholdername')}
            autoCorrect={false}
            underlineColorAndroid="transparent"
            returnKeyType="done"
            ref={nameRef}
            onChangeText={(text) => setObj({ ...obj, name: text })}
          />
          {isediting
            ? (
              <View style={s.formbutton}>
                <ButtonTouch
                  title={I18n.t('appmain.buttonsave')}
                  backgroundColor={theme.COLOR_BUTTONSAVE_BACKGROUNDCOLOR}
                  color={theme.COLOR_BUTTONSAVE_COLOR}
                  imageLeft={imageSave}
                  onPress={() => {
                    let { players } = match;
                    if (obj.name.length === 0) {
                      ToastHelper.showAlertMessage(I18n.t('player.erroremptyname'));
                    } else if ([...players].find((x) => x.id !== obj.id && x.name === obj.name)) {
                      ToastHelper.showAlertMessage(I18n.t('player.erroralreadyexists'));
                    } else if (id == null) {
                      players = [...players, obj];
                      db.Matches.update({
                        ...match,
                        players
                      }, matchid);
                      setId(obj.id);
                      setIsediting(false);
                      setForcerefresh(!forcerefresh);
                      navigation.navigate(navpages.Match, { refresh: true });
                    } else {
                      db.Players.update(obj, id);
                      navigation.navigate(navpages.Match, { refresh: true });
                    }
                  }}
                />
              </View>
            )
            : null}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

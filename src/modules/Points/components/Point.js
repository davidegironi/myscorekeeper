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
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import useIsMounted from 'ismounted';
import Moment from 'moment';

// load contexts
import MainContext from '../../../contexts/MainContext';

// load settings
import I18n from '../../../locales/locales';
import theme from '../../../themes/themes.default';
import s from '../../../themes/styles';

// load pages
import navpages from '../../AppMain/components/AppNavigator.pages';

// load components
import ButtonTouch from '../../ButtonTouch/components/ButtonTouch';

// load images
const imageSave = require('../../../images/save.png');

/**
 * component
 */
export default function Point() {
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
  const [roundid] = useState(route.params.roundid);
  const [playerid] = useState(route.params.playerid);
  const [pointisplus] = useState(route.params.pointisplus);

  // db schemas
  const round = db.Rounds.find(roundid);
  const player = db.Players.find(playerid);

  // refs
  const pointRef = useRef(null);

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
        const objfind = db.Points.find(id);
        setObj(objfind);
      } else {
        // load void object
        setIsediting(true);
        const newobj = db.Points.void();
        newobj.id = db.Points.newid();
        newobj.date = Moment().seconds(0).milliseconds(0).toDate();
        newobj.player = player;
        newobj.point = null;
        setObj(newobj);
      }
    }
  }, [forcerefresh, isFocused]);

  // effects - object validator
  useEffect(() => {
    if (!isMounted.current) { return; }
    if (obj != null && typeof obj.isValid !== 'undefined' && !obj.isValid()) { setForcerefresh(!forcerefresh); }
  }, [obj]);

  // effects - reset loading
  useEffect(() => {
    if (!isMounted.current) { return; }
    if (isloading) {
      setIsloading(false);
    }
  }, [isloading]);

  // effects - focus
  useEffect(() => {
    if (!isMounted.current) { return; }
    if (pointRef.current != null && isediting) { pointRef.current.focus(); }
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
            <Text style={s.formlabeltext}>{I18n.t('point.propertydate')}</Text>
          </View>
          <TextInput
            style={[
              s.forminputtextinput,
              s.forminputtextinputdisabled
            ]}
            value={Moment(obj.date).format('LL LT')}
            editable={false}
            autoCorrect={false}
            underlineColorAndroid="transparent"
            returnKeyType="done"
          />
        </View>
        <View style={s.formrow}>
          <View style={s.formlabel}>
            <Text style={s.formlabeltext}>
              {pointisplus ? I18n.t('point.propertypointpositive') : I18n.t('point.propertypointnegative')}
            </Text>
          </View>
          <TextInput
            style={[
              s.forminputtextinput,
              isediting ? s.forminputtextinputenabled : s.forminputtextinputdisabled
            ]}
            value={obj.point != null ? Math.abs(obj.point).toString() : null}
            editable={isediting}
            placeholder={I18n.t('point.placeholderpoint')}
            keyboardType="numeric"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            returnKeyType="done"
            ref={pointRef}
            onChangeText={(text) => setObj(
              { ...obj, point: text.length === 0 ? null : Math.abs(parseInt(text, 10) || 0) }
            )}
          />
        </View>
        {isediting
          ? (
            <View style={s.formbutton}>
              <ButtonTouch
                title={I18n.t('appmain.buttonsave')}
                backgroundColor={theme.COLOR_BUTTONSAVE_BACKGROUNDCOLOR}
                color={theme.COLOR_BUTTONSAVE_COLOR}
                imageLeft={imageSave}
                onPress={() => {
                  let { points } = round;
                  if (obj.point === null) {
                    obj.point = 0;
                  }
                  // sanitize point
                  obj.point = Math.abs(obj.point);
                  if (!pointisplus) { obj.point = -obj.point; }
                  if (id == null) {
                    points = [...points, obj];
                    db.Rounds.update({
                      ...round,
                      points
                    }, roundid);
                    setId(obj.id);
                    setIsediting(false);
                    setForcerefresh(!forcerefresh);
                    navigation.navigate(
                      navpages.Round,
                      { refresh: true }
                    );
                  } else {
                    db.Points.update(obj, id);
                    navigation.navigate(
                      navpages.Points,
                      { refresh: true }
                    );
                  }
                }}
              />
            </View>
          )
          : null}
      </View>
    </KeyboardAvoidingView>
  );
}

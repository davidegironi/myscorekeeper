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
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Switch
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

// load helpers
import ToastHelper from '../../../helpers/Toast.helpers';
import ColorsHelper from '../../../helpers/Colors.helpers';

// load pages
import navpages from '../../AppMain/components/AppNavigator.pages';

// load components
import ButtonTouch from '../../ButtonTouch/components/ButtonTouch';

// load images
const imageAdd = require('../../../images/add.png');
const imageEdit = require('../../../images/edit.png');
const imageDelete = require('../../../images/delete.png');
const imageSave = require('../../../images/save.png');
const imagePoint = require('../../../images/point.png');

/**
 * component
 */
export default function Game() {
  const { state } = useContext(MainContext);
  const { db } = state;
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const isMounted = useIsMounted();

  // states
  const [id, setId] = useState(route.params.id);
  const [obj, setObj] = useState(null);
  const [isloading, setIsloading] = useState(true);
  const [forcerefresh, setForcerefresh] = useState(true);
  const [isediting, setIsediting] = useState(false);
  const [listmatches, setListmatches] = useState(null);
  const [selectedmatchesid, setSelectedmatchesid] = useState([]);

  // constants
  const edittools = typeof route.params.edittools !== 'undefined' ? true : null;

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
        const objfind = db.Games.find(id);
        setObj(objfind);
        // load games list
        setListmatches(
          objfind.matches
            .map((row) => ({
              rowid: row.id,
              row
            }))
            .sort((a, b) => ((a.row.name > b.row.name) ? 1 : -1))
        );
      } else {
        // load void object
        setIsediting(true);
        const newobj = db.Games.void();
        newobj.id = db.Games.newid();
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
    if (isloading) {
      setIsloading(false);
    }
  }, [isloading]);

  /**
   * match row
   * @param {object} param0
   */
  function MatchRow({ item }) {
    const {
      rowid,
      row
    } = item;
    const selected = selectedmatchesid.includes(rowid);
    const color = ColorsHelper.hashColor(rowid);
    const { players, rounds } = row;
    // list all players
    const playersviewlist = players
      .map((player) => ({
        id: player.id,
        color: ColorsHelper.hashColor(player.id),
        name: player.name
      }))
      .sort((a, b) => ((a.name > b.name) ? 1 : -1))
      .map((player) => (
        <View
          key={player.id}
          style={s.listrowtextviewsubitems}
        >
          <View style={s.listrowtextviewsubitemsdotview}>
            <Image
              style={[
                s.listrowtextviewsubitemsdotimage,
                { tintColor: player.color }
              ]}
              source={imagePoint}
            />
          </View>
          <Text style={s.listrowtextviewsubitemstext}>{player.name}</Text>
        </View>
      ));
    const playersview = (players.length > 0
      ? (
        <View style={s.listrowtextviewsubview}>
          <Text style={s.listrowtextviewsubtext}>{I18n.t('game.rowsubtitleplayers')}</Text>
          {playersviewlist}
        </View>
      )
      : null);
    // view the last round
    const lastround = rounds
      .map((round) => ({
        id: round.id,
        color: ColorsHelper.hashColor(round.id),
        date: round.date
      }))
      .sort((a, b) => ((a.date > b.date) ? -1 : 1))[0];
    const lastroundview = (lastround != null
      ? (
        <View style={s.listrowtextviewsubview}>
          <Text style={s.listrowtextviewsubtext}>{I18n.t('game.rowsubtitlelastround')}</Text>
          <View style={s.listrowtextviewsubitems}>
            <View style={s.listrowtextviewsubitemsdotview}>
              <Image
                style={[
                  s.listrowtextviewsubitemsdotimage,
                  { tintColor: lastround.color }
                ]}
                source={imagePoint}
              />
            </View>
            <Text style={s.listrowtextviewsubitemstext}>{Moment(lastround.date).format('LL LT')}</Text>
          </View>
        </View>
      )
      : null);
    return (
      <TouchableOpacity
        key={rowid}
        style={[selected ? s.listrowselected : s.listrow, { borderColor: color }]}
        onPress={() => {
          if (selectedmatchesid.length > 0) {
            setSelectedmatchesid([]);
          } else {
            navigation.navigate(
              navpages.Match,
              { id: rowid, gameid: id }
            );
          }
        }}
        onLongPress={() => setSelectedmatchesid(selected ? [] : rowid)}
      >
        <View style={s.listrowcontent}>
          <View style={[s.listrowcolor, { backgroundColor: color }]} />
          <View style={[
            s.listrowtextview,
            selected ? s.listrowtextviewselected : null]}
          >
            <Text numberOfLines={1} style={s.listrowtexttext}>
              {row.name}
            </Text>
            <View style={s.listrowtextviewsub}>
              {playersview}
              {lastroundview}
            </View>
          </View>
          {selected
            ? (
              <View style={s.listrowactionsview}>
                <ButtonTouch
                  title={I18n.t('appmain.buttonedit')}
                  backgroundColor={theme.COLOR_BUTTONINROW_BACKGROUNDCOLOR}
                  color={theme.COLOR_BUTTONINROW_COLOR}
                  imageLeft={imageEdit}
                  fontSize={14}
                  paddingText={5}
                  paddingImage={5}
                  onPress={() => {
                    setSelectedmatchesid([]);
                    navigation.navigate(
                      navpages.Match,
                      { id: rowid, gameid: id, isediting: true }
                    );
                  }}
                />
                <ButtonTouch
                  title={I18n.t('appmain.buttondelete')}
                  backgroundColor={theme.COLOR_BUTTONINROW_BACKGROUNDCOLOR}
                  color={theme.COLOR_BUTTONINROW_COLOR}
                  imageLeft={imageDelete}
                  fontSize={14}
                  paddingText={5}
                  paddingImage={5}
                  onPress={() => {
                    Alert.alert(
                      I18n.t('appmain.alertdeletetitle'),
                      I18n.t('game.alertdeletematchmessage'),
                      [
                        {
                          text: I18n.t('appmain.buttoncancel'),
                          style: 'cancel'
                        },
                        {
                          text: I18n.t('appmain.buttonok'),
                          onPress: () => {
                            db.Matches.removeAll(rowid);
                            setForcerefresh(!forcerefresh);
                            setSelectedmatchesid([]);
                          }
                        },
                      ]
                    );
                  }}
                />
              </View>
            )
            : null}
        </View>
      </TouchableOpacity>
    );
  }

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
        {edittools == null
          ? (
            <View style={s.formrow}>
              <View style={s.formlabel}>
                <Text style={s.formlabeltext}>{I18n.t('game.propertyname')}</Text>
              </View>
              <TextInput
                style={[
                  s.forminputtextinput,
                  isediting ? s.forminputtextinputenabled : s.forminputtextinputdisabled
                ]}
                value={obj.name}
                editable={isediting}
                placeholder={I18n.t('game.placeholdername')}
                autoCorrect={false}
                underlineColorAndroid="transparent"
                returnKeyType="done"
                ref={nameRef}
                onChangeText={(text) => setObj({ ...obj, name: text })}
              />
            </View>
          )
          : null}
        {isediting && edittools == null
          ? (
            <View>
              <View style={s.formrow}>
                <View style={s.formlabel}>
                  <Text style={s.formlabeltext}>{I18n.t('game.propertywinnerorder')}</Text>
                </View>
                <View style={s.formswitchcontainer}>
                  <View style={s.formswitchinfo}>
                    {obj.winnerorderdescending
                      ? <Text>{I18n.t('game.propertywinnerorderinfodescending')}</Text>
                      : <Text>{I18n.t('game.propertywinnerorderinfoascending')}</Text>}
                  </View>
                  <Switch
                    style={s.formswitchswitch}
                    thumbColor={obj.winnerorderdescending
                      ? theme.COLOR_SWITCH_THUMBCOLORON
                      : theme.COLOR_SWITCH_THUMBCOLOROFF}
                    trackColor={{
                      true: theme.COLOR_SWITCH_TRACKCOLORON,
                      false: theme.COLOR_SWITCH_TRACKCOLOROFF
                    }}
                    disabled={!isediting}
                    value={obj.winnerorderdescending}
                    onValueChange={() => setObj(
                      { ...obj, winnerorderdescending: !obj.winnerorderdescending }
                    )}
                  />
                </View>
              </View>
            </View>
          )
          : null}
        {isediting
          && (edittools == null || edittools === true)
          ? (
            <View>
              <View style={s.formrow}>
                <View style={s.formlabel}>
                  <Text style={s.formlabeltext}>{I18n.t('game.propertydice')}</Text>
                </View>
                <View style={s.formswitchcontainer}>
                  <View style={s.formswitchinfo}>
                    {obj.diceenabled
                      ? <Text>{I18n.t('game.propertydiceon')}</Text>
                      : <Text>{I18n.t('game.propertydiceoff')}</Text>}
                  </View>
                  <Switch
                    style={s.formswitchswitch}
                    thumbColor={obj.diceenabled
                      ? theme.COLOR_SWITCH_THUMBCOLORON
                      : theme.COLOR_SWITCH_THUMBCOLOROFF}
                    trackColor={{
                      true: theme.COLOR_SWITCH_TRACKCOLORON,
                      false: theme.COLOR_SWITCH_TRACKCOLOROFF
                    }}
                    disabled={!isediting}
                    value={obj.diceenabled}
                    onValueChange={() => setObj(
                      { ...obj, diceenabled: !obj.diceenabled }
                    )}
                  />
                </View>
              </View>
              {obj.diceenabled
                ? (
                  <View>
                    <View style={s.formrow}>
                      <View style={s.formlabel}>
                        <Text style={s.formlabeltext}>{I18n.t('game.propertydicemin')}</Text>
                      </View>
                      <TextInput
                        style={[
                          s.forminputtextinput,
                          isediting
                            ? s.forminputtextinputenabled
                            : s.forminputtextinputdisabled
                        ]}
                        value={obj.dicemin?.toString()}
                        editable={isediting}
                        placeholder={I18n.t('game.placeholderdicemin')}
                        keyboardType="numeric"
                        autoCorrect={false}
                        underlineColorAndroid="transparent"
                        returnKeyType="done"
                        onChangeText={(text) => setObj(
                          { ...obj, dicemin: text.length === 0 ? null : parseInt(text, 10) || 1 }
                        )}
                      />
                    </View>
                    <View style={s.formrow}>
                      <View style={s.formlabel}>
                        <Text style={s.formlabeltext}>{I18n.t('game.propertydicemax')}</Text>
                      </View>
                      <TextInput
                        style={[
                          s.forminputtextinput,
                          isediting
                            ? s.forminputtextinputenabled
                            : s.forminputtextinputdisabled
                        ]}
                        value={obj.dicemax?.toString()}
                        editable={isediting}
                        placeholder={I18n.t('game.placeholderdicemax')}
                        keyboardType="numeric"
                        autoCorrect={false}
                        underlineColorAndroid="transparent"
                        returnKeyType="done"
                        onChangeText={(text) => setObj(
                          { ...obj, dicemax: text.length === 0 ? null : parseInt(text, 10) || 6 }
                        )}
                      />
                    </View>
                  </View>
                )
                : null}
            </View>
          )
          : null}
        {isediting
          && (edittools == null || edittools === true)
          ? (
            <View>
              <View style={s.formrow}>
                <View style={s.formlabel}>
                  <Text style={s.formlabeltext}>{I18n.t('game.propertycountdowntimer')}</Text>
                </View>
                <View style={s.formswitchcontainer}>
                  <View style={s.formswitchinfo}>
                    {obj.countdowntimerenabled
                      ? <Text>{I18n.t('game.propertycountdowntimeron')}</Text>
                      : <Text>{I18n.t('game.propertycountdowntimeroff')}</Text>}
                  </View>
                  <Switch
                    style={s.formswitchswitch}
                    thumbColor={obj.countdowntimerenabled
                      ? theme.COLOR_SWITCH_THUMBCOLORON
                      : theme.COLOR_SWITCH_THUMBCOLOROFF}
                    trackColor={{
                      true: theme.COLOR_SWITCH_TRACKCOLORON,
                      false: theme.COLOR_SWITCH_TRACKCOLOROFF
                    }}
                    disabled={!isediting}
                    value={obj.countdowntimerenabled}
                    onValueChange={() => setObj(
                      { ...obj, countdowntimerenabled: !obj.countdowntimerenabled }
                    )}
                  />
                </View>
              </View>
              {obj.countdowntimerenabled
                ? (
                  <View>
                    <View style={s.formrow}>
                      <View style={s.formlabel}>
                        <Text style={s.formlabeltext}>{I18n.t('game.propertycountdowntimerdefaultsec')}</Text>
                      </View>
                      <TextInput
                        style={[
                          s.forminputtextinput,
                          isediting
                            ? s.forminputtextinputenabled
                            : s.forminputtextinputdisabled
                        ]}
                        value={obj.countdowntimerdefaultsec?.toString()}
                        editable={isediting}
                        placeholder={I18n.t('game.placeholdercountdowntimerdefaultsec')}
                        keyboardType="numeric"
                        autoCorrect={false}
                        underlineColorAndroid="transparent"
                        returnKeyType="done"
                        onChangeText={(text) => setObj(
                          {
                            ...obj,
                            countdowntimerdefaultsec: text.length === 0
                              ? null
                              : parseInt(text, 10) || 10
                          }
                        )}
                      />
                    </View>
                  </View>
                )
                : null}
            </View>
          )
          : null}
        {isediting
          ? (
            <View style={s.formbutton}>
              <ButtonTouch
                title={I18n.t('appmain.buttonsave')}
                backgroundColor={theme.COLOR_BUTTONSAVE_BACKGROUNDCOLOR}
                color={theme.COLOR_BUTTONSAVE_COLOR}
                imageLeft={imageSave}
                onPress={() => {
                  if (obj.dicemin === null) {
                    obj.dicemin = 1;
                  }
                  if (obj.dicemax === null) {
                    obj.dicemax = 6;
                  }
                  if (obj.countdowntimerdefaultsec === null) {
                    obj.countdowntimerdefaultsec = 10;
                  }
                  if (obj.name.length === 0) {
                    ToastHelper.showAlertMessage(I18n.t('game.erroremptyname'));
                  } else if (db.Games.list('id != $0 && name == $1', obj.id, obj.name).length > 0) {
                    ToastHelper.showAlertMessage(I18n.t('game.erroralreadyexists'));
                  } else if (id == null) {
                    db.Games.add(obj);
                    setId(obj.id);
                    setIsediting(false);
                    setForcerefresh(!forcerefresh);
                  } else {
                    db.Games.update(obj, id);
                    if (edittools == null) {
                      navigation.navigate(
                        navpages.Games,
                        { refresh: true }
                      );
                    } else {
                      navigation.goBack();
                    }
                  }
                }}
              />
            </View>
          )
          : null}
      </View>
      {!isediting
        ? (
          <View style={s.listcontainer}>
            <FlatList
              data={listmatches}
              renderItem={({ item }) => (item.row.isValid() ? <MatchRow item={item} /> : null)}
              // eslint-disable-next-line arrow-body-style
              keyExtractor={(item) => (item.row.isValid() ? item.rowid.toString() : null)}
              ListEmptyComponent={(
                <Text style={s.emptytext}>
                  {I18n.t('game.emptymatcheslist')}
                </Text>
              )}
              ListHeaderComponent={(
                <View style={s.listheader}>
                  <ButtonTouch
                    title={I18n.t('game.buttonaddmatch')}
                    backgroundColor={theme.COLOR_BUTTONADD_BACKGROUNDCOLOR}
                    color={theme.COLOR_BUTTONADD_COLOR}
                    imageLeft={imageAdd}
                    onPress={() => navigation.navigate(
                      navpages.Match,
                      { id: null, gameid: id }
                    )}
                  />
                </View>
              )}
              ItemSeparatorComponent={() => <View style={s.listrowseparator} />}
            />
          </View>
        )
        : null}
    </KeyboardAvoidingView>
  );
}

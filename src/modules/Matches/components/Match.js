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
  Image
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
import RoundHelper from '../../Rounds/helpers/Rounds.helpers';

// load pages
import navpages from '../../AppMain/components/AppNavigator.pages';

// load components
import ButtonTouch from '../../ButtonTouch/components/ButtonTouch';

// load images
const imageAdd = require('../../../images/add.png');
const imageEdit = require('../../../images/edit.png');
const imageDelete = require('../../../images/delete.png');
const imageSave = require('../../../images/save.png');
const imagePlay = require('../../../images/play.png');
const imageStop = require('../../../images/stop.png');
const imagePoint = require('../../../images/point.png');

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
  const [listplayers, setListplayers] = useState(null);
  const [selectedplayersid, setSelectedplayersid] = useState([]);
  const [listrounds, setListrounds] = useState(null);
  const [selectedroundsid, setSelectedroundsid] = useState([]);
  const [gameid] = useState(route.params.gameid);

  // db schemas
  const game = db.Games.find(gameid);

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
        const objfind = db.Matches.find(id);
        setObj(objfind);
        // load players list
        setListplayers(
          objfind.players
            .map((row) => ({
              rowid: row.id,
              row
            }))
            .sort((a, b) => ((a.row.name > b.row.name) ? 1 : -1))
        );
        // load rounds list
        setListrounds(
          objfind.rounds
            .map((row) => ({
              rowid: row.id,
              row
            }))
            .sort((a, b) => b.row.isopen - a.row.isopen || b.row.date - a.row.date)
        );
      } else {
        // load void object
        setIsediting(true);
        const newobj = db.Matches.void();
        newobj.id = db.Matches.newid();
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

  /**
   * player row
   * @param {object} param0
   */
  function PlayerRow({ item }) {
    const {
      rowid,
      row
    } = item;
    const selected = selectedplayersid.includes(rowid);
    const color = ColorsHelper.hashColor(rowid);
    return (
      <TouchableOpacity
        key={rowid}
        style={[selected ? s.listrowselected : s.listrow, { borderColor: color }]}
        onPress={() => {
          if (selectedplayersid.length > 0) {
            setSelectedplayersid([]);
          } else {
            navigation.navigate(
              navpages.Match,
              { id: rowid, matchid: id }
            );
          }
        }}
        onLongPress={() => setSelectedplayersid(selected ? [] : rowid)}
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
                    setSelectedplayersid([]);
                    navigation.navigate(
                      navpages.Player,
                      { id: rowid, matchid: id, isediting: true }
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
                      I18n.t('matches.alertdeleteplayermessage'),
                      [
                        {
                          text: I18n.t('appmain.buttoncancel'),
                          style: 'cancel'
                        },
                        {
                          text: I18n.t('appmain.buttonok'),
                          onPress: () => {
                            db.Players.removeAll(rowid);
                            const roundsids = db.Rounds.list('players.@count == 0').map((round) => round.id);
                            roundsids.forEach((roundsid) => db.Rounds.removeAll(roundsid));
                            setForcerefresh(!forcerefresh);
                            setSelectedplayersid([]);
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

  /**
   * round row
   * @param {object} param0
   */
  function RoundRow({ item }) {
    const {
      rowid,
      row
    } = item;
    const selected = selectedroundsid.includes(rowid);
    const color = ColorsHelper.hashColor(rowid);
    const colorinverse = ColorsHelper.invertColor(color, true);
    // build winnind players
    const winnerplayersids = RoundHelper.getWinnerplayersids(row, game.winnerorderdescending);
    // list all players
    const winnerplayersviewlist = (row.players != null && winnerplayersids.length > 0
      ? row.players
        .filter((player) => winnerplayersids.includes(player.id))
        .map((player) => ({
          id: player.id,
          color: ColorsHelper.hashColor(player.id),
          name: player.name,
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
        ))
      : null);
    const winnerplayersview = (winnerplayersviewlist != null
      ? (
        <View style={s.listrowtextviewsubview}>
          <Text style={s.listrowtextviewsubtext}>{I18n.t('match.rowsubtitlewinnerplayers')}</Text>
          {winnerplayersviewlist}
        </View>
      )
      : null);
    return (
      <TouchableOpacity
        key={rowid}
        style={[selected ? s.listrowselected : s.listrow, { borderColor: color }]}
        onPress={() => {
          if (selectedroundsid.length > 0) {
            setSelectedroundsid([]);
          } else {
            navigation.navigate(
              navpages.Round,
              { id: rowid, gameid, matchid: id }
            );
          }
        }}
        onLongPress={() => setSelectedroundsid(selected ? [] : rowid)}
      >
        <View style={s.listrowcontent}>
          <View style={[s.listrowcolor, { backgroundColor: color }]}>
            <Image
              style={[s.listrowcolorimage,
                {
                  tintColor: colorinverse
                }
              ]}
              source={row.isopen ? imagePlay : imageStop}
            />
          </View>
          <View style={[
            s.listrowtextview,
            selected ? s.listrowtextviewselected : null]}
          >
            <Text numberOfLines={1} style={s.listrowtexttext}>
              {Moment(row.date).format('LL LT')}
            </Text>
            {winnerplayersview != null
              ? (
                <View style={s.listrowtextviewsub}>
                  {winnerplayersview}
                </View>
              )
              : null}
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
                    setSelectedroundsid([]);
                    navigation.navigate(
                      navpages.Round,
                      {
                        id: rowid, gameid, matchid: id, isediting: true
                      }
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
                      I18n.t('matches.alertdeleteroundmessage'),
                      [
                        {
                          text: I18n.t('appmain.buttoncancel'),
                          style: 'cancel'
                        },
                        {
                          text: I18n.t('appmain.buttonok'),
                          onPress: () => {
                            db.Rounds.removeAll(rowid);
                            setForcerefresh(!forcerefresh);
                            setSelectedroundsid([]);
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
  if (isloading || obj == null) {
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
            <Text style={s.formlabeltext}>{I18n.t('match.propertyname')}</Text>
          </View>
          <TextInput
            style={[
              s.forminputtextinput,
              isediting ? s.forminputtextinputenabled : s.forminputtextinputdisabled
            ]}
            value={obj.name}
            editable={isediting}
            placeholder={I18n.t('match.placeholdername')}
            autoCorrect={false}
            underlineColorAndroid="transparent"
            returnKeyType="done"
            ref={nameRef}
            onChangeText={(text) => setObj({ ...obj, name: text })}
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
                  let { matches } = game;
                  if (obj.dicemin === null) {
                    obj.dicemin = 1;
                  }
                  if (obj.dicemax === null) {
                    obj.dicemax = 6;
                  }
                  if (obj.countdowntimerdefaultsec === null) {
                    obj.countdowntimerdefaultsec = 10;
                  }
                  if (obj.countdowntimerdefaultsec < 10) {
                    setObj({ ...obj, countdowntimerdefaultsec: 10 });
                    ToastHelper.showAlertMessage(I18n.t('match.errormincountdowntimer'));
                  } if (obj.name.length === 0) {
                    ToastHelper.showAlertMessage(I18n.t('match.erroremptyname'));
                  } else if ([...matches].find((x) => x.id !== obj.id && x.name === obj.name)) {
                    ToastHelper.showAlertMessage(I18n.t('match.erroralreadyexists'));
                  } else if (id == null) {
                    matches = [...matches, obj];
                    db.Games.update({
                      ...game,
                      matches
                    }, gameid);
                    setId(obj.id);
                    setIsediting(false);
                    setForcerefresh(!forcerefresh);
                  } else {
                    db.Matches.update(obj, id);
                    navigation.navigate(
                      navpages.Game,
                      { refresh: true }
                    );
                  }
                }}
              />
            </View>
          )
          : null}
      </View>
      {!isediting && listplayers != null && listplayers.length > 0
        ? (
          <View style={s.listcontainer}>
            <FlatList
              data={listrounds}
              renderItem={({ item }) => (item.row.isValid() ? <RoundRow item={item} /> : null)}
              keyExtractor={(item) => item.rowid}
              ListEmptyComponent={(
                <Text style={s.emptytext}>
                  {I18n.t('match.emptyroundslist')}
                </Text>
              )}
              ListHeaderComponent={(
                <View style={s.listheader}>
                  <ButtonTouch
                    title={I18n.t('match.buttonaddround')}
                    backgroundColor={theme.COLOR_BUTTONADD_BACKGROUNDCOLOR}
                    color={theme.COLOR_BUTTONADD_COLOR}
                    imageLeft={imageAdd}
                    onPress={() => navigation.navigate(
                      navpages.Round,
                      { id: null, gameid, matchid: id, }
                    )}
                  />
                </View>
              )}
              ItemSeparatorComponent={() => <View style={s.listrowseparator} />}
            />
          </View>
        )
        : null}
      {!isediting
        ? (
          <View style={s.listcontainer}>
            <FlatList
              data={listplayers}
              renderItem={({ item }) => (item.row.isValid() ? <PlayerRow item={item} /> : null)}
              keyExtractor={(item) => item.rowid}
              ListEmptyComponent={(
                <Text style={s.emptytext}>
                  {I18n.t('match.emptyplayerslist')}
                </Text>
              )}
              ListHeaderComponent={(
                <View style={s.listheader}>
                  <ButtonTouch
                    title={I18n.t('match.buttonaddplayer')}
                    backgroundColor={theme.COLOR_BUTTONADD_BACKGROUNDCOLOR}
                    color={theme.COLOR_BUTTONADD_COLOR}
                    imageLeft={imageAdd}
                    onPress={() => navigation.navigate(
                      navpages.Player,
                      { id: null, matchid: id }
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

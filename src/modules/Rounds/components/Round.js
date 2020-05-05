// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import React, { useContext, useState, useEffect } from 'react';
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
  Vibration
} from 'react-native';
import {
  useNavigation, useRoute, useIsFocused, StackActions
} from '@react-navigation/native';
import useIsMounted from 'ismounted';
import Moment from 'moment';
import KeepAwake from 'react-native-keep-awake';

// load contexts
import { ScrollView } from 'react-native-gesture-handler';
import MainContext from '../../../contexts/MainContext';

// load settings
import I18n from '../../../locales/locales';
import theme from '../../../themes/themes.default';
import s from '../../../themes/styles';

// load helpers
import ToastHelper from '../../../helpers/Toast.helpers';
import ColorsHelper from '../../../helpers/Colors.helpers';
import RoundHelper from '../helpers/Rounds.helpers';

// load pages
import navpages from '../../AppMain/components/AppNavigator.pages';

// load components
import ButtonTouch from '../../ButtonTouch/components/ButtonTouch';

// load images
const imageAdd = require('../../../images/add.png');
const imageDelete = require('../../../images/delete.png');
const imageSave = require('../../../images/save.png');
const imageStop = require('../../../images/stop.png');
const imagePlay = require('../../../images/play.png');
const imageWin = require('../../../images/win.png');
const imageAddcircle = require('../../../images/addcircle.png');
const imageRemovecircle = require('../../../images/removecircle.png');
const imageDice = require('../../../images/dice.png');
const imageTimeron = require('../../../images/timeron.png');
const imageTimeroff = require('../../../images/timeroff.png');

/**
 * component
 */
export default function Round() {
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
  const [listplayersadd, setListplayersadd] = useState(null);
  const [gameid] = useState(route.params.gameid);
  const [matchid] = useState(route.params.matchid);
  const [listplayerssort, setListplayerssort] = useState('name');

  // db schemas
  const game = db.Games.find(gameid);
  const match = db.Matches.find(matchid);

  // get the match winners
  const winnerplayersids = (game != null
    ? RoundHelper.getWinnerplayersids(obj, game.winnerorderdescending)
    : null);

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
        const objfind = db.Rounds.find(id);
        setObj(objfind);
        // load players list
        const playersload = objfind.players
          .map((row) => ({
            rowid: row.id,
            row,
            points: RoundHelper.getPointsbyplayerid(objfind, row.id)
          }));
        let playersloadsorted = playersload;
        if (listplayerssort === 'name') playersloadsorted = playersload.sort((a, b) => ((a.row.name > b.row.name) ? -1 : 1));
        else if (listplayerssort === 'pointsascending') playersloadsorted = playersload.sort((a, b) => ((a.row.points > b.row.points) ? -1 : 1));
        else if (listplayerssort === 'pointsdescending') playersloadsorted = playersload.sort((a, b) => ((a.row.points > b.row.points) ? 1 : -1));
        setListplayers(
          playersloadsorted
        );
        // get all players
        const { players } = match;
        const playerslistedids = objfind.players
          .map((r) => r.id);
        const playersadditionalsorted = players
          .filter((r) => !playerslistedids.includes(r.id))
          .map((row) => ({
            rowid: row.id,
            row,
            points: RoundHelper.getPointsbyplayerid(objfind, row.id)
          }))
          .sort((a, b) => ((a.row.name > b.row.name) ? -1 : 1));
        setListplayersadd(
          playersadditionalsorted
        );
      } else {
        const { players } = match;
        // load void object
        setIsediting(true);
        const newobj = db.Rounds.void();
        newobj.id = db.Rounds.newid();
        newobj.date = Moment().seconds(0).milliseconds(0).toDate();
        newobj.players = players;
        setObj(newobj);
        setListplayers(
          players
            .map((row) => ({
              rowid: row.id,
              row,
              points: 0
            }))
            .sort((a, b) => ((a.row.name > b.row.name) ? -1 : 1))
        );
      }
    }
  }, [forcerefresh, isFocused, listplayerssort]);

  // effects - object validator
  useEffect(() => {
    if (!isMounted.current) { return; }
    if (obj != null && typeof obj.isValid !== 'undefined' && !obj.isValid()) {
      setForcerefresh(!forcerefresh);
    }
  }, [obj]);

  // effects - reset loading
  useEffect(() => {
    if (!isMounted.current) { return; }
    if (isloading) {
      setIsloading(false);
    }
  }, [isloading]);

  // effects - keep awake the screen
  useEffect(() => {
    KeepAwake.activate();
    return () => {
      KeepAwake.deactivate();
    };
  }, []);

  /**
   * Dice tool component
   * @param {object} props
   */
  const Dice = (props) => {
    const { min, max } = props;
    const [dicevalue, setDicevalue] = useState(null);

    return (
      <View style={s.gametoolcontainer}>
        <View style={s.gametooltextcontainer}>
          {dicevalue == null
            ? (
              <Text style={s.gametooltextsmall}>
                {I18n.t('round.dicepress')}
              </Text>
            )
            : (
              <Text style={s.gametooltext}>
                {dicevalue}
              </Text>
            )}
        </View>
        <View style={s.gametoolbutton}>
          <TouchableOpacity
            onPress={() => setDicevalue(
              Math.floor(
                Math.random() * (max - min + 1) + min
              )
            )}
          >
            <Image
              style={[s.gametoolbuttonimage,
                { tintColor: theme.COLOR_TOOLSDICE_COLOR }
              ]}
              source={imageDice}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /**
   * Countdown Timer tool component
   * @param {object} props
   */
  const CountdownTimer = (props) => {
    const { defaultcountervalue } = props;
    const [counter, setCounter] = useState(defaultcountervalue);
    const [isrunning, setIsrunning] = useState(false);
    const countervalue = defaultcountervalue;

    useEffect(() => {
      let mounted = true;
      if (isrunning) {
        if (counter > 0) {
          setTimeout(() => {
            if (mounted) { setCounter(counter - 1); }
          }, 1000);
        } else if (counter === 0) {
          if (mounted) {
            Vibration.vibrate(1000);
          }
        }
      }
      return () => {
        mounted = false;
      };
    }, [counter, isrunning]);

    return (
      <View style={s.gametoolcontainer}>
        <View style={s.gametooltextcontainer}>
          <Text style={[s.gametooltext, counter === 0 ? { color: 'red' } : null]}>
            {counter}
          </Text>
        </View>
        <View style={s.gametoolbutton}>
          <TouchableOpacity
            onPress={() => {
              if (isrunning && counter === 0) setCounter(countervalue);
              setIsrunning(!isrunning);
            }}
            onLongPress={() => {
              if (!isrunning) {
                setCounter(countervalue);
              } else if (isrunning && counter === 0) {
                setIsrunning(!isrunning);
                setCounter(countervalue);
              }
            }}
          >
            <Image
              style={[s.gametoolbuttonimage,
                { tintColor: theme.COLOR_TOOLSCOUNTDOWNTIMER_COLOR }
              ]}
              source={isrunning ? imageTimeroff : imageTimeron}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /**
   * player row
   * @param {object} param0
   */
  function PlayerRow({ item, addplayers }) {
    const {
      rowid,
      row
    } = item;
    const playersadd = addplayers != null;
    const color = ColorsHelper.hashColor(rowid);
    const colorinverse = ColorsHelper.invertColor(color, true);
    // view the score
    const pointsumplayer = (obj.points != null
      ? obj.points
        .filter((point) => point.player?.id === rowid)
        .reduce((sum, current) => sum + current.point, 0)
      : 0);
    const scoreview = (id != null
      ? (
        <View style={s.listrowtextviewsubview}>
          <Text style={s.listrowtextviewsubtext}>{I18n.t('round.score')}</Text>
          <View style={s.listrowtextviewsubitems}>
            <Text style={s.listrowtextviewsubitemstext}>{pointsumplayer}</Text>
          </View>
          {!isediting
            ? (
              <View style={s.listrowtextviewsubitems}>
                <View style={{ width: 120 }}>
                  <ButtonTouch
                    title={obj.isopen ? I18n.t('round.buttonpointsviewedit') : I18n.t('round.buttonpointsview')}
                    backgroundColor={theme.COLOR_BUTTONINROW_BACKGROUNDCOLOR}
                    color={theme.COLOR_BUTTONINROW_COLOR}
                    fontSize={14}
                    paddingText={5}
                    onPress={() => {
                      if (obj.points
                        .filter((point) => point.player?.id === rowid).length > 0) {
                        navigation.navigate(
                          navpages.Points,
                          { roundid: id, playerid: rowid, canedit: obj.isopen }
                        );
                      }
                    }}
                  />
                </View>
              </View>
            ) : null}
        </View>
      )
      : null);
    return (
      <TouchableOpacity
        key={rowid}
        style={[s.listrow, { borderColor: color }]}
      >
        <View style={s.listrowcontent}>
          <View style={[s.listrowcolor, { backgroundColor: color }]}>
            {winnerplayersids.includes(rowid) && !isediting
              ? (
                <Image
                  style={[s.listrowcolorimage,
                    {
                      tintColor: colorinverse
                    }
                  ]}
                  source={imageWin}
                />
              )
              : null}
          </View>
          <View style={s.listrowtextview}>
            <Text numberOfLines={1} style={s.listrowtexttext}>
              {row.name}
            </Text>
            {scoreview != null
              ? (

                <View style={s.listrowtextviewsub}>
                  {scoreview}
                </View>
              ) : null}
          </View>
          {!playersadd && ((isediting && id != null) || id == null)
            ? (
              <View style={s.listrowactionsview}>
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
                      I18n.t('rounds.alertdeleteplayermessage'),
                      [
                        {
                          text: I18n.t('appmain.buttoncancel'),
                          style: 'cancel'
                        },
                        {
                          text: I18n.t('appmain.buttonok'),
                          onPress: () => {
                            if (id == null) {
                              if (obj.players.length === 1) {
                                ToastHelper.showAlertMessage(I18n.t('round.errordeleteplayer'));
                              } else {
                                const currentplayersquery = obj.players
                                  .map((x) => `id == '${x.id}'`).join(' OR ');
                                const players = db.Players.list(
                                  `${currentplayersquery != null ? `(${currentplayersquery}) AND ` : null
                                  }id != $0`, rowid
                                );
                                setObj({ ...obj, players });
                                setListplayers(
                                  players
                                    .map((r) => ({
                                      rowid: r.id,
                                      row: r
                                    }))
                                );
                              }
                            } else if (id != null) {
                              if (obj.players.length === 1) {
                                ToastHelper.showAlertMessage(I18n.t('round.errordeleteplayer'));
                              } else {
                                const players = obj.players
                                  .filter((x) => x.id !== rowid);
                                const points = obj.points
                                  .filter((x) => x.player.id !== rowid);
                                db.Rounds.update({
                                  players,
                                  points
                                }, id);
                                setForcerefresh(!forcerefresh);
                              }
                            }
                          }
                        },
                      ]
                    );
                  }}
                />
              </View>
            )
            : null}
          {playersadd && ((isediting && id != null) || id == null)
            ? (
              <View style={s.listrowactionsview}>
                <ButtonTouch
                  title={I18n.t('appmain.buttonadd')}
                  backgroundColor={theme.COLOR_BUTTONINROW_BACKGROUNDCOLOR}
                  color={theme.COLOR_BUTTONINROW_COLOR}
                  imageLeft={imageAdd}
                  fontSize={14}
                  paddingText={5}
                  paddingImage={5}
                  onPress={() => {
                    db.Rounds.update({
                      players: [
                        ...obj.players,
                        row
                      ]
                    }, id);
                    setForcerefresh(!forcerefresh);
                  }}
                />
              </View>
            )
            : null}
          {!isediting && obj.isopen
            ? (
              <View style={s.listrowactionsview}>
                <TouchableOpacity
                  style={s.listrowtextviewsubitemspointsbutton}
                  onPress={() => {
                    navigation.navigate(
                      navpages.Point,
                      {
                        id: null, roundid: id, pointisplus: true, playerid: rowid
                      }
                    );
                  }}
                >
                  <Image
                    style={s.listrowtextviewsubitemspointsbuttonimage}
                    source={imageAddcircle}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.listrowtextviewsubitemspointsbutton}
                  onPress={() => {
                    navigation.navigate(
                      navpages.Point,
                      {
                        id: null, roundid: id, pointisplus: false, playerid: rowid
                      }
                    );
                  }}
                >
                  <Image
                    style={s.listrowtextviewsubitemspointsbuttonimage}
                    source={imageRemovecircle}
                  />
                </TouchableOpacity>
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
        <View style={s.formrow}>
          <View style={s.formlabel}>
            <Text style={s.formlabeltext}>{I18n.t('round.propertydate')}</Text>
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
        {isediting && id == null
          ? (
            <View style={s.formbutton}>
              <ButtonTouch
                title={I18n.t('appmain.buttonsave')}
                backgroundColor={theme.COLOR_BUTTONSAVE_BACKGROUNDCOLOR}
                color={theme.COLOR_BUTTONSAVE_COLOR}
                imageLeft={imageSave}
                onPress={() => {
                  let { rounds } = match;
                  if (db.Rounds.list('id != $0 && date >= $1', obj.id, Moment(obj.date).toDate()).length > 0) {
                    setObj({ ...obj, date: Moment(obj.date).add(1, 'm').toDate() });
                    ToastHelper.showAlertMessage(I18n.t('round.erroralreadyexists'));
                  } else if (id == null) {
                    rounds = [...rounds, obj];
                    db.Matches.update({
                      ...match,
                      rounds
                    }, matchid);
                    setId(obj.id);
                    setIsediting(false);
                    setForcerefresh(!forcerefresh);
                  } else {
                    db.Rounds.update(obj, id);
                    navigation.navigate(
                      navpages.Match,
                      { refresh: true }
                    );
                  }
                }}
              />
            </View>
          )
          : null}
        {(isediting && id != null)
         || (!isediting && obj.isopen)
          ? (
            <View style={s.formbutton}>
              <ButtonTouch
                title={obj.isopen ? I18n.t('round.buttonstop') : I18n.t('round.buttonstart')}
                backgroundColor={theme.COLOR_BUTTONSAVE_BACKGROUNDCOLOR}
                color={theme.COLOR_BUTTONSAVE_COLOR}
                imageLeft={obj.isopen ? imageStop : imagePlay}
                onPress={() => {
                  Alert.alert(
                    I18n.t('round.alertstartstopaction'),
                    obj.isopen ? I18n.t('round.alertroundstop') : I18n.t('round.alertroundstart'),
                    [
                      {
                        text: I18n.t('appmain.buttoncancel'),
                        style: 'cancel'
                      },
                      {
                        text: I18n.t('appmain.buttonok'),
                        onPress: () => {
                          db.Rounds.update({
                            ...obj,
                            isopen: !obj.isopen
                          }, id);
                          navigation.navigate(
                            navpages.Match,
                            { refresh: true }
                          );
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
      {(isediting && obj.isopen) || !isediting
        ? (
          <View style={s.listcontainer}>
            <FlatList
              data={listplayers}
              renderItem={({ item }) => (item.row.isValid()
                ? <PlayerRow item={item} />
                : null)}
              keyExtractor={(item) => item.rowid}
              ListEmptyComponent={(
                <Text style={s.emptytext}>
                  {I18n.t('round.emptyplayerslist')}
                </Text>
                )}
              ListHeaderComponent={(
                <View style={s.listheader}>
                  {!isediting
                    ? (
                      <View>
                        <View style={s.listsortcontainer}>
                          <Text style={s.listsorttext}>
                            {I18n.t('round.sort')}
                          </Text>
                          <TouchableOpacity onPress={() => setListplayerssort('name')}>
                            <Text style={[
                              s.listsortitemtext,
                              listplayerssort === 'name' ? { color: theme.COLOR_SORT_SELECTEDCOLOR } : { color: theme.COLOR_SORT_COLOR }]}
                            >
                              {I18n.t('round.sortname')}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setListplayerssort('pointsascending')}>
                            <Text style={[
                              s.listsortitemtext,
                              listplayerssort === 'pointsascending' ? { color: theme.COLOR_SORT_SELECTEDCOLOR } : { color: theme.COLOR_SORT_COLOR }]}
                            >
                              {I18n.t('round.sortpointsascending')}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setListplayerssort('pointsdescending')}>
                            <Text style={[
                              s.listsortitemtext,
                              listplayerssort === 'pointsdescending' ? { color: theme.COLOR_SORT_SELECTEDCOLOR } : { color: theme.COLOR_SORT_COLOR }]}
                            >
                              {I18n.t('round.sortpointsdescending')}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        {obj.isopen
                          ? (
                            <View style={s.listtoolscontainer}>
                              <View style={s.listtoolsbuttonscontainer}>
                                <View style={s.listtoolsbuttoncontainer}>
                                  <ButtonTouch
                                    title={I18n.t('round.buttongameedittools')}
                                    backgroundColor={theme.COLOR_BUTTONINROW_BACKGROUNDCOLOR}
                                    color={theme.COLOR_BUTTONINROW_COLOR}
                                    fontSize={14}
                                    paddingText={5}
                                    onPress={() => {
                                      navigation.dispatch(
                                        StackActions.push(navpages.Game,
                                          { id: gameid, isediting: true, edittools: true })
                                      );
                                    }}
                                  />
                                </View>
                              </View>

                              {game.diceenabled || game.countdowntimerenabled
                                ? (
                                  <View style={s.listtoolstoolscontainer}>
                                    {game.diceenabled
                                      ? <Dice min={game.dicemin} max={game.dicemax} />
                                      : null}
                                    {game.countdowntimerenabled
                                      ? (
                                        <CountdownTimer
                                          defaultcountervalue={game.countdowntimerdefaultsec}
                                        />
                                      )
                                      : null}
                                  </View>
                                ) : null}
                            </View>
                          ) : null}
                      </View>
                    )
                    : (
                      <View style={s.listheaderinfoview}>
                        <Text style={s.listheaderinfotext}>
                          {I18n.t('round.removeplayers')}
                        </Text>
                      </View>
                    )}
                </View>
                )}
              ItemSeparatorComponent={() => <View style={s.listrowseparator} />}
            />
          </View>
        )
        : null}

      {isediting
        ? (
          <View style={s.listcontainer}>
            <FlatList
              data={listplayersadd}
              renderItem={({ item }) => (item.row.isValid()
                ? <PlayerRow item={item} addplayers />
                : null)}
              keyExtractor={(item) => item.rowid}
              ListHeaderComponent={() => (
                      listplayersadd?.length > 0
                        ? (
                          <View style={s.listheader}>
                            <View style={s.listheaderinfoview}>
                              <Text style={s.listheaderinfotext}>
                                {I18n.t('round.addplayers')}
                              </Text>
                            </View>
                          </View>
                        )
                        : null
              )}
              ItemSeparatorComponent={() => <View style={s.listrowseparator} />}
            />
          </View>
        )
        : null}
    </KeyboardAvoidingView>
  );
}

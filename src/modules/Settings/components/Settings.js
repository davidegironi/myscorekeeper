// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import React, { useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  SectionList,
  Image,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import faker from 'faker';

// load contexts
import MainContext from '../../../contexts/MainContext';

// load settings
import I18n from '../../../locales/locales';
import theme from '../../../themes/themes.default';
import Config from '../../../config/config';

// load pages
import navpages from '../../AppMain/components/AppNavigator.pages';

// load helpers
import ToastHelper from '../../../helpers/Toast.helpers';
import SettingsHelper from '../helpers/Settings.helpers';

// load images
const imageRightarrow = require('../../../images/rightarrow.png');

/**
 * component
 */
export default function Settings() {
  const { state, dispatch } = useContext(MainContext);
  const { settings } = state;
  const { db } = state;
  const navigation = useNavigation();

  /**
   * render the settings items
   * @param {object} param0
   */
  const SettingsItem = ({
    text, value, type, onPress
  }) => {
    let ret = null;
    switch (type) {
      case 'switch':
        ret = (
          <View style={styles.settingsitemcontainer}>
            <Text style={styles.settingsitemtext}>
              {text}
            </Text>
            <Switch
              style={styles.settingsswitchright}
              thumbColor={value
                ? theme.COLOR_SETTINGS_SWITCHTHUMBCOLORON
                : theme.COLOR_SETTINGS_SWITCHTHUMBCOLOROFF}
              trackColor={{
                true: theme.COLOR_SETTINGS_SWITCHTRACKCOLORON,
                false: theme.COLOR_SETTINGS_SWITCHTRACKCOLOROFF
              }}
              onValueChange={onPress}
              value={value}
            />
          </View>
        );
        break;
      case 'button':
        ret = (
          <TouchableOpacity
            style={styles.settingsitemcontainer}
            onPress={onPress}
          >
            <Text style={styles.settingsitemtext}>
              {text}
            </Text>
            <Image
              source={imageRightarrow}
              style={styles.settingsimageright}
            />
          </TouchableOpacity>
        );
        break;
      case 'text':
      default:
        ret = (
          <View style={styles.settingsitemcontainer}>
            <Text style={styles.settingsitemtext}>
              {text}
            </Text>
          </View>
        );
        break;
    }
    return ret;
  };

  /**
   * render the settings header
   * @param {object} param0
   */
  const SettingsHeader = ({
    title
  }) => (
    <View style={styles.settingsheader}>
      <Text style={styles.settingsheadertext}>
        {title}
      </Text>
    </View>
  );

  /**
   * populate the database with random data
   */
  const populateDatabase = () => {
    const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomDate = (start, end) => new Date(start.getTime() + Math.random()
      * (end.getTime() - start.getTime()));
    const gamesMin = 1;
    const gamesMax = 10;
    const matchesMin = 1;
    const matchesMax = 5;
    const playersMin = 3;
    const playersMax = 10;
    const roundsMin = 1;
    const roundsMax = 20;
    const pointsMin = 10;
    const pointsMax = 50;
    db.delete();
    dispatch({ type: 'ACTION_REFRESHDB', db: null });
    db.open().then(() => {
      for (let ngames = 0;
        ngames <= randomNumber(gamesMin, gamesMax);
        ngames += 1) {
        const gamenew = db.Games.void();
        gamenew.id = db.Games.newid();
        gamenew.name = `${faker.commerce.productMaterial()} ${faker.commerce.product()}`;
        const gameid = db.Games.add(gamenew);
        const game = db.Games.find(gameid);
        let matchids = [];
        for (let nmatches = 0;
          nmatches <= randomNumber(matchesMin, matchesMax);
          nmatches += 1) {
          const matchnew = db.Matches.void();
          matchnew.id = db.Matches.newid();
          matchnew.name = `${faker.commerce.productAdjective()} ${faker.company.companySuffix()}`;
          matchnew.game = game;
          const matchid = db.Matches.add(matchnew);
          matchids = [...matchids, matchid];
          const match = db.Matches.find(matchid);
          let playerids = [];
          for (let nplayers = 0;
            nplayers <= randomNumber(playersMin, playersMax);
            nplayers += 1) {
            const playernew = db.Players.void();
            playernew.id = db.Players.newid();
            playernew.name = faker.name.findName();
            playernew.match = match;
            const playerid = db.Players.add(playernew);
            playerids = [...playerids, playerid];
          }
          let roundids = [];
          for (let nrounds = 0;
            nrounds <= randomNumber(roundsMin, roundsMax);
            nrounds += 1) {
            const randomplayerids = playerids
              .sort(() => 0.5 - Math.random())
              .slice(0, randomNumber(1, playerids.length));
            const queryplayerids = randomplayerids
              .map((p) => `id == "${p}"`).join(' OR ');
            const players = db.Players.list(queryplayerids);
            let points = [];
            players.forEach((player) => {
              for (let npoints = 0;
                npoints <= randomNumber(pointsMin, pointsMax);
                npoints += 1) {
                const point = db.Points.void();
                point.id = db.Points.newid();
                point.date = randomDate(new Date(2001, 0, 1), new Date());
                point.point = randomNumber(-100, 100);
                point.player = player;
                points = [...points, point];
              }
            });
            const roundnew = db.Rounds.void();
            roundnew.id = db.Rounds.newid();
            roundnew.date = randomDate(new Date(2001, 0, 1), new Date());
            roundnew.isopen = randomNumber(0, 1) === 1;
            roundnew.players = players;
            roundnew.points = points;
            const roundid = db.Rounds.add(roundnew);
            roundids = [...roundids, roundid];
          }
          const players = db.Players.list(playerids
            .map((p) => `id == "${p}"`).join(' OR '));
          const rounds = db.Rounds.list(roundids
            .map((p) => `id == "${p}"`).join(' OR '));
          db.Matches.update({
            ...match,
            players,
            rounds,
          }, matchid);
        }
        const matches = db.Matches.list(matchids
          .map((p) => `id == "${p}"`).join(' OR '));
        db.Games.update({
          ...game,
          matches
        }, gameid);
      }
    });
    dispatch({ type: 'ACTION_REFRESHDB', db });
  };

  // build the database section
  const databaseData = [
    {
      id: 1,
      type: 'button',
      text: I18n.t('settings.backupandrestore'),
      onPress: () => {
        navigation.navigate(navpages.DatabaseBackupRestore);
      }
    }
  ];
  if (Config.populateDataEnabled) {
    databaseData.push({
      id: 2,
      type: 'button',
      text: I18n.t('settings.populatedata'),
      onPress: () => {
        Alert.alert(
          I18n.t('settings.alertpopulate'),
          I18n.t('settings.alertpopulateinfo'),
          [
            {
              text: I18n.t('appmain.buttoncancel'),
              style: 'cancel'
            },
            {
              text: I18n.t('appmain.buttonok'),
              onPress: () => {
                populateDatabase();
              }
            },
          ]
        );
      }
    });
  }

  // settings data
  const settingsData = [
    {
      title: I18n.t('settings.config'),
      data: [
        {
          id: 1,
          type: 'switch',
          text: I18n.t('settings.alwaysonwhileplaying'),
          value: settings.alwaysonwhileplaying,
          onPress: () => {
            // update the settings
            const newsettings = settings;
            newsettings.alwaysonwhileplaying = !settings.alwaysonwhileplaying;
            // save settings
            SettingsHelper.setSettings(dispatch, newsettings)
              .catch((err) => {
                ToastHelper.showAlertMessage(err);
              });
          }
        },
        {
          id: 2,
          type: 'switch',
          text: I18n.t('settings.showsplashscreen'),
          value: settings.showsplashscreen,
          onPress: () => {
            // update the settings
            const newsettings = settings;
            newsettings.showsplashscreen = !settings.showsplashscreen;
            // save settings
            SettingsHelper.setSettings(dispatch, newsettings)
              .catch((err) => {
                ToastHelper.showAlertMessage(err);
              });
          }
        }
      ]
    },
    {
      title: I18n.t('settings.database'),
      data: databaseData
    },
    {
      title: I18n.t('settings.info'),
      data: [
        {
          id: 1,
          type: 'button',
          text: I18n.t('settings.about'),
          onPress: () => navigation.navigate(navpages.About)
        },
        {
          id: 2,
          type: 'button',
          text: I18n.t('settings.terms'),
          onPress: () => navigation.navigate(navpages.Terms)
        },
        {
          id: 3,
          type: 'button',
          text: I18n.t('settings.privacy'),
          onPress: () => navigation.navigate(navpages.Privacy)
        }
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.settingscontainer}>
      <SectionList
        sections={settingsData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SettingsItem
            text={item.text}
            value={item.value}
            type={item.type}
            onPress={item.onPress}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <SettingsHeader title={title} />
        )}
      />
    </SafeAreaView>
  );
}

/**
 * styles
 */
const styles = StyleSheet.create({
  settingscontainer: {
    flex: 1,
    backgroundColor: theme.COLOR_BACKGROUNDCOLOR
  },
  settingsheader: {
    margin: 0,
    paddingLeft: 10,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: theme.COLOR_SETTINGS_HEADERBACKGROUNDCOLOR
  },
  settingsheadertext: {
    fontSize: 18,
    color: theme.COLOR_SETTINGS_HEADERCOLOR
  },
  settingsitemcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLOR_SETTINGS_ITEMBACKGROUNDCOLOR
  },
  settingsitemtext: {
    flex: 1,
    margin: 0,
    paddingLeft: 10,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 16,
    color: theme.COLOR_SETTINGS_ITEMCOLOR
  },
  settingsimageright: {
    padding: 10,
    marginRight: 15,
    height: 25,
    width: 25,
    resizeMode: 'contain',
    tintColor: theme.COLOR_SETTINGS_ITEMCOLOR
  },
  settingsswitchright: {
    marginRight: 15,
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]
  }
});

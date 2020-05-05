// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// load settings
import I18n from '../../../locales/locales';
import theme from '../../../themes/themes.default';

// load components
import Settings from '../../Settings/components/Settings';
import About from '../../About/components/About';
import Privacy from '../../Privacy/components/Privacy';
import Terms from '../../Terms/components/Terms';
import DatabaseBackupRestore from '../../Database/components/DatabaseBackupRestore';
import Games from '../../Games/components/Games';
import Game from '../../Games/components/Game';
import Match from '../../Matches/components/Match';
import Player from '../../Players/components/Player';
import Round from '../../Rounds/components/Round';
import Points from '../../Points/components/Points';
import Point from '../../Points/components/Point';

// load pages
import navpages from './AppNavigator.pages';

// load images
const imageSettings = require('../../../images/settings.png');

/**
 * compoent
 */
export default function AppNavigator() {
  // create the stack navigator
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name={navpages.Games}
          component={Games}
          options={({ navigation }) => ({
            title: I18n.t('appnavigator.games'),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate(navpages.Settings)}
              >
                <Image
                  source={imageSettings}
                  style={styles.headerimageright}
                />
              </TouchableOpacity>
            ),
            headerStyle: styles.headerstyle,
            headerTintColor: theme.COLOR_NAVIGATOR_HEADERTINTCOLOR
          })}
        />
        <Stack.Screen
          name={navpages.Game}
          component={Game}
          options={{
            title: I18n.t('appnavigator.game'),
            headerStyle: styles.headerstyle,
            headerTintColor: theme.COLOR_NAVIGATOR_HEADERTINTCOLOR
          }}
        />
        <Stack.Screen
          name={navpages.Match}
          component={Match}
          options={{
            title: I18n.t('appnavigator.match'),
            headerStyle: styles.headerstyle,
            headerTintColor: theme.COLOR_NAVIGATOR_HEADERTINTCOLOR
          }}
        />
        <Stack.Screen
          name={navpages.Player}
          component={Player}
          options={{
            title: I18n.t('appnavigator.player'),
            headerStyle: styles.headerstyle,
            headerTintColor: theme.COLOR_NAVIGATOR_HEADERTINTCOLOR
          }}
        />
        <Stack.Screen
          name={navpages.Round}
          component={Round}
          options={{
            title: I18n.t('appnavigator.round'),
            headerStyle: styles.headerstyle,
            headerTintColor: theme.COLOR_NAVIGATOR_HEADERTINTCOLOR
          }}
        />
        <Stack.Screen
          name={navpages.Points}
          component={Points}
          options={{
            title: I18n.t('appnavigator.points'),
            headerStyle: styles.headerstyle,
            headerTintColor: theme.COLOR_NAVIGATOR_HEADERTINTCOLOR
          }}
        />
        <Stack.Screen
          name={navpages.Point}
          component={Point}
          options={{
            title: I18n.t('appnavigator.point'),
            headerStyle: styles.headerstyle,
            headerTintColor: theme.COLOR_NAVIGATOR_HEADERTINTCOLOR
          }}
        />
        <Stack.Screen
          name={navpages.Settings}
          component={Settings}
          options={{
            title: I18n.t('appnavigator.settings'),
            headerStyle: styles.headerstyle,
            headerTintColor: theme.COLOR_NAVIGATOR_HEADERTINTCOLOR
          }}
        />
        <Stack.Screen
          name={navpages.About}
          component={About}
          options={{
            title: I18n.t('appnavigator.about'),
            headerStyle: styles.headerstyle,
            headerTintColor: theme.COLOR_NAVIGATOR_HEADERTINTCOLOR
          }}
        />
        <Stack.Screen
          name={navpages.Privacy}
          component={Privacy}
          options={{
            title: I18n.t('appnavigator.privacy'),
            headerStyle: styles.headerstyle,
            headerTintColor: theme.COLOR_NAVIGATOR_HEADERTINTCOLOR
          }}
        />
        <Stack.Screen
          name={navpages.Terms}
          component={Terms}
          options={{
            title: I18n.t('appnavigator.terms'),
            headerStyle: styles.headerstyle,
            headerTintColor: theme.COLOR_NAVIGATOR_HEADERTINTCOLOR
          }}
        />
        <Stack.Screen
          name={navpages.DatabaseBackupRestore}
          component={DatabaseBackupRestore}
          options={{
            title: I18n.t('appnavigator.databasebackuprestore'),
            headerStyle: styles.headerstyle,
            headerTintColor: theme.COLOR_NAVIGATOR_HEADERTINTCOLOR
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/**
 * styles
 */
const styles = StyleSheet.create({
  headerstyle: {
    backgroundColor: theme.COLOR_NAVIGATOR_BACKGROUNDCOLOR
  },
  headerimageright: {
    padding: 10,
    margin: 5,
    height: 25,
    width: 25,
    resizeMode: 'stretch',
    tintColor: theme.COLOR_NAVIGATOR_HEADERTINTCOLOR
  }
});

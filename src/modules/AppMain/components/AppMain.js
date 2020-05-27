// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import React, { useEffect, useReducer, useState } from 'react';
import {
  SafeAreaView,
  View
} from 'react-native';
import useIsMounted from 'ismounted';

// load components
import Toast from 'react-native-toast-message';

// load contexts
import MainContext from '../../../contexts/MainContext';

// load settings
import Config from '../../../config/config';

// load components
import AppSplash from './AppSplash';
import AppNavigator from './AppNavigator';

// load helpers
import SettingsHelper from '../../Settings/helpers/Settings.helpers';

// load reducers
import reducerDb from '../../../database/db.reducers';
import reducerSettings from '../../Settings/reducers/Settings.reducers';

// load database model
import { DbModel } from '../../../database/dg-realm-minigenericmodel';
import { databaseOptions } from '../../../database/db.schema';

/**
 * combine reducers
 * @param  {...any} reducers
 */
const reduceReducers = (...reducers) => (prevState, value, ...args) => reducers.reduce(
  (newState, reducer) => reducer(newState, value, ...args),
  prevState
);

/**
 * component
 */
export default function AppMain() {
  const isMounted = useIsMounted();

  // states
  const [showsplashscreen, setShowsplashscreen] = useState(false);

  // compose the reducers
  const [state, dispatch] = useReducer(
    reduceReducers(
      reducerDb,
      reducerSettings
    ),
    {
      db: null,
      settings: null
    }
  );
  const { db } = state;
  const { settings } = state;

  useEffect(() => {
    if (db == null) {
      dispatch({ type: 'ACTION_REFRESHDB', db: new DbModel(databaseOptions) });
    }
    if (db != null) {
      if (!db.isOpen()) {
        db.open().then(() => {
          dispatch({ type: 'ACTION_REFRESHDB', db });
        });
      }
    }
  }, [db]);

  // effects - settings
  useEffect(() => {
    if (!isMounted.current) { return; }

    if (settings == null) {
      SettingsHelper.loadSettings(dispatch).catch(() => null);
    } else if (settings.showsplashscreen) {
      setShowsplashscreen(true);
      setTimeout(() => setShowsplashscreen(false), Config.splashscreenTime);
    }
  }, [settings]);

  // splash screen
  if (settings == null
      || db == null
      || (db != null && !db.isOpen())
      || showsplashscreen) {
    return (
      <View style={{ flex: 1 }}>
        <AppSplash />
        <Toast ref={(ref) => Toast.setRef(ref)} />
      </View>
    );
  }

  // main return
  return (
    <MainContext.Provider value={{ state, dispatch }}>
      <SafeAreaView style={{ flex: 1 }}>
        <AppNavigator />
      </SafeAreaView>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </MainContext.Provider>
  );
}

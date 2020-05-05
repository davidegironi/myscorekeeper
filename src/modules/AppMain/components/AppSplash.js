// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
  Text,
  Image
} from 'react-native';

// load settings
import I18n from '../../../locales/locales';
import Config from '../../../config/config';
import theme from '../../../themes/themes.default';

// load images
const imageLogo = require('../../../images/logo.png');

/**
 * component
 */
export default function AppSplash() {
  // states
  const [loadingtimethresholdgone, setLoadingtimethresholdgone] = useState(false);

  // effects
  useEffect(() => {
    let mounted = true;

    // set loading time threshold
    setTimeout(() => {
      if (mounted) {
        setLoadingtimethresholdgone(true);
      }
    },
    Config.loadingTimeThreshold);

    // unmount component
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.upcontainer}>
        <Image
          source={imageLogo}
          style={styles.imagelogo}
        />
      </View>
      <View style={styles.downcontainer}>
        <Text style={styles.loading}>
          { loadingtimethresholdgone
            ? I18n.t('appsplash.loading')
            : ' ' }
        </Text>
        <ActivityIndicator />
      </View>
      <StatusBar barStyle="default" />
    </View>
  );
}

/**
 * styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.COLOR_SPLASHBACKGROUNDCOLOR
  },
  loading: {
    textAlign: 'center',
    paddingBottom: 5,
    color: theme.COLOR_SPLASHCOLOR
  },
  imagelogo: {
    width: 120,
    height: 120,
    resizeMode: 'contain'
  },
  upcontainer: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  downcontainer: {
    flex: 1
  }
});

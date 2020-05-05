// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Linking,
  Image
} from 'react-native';

// load settings
import I18n from '../../../locales/locales';
import theme from '../../../themes/themes.default';
import Config from '../../../config/config';

// load images
const imageLogo = require('../../../images/logo.png');

/**
 * component
 */
export default function About() {
  return (
    <View style={styles.aboutcontainer}>
      <Image
        source={imageLogo}
        style={styles.aboutimagelogo}
      />
      <Text style={styles.abouttitle}>{I18n.t('about.title')}</Text>
      <Text style={styles.aboutversion}>{`${I18n.t('about.version')} ${Config.version}`}</Text>
      <Text style={styles.aboutlink} onPress={() => Linking.openURL(I18n.t('about.linklink'))}>{I18n.t('about.link')}</Text>
      <Text style={styles.aboutcopyright}>{I18n.t('about.copyright')}</Text>
      <Text style={styles.aboutlicense}>
        {I18n.t('about.license')}
        <Text style={styles.aboutlicenselink} onPress={() => Linking.openURL(I18n.t('about.licenselinklink'))}>{I18n.t('about.licenselink')}</Text>
      </Text>
    </View>
  );
}

/**
 * styles
 */
const styles = StyleSheet.create({
  aboutcontainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.COLOR_BACKGROUNDCOLOR
  },
  abouttitle: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 2,
    textAlign: 'center'
  },
  aboutversion: {
    fontSize: 14,
    fontStyle: 'italic',
    margin: 2,
    textAlign: 'center'
  },
  aboutlink: {
    fontSize: 14,
    margin: 2,
    textAlign: 'center',
    textDecorationLine: 'underline'
  },
  aboutcopyright: {
    fontSize: 14,
    margin: 2,
    textAlign: 'center'
  },
  aboutlicense: {
    fontSize: 14,
    margin: 2,
    textAlign: 'center'
  },
  aboutlicenselink: {
    fontSize: 14,
    margin: 2,
    textAlign: 'center',
    textDecorationLine: 'underline'
  },
  aboutimagelogo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    margin: 20
  }
});

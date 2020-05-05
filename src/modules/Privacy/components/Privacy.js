// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import React from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
  View
} from 'react-native';

// load settings
import I18n from '../../../locales/locales';
import theme from '../../../themes/themes.default';
import Config from '../../../config/config';

/**
 * comopnent
 */
export default function Privacy() {
  return (
    <ScrollView style={styles.privacyscrollcontainer}>
      <View style={styles.privacycontainer}>
        <Text style={styles.privacytext}>
          {
            I18n.t('privacy.text')
              .replace('%SOFTWARE%', Config.name)
              .replace('%OWNER%', Config.author)
          }
        </Text>
      </View>
    </ScrollView>
  );
}

/**
 * styles
 */
const styles = StyleSheet.create({
  privacyscrollcontainer: {
    flex: 1,
    backgroundColor: theme.COLOR_BACKGROUNDCOLOR
  },
  privacycontainer: {
    flexGrow: 1,
    padding: 10
  },
  privacytext: {
    fontSize: 12,
    textAlign: 'justify'
  }
});

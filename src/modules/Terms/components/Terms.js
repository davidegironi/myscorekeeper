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
 * component
 */
export default function Terms() {
  return (
    <ScrollView style={styles.termsscrollcontainer}>
      <View style={styles.termscontainer}>
        <Text style={styles.termstext}>
          {
            I18n.t('terms.text')
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
  termsscrollcontainer: {
    flex: 1,
    backgroundColor: theme.COLOR_BACKGROUNDCOLOR
  },
  termscontainer: {
    flexGrow: 1,
    padding: 10
  },
  termstext: {
    fontSize: 12,
    textAlign: 'justify'
  }
});

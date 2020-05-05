// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  View
} from 'react-native';

/**
 * component
 * @param {object} props
 */
export default function ButtonTouch(props) {
  const {
    title,
    onPress,
    color,
    backgroundColor,
    imageLeft,
    fontSize,
    paddingText,
    paddingImage
  } = props;

  return (
    <TouchableOpacity
      style={[
        styles.buttoncontainer,
        backgroundColor != null ? { backgroundColor } : null
      ]}
      onPress={onPress}
    >
      {imageLeft != null
        ? (
          <View style={[
            styles.leftimagecontainer,
            paddingImage != null ? { paddingLeft: paddingImage } : null
          ]}
          >
            <Image
              style={[
                styles.leftimage,
                color != null ? { tintColor: color } : null
              ]}
              source={imageLeft}
            />
          </View>
        )
        : null}
      <View style={[
        styles.viewtext,
        { marginLeft: (imageLeft != null ? -40 : 0) },
        paddingText != null ? { paddingTop: paddingText, paddingBottom: paddingText } : null
      ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.buttontext,
            color != null ? { color } : null,
            fontSize != null ? { fontSize } : null]}
        >
          {title}
        </Text>
      </View>

    </TouchableOpacity>
  );
}

/**
 * styles
 */
const styles = StyleSheet.create({
  buttoncontainer: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 5
  },
  viewtext: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: 'center'
  },
  buttontext: {
    textAlign: 'center',
    fontWeight: '700'
  },
  leftimagecontainer: {
    width: 40,
    paddingLeft: 10,
    justifyContent: 'center'
  },
  leftimage: {
    height: 20,
    width: 20,
    resizeMode: 'contain'
  }
});

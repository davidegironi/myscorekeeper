// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import AsyncStorage from '@react-native-community/async-storage';

module.exports = {

  /**
   * clear the storage
   */
  async clear() {
    return AsyncStorage.clear();
  },

  /**
   * set an item from storage
   * @param {string} key
   * @param {string} value
   */
  async setItem(key, value) {
    return AsyncStorage.setItem(key, value);
  },

  /**
   * get an item from storage
   * @param {string} key
   */
  async getItem(key) {
    return AsyncStorage.getItem(key);
  },

  /**
   * remove an item from storage
   * @param {string} key
   */
  async removeItem(key) {
    return AsyncStorage.removeItem(key);
  }

};

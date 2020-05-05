// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import Toast from 'react-native-toast-message';

module.exports = {

  /**
   * Show a info message
   * @param {string} title
   * @param {string} message
   */
  showInfoMessage(title, message) {
    module.exports.showMessage(title, message, 'info');
  },

  /**
   * Show a error message
   * @param {string} message
   */
  showAlertMessage(message) {
    module.exports.showMessage('Error', message, 'error');
  },

  /**
   * Show a success message
   * @param {string} message
   */
  showSuccessMessage(message) {
    module.exports.showMessage('Success', message, 'success');
  },

  /**
   * Show a message of type
   * @param {string} message
   * @param {string} type
   */
  showMessage(title, message, type) {
    Toast.show({
      type,
      position: 'top',
      text1: (title != null ? title : message),
      text2: (title != null ? message : null),
      visibilityTime: 4000,
      autoHide: true
    });
  }

};

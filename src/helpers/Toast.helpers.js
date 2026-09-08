// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

// NOTE: react-native-toast-message v2.x removed the v1 static `Toast.setRef` /
// `Toast.show` API. We keep a reference to the mounted <Toast> instance here
// (bound by AppMain via `<Toast ref={ToastHelper.setToastRef} />`) and call
// `show` on it.
let toastRef = null;

/**
 * Bind the mounted react-native-toast-message <Toast> instance.
 * @param {*} ref
 */
function setToastRef(ref) {
  toastRef = ref;
}

module.exports = {

  setToastRef,

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
    if (toastRef == null) { return; }
    toastRef.show({
      type,
      position: 'top',
      text1: (title != null ? title : message),
      text2: (title != null ? message : null),
      visibilityTime: 4000,
      autoHide: true
    });
  }

};

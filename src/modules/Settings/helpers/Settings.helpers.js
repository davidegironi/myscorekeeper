// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

// load settings
import I18n from '../../../locales/locales';

// load helpers
import StorageHelper from '../../../helpers/Storage.helpers';

module.exports = {

  /**
   * load settings from storage and refresh store
   * @param {function} dispatch
   */
  async loadSettings(dispatch) {
    const settings = await module.exports.getSettingsStorage();
    if (settings == null) { throw I18n.t('settings.seterror'); }
    dispatch({ type: 'ACTION_REFRESHSETTINGS', settings });
    return settings;
  },

  /**
   * set settings to storage
   * @param {object} settings
   */
  async setSettingsStorage(settings) {
    try {
      await StorageHelper.setItem('@store:settings', JSON.stringify(settings));
    } catch {
      //
    }
  },

  /**
   * get settings from storage
   */
  async getSettingsStorage() {
    try {
      let settings = {
        showsplashscreen: false,
        latestbackupdate: null,
        latestbackupfileid: null,
        alwaysonwhileplaying: true
      };
      // load settings from storage
      const value = await StorageHelper.getItem('@store:settings');
      if (value != null) settings = JSON.parse(value);
      return settings;
    } catch {
      return null;
    }
  },

  /**
   * set setttings
   * @param {function} dispatch
   * @param {object} settings
   */
  async setSettings(dispatch, settings) {
    return module.exports.setSettingsStorage(settings)
      .then(() => {
        dispatch({ type: 'ACTION_REFRESHSETTINGS', settings });
      })
      .catch(() => {
        throw I18n.t('settings.seterror');
      });
  }

};

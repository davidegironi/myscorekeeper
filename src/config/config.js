// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

// load settings
import { version } from '../../package.json';
import { author, name } from '../../app.json';

// default config values
const loadingTimeThreshold = 3000;
const splashscreenTime = 2000;
const theme = 'default';
const populateDataEnabled = false;

// overridable settings
let backupdatabase = {
  url: null,
  fileidlength: 0,
  fileidsecret: null,
  fileretentiondays: 7
};

// select the proper config and override sections
const configproduction = require('./config.production.js');

let config = null;
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') { config = configproduction; }
if (config != null) {
  backupdatabase = config.backupdatabase;
}

/**
 * export the config
 */
module.exports = {
  name,
  author,
  version,
  splashscreenTime: (splashscreenTime > loadingTimeThreshold
    ? loadingTimeThreshold - 1000
    : splashscreenTime),
  loadingTimeThreshold,
  theme,
  populateDataEnabled,
  backupdatabase
};

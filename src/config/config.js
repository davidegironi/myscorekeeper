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
  populateDataEnabled
};

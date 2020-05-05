// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

// load locales
import langAppMain from '../modules/AppMain/locales/AppMain.locales';
import langSettings from '../modules/Settings/locales/Settings.locales';
import langAbout from '../modules/About/locales/About.locales';
import langPrivacy from '../modules/Privacy/locales/Privacy.locales';
import langTerms from '../modules/Terms/locales/Terms.locales';
import langDatabase from '../modules/Database/locales/Database.locales';
import langGames from '../modules/Games/locales/Games.locales';
import langMatches from '../modules/Matches/locales/Matches.locales';
import langPlayers from '../modules/Players/locales/Players.locales';
import langRounds from '../modules/Rounds/locales/Rounds.locales';
import langPoints from '../modules/Points/locales/Points.locales';

// merge languages
const langen = {
  ...langAppMain.en,
  ...langSettings.en,
  ...langAbout.en,
  ...langPrivacy.en,
  ...langTerms.en,
  ...langDatabase.en,
  ...langGames.en,
  ...langMatches.en,
  ...langPlayers.en,
  ...langRounds.en,
  ...langPoints.en
};

/**
 * Get an object descending in array
 * @param {object} obj
 * @param {string} desc
 */
function getDescendantProp(obj, desc) {
  const arr = desc.split('.');
  let ret = obj;
  while (arr.length && ret) {
    ret = ret[arr.shift()];
  }
  return ret;
}

/**
 * export the default language function
 */
export default {
  t(keyname) {
    return getDescendantProp(langen, keyname) || keyname;
  },
};

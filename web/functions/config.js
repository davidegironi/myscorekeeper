// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

const remoteBucketFolder = 'backups';
const remoteFilePrefix = 'db-';
const remoteFileExtention = '.realm';
const tempDir = '/tmp';
const cacheControl = 'public, max-age=300, s-maxage=600';
const enableFiletokenCheck = true;

// overridable settings
let apifirebasesecret = null;
let backupdatabase = {
  remotestorage: null,
  fileidlength: 0,
  fileidsecret: null
};

// select the proper config and override sections
const configproduction = require('./config.production.js');

let config = null;
if (configproduction != null) { config = configproduction; }
if (config != null) {
  apifirebasesecret = config.apifirebasesecret;
  backupdatabase = config.backupdatabase;
}

/**
 * export the config
 */
module.exports = {
  apifirebasesecret,
  remoteStorage: backupdatabase.remotestorage,
  fileidlength: backupdatabase.fileidlength,
  fileidsecret: backupdatabase.fileidsecret,
  remoteBucketFolder,
  remoteFilePrefix,
  remoteFileExtention,
  tempDir,
  cacheControl,
  enableFiletokenCheck
};

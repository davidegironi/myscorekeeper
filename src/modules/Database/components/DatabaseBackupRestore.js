// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import React, { useContext, useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  TextInput,
  Text,
  View,
  Platform,
  Alert,
  StyleSheet
} from 'react-native';
import useIsMounted from 'ismounted';
import Moment from 'moment';
import RNFS from 'react-native-fs';
import axios, { CancelToken } from 'axios';

// load contexts
import { ScrollView } from 'react-native-gesture-handler';
import MainContext from '../../../contexts/MainContext';

// load settings
import I18n from '../../../locales/locales';
import theme from '../../../themes/themes.default';
import s from '../../../themes/styles';
import Config from '../../../config/config';

// load database model
import { databaseOptions } from '../../../database/db.schema';

// load helpers
import ToastHelper from '../../../helpers/Toast.helpers';
import SettingsHelper from '../../Settings/helpers/Settings.helpers';

// load components
import ButtonTouch from '../../ButtonTouch/components/ButtonTouch';

const md5 = require('blueimp-md5');

// load images
const imageBackup = require('../../../images/backup.png');
const imageRestore = require('../../../images/restore.png');
const imageClear = require('../../../images/clear.png');

/**
 * component
 */
export default function DatabaseBackupRestore() {
  const { state, dispatch } = useContext(MainContext);
  const { settings } = state;
  const { db } = state;
  const isMounted = useIsMounted();

  // states
  const [isloading, setIsloading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [cancelfetch, setCancelfetch] = useState(null);
  const [restorefileid, setRestorefileid] = useState(null);

  // effects - reset loading
  useEffect(() => {
    if (isloading) {
      setIsloading(false);
    }
  }, [isloading]);

  // effects - check latest backup data
  useEffect(() => {
    // check if the old backup needs to be removed
    if (settings != null
        && settings.latestbackupdate !== null
        && (new Date() - Moment(settings.latestbackupdate)
          > Config.backupdatabase.fileretentiondays * 24 * 60 * 60 * 1000)) {
      // update the settings
      const newsettings = settings;
      newsettings.latestbackupdate = null;
      newsettings.latestbackupfileid = null;
      // save settings
      SettingsHelper.setSettings(dispatch, newsettings)
        .catch(() => null);
    }
  }, [settings]);

  /**
   * upload the database file to the remote storage
   * @param {string} fileid
   */
  const backupDb = (fileid) => {
    const filepath = databaseOptions.path;

    // read the file
    RNFS.stat(filepath)
      .then((stat) => {
        RNFS.readFile(filepath, 'base64')
          .then((filecontent) => {
            // build the file token
            const filetoken = md5(filecontent, Config.backupdatabase.fileidsecret);
            const fullfilepath = `file://${stat.path}`;

            // set the canceltoken
            const canceltoken = CancelToken.source();
            setCancelfetch(canceltoken);

            setProgress(
              <Text style={styles.progresstext}>
                <Text style={styles.progresstextinfo}>{I18n.t('databasebackuprestore.backuptocloudstart')}</Text>
              </Text>
            );

            // eslint-disable-next-line prefer-const, no-undef
            let data = new FormData();
            data.append('db', {
              uri: fullfilepath,
              type: 'application/octet-stream',
              name: 'realm.db'
            });
            axios.request({
              method: 'POST',
              url: `${Config.backupdatabase.url}/backupfile?filetoken=${filetoken}&fileid=${fileid}`,
              data,
              headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data'
              },
              onUploadProgress(progressEvent) {
                if (!isMounted.current) return;
                // update the progress bar
                if (progressEvent.lengthComputable) {
                  setProgress(
                    <Text style={styles.progresstext}>
                      {Math.round((progressEvent.loaded * 100) / progressEvent.total)}
                      <Text style={styles.progresstextsymbol}>%</Text>
                    </Text>
                  );
                } else {
                  setProgress(
                    <Text style={styles.progresstext}>
                      { Math.round((progressEvent.loaded / (1000 * 1000)) * 100) / 100}
                      <Text style={styles.progresstextsymbol}>Mb</Text>
                    </Text>
                  );
                }
              },
              cancelToken: canceltoken.token
            })
              .then((response) => {
                if (!isMounted.current) return;
                if (response.status === 200) {
                  if (response.data.fileid !== null) {
                    // update the settings
                    const newsettings = settings;
                    newsettings.latestbackupdate = new Date();
                    newsettings.latestbackupfileid = response.data.fileid;
                    // save settings
                    SettingsHelper.setSettings(dispatch, newsettings)
                      .catch((err) => {
                        ToastHelper.showAlertMessage(err);
                      });
                    Alert.alert(
                      I18n.t('databasebackuprestore.alertbackupdatabase'),
                      I18n.t('databasebackuprestore.backuptocloudsuccess'),
                      [
                        {
                          text: I18n.t('appmain.buttonok')
                        }
                      ]
                    );
                  } else {
                    ToastHelper.showAlertMessage(I18n.t('databasebackuprestore.erroruploadunknown'));
                  }
                } else {
                  ToastHelper.showAlertMessage(I18n.t('databasebackuprestore.backuptoclouderror'));
                }
                setCancelfetch(null);
                setProgress(null);
              })
              .catch((err) => {
                if (!axios.isCancel(err)) { ToastHelper.showAlertMessage(err.message); }
                setCancelfetch(null);
                setProgress(null);
              });
          });
      });
  };

  /**
   * download the database file from the remote storage and restore it
   * @param {string} fileid
   */
  const restoreDb = (fileid) => {
    const filepath = databaseOptions.path;

    // set the canceltoken
    const canceltoken = CancelToken.source();
    setCancelfetch(canceltoken);

    setProgress(
      <Text style={styles.progresstext}>
        <Text style={styles.progresstextinfo}>{I18n.t('databasebackuprestore.restorefromcloudstarting')}</Text>
      </Text>
    );

    axios.request({
      method: 'GET',
      url: `${Config.backupdatabase.url}/backupfile?fileid=${fileid}`,
      responseType: 'arraybuffer',
      headers: {
        Accept: 'application/octet-stream'
      },
      onDownloadProgress(progressEvent) {
        if (!isMounted.current) return;
        // update the progress bar
        if (progressEvent.lengthComputable) {
          setProgress(
            <Text style={styles.progresstext}>
              {Math.round((progressEvent.loaded * 100) / progressEvent.total)}
              <Text style={styles.progresstextsymbol}>%</Text>
            </Text>
          );
        } else {
          setProgress(
            <Text style={styles.progresstext}>
              { Math.round((progressEvent.loaded / (1000 * 1000)) * 100) / 100}
              <Text style={styles.progresstextsymbol}>Mb</Text>
            </Text>
          );
        }
      },
      cancelToken: canceltoken.token
    })
      .then((response) => {
        if (!isMounted.current) return;
        if (response.status === 200) {
          // write the file
          // eslint-disable-next-line no-underscore-dangle
          RNFS.writeFile(filepath, response.request._response, 'base64')
            .then(() => {
              Alert.alert(
                I18n.t('databasebackuprestore.alertrestoredatabase'),
                I18n.t('databasebackuprestore.restorefromcloudsuccess'),
                [
                  {
                    text: I18n.t('appmain.buttonok'),
                    onPress: () => {
                      // reload database
                      db.close();
                      dispatch({ type: 'ACTION_REFRESHDB', db: null });
                    }
                  }
                ]
              );
              setCancelfetch(null);
              setProgress(null);
            })
            .catch((err) => {
              ToastHelper.showAlertMessage(err.message);
              setCancelfetch(null);
              setProgress(null);
            });
        } else {
          ToastHelper.showAlertMessage(I18n.t('databasebackuprestore.restorefromclouderror'));
        }
        setCancelfetch(null);
        setProgress(null);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) { ToastHelper.showAlertMessage(err.message); }
        setCancelfetch(null);
        setProgress(null);
      });
  };

  // show the progress base for upload or download
  if (cancelfetch !== null) {
    return (
      <View style={styles.container}>
        <View style={styles.progresscontainer}>
          <Text style={styles.progresstext}>
            {progress}
          </Text>
        </View>

        <ButtonTouch
          title={I18n.t('appmain.buttoncancel')}
          backgroundColor={theme.COLOR_BUTTONSAVE_BACKGROUNDCOLOR}
          color={theme.COLOR_BUTTONSAVE_COLOR}
          imageLeft={imageClear}
          onPress={() => {
            if (cancelfetch != null) {
              cancelfetch.cancel();
            }
            setProgress(null);
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <Text style={styles.sectiontitle}>
          {I18n.t('databasebackuprestore.restore')}
        </Text>
        <Text style={styles.sectiontext}>
          {I18n.t('databasebackuprestore.restoreinfo')}
        </Text>
        <View style={s.formcontainer}>
          <View style={s.formrow}>
            <View style={s.formlabel}>
              <Text style={s.formlabeltext}>{I18n.t('databasebackuprestore.restorebackupfileid')}</Text>
            </View>
            <TextInput
              style={[s.forminputtextinput, s.forminputtextinputenabled]}
              value={restorefileid}
              placeholder={I18n.t('databasebackuprestore.placeholderrestorebackupfileid')}
              autoCorrect={false}
              underlineColorAndroid="transparent"
              returnKeyType="done"
              onChangeText={(text) => setRestorefileid(text)}
            />
          </View>
        </View>
        <View style={styles.sectionbutton}>
          <ButtonTouch
            title={I18n.t('databasebackuprestore.buttonrestore')}
            backgroundColor={theme.COLOR_BUTTONSAVE_BACKGROUNDCOLOR}
            color={theme.COLOR_BUTTONSAVE_COLOR}
            imageLeft={imageRestore}
            onPress={() => {
              if (restorefileid == null
            || (restorefileid != null
              && restorefileid.length !== Config.backupdatabase.fileidlength)) {
                ToastHelper.showAlertMessage(I18n.t('databasebackuprestore.errorinvalidfileid'));
              } else {
                Alert.alert(
                  I18n.t('databasebackuprestore.alertrestoredatabase'),
                  I18n.t('databasebackuprestore.alertrestorefromcloud'),
                  [
                    {
                      text: I18n.t('appmain.buttoncancel'),
                      style: 'cancel'
                    },
                    {
                      text: I18n.t('appmain.buttonok'),
                      onPress: () => {
                        restoreDb(restorefileid);
                      }
                    },
                  ]
                );
              }
            }}
          />
        </View>

        <View style={styles.sectionsseparator} />

        <Text style={styles.sectiontitle}>
          {I18n.t('databasebackuprestore.backup')}
        </Text>
        <Text style={styles.sectiontext}>
          {I18n.t('databasebackuprestore.backupinfo').replace('%RETENTIONDAYS%', Config.backupdatabase.fileretentiondays)}
        </Text>
        {settings.latestbackupfileid != null
          ? (
            <View>
              <View style={s.formcontainer}>
                <View style={s.formrow}>
                  <View style={s.formlabel}>
                    <Text style={s.formlabeltext}>{I18n.t('databasebackuprestore.latestbackup')}</Text>
                  </View>
                  <TextInput
                    style={[s.forminputtextinput, s.forminputtextinputdisabled]}
                    value={Moment(settings.latestbackupdate).format('LL LT')}
                    editable={false}
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View style={s.formrow}>
                  <View style={s.formlabel}>
                    <Text style={s.formlabeltext}>{I18n.t('databasebackuprestore.latestbackupfileid')}</Text>
                  </View>
                  <TextInput
                    style={[s.forminputtextinput, s.forminputtextinputdisabled]}
                    value={settings.latestbackupfileid}
                    editable={false}
                    underlineColorAndroid="transparent"
                  />
                </View>
              </View>
            </View>
          ) : null}
        <View style={styles.sectionbutton}>
          <ButtonTouch
            title={I18n.t('databasebackuprestore.buttonbackup')}
            backgroundColor={theme.COLOR_BUTTONSAVE_BACKGROUNDCOLOR}
            color={theme.COLOR_BUTTONSAVE_COLOR}
            imageLeft={imageBackup}
            onPress={() => {
              if (settings.latestbackupdate !== null
             && ((new Date()) - Moment(settings.latestbackupdate)) < 1 * 60 * 60 * 1000) {
                ToastHelper.showAlertMessage(I18n.t('databasebackuprestore.errortoomuchbackups'));
              } else {
                Alert.alert(
                  I18n.t('databasebackuprestore.alertbackupdatabase'),
                  I18n.t('databasebackuprestore.alertbackuptocloud'),
                  [
                    {
                      text: I18n.t('appmain.buttoncancel'),
                      style: 'cancel'
                    },
                    {
                      text: I18n.t('appmain.buttonok'),
                      onPress: () => {
                      // run the backup, gives the backup page time to be shown
                        backupDb(settings.latestbackupfileid);
                      }
                    },
                  ]
                );
              }
            }}
          />
        </View>

        <View style={styles.sectionsbottom} />

      </KeyboardAvoidingView>
    </ScrollView>
  );
}

/**
 * styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLOR_BACKGROUNDCOLOR,
    padding: 10,
  },
  sectiontitle: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingBottom: 5
  },
  sectiontext: {
    textAlign: 'justify',
    marginBottom: 10
  },
  sectionbutton: {
  },
  sectionsseparator: {
    marginVertical: 10,
    borderBottomColor: theme.COLOR_BACKUPRESTORE_SEPARATORCOLOR,
    borderBottomWidth: 1,
  },
  sectionsbottom: {
    marginVertical: 10
  },
  progresscontainer: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center'
  },
  progresstext: {
    fontSize: 46
  },
  progresstextinfo: {
    fontSize: 22
  },
  progresstextsymbol: {
    fontSize: 22
  }
});

// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

/**
 * locales
 */
export default {
  en: {
    databasebackuprestore: {
      backup: 'Backup',
      backupinfo: 'Backup to Cloud is a free service based on a cloud platform, for this reason it may do not always work.\nYour data will be stored in a temporary space, an unique FileId is returned to you. Your backup will expire in %RETENTIONDAYS% days.',
      restore: 'Restore',
      restoreinfo: 'If you restore the database, your actual data will be deleted.\nFill your unique FileId to restore your backup.',
      buttonbackup: 'Backup to Cloud',
      buttonrestore: 'Restore from Cloud',
      latestbackup: 'Latest backup',
      latestbackupfileid: 'Latest backup FileId',
      restorebackupfileid: 'Restore FileId',
      placeholderrestorebackupfileid: 'FileId to restore',
      alertbackupdatabase: 'Backup',
      alertbackuptocloud: 'Do you want to compact your database and backup to cloud?',
      alertrestoredatabase: 'Restore',
      alertrestorefromcloud: 'Do you want to restore your date from cloud?',
      backuptocloudstart: 'Uploading...',
      backuptocloudsuccess: 'Backup ends with success.',
      backuptoclouderror: 'Backup ends with errors.',
      restorefromcloudstarting: 'Restoring...',
      restorefromcloudsuccess: 'Restore ends with success.',
      restorefromclouderror: 'Restore ends with errors.',
      erroruploadunknown: 'Unknown error uploading file.',
      errorinvalidfileid: 'FileId empty or invalid.',
      errortoomuchbackups: 'One backup per hour allowed.'
    }
  }
};

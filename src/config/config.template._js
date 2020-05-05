//config template

module.exports = {
  backupdatabase: {
    url: 'http://BACKUP_RESTORE_SERVER_URL',
    fileidlength: LENGTH_OF_THE_FILEID,
    fileidsecret: 'BACKUP_RESTORE_FILEID_SECRET',
    fileretentiondays: NUMBER_OF_RETENTION_DAYS_OF_BACKUP
  }
};
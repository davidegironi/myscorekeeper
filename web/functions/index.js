// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

/**
 * MyScoreKeeper backup/restore web service that uses
 * firebase functions and storage
 */

const firebase = require('firebase-admin');
const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');
const nanoid = require('nanoid');
const fs = require('fs');
const md5 = require('blueimp-md5');
const Busboy = require('busboy');

const app = express();

// load config
const config = require('./config');

const {
  apifirebasesecret,
  fileIdLength,
  fileIdSecret,
  remoteStorage,
  remoteBucketFolder,
  remoteFilePrefix,
  remoteFileExtention,
  tempDir,
  cacheControl,
  enableFiletokenCheck
} = config;

// set firebase
firebase.initializeApp({
  credential: firebase.credential.cert(apifirebasesecret)
});

// initialize storage
const storage = firebase.storage();

// add other middleware
app.use(cors());

// get a file from storage
app.get('/api/backupfile', async (req, res) => {
  res.set('Cache-Control', cacheControl);

  const { fileid } = req.query;
  const filename = remoteFilePrefix + fileid + remoteFileExtention;
  const filepath = `${remoteBucketFolder}/${filename}`;

  storage
    .bucket(remoteStorage)
    .getFiles({
      prefix: filepath,
    }).then((response) => {
      const files = response[0];
      const file = files[0];
      if (file !== null) {
        return file.download();
      }
      return null;
    })
    .then((data) => {
      if (data === null) {
        res.status(400).send('File not found.');
      } else {
        // send the file to client
        res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
        res.end(data[0], 'binary');
      }
    })
    .catch(() => {
      res.status(500).send('Erros happend retriving file from storage.');
    });
});

// upload a file to storage
app.post('/api/backupfile', (req, res) => {
  // get filetoken
  const { filetoken } = req.query;
  const { fileid } = req.query;
  // build busboy
  const busboy = new Busboy({ headers: req.headers });

  // generate a random filename
  const nanoidgenerator = nanoid.customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', fileIdLength);
  const fileidnew = nanoidgenerator();
  const filename = remoteFilePrefix + fileidnew + remoteFileExtention;
  const filepath = `${tempDir}/${filename}`;

  // eslint-disable-next-line no-unused-vars
  busboy.on('file', (_fieldname, file, _filename, _encoding, _mimetype) => {
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on('finish', () => {
    // read the temporary file
    fs.readFile(filepath, 'base64', (err, filecontent) => {
      // check errors
      if (err != null) {
        res.status(500).send('Errors reading incoming file.');
        return;
      }
      // check the filetoken
      const filetokencheck = md5(filecontent, fileIdSecret);
      if (filetokencheck !== filetoken && enableFiletokenCheck) {
        res.status(500).send('Invalid FileToken.');
      } else {
        // try to remove the old file
        if (fileid != null) {
          storage
            .bucket(remoteStorage)
            .deleteFiles({
              prefix: `${remoteBucketFolder}/${remoteFilePrefix}${fileid}${remoteFileExtention}`,
              force: true
            })
            .then(() => null)
            .catch(() => null);
        }

        // upload to storage
        storage
          .bucket(remoteStorage)
          .upload(filepath, {
            gzip: true,
            destination: `${remoteBucketFolder}/${filename}`,
            metadata: {
              cacheControl: 'no-cache',
            }
          })
          .then(() => {
            // remove temp file
            fs.unlinkSync(filepath);
            res.send({ fileid: fileidnew });
          })
          .catch(() => {
            // remove temp file
            fs.unlinkSync(filepath);
            res.status(500).send('Erros happend uploading file to storage.');
          });
      }
    });
  });
  if (req.rawBody) {
    busboy.end(req.rawBody);
  } else {
    req.pipe(busboy);
  }
});

// export app
exports.app = functions.https.onRequest(app);

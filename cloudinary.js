require('dotenv').config();
const cloudinary = require('cloudinary');
const express = require('express');
const multer = require('multer');
const uploads = multer({ dest: './temp' });
const users = require('./users');

const {
  PORT: port = 3000,
  HOST: host = '127.0.0.1',
  CLOUDINARY_CLOUD,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

if (!CLOUDINARY_CLOUD || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn('Missing cloudinary config, uploading images will not work');
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const app = express();
async function upload(req, res, next) {
  const { file: { path } = {} } = req;
  if (!path) {
    return res.send('gat ekki lesið mynd');
  }



  let upload = null;

  try {
    upload = await cloudinary.v2.uploader.upload(path);
  } catch (error) {
    console.error('Unable to upload file to cloudinary:', path);
    return next(error);
  }

  const { secure_url } = upload;
  const updated = await users.editPic(req.user.id, secure_url);
  res.status(200).json({ Success: 'Your account has been modified', secure_url });
}
app.post('/upload', uploads.single('image'), upload);

module.exports = {
  upload,
}

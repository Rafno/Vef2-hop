require('dotenv').config();
const cloudinary = require('cloudinary');
const express = require('express');
const multer = require('multer');

const uploads = multer({ dest: './temp' });
const users = require('./users');

const {
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
  // Þessi lína er disabled af því að hún er tekin frá óla kennnara.
  let upload = null; // eslint-disable-line
  try {
    upload = await cloudinary.v2.uploader.upload(path);
  } catch (error) {
    console.error('Unable to upload file to cloudinary:', path);
    return next(error);
  }
  const { url } = upload;
  await users.editPic(req.user.id, url);
  return res.status(200).json({ Success: 'Your account has been modified', url });
}
app.post('/upload', uploads.single('image'), upload);

module.exports = {
  upload,
};


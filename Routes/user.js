const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('./cloudinary');
const upload = multer({ storage });

const { requireloginuser } = require('./requirelogin_middleware');
const OracleDB = require('oracledb');
const dbConfig = require('./dbConfig');
const { v4: uuid } = require('uuid');
const nodemailer = require('nodemailer');
const fs = require('fs');
const cloudinary = require('./cloudinary');

let videos = [];
let vendor = [];
let shoplocation = [];

router.get('/shopdata', (req, res) => {
  res.render('blogger/map');
});

router.get('/data', (req, res) => {
  const shopdata = shoplocation;
  res.json(shopdata);
});

router.get('/:id/upload_video', requireloginuser, (req, res) => {
  res.render('blogger/upload_videos', { vendor });
});

router.post('/:id/upload_video', upload.single('video'), async (req, res) => {
  const C_ID = req.params.id;
  const { VIDEO_TITLE, VIDEO_DESCRIPTION, TAGS, vendor } = req.body;
  const video_id = uuid();
  console.log('Request Body:', {
    C_ID,
    VIDEO_TITLE,
    VIDEO_DESCRIPTION,
    TAGS,
    vendor,
  });
  const { originalname, path } = req.file;
  console.log(req.file);

  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    await connection.execute(
      'INSERT INTO UPLOADED_VIDEOS (video_id,C_ID, VIDEO_TITLE, VIDEO_DESCRIPTION, TAGS, VIDEO_LINKS) VALUES (:video_id,:C_ID, :VIDEO_TITLE, :VIDEO_DESCRIPTION, :TAGS, :path)',
      { video_id, video_id, C_ID, VIDEO_TITLE, VIDEO_DESCRIPTION, TAGS, path },
      { autoCommit: true }
    );
  } catch (err) {
    console.error(err);
    req.flash(
      'error_upload_video',
      'An error occur during Uploading please try again'
    );
    return res.redirect(`/user/${req.params.id}`);
  } finally {
    try {
      await connection.close();
    } catch (err) {
      console.error(err);
    }
  }
  req.flash('upload_video', 'Video uploaded successfully!');
  res.redirect(`/user/${req.params.id}`);
});

router.post('/:id/navbar', (req, res) => {
  req.session.mode = req.body.mode;
  console.log(req.body.mode);
  res.redirect(`/user/${req.params.id}`);
});

router.post('/:id/logout', requireloginuser, (req, res) => {
  req.session.user_id = null;
  req.flash('logout', 'Successfully logged out');
  res.redirect('/home');
});

router.get('/:id', requireloginuser, async (req, res) => {
  const currentPage = parseInt(req.query.page) || 1;
  const itemsPerPage = 6;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedItems = videos.slice(startIndex, endIndex);

  const totalPages = Math.ceil(videos.length / itemsPerPage);
  let connection;

  const prefix = 'S%';
  const { id } = req.params;
  console.log(id);

  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      'SELECT USER_ID,FIRST_NAME,LAST_NAME,DISTRICT,CITY,AREA FROM users WHERE USER_ID LIKE :prefix ORDER BY USER_ID',
      { prefix }
    );
    const bloggerVideoResult = await connection.execute(
      'SELECT video_id,VIDEO_TITLE, VIDEO_DESCRIPTION, TAGS,VIDEO_LINKS FROM UPLOADED_VIDEOS WHERE C_ID = :id',
      { id }
    );
    console.log('the video result is:', bloggerVideoResult.rows);
    // console.log(result.rows);
    videos = bloggerVideoResult.rows;
    vendor = result.rows;
    if (vendor.length > 0) {
      shoplocation = vendor.map((row) => row.AREA);
      console.log(shoplocation);
    } else {
      console.log('No vendors found.');
    }
    res.render('blogger/blogger', {
      displayedItems,
      totalPages,
      currentPage,
      videos,
    });
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

module.exports = router;

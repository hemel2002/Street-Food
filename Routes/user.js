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
// Video paths relative to the "public" directory
let videos = [
  { id: 1, path: '../videos/1.mp4' },
  { id: 2, path: '../videos/2.mp4' },
  { id: 3, path: '../videos/3.mp4' },
  { id: 4, path: '../videos/4.mp4' },
  { id: 5, path: '../videos/5.mp4' },
  { id: 6, path: '../videos/6.mp4' },
  { id: 7, path: '../videos/7.mp4' },
];
let vendor = [];

router.get('/:id', requireloginuser, async (req, res) => {
  const currentPage = parseInt(req.query.page) || 1; // Get current page from query parameter
  const itemsPerPage = 6; // Number of items per page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedItems = videos.slice(startIndex, endIndex);

  const totalPages = Math.ceil(videos.length / itemsPerPage);

  ///////////////////////////total vendor count/////////////////////

  const prefix = 'S%';

  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      'SELECT USER_ID,FIRST_NAME,LAST_NAME,DISTRICT,CITY,AREA FROM users WHERE USER_ID LIKE :prefix ORDER BY USER_ID',
      { prefix }
    );
    console.log(result.rows);
    vendor = result.rows;
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

  /////////////////////////send data to frontend/////////////////////
  res.render('blogger/blogger', {
    displayedItems,
    totalPages,
    currentPage,
    videos,
  });
});
router.get('/:id/upload_video', requireloginuser, (req, res) => {
  console.log(vendor);
  res.render('blogger/upload_videos', { vendor });
});

/////////////////////////////////user navabr handel///////////////////

router.post('/:id/navbar', (req, res) => {
  req.session.mode = req.body.mode;
  console.log(req.body.mode);
  res.redirect(`/user/${req.params.id}`);
});

//////////////////////////////////user logout/////////////////////////////
router.post('/:id/logout', requireloginuser, (req, res) => {
  req.session.user_id = null;
  req.flash('logout', 'Successfully logged out');
  res.redirect('/home');
});

module.exports = router;

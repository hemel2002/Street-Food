const express = require('express');
const router = express.Router();
const path = require('path');
const methodOverride = require('method-override');
const { v4: uuid } = require('uuid');
const { Console } = require('console');
const https = require('https');
const multer = require('multer');
const { storage } = require('./cloudinary');
const upload = multer({ storage });
const requirelogin = require('./requirelogin_middleware');
const OracleDB = require('oracledb');

const dbConfig = require('./dbConfig');
const { constrainedMemory } = require('process');

let foodData = [];
let reviews = [];
/////////////////////////////////dark_mode////////////////////////
router.post('/navbar', (req, res) => {
  req.session.mode = req.body.mode;
  console.log(req.body.mode);
  res.redirect('/vendor');
});

/////////////////////for vendors home page//////////////////////////
router.get('/', requirelogin, async (req, res) => {
  //get data form database
  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = connection.execute(
      'select * from food order by food_id asc'
    );
    const result2 = connection.execute(
      'select CUSTOMER_ID,name,REVIEW_MESSAGE,RATING from customer_reviews'
    );
    foodData = (await result).rows;
    reviews = (await result2).rows;
    console.log(reviews);
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
  const currentPage = req.query.page || 1; // Get current page from query parameter
  const count = 0;
  console.log(currentPage);
  const itemsPerPage = 6; // Number of items per page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedItems = foodData.slice(startIndex, endIndex);

  const totalPages = Math.ceil(foodData.length / itemsPerPage);

  // Pass the data to the template
  res.render('vendor_ejs/vendor.ejs', {
    foodData,
    displayedItems,
    totalPages,
    currentPage,
    reviews,
    count,
  });
});
/////////////////////for vendor add food //////////////////////////

router.get('/add_food', requirelogin, (req, res) => {
  console.log('it working');
  res.render('vendor_ejs/add_food');
});

router.post(
  '/add_food',
  requirelogin,
  upload.single('image'),
  async (req, res) => {
    // console.log('it working');
    console.log(req.body, req.file);
    const { name, price, rating = 0, ingredient, availability } = req.body;
    console.log(req.body);

    const { path, originalname } = req.file;
    let connection;
    try {
      connection = await OracleDB.getConnection(dbConfig);
      const result = await connection.execute(
        'INSERT INTO Food (food_name,price ,rating,ingredient,availability,Food_pic,ORIGINAL_PATH) values(:name,:price,:rating,:ingredient,:availability,:path,:originalname)',
        { name, price, rating, ingredient, availability, path, originalname },
        { autoCommit: true }
      );
      console.log(result);
    } catch (err) {
      console.error(err);
      res.send('datbase is not connected');
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }

    // foodData.push({ F_id: uuid(), price, imageUrl: path, originalname });
    req.flash('complete', 'New item is added');
    // console.log(foodData);
    res.redirect('/vendor');
  }
);

/////////////////////for vendor udate food //////////////////////////

router.get('/update/:id', requirelogin, async (req, res) => {
  // Handle GET request for /vendor/update/:id
  const id = req.params.id;
  let findfoodData = null;
  // You might render a form here for editing the vendor information

  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      'SELECT FOOD_ID, FOOD_NAME, PRICE, INGREDIENT, AVAILABILITY, ORIGINAL_PATH, FOOD_PIC FROM food WHERE FOOD_ID = :id',
      [id]
    );
    console.log(result.rows[0]);
    if (result.rows.length > 0) {
      findfoodData = result.rows[0]; // Get the first (and only) row
    }
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

  // const findfoodData = foodData.find((c) => c.FOOD_ID === id);
  console.log(findfoodData);

  res.render('vendor_ejs/update_food', { findfoodData });
});

router.patch(
  '/update/:id',
  requirelogin,
  upload.single('image'),
  async (req, res) => {
    const { id } = req.params;
    const { name, price, ingredient, availability } = req.body;
    const { path, originalname } = req.file;

    console.log(req.body);
    console.log(req.file);
    let findfoodData = null;
    let connection;
    try {
      connection = await OracleDB.getConnection(dbConfig);
      await connection.execute(
        'update food set FOOD_NAME=:name,PRICE=:price,INGREDIENT=:ingredient,AVAILABILITY=:availability,ORIGINAL_PATH=:originalname, FOOD_PIC=:path  WHERE FOOD_ID = :id',
        [name, price, ingredient, availability, originalname, path, id],
        { autoCommit: true }
      );
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

    req.flash('foodupdated', 'Food item updated successfully!');

    res.redirect('/vendor');
  }
);

/////////////////////for vendor email//////////////////////////
router.get('/email', requirelogin, (req, res) => {
  res.render('vendor_ejs/email');
});

router.post('/email', async (req, res) => {
  const nodemailer = require('nodemailer');
  console.log(req.body);
  const { email_id, email_text } = req.body;

  const transporter = nodemailer.createTransport({
    host: process.env.Email_host,
    port: process.env.Email_host,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.Email_username,
      pass: process.env.Email_password,
    },
  });
  try {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.Email_username, // sender address (must match the authenticated user)
      to: email_id, // list of receivers
      subject: 'Forgot Password', // Subject line
      text: `Your forget code is: ${uuid()} ${email_text}`, // plain text body
      // html: undefined, // Set HTML body if needed
    });

    console.log('Message sent: %s', info.messageId);
    req.flash('sendemail', 'Thank you, your email has been submitted to Admin');
    return res.redirect('/vendor');
  } catch (error) {
    console.error(error);
    req.flash(
      'sendemail',
      'There was an error sending your email. Please try again.'
    );
    return res.redirect('/vendor');
  }
});

//////////////////////////////////vendor profile////////////////////////////
router.get('/profile', requirelogin, (req, res) => {
  res.render('vendor_ejs/vendor_profile');
});
//////////////////////////////////vendor logout/////////////////////////////
router.post('/logout', requirelogin, (req, res) => {
  req.session.user_id = null;
  req.flash('logout', 'successfully logout');
  res.redirect('/home');
});
///////////////////////////////////////test/////////////////////////////
router.get('/totallength', (req, res) => {
  res.json(foodData.length);
});
/////////////////////////////////export Router/////////////////////////////
module.exports = router;

const express = require('express');
const router = express.Router();
const qr = require('qr-image');
const path = require('path');
const fs = require('fs');

const { cloudinary } = require('./cloudinary');
const { requirelogin } = require('./requirelogin_middleware');
const OracleDB = require('oracledb');
const multer = require('multer');
const { storage } = require('./cloudinary');
const upload = multer({ storage });
const dbConfig = require('./dbConfig');
const { v4: uuid } = require('uuid');
const nodemailer = require('nodemailer');
let foodData = [];
let reviews = [];
///////////////////////////////dark_mode////////////////////////
router.post('/:id/navbar', (req, res) => {
  req.session.mode = req.body.mode;
  console.log(req.body.mode);
  res.redirect(`/vendor/${req.params.id}`);
});

/////////////////////for vendor home page//////////////////////////
router.get('/:id', requirelogin, async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const foodResult = await connection.execute(
      `SELECT * FROM food WHERE FOOD_ID IN (SELECT FOOD_ID FROM VENDOR_SELLS_FOOD WHERE V_ID = :id) ORDER BY FOOD_ID ASC`,
      { id: id }
    );
    console.log(foodResult.rows);
    const reviewResult = await connection.execute(
      'SELECT CUSTOMER_ID, NAME, REVIEW_MESSAGE, RATING FROM customer_reviews'
    );
    foodData = foodResult.rows;
    reviews = reviewResult.rows;
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

  const currentPage = parseInt(req.query.page) || 1;
  const itemsPerPage = 6;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedItems = foodData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(foodData.length / itemsPerPage);

  res.render('vendor_ejs/vendor', {
    foodData,
    displayedItems,
    totalPages,
    currentPage,
    reviews,
    id,
  });
});

/////////////////////for vendor add food //////////////////////////
router.get('/:id/add_food', requirelogin, (req, res) => {
  const { id } = req.params;
  console.log('Add food page requested');
  res.render('vendor_ejs/add_food', { id });
});

router.post(
  '/:id/add_food',
  requirelogin,
  upload.single('image'),
  async (req, res) => {
    const { name, price, rating = 0, ingredient, availability } = req.body;
    const { path, originalname } = req.file;
    const { id } = req.params;
    let connection;
    try {
      connection = await OracleDB.getConnection(dbConfig);

      // Get the current maximum FOOD_ID
      const result = await connection.execute(
        'SELECT MAX(FOOD_ID) AS FOOD_ID FROM vendor_sells_food'
      );

      const currentFoodId = result.rows[0].FOOD_ID;
      console.log(result.rows);
      console.log(currentFoodId);

      const currentNumber = parseInt(currentFoodId.split('_')[1]);
      const nextFoodId = `F_${currentNumber + 1}`;

      // Insert new food item into Food table
      await connection.execute(
        'INSERT INTO Food (food_name, price, rating, ingredient, availability, Food_pic, ORIGINAL_PATH) VALUES (:name, :price, :rating, :ingredient, :availability, :path, :originalname)',
        { name, price, rating, ingredient, availability, path, originalname },
        { autoCommit: true }
      );

      // Link the new food item with the vendor in VENDOR_SELLS_FOOD table
      await connection.execute(
        'INSERT INTO VENDOR_SELLS_FOOD (V_ID, FOOD_ID) VALUES (:id, :nextFoodId)',
        { id, nextFoodId },
        { autoCommit: true }
      );
    } catch (err) {
      console.error(err);
      res.status(500).send('Database is not connected');
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }

    req.flash('complete', 'New item is added');
    res.redirect(`/vendor/${req.params.id}`);
  }
);

/////////////////////for vendor update food //////////////////////////
router.get('/:id/update/:food_id', requirelogin, async (req, res) => {
  const { food_id } = req.params;
  let findfoodData = null;
  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      'SELECT FOOD_ID, FOOD_NAME, PRICE, INGREDIENT, AVAILABILITY, ORIGINAL_PATH, FOOD_PIC FROM food WHERE FOOD_ID = :id',
      [food_id]
    );
    if (result.rows.length > 0) {
      findfoodData = result.rows[0];
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

  res.render('vendor_ejs/update_food', { findfoodData });
});

router.patch(
  '/:id/update/:food_id',
  requirelogin,
  upload.single('image'),
  async (req, res) => {
    const { id, food_id } = req.params;
    const { name, price, ingredient, availability } = req.body;
    const { path, originalname } = req.file;
    let connection;
    try {
      connection = await OracleDB.getConnection(dbConfig);
      await connection.execute(
        'UPDATE food SET FOOD_NAME = :name, PRICE = :price, INGREDIENT = :ingredient, AVAILABILITY = :availability, ORIGINAL_PATH = :originalname, FOOD_PIC = :path WHERE FOOD_ID = :id',
        {
          name,
          price,
          ingredient,
          availability,
          originalname,
          path,
          id: food_id,
        },
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
    res.redirect(`/vendor/${id}`);
  }
);
///////////////////////////////vendor delete food/////////////////////////////

router.get('/:id/delete/:FOOD_ID', requirelogin, async (req, res) => {
  const { id, FOOD_ID } = req.params;
  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    await connection.execute(
      'DELETE FROM vendor_sells_food WHERE FOOD_ID=:FOOD_ID',
      [FOOD_ID],
      { autoCommit: true }
    );
    req.flash('delete_success', 'item successfully deleted');
    return res.redirect(`/vendor/${id}`);
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

/////////////////////for vendor email//////////////////////////
router.get('/:id/email', requirelogin, (req, res) => {
  res.render('vendor_ejs/email');
});

router.post('/:id/email', async (req, res) => {
  const { email_id, email_text } = req.body;

  const transporter = nodemailer.createTransport({
    host: process.env.Email_host,
    port: process.env.Email_port,
    secure: false,
    auth: {
      user: process.env.Email_username,
      pass: process.env.Email_password,
    },
    debug: true, // Enable debug output
    logger: true, // Log information in console
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.Email_username,
      to: email_id,
      subject: 'Forgot Password',
      text: `Your forget code is: ${uuid()} ${email_text}`,
    });

    console.log('Message sent: %s', info.messageId);
    req.flash('sendemail', 'Thank you, your email has been submitted to Admin');
    res.redirect(`/vendor/${req.params.id}`);
  } catch (error) {
    console.error(error);
    req.flash(
      'sendemail',
      'There was an error sending your email. Please try again.'
    );
    res.redirect(`/vendor/${req.params.id}`);
  }
});

//////////////////////////////////vendor profile////////////////////////////
router.get('/:id/profile', requirelogin, (req, res) => {
  res.render('vendor_ejs/vendor_profile');
});

//////////////////////////////////vendor logout/////////////////////////////
router.post('/:id/logout', requirelogin, (req, res) => {
  req.session.user_id = null;
  req.flash('logout', 'Successfully logged out');
  res.redirect('/home');
});
////////////////////////////////////////////////vendor qr-code///////////////////////
router.get('/:id/qr', requirelogin, (req, res) => {
  res.render('vendor_ejs/qr');
});

router.post('/:id/qr', requirelogin, (req, res) => {
  console.log(req.body);
  const qr_svg = qr.image(req.body.url);
  const outputPath = path.join(__dirname, 'qr.png');

  const writeStream = fs.createWriteStream(outputPath);
  qr_svg.pipe(writeStream);

  writeStream.on('finish', () => {
    cloudinary.uploader
      .upload(outputPath, { folder: 'qr-image' })
      .then((result) => {
        fs.unlinkSync(outputPath);
        console.log(result);
        res.redirect(`/vendor/${req.params.id}`);
      })
      .catch((error) => {
        fs.unlinkSync(outputPath);
        res.status(500).send(error.message);
      });
  });

  writeStream.on('error', (err) => {
    res.status(500).send(err.message);
  });
});
//////////////////////////////////////vendor review and reply/////////////////////////////
router.get('/:id/review', requirelogin, async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const reviewResult = await connection.execute(
      'select * from CUSTOMERREVIEWSVENDOR where V_ID = :id',
      { id: id }
    );
    const result = await connection.execute(
      'SELECT AVG(RATING) FROM CUSTOMERREVIEWSVENDOR WHERE V_ID = :id',
      { id: id }
    );
    const result2 = await connection.execute(
      'SELECT V.SHOP_DATA.V_FIRST_NAME AS V_FIRST_NAME,V.SHOP_DATA.V_LAST_NAME AS V_LAST_NAME,V.SHOP_DATA.STALL_NAME AS STALL_NAME FROM VENDORS V WHERE V_ID = :id',
      { id: id }
    );

    const reviews = reviewResult.rows;
    const avg_rating = result.rows[0]['AVG(RATING)'];
    const vendordata = result2.rows[0];

    console.log(reviews);
    res.render('vendor_ejs/vendor_reviews', {
      reviews,
      id,
      avg_rating,
      vendordata,
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

router.post('/:id/review', requirelogin, async (req, res) => {
  const { reply_msg, C_ID } = req.body;
  const V_ID = req.session.user_id; // Correctly accessing V_ID
  console.log(V_ID);
  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      'UPDATE CUSTOMERREVIEWSVENDOR SET REPLY = :reply_msg, V_REPLY_DATE = SYSTIMESTAMP WHERE C_ID = :C_ID AND V_ID = :V_ID',
      { reply_msg, C_ID, V_ID },
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
  req.flash('review', 'Review added successfully!');
  res.redirect(`/vendor/${V_ID}`);
});
router.patch('/:id/review', requirelogin, async (req, res) => {
  const { reply_msg, C_ID } = req.body;
  const V_ID = req.session.user_id; // Correctly accessing V_ID
  console.log(V_ID);
  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      'UPDATE CUSTOMERREVIEWSVENDOR SET REPLY = :reply_msg, V_REPLY_DATE = SYSTIMESTAMP WHERE C_ID = :C_ID AND V_ID = :V_ID',
      { reply_msg, C_ID, V_ID },
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
  req.flash('review', 'Review updated successfully!');
  res.redirect(`/vendor/${V_ID}`);
});

/////////////////////////////////export Router/////////////////////////////
module.exports = router;

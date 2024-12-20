const express = require('express');
const router = express.Router();
const qr = require('qr-image');
const path = require('path');
const fs = require('fs');

const { cloudinary } = require('./cloudinary');
const { requirelogin } = require('./requirelogin_middleware');
const { require_complete_reg } = require('./require_complete_reg');
const OracleDB = require('oracledb');
const multer = require('multer');
const { storage } = require('./cloudinary');
const upload = multer({ storage });
const dbConfig = require('./dbConfig');
const { v4: uuid } = require('uuid');
const nodemailer = require('nodemailer');
const { Console } = require('console');
const warning = require('./warning');
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
      `SELECT customer_reviews_food.c_id,
      FOOD_ID,
              food_review,
              food_rating,
              c_date,
              email,
              first_name || ' ' || last_name AS name
         FROM customer_reviews_food
         JOIN customers ON customer_reviews_food.c_id = customers.c_id
        WHERE food_id IN (SELECT food_id FROM vendor_sells_food WHERE v_id = :id)
     ORDER BY c_date DESC`,
      { id: id }
    );
    const topfood_result = await connection.execute(
      `SELECT * FROM food,vendor_sells_food  WHERE V_ID = :id AND food.food_id = vendor_sells_food.food_id ORDER BY rating desc FETCH FIRST 5 ROWS ONLY`,
      { id }
    );
    const top_food_data = topfood_result.rows;

    const result3 = await connection.execute('SELECT * FROM vendors');
    const result4 = await connection.execute(
      'select * from Food'
    );
    const result5 = await connection.execute(
      'SELECT distinct Category FROM Food'
    );
    const vendor = result3.rows; 
    const food = result4.rows;
    const category = result5.rows;

    foodData = foodResult.rows;
    reviews = reviewResult.rows;
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
      top_food_data,
      vendor,
      food,
      category,
    });
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
});

/////////////////////for vendor add food //////////////////////////
router.get(
  '/:id/add_food',
  requirelogin,
  require_complete_reg,
  async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
      connection = await OracleDB.getConnection(dbConfig);
      const result = await connection.execute(
        'SELECT * FROM Food,vendor_sells_food WHERE food.food_id = vendor_sells_food.food_id AND vendor_sells_food.v_id = :id',
        [id]
      );
      const FoodData = result.rows;
      console.log(FoodData);
      res.render('vendor_ejs/add_food', { id, FoodData });
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
  }
);
router.post(
  '/:id/add_food',
  requirelogin,
  require_complete_reg,warning,
  upload.single('image'),
  async (req, res) => {
    console.log(req.body);
    const {
      name,
      price,
      rating = 0,
      ingredient,
      availability,
      category,
    } = req.body;
    const { path, originalname } = req.file;
    const { id } = req.params;
    console.log(id);
    let connection;
    try {
      connection = await OracleDB.getConnection(dbConfig);

      // Get the current maximum FOOD_ID
      const result = await connection.execute(
        'SELECT MAX(FOOD_ID) AS FOOD_ID FROM vendor_sells_food'
      );

      const currentFoodId = result.rows[0].FOOD_ID || 'F_0';
      console.log(result.rows);
      console.log(currentFoodId);

      const currentNumber = parseInt(currentFoodId.split('_')[1]);
      const nextFoodId = `F_${currentNumber + 1}`;
      console.log('next', nextFoodId);

      await connection.execute(
        `INSERT INTO Food (food_name, price, rating, ingredient, availability, Food_pic, ORIGINAL_PATH, category)
       VALUES (:name, :price, :rating, :ingredient, :availability, :path, :originalname, :category)`,
        {
          name,
          price,
          rating,
          ingredient,
          availability,
          path,
          originalname,
          category,
        },
        { autoCommit: true }
      );

      // Link the new food item with the vendor in VENDOR_SELLS_FOOD table
      await connection.execute(
        `INSERT INTO VENDOR_SELLS_FOOD (V_ID, FOOD_ID)
       VALUES (:id, :nextFoodId)`,
        { id, nextFoodId: nextFoodId.toString() }, // Ensure it's treated as a string
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
router.get(
  '/:id/update/:food_id',
  requirelogin,
  require_complete_reg,
  async (req, res) => {
    const { food_id } = req.params;
    let findfoodData = null;
    let connection;
    try {
      connection = await OracleDB.getConnection(dbConfig);
      const result = await connection.execute(
        'SELECT FOOD_ID, FOOD_NAME, PRICE, INGREDIENT, AVAILABILITY, ORIGINAL_PATH, FOOD_PIC FROM food WHERE FOOD_ID = :id',
        [food_id]
      );
      const result7 = await connection.execute('SELECT * FROM vendors');
      const result8 = await connection.execute(
        'select * from Food'
      );
      const result9 = await connection.execute(
        'SELECT distinct Category FROM Food'
      );
      const vendor = result7.rows; 
      const food = result8.rows;
      const category = result9.rows;
      if (result.rows.length > 0) {
        findfoodData = result.rows[0];
      }
      res.render('vendor_ejs/update_food', { findfoodData ,vendor,food,category});
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

    
  }
);

router.patch(
  '/:id/update/:food_id',
  requirelogin,
  require_complete_reg,
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

router.get(
  '/:id/delete/:FOOD_ID',
  requirelogin,
  require_complete_reg,
  async (req, res) => {
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
  }
);

/////////////////////for vendor email//////////////////////////
router.get('/:id/email', requirelogin, require_complete_reg, (req, res) => {
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

//////////////////////////////////vendor logout/////////////////////////////
router.post('/:id/logout', requirelogin, (req, res) => {
  req.session.user_id = null;
  req.flash('logout', 'Successfully logged out');
  res.redirect('/home');
});
////////////////////////////////////////////////vendor qr-code///////////////////////
router.post('/:id/qr', requirelogin, require_complete_reg, async (req, res) => {
  try {
    if (!req.body.url) {
      return res.status(400).send('URL is required');
    }

    const qr_svg = qr.image(req.body.url);
    const outputPath = path.join(__dirname, 'qr.png');
    const writeStream = fs.createWriteStream(outputPath);

    qr_svg.pipe(writeStream);

    writeStream.on('finish', async () => {
      try {
        const result = await cloudinary.uploader.upload(outputPath, {
          folder: 'qr-image',
        });
        fs.unlinkSync(outputPath);

        let connection;
        try {
          connection = await OracleDB.getConnection(dbConfig);
          await connection.execute(
            'UPDATE VENDORS v SET v.shop_data.Qr_code = :url WHERE V_ID = :id',
            { url: result.secure_url, id: req.params.id },
            { autoCommit: true }
          );
          console.log('Database updated successfully');
        } catch (err) {
          console.error('Database error:', err);
          return res.status(500).send('Database error');
        } finally {
          if (connection) {
            try {
              await connection.close();
            } catch (err) {
              console.error('Error closing connection:', err);
            }
          }
        }

        res.redirect(`/vendor/${req.params.id}`);
      } catch (error) {
        fs.unlinkSync(outputPath);
        console.error('Cloudinary upload error:', error);
        res.status(500).send('Cloudinary upload error');
      }
    });

    writeStream.on('error', (err) => {
      console.error('Write stream error:', err);
      res.status(500).send('Error creating QR code');
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).send('Unexpected server error');
  }
});

//////////////////////////////////////vendor review and reply/////////////////////////////
router.get(
  '/:id/review',
  requirelogin,
  require_complete_reg,
  async (req, res) => {
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
  }
);

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
router.patch(
  '/:id/review',
  requirelogin,
  require_complete_reg,
  async (req, res) => {
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
  }
);
/////////////////////////////vendor prfile/////////////////////////////
router.get(
  '/:id/profile',
  requirelogin,
  require_complete_reg,
  async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
      connection = await OracleDB.getConnection(dbConfig);
      const result = await connection.execute(
        'SELECT * FROM VENDORS WHERE V_ID = :id',
        { id }
      );
      const result2 = await connection.execute(
        'SELECT * FROM food,vendor_sells_food  WHERE V_ID = :id AND food.food_id = vendor_sells_food.food_id ORDER BY rating desc FETCH FIRST 3 ROWS ONLY',
        { id }
      );
      const vendordata = result.rows[0];
      console.log(result2.rows);
      console.log(vendordata);
      res.render('vendor_ejs/vendor_profile', {
        vendordata,
        foodData: result2.rows,
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
  }
);
///////////////////////////////vendor edit profile/////////////////////////////
router.get('/:id/edit_profile', requirelogin, async (req, res) => {
  const id = req.params.id;
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await OracleDB.getConnection(dbConfig);
    console.log('Connected to database.');

    console.log('Executing query...');
    const result = await connection.execute(
      'SELECT * FROM VENDORS WHERE V_ID = :id',
      { id }
    );
    console.log('Query executed.');

    if (result.rows.length === 0) {
      console.log('No vendor found with the given ID.');
      return res.status(404).send('Vendor not found');
    }

    const vendordata = result.rows[0];
    console.log('Vendor Data:', vendordata);

    res.render('vendor_ejs/edit_profile', { vendordata });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('Database connection closed.');
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

router.post(
  '/:id/edit_profile',
  upload.fields([
    { name: 'PROFILE_PIC', maxCount: 1 },
    { name: 'STALL_PIC', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Validate required files
      if (!req.files['PROFILE_PIC'] || !req.files['STALL_PIC']) {
        return res
          .status(400)
          .send('Profile picture and stall picture are required.');
      }

      const profilePic = req.files['PROFILE_PIC'][0].path;
      const stallPic = req.files['STALL_PIC'][0].path;
      const {
        V_FIRST_NAME,
        V_LAST_NAME,
        STALL_NAME,
        STALL_TITLE,
        SHOP_DESCRIPTION,
        AREA,
        CITY,
        DISTRICT,
        LOCATION_URL,
        PHONE,
        openingTime,
        closingTime,
      } = req.body;
      req.session.FIRST_NAME = V_FIRST_NAME;
      const status = 'open';
      const hygiene_rating = 5;
      const Working_Hours = openingTime + ' - ' + closingTime;
      const { id } = req.params;
      console.log('id', id);
      console.log('Request body:', req.body);
      console.log(profilePic, stallPic);
      console.log(
        V_FIRST_NAME,
        V_LAST_NAME,
        STALL_NAME,
        SHOP_DESCRIPTION,
        AREA,
        CITY,
        DISTRICT,
        LOCATION_URL,
        PHONE
      );

      let connection;

      try {
        connection = await OracleDB.getConnection(dbConfig);
        console.log('Database connection established.');

        // Make sure AREA is not null
        if (!AREA) {
          return res.status(400).send('Area cannot be null.');
        }

        await connection.execute(
          `UPDATE VENDORS V 
      SET V.SHOP_DATA = SYSTEM.SHOP_INFO_TYPE(
          :STALL_NAME, 
          :V_FIRST_NAME, 
          :V_LAST_NAME, 
          :AREA,
          :CITY, 
          :DISTRICT, 
          :STALL_TITLE, 
          :stallPic, 
          :LOCATION_URL, 
          :status, 
          :SHOP_DESCRIPTION,
          :Working_Hours ,
        :hygiene_rating ,
        :qrcode 
          
      ), 
      V.PHONE = :PHONE, 
      V.PROFILE_PIC = :profilePic 
      WHERE V_ID = :id`,
          {
            STALL_NAME,
            V_FIRST_NAME,
            V_LAST_NAME,
            AREA,
            CITY,
            DISTRICT,
            STALL_TITLE,
            stallPic,
            LOCATION_URL,
            status,
            SHOP_DESCRIPTION,

            PHONE,
            profilePic,
            Working_Hours,
            hygiene_rating,
            qrcode: null,
            id,
          },
          { autoCommit: true }
        );

        res.redirect(`/vendor/${id}/profile`);
      } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Server Error');
      } finally {
        if (connection) {
          try {
            await connection.close();
            console.log('Database connection closed.');
          } catch (err) {
            console.error('Error closing connection:', err);
          }
        }
      }
    } catch (error) {
      console.error('Error in POST /:id/edit_profile:', error);
      res.status(500).send('Server Error');
    }
  }
);

///////////////////////////////Video_list/////////////////////////////
router.get(
  '/:id/Video_list',
  requirelogin,
  require_complete_reg,
  async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
      connection = await OracleDB.getConnection(dbConfig);
      const result = await connection.execute(
        'SELECT DISTINCT * FROM uploaded_videos p,user_promotes_vendor v,customers c WHERE p.video_id = v.video_id AND v.v_id = :id AND  p.c_id = c.c_id',
        { id }
      );
      const result2 = await connection.execute('SELECT * FROM customers ');
      const customerData = result2.rows;

      const videoData = result.rows;
      console.log('customer id', videoData);
      res.render('vendor_ejs/video_list', { videoData, id, customerData });
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
  }
);
////////////////////////////////////vendor dashboard/////////////////////////////
router.get(
  '/:id/dashboard',
  requirelogin,
  require_complete_reg,
  async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
      connection = await OracleDB.getConnection(dbConfig);
      const result = await connection.execute(
        'SELECT count(Food_id) as Foodcount FROM vendor_sells_food WHERE V_ID = :id',
        { id }
      );
      const result2 = await connection.execute(
        'SELECT count(c_id) as vendorReviewcount FROM customerreviewsvendor WHERE V_ID = :id',
        { id }
      );
      const result3 = await connection.execute(
        'SELECT count(c_id) as FoodReviewcount FROM customer_reviews_food, vendor_sells_food WHERE vendor_sells_food.V_ID = :id and vendor_sells_food.food_id = customer_reviews_food.food_id',
        { id }
      );
      const result4 = await connection.execute(
        'SELECT v.shop_data.Hygiene_rating as Hygiene_rating FROM vendors v WHERE V_ID = :id',
        { id }
      );
      const result5 = await connection.execute(
        'SELECT avg(rating) as rating FROM customerreviewsvendor WHERE V_ID = :id',
        { id }
      );
      const result6 = await connection.execute(
        'SELECT avg(food_rating) as food_rating FROM customer_reviews_food, vendor_sells_food WHERE vendor_sells_food.V_ID = :id and vendor_sells_food.food_id = customer_reviews_food.food_id',
        { id }
      );
      const result7 = await connection.execute(
        'SELECT * FROM vendors WHERE V_ID = :id',
        { id }
      );
      const vendordata = result7.rows[0];

      const Hyginene_rating = result4.rows[0]?.HYGIENE_RATING ?? 0;
      console.log(Hyginene_rating);
      const vendor_rating = result5.rows[0]?.RATING ?? 0;
      console.log(vendor_rating);
      const food_rating = result6.rows[0]?.FOOD_RATING ?? 0;
      console.log(food_rating);
      const avg_rating = (
        (vendor_rating + food_rating + Hyginene_rating) /
        3
      ).toFixed(1);

      const FoodReviewcount = result3.rows[0]?.FOODREVIEWCOUNT ?? 0;
      console.log(FoodReviewcount);

      const vendorReviewcount = result2.rows[0]?.VENDORREVIEWCOUNT ?? 0;
      console.log(vendorReviewcount);

      const Foodcount = result.rows[0]?.FOODCOUNT ?? 0;
      console.log(Foodcount);

      const totalReview = FoodReviewcount + vendorReviewcount;
      console.log(totalReview);

      res.render('vendor_ejs/dashboard', {
        Foodcount,
        totalReview,
        avg_rating,
        Hyginene_rating,
        vendor_rating,
        food_rating,
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
  }
);
////////////////////////////////serach/////////////////////////////
router.get(
  '/:id/search',
  requirelogin,
  require_complete_reg,
  async (req, res) => {
    const search_key=req.query.search_key;
    const option = req.query.option;
    let connection;
    try {
      connection = await OracleDB.getConnection(dbConfig);
      if(option==='food')
      {
        const result = await connection.execute(
          `SELECT * FROM food where  food_name LIKE '%${search_key}%' `,
          
        );
      }
   
      const foodData = result.rows;
      res.render('vendor_ejs/search', { foodData});
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

  }
);
/////////////////////////////// review food/////////////////////////////
router.get(
  '/:id/review_food',
  requirelogin,
  require_complete_reg,
  async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
      connection = await OracleDB.getConnection(dbConfig);
      const result = await connection.execute(
        'SELECT * FROM VENDOR_CUSTOMER_REVIEWS_VIEW  WHERE V_ID = :id AND food.food_id = vendor_sells_food.food_id ORDER BY rating desc',
        { id }
      );
      const foodData = result.rows;
      res.render('vendor_ejs/review_food', { foodData, id });
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
  }
);

/////////////////////////////////export Router/////////////////////////////
module.exports = router;

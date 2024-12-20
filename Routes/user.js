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
const {require_complete_user_reg} = require('./require_complete_reg');
const e = require('connect-flash');

let videos = [];
let vendor = [];
let shoplocation = [];
/////////////////user profile////////////////////////
router.get('/:id/profile', requireloginuser, async (req, res) => {
  const id = req.session.user_id;
  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      'SELECT * FROM CUSTOMERS WHERE C_ID = :id',
      { id }
    );
    const userdata = result.rows[0];
    console.log(userdata);
    res.render('blogger/profile', { userdata });
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
////////////////////////edit profile////////////////////////
router.get('/:id/edit_profile', requireloginuser, async (req, res) => {
  const id = req.params.id;
  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      'SELECT * FROM CUSTOMERS WHERE C_ID = :id',
      { id }
    );
    const userdata = result.rows[0];
    console.log(userdata);
    res.render('blogger/edit_profile', { userdata });
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
//////////////////////////update profile////////////////////////
router.post('/:id/edit_profile', upload.single('profileImage'), async (req, res) => {
  const id = req.params.id;
  const { FIRST_NAME, LAST_NAME, PHONE } = req.body;
  req.session.FIRST_NAME = FIRST_NAME;
  const profile_pic= req.file.path;
  let connection;

  try {
    // Prepare Cloudinary URL for the image
   

    // Connect to OracleDB and update profile details
    connection = await OracleDB.getConnection(dbConfig);
    connection.execute(
      `UPDATE CUSTOMERS 
       SET FIRST_NAME = :FIRST_NAME, LAST_NAME = :LAST_NAME, PHONE = :PHONE, PROFILE_PICture = :profile_pic
       WHERE C_ID = :id`,
      { FIRST_NAME, LAST_NAME, PHONE, id, profile_pic },
      { autoCommit: true }
    );
 
 

    req.flash('update_profile', 'Profile updated successfully!');
    res.redirect(`/user/${id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_update_profile', 'An error occurred during profile update');
    res.redirect(`/user/${id}/edit_profile`);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
        req.flash('error_update_profile', 'An error occurred during profile update');
        res.redirect(`/user/${id}/edit_profile`);
      }
    }
  }
});

router.get('/nearbyshop', (req, res) => {
  res.render('blogger/map');
});

router.get('/data', (req, res) => {
  const shopdata = shoplocation;
  res.json(shopdata);
});
////////////////////////////DETAILS////////////////////////
router.get('/details_food', async (req, res) => {
  const FOOD_ID = req.query.FOOD_ID;
  console.log('Food ID:', FOOD_ID);

  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const review_reply = await connection.execute(
      `SELECT 
        CUSTOMER_REVIEWS_FOOD.C_ID AS REVIEW_C_ID,
        CUSTOMER_REVIEWS_FOOD.FOOD_ID,
        CUSTOMER_REVIEWS_FOOD.C_DATE,
        CUSTOMER_REVIEWS_FOOD.V_REPLY,
        CUSTOMER_REVIEWS_FOOD.V_REPLY_DATE,
        CUSTOMER_REVIEWS_FOOD.FOOD_REVIEW,
        CUSTOMER_REVIEWS_FOOD.FOOD_RATING,
        CUSTOMERS.EMAIL 
      FROM 
        CUSTOMER_REVIEWS_FOOD, CUSTOMERS 
      WHERE 
        CUSTOMER_REVIEWS_FOOD.FOOD_ID = :FOOD_ID 
        AND CUSTOMER_REVIEWS_FOOD.C_ID = CUSTOMERS.C_ID`,
      { FOOD_ID }
    );
    const userHasReviewed = review_reply.rows.some(
      (row) => row.REVIEW_C_ID == req.session.user_id
    );
    let review_reply_data;
    if (review_reply.rows.length === 0) {
      review_reply_data = 'No reviews found for this food item';
    } else {
      review_reply_data = review_reply.rows;

      console.log('Review reply data:', review_reply_data);
    }

    const result = await connection.execute(
      'SELECT * FROM FOOD WHERE FOOD_ID = :FOOD_ID',
      { FOOD_ID }
    );
    const FOOD_DATA = result.rows[0];
    let INGREDIENT = [];
    let string = '';
    for (let i = 0; i < FOOD_DATA.INGREDIENT.length; i++) {
      string += FOOD_DATA.INGREDIENT[i];

      if (
        FOOD_DATA.INGREDIENT[i + 1] === ',' ||
        i === FOOD_DATA.INGREDIENT.length - 1
      ) {
        INGREDIENT.push(string.trim());
        string = '';
        i++;
      }
    }
    console.log('userHasReviewed: ', userHasReviewed);
    console.log(INGREDIENT);
    console.log(FOOD_DATA);
    const c_id = req.session.user_id;
    res.render('blogger/details_food', {
      FOOD_DATA,
      INGREDIENT,
      EMAIL: req.session.email,
      review_reply_data,
      userHasReviewed,
      c_id,
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
///////////////////////////////upload video///////////////////////////
router.get('/:id/upload_video', requireloginuser,require_complete_user_reg, async (req, res) => {
  const response = req.query.response;
  const FIRST_NAME = req.session.FIRST_NAME;
  const id = req.params.id;
  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      'SELECT video_id,VIDEO_TITLE, VIDEO_DESCRIPTION, TAGS,VIDEO_LINKS ,IMAGE_LINKS,upload_date FROM UPLOADED_VIDEOS WHERE C_ID = :id',
      { id }
    );

    const result2 = await connection.execute(
      'SELECT V_ID, ROUND(AVG(rating), 1) AS avg_rating FROM CUSTOMERREVIEWSVENDOR GROUP BY V_ID order by V_ID'
    );

    const avgRatings = result2.rows;
    console.log(avgRatings);
    const recentVideos = result.rows;
    console.log('new vebn', vendor);
    if (response === 'json') {
      return res.json(recentVideos);
    }
    res.render('blogger/upload_videos', {
      vendor,
      recentVideos,
      FIRST_NAME,
      avgRatings,
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

router.post(
  '/:id/upload_video',
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  async (req, res) => {
    const C_ID = req.params.id;
    const { VIDEO_TITLE, VIDEO_DESCRIPTION, TAGS, V_ID } = req.body;
    const video_id = uuid();
    const { originalname: videoName, path: videoPath } = req.files['video'][0];
    const { originalname: imageName, path: imagePath } = req.files['image'][0];

    console.log('Request Body:', {
      C_ID,
      VIDEO_TITLE,
      VIDEO_DESCRIPTION,
      TAGS,
      V_ID,
      videoName,
      imageName,
    });

    console.log('v_id from prevent', V_ID);
    let connection;

    try {
      connection = await OracleDB.getConnection(dbConfig);
      
      // Check for promotion prevention message
      const result2 = await connection.execute(
        `SELECT c.complaint_details.message AS message 
         FROM customerreviewsvendor c 
         WHERE V_id = :V_ID`, 
        [V_ID]
      );
      const action = result2.rows;
      console.log('Action:', action);

      // If promotion is restricted, check for restriction dates
      if (action.length > 0 && (action[0].MESSAGE === 'Prevent Promotion (2 Days)' || action[0].MESSAGE === 'Prevent Promotion (1 Day)')) {
        const result3 = await connection.execute(
          `SELECT restriction_start_date AS start_date, 
                  restriction_end_date AS end_date 
           FROM vendors
           WHERE V_id = :V_ID`,
          [V_ID]
        );

        if (result3.rows.length > 0) {
          const start_date = new Date(result3.rows[0].START_DATE);
          const end_date = new Date(result3.rows[0].END_DATE);
          const current_date = new Date();

          // Check if the current date falls within the restriction period
          if (current_date >= start_date && current_date <= end_date) {
            console.log('Vendor promotion is restricted');
            req.flash('error_res', 'You aren\'t allowed to promote this Vendor at this Moment.');
            return res.redirect(`/user/${C_ID}`); // Redirect vendor with a warning
          }
        }
      }

      // If no restriction, proceed with video and vendor promotion
      await connection.execute(
        `INSERT INTO UPLOADED_VIDEOS (video_id, C_ID, VIDEO_TITLE, VIDEO_DESCRIPTION, TAGS, VIDEO_LINKS, IMAGE_LINKS) 
         VALUES (:video_id, :C_ID, :VIDEO_TITLE, :VIDEO_DESCRIPTION, :TAGS, :videoPath, :imagePath)`,
        {
          video_id,
          C_ID,
          VIDEO_TITLE,
          VIDEO_DESCRIPTION,
          TAGS,
          videoPath,
          imagePath,
        },
        { autoCommit: true }
      );

      await connection.execute(
        `INSERT INTO USER_PROMOTES_VENDOR (V_ID, VIDEO_ID) 
         VALUES (:V_ID, :video_id)`,
        { V_ID, video_id },
        { autoCommit: true }
      );

      // Success message
      req.flash('upload_video', 'Video and image uploaded successfully!');
      res.redirect(`/user/${C_ID}`);
    } catch (err) {
      console.error(err);
      req.flash('error_upload_video', 'An error occurred during uploading, please try again');
      return res.redirect(`/user/${C_ID}`);
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
router.post('/:id/navbar', (req, res) => {
  req.session.mode = req.body.mode;
  console.log(req.body.mode);
  res.redirect(`/user/${req.params.id}`);
});
/////////////////////logout/////////////////////
router.post('/:id/logout', requireloginuser, (req, res) => {
  req.session.user_id = null;
  req.flash('logout', 'Successfully logged out');
  res.redirect('/home');
});
//////////////////view user home page///////////////////

router.get('/:id', requireloginuser, async (req, res) => {
  let connection;

  const { id } = req.params;
  console.log(id);

  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      'SELECT V_ID, phone, V.SHOP_DATA AS SHOP_DATA FROM vendors V ORDER BY V_ID'
    );
    const bloggerVideoResult = await connection.execute(
      'SELECT video_id, VIDEO_TITLE, VIDEO_DESCRIPTION, TAGS, VIDEO_LINKS FROM UPLOADED_VIDEOS WHERE C_ID = :id',
      { id }
    );
    const result2 = await connection.execute(
      'SELECT V.SHOP_DATA AS SHOP_DATA, video_id,v.v_id  as V_ID FROM vendorS V, USER_PROMOTES_VENDOR WHERE V.V_ID = USER_PROMOTES_VENDOR.V_ID AND USER_PROMOTES_VENDOR.V_ID IN (SELECT V_ID FROM USER_PROMOTES_VENDOR WHERE VIDEO_ID IN (SELECT VIDEO_ID FROM UPLOADED_VIDEOS WHERE C_ID IN (:id)))',
      { id }
    );
    const result3 = await connection.execute('SELECT * FROM vendors');
    const result4 = await connection.execute(
      'select * from Food'
    );
    const result5 = await connection.execute(
      'SELECT distinct Category FROM Food'
    );
    const vendors = result3.rows; 
    const food = result4.rows;
    const category = result5.rows;



    const vendordata = result2.rows;
    console.log('the vendordata res is', vendordata);
    console.log('the video result is:', bloggerVideoResult.rows);

    const videos = bloggerVideoResult.rows;
    vendor = result.rows;
    console.log('the vendor res is:', vendor);

    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = 6;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedItems = videos.slice(startIndex, endIndex);
    const totalPages = Math.ceil(videos.length / itemsPerPage);

    res.render('blogger/blogger', {
      displayedItems,
      totalPages,
      currentPage,
      videos,
      vendordata,
      vendor,
      food,
      category,
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

////////////////////view available shop//////////////////////////////
router.get('/:id/shop', requireloginuser, async (req, res) => {
  const response = req.query.response;
  if (response === 'json') {
    return res.json(shoplocation);
  } else {
    return res.render('blogger/available_shop', { shoplocation });
  }
});
/////////review shop/////////////////////

router.get('/:id/review',requireloginuser,require_complete_user_reg, async (req, res) => {
  const email = req.session.email;
  const FIRST_NAME = req.session.FIRST_NAME;
  const V_ID = req.query.vendor;
  const cust_id = req.params.id;
  let connection;
  let reviewddata = [];

  console.log('Vendor ID:', V_ID);
  console.log('Customer ID:', cust_id);

  try {
    connection = await OracleDB.getConnection(dbConfig);

    // Fetch customer reviews
    const result = await connection.execute(
      `SELECT 
         C_ID, C_DATE, rating, REVIEW_MESSAGE, reply, 
         C_NAME, V_NAME, V_REPLY_DATE, C_EMAIL 
       FROM CUSTOMERREVIEWSVENDOR 
       WHERE V_ID = :V_ID 
       ORDER BY C_DATE DESC`,
      { V_ID }
    );
    reviewddata = result.rows;

    // Check if customer has already reviewed this vendor
    const reviewed = result.rows.some((row) => row.C_ID === cust_id);

    // Fetch vendor details
    const result3 = await connection.execute(
      'SELECT V.SHOP_DATA AS SHOP_DATA FROM VENDORS V WHERE V_ID = :V_ID',
      { V_ID }
    );

    if (result3.rows.length === 0) {
      console.log('No vendor found with the provided ID.');
      return res.status(404).send('Vendor not found');
    }

    const stall_name = result3.rows[0].SHOP_DATA.STALL_NAME;

    if (reviewed) {
      // Fetch average rating
      const result2 = await connection.execute(
        'SELECT ROUND(AVG(rating), 1) AS avg_rating FROM CUSTOMERREVIEWSVENDOR WHERE V_ID = :V_ID',
        { V_ID }
      );

      const avg_rating = result2.rows[0].AVG_RATING;

      return res.render('blogger/already_review', {
        reviewddata,
        FIRST_NAME,
        avg_rating,
        stall_name,
      });
    } else {
      return res.render('blogger/user_review', {
        reviewddata,
        email,
        FIRST_NAME,
        V_ID,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
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
///////////////////////////post shop review////////////////////////
router.post('/:id/review', async (req, res) => {
  const { rating, message, V_ID } = req.body;
  const C_ID = req.params.id;
 
  const FIRST_NAME = req.session.FIRST_NAME;

  const C_EMAIL = req.session.email;
  console.log(req.body);
  console.log('Vendor ID:', V_ID);
  console.log('Customer ID:', C_ID);
  console.log('Customer Email:', C_EMAIL);
  console.log('Customer Name:', FIRST_NAME);

  
  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT * FROM vendors  WHERE V_ID = :V_ID `,
      { V_ID }
    );
 
    const V_NAME = result.rows[0].SHOP_DATA.V_FIRST_NAME+' '+result.rows[0].SHOP_DATA.V_LAST_NAME;
    await connection.execute(
      'INSERT INTO CUSTOMERREVIEWSVENDOR (C_ID, V_ID, RATING,REVIEW_MESSAGE,C_NAME,V_NAME,C_EMAIL) VALUES (:C_ID, :V_ID, :rating,:message,:FIRST_NAME,:V_NAME,:C_EMAIL)',
      {
        C_ID,
        V_ID,
        rating,
        message,
        FIRST_NAME,
        V_NAME,
        C_EMAIL,
      },
      { autoCommit: true }
    );

    req.flash('review', 'Review submitted successfully!');
    return res.redirect(`/user/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_review', 'An error occurred during review submission');
    return res.redirect(`/user/${req.params.id}`);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
        req.flash('error_review', 'An error occurred during review submission');
        return res.redirect(`/user/${req.params.id}`);
      }
    }
  }
});
//////////////////////////complaint////////////////////////
router.get('/:id/complaint', requireloginuser, require_complete_user_reg, async (req, res) => {
  const email = req.session.email;
  const FIRST_NAME = req.session.FIRST_NAME;
  const V_ID = req.query.V_ID;
  const cust_id = req.params.id;
  const Request = req.query.request;
  let connection;
  let complaintdata = [];

  console.log('Vendor ID:', V_ID);
  console.log('Customer ID:', cust_id);
  console.log('Request:', Request);

  try {
    connection = await OracleDB.getConnection(dbConfig);
    console.log('Database connection established');

    // Fetch customer complaints
    const result = await connection.execute(
      `SELECT 
         C_ID, C_DATE,  c.COMPLAINT_DETAILS AS COMPLAINT, 
         C_NAME, V_NAME, C_EMAIL 
       FROM CUSTOMERREVIEWSVENDOR c
       WHERE V_ID = :V_ID AND C_ID = :cust_id
       ORDER BY C_DATE DESC`,
      { V_ID, cust_id }
    );

    complaintdata = result.rows;
    console.log('Complaint data:', complaintdata);

    if (Request === 'json') {
      return res.json(complaintdata);
    }

    // Fetch vendor details
    const result2 = await connection.execute(
      'SELECT V_ID, V.SHOP_DATA AS SHOP_DATA FROM VENDORS V WHERE V_ID = :V_ID',
      { V_ID }
    );

    if (result2.rows.length === 0) {
      console.log('No vendor found with the provided ID.');
      return res.status(404).send('Vendor not found');
    }

    const specificVendorId = result2.rows[0];

    // Check if customer has already complained about this vendor
    const complained = complaintdata.some(
      (row) => row.COMPLAINT !== null && row.COMPLAINT !== undefined
    );

    if (complained) {
      return res.render('blogger/already_complained', {
        complaintdata,
        FIRST_NAME,
        vendor: result2.rows,
        specificVendorId,
      });
    } else {
      return res.render('blogger/user_complaint', {
        complaintdata,
        email,
        FIRST_NAME,
        V_ID,
        vendor: result2.rows,
        specificVendorId,
      });
    }
  } catch (err) {
    console.error('Error occurred:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

///////////////////complaint post////////////////////////
router.post('/:id/complaint', async (req, res) => {
  const { complaint, V_ID, subject } = req.body;
  const C_ID = req.params.id; // Use req.params.id instead of req.query.id
  const FIRST_NAME = req.session.FIRST_NAME;

  const C_EMAIL = req.session.email;
  console.log(req.body);

  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result3 = await connection.execute(
      `SELECT * FROM vendors V WHERE V_ID = :V_ID `,
      { V_ID }
    );
    const V_NAME = result3.rows[0].SHOP_DATA.V_FIRST_NAME+' '+result3.rows[0].SHOP_DATA.V_LAST_NAME;
    const result2 = await connection.execute(
      'SELECT * FROM CUSTOMERREVIEWSVENDOR WHERE V_ID = :V_ID AND C_ID = :C_ID',
      { V_ID, C_ID }
    );
    console.log('Result:', result2.rows);

    if (result2.rows.length > 0) {
      const result = await connection.execute(
        `UPDATE CUSTOMERREVIEWSVENDOR SET COMPLAINT_DETAILS = COMPLAINTS(SYSTIMESTAMP, :complaint, NULL, :subject, NULL, 'Pending') WHERE V_ID = :V_ID AND C_ID = :C_ID`,
        { complaint, subject, V_ID, C_ID },
        { autoCommit: true }
      );
    } else {
      const result = await connection.execute(
        `INSERT INTO CUSTOMERREVIEWSVENDOR (C_ID, V_ID, COMPLAINT_DETAILS, C_NAME, V_NAME, C_EMAIL) VALUES (:C_ID, :V_ID, COMPLAINTS(SYSTIMESTAMP, :complaint, NULL, :subject, NULL, 'Pending'), :FIRST_NAME, :V_NAME, :C_EMAIL)`,
        {
          C_ID,
          V_ID,
          complaint,
          subject,
          FIRST_NAME,
          V_NAME,
          C_EMAIL,
        },
        { autoCommit: true }
      );
    }

    req.flash('success_comment', 'Complaint submitted successfully!');
    return res.redirect(`/user/${C_ID}`);
  } catch (err) {
    console.error('Error updating complaint:', err);
    req.flash('comment_error', 'An error occurred during complaint submission');
    return res.redirect(`/user/${C_ID}`);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
        req.flash(
          'comment_error',
          'An error occurred during complaint submission'
        );
        return res.redirect(`/user/${C_ID}`);
      }
    }
  }
});

/////////////////////////////food review post////////////////////////
router.post('/food_review', requireloginuser, async (req, res) => {
  const { FOOD_RATING, FOOD_REVIEW, FOOD_ID } = req.body;
  const C_ID = req.session.user_id;

  console.log(req.body);
  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    await connection.execute(
      'INSERT INTO CUSTOMER_REVIEWS_FOOD (C_ID, FOOD_ID, FOOD_RATING,FOOD_REVIEW,C_DATE) VALUES (:C_ID, :FOOD_ID, :FOOD_RATING,:FOOD_REVIEW,SYSTIMESTAMP)',
      {
        C_ID,
        FOOD_ID,
        FOOD_RATING,
        FOOD_REVIEW,
      },
      { autoCommit: true }
    );
    await connection.execute(
      `UPDATE food 
       SET rating = (
         SELECT AVG(food_rating) 
         FROM customer_reviews_food 
         WHERE food_id = :FOOD_ID
       ) 
       WHERE food_id = :FOOD_ID`,
      { FOOD_ID, FOOD_ID }, // Assuming `food_id` is your variable
      { autoCommit: true }
    );
    const result = await connection.execute(
      'SELECT v.shop_data.hygiene_rating as hygiene_rating,v.V_id as v_id FROM vendors v,WHERE v.v_id= (SELECT v_id FROM vendor_sells_food WHERE food_id = :FOOD_ID)',
      { FOOD_ID }
    );
    const hygiene_rating = result.rows[0].HYGIENE_RATING;
    const V_ID = result.rows[0].V_ID;
    await connection.execute(
      'select AVG(rating) as avg_food_rating from food where food_id in (select food_id from vendor_sells_food where v_id = :V_ID)',
      { V_ID }
    );
    const avg_food_rating = result.rows[0].AVG_FOOD_RATING;
    const avg_rating = ((avg_food_rating + hygiene_rating) / 2).toFixed(1);

   const result2= await connection.execute(
      `UPDATE vendors 
       SET avg_rating = :avg_rating 
       WHERE v_id = :V_ID`,
      { avg_rating, V_ID },
      { autoCommit: true }
    );
    console.log(result2);



    req.flash('review', 'Review submitted successfully!');
    return res.redirect(`/user/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_review', 'An error occurred during review submission');
    return res.redirect(`/user/${req.params.id}`);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
        req.flash('error_review', 'An error occurred during review submission');
        return res.redirect(`/user/${req.params.id}`);
      }
    }
  }
});
//////////////////////////////update food review////////////////////////
router.post('/:id/edit_review', async (req, res) => {
  const { FOOD_RATING, FOOD_REVIEW } = req.body;
  console.log('review body', req.body);
  const FOOD_ID = req.query.FOOD_ID;
  const C_ID = req.session.user_id;

  console.log(req.body);
  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    await connection.execute(
      `UPDATE CUSTOMER_REVIEWS_FOOD
       SET FOOD_RATING = :FOOD_RATING, FOOD_REVIEW = :FOOD_REVIEW
       WHERE C_ID = :C_ID AND FOOD_ID = :FOOD_ID`,
      { C_ID, FOOD_ID, FOOD_RATING, FOOD_REVIEW },
      { autoCommit: true }
    );
    await connection.execute(
      `UPDATE food 
       SET rating = (
         SELECT AVG(food_rating) 
         FROM customer_reviews_food 
         WHERE food_id = :FOOD_ID
       ) 
       WHERE food_id = :FOOD_ID`,
      { FOOD_ID, FOOD_ID }, // Assuming `food_id` is your variable
      { autoCommit: true }
    );

    req.flash('review', 'Review updated successfully!');
    return res.redirect(`/user/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_review', 'An error occurred during review update');
    return res.redirect(`/user/${req.params.id}`);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
        req.flash('error_review', 'An error occurred during review update');
        return res.redirect(`/user/${req.params.id}`);
      }
    }
  }
});

//////////////////////////customer food review////////////////////////
router.get('/:id/food_review', requireloginuser, require_complete_user_reg, async (req, res) => {
  const email = req.session.email;
  const FIRST_NAME = req.session.FIRST_NAME;
  const FOOD_ID = req.query.FOOD_ID;
  const cust_id = req.params.id;
  let connection;
  let reviewddata = [];

  console.log('Food ID:', FOOD_ID);
  console.log('Customer ID:', cust_id);

  try {
    connection = await OracleDB.getConnection(dbConfig);

    // Fetch customer reviews
    const result = await connection.execute(
      `SELECT 
         * FROM CUSTOMER_FOOD_REVIEWS_VIEW 
       WHERE c_id = :cust_id 
       ORDER BY C_DATE DESC`,
      { cust_id }
    );
    reviewddata = result.rows;

    // Check if customer has already reviewed this food item
    const reviewed = result.rows.some((row) => row.C_ID === cust_id);

    // Fetch food details
    const result3 = await connection.execute(
      'SELECT * FROM FOOD WHERE FOOD_ID = :FOOD_ID',
      { FOOD_ID }
    );

    if (result3.rows.length === 0) {
      console.log('No food item found with the provided ID.');
      return res.status(404).send('Food item not found');
    }

    const food_name = result3.rows[0].FOOD_NAME;

    if (reviewed) {
      return res.render('blogger/already_review_food', {
        reviewddata,
        FIRST_NAME,
        food_name,
      });
    } else {
      return res.render('blogger/user_review_food', {
        reviewddata,
        email,
        FIRST_NAME,
        FOOD_ID,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
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

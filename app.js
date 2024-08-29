if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const os = require('os');
const OracleDB = require('oracledb');
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const nodemailer = require('nodemailer');
const { v4: uuid } = require('uuid');

const vendor = require('./Routes/vendor');
const user = require('./Routes/user');
const { nextTick } = require('process');
const requirelogin = require('./Routes/requirelogin_middleware');
const dbConfig = require('./Routes/dbConfig');
const multer = require('multer');
const { storage } = require('./Routes/cloudinary');
const upload = multer({ storage });
const require_email = require('./Routes/require_email.js');
const sendOtpEmail = require('./Routes/email.js');
const admin = require('./Routes/admin');
const { PASSWORD_RESET_REQUEST_TEMPLATE } = require('./Routes/EmailTemp.js');
const { VERIFICATION_EMAIL_TEMPLATE } = require('./Routes/EmailTemp.js');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public', 'ejs'));
app.set('view engine', 'ejs');
var mode = 'light';
const sessionConfig = {
  secret: 'hey buddy',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
};
app.use(session(sessionConfig));
app.use(flash());

OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;
///////////////////////////send flash messsages///////////////////////////////////
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.complete = req.flash('complete');
  res.locals.sendemail = req.flash('sendemail');
  res.locals.foodupdated = req.flash('foodupdated');
  res.locals.requireLOGIN = req.flash('requireLOGIN');
  res.locals.logout = req.flash('logout');
  res.locals.passwordDontMatch = req.flash('dontMatch');
  res.locals.userExist = req.flash('userExist');

  res.locals.userCreated = req.flash('userCreated');
  res.locals.error_upload_video = req.flash('error_upload_video');
  res.locals.upload_video = req.flash('upload_video');
  res.locals.forget_error = req.flash('forget_error');
  res.locals.forget_success = req.flash('forget_success');

  res.locals.delete_success = req.flash('delete_success');
  res.locals.review = req.flash('review');
  res.locals.review_error = req.flash('review_error');
  res.locals.success_comment = req.flash('success_comment');
  res.locals.comment_error = req.flash('comment_error');
  next();
});
//////////////////////////require login middleware/////////////////////////
// const requirelogin = (req, res, next) => {
//   if (!session.user_id) {
//     res.flash('requireLOGIN', 'please login first');
//     return res.redirect('/home');
//   }

//   next();
// };
///////////////////////////mode//////////////////////////////////
// Middleware to attach mode to res.locals
app.use((req, res, next) => {
  res.locals.mode = req.session.mode || 'light';
  res.locals.id = req.session.user_id;
  res.locals.pending_complaints = req.session.pending_complaints;

  next();
});
app.post('/home', (req, res) => {
  req.session.mode = req.body.mode;

  // For debugging: Log the mode to the console
  console.log('Mode switched to:', req.session.mode);

  // Redirect to home or another page after setting the mode
  res.redirect('/home'); // Adjust the redirection URL as needed
});
///////////////////////////home///////////////////////////////////////
let shop = [];
app.get('/landing', async (req, res) => {
  res.render('home/home1');
});
app.get('/home', async (req, res) => {
  const currentPage = parseInt(req.query.page) || 1;
  const itemsPerPage = 6;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const request = req.query.request;

  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      'SELECT V.SHOP_DATA.STALL_PIC AS STALL_PIC , V.SHOP_DATA.STALL_NAME AS STALL_NAME, V_ID,V.SHOP_DATA.V_FIRST_NAME AS V_FIRST_NAME,V.SHOP_DATA.V_LAST_NAME AS V_LAST_NAME,JOIN_DATE,V.SHOP_DATA.STALL_TITLE AS STALL_TITLE,V.SHOP_DATA.STALL_TITLE AS STALL_TITLE FROM vendors V'
    );
    shop = result.rows;
    if (request === 'json') {
      return res.json(shop);
    }
    console.log(result.rows);
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

  const displayedItems = shop.slice(startIndex, endIndex);
  const totalPages = Math.ceil(shop.length / itemsPerPage);

  res.render('home/services', {
    currentPage,
    itemsPerPage,
    displayedItems,
    totalPages,
    shop,
  });
});

////////////////////////signup//////////////////////////////
app.get('/home/signup', (req, res) => {
  res.render('login_signup_ejs/signup');
});
app.post('/home/signup', upload.single('stallPic'), async (req, res) => {
  const {
    accountType,

    email,
    phone,

    password,
    confirmPassword,
    terms,
  } = req.body;

  if (password !== confirmPassword) {
    req.flash('dontMatch', 'Passwords do not match.');
    return res.redirect('/home/signup');
  }

  let connection;
  let resfind_id;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    if (accountType === 'Seller') {
      resfind_id = await connection.execute(
        'SELECT V_ID FROM VENDORS WHERE EMAIL = :email',
        { email }
      );
    } else if (accountType === 'User') {
      resfind_id = await connection.execute(
        'SELECT C_ID FROM CUSTOMERS WHERE EMAIL = :email',
        { email }
      );
    } else {
      resfind_id = await connection.execute(
        'SELECT USER_ID FROM USERS WHERE EMAIL = :email',
        { email }
      );
    }

    console.log(resfind_id.rows);
    if (resfind_id.rows.length !== 0) {
      req.flash('userExist', 'User already exists.');
      return res.redirect('/home/signup');
    }
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred during signup.');
    return res.redirect('/home/signup');
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }

  const queryParams = new URLSearchParams({
    accountType,

    email,
    phone,

    password,
    terms,
  }).toString();
  return res.redirect(`/emailVerification/otp?${queryParams}`);
});

app.use('/vendor', vendor);
app.use('/admin', admin);
app.use('/user', user);
////////////////////////home page/////////////////////////////
//////////////////login//////////////////
app.get('/home/login', (req, res) => {
  console.log(mode);
  res.render('login_signup_ejs/login');
});

app.post('/home/login', async (req, res) => {
  let connection;
  let USER_ID;
  let EMAIL;
  let FIRST_NAME;

  try {
    connection = await OracleDB.getConnection(dbConfig);

    const { email, password } = req.body;
    console.log(req.body);

    if (email && password) {
      let result;

      // Check in the VENDORS table
      result = await connection.execute(
        `SELECT V.SHOP_DATA.V_FIRST_NAME AS V_FIRST_NAME,EMAIL, V_ID, PASSWORD FROM vendors V WHERE V_ID = :email OR EMAIL = :email`,
        { email: email }
      );

      if (result.rows.length > 0) {
        const [{ EMAIL: vendorEmail, V_ID, PASSWORD: vendorPassword }] =
          result.rows;
        USER_ID = V_ID;
        EMAIL = vendorEmail;
        FIRST_NAME = result.rows[0].V_FIRST_NAME;
      } else {
        // Check in the CUSTOMERS table
        result = await connection.execute(
          `SELECT FIRST_NAME,EMAIL, C_ID, PASSWORD FROM customers WHERE C_ID = :email OR EMAIL = :email`,
          { email: email }
        );

        if (result.rows.length > 0) {
          const [{ EMAIL: customerEmail, C_ID, PASSWORD: customerPassword }] =
            result.rows;
          USER_ID = C_ID;
          EMAIL = customerEmail;
          FIRST_NAME = result.rows[0].FIRST_NAME;
        } else {
          // Check in the USERS table
          result = await connection.execute(
            `SELECT FIRST_NAME, EMAIL, USER_ID, PASSWORD FROM users WHERE USER_ID = :email OR EMAIL = :email`,
            { email: email }
          );
          USER_ID = result.rows[0].USER_ID;
          EMAIL = result.rows[0].EMAIL;
          FIRST_NAME = result.rows[0].FIRST_NAME;
        }
      }

      if (result.rows.length > 0) {
        const storedPassword = result.rows[0].PASSWORD;

        if (storedPassword === password) {
          req.session.user_id = USER_ID;
          req.session.email = EMAIL;
          req.session.FIRST_NAME = FIRST_NAME;

          console.log(`Logged in as: ${EMAIL}, ID: ${USER_ID}`);

          // Retrieve the original URL from the session if available
          const redirectUrl =
            req.session.returnTo ||
            (USER_ID[0] === 'A'
              ? `/admin/${USER_ID}`
              : USER_ID[0] === 'U'
              ? `/user/${USER_ID}`
              : `/vendor/${USER_ID}`);
          delete req.session.returnTo; // Clean up the session

          req.flash(
            'success',
            `Welcome back! We're glad to see you, ${FIRST_NAME}`
          );
          return res.redirect(redirectUrl);
        } else {
          req.flash('error', 'Invalid email or password');
          return res.redirect('/home/login');
        }
      } else {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/home/login');
      }
    } else {
      req.flash('error', 'Invalid form data');
      return res.redirect('/home/login');
    }
  } catch (err) {
    console.error('Error connecting to the database', err);
    req.flash('error', 'Internal server error');
    return res.redirect('/home/login');
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('Connection closed.');
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    }
  }
});

/////////////////////////////forget password///////////////////////////////
app.get('/forget', (req, res) => {
  res.render('login_signup_ejs/forget');
});
app.post('/forget', async (req, res) => {
  let connection;
  const { email } = req.body;
  console.log(req.body);
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT EMAIL, FIRST_NAME FROM Customers WHERE EMAIL = :email`,
      [email]
    );
    const result2 = await connection.execute(
      `SELECT EMAIL,v.shop_data.V_FIRST_NAME as FIRST_NAME FROM Vendors v WHERE EMAIL = :email`,
      [email]
    );

    const { EMAIL, FIRST_NAME } = result.rows[0] || result2.rows[0];
    if (!EMAIL) {
      req.flash(
        'forget_error',
        'An error occurred during password reset, please try again later'
      );
      return res.redirect('/forget');
    }

    req.session.user_email = EMAIL;
    req.flash('forget_success', `An OTP has been sent to your email: ${EMAIL}`);
    res.redirect(`/forget/otp?email=${EMAIL}&firstName=${FIRST_NAME}`);
  } catch (err) {
    console.error(err);
    req.flash(
      'forget_error',
      'An error occurred during password reset, please try again later'
    );
    return res.redirect('/forget');
  } finally {
    try {
      if (connection) {
        await connection.close();
      }
    } catch (err) {
      console.error(err);
      req.flash(
        'forget_error',
        'An error occurred during password reset, please try again later'
      );
      return res.redirect('/forget');
    }
  }
});
let otp;
app.get('/forget/reset', require_email, async (req, res) => {
  const { email } = req.query;
  res.render('login_signup_ejs/ResetPassword', { email });
});
////////////////////////////////function grab ip address////////////////////////
function getWirelessIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    // Targeting wireless interfaces (e.g., wlan0, Wi-Fi, etc.)
    if (
      name.toLowerCase().includes('wlan') ||
      name.toLowerCase().includes('wi-fi')
    ) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  return 'localhost'; // Fallback to localhost if no wireless IP is found
}
/////////////////////////////////////reset password//////////////////////////
app.get('/forget/otp', (req, res) => {
  // Function to get the local IP address

  // Use the IP address in your URL

  const ip = getWirelessIPAddress();

  otp = uuid();
  const email = req.session.user_email;
  const url = `http://${ip}:3000/forget_otp_verify?otp=${otp}&email=${email}`;
  const subject = 'Forget Password';
  const PASSWORD_RESET_REQUEST = PASSWORD_RESET_REQUEST_TEMPLATE.replace(
    '{resetURL}',
    `${url}`
  );

  sendOtpEmail(email, subject, PASSWORD_RESET_REQUEST);
});

app.get('/forget_otp_verify', (req, res) => {
  const { otp, email } = req.query;

  const seerver_otp = otp;
  if (otp === seerver_otp) {
    res.redirect(`/forget/reset?email=${email}`);
  } else {
    res.redirect('/forget');
  }
});
///////////////////verfication otp////////////////////////
app.get('/otp_val_verify', (req, res) => {
  otp = uuid();
  const { email } = req.query;
  const subject = 'Email Verification';
  const VERIFICATION_EMAIL = VERIFICATION_EMAIL_TEMPLATE.replace(
    '{verificationCode}',
    otp
  );

  sendOtpEmail(email, subject, VERIFICATION_EMAIL, otp);
  console.log(otp);
  res.json(otp);
});
/////////////////////////////////////email verification//////////////////////////
app.get('/emailVerification/otp', async (req, res) => {
  const {
    accountType,

    email,
    phone,

    password,
    terms,
  } = req.query;

  const queryParams = new URLSearchParams({
    accountType,

    email,
    phone,

    password,
    terms,
  }).toString();

  res.render('login_signup_ejs/verify_email', { queryParams });
});

/////////////////////////////////////insert data after verification otp//////////////////////////

app.post('/emailVerification/otp', async (req, res) => {
  const {
    accountType,

    email,
    phone,

    password,
    terms,
  } = req.query;
  console.log(req.query);
  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    if (accountType === 'Seller') {
      await connection.execute(
        `INSERT INTO vendors 
        (ACCOUNT_TYPE,  EMAIL, PHONE, PASSWORD, TERMS) 
        VALUES 
        (:accountType, :email, :phone, :password, :terms)`,
        {
          accountType,

          email,
          phone,

          password,
          terms,
        },
        { autoCommit: true }
      );
    } else {
      await connection.execute(
        `INSERT INTO customers 
        (ACCOUNT_TYPE, EMAIL, PHONE, PASSWORD, TERM) 
        VALUES 
        (:accountType,  :email, :phone, :password, :terms)`,
        {
          accountType,

          email,
          phone,

          password,
          terms,
        },
        { autoCommit: true }
      );
    }

    req.flash('userCreated', 'Signup completed, please login.');
    return res.redirect('/landing');
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred during signup.');
    return res.redirect('/home/signup');
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
////////////////////////////////////view shop////////////////////////
app.get('/home/ViewShop', async (req, res) => {
  const seller_id = req.query.id;
  const responseType = req.query.responseType || 'view'; // Default to rendering view
  console.log(seller_id);
  let connection;
  let viewshop = [];
  let video = [];
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT v.V_ID, v.SHOP_DATA.V_FIRST_NAME AS V_FIRST_NAME , v.SHOP_DATA.V_LAST_NAME AS V_LAST_NAME, v.EMAIL, v.PHONE, v.SHOP_DATA.AREA AS AREA, v.SHOP_DATA.STALL_PIC AS STALL_PIC , f.FOOD_NAME, f.PRICE, f.RATING, f.INGREDIENT, f.AVAILABILITY, f.FOOD_PIC ,f.FOOD_ID
       FROM vendors v, food f 
       WHERE v.V_ID = :seller_id 
         AND f.FOOD_ID IN (SELECT vsf.FOOD_ID FROM VENDOR_SELLS_FOOD vsf WHERE vsf.V_ID = v.V_ID)`,
      [seller_id]
    );
    viewshop = result.rows;
    const videoresult = await connection.execute(
      `SELECT VIDEO_ID,VIDEO_DESCRIPTION,VIDEO_TITLE,IMAGE_LINKS,VIDEO_LINKS FROM uploaded_videos WHERE VIDEO_ID IN (SELECT VIDEO_ID FROM user_promotes_vendor WHERE V_ID=:seller_id)`,
      [seller_id]
    );
    video = videoresult.rows;

    console.log(viewshop);
  } catch (err) {
    console.error(err);
  } finally {
    try {
      if (connection) {
        await connection.close();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (responseType === 'json') {
    res.json({ viewshop, video });
  } else {
    res.render('home/viewShop', { viewshop });
  }
});
///////////////////////////shop location data////////////////////////
app.get('/home/shopLocation', async (req, res) => {
  let connection;
  let shoplocation = [];
  try {
    connection = await OracleDB.getConnection(dbConfig);

    // Execute the first query to get vendor data
    const result = await connection.execute(
      'SELECT V.SHOP_DATA.AREA AS AREA, V.SHOP_DATA.STALL_PIC AS STALL_PIC,V.SHOP_DATA.STALL_NAME AS STALL_NAME, PHONE, JOIN_DATE, V.SHOP_DATA.STATUS AS ACTIVE, V.SHOP_DATA.V_FIRST_NAME AS V_FIRST_NAME, V.SHOP_DATA.V_LAST_NAME AS V_LAST_NAME, V_ID FROM vendors V ORDER BY V_ID'
    );

    // Execute the second query to get average ratings
    const result2 = await connection.execute(
      'SELECT AVG(rating) AS avg_rating, v_id FROM customerreviewsvendor GROUP BY v_id'
    );

    // Append avg_rating to each vendor without using Map
    shoplocation = result.rows.map((vendor) => {
      const ratingData = result2.rows.find(
        (rating) => rating.V_ID === vendor.V_ID
      );
      return {
        ...vendor,
        AVG_RATING: ratingData ? ratingData.AVG_RATING : null, // Default to null if no rating is found
      };
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
  res.json(shoplocation);
});
/////////////////////////////////////food////////////////////////
app.get('/home/food', async (req, res) => {
  const currentPage = parseInt(req.query.page) || 1;
  const itemsPerPage = 6;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const seller_id = req.query.id;
  console.log(seller_id);
  let connection;

  try {
    connection = await OracleDB.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT *
       FROM food ORDER BY CREATE_date DESC  `
    );
    // FETCH FIRST 14 ROWS ONLY
    const food = result.rows;
    console.log(food);
    const displayedItems = food.slice(startIndex, endIndex);
    const totalPages = Math.ceil(food.length / itemsPerPage);
    res.render('home/foods', {
      food,
      currentPage,
      itemsPerPage,
      startIndex,
      endIndex,
      totalPages,
    });
  } catch (err) {
    console.error(err);
  } finally {
    try {
      if (connection) {
        await connection.close();
      }
    } catch (err) {
      console.error(err);
    }
  }
});
/////////////////////////////////////contact us////////////////////////
app.get('/home/contacts', async (req, res) => {
  res.render('home/contacts');
});
/////////////////////////////////////team////////////////////////
app.get('/home/team', async (req, res) => {
  res.render('home/team');
});
/////////////////////////////////////shop details////////////////////////
app.get('/home/shopDetails', async (req, res) => {
  const { id } = req.query;
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
    const result3 = await connection.execute(
      'SELECT * FROM food,vendor_sells_food  WHERE V_ID = :id AND food.food_id = vendor_sells_food.food_id ORDER BY rating desc ',
      { id }
    );

    const vendordata = result.rows[0];
    console.log(result2.rows);
    console.log(vendordata);
    res.render('home/shop_details', {
      vendordata,
      foodData: result2.rows,
      allFoodData: result3.rows,
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

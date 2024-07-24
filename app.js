if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

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
const sendOtpEmail = require('./Routes/emai.js');
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
      'SELECT STALL_PIC, STALL_NAME, V_ID FROM vendors'
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

  res.render('home/home', {
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
    firstName,
    lastName,
    email,
    phone,
    district,
    city,
    location,
    stallName,
    shopLocationUrl,
    password,
    confirmPassword,
    terms,
  } = req.body;
  const stallPic = req.file ? req.file.path : '';
  console.log(req.body);

  if (password !== confirmPassword) {
    req.flash('dontMatch', 'Passwords do not match.');
    return res.redirect('/home/signup');
  }

  let connection;
  try {
    connection = await OracleDB.getConnection(dbConfig);
    const resfind_id = await connection.execute(
      'SELECT USER_ID FROM USERS WHERE EMAIL = :email',
      { email }
    );
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
    firstName,
    lastName,
    email,
    phone,
    district,
    city,
    location,
    stallName,
    stallPic,
    shopLocationUrl,
    password,
    terms,
  }).toString();
  return res.redirect(`/emailVerification/otp?${queryParams}`);
});

app.use('/vendor', vendor);
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

  try {
    connection = await OracleDB.getConnection({
      user: 'system',
      password: '12688',
      connectString: 'localhost:1521/orcl',
    });

    const { email, password } = req.body;
    console.log(req.body);

    if (email && password) {
      let result;

      // Check in the VENDORS table
      result = await connection.execute(
        `SELECT EMAIL, V_ID, PASSWORD FROM vendors WHERE V_ID = :email OR EMAIL = :email`,
        { email: email }
      );

      if (result.rows.length > 0) {
        const [{ EMAIL: vendorEmail, V_ID, PASSWORD: vendorPassword }] =
          result.rows;
        USER_ID = V_ID;
        EMAIL = vendorEmail;
      } else {
        // Check in the CUSTOMERS table
        result = await connection.execute(
          `SELECT EMAIL, C_ID, PASSWORD FROM customers WHERE C_ID = :email OR EMAIL = :email`,
          { email: email }
        );

        if (result.rows.length > 0) {
          const [{ EMAIL: customerEmail, C_ID, PASSWORD: customerPassword }] =
            result.rows;
          USER_ID = C_ID;
          EMAIL = customerEmail;
        }
      }

      if (result.rows.length > 0) {
        const storedPassword = result.rows[0].PASSWORD;

        if (storedPassword === password) {
          req.session.user_id = USER_ID;
          console.log(`Logged in as: ${EMAIL}, ID: ${USER_ID}`);

          if (USER_ID[0] === 'A') {
            req.flash('success', "Welcome back, Admin! We're glad to see you.");
            return res.redirect(`/admin/${USER_ID}`);
          } else if (USER_ID[0] === 'U') {
            req.flash('success', "Welcome back! We're glad to see you.");
            return res.redirect(`/user/${USER_ID}`);
          } else {
            req.flash('success', "Welcome back! We're glad to see you.");
            return res.redirect(`/vendor/${USER_ID}`);
          }
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

// app.get('/email', requirelogin, async (req, res) => {
//   const nodemailer = require('nodemailer');

//   const transporter = nodemailer.createTransport({
//     host: process.env.Email_host,
//     port: process.env.Email_host,
//     secure: false, // Use `true` for port 465, `false` for all other ports
//     auth: {
//       user: process.env.Email_username,
//       pass: process.env.Email_password,
//     },
//   });

//   // async..await is not allowed in global scope, must use a wrapper
//   async function main() {
//     // send mail with defined transport object
//     const info = await transporter.sendMail({
//       from: 'street_food.io', // sender address
//       to: 'hemalhemal787@gmail.com', // list of receivers
//       subject: 'forgret password', // Subject line
//       title: 'the forget pass of' + uuid(),
//       text: 'your foget code is :' + uuid(), // plain text body
//       html: false, // html body
//     });

//     console.log('Message sent: %s', info.messageId);
//     // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
//   }

//   main().catch(console.error);
// });

//////////////////////for any invalid route////////////////////////
// app.get('*', (req, res) => {
//   req.flash('error', 'The route is not valid');
//   res.redirect('/home');
// });

////////////////////export required login middleware////////////////////////////////////

// module.exports = { app, mode };

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
      `SELECT EMAIL, FIRST_NAME FROM USERS WHERE EMAIL = :email`,
      [email]
    );

    const { EMAIL, FIRST_NAME } = result.rows[0] || {};
    console.log(result.rows);

    if (!result.rows.length) {
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
app.get('/forget/otp', require_email, async (req, res) => {
  res.render('login_signup_ejs/forget_otp', { email, firstName });
});

app.get('/otp_val', (req, res) => {
  otp = uuid();
  const { email, firstName } = req.query;

  const message = `Hello, ${firstName}. Your reset code is: ${otp}`;
  sendOtpEmail(email, firstName, message);
  res.json(otp);
});

app.get('/otp_val_verify', (req, res) => {
  otp = uuid();
  const { email, firstName } = req.query;

  const message = `Hello, ${firstName}. Your verification otp is: ${otp}`;
  sendOtpEmail(email, firstName, message);
  console.log(otp);
  res.json(otp);
});
/////////////////////////////////////email verification//////////////////////////
app.get('/emailVerification/otp', async (req, res) => {
  const {
    accountType,
    firstName,
    lastName,
    email,
    phone,
    district,
    city,
    location,
    stallName,
    stallPic,
    shopLocationUrl,
    password,
    terms,
  } = req.query;

  const queryParams = new URLSearchParams({
    accountType,
    firstName,
    lastName,
    email,
    phone,
    district,
    city,
    location,
    stallName,
    stallPic,
    shopLocationUrl,
    password,
    terms,
  }).toString();

  res.render('login_signup_ejs/verify_email', { queryParams });
});

/////////////////////////////////////insert data after verification otp//////////////////////////

app.post('/emailVerification/otp', async (req, res) => {
  const {
    accountType,
    firstName,
    lastName,
    email,
    phone,
    district,
    city,
    location,
    stallName,
    stallPic,
    shopLocationUrl,
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
        (ACCOUNT_TYPE, V_FIRST_NAME, V_LAST_NAME, EMAIL, PHONE, DISTRICT, CITY, AREA, stall_Name, stall_Pic, LOCATION_URL, PASSWORD, TERMS) 
        VALUES 
        (:accountType, :firstName, :lastName, :email, :phone, :district, :city, :location, :stallName, :stallPic, :shopLocationUrl, :password, :terms)`,
        {
          accountType,
          firstName,
          lastName,
          email,
          phone,
          district,
          city,
          location,
          stallName,
          stallPic,
          shopLocationUrl,
          password,
          terms,
        },
        { autoCommit: true }
      );
    } else {
      await connection.execute(
        `INSERT INTO customers 
        (ACCOUNT_TYPE, FIRST_NAME, LAST_NAME, EMAIL, PHONE, DISTRICT, CITY, AREA, PASSWORD, TERM) 
        VALUES 
        (:accountType, :firstName, :lastName, :email, :phone, :district, :city, :location,:password, :terms)`,
        {
          accountType,
          firstName,
          lastName,
          email,
          phone,
          district,
          city,
          location,
          password,
          terms,
        },
        { autoCommit: true }
      );
    }

    req.flash('userCreated', 'Signup completed, please login.');
    return res.redirect('http://localhost:3000/home');
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred during signup.');
    return res.redirect('http://localhost:3000/home/signup');
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
      `SELECT v.V_ID, v.V_FIRST_NAME, v.V_LAST_NAME, v.EMAIL, v.PHONE, v.AREA, v.STALL_PIC, f.FOOD_NAME, f.PRICE, f.RATING, f.INGREDIENT, f.AVAILABILITY, f.FOOD_PIC 
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

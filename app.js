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
const { nextTick } = require('process');
const requirelogin = require('./Routes/requirelogin_middleware');

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
app.get('/home', (req, res) => {
  res.render('home/home');
});

app.get('/home/signup', (req, res) => {
  res.render('login_signup_ejs/signup');
});

app.use('/vendor', vendor);
////////////////////////home page/////////////////////////////
app.get('/home/login', (req, res) => {
  console.log(mode);
  res.render('login_signup_ejs/login', { mode });
});

app.post('/home/login', async (req, res) => {
  let connection;
  try {
    connection = await OracleDB.getConnection({
      user: 'system',
      password: '12688',
      connectString: 'localhost:1521/orcl',
    });

    const { email, password } = req.body;
    console.log(email);

    if (email && password) {
      try {
        const result = await connection.execute(
          `SELECT EMAIL,USER_ID, PASSWORD FROM USERS WHERE USER_ID = :email OR EMAIL = :email`,
          [email, email]
        );

        console.log(result);
        const [{ EMAIL, USER_ID }] = result.rows;
        console.log(EMAIL);
        req.session.user_id = USER_ID;
        console.log(req.session.user_id);

        if (result.rows.length > 0) {
          const storedPassword = result.rows[0].PASSWORD;

          if (storedPassword === password) {
            req.flash('success', 'Hello from home');
            res.redirect('/home');
          } else {
            req.flash('error', 'Invalid email or password');
            res.redirect('/home/login');
          }
        } else {
          req.flash('error', 'Invalid email or password');
          res.redirect('/home/login');
        }
      } catch (error) {
        console.error('Error executing query:', error);
        req.flash('error', 'Internal server error');
        res.redirect('/home/login');
      }
    } else {
      req.flash('error', 'Invalid form data');
      res.redirect('/home/login');
    }
  } catch (err) {
    console.error('Error connecting to the database', err);
    req.flash('error', 'Internal server error');
    res.redirect('/home/login');
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
app.get('*', (req, res) => {
  req.flash('error', 'The route is not valid');
  res.redirect('/home');
});

////////////////////export required login middleware////////////////////////////////////

// module.exports = { app, mode };

/////////////////////////////////////////////////////////////////

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

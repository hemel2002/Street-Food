const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const { v4: uuid } = require('uuid');
const { Console } = require('console');
const https = require('https');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public', 'ejs'));
app.set('view engine', 'ejs');

let foodData = [
  {
    F_id: '1',
    name: 'Fushka',
    price: '12.00 Tk',
    imageUrl: '../img/food Item/b01fa4c9920d42df9ef472fd4f8e6fda.jpg',
  },
  {
    F_id: '2',
    name: 'Jhalmuri',
    price: '10.00 TK',
    imageUrl: '../img/food Item/Rectangle-1-42-1.webp',
  },
  {
    F_id: '3',
    name: 'Sushi Platter',
    price: '25.00 Tk',
    imageUrl: '../img/food Item/Bhelpuri.webp',
  },
  {
    F_id: '4',
    name: 'Caesar Salad',
    price: '8.00 Tk',
    imageUrl: '../img/food Item/cabrar_faiyaz_niloy12_0.jpg',
  },
  {
    F_id: '5',
    name: 'Pasta Carbonara',
    price: '8.00 Tk',
    imageUrl: '../img/food Item/Bhelpuri.webp',
  },
  {
    F_id: '6',
    name: 'Taco Fiesta',
    price: '9.00 Tk',
    imageUrl: '../img/food Item/b01fa4c9920d42df9ef472fd4f8e6fda.jpg',
  },
  {
    F_id: '7',
    name: 'hemal',
    price: '10',
    imageUrl: '../img/signup.jpeg',
  },
];
/////////////////////for vendors home page//////////////////////////
app.get('/vendor', (req, res) => {
  const currentPage = req.query.page || 1; // Get current page from query parameter
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
  });
});
/////////////////////for vendor add food update//////////////////////////
app.get('/vendor/add_food', (req, res) => {
  console.log('it working');
  res.render('vendor_ejs/add_food');
});

app.post('/vendor/add_food', (req, res) => {
  console.log('it working');
  console.log(req.body);
  const { F_id, name, price, imageUrl } = req.body;

  foodData.push({ F_id: uuid(), name, price, imageUrl });
  console.log(foodData);
  res.redirect('/vendor');
});

/////////////////////for vendor udate food //////////////////////////

app.get('/vendor/update/:id', (req, res) => {
  // Handle GET request for /vendor/update/:id
  const id = req.params.id;
  // You might render a form here for editing the vendor information
  const findfoodData = foodData.find((c) => c.F_id === id);

  res.render('vendor_ejs/update_food', { findfoodData });
});

app.patch('/vendor/update/:id', (req, res) => {
  const { id } = req.params;

  let findfoodData = foodData.findIndex((c) => c.F_id === id);
  const newfoodData = req.body;
  console.log(req.body);
  foodData[findfoodData] = newfoodData;
  res.redirect('/vendor');
});

/////////////////////for vendor email//////////////////////////

app.get('/vendor/email', (req, res) => {
  res.render('email', { foodData: foodData[1] });
});

app.post('/vendor/email', (req, res) => {
  const { email_id, email_text } = req.body;
  console.log(req.body);

  const options = {
    method: 'POST',
    hostname: 'mail-sender-api1.p.rapidapi.com',
    port: null,
    path: '/',
    headers: {
      'x-rapidapi-key': 'a4de8942bbmsh79180a6157dc5a8p17c957jsn73c9cce26c02',
      'x-rapidapi-host': 'mail-sender-api1.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
  };

  const apiReq = https.request(options, function (apiRes) {
    const chunks = [];

    apiRes.on('data', function (chunk) {
      chunks.push(chunk);
    });

    apiRes.on('end', function () {
      const body = Buffer.concat(chunks).toString();
      console.log(body);
      if (apiRes.statusCode === 200) {
        res.redirect('/vendor');
      } else {
        res.status(apiRes.statusCode).send(body);
      }
    });
  });

  apiReq.write(
    JSON.stringify({
      sendto: email_id,

      body: 'your foget code is :' + uuid(),
      name: 'Custom Name', // If necessary, these fields can be hardcoded or set to default values
      replyTo: 'shahriar12688@gmail.com', // Replace with a default reply-to address
      ishtml: 'false', // Set this to 'true' if you want to send HTML emails
      title: 'Default Title', // Replace with a default title if needed
    })
  );

  apiReq.on('error', (e) => {
    console.error(e);
    res.status(500).send('An error occurred while sending the email');
  });

  apiReq.end();
});

//////////////// Start the Express server///////////////////

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

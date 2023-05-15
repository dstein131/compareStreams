const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const insertLivestreamData = require('./queries.js');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post('/livestreamData', (req, res) => {
  const data = req.body;
  insertLivestreamData(data);
  res.status(200).send('Data received');
});

app.listen(3000, () => console.log('Server is running on port 3000'));

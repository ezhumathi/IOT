require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const api = require('./routes/api');
const authRoutes = require('./routes/auth');   

const app = express();
app.use(cors());
app.use(express.json());


app.use('/api', api);
app.use('/api/auth', authRoutes); 

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error', err);
});

app.get('/', (req, res) => res.send('Energy Analyzer Backend running'));

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

require('dotenv').config(); // Keep this as the VERY first line!
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const api = require('./routes/api');
const authRoutes = require('./routes/auth');

const app = express();
const backendStartTime = new Date();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', api);
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => res.send('Energy Analyzer Backend running'));

app.get('/api/uptime', (req, res) => {
  res.json({ backendStartTime: backendStartTime.toISOString() });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

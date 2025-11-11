const express = require("express");
const router = express.Router();
const Device = require("../models/Device");
const Reading = require("../models/Reading");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// --- User Signup ---
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();
    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- User Login ---
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Device Creation ---
router.post("/devices", async (req, res) => {
  try {
    const d = new Device(req.body);
    await d.save();
    res.json(d);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Device List ---
router.get("/devices", async (req, res) => {
  const devices = await Device.find().sort({ createdAt: -1 });
  res.json(devices);
});

// --- Sensor Readings: POST (Create) ---
router.post("/readings", async (req, res) => {
  try {
    // DEBUG LOG – see posted readings on backend console!
    console.log("Received reading:", req.body);

    const { deviceId, watts, voltage, current, energy, timestamp } = req.body;
    if (!deviceId || watts == null)
      return res.status(400).json({ error: "deviceId and watts required" });

    const r = new Reading({
      deviceId,
      watts,
      voltage,
      current,
      energy,
      timestamp: timestamp ? new Date(timestamp) : undefined,
    });

    await r.save();
    res.json({ success: true, reading: r });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Sensor Readings: GET (List for a device) ---
router.get("/readings/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  const { from, to } = req.query;
  const q = { deviceId };
  if (from) q.timestamp = { ...q.timestamp, $gte: new Date(from) };
  if (to) q.timestamp = { ...q.timestamp, $lte: new Date(to) };

  const readings = await Reading.find(q).sort({ timestamp: 1 });
  res.json(readings);
});

// --- Cumulative Energy and Estimated Cost ---
router.get("/consumption/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { from, to } = req.query;
    const q = { deviceId };
    if (from) q.timestamp = { ...q.timestamp, $gte: new Date(from) };
    if (to) q.timestamp = { ...q.timestamp, $lte: new Date(to) };

    const readings = await Reading.find(q).sort({ timestamp: 1 }).lean();

    let energyWh = 0;
    for (let i = 1; i < readings.length; i++) {
      const prev = readings[i - 1];
      const cur = readings[i];
      const dtHours =
        (new Date(cur.timestamp) - new Date(prev.timestamp)) /
        (1000 * 60 * 60);
      const avgWatts = (prev.watts + cur.watts) / 2;
      energyWh += avgWatts * Math.max(dtHours, 0);
    }

    const energyKWh = energyWh / 1000;
    const costPerKwh = parseFloat(process.env.COST_PER_KWH || "0.12");
    const estimatedCost = energyKWh * costPerKwh;

    res.json({
      energyKWh,
      estimatedCost,
      readingCount: readings.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

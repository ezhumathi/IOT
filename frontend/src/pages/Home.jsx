import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";

const BASE = "http://iot-pp8j.onrender.com/api";

export default function Home() {
  const [devices, setDevices] = useState([]);
  const [summary, setSummary] = useState({ totalEnergy: 0, totalBill: 0 });

  useEffect(() => {
    fetchTotals();
    const interval = setInterval(fetchTotals, 5000); // auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  async function fetchTotals() {
    try {
      const devicesRes = await axios.get(`${BASE}/devices`);
      const devicesList = devicesRes.data;
      setDevices(devicesList);

      let totalEnergy = 0;
      let totalBill = 0;

      // Sum up all device readings (energy + bill)
      await Promise.all(devicesList.map(async device => {
        const res = await axios.get(`${BASE}/consumption/${device._id}`);
        totalEnergy += res.data.energyKWh || 0;
        // Bill in INR: energyKWh * cost (USD) * conversion (83)
        totalBill += (res.data.estimatedCost || 0) * 83;
      }));

      setSummary({ totalEnergy, totalBill });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="home-container">
      <h1>Welcome to the Energy Analyzer</h1>
      <p>Track and optimize your energy usage in real-time.</p>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Devices</h3>
          <p>{devices.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Energy (kWh)</h3>
          <p>{summary.totalEnergy.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Estimated Bill (₹)</h3>
          <p>{summary.totalBill.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

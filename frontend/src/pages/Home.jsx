import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Home.css";

const BASE = "https://iot-pp8j.onrender.com/api";
const RATE_PER_UNIT = 4.8; // Rs. 4.80 per kWh

export default function Home() {
  const [devices, setDevices] = useState([]);
  const [summary, setSummary] = useState({ totalEnergy: 0, totalBill: 0 });
  const lastValid = useRef({ totalEnergy: 0, totalBill: 0 }); // keep last non-zero stats

  useEffect(() => {
    fetchTotals();
    const interval = setInterval(fetchTotals, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchTotals() {
    try {
      const devicesRes = await axios.get(`${BASE}/devices`);
      const devicesList = devicesRes.data;
      setDevices(devicesList);
      let totalEnergy = 0;
      let totalBill = 0;
      await Promise.all(
        devicesList.map(async (device) => {
          const readingsRes = await axios.get(`${BASE}/readings/${device._id}`);
          const readings = readingsRes.data.slice(-100); // last 100 readings
          let deviceEnergy = 0;
          if (readings.length > 1) {
            for (let i = 1; i < readings.length; i++) {
              const prev = readings[i - 1];
              const curr = readings[i];
              const dt = (new Date(curr.timestamp) - new Date(prev.timestamp)) / 3600000; // hours
              const p = (Number(curr.voltage) || 0) * (Number(curr.current) || 0);
              deviceEnergy += (p * dt) / 1000; // Wh to kWh
            }
          }
          const bill = deviceEnergy >= 1 ? deviceEnergy * RATE_PER_UNIT : 0;
          totalEnergy += deviceEnergy;
          totalBill += bill;
        })
      );
      // If we have non-zero data, remember it as "lastValid"
      if (totalEnergy > 0 || totalBill > 0) {
        lastValid.current = { totalEnergy, totalBill };
      }
      setSummary({ totalEnergy, totalBill });
    } catch (err) {
      // On error, show last valid totals
      setSummary(lastValid.current);
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
          <p>{summary.totalEnergy.toFixed(4)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Estimated Bill (₹)</h3>
          <p>{summary.totalBill.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

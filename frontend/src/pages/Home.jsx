import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";

const BASE = "http://localhost:5000/api";

export default function Home() {
  const [devices, setDevices] = useState([]);
  const [summary, setSummary] = useState({ totalEnergy: 0, totalBill: 0 });

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000); // auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  async function fetchDevices() {
    try {
      const res = await axios.get(`${BASE}/devices`);
      setDevices(res.data);

      // Compute total energy & total bill
      let totalEnergy = 0;
      let totalBill = 0;
      res.data.forEach(d => {
        const power = d.power || 0; // in W
        totalEnergy += power / 1000; // kWh
        totalBill += (power / 1000) * 0.83 * 83; // INR
      });
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

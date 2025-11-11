import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BASE = "http://localhost:5000/api";
const RATE_PER_UNIT = 4.8; // Rs. 4.8 per kWh

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [readings, setReadings] = useState([]);

  // Fetch devices on mount
  useEffect(() => {
    fetchDevices();
  }, []);

  // Fetch readings periodically
  useEffect(() => {
    if (selectedDevice) fetchReadings(selectedDevice);
    const interval = setInterval(() => {
      if (selectedDevice) fetchReadings(selectedDevice);
    }, 5000); // 5 seconds refresh
    return () => clearInterval(interval);
  }, [selectedDevice]);

  async function fetchDevices() {
    try {
      const res = await axios.get(`${BASE}/devices`);
      setDevices(res.data);
      if (!selectedDevice && res.data.length > 0)
        setSelectedDevice(res.data[0]._id);
    } catch (err) {
      console.error("Device fetch error:", err);
    }
  }

  async function fetchReadings(deviceId) {
    try {
      const res = await axios.get(`${BASE}/readings/${deviceId}`);
      setReadings(res.data);
    } catch (err) {
      console.error("Reading fetch error:", err);
    }
  }

  function getLatestReading() {
    if (!readings.length)
      return { voltage: 0, current: 0, power: 0, energy: 0 };
    const latest = readings[readings.length - 1];
    const voltage = Number(latest.voltage) || 0;
    const current = Number(latest.current) || 0;
    const power = Number(latest.watts) || voltage * current;
    const energy = Number(latest.energy) || 0;
    return { voltage, current, power, energy };
  }

  // Online check (last reading < 60s ago)
  function isOnline() {
    if (!readings.length) return false;
    const latestTime = new Date(readings[readings.length - 1].timestamp);
    return Date.now() - latestTime.getTime() < 60000;
  }

  // Popup with totals
  function handleComputeConsumption() {
    if (!readings.length) {
      window.alert("No readings yet for this device!");
      return;
    }
    let totalV = 0,
      totalI = 0,
      totalP = 0,
      totalE = 0;
    for (let r of readings) {
      const v = Number(r.voltage) || 0;
      const i = Number(r.current) || 0;
      const p = Number(r.watts) || v * i;
      const e = Number(r.energy) || 0;
      totalV += v;
      totalI += i;
      totalP += p;
      totalE += e;
    }
    const bill = totalE * RATE_PER_UNIT;
    window.alert(
      `Device: ${
        devices.find((d) => d._id === selectedDevice)?.name || selectedDevice
      }\n` +
        `Total Readings: ${readings.length}\n` +
        `Sum Voltage: ${totalV.toFixed(2)} V\n` +
        `Sum Current: ${totalI.toFixed(2)} A\n` +
        `Sum Power: ${totalP.toFixed(2)} W\n` +
        `Sum Energy: ${totalE.toFixed(4)} kWh\n` +
        `Estimated Bill: ₹${bill.toFixed(2)}`
    );
  }

  const latest = getLatestReading();

  // Chart data
  const chartData = {
    labels: readings.map((r) =>
      new Date(r.timestamp).toLocaleTimeString("en-IN", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    ),
    datasets: [
      {
        label: "Voltage (V)",
        data: readings.map((r) => Number(r.voltage) || 0),
        borderColor: "#2ca3f5",
        backgroundColor: "rgba(44,163,245,0.2)",
      },
      {
        label: "Current (A)",
        data: readings.map((r) => Number(r.current) || 0),
        borderColor: "#00c851",
        backgroundColor: "rgba(0,200,81,0.2)",
      },
      {
        label: "Power (W)",
        data: readings.map(
          (r) => Number(r.watts) || (Number(r.voltage) || 0) * (Number(r.current) || 0)
        ),
        borderColor: "#f5a623",
        backgroundColor: "rgba(245,166,35,0.2)",
      },
      {
        label: "Energy (kWh)",
        data: readings.map((r) => Number(r.energy) || 0),
        borderColor: "#9933ff",
        backgroundColor: "rgba(153,51,255,0.2)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Live Device Readings" },
    },
  };

  return (
    <div className="dashboard">
      {/* Device Selection */}
      <div className="card device-select">
        <label>Select Device:</label>
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
        >
          <option value="">-- Choose Device --</option>
          {devices.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <button onClick={handleComputeConsumption}>Compute Consumption</button>
      </div>

      {/* Device Cards */}
      <div className="summary-cards">
        {devices.map((d) => {
          const online = d._id === selectedDevice && isOnline();
          return (
            <div
              key={d._id}
              className={`card device-card ${online ? "active" : ""}`}
              onClick={() => setSelectedDevice(d._id)}
            >
              <h4>{d.name}</h4>
              <p>Voltage: {online ? latest.voltage.toFixed(2) : "0.00"} V</p>
              <p>Current: {online ? latest.current.toFixed(2) : "0.00"} A</p>
              <p>Power: {online ? latest.power.toFixed(2) : "0.00"} W</p>
              <p>Energy: {online ? latest.energy.toFixed(4) : "0.0000"} kWh</p>
              <p>
                Bill: ₹{online ? (latest.energy * RATE_PER_UNIT).toFixed(2) : "0.00"}
              </p>
              <p>
                Status:{" "}
                <span className={online ? "online" : "offline"}>
                  {online ? "Online" : "Offline"}
                </span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="card chart-card">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Tips */}
      <div className="card tips-card">
        <h4>💡 Energy Saving Tips</h4>
        <ul>
          <li>Turn off devices when not in use.</li>
          <li>Use energy-efficient LED bulbs.</li>
          <li>Unplug idle chargers.</li>
          <li>Monitor energy regularly to detect wastage.</li>
        </ul>
      </div>
    </div>
  );
}

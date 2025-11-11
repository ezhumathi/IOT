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

const BASE = "https://iot-pp8j.onrender.com/api";
const RATE_PER_UNIT = 4.8; // Rs. 4.80 per kWh

// Compute cumulative energy/bill for non-bulb devices only (unchanged)
function computeLiveEnergyBill(readings) {
  const recent = readings.slice(-100);
  let energy = 0;
  for (let i = 1; i < recent.length; i++) {
    const prev = recent[i - 1];
    const curr = recent[i];
    const v = Number(curr.voltage) || 0;
    const c = Number(curr.current) || 0;
    const p = v * c;
    const dt = (new Date(curr.timestamp) - new Date(prev.timestamp)) / 3600000; // hours
    energy += (p * dt) / 1000; // Wh to kWh
  }
  const bill = energy >= 1 ? energy * RATE_PER_UNIT : 0;
  return { energy, bill, num: recent.length };
}

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [allReadings, setAllReadings] = useState({});

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    fetchAllReadings();
    const interval = setInterval(fetchAllReadings, 5000);
    return () => clearInterval(interval);
  }, [devices]);

  function fetchDevices() {
    axios
      .get(`${BASE}/devices`)
      .then((res) => {
        setDevices(res.data);
        if (!selectedDevice && res.data.length > 0)
          setSelectedDevice(res.data[0]._id);
      })
      .catch((err) => {
        console.error("Device fetch error:", err);
      });
  }

  function fetchAllReadings() {
    if (!devices.length) return;
    Promise.all(
      devices.map((d) =>
        axios
          .get(`${BASE}/readings/${d._id}`)
          .then((res) => [d._id, res.data])
          .catch(() => [d._id, []])
      )
    ).then((arr) => {
      const readingsObj = {};
      for (const [id, readings] of arr) readingsObj[id] = readings;
      setAllReadings(readingsObj);
    });
  }

  function isOnline(deviceId) {
    const readings = allReadings[deviceId] || [];
    if (!readings.length) return false;
    const latestTime = new Date(readings[readings.length - 1].timestamp);
    return Date.now() - latestTime.getTime() < 60000;
  }

  // Compute Consumption popup (unchanged, uses cumulative energy over last 100 readings)
  function handleComputeConsumption() {
    const readings = allReadings[selectedDevice] || [];
    if (readings.length < 2) {
      window.alert("Not enough readings to calculate consumption!");
      return;
    }
    let totalV = 0, totalI = 0, totalP = 0, totalE = 0;
    const recent = readings.slice(-100);
    for (let i = 1; i < recent.length; i++) {
      const prev = recent[i - 1];
      const curr = recent[i];
      const v = Number(curr.voltage) || 0;
      const i_ = Number(curr.current) || 0;
      const p = v * i_;
      const dt = (new Date(curr.timestamp) - new Date(prev.timestamp)) / 3600000;
      totalV += v;
      totalI += i_;
      totalP += p;
      totalE += (p * dt) / 1000;
    }
    const bill = totalE >= 1 ? totalE * RATE_PER_UNIT : 0;
    window.alert(
      `Device: ${
        devices.find((d) => d._id === selectedDevice)?.name || selectedDevice
      }\n` +
        `No. of readings (last): ${recent.length}\n` +
        `Sum Voltage: ${totalV.toFixed(2)} V\n` +
        `Sum Current: ${totalI.toFixed(2)} A\n` +
        `Sum Power: ${totalP.toFixed(2)} W\n` +
        `Total Energy (from last ${recent.length} readings): ${totalE.toFixed(4)} kWh\n` +
        `Estimated Bill: ₹${bill.toFixed(2)}`
    );
  }

  const readings = allReadings[selectedDevice] || [];
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
          (r) => (Number(r.voltage) || 0) * (Number(r.current) || 0)
        ),
        borderColor: "#f5a623",
        backgroundColor: "rgba(245,166,35,0.2)",
      },
      {
        label: "Energy (kWh)",
        data: (() => {
          const out = [];
          const rs = readings.slice(-100);
          let totalE = 0;
          for (let i = 1; i < rs.length; i++) {
            const prev = rs[i - 1];
            const curr = rs[i];
            const dt = (new Date(curr.timestamp) - new Date(prev.timestamp)) / 3600000;
            const p = (Number(curr.voltage) || 0) * (Number(curr.current) || 0);
            totalE += (p * dt) / 1000;
            out.push(Number(totalE));
          }
          // Pad to align chart
          while (out.length < rs.length) out.unshift(0);
          return out;
        })(),
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
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
        <button onClick={handleComputeConsumption}>Compute Consumption</button>
      </div>
      {/* Device Cards */}
      <div className="summary-cards">
        {devices.map((d) => {
          const readings = allReadings[d._id] || [];
          const online = isOnline(d._id);

          // For Bulb: show *live* values from newest sensor reading if online, else zeroed
          if (d.name && d.name.toLowerCase() === "bulb") {
            let voltage = 0, current = 0, power = 0, energy = 0, bill = 0;
            if (readings.length >=2 && online) {
              // Use very last sensor reading for voltage/current
              const latest = readings[readings.length - 1];
              const v = Number(latest.voltage) || 0;
              const c = Number(latest.current) || 0;
              voltage = v;
              current = c;
              power = v * c;
              // Live energy is from just the latest interval only
              const last = readings[readings.length - 1];
              const prev = readings[readings.length - 2];
              const dt = (new Date(last.timestamp) - new Date(prev.timestamp)) / 3600000;
              energy = (power * dt) / 1000;
              bill = energy >= 1 ? energy * RATE_PER_UNIT : 0;
            }
            // If not online or not enough live readings, all are zero
            return (
              <div
                key={d._id}
                className={`card device-card ${d._id === selectedDevice ? "active" : ""} ${online ? "online-card" : "offline-card"}`}
                onClick={() => setSelectedDevice(d._id)}
              >
                <h4>{d.name}</h4>
                <p>Voltage: {voltage.toFixed(2)} V</p>
                <p>Current: {current.toFixed(2)} A</p>
                <p>Power: {power.toFixed(2)} W</p>
                <p>Energy: {energy.toFixed(4)} kWh</p>
                <p>Bill: ₹{energy < 1 ? "0.00" : bill.toFixed(2)}</p>
                <p>
                  Status: <span className={online ? "online" : "offline"}>{online ? "Online" : "Offline"}</span>
                </p>
              </div>
            );
          }

          // For other devices: keep their regular logic unchanged
          const result = computeLiveEnergyBill(readings);
          return (
            <div
              key={d._id}
              className={`card device-card ${d._id === selectedDevice ? "active" : ""} ${online ? "online-card" : "offline-card"}`}
              onClick={() => setSelectedDevice(d._id)}
            >
              <h4>{d.name}</h4>
              <p>Voltage: 0.00 V</p>
              <p>Current: 0.00 A</p>
              <p>Power: 0.00 W</p>
              <p>Energy: {result.energy.toFixed(4)} kWh</p>
              <p>Bill: ₹{result.energy < 1 ? "0.00" : result.bill.toFixed(2)}</p>
              <p>
                Status: <span className={online ? "online" : "offline"}>{online ? "Online" : "Offline"}</span>
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

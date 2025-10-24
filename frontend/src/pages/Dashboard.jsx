import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BASE = "http://localhost:5000/api";

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [readings, setReadings] = useState([]);
  const [summary, setSummary] = useState({ energyKWh: 0, billINR: 0 });
  const [anomalyAlerts, setAnomalyAlerts] = useState([]);

  useEffect(() => { fetchDevices(); }, []);
  useEffect(() => { if(selectedDevice) { fetchReadings(selectedDevice); fetchSummary(selectedDevice); } }, [selectedDevice]);

  async function fetchDevices() {
    const res = await axios.get(BASE + '/devices');
    setDevices(res.data);
    if(!selectedDevice && res.data[0]) setSelectedDevice(res.data[0]._id);
  }

  async function fetchReadings(deviceId) {
    const res = await axios.get(BASE + `/readings/${deviceId}`);
    setReadings(res.data);
    // Placeholder for anomaly detector integration
    // setAnomalyAlerts(res.data.filter(r => r.anomaly));
  }

  async function fetchSummary(deviceId) {
    const res = await axios.get(BASE + `/consumption/${deviceId}`);
    setSummary({
      energyKWh: res.data.energyKWh,
      billINR: res.data.estimatedCost * 83
    });
  }

  async function computeConsumption() {
    if(!selectedDevice) return;
    const res = await axios.get(BASE + `/consumption/${selectedDevice}`);
    alert(`Energy: ${res.data.energyKWh.toFixed(4)} kWh\nEstimated Bill: ₹${(res.data.estimatedCost*83).toFixed(2)}`);
  }

  const chartData = {
    labels: readings.map(r => new Date(r.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Current (A)',
        data: readings.map(r => r.current),
        borderColor: '#2ca3f5',
        backgroundColor: 'rgba(44,163,245,0.2)',
      },
      {
        label: 'Voltage (V)',
        data: readings.map(r => r.voltage),
        borderColor: '#85c9f9',
        backgroundColor: 'rgba(133,201,249,0.2)',
      },
      {
        label: 'Power (W)',
        data: readings.map(r => r.power),
        borderColor: '#f5a623',
        backgroundColor: 'rgba(245,166,35,0.2)',
      },
      {
        label: 'Bill (₹)',
        data: readings.map(r => (r.power/1000)*0.83*83),
        borderColor: '#00cc99',
        backgroundColor: 'rgba(0,204,153,0.2)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Device Metrics & Bill Trends' }
    }
  };

  return (
    <div className="dashboard">

      {/* Device Selection */}
      <div className="card device-select">
        <label>Select Device:</label>
        <select value={selectedDevice} onChange={e => setSelectedDevice(e.target.value)}>
          <option value="">--Choose Device--</option>
          {devices.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <button onClick={computeConsumption}>Compute Consumption</button>
      </div>

      {/* Devices Summary */}
      <div className="summary-cards">
        {devices.map(d => (
          <div key={d._id} className={`card device-card ${d._id===selectedDevice?'active':''}`} onClick={()=>setSelectedDevice(d._id)}>
            <h4>{d.name}</h4>
            <p>Voltage: {d.voltage} V</p>
            <p>Current: {d.current} A</p>
            <p>Power: {d.power} W</p>
            <p>Bill: ₹{((d.power/1000)*0.83*83).toFixed(2)}</p>
            <p>Status: <span className={d.online?'online':'offline'}>{d.online?'Online':'Offline'}</span></p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card chart-card">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Anomaly Alerts */}
      <div className="card alerts-card">
        <h4>⚠️ Anomaly Alerts</h4>
        {anomalyAlerts.length > 0 ? (
          <ul>
            {anomalyAlerts.map((a,i)=>(
              <li key={i}>{new Date(a.timestamp).toLocaleString()} - {a.message}</li>
            ))}
          </ul>
        ) : <p>No anomalies detected.</p>}
      </div>

      {/* Quick Tips */}
      <div className="card tips-card">
        <h4>💡 Energy Saving Tips</h4>
        <ul>
          <li>Turn off devices when not in use.</li>
          <li>Unplug chargers and adapters when idle.</li>
          <li>Use energy-efficient LEDs and appliances.</li>
          <li>Reduce heating/cooling when rooms are empty.</li>
          <li>Monitor your usage regularly to detect wastage.</li>
        </ul>
      </div>

    </div>
  );
}

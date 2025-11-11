import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Devices.css';

const BASE = "https://iot-pp8j.onrender.com/api";

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000); // auto-refresh
    return () => clearInterval(interval);
  }, []);

  async function fetchDevices() {
    try {
      setLoading(true);
      const r = await axios.get(BASE + '/devices');
      setDevices(r.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  async function addDevice() {
    if (!name) return alert('Enter device name');
    await axios.post(BASE + '/devices', { name, location: 'home', active: true });
    setName('');
    fetchDevices();
  }

  const filteredDevices = devices.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="devices-container">
      {/* Add Device Section */}
      <div className="card add-device-card">
        <h2>Add New Device</h2>
        <div className="device-actions">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Device name"
          />
          <button onClick={addDevice}>Add Device</button>
        </div>
        <div className="device-search">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search devices..."
          />
        </div>
      </div>

      {/* Devices List */}
      <div className="card devices-list">
        {loading ? (
          <p>Loading devices...</p>
        ) : filteredDevices.length === 0 ? (
          <p>No devices found.</p>
        ) : (
          <div className="scrollable-list">
            {filteredDevices.map(d => (
              <div key={d._id} className="device-card">
                <div className="device-info">
                  <strong>{d.name}</strong>
                  <div className="small">{d.location} • {new Date(d.createdAt).toLocaleString()}</div>
                </div>
                <div className="device-status">
                  <span className={`status-dot ${d.active ? 'online' : 'offline'}`}></span>
                  <Link to={`/dashboard/${d._id}`} className="open-btn">Open</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

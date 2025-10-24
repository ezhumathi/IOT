import React from 'react';
import './ReadingList.css';

export default function ReadingList({ readings }) {
  if(!readings || readings.length===0) return <p>No readings</p>;
  return (
    <div className="card">
      <h4>Latest Readings</h4>
      {readings.slice(-10).reverse().map(r=>(
        <div key={r._id} className="reading">
          <div>{new Date(r.timestamp).toLocaleTimeString()}</div>
          <div><strong>{r.watts} W</strong></div>
        </div>
      ))}
    </div>
  );
}

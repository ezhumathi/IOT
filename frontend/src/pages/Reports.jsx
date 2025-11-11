import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
  ResponsiveContainer
} from "recharts";
import "./Reports.css";

export default function Reports() {

  const barData = [
    { name: "Lighting", usage: 400 },
    { name: "AC", usage: 300 },
    { name: "Fridge", usage: 500 },
    { name: "Others", usage: 200 },
  ];

  const pieData = [
    { name: "Lighting", value: 40 },
    { name: "AC", value: 30 },
    { name: "Refrigerator", value: 20 },
    { name: "Others", value: 10 },
  ];

  const lineData = [
    { time: "10:00", usage: 200 },
    { time: "10:30", usage: 300 },
    { time: "11:00", usage: 250 },
    { time: "11:30", usage: 400 },
    { time: "12:00", usage: 350 },
    { time: "12:30", usage: 500 },
  ];

  const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE"];

  return (
    <div className="page">
      <h1> Energy Reports</h1>
      <p>Track your devices, energy consumption, and cost savings in real-time.</p>

      <div className="charts-container">

        {/* --- Bar Chart --- */}
        <div className="chart-card fade-in">
          <h3>Device Usage (Bar Chart)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="usage"
                fill="#00C49F"
                animationBegin={300}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* --- Pie Chart --- */}
        <div className="chart-card fade-in delay-1">
          <h3>Energy Distribution (Pie Chart)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="value"
                label
                isAnimationActive={true}
                animationBegin={400}
                animationDuration={1600}
                animationEasing="ease-in-out"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* --- Line Chart --- */}
        <div className="chart-card line-chart fade-in delay-2">
          <h3>Real-Time Usage (Line Chart)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="usage"
                stroke="#FF8042"
                strokeWidth={3}
                dot={false}
                isAnimationActive={true}
                animationBegin={500}
                animationDuration={1800}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

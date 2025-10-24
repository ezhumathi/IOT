import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing">

      {/* Header */}
      <header className="landing-header">
        <h1 className="logo">⚡ Energy Analyzer</h1>
        <nav>
          <Link to="/login" className="btn">Login</Link>
          <Link to="/signup" className="btn btn-outline">Signup</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h2>Smart Energy Monitoring for a Sustainable Future</h2>
          <p>
            Monitor your electricity usage in real-time, reduce costs, and optimize your home or office
            with our IoT-powered insights.
          </p>
          
        </div>
        <img 
          src="https://media.gettyimages.com/id/1367307631/photo/financial-growth-graph-coins-plants-and-light-bulb.jpg?s=612x612&w=0&k=20&c=xl23-AX2A3G4uBgwoKkT64Osr64InfEXnTstO1kpDEc=" 
          alt="Energy Monitoring" 
          className="hero-img" 
        />
      </section>

      {/* About Section */}
      <section className="about">
        <div className="section-container">
          <h2>About Energy Analyzer</h2>
          <p>
            Energy Analyzer is a modern IoT solution to track and optimize energy consumption. 
            Using sensors connected to appliances, it collects data in real-time and delivers insights
            through a clean, easy-to-use dashboard.
          </p>
          <p>
            Reduce wastage, save costs, and make your space smarter and more sustainable 🌿.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="section-container">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <img src="https://cdn-icons-png.flaticon.com/512/3448/3448379.png" alt="IoT Sensors" width="48"/>
              <h3>IoT Sensors</h3>
              <p>Monitor device usage in real-time with smart sensors.</p>
            </div>
            <div className="feature-card">
              <img src="https://cdn-icons-png.flaticon.com/512/888/888879.png" alt="Cloud Storage" width="48"/>
              <h3>Cloud Storage</h3>
              <p>Secure cloud storage for your energy data and insights.</p>
            </div>
            <div className="feature-card">
              <img src="https://cdn-icons-png.flaticon.com/512/3062/3062634.png" alt="AI Analysis" width="48"/>
              <h3>AI Analysis</h3>
              <p>Predict usage trends and receive smart optimization tips.</p>
            </div>
            <div className="feature-card">
              <img src="https://cdn-icons-png.flaticon.com/512/888/888847.png" alt="Dashboard" width="48"/>
              <h3>Interactive Dashboard</h3>
              <p>Visualize your energy usage and get actionable recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="section-container">
          <h2>Take Control of Your Energy</h2>
          <p>
            Join thousands of users improving their energy efficiency.
            Sign up today and start monitoring your energy usage effortlessly.
          </p>
          <Link to="/signup" className="cta-btn big">Sign Up Now</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="section-container">
          <p>© {new Date().getFullYear()} Energy Analyzer. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

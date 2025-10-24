import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Nav.css";

function Nav() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">⚡IoT Energy Analyzer</div>
        <div className="navbar-links">
          <Link to="/home">Home</Link> {/* Changed from "/" to "/home" */}
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/devices">Devices</Link>
          <Link to="/reports">Reports</Link>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Nav;

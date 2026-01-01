import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png'; // adjust if your path differs

export function NavBar() {
  const { pathname } = useLocation();
  const isActive = (path: string) => (pathname === path ? 'active' : '');

  return (
    <nav>
      <div className="logo">
        <img src={logo} alt="Personnel" />
      </div>
      <ul>
        <li><Link className={isActive('/')} to="/">HOME</Link></li>
        <li><Link className={isActive('/contact')} to="/contact">Contact Us</Link></li>
        <li><Link className={isActive('/login')} to="/login">Log In</Link></li>
      </ul>
    </nav>
  );
}

/**
 * CodeDNA
 * MobileBottomNav.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiMessageSquare, FiBell, FiSearch, FiMenu } from 'react-icons/fi';
import './MobileBottomNav.css';

const MobileBottomNav: React.FC = () => {
  return (
    <nav className="mobile-bottom-nav">
      <NavLink to="/" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <FiHome size={24} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/friends" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <FiUsers size={24} />
        <span>Friends</span>
      </NavLink>
      <NavLink to="/messages" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <FiMessageSquare size={24} />
        <span>Chats</span>
      </NavLink>
      <NavLink to="/notifications" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <FiBell size={24} />
        <span>Alerts</span>
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <FiSearch size={24} />
        <span>Search</span>
      </NavLink>
    </nav>
  );
};

export default MobileBottomNav;

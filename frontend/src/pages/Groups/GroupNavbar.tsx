/**
 * CodeDNA
 * GroupNavbar.tsx — core functionality
 * exports: none
 * used_by: internal
 * rules: Follow project conventions
 * agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
 */

import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import './GroupNavbar.css';

const GroupNavbar: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <nav className="group-navbar">
      <div className="group-navbar-container">
        <NavLink 
          to={`/groups/${id}`} 
          end
          className={({ isActive }) => `group-nav-item ${isActive ? 'active' : ''}`}
        >
          Discussion
        </NavLink>
        <NavLink 
          to={`/groups/${id}/about`} 
          className={({ isActive }) => `group-nav-item ${isActive ? 'active' : ''}`}
        >
          About
        </NavLink>
        <NavLink 
          to={`/groups/${id}/members`} 
          className={({ isActive }) => `group-nav-item ${isActive ? 'active' : ''}`}
        >
          Members
        </NavLink>
        <NavLink 
          to={`/groups/${id}/media`} 
          className={({ isActive }) => `group-nav-item ${isActive ? 'active' : ''}`}
        >
          Media
        </NavLink>
        <NavLink 
          to={`/groups/${id}/files`} 
          className={({ isActive }) => `group-nav-item ${isActive ? 'active' : ''}`}
        >
          Files
        </NavLink>
      </div>
    </nav>
  );
};

export default GroupNavbar;

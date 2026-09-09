import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Library from './pages/Library';
import Search from './pages/Search';
import Downloads from './pages/Downloads';
import MangaDetails from './pages/MangaDetails';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="logo">📚</span>
          <h1>Mangarr</h1>
        </div>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            Library
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => isActive ? 'active' : ''}>
            Add Manga
          </NavLink>
          <NavLink to="/downloads" className={({ isActive }) => isActive ? 'active' : ''}>
            Downloads
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
            Settings
          </NavLink>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/search" element={<Search />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/manga/:id" element={<MangaDetails />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

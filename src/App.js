import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import CategoryPage from './pages/CategoryPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import CallbackPage from './pages/CallbackPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/category/:category" element={<CategoryPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/login/callback" element={<CallbackPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
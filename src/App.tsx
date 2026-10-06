import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PremiumProvider } from './context/PremiumContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import SubscriptionPage from './pages/SubscriptionPage';
import SmartUnion from './pages/smart-union/SmartUnion';
import SmartDepenses from './pages/smart-depenses/SmartDepenses';
import SmartJours from './pages/smart-jours/SmartJours';
import MobileAppTest from './pages/test/MobileAppTest';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <PremiumProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/smart-depenses/*" element={<SmartDepenses />} />
                <Route path="/smart-jours/*" element={<SmartJours />} />
                <Route path="/smart-union" element={<SmartUnion />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/parametres" element={<Settings />} />
                <Route path="/mobile-test" element={<MobileAppTest />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </PremiumProvider>
      </Router>
    </ThemeProvider>
  );
}

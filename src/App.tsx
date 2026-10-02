/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import TenantDashboard from './pages/TenantDashboard';
import Listings from './pages/Listings';
import Auth from './pages/Auth';
import KYCForm from './pages/KYCForm';
import Chat from './pages/Chat';
import AdminDashboard from './pages/AdminDashboard';
import TenantVerificationPortal from './pages/TenantVerificationPortal';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { AuthProvider } from './context/AuthContext';
import AIChatbot from './components/AIChatbot';
import TermsAcceptanceModal from './components/TermsAcceptanceModal';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Global terms acceptance popup */}
        <TermsAcceptanceModal />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/tenant" element={<TenantDashboard />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/apply/:propertyId" element={<KYCForm />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/check-tenant" element={<Navigate to="/dashboard?tab=verify-tenant" replace />} />
          <Route path="/verify-tenant" element={<Navigate to="/dashboard?tab=verify-tenant" replace />} />
          <Route path="/verify/:token" element={<TenantVerificationPortal />} />
          <Route path="/verify" element={<TenantVerificationPortal />} />
          <Route path="/tenant-check/:token" element={<TenantVerificationPortal />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
        <AIChatbot />
      </BrowserRouter>
    </AuthProvider>
  );
}

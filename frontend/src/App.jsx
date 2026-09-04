import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import DemoControlPanel from './components/DemoControlPanel';

import LandingPage from './pages/LandingPage';
import TouristDashboard from './pages/TouristDashboard';
import TouristRegister from './pages/TouristRegister';
import LoginPage from './pages/LoginPage';
import VerifyDigitalIdPage from './pages/VerifyDigitalIdPage';
import AuthorityDashboard from './pages/AuthorityDashboard';
import GeoFenceManagementPage from './pages/GeoFenceManagementPage';
import IncidentManagementPage from './pages/IncidentManagementPage';
import BlockchainLedgerPage from './pages/BlockchainLedgerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PrivacyCompliancePage from './pages/PrivacyCompliancePage';
import VendorMarketplacePage from './pages/VendorMarketplacePage';

import PatrioticLoader from './components/PatrioticLoader';
import OfflineGhostMeshModal from './components/OfflineGhostMeshModal';

export default function App() {
  const [showPatrioticLoader, setShowPatrioticLoader] = useState(true);
  const [showMeshModal, setShowMeshModal] = useState(false);

  const [currentUser, setCurrentUser] = useState({
    id: 'usr_tourist_01',
    name: 'Rohan Verma',
    email: 'rohan.verma@example.com',
    role: 'TOURIST',
    touristId: 'TID-1024'
  });

  const [touristProfile, setTouristProfile] = useState(null);
  const [digitalId, setDigitalId] = useState(null);
  const [allTourists, setAllTourists] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [emergencyServices, setEmergencyServices] = useState([]);
  const [activeSosIncident, setActiveSosIncident] = useState(null);

  // Initial Data Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. Fetch Tourists
      const resT = await fetch('/api/tourists');
      const dataT = await resT.json();
      if (dataT.success) {
        setAllTourists(dataT.tourists);
        const myProfile = dataT.tourists.find((t) => t.touristId === 'TID-1024') || dataT.tourists[0];
        setTouristProfile(myProfile);
      }

      // 2. Fetch Digital ID
      const resDid = await fetch('/api/digital-id/TID-1024');
      const dataDid = await resDid.json();
      if (dataDid.success) {
        setDigitalId(dataDid.digitalId);
      }

      // 3. Fetch Geo-Fences
      const resG = await fetch('/api/geofences');
      const dataG = await resG.json();
      if (dataG.success) setGeofences(dataG.geofences);

      // 4. Fetch Incidents
      const resI = await fetch('/api/incidents');
      const dataI = await resI.json();
      if (dataI.success) {
        setIncidents(dataI.incidents);
        const sosInc = dataI.incidents.find(
          (i) => i.touristId === 'TID-1024' && i.type === 'SOS Emergency' && i.status !== 'RESOLVED'
        );
        setActiveSosIncident(sosInc || null);
      }

      // 5. Fetch Notifications
      const resN = await fetch('/api/notifications');
      const dataN = await resN.json();
      if (dataN.success) setNotifications(dataN.notifications);

    } catch (err) {
      console.error('Fetch Error:', err);
    }
  };

  // Trigger SIH Judge Demo Scenario
  const handleTriggerScenario = async (scenarioId) => {
    try {
      const res = await fetch(`/api/demo/scenario/${scenarioId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ touristId: currentUser.touristId || 'TID-1024' })
      });
      const data = await res.json();
      await fetchInitialData();
      return data;
    } catch (err) {
      console.error('Scenario Error:', err);
    }
  };

  // Quick Role Switcher for Evaluators
  const handleSwitchUser = (role) => {
    if (role === 'AUTHORITY') {
      setCurrentUser({
        id: 'usr_auth_01',
        name: 'Dr. Ananya Sharma',
        email: 'authority@safetour.gov.in',
        role: 'AUTHORITY',
        department: 'S.A.F.A.R. Central Command Desk'
      });
    } else {
      setCurrentUser({
        id: 'usr_tourist_01',
        name: 'Rohan Verma',
        email: 'rohan.verma@example.com',
        role: 'TOURIST',
        touristId: 'TID-1024'
      });
    }
  };

  // Location update handler
  const handleUpdateLocation = async (lat, lng, address) => {
    try {
      const res = await fetch('/api/tourists/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ touristId: currentUser.touristId || 'TID-1024', lat, lng, address })
      });
      const data = await res.json();
      await fetchInitialData();
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // Zone Simulation Handler
  const handleSimulateZone = async (targetZoneType) => {
    try {
      const res = await fetch('/api/tourists/simulate-zone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ touristId: currentUser.touristId || 'TID-1024', targetZoneType })
      });
      const data = await res.json();
      await fetchInitialData();
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // Route Deviation Simulation Handler
  const handleSimulateDeviation = async () => {
    try {
      const res = await fetch('/api/trips/simulate-deviation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ touristId: currentUser.touristId || 'TID-1024', offsetKm: 3.8 })
      });
      const data = await res.json();
      await fetchInitialData();
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger SOS Handler
  const handleTriggerSos = async () => {
    try {
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ touristId: currentUser.touristId || 'TID-1024' })
      });
      const data = await res.json();
      await fetchInitialData();
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // Cancel SOS Handler
  const handleCancelSos = async (reason) => {
    try {
      const res = await fetch('/api/sos/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ touristId: currentUser.touristId || 'TID-1024', reason })
      });
      const data = await res.json();
      await fetchInitialData();
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // Incident status update handler
  const handleUpdateIncidentStatus = async (id, status, assignedAuthority, responseNotes, manualSeverityOverride, manualCategoryOverride) => {
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignedAuthority, responseNotes, manualSeverityOverride, manualCategoryOverride })
      });
      const data = await res.json();
      await fetchInitialData();
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // Mark notifications read
  const handleMarkRead = async () => {
    try {
      await fetch('/api/notifications/read', { method: 'POST' });
      await fetchInitialData();
    } catch (err) {
      console.error(err);
    }
  };

  // Login handler
  const handleLoginSuccess = (loginData) => {
    setCurrentUser(loginData.user);
    if (loginData.tourist) setTouristProfile(loginData.tourist);
    if (loginData.digitalId) setDigitalId(loginData.digitalId);
    fetchInitialData();
  };

  return (
    <Router>
      <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-between">
        
        {/* Patriotic Indian Flag Animated Loading Screen */}
        {showPatrioticLoader && (
          <PatrioticLoader onLoadingComplete={() => setShowPatrioticLoader(false)} />
        )}

        {/* Navbar */}
        <Navbar
          currentUser={currentUser}
          onLogout={() => setCurrentUser(null)}
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onOpenMeshModal={() => setShowMeshModal(true)}
        />

        {/* Offline Ghost-Mesh Rescue Modal Simulator */}
        <OfflineGhostMeshModal
          isOpen={showMeshModal}
          onClose={() => setShowMeshModal(false)}
        />

        {/* Floating SIH Evaluator Demo Control Panel */}
        <DemoControlPanel
          onTriggerScenario={handleTriggerScenario}
          onSwitchUser={handleSwitchUser}
        />

        {/* Main Route Body */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage onScenarioTrigger={handleTriggerScenario} />} />

            <Route
              path="/register"
              element={<TouristRegister onRegisterSuccess={handleLoginSuccess} />}
            />

            <Route
              path="/login"
              element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
            />

            <Route
              path="/verify-id/:id"
              element={<VerifyDigitalIdPage />}
            />

            <Route
              path="/tourist-dashboard"
              element={
                <TouristDashboard
                  tourist={touristProfile}
                  digitalId={digitalId}
                  geofences={geofences}
                  emergencyServices={emergencyServices}
                  activeSosIncident={activeSosIncident}
                  onUpdateLocation={handleUpdateLocation}
                  onSimulateZone={handleSimulateZone}
                  onSimulateDeviation={handleSimulateDeviation}
                  onTriggerSos={handleTriggerSos}
                  onCancelSos={handleCancelSos}
                />
              }
            />

            <Route
              path="/authority-dashboard"
              element={
                <AuthorityDashboard
                  tourists={allTourists}
                  geofences={geofences}
                  incidents={incidents}
                  notifications={notifications}
                  emergencyServices={emergencyServices}
                  onUpdateIncidentStatus={handleUpdateIncidentStatus}
                  onRefreshData={fetchInitialData}
                />
              }
            />

            <Route
              path="/geo-fence-management"
              element={
                <GeoFenceManagementPage
                  geofences={geofences}
                  onRefreshData={fetchInitialData}
                />
              }
            />

            <Route
              path="/incidents"
              element={
                <IncidentManagementPage
                  incidents={incidents}
                  geofences={geofences}
                  onUpdateStatus={handleUpdateIncidentStatus}
                />
              }
            />

            <Route
              path="/blockchain-ledger"
              element={<BlockchainLedgerPage />}
            />

            <Route
              path="/analytics"
              element={<AnalyticsPage />}
            />

            <Route
              path="/privacy-compliance"
              element={<PrivacyCompliancePage />}
            />

            <Route
              path="/vendor-marketplace"
              element={<VendorMarketplacePage />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

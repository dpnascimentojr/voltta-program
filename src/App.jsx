import React, { useState, useEffect, useCallback } from "react";
import { setupStorage, readJSON } from "./lib/storage";
import { PROMOS_KEY, SETTINGS_KEY } from "./lib/constants";
import LoginScreen from "./screens/LoginScreen";
import CustomerDashboard from "./screens/CustomerDashboard";
import AdminPanel from "./screens/AdminPanel";

setupStorage();

export default function App() {
  const [customer, setCustomer] = useState(null);
  const [view, setView] = useState("login");
  const [promos, setPromos] = useState([]);
  const [settings, setSettings] = useState({});

  const loadPromos = useCallback(async () => {
    const list = await readJSON(PROMOS_KEY, []);
    setPromos(list);
  }, []);

  const loadSettings = useCallback(async () => {
    const currentSettings = await readJSON(SETTINGS_KEY, {});
    setSettings(currentSettings);
  }, []);

  useEffect(() => {
    loadPromos();
    loadSettings();
  }, [loadPromos, loadSettings]);

  const handleFoundCustomer = (foundCustomer) => {
    setCustomer(foundCustomer);
    setView("dashboard");
  };

  const handleGoAdmin = () => {
    setView("admin");
  };

  const handleBackToLogin = () => {
    setCustomer(null);
    setView("login");
  };

  const handleLogoutCustomer = () => {
    setCustomer(null);
    setView("login");
  };

  if (view === "admin") {
    return (
      <AdminPanel
        onExit={handleBackToLogin}
        promos={promos}
        refreshPromos={loadPromos}
        settings={settings}
        refreshSettings={loadSettings}
      />
    );
  }

  if (view === "dashboard" && customer) {
    return (
      <CustomerDashboard
        customer={customer}
        onLogout={handleLogoutCustomer}
        promos={promos}
        settings={settings}
      />
    );
  }

  return (
    <LoginScreen
      onFoundCustomer={handleFoundCustomer}
      onOpenAdmin={handleGoAdmin}
    />
  );
}
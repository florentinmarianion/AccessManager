import React, { useState, useEffect } from 'react';
import { DevErrorPanel } from './components/DevErrorPanel';
import { apiFetch } from "./utils/apiFetch";
import AppRouter from './AppRouter';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiFetch('/api/profile')
        .then(data => setUser(data))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) return (
    <>
      <div>Loading...</div>
      <DevErrorPanel />
    </>
  );

  return (
    <>
      <AppRouter user={user} setUser={setUser} handleLogout={handleLogout} />
      <DevErrorPanel />
    </>
  );
}

export default App;
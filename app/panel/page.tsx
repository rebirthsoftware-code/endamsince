'use client';

import React, { useState, useEffect } from 'react';
import './Panel.css';

export default function Panel() {
  const [personnelList, setPersonnelList] = useState<any[]>([]);
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>('');
  const [pinCode, setPinCode] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/personnel')
      .then(res => res.json())
      .then(data => setPersonnelList(data))
      .catch(console.error);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/panel/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personnelId: selectedPersonnel, pinCode })
      });
      
      if (res.ok) {
        setIsLoggedIn(true);
        fetchAppointments(selectedPersonnel);
      } else {
        setError('Hatalı PIN kodu veya personel.');
      }
    } catch (err) {
      setError('Giriş başarısız oldu.');
    }
  };

  const fetchAppointments = async (personnelId: string) => {
    try {
      const res = await fetch(`/api/panel/appointments?personnelId=${personnelId}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/panel/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAppointments(selectedPersonnel);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoggedIn) {
    const person = personnelList.find(p => p.id === selectedPersonnel);
    return (
      <div className="container section" style={{ minHeight: '80vh' }}>
        <div className="flex-between mb-8">
          <div>
            <h1 className="heading-2">Hoş Geldin, <span className="text-gold">{person?.name}</span></h1>
            <p className="text-secondary">Randevularınızı buradan yönetebilirsiniz.</p>
          </div>
          <button className="btn btn-outline" onClick={() => setIsLoggedIn(false)}>Çıkış Yap</button>
        </div>

        <div className="appointments-grid">
          {appointments.length > 0 ? appointments.map(app => (
            <div key={app.id} className="card appointment-card">
              <div className="flex-between mb-4">
                <h3 className="heading-3" style={{ fontSize: '1.2rem' }}>{app.customerName}</h3>
                <span className={`status-badge ${app.status.toLowerCase()}`}>
                  {app.status === 'PENDING' ? 'Bekliyor' : app.status === 'APPROVED' ? 'Onaylandı' : 'Reddedildi'}
                </span>
              </div>
              <p className="text-secondary mb-2">📞 {app.customerPhone}</p>
              <p className="text-secondary mb-4">📅 {app.date} 🕒 {app.time}</p>
              
              {app.status === 'PENDING' && (
                <div className="flex-between" style={{ gap: '1rem' }}>
                  <button className="btn btn-outline w-full" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => updateStatus(app.id, 'REJECTED')}>Reddet</button>
                  <button className="btn w-full" style={{ backgroundColor: 'var(--success)', color: '#fff' }} onClick={() => updateStatus(app.id, 'APPROVED')}>Onayla</button>
                </div>
              )}
            </div>
          )) : (
            <p className="text-secondary">Henüz bir randevunuz bulunmuyor.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container section flex-center" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form className="card glass" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }} onSubmit={handleLogin}>
        <h2 className="heading-2 text-center mb-6">Personel Girişi</h2>
        
        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
        
        <div className="input-group">
          <label className="input-label">Personel Seçin</label>
          <select className="input-field" required value={selectedPersonnel} onChange={e => setSelectedPersonnel(e.target.value)}>
            <option value="">Seçiniz</option>
            {personnelList.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">PIN Kodu (1234)</label>
          <input type="password" required className="input-field" value={pinCode} onChange={e => setPinCode(e.target.value)} placeholder="****" />
        </div>

        <button type="submit" className="btn btn-primary w-full mt-4" disabled={!selectedPersonnel || !pinCode}>
          Giriş Yap
        </button>
      </form>
    </div>
  );
}

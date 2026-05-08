'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import './Randevu.css';

function RandevuContent() {
  const searchParams = useSearchParams();
  const branchIdParam = searchParams.get('branchId');

  const [step, setStep] = useState(1);
  const [branches, setBranches] = useState<any[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>(branchIdParam || '');
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [takenTimes, setTakenTimes] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string>('');
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/branches')
      .then(res => res.json())
      .then(data => setBranches(data))
      .catch(err => console.error(err));
  }, []);

  /* ── Aktif saat slotlarını çek ── */
  useEffect(() => {
    fetch('/api/time-slots')
      .then(res => res.json())
      .then(data => {
        setAllSlots(Array.isArray(data?.slots) ? data.slots : []);
      })
      .catch(() => setAllSlots([]))
      .finally(() => setSlotsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetch(`/api/personnel?branchId=${selectedBranch}`)
        .then(res => res.json())
        .then(data => setPersonnel(data))
        .catch(err => console.error(err));
    }
  }, [selectedBranch]);

  /* ── Dolu saat listesini personel + tarih değişince çek ── */
  useEffect(() => {
    if (!selectedPersonnel || !date) {
      setTakenTimes([]);
      return;
    }
    fetch(`/api/appointments?personnelId=${selectedPersonnel}&date=${date}`)
      .then(res => res.json())
      .then(data => setTakenTimes(data.takenTimes || []))
      .catch(() => setTakenTimes([]));
    // Tarih değiştiğinde önceden seçili saat hâlâ uygun mu kontrol et
    setTime('');
  }, [selectedPersonnel, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personnelId: selectedPersonnel,
          customerName,
          customerPhone,
          date,
          time
        })
      });
      if (res.ok) {
        setSuccess(true);
      } else if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error || 'Bu saat artık dolu.');
        // Dolu saat listesini yenile + saati temizle
        if (selectedPersonnel && date) {
          fetch(`/api/appointments?personnelId=${selectedPersonnel}&date=${date}`)
            .then(r => r.json())
            .then(d => setTakenTimes(d.takenTimes || []));
        }
        setTime('');
        setStep(3);
      } else {
        setSubmitError('Randevu oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error(error);
      setSubmitError('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
    setIsSubmitting(false);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  if (success) {
    return (
      <div className="container section text-center" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="success-icon">✓</div>
        <h1 className="heading-2 text-gold">Randevunuz Alındı!</h1>
        <p className="text-secondary mt-4" style={{ fontSize: '1.2rem' }}>Sayın <strong>{customerName}</strong>, randevunuz başarıyla oluşturuldu.<br/>Personelimiz en kısa sürede randevunuzu onaylayacaktır.</p>
        <button className="btn btn-primary mt-8 mx-auto" onClick={() => window.location.href = '/'}>Ana Sayfaya Dön</button>
      </div>
    );
  }

  return (
    <div className="container section" style={{ minHeight: '80vh', paddingTop: '8rem' }}>
      <div className="text-center mb-8">
        <h1 className="heading-2">Randevu Oluştur</h1>
        <p className="text-secondary">Sadece 4 adımda yerinizi ayırtın.</p>
      </div>
      
      <div className="booking-card glass mx-auto shadow-lg">
        {/* Progress Bar */}
        <div className="progress-container mb-8">
          <div className="progress-bar" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>

        {step === 1 && (
          <div className="step-content fade-in">
            <h3 className="heading-3 mb-6">1. Şube Seçimi</h3>
            <div className="grid-options">
              {branches.map(b => (
                <div
                  key={b.id}
                  className={`option-card ${selectedBranch === b.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedBranch(b.id); setStep(2); }}
                >
                  <h4 className={selectedBranch === b.id ? 'text-gold' : ''}>{b.name}</h4>
                  <p className="text-secondary text-sm mt-2">{b.location}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content fade-in">
            <h3 className="heading-3 mb-6">2. Personel Seçimi</h3>
            <div className="grid-options">
              {personnel.map(p => (
                <div
                  key={p.id}
                  className={`option-card ${selectedPersonnel === p.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedPersonnel(p.id); setStep(3); }}
                >
                  <div className="personnel-avatar" style={{ overflow: 'hidden', position: 'relative' }}>
                    {p.image ? (
                      <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      p.name.charAt(0)
                    )}
                  </div>
                  <h4 className={selectedPersonnel === p.id ? 'text-gold' : ''}>{p.name}</h4>
                  <p className="text-secondary text-sm">{p.role}</p>
                </div>
              ))}
              {personnel.length === 0 && <p className="text-secondary">Bu şubede personel bulunamadı.</p>}
            </div>
            <div className="flex-between mt-8 gap-4">
              <button className="btn btn-outline" onClick={prevStep}>Geri</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content fade-in">
            <h3 className="heading-3 mb-6">3. Tarih ve Saat</h3>
            <div className="input-group">
              <label className="input-label">Tarih Seçin</label>
              <input type="date" className="input-field input-lg" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="input-group mt-6">
              <label className="input-label">Saat Seçin (saate tıklayın, otomatik devam edecek)</label>
              {!date ? (
                <p className="text-secondary text-sm">Önce bir tarih seçin.</p>
              ) : slotsLoading ? (
                <p className="text-secondary text-sm">Saatler yükleniyor…</p>
              ) : allSlots.length === 0 ? (
                <p className="text-secondary text-sm">Şu anda uygun saat yok. Lütfen daha sonra tekrar deneyin.</p>
              ) : (() => {
                // Bugün için geçmiş saatler seçilemez
                const today = new Date();
                const isToday = date === today.toISOString().split('T')[0];
                const nowHM = isToday
                  ? `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`
                  : '';
                return (
                <div className="time-slot-grid">
                  {allSlots.map(slot => {
                    const isTaken = takenTimes.includes(slot);
                    const isPast = isToday && slot <= nowHM;
                    const isSelected = time === slot;
                    const disabled = isTaken || isPast;
                    return (
                      <button
                        type="button"
                        key={slot}
                        disabled={disabled}
                        onClick={() => {
                          if (disabled) return;
                          setTime(slot);
                          setStep(4);
                        }}
                        className={`time-slot ${isSelected ? 'selected' : ''} ${isTaken ? 'taken' : ''} ${isPast ? 'past' : ''}`}
                      >
                        <span className="time-slot-hr">{slot}</span>
                        {isTaken && !isPast && <span className="time-slot-badge">Dolu</span>}
                        {isPast && <span className="time-slot-badge">Geçti</span>}
                      </button>
                    );
                  })}
                </div>
                );
              })()}
            </div>
            <div className="flex-between mt-8 gap-4">
              <button className="btn btn-outline" onClick={prevStep}>Geri</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <form className="step-content fade-in" onSubmit={handleSubmit}>
            <h3 className="heading-3 mb-6">4. Kişisel Bilgileriniz</h3>
            
            <div className="highlight-box mb-6">
              <p className="text-sm text-secondary">Seçtiğiniz Randevu:</p>
              <p className="font-bold">{date} - Saat {time}</p>
            </div>

            {submitError && (
              <div className="error-box mb-4">
                {submitError}
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Adınız ve Soyadınız <span className="text-danger">*</span></label>
              <input required type="text" className="input-field input-lg focus-gold" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Örn: Ali Yılmaz" />
            </div>
            <div className="input-group mt-6">
              <label className="input-label">Telefon Numaranız <span className="text-danger">*</span></label>
              <input
                required
                type="tel"
                inputMode="numeric"
                className="input-field input-lg focus-gold"
                value={customerPhone}
                onChange={e => {
                  // "0" prefiksi her zaman sabit kalsın; kullanıcı silmeye/değiştirmeye çalışsa bile
                  const v = e.target.value;
                  const rest = v.startsWith('0') ? v.slice(1) : v;
                  // sadece rakamlar
                  const digits = rest.replace(/\D/g, '').slice(0, 10);
                  setCustomerPhone('0' + digits);
                }}
                placeholder="0 5XX XXX XX XX"
              />
            </div>

            <div className="flex-between mt-10 gap-4">
              <button type="button" className="btn btn-outline" onClick={prevStep}>Geri</button>
              <button type="submit" className="btn btn-primary flex-grow btn-lg" disabled={!customerName || customerPhone.length < 11 || isSubmitting}>
                {isSubmitting ? 'Onaylanıyor...' : 'Randevuyu Tamamla'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RandevuPage() {
  return (
    <Suspense fallback={<div className="container section text-center" style={{ paddingTop: '10rem' }}>Yükleniyor...</div>}>
      <RandevuContent />
    </Suspense>
  );
}

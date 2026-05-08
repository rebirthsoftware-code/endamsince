'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PushSubscribeButton from '@/components/PushSubscribeButton';
import {
  approvalMessage,
  reminderMessage,
  cancellationMessage,
  buildWhatsAppUrl,
  hoursUntil,
} from '@/lib/whatsapp';
import './Panel.css';

/** Yaklaşıyor sayılan eşik (saat). */
const APPROACHING_HOURS = 2;

const SESSION_KEY = 'endamsince_panel_session_v1';
const REMINDED_KEY = 'endamsince_panel_reminded_v1';
const REFRESH_MS = 30_000;
/** Tarayıcı bildirimini ne kadar önce ateşleyelim (saat). */
const REMIND_HOURS_BEFORE = 2;

type Personnel = {
  id: string; name: string; role: string; image?: string | null;
  branchId?: string;
  branch?: { id: string; name: string; location?: string };
};
type Appointment = {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt?: string;
};
type Filter = 'all' | 'pending' | 'today' | 'week' | 'approved';

const STATUS_LABEL: Record<Appointment['status'], string> = {
  PENDING: 'Bekliyor',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  CANCELLED: 'İptal Edildi',
};

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function within7Days(dateStr: string): boolean {
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = (d.getTime() - now.getTime()) / 86400000;
  return diff >= 0 && diff <= 6;
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('tr-TR', { weekday: 'short', day: '2-digit', month: 'short' });
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Panel() {
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>('');
  const [pinCode, setPinCode] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState('');
  const [sessionChecked, setSessionChecked] = useState(false);
  const [filter, setFilter] = useState<Filter>('pending');
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());
  const [showAddModal, setShowAddModal] = useState(false);

  /* ── Personel listesi ── */
  useEffect(() => {
    fetch('/api/personnel')
      .then((res) => res.json())
      .then((data: Personnel[]) => setPersonnelList(data))
      .catch(console.error);
  }, []);

  /* ── Saati gerçek zamanlı tut (header + reminder kontrolü) ── */
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  /* ── Yaklaşan randevular için tarayıcı bildirimi ── */
  useEffect(() => {
    if (!isLoggedIn) return;
    if (typeof window === 'undefined') return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    if (appointments.length === 0) return;

    let reminded: Record<string, number> = {};
    try { reminded = JSON.parse(localStorage.getItem(REMINDED_KEY) || '{}'); } catch {}

    let changed = false;
    const cutoff = Date.now() - 24 * 3_600_000;
    // Eski kayıtları temizle (24 saatten yaşlı)
    for (const k of Object.keys(reminded)) {
      if ((reminded[k] || 0) < cutoff) { delete reminded[k]; changed = true; }
    }

    for (const a of appointments) {
      if (a.status !== 'APPROVED') continue;
      const h = (new Date(`${a.date}T${a.time}:00`).getTime() - now.getTime()) / 3_600_000;
      if (h <= 0 || h > REMIND_HOURS_BEFORE) continue;
      if (reminded[a.id]) continue;

      try {
        const minutesLeft = Math.max(1, Math.round(h * 60));
        const title = `⏰ Yaklaşan Randevu — ${a.customerName}`;
        const body = `${a.time} (${minutesLeft} dk içinde) · ${a.customerPhone}`;
        // Service worker üzerinden göster (kapalı sekmede de çalışır), yoksa direkt Notification
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(title, {
              body,
              icon: '/icons/icon-192.png',
              badge: '/icons/icon-192.png',
              tag: `reminder-${a.id}`,
              requireInteraction: true,
              data: { url: '/panel' },
            } as NotificationOptions).catch(() => {
              try { new Notification(title, { body, icon: '/icons/icon-192.png', tag: `reminder-${a.id}` }); } catch {}
            });
          });
        } else {
          new Notification(title, { body, icon: '/icons/icon-192.png', tag: `reminder-${a.id}` });
        }
      } catch (e) {
        console.error('Reminder notification error:', e);
      }

      reminded[a.id] = Date.now();
      changed = true;
    }

    if (changed) {
      try { localStorage.setItem(REMINDED_KEY, JSON.stringify(reminded)); } catch {}
    }
  }, [now, appointments, isLoggedIn]);

  /* ── Randevu çekme ── */
  const fetchAppointments = useCallback(async (personnelId: string, silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`/api/panel/appointments?personnelId=${personnelId}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  /* ── Otomatik yenileme ── */
  useEffect(() => {
    if (!isLoggedIn || !selectedPersonnel) return;
    const id = setInterval(() => fetchAppointments(selectedPersonnel, true), REFRESH_MS);
    return () => clearInterval(id);
  }, [isLoggedIn, selectedPersonnel, fetchAppointments]);

  /* ── Kalıcı oturum ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const { personnelId } = JSON.parse(raw);
        if (personnelId) {
          setSelectedPersonnel(personnelId);
          setIsLoggedIn(true);
          fetchAppointments(personnelId);
        }
      }
    } catch (_) {
      /* yok say, giriş ekranı gösterilir */
    } finally {
      setSessionChecked(true);
    }
  }, [fetchAppointments]);

  /* ── Login ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/panel/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personnelId: selectedPersonnel, pinCode }),
      });
      if (res.ok) {
        setIsLoggedIn(true);
        try {
          localStorage.setItem(SESSION_KEY, JSON.stringify({ personnelId: selectedPersonnel, at: Date.now() }));
        } catch (_) {}
        fetchAppointments(selectedPersonnel);
      } else {
        setError('Hatalı PIN kodu.');
        setPinCode('');
      }
    } catch (err) {
      setError('Giriş başarısız oldu.');
    }
  };

  const handleLogout = () => {
    try { localStorage.removeItem(SESSION_KEY); } catch (_) {}
    setIsLoggedIn(false);
    setSelectedPersonnel('');
    setPinCode('');
    setAppointments([]);
    setError('');
    setFilter('pending');
  };

  const updateStatus = async (id: string, status: Appointment['status']) => {
    // Optimistik UI
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      const res = await fetch(`/api/panel/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) fetchAppointments(selectedPersonnel, true); // rollback
    } catch (err) {
      console.error(err);
      fetchAppointments(selectedPersonnel, true);
    }
  };

  /* ── Filtrelenmiş + sıralı liste ── */
  const filtered = useMemo(() => {
    const tk = todayISO();
    let list = appointments;
    switch (filter) {
      case 'pending':  list = appointments.filter((a) => a.status === 'PENDING'); break;
      case 'today':    list = appointments.filter((a) => a.date === tk); break;
      case 'week':     list = appointments.filter((a) => within7Days(a.date)); break;
      case 'approved': list = appointments.filter((a) => a.status === 'APPROVED'); break;
      default: break;
    }
    return [...list].sort((a, b) => {
      // Pending üste, sonra tarih+saat
      if (a.status !== b.status) {
        if (a.status === 'PENDING') return -1;
        if (b.status === 'PENDING') return 1;
      }
      const ad = a.date + ' ' + a.time;
      const bd = b.date + ' ' + b.time;
      return ad.localeCompare(bd);
    });
  }, [appointments, filter]);

  /* ── İstatistikler ── */
  const stats = useMemo(() => {
    const tk = todayISO();
    return {
      today:    appointments.filter((a) => a.date === tk).length,
      pending:  appointments.filter((a) => a.status === 'PENDING').length,
      approved: appointments.filter((a) => a.status === 'APPROVED').length,
      rejected: appointments.filter((a) => a.status === 'REJECTED').length,
    };
  }, [appointments]);

  /* ──────────────────── RENDER ──────────────────── */

  if (!sessionChecked) {
    return <div className="panel-skeleton" />;
  }

  /* ── LOGIN ── */
  if (!isLoggedIn) {
    return <LoginView
      personnelList={personnelList}
      selectedPersonnel={selectedPersonnel}
      setSelectedPersonnel={(id) => { setSelectedPersonnel(id); setError(''); }}
      pinCode={pinCode}
      setPinCode={setPinCode}
      onSubmit={handleLogin}
      error={error}
    />;
  }

  /* ── DASHBOARD ── */
  const me = personnelList.find((p) => p.id === selectedPersonnel);

  return (
    <div className="panel-shell">
      {/* Header */}
      <header className="panel-header">
        <div className="panel-header-inner">
          <div className="panel-user">
            <div className="panel-avatar">
              {me?.image
                ? <img src={me.image} alt={me.name} />
                : <span>{me ? initials(me.name) : '?'}</span>}
            </div>
            <div className="panel-user-info">
              <span className="panel-user-hi">Hoş geldin</span>
              <strong className="panel-user-name">{me?.name ?? '—'}</strong>
              <span className="panel-user-role">{me?.role}</span>
            </div>
          </div>
          <div className="panel-header-actions">
            <span className="panel-now" aria-hidden>
              {now.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
              {' · '}
              {now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              className="panel-icon-btn"
              onClick={() => fetchAppointments(selectedPersonnel)}
              aria-label="Yenile"
              title="Yenile"
              disabled={refreshing}
            >
              <span className={refreshing ? 'spin' : ''}>↻</span>
            </button>
            <button className="panel-logout" onClick={handleLogout} aria-label="Çıkış">
              Çıkış
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="panel-container">
        <PushSubscribeButton personnelId={selectedPersonnel} />

        <button
          type="button"
          className="panel-add-btn"
          onClick={() => setShowAddModal(true)}
        >
          <span aria-hidden>＋</span> Telefonla Randevu Ekle
        </button>

        <section className="stat-grid">
          <StatCard label="Bugün" value={stats.today} accent="orange" icon="📅" />
          <StatCard label="Bekleyen" value={stats.pending} accent="amber" icon="⏳" highlight />
          <StatCard label="Onaylanan" value={stats.approved} accent="green" icon="✓" />
          <StatCard label="Reddedilen" value={stats.rejected} accent="red" icon="✕" />
        </section>

        {/* Filters */}
        <nav className="filter-bar" role="tablist">
          {([
            { id: 'pending', label: 'Bekleyen', count: stats.pending },
            { id: 'today',   label: 'Bugün',    count: stats.today },
            { id: 'week',    label: 'Bu Hafta', count: appointments.filter((a) => within7Days(a.date)).length },
            { id: 'approved',label: 'Onaylı',   count: stats.approved },
            { id: 'all',     label: 'Tümü',     count: appointments.length },
          ] as { id: Filter; label: string; count: number }[]).map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              className={`filter-tab ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              <span className="filter-count">{f.count}</span>
            </button>
          ))}
        </nav>

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <ul className="appt-list">
            {filtered.map((a) => (
              <AppointmentCard
                key={a.id}
                appt={a}
                onUpdate={updateStatus}
                now={now}
                branchName={
                  personnelList.find((p) => p.id === selectedPersonnel)?.branch?.name
                }
              />
            ))}
          </ul>
        )}
      </div>

      {showAddModal && (
        <AddAppointmentModal
          personnelId={selectedPersonnel}
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            fetchAppointments(selectedPersonnel, true);
          }}
        />
      )}
    </div>
  );
}

/* ────────── MANUEL RANDEVU MODAL'I ────────── */

function AddAppointmentModal({
  personnelId, onClose, onCreated,
}: {
  personnelId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('0');
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState('');
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [taken, setTaken] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch('/api/time-slots')
      .then((r) => r.json())
      .then((d) => setAllSlots(Array.isArray(d?.slots) ? d.slots : []))
      .catch(() => setAllSlots([]))
      .finally(() => setLoadingSlots(false));
  }, []);

  useEffect(() => {
    if (!date || !personnelId) { setTaken([]); return; }
    fetch(`/api/appointments?personnelId=${personnelId}&date=${date}`)
      .then((r) => r.json())
      .then((d) => setTaken(Array.isArray(d?.takenTimes) ? d.takenTimes : []))
      .catch(() => setTaken([]));
    setTime('');
  }, [date, personnelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.length < 11 || !date || !time) return;
    setSubmitting(true);
    setErr('');
    try {
      const res = await fetch('/api/panel/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personnelId,
          customerName: name.trim(),
          customerPhone: phone.trim(),
          date,
          time,
        }),
      });
      if (res.ok) {
        onCreated();
      } else if (res.status === 409) {
        setErr('Bu saat zaten dolu. Lütfen başka bir saat seçin.');
        // taken'ı tazele
        fetch(`/api/appointments?personnelId=${personnelId}&date=${date}`)
          .then((r) => r.json())
          .then((d) => setTaken(Array.isArray(d?.takenTimes) ? d.takenTimes : []));
        setTime('');
      } else {
        setErr('Randevu kaydedilemedi.');
      }
    } catch {
      setErr('Bağlantı hatası.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel-modal-backdrop" onClick={onClose}>
      <div className="panel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="panel-modal-head">
          <h3>Telefonla Randevu Ekle</h3>
          <button className="panel-modal-close" onClick={onClose} aria-label="Kapat">✕</button>
        </div>
        <form className="panel-modal-form" onSubmit={handleSubmit}>
          <label>
            <span>Müşteri Adı</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ad Soyad"
              autoFocus
              required
            />
          </label>
          <label>
            <span>Telefon</span>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => {
                const v = e.target.value;
                const rest = v.startsWith('0') ? v.slice(1) : v;
                const digits = rest.replace(/\D/g, '').slice(0, 10);
                setPhone('0' + digits);
              }}
              placeholder="0 5XX XXX XX XX"
              required
            />
          </label>
          <label>
            <span>Tarih</span>
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
          <div className="panel-modal-slots">
            <span className="panel-modal-slots-label">Saat</span>
            {loadingSlots ? (
              <div className="panel-modal-empty">Saatler yükleniyor…</div>
            ) : allSlots.length === 0 ? (
              <div className="panel-modal-empty">Tanımlı saat yok.</div>
            ) : (
              <div className="panel-modal-slot-grid">
                {allSlots.map((s) => {
                  const isTaken = taken.includes(s);
                  const isActive = time === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      className={`panel-modal-slot ${isActive ? 'active' : ''} ${isTaken ? 'taken' : ''}`}
                      disabled={isTaken}
                      onClick={() => setTime(s)}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {err && <p className="panel-modal-err">{err}</p>}

          <div className="panel-modal-actions">
            <button type="button" className="panel-modal-btn ghost" onClick={onClose}>
              Vazgeç
            </button>
            <button
              type="submit"
              className="panel-modal-btn primary"
              disabled={submitting || !name.trim() || phone.length < 11 || !date || !time}
            >
              {submitting ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ───────────────────── COMPONENTS ───────────────────── */

function StatCard({
  label, value, accent, icon, highlight,
}: {
  label: string;
  value: number;
  accent: 'orange' | 'amber' | 'green' | 'red';
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div className={`stat-card stat-${accent} ${highlight && value > 0 ? 'pulse' : ''}`}>
      <div className="stat-icon" aria-hidden>{icon}</div>
      <div className="stat-meta">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
      </div>
    </div>
  );
}

function AppointmentCard({
  appt, onUpdate, now, branchName,
}: {
  appt: Appointment;
  onUpdate: (id: string, status: Appointment['status']) => void;
  now: Date;
  branchName?: string;
}) {
  const phoneClean = (appt.customerPhone || '').replace(/\s+/g, '');

  const ctx = {
    customerName: appt.customerName,
    customerPhone: appt.customerPhone,
    date: appt.date,
    time: appt.time,
    branchName,
  };

  const hLeft = hoursUntil(appt.date, appt.time, now);
  const isFuture = hLeft > 0;
  const isApproaching = isFuture && hLeft <= APPROACHING_HOURS && appt.status === 'APPROVED';

  const handleCancel = () => {
    if (confirm(`${appt.customerName} - ${formatDate(appt.date)} ${appt.time} randevusunu iptal etmek istediğinize emin misiniz?`)) {
      onUpdate(appt.id, 'CANCELLED');
      const url = buildWhatsAppUrl(appt.customerPhone, cancellationMessage(ctx));
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  /** Onayla + WhatsApp onay mesajı tek hareket. */
  const handleApproveWithWhatsApp = () => {
    onUpdate(appt.id, 'APPROVED');
    const url = buildWhatsAppUrl(appt.customerPhone, approvalMessage(ctx));
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  /** Hatırlatma — onaylı randevular için. */
  const handleReminder = () => {
    const url = buildWhatsAppUrl(appt.customerPhone, reminderMessage(ctx));
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <li className={`appt-card status-${appt.status.toLowerCase()} ${isApproaching ? 'approaching' : ''}`}>
      <div className="appt-side" aria-hidden />

      <div className="appt-time-block">
        <span className="appt-time">{appt.time}</span>
        <span className="appt-date">{formatDate(appt.date)}</span>
      </div>

      <div className="appt-body">
        <div className="appt-row-top">
          <h3 className="appt-name">{appt.customerName}</h3>
          <div className="appt-row-tags">
            {isApproaching && (
              <span className="appt-badge appt-badge-soon" title={`Yaklaşık ${Math.max(1, Math.round(hLeft * 60))} dk kaldı`}>
                ⏰ YAKLAŞIYOR
              </span>
            )}
            <span className={`appt-status appt-status-${appt.status.toLowerCase()}`}>
              {STATUS_LABEL[appt.status]}
            </span>
          </div>
        </div>

        <div className="appt-phone">
          <span aria-hidden>📞</span>
          <span className="appt-phone-num">{appt.customerPhone}</span>
          <a
            href={`tel:${phoneClean}`}
            className="appt-call"
            aria-label={`${appt.customerName} numarasını ara`}
          >
            Ara
          </a>
        </div>

        {appt.status === 'PENDING' && (
          <div className="appt-actions">
            <button
              className="appt-btn appt-btn-reject"
              onClick={() => onUpdate(appt.id, 'REJECTED')}
            >
              Reddet
            </button>
            <button
              className="appt-btn appt-btn-approve appt-btn-wa"
              onClick={handleApproveWithWhatsApp}
              title="Randevuyu onayla ve WhatsApp ile müşteriye onay mesajı gönder"
            >
              <span aria-hidden>✅</span> Onayla & WhatsApp
            </button>
          </div>
        )}

        {appt.status === 'APPROVED' && (
          <div className="appt-actions">
            <button
              className={`appt-btn appt-btn-remind ${isApproaching ? 'pulse' : ''}`}
              onClick={handleReminder}
              title="Müşteriye WhatsApp üzerinden hatırlatma gönder"
            >
              <span aria-hidden>💬</span> {isApproaching ? 'Hatırlat (Yaklaşıyor!)' : 'WhatsApp Hatırlat'}
            </button>
            <button
              className="appt-btn appt-btn-cancel"
              onClick={handleCancel}
            >
              <span aria-hidden>✕</span> İptal
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

function EmptyState({ filter }: { filter: Filter }) {
  const messages: Record<Filter, { icon: string; title: string; desc: string }> = {
    pending:  { icon: '✓', title: 'Tüm randevular onaylanmış', desc: 'Şu anda bekleyen yeni randevu yok.' },
    today:    { icon: '☕', title: 'Bugün için randevu yok', desc: 'Hayırlı bir gün geçirin.' },
    week:     { icon: '📅', title: 'Bu hafta randevu yok', desc: 'Önümüzdeki günler boş görünüyor.' },
    approved: { icon: '⭐', title: 'Onaylı randevu yok', desc: 'Henüz onayladığınız bir randevu bulunmuyor.' },
    all:      { icon: '📋', title: 'Henüz randevu yok', desc: 'Yeni randevular geldiğinde burada listelenecek.' },
  };
  const m = messages[filter];
  return (
    <div className="appt-empty">
      <div className="appt-empty-icon">{m.icon}</div>
      <h3>{m.title}</h3>
      <p>{m.desc}</p>
    </div>
  );
}

/* ────────────── LOGIN VIEW ────────────── */

function LoginView({
  personnelList, selectedPersonnel, setSelectedPersonnel,
  pinCode, setPinCode, onSubmit, error,
}: {
  personnelList: Personnel[];
  selectedPersonnel: string;
  setSelectedPersonnel: (id: string) => void;
  pinCode: string;
  setPinCode: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
}) {
  const me = personnelList.find((p) => p.id === selectedPersonnel);

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand-mark">EN</span>
          <span className="login-brand-text">
            <strong>Endamsince</strong>
            <small>Personel Paneli</small>
          </span>
        </div>

        {!me ? (
          <>
            <h2 className="login-title">Kim giriş yapıyor?</h2>
            <p className="login-sub">Hesabınızı seçin</p>
            <div className="login-personnel-grid">
              {personnelList.length === 0 && (
                <div className="login-loading">Personel yükleniyor…</div>
              )}
              {personnelList.map((p) => (
                <button
                  key={p.id}
                  className="login-personnel"
                  onClick={() => setSelectedPersonnel(p.id)}
                >
                  <div className="login-avatar">
                    {p.image ? <img src={p.image} alt={p.name} /> : <span>{initials(p.name)}</span>}
                  </div>
                  <div className="login-personnel-meta">
                    <strong>{p.name}</strong>
                    <span>{p.role}</span>
                  </div>
                  <span className="login-arrow" aria-hidden>›</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <form onSubmit={onSubmit} className="login-pin-form">
            <button
              type="button"
              className="login-back"
              onClick={() => { setSelectedPersonnel(''); setPinCode(''); }}
            >
              ← Geri
            </button>
            <div className="login-selected">
              <div className="login-avatar lg">
                {me.image ? <img src={me.image} alt={me.name} /> : <span>{initials(me.name)}</span>}
              </div>
              <strong>{me.name}</strong>
              <span>{me.role}</span>
            </div>

            <label className="login-pin-label">PIN Kodu</label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              className="login-pin-input"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="••••"
              maxLength={8}
            />

            {error && <p className="login-error">{error}</p>}

            <button
              type="submit"
              className="login-submit"
              disabled={!pinCode}
            >
              Giriş Yap
            </button>
          </form>
        )}
      </div>

      <div className="login-foot">Endamsince · 1979</div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PushSubscribeButton from '@/components/PushSubscribeButton';
import {
  approvalMessage,
  reminderMessage,
  cancellationMessage,
  rejectionMessage,
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
  services?: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt?: string;
};
type Filter = 'all' | 'pending' | 'today' | 'approved';
type View = 'list' | 'reports';
type PeriodKind = 'day' | 'week' | 'month';

/** Panel'den manuel saat bloku için kullanılan placeholder müşteri adı. */
const MANUAL_BLOCK_NAME = 'Manuel Blok';

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

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDaysISO(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** Rapor dönemi: offset 0 = içinde bulunulan gün/hafta/ay, -1 = bir önceki… */
function periodRange(kind: PeriodKind, offset: number): { start: string; end: string; label: string } {
  const now = new Date();
  if (kind === 'day') {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    const iso = toISO(d);
    return {
      start: iso,
      end: iso,
      label: d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }),
    };
  }
  if (kind === 'week') {
    const d = new Date(now);
    const dow = (d.getDay() + 6) % 7; // Pazartesi = 0
    d.setDate(d.getDate() - dow + offset * 7);
    const e = new Date(d);
    e.setDate(e.getDate() + 6);
    const fmt = (x: Date) => x.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    return { start: toISO(d), end: toISO(e), label: `${fmt(d)} – ${fmt(e)}` };
  }
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    start: toISO(d),
    end: toISO(e),
    label: d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
  };
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
  const [view, setView] = useState<View>('list');

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

  /* ── Manuel bloklar + geçmiş tarihli kayıtlar listeden hariç ── */
  const realAppointments = useMemo(() => {
    const tk = todayISO();
    return appointments.filter(
      (a) => a.customerName !== MANUAL_BLOCK_NAME && a.date >= tk
    );
  }, [appointments]);

  /* ── Filtrelenmiş + sıralı liste ── */
  const filtered = useMemo(() => {
    const tk = todayISO();
    let list = realAppointments;
    switch (filter) {
      case 'pending':  list = realAppointments.filter((a) => a.status === 'PENDING'); break;
      case 'today':    list = realAppointments.filter((a) => a.date === tk); break;
      case 'approved': list = realAppointments.filter((a) => a.status === 'APPROVED'); break;
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
  }, [realAppointments, filter]);

  /* ── İstatistikler ── */
  const stats = useMemo(() => {
    const tk = todayISO();
    return {
      today:    realAppointments.filter((a) => a.date === tk).length,
      pending:  realAppointments.filter((a) => a.status === 'PENDING').length,
      approved: realAppointments.filter((a) => a.status === 'APPROVED').length,
      rejected: realAppointments.filter((a) => a.status === 'REJECTED').length,
    };
  }, [realAppointments]);

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

        {/* Görünüm sekmeleri */}
        <nav className="panel-view-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={view === 'list'}
            className={`panel-view-tab ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            <span aria-hidden>📋</span> Randevular
          </button>
          <button
            role="tab"
            aria-selected={view === 'reports'}
            className={`panel-view-tab ${view === 'reports' ? 'active' : ''}`}
            onClick={() => setView('reports')}
          >
            <span aria-hidden>📊</span> Raporlar
          </button>
        </nav>

        {view === 'reports' ? (
          <ReportsView
            appointments={appointments}
            branchId={me?.branchId ?? me?.branch?.id}
          />
        ) : (
        <>
        <button
          type="button"
          className="panel-add-btn"
          onClick={() => setShowAddModal(true)}
        >
          <span aria-hidden>🕒</span> Saat Bloklama
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
            { id: 'approved',label: 'Onaylı',   count: stats.approved },
            { id: 'all',     label: 'Tümü',     count: realAppointments.length },
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
        </>
        )}
      </div>

      {showAddModal && (
        <BlockSlotsModal
          personnelId={selectedPersonnel}
          appointments={appointments}
          onClose={() => setShowAddModal(false)}
          onChanged={() => fetchAppointments(selectedPersonnel, true)}
        />
      )}
    </div>
  );
}

/* ────────── SAAT BLOKLAMA MODAL'I ────────── */
/** Detay tutmadan saat dilimini doluya alır. Tıkla → blokla, tekrar tıkla → aç.
 *  Gerçek müşteri randevuları kilitli (yanlışlıkla silinmesin). */

function BlockSlotsModal({
  personnelId, appointments, onClose, onChanged,
}: {
  personnelId: string;
  appointments: Appointment[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [busyTime, setBusyTime] = useState<string>(''); // o an işlem yapılan saat
  const [closingDay, setClosingDay] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!personnelId || !date) return;
    setLoadingSlots(true);
    fetch(
      `/api/time-slots?personnelId=${encodeURIComponent(personnelId)}&date=${encodeURIComponent(date)}`
    )
      .then((r) => r.json())
      .then((d) => setAllSlots(Array.isArray(d?.slots) ? d.slots : []))
      .catch(() => setAllSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [personnelId, date]);

  // O tarihteki aktif kayıtları map'le: time → appointment
  const slotState = useMemo(() => {
    const map = new Map<string, Appointment>();
    for (const a of appointments) {
      if (a.date !== date) continue;
      if (a.status !== 'PENDING' && a.status !== 'APPROVED') continue;
      map.set(a.time, a);
    }
    return map;
  }, [appointments, date]);

  const blockSlot = async (time: string) => {
    setErr('');
    setBusyTime(time);
    try {
      const res = await fetch('/api/panel/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personnelId, date, time }),
      });
      if (res.ok) {
        onChanged();
      } else if (res.status === 409) {
        setErr('Bu saat zaten dolu.');
        onChanged();
      } else {
        setErr('Saat bloklanamadı.');
      }
    } catch {
      setErr('Bağlantı hatası.');
    } finally {
      setBusyTime('');
    }
  };

  const blockedToday = useMemo(
    () => Array.from(slotState.values()).filter((a) => a.customerName === MANUAL_BLOCK_NAME),
    [slotState]
  );

  /* Kapatılabilir (boş + geçmemiş) saatler */
  const freeSlots = useMemo(() => {
    const isToday = date === todayISO();
    const t = new Date();
    const nowHM = isToday
      ? `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
      : '';
    return allSlots.filter((s) => !slotState.has(s) && !(isToday && s <= nowHM));
  }, [allSlots, slotState, date]);

  /** Günü kapat: kalan tüm boş saatleri tek seferde manuel blokla. */
  const closeDay = async () => {
    if (freeSlots.length === 0) return;
    const realCount = Array.from(slotState.values()).filter((a) => a.customerName !== MANUAL_BLOCK_NAME).length;
    const warn = realCount > 0
      ? `\n\nDikkat: Bu günde ${realCount} gerçek randevu var; onlar silinmez, gerekirse tek tek iptal etmelisiniz.`
      : '';
    if (!confirm(`${formatDate(date)} gününün kalan ${freeSlots.length} boş saati kapatılacak; müşteriler bu güne randevu alamayacak.${warn}\n\nEmin misiniz?`)) return;
    setErr('');
    setClosingDay(true);
    try {
      const results = await Promise.all(
        freeSlots.map((time) =>
          fetch('/api/panel/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ personnelId, date, time }),
          })
            .then((r) => r.ok || r.status === 409) // 409 = zaten dolu, sorun değil
            .catch(() => false)
        )
      );
      if (results.some((ok) => !ok)) setErr('Bazı saatler kapatılamadı. Listeyi kontrol edip tekrar deneyin.');
      onChanged();
    } finally {
      setClosingDay(false);
    }
  };

  const unblockAll = async () => {
    if (blockedToday.length === 0) return;
    if (!confirm(`${date} tarihindeki ${blockedToday.length} bloku kaldırmak istediğinize emin misiniz?`)) return;
    setErr('');
    try {
      await Promise.all(
        blockedToday.map((a) =>
          fetch(`/api/panel/appointments/${a.id}`, { method: 'DELETE' })
        )
      );
      onChanged();
    } catch {
      setErr('Bağlantı hatası.');
    }
  };

  const unblockSlot = async (id: string, time: string) => {
    setErr('');
    setBusyTime(time);
    try {
      const res = await fetch(`/api/panel/appointments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onChanged();
      } else {
        setErr('Saat açılamadı.');
      }
    } catch {
      setErr('Bağlantı hatası.');
    } finally {
      setBusyTime('');
    }
  };

  return (
    <div className="panel-modal-backdrop" onClick={onClose}>
      <div className="panel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="panel-modal-head">
          <h3>Saat Bloklama</h3>
          <button className="panel-modal-close" onClick={onClose} aria-label="Kapat">✕</button>
        </div>
        <div className="panel-modal-form">
          <label>
            <span>Tarih</span>
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <p className="panel-modal-hint">
            Boş saate tıkla → blokla. Bloklu saate (✕) tıkla → kaldır. 🔒 işaretli gerçek randevular değiştirilemez.
          </p>

          {!loadingSlots && freeSlots.length > 0 && (
            <button
              type="button"
              className="panel-modal-close-day"
              onClick={closeDay}
              disabled={closingDay || !!busyTime}
            >
              {closingDay ? 'Gün kapatılıyor…' : `🚫 Günü Kapat (${freeSlots.length} boş saat)`}
            </button>
          )}

          {!loadingSlots && allSlots.length > 0 && freeSlots.length === 0 && blockedToday.length > 0 && (
            <p className="panel-modal-day-closed">
              🚫 Bu gün müşterilere kapalı. Açmak için blokları kaldırın.
            </p>
          )}

          {blockedToday.length > 0 && (
            <button
              type="button"
              className="panel-modal-unblock-all"
              onClick={unblockAll}
            >
              Bu Tarihteki Tüm Blokları Kaldır ({blockedToday.length})
            </button>
          )}

          <div className="panel-modal-slots">
            {loadingSlots ? (
              <div className="panel-modal-empty">Saatler yükleniyor…</div>
            ) : allSlots.length === 0 ? (
              <div className="panel-modal-empty">Tanımlı saat yok.</div>
            ) : (
              <div className="panel-modal-slot-grid">
                {(() => {
                  const today = todayISO();
                  const isToday = date === today;
                  const t = new Date();
                  const nowHM = isToday
                    ? `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
                    : '';
                  return allSlots.map((s) => {
                    const appt = slotState.get(s);
                    const isManualBlock = appt?.customerName === MANUAL_BLOCK_NAME;
                    const isRealBooking = !!appt && !isManualBlock;
                    const isPast = isToday && s <= nowHM;
                    const isBusy = busyTime === s;

                    let cls = 'panel-modal-slot';
                    if (isRealBooking) cls += ' locked';
                    else if (isManualBlock) cls += ' blocked';
                    if (isPast) cls += ' past';

                    return (
                      <button
                        key={s}
                        type="button"
                        className={cls}
                        disabled={isRealBooking || isBusy || isPast}
                        onClick={() => {
                          if (isRealBooking || isPast) return;
                          if (isManualBlock && appt) unblockSlot(appt.id, s);
                          else blockSlot(s);
                        }}
                        title={
                          isPast
                            ? 'Geçmiş saat'
                            : isRealBooking
                            ? `${appt?.customerName} — gerçek randevu, kilitli`
                            : isManualBlock
                            ? 'Manuel blok — tıkla, kaldır'
                            : 'Boş — tıkla, blokla'
                        }
                      >
                        {isRealBooking && <span className="slot-icon" aria-hidden>🔒</span>}
                        <span>{s}</span>
                        {isManualBlock && !isPast && <span className="slot-remove" aria-hidden>✕</span>}
                      </button>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {err && <p className="panel-modal-err">{err}</p>}

          <div className="panel-modal-actions">
            <button type="button" className="panel-modal-btn primary" onClick={onClose}>
              Tamam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────── RAPORLAR ────────── */

const DAY_HOURS = Array.from({ length: 12 }, (_, i) => 9 + i); // 09..20
const WEEK_DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function ReportsView({ appointments, branchId }: { appointments: Appointment[]; branchId?: string }) {
  const [kind, setKind] = useState<PeriodKind>('day');
  const [offset, setOffset] = useState(0);
  const [priceMap, setPriceMap] = useState<Record<string, number> | null>(null);

  // Dönem türü değişince navigasyonu bugüne sıfırla
  useEffect(() => { setOffset(0); }, [kind]);

  // Tahmini ciro için şube hizmet fiyatları
  useEffect(() => {
    if (!branchId) return;
    fetch(`/api/services?branchId=${encodeURIComponent(branchId)}`)
      .then((r) => r.json())
      .then((list) => {
        if (!Array.isArray(list)) return;
        const map: Record<string, number> = {};
        for (const s of list) {
          const n = parseInt(String(s?.price ?? '').replace(/[^\d]/g, ''), 10);
          if (s?.name && Number.isFinite(n) && n > 0) map[s.name] = n;
        }
        setPriceMap(map);
      })
      .catch(() => {});
  }, [branchId]);

  const range = useMemo(() => periodRange(kind, offset), [kind, offset]);
  const prevRange = useMemo(() => periodRange(kind, offset - 1), [kind, offset]);

  const inRange = useCallback(
    (r: { start: string; end: string }) =>
      appointments.filter(
        (a) => a.customerName !== MANUAL_BLOCK_NAME && a.date >= r.start && a.date <= r.end
      ),
    [appointments]
  );

  const inPeriod = useMemo(() => inRange(range), [inRange, range]);
  const prevTotal = useMemo(() => inRange(prevRange).length, [inRange, prevRange]);

  const counts = useMemo(() => ({
    total: inPeriod.length,
    approved: inPeriod.filter((a) => a.status === 'APPROVED').length,
    pending: inPeriod.filter((a) => a.status === 'PENDING').length,
    lost: inPeriod.filter((a) => a.status === 'REJECTED' || a.status === 'CANCELLED').length,
  }), [inPeriod]);

  /* İş yükü = onaylı + bekleyen (red/iptal grafiğe girmez) */
  const active = useMemo(
    () => inPeriod.filter((a) => a.status === 'APPROVED' || a.status === 'PENDING'),
    [inPeriod]
  );

  const buckets = useMemo(() => {
    if (kind === 'day') {
      return DAY_HOURS.map((h) => {
        const hh = String(h).padStart(2, '0');
        return {
          key: hh,
          label: hh,
          title: `${hh}:00–${hh}:59`,
          count: active.filter((a) => a.time.slice(0, 2) === hh).length,
        };
      });
    }
    if (kind === 'week') {
      return WEEK_DAY_NAMES.map((n, i) => {
        const d = addDaysISO(range.start, i);
        return { key: d, label: n, title: formatDate(d), count: active.filter((a) => a.date === d).length };
      });
    }
    const lastDay = Number(range.end.slice(8, 10));
    return Array.from({ length: lastDay }, (_, i) => {
      const d = addDaysISO(range.start, i);
      const dayNo = i + 1;
      return {
        key: d,
        // Ayda 28-31 sütun sığsın diye etiketler seyrek
        label: dayNo === 1 || dayNo % 5 === 0 ? String(dayNo) : '',
        title: formatDate(d),
        count: active.filter((a) => a.date === d).length,
      };
    });
  }, [kind, active, range]);

  const maxCount = Math.max(1, ...buckets.map((b) => b.count));
  const activeTotal = active.length;

  /* Tahmini ciro: dönemin ONAYLI randevularındaki hizmetlerin şube fiyat toplamı */
  const revenue = useMemo(() => {
    if (!priceMap) return null;
    let sum = 0;
    let matched = false;
    for (const a of inPeriod) {
      if (a.status !== 'APPROVED') continue;
      for (const s of a.services ?? []) {
        const p = priceMap[s];
        if (p) { sum += p; matched = true; }
      }
    }
    return matched ? sum : null;
  }, [inPeriod, priceMap]);

  const topServices = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of active) for (const s of a.services ?? []) m.set(s, (m.get(s) ?? 0) + 1);
    return [...m.entries()].sort((x, y) => y[1] - x[1]).slice(0, 5);
  }, [active]);

  const delta = counts.total - prevTotal;

  return (
    <div className="reports">
      {/* Dönem türü */}
      <nav className="filter-bar" role="tablist">
        {([
          { id: 'day', label: 'Günlük' },
          { id: 'week', label: 'Haftalık' },
          { id: 'month', label: 'Aylık' },
        ] as { id: PeriodKind; label: string }[]).map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={kind === p.id}
            className={`filter-tab ${kind === p.id ? 'active' : ''}`}
            onClick={() => setKind(p.id)}
          >
            {p.label}
          </button>
        ))}
      </nav>

      {/* Dönem gezintisi */}
      <div className="report-nav">
        <button
          type="button"
          className="report-nav-btn"
          onClick={() => setOffset((o) => o - 1)}
          aria-label="Önceki dönem"
        >
          ‹
        </button>
        <strong className="report-nav-label">{range.label}</strong>
        <button
          type="button"
          className="report-nav-btn"
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
          disabled={offset >= 0}
          aria-label="Sonraki dönem"
        >
          ›
        </button>
      </div>

      {/* Özet kartlar */}
      <section className="stat-grid">
        <StatCard label="Toplam" value={counts.total} accent="orange" icon="📅" />
        <StatCard label="Onaylanan" value={counts.approved} accent="green" icon="✓" />
        <StatCard label="Bekleyen" value={counts.pending} accent="amber" icon="⏳" />
        <StatCard label="Red / İptal" value={counts.lost} accent="red" icon="✕" />
      </section>

      <p className="report-compare">
        Önceki dönem: <strong>{prevTotal}</strong> randevu
        {delta !== 0 && (
          <span className="report-compare-delta">
            {' '}({delta > 0 ? '▲' : '▼'} {Math.abs(delta)})
          </span>
        )}
      </p>

      {/* Tahmini ciro */}
      {revenue !== null && (
        <section className="report-card report-revenue">
          <span className="report-revenue-label">Tahmini Ciro</span>
          <strong className="report-revenue-value">₺{revenue.toLocaleString('tr-TR')}</strong>
          <small className="report-revenue-note">
            Onaylı randevulardaki hizmetlerin güncel şube fiyatlarına göre hesaplanır.
          </small>
        </section>
      )}

      {/* Yoğunluk grafiği */}
      <section className="report-card">
        <h3 className="report-card-title">
          Randevu Yoğunluğu <span>(onaylı + bekleyen)</span>
        </h3>
        {activeTotal === 0 ? (
          <p className="report-empty">Bu dönemde randevu yok.</p>
        ) : (
          <>
            <div
              className={`report-chart ${kind === 'month' ? 'dense' : ''}`}
              role="img"
              aria-label={`${range.label} randevu yoğunluğu grafiği`}
            >
              {buckets.map((b) => (
                <div key={b.key} className="report-bar-col" title={`${b.title}: ${b.count} randevu`}>
                  <span className="report-bar-val">
                    {b.count > 0 && (kind !== 'month' || b.count === maxCount) ? b.count : ''}
                  </span>
                  <div className="report-bar-track">
                    <div
                      className="report-bar"
                      style={{ height: `${Math.round((b.count / maxCount) * 100)}%` }}
                    />
                  </div>
                  <span className="report-bar-label">{b.label}</span>
                </div>
              ))}
            </div>
            <details className="report-table-details">
              <summary>Tablo görünümü</summary>
              <table className="report-table">
                <thead>
                  <tr><th>{kind === 'day' ? 'Saat' : 'Gün'}</th><th>Randevu</th></tr>
                </thead>
                <tbody>
                  {buckets.filter((b) => b.count > 0).map((b) => (
                    <tr key={b.key}><td>{b.title}</td><td>{b.count}</td></tr>
                  ))}
                </tbody>
              </table>
            </details>
          </>
        )}
      </section>

      {/* En çok istenen hizmetler */}
      {topServices.length > 0 && (
        <section className="report-card">
          <h3 className="report-card-title">En Çok İstenen Hizmetler</h3>
          <ul className="report-services">
            {topServices.map(([name, cnt]) => (
              <li key={name} className="report-service-row">
                <span className="report-service-name">{name}</span>
                <span className="report-service-track">
                  <span
                    className="report-service-bar"
                    style={{ width: `${Math.round((cnt / topServices[0][1]) * 100)}%` }}
                  />
                </span>
                <span className="report-service-count">{cnt}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
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

  /** Reddet + WhatsApp red mesajı. */
  const handleRejectWithWhatsApp = () => {
    if (!confirm(`${appt.customerName} - ${formatDate(appt.date)} ${appt.time} randevusunu reddetmek istediğinize emin misiniz?`)) return;
    onUpdate(appt.id, 'REJECTED');
    const url = buildWhatsAppUrl(appt.customerPhone, rejectionMessage(ctx));
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

        {appt.services && appt.services.length > 0 && (
          <div className="appt-services">
            <span aria-hidden>✂️</span>
            <span>{appt.services.join(' · ')}</span>
          </div>
        )}

        {appt.status === 'PENDING' && (
          <div className="appt-actions">
            <button
              className="appt-btn appt-btn-reject"
              onClick={handleRejectWithWhatsApp}
              title="Randevuyu reddet ve WhatsApp ile bilgi ver"
            >
              Reddet & WhatsApp
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

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import './Admin.css';

const SESSION_KEY = 'endamsince_admin_session_v1';
const HEADER = 'x-admin-pin';

type Service = {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  icon: string;
  popular: boolean;
  active: boolean;
  order: number;
};
type Personnel = {
  id: string;
  name: string;
  role: string;
  image?: string | null;
  pinCode: string;
  branchId: string;
  branch?: { id: string; name: string };
};
type Branch = {
  id: string;
  name: string;
  location: string;
  image?: string | null;
};
type Tab = 'services' | 'personnel' | 'branches';

function authHeaders(pin: string): HeadersInit {
  return { 'Content-Type': 'application/json', [HEADER]: pin };
}

export default function AdminPage() {
  const [pin, setPin] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [sessionChecked, setSessionChecked] = useState(false);

  const [tab, setTab] = useState<Tab>('services');
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const showToast = useCallback((type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2800);
  }, []);

  /* ── Session restore ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const { pin } = JSON.parse(raw);
        if (pin) {
          setAuthPin(pin);
          setAuthed(true);
        }
      }
    } catch (_) {}
    setSessionChecked(true);
  }, []);

  /* ── Login ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        setAuthPin(pin);
        setAuthed(true);
        try { localStorage.setItem(SESSION_KEY, JSON.stringify({ pin, at: Date.now() })); } catch (_) {}
      } else {
        setAuthError('Hatalı PIN');
        setPin('');
      }
    } catch (_) {
      setAuthError('Bağlantı hatası');
    }
  };

  const logout = () => {
    try { localStorage.removeItem(SESSION_KEY); } catch (_) {}
    setAuthed(false);
    setAuthPin('');
    setPin('');
  };

  if (!sessionChecked) return <div className="admin-skeleton" />;

  if (!authed) {
    return (
      <div className="admin-login-shell">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <div className="admin-login-mark">⚙️</div>
          <h1>Yönetim Paneli</h1>
          <p>Yönetici PIN kodunuzu girin</p>
          <input
            type="password"
            inputMode="text"
            autoComplete="off"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN kodu"
            className="admin-login-input"
          />
          {authError && <div className="admin-login-error">{authError}</div>}
          <button type="submit" disabled={!pin} className="admin-login-submit">
            Giriş Yap
          </button>
          <a href="/" className="admin-login-back">← Ana siteye dön</a>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <span className="admin-mark">EN</span>
            <div>
              <strong>Endamsince</strong>
              <small>Yönetim Paneli</small>
            </div>
          </div>
          <button className="admin-logout" onClick={logout}>⎋ Çıkış</button>
        </div>
        <nav className="admin-tabs" role="tablist">
          <button
            className={`admin-tab ${tab === 'services' ? 'active' : ''}`}
            onClick={() => setTab('services')}
          >
            <span className="admin-tab-icon">✂️</span>
            Hizmetler
          </button>
          <button
            className={`admin-tab ${tab === 'personnel' ? 'active' : ''}`}
            onClick={() => setTab('personnel')}
          >
            <span className="admin-tab-icon">👤</span>
            Personel
          </button>
          <button
            className={`admin-tab ${tab === 'branches' ? 'active' : ''}`}
            onClick={() => setTab('branches')}
          >
            <span className="admin-tab-icon">🏢</span>
            Şubeler
          </button>
        </nav>
      </header>

      <main className="admin-container">
        {tab === 'services'  && <ServicesTab pin={authPin} showToast={showToast} />}
        {tab === 'personnel' && <PersonnelTab pin={authPin} showToast={showToast} />}
        {tab === 'branches'  && <BranchesTab pin={authPin} showToast={showToast} />}
      </main>

      {toast && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SERVICES TAB
   ═══════════════════════════════════════════════ */

const EMPTY_SERVICE: Omit<Service, 'id'> = {
  name: '', price: '', duration: '', description: '',
  features: [], icon: '✂️', popular: false, active: true, order: 0,
};

function ServicesTab({ pin, showToast }: { pin: string; showToast: (t: 'ok'|'err', m: string) => void }) {
  const [list, setList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/services', { headers: authHeaders(pin) });
      if (res.ok) setList(await res.json());
    } finally {
      setLoading(false);
    }
  }, [pin]);
  useEffect(() => { load(); }, [load]);

  const save = async (data: Omit<Service, 'id'>, id?: string) => {
    const res = await fetch(id ? `/api/admin/services/${id}` : '/api/admin/services', {
      method: id ? 'PATCH' : 'POST',
      headers: authHeaders(pin),
      body: JSON.stringify(data),
    });
    if (res.ok) {
      showToast('ok', id ? 'Güncellendi' : 'Eklendi');
      await load();
      setEditing(null);
      setCreating(false);
    } else {
      showToast('err', 'Kaydedilemedi');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Bu hizmeti silmek istiyor musunuz?')) return;
    const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE', headers: authHeaders(pin) });
    if (res.ok) { showToast('ok', 'Silindi'); await load(); }
    else showToast('err', 'Silinemedi');
  };

  const toggleActive = async (s: Service) => {
    await save({ ...s, active: !s.active }, s.id);
  };

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2>Hizmetler</h2>
          <p>Müşterilere gösterilen hizmetleri ve fiyatları yönet.</p>
        </div>
        <button className="admin-btn-primary" onClick={() => setCreating(true)}>
          + Yeni Hizmet
        </button>
      </div>

      {loading ? <div className="admin-loading">Yükleniyor…</div> : (
        <div className="admin-grid">
          {list.map((s) => (
            <article key={s.id} className={`svc-item ${!s.active ? 'inactive' : ''}`}>
              <div className="svc-item-head">
                <span className="svc-item-icon">{s.icon}</span>
                <div className="svc-item-meta">
                  <h3>
                    {s.name}
                    {s.popular && <span className="svc-popular">★</span>}
                  </h3>
                  <span className="svc-item-price">{s.price}</span>
                </div>
              </div>
              <div className="svc-item-row">
                <span className="svc-item-dur">⏱ {s.duration || '—'}</span>
                <span className={`svc-item-state ${s.active ? 'on' : 'off'}`}>
                  {s.active ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              {s.description && <p className="svc-item-desc">{s.description}</p>}
              <div className="svc-item-actions">
                <button className="admin-btn-ghost" onClick={() => toggleActive(s)}>
                  {s.active ? 'Gizle' : 'Aktif Et'}
                </button>
                <button className="admin-btn-ghost" onClick={() => setEditing(s)}>Düzenle</button>
                <button className="admin-btn-danger" onClick={() => remove(s.id)}>Sil</button>
              </div>
            </article>
          ))}
          {list.length === 0 && (
            <div className="admin-empty">Henüz hizmet eklenmemiş.</div>
          )}
        </div>
      )}

      {(editing || creating) && (
        <ServiceModal
          initial={editing ? editing : { ...EMPTY_SERVICE, order: list.length + 1 }}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(d) => save(d, editing?.id)}
        />
      )}
    </section>
  );
}

function ServiceModal({
  initial, onClose, onSave,
}: {
  initial: Omit<Service, 'id'> | Service;
  onClose: () => void;
  onSave: (data: Omit<Service, 'id'>) => void;
}) {
  const [form, setForm] = useState<Omit<Service, 'id'>>({
    name: initial.name,
    price: initial.price,
    duration: initial.duration,
    description: initial.description,
    features: initial.features ?? [],
    icon: initial.icon,
    popular: initial.popular,
    active: initial.active,
    order: initial.order ?? 0,
  });
  const [featureText, setFeatureText] = useState((initial.features ?? []).join('\n'));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      features: featureText.split('\n').map((x) => x.trim()).filter(Boolean),
    });
  };

  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <header className="admin-modal-head">
          <h3>{('id' in initial) ? 'Hizmet Düzenle' : 'Yeni Hizmet'}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="admin-modal-body">
          <div className="admin-row-2">
            <Field label="İkon (emoji)">
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} maxLength={4} />
            </Field>
            <Field label="Sıra">
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Hizmet Adı" required>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <div className="admin-row-2">
            <Field label="Fiyat (örn: 350₺)" required>
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </Field>
            <Field label="Süre (örn: 45 dk)">
              <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </Field>
          </div>
          <Field label="Açıklama">
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Özellikler (her satıra bir tane)">
            <textarea rows={4} value={featureText} onChange={(e) => setFeatureText(e.target.value)} placeholder="Saç analizi&#10;Wash & Cut&#10;..." />
          </Field>
          <div className="admin-row-2">
            <label className="admin-check">
              <input type="checkbox" checked={form.popular} onChange={(e) => setForm({ ...form, popular: e.target.checked })} />
              <span>Popüler Hizmet</span>
            </label>
            <label className="admin-check">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <span>Aktif (sitede göster)</span>
            </label>
          </div>
        </div>

        <footer className="admin-modal-foot">
          <button type="button" className="admin-btn-ghost" onClick={onClose}>İptal</button>
          <button type="submit" className="admin-btn-primary">Kaydet</button>
        </footer>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PERSONNEL TAB
   ═══════════════════════════════════════════════ */

function PersonnelTab({ pin, showToast }: { pin: string; showToast: (t: 'ok'|'err', m: string) => void }) {
  const [list, setList] = useState<Personnel[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Personnel | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, b] = await Promise.all([
        fetch('/api/admin/personnel', { headers: authHeaders(pin) }).then((r) => r.ok ? r.json() : []),
        fetch('/api/admin/branches', { headers: authHeaders(pin) }).then((r) => r.ok ? r.json() : []),
      ]);
      setList(p); setBranches(b);
    } finally { setLoading(false); }
  }, [pin]);
  useEffect(() => { load(); }, [load]);

  const save = async (data: Partial<Personnel>, id?: string) => {
    const res = await fetch(id ? `/api/admin/personnel/${id}` : '/api/admin/personnel', {
      method: id ? 'PATCH' : 'POST',
      headers: authHeaders(pin),
      body: JSON.stringify(data),
    });
    if (res.ok) { showToast('ok', id ? 'Güncellendi' : 'Eklendi'); await load(); setEditing(null); setCreating(false); }
    else { const err = await res.json().catch(() => ({})); showToast('err', err.error || 'Kaydedilemedi'); }
  };

  const remove = async (id: string) => {
    if (!confirm('Bu personeli ve tüm randevularını silmek istiyor musunuz?')) return;
    const res = await fetch(`/api/admin/personnel/${id}`, { method: 'DELETE', headers: authHeaders(pin) });
    if (res.ok) { showToast('ok', 'Silindi'); await load(); }
    else showToast('err', 'Silinemedi');
  };

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2>Personel</h2>
          <p>Berberleri ve giriş PIN kodlarını yönet.</p>
        </div>
        <button className="admin-btn-primary" onClick={() => setCreating(true)}>+ Yeni Personel</button>
      </div>

      {loading ? <div className="admin-loading">Yükleniyor…</div> : (
        <div className="admin-grid">
          {list.map((p) => (
            <article key={p.id} className="prs-item">
              <div className="prs-avatar">
                {p.image
                  ? <img src={p.image} alt={p.name} />
                  : <span>{p.name.split(/\s+/).slice(0,2).map((w) => w[0]?.toUpperCase()).join('')}</span>
                }
              </div>
              <div className="prs-meta">
                <h3>{p.name}</h3>
                <span className="prs-role">{p.role}</span>
                <span className="prs-branch">🏢 {p.branch?.name || '—'}</span>
                <span className="prs-pin">PIN: <code>{p.pinCode}</code></span>
              </div>
              <div className="prs-actions">
                <button className="admin-btn-ghost" onClick={() => setEditing(p)}>Düzenle</button>
                <button className="admin-btn-danger" onClick={() => remove(p.id)}>Sil</button>
              </div>
            </article>
          ))}
          {list.length === 0 && <div className="admin-empty">Henüz personel eklenmemiş.</div>}
        </div>
      )}

      {(editing || creating) && (
        <PersonnelModal
          initial={editing}
          branches={branches}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(d) => save(d, editing?.id)}
        />
      )}
    </section>
  );
}

function PersonnelModal({
  initial, branches, onClose, onSave,
}: {
  initial: Personnel | null;
  branches: Branch[];
  onClose: () => void;
  onSave: (data: Partial<Personnel>) => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    role: initial?.role ?? '',
    image: initial?.image ?? '',
    pinCode: initial?.pinCode ?? '',
    branchId: initial?.branchId ?? (branches[0]?.id ?? ''),
  });

  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <form
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      >
        <header className="admin-modal-head">
          <h3>{initial ? 'Personel Düzenle' : 'Yeni Personel'}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="admin-modal-body">
          <Field label="Ad Soyad" required>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Görev (örn: Baş Berber)" required>
            <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
          </Field>
          <Field label="Şube" required>
            <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })} required>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name} — {b.location}</option>)}
            </select>
          </Field>
          <Field label="Profil Foto URL (opsiyonel)">
            <input value={form.image ?? ''} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
          </Field>
          <Field label="PIN Kodu (panele giriş için)" required>
            <input value={form.pinCode} onChange={(e) => setForm({ ...form, pinCode: e.target.value })} required maxLength={8} />
          </Field>
        </div>

        <footer className="admin-modal-foot">
          <button type="button" className="admin-btn-ghost" onClick={onClose}>İptal</button>
          <button type="submit" className="admin-btn-primary">Kaydet</button>
        </footer>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   BRANCHES TAB
   ═══════════════════════════════════════════════ */

function BranchesTab({ pin, showToast }: { pin: string; showToast: (t: 'ok'|'err', m: string) => void }) {
  const [list, setList] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Branch | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/branches', { headers: authHeaders(pin) });
      if (r.ok) setList(await r.json());
    } finally { setLoading(false); }
  }, [pin]);
  useEffect(() => { load(); }, [load]);

  const save = async (data: Partial<Branch>, id: string) => {
    const r = await fetch(`/api/admin/branches/${id}`, {
      method: 'PATCH',
      headers: authHeaders(pin),
      body: JSON.stringify(data),
    });
    if (r.ok) { showToast('ok', 'Güncellendi'); await load(); setEditing(null); }
    else showToast('err', 'Güncellenemedi');
  };

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2>Şubeler</h2>
          <p>Şube ad, konum ve görsellerini düzenle.</p>
        </div>
      </div>

      {loading ? <div className="admin-loading">Yükleniyor…</div> : (
        <div className="admin-grid">
          {list.map((b) => (
            <article key={b.id} className="brn-item">
              {b.image && <img className="brn-img" src={b.image} alt={b.name} />}
              <div className="brn-meta">
                <h3>{b.name}</h3>
                <p>📍 {b.location}</p>
              </div>
              <div className="brn-actions">
                <button className="admin-btn-ghost" onClick={() => setEditing(b)}>Düzenle</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <BranchModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(d) => save(d, editing.id)}
        />
      )}
    </section>
  );
}

function BranchModal({
  initial, onClose, onSave,
}: {
  initial: Branch;
  onClose: () => void;
  onSave: (data: Partial<Branch>) => void;
}) {
  const [form, setForm] = useState({
    name: initial.name,
    location: initial.location,
    image: initial.image ?? '',
  });

  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <form
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      >
        <header className="admin-modal-head">
          <h3>Şube Düzenle</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>✕</button>
        </header>

        <div className="admin-modal-body">
          <Field label="Şube Adı" required>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Konum" required>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </Field>
          <Field label="Görsel URL">
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
          </Field>
        </div>

        <footer className="admin-modal-foot">
          <button type="button" className="admin-btn-ghost" onClick={onClose}>İptal</button>
          <button type="submit" className="admin-btn-primary">Kaydet</button>
        </footer>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FIELD HELPER
   ═══════════════════════════════════════════════ */

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="admin-field">
      <span>{label}{required && <em>*</em>}</span>
      {children}
    </label>
  );
}

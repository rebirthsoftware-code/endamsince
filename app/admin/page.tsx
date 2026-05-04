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
type Tab =
  | 'services' | 'personnel' | 'branches' | 'slots' | 'gallery'
  | 'content' | 'testimonials' | 'faqs' | 'packages' | 'products' | 'stats' | 'cards';

type TimeSlot = {
  id: string;
  time: string;
  order: number;
  active: boolean;
};

type GalleryItem = {
  id: string;
  url: string;
  title: string | null;
  category: string | null;
  width: number | null;
  height: number | null;
  active: boolean;
  order: number;
};

type SiteContentItem = {
  id: string;
  key: string;
  value: string;
  label: string;
  group: string;
  multiline: boolean;
  order: number;
};

type Testimonial = {
  id: string;
  quote: string;
  author: string;
  location: string;
  active: boolean;
  order: number;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  active: boolean;
  order: number;
};

type PackageItem = {
  id: string;
  name: string;
  price: string;
  icon: string;
  services: string[];
  popular: boolean;
  active: boolean;
  order: number;
};

type ProductItem = {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  price: string;
  tag: string;
  image: string | null;
  description: string;
  featured: boolean;
  active: boolean;
  order: number;
};

type StatItem = {
  id: string;
  value: string;
  label: string;
  group: string;
  active: boolean;
  order: number;
};

type InfoCardItem = {
  id: string;
  group: string;
  icon: string;
  title: string;
  subtitle: string | null;
  description: string;
  bullets: string[];
  active: boolean;
  order: number;
};

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
  const [refreshKey, setRefreshKey] = useState(0);
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
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="admin-logout"
              onClick={() => { setRefreshKey((k) => k + 1); showToast('ok', 'Yenilendi'); }}
              title="Verileri yenile"
              aria-label="Verileri yenile"
            >
              ↻ Güncelle
            </button>
            <button className="admin-logout" onClick={logout}>⎋ Çıkış</button>
          </div>
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
          <button
            className={`admin-tab ${tab === 'slots' ? 'active' : ''}`}
            onClick={() => setTab('slots')}
          >
            <span className="admin-tab-icon">🕒</span>
            Saatler
          </button>
          <button
            className={`admin-tab ${tab === 'gallery' ? 'active' : ''}`}
            onClick={() => setTab('gallery')}
          >
            <span className="admin-tab-icon">🖼️</span>
            Galeri
          </button>
          <button
            className={`admin-tab ${tab === 'content' ? 'active' : ''}`}
            onClick={() => setTab('content')}
          >
            <span className="admin-tab-icon">📝</span>
            İçerik
          </button>
          <button
            className={`admin-tab ${tab === 'testimonials' ? 'active' : ''}`}
            onClick={() => setTab('testimonials')}
          >
            <span className="admin-tab-icon">💬</span>
            Görüşler
          </button>
          <button
            className={`admin-tab ${tab === 'faqs' ? 'active' : ''}`}
            onClick={() => setTab('faqs')}
          >
            <span className="admin-tab-icon">❓</span>
            SSS
          </button>
          <button
            className={`admin-tab ${tab === 'packages' ? 'active' : ''}`}
            onClick={() => setTab('packages')}
          >
            <span className="admin-tab-icon">📦</span>
            Paketler
          </button>
          <button
            className={`admin-tab ${tab === 'products' ? 'active' : ''}`}
            onClick={() => setTab('products')}
          >
            <span className="admin-tab-icon">🧴</span>
            Ürünler
          </button>
          <button
            className={`admin-tab ${tab === 'stats' ? 'active' : ''}`}
            onClick={() => setTab('stats')}
          >
            <span className="admin-tab-icon">📊</span>
            İstatistikler
          </button>
          <button
            className={`admin-tab ${tab === 'cards' ? 'active' : ''}`}
            onClick={() => setTab('cards')}
          >
            <span className="admin-tab-icon">🎴</span>
            Kartlar
          </button>
        </nav>
      </header>

      <main className="admin-container">
        {tab === 'services'     && <ServicesTab     key={`services-${refreshKey}`}     pin={authPin} showToast={showToast} />}
        {tab === 'personnel'    && <PersonnelTab    key={`personnel-${refreshKey}`}    pin={authPin} showToast={showToast} />}
        {tab === 'branches'     && <BranchesTab     key={`branches-${refreshKey}`}     pin={authPin} showToast={showToast} />}
        {tab === 'slots'        && <SlotsTab        key={`slots-${refreshKey}`}        pin={authPin} showToast={showToast} />}
        {tab === 'gallery'      && <GalleryTab      key={`gallery-${refreshKey}`}      pin={authPin} showToast={showToast} />}
        {tab === 'content'      && <ContentTab      key={`content-${refreshKey}`}      pin={authPin} showToast={showToast} />}
        {tab === 'testimonials' && <TestimonialsTab key={`testimonials-${refreshKey}`} pin={authPin} showToast={showToast} />}
        {tab === 'faqs'         && <FaqsTab         key={`faqs-${refreshKey}`}         pin={authPin} showToast={showToast} />}
        {tab === 'packages'     && <PackagesTab     key={`packages-${refreshKey}`}     pin={authPin} showToast={showToast} />}
        {tab === 'products'     && <ProductsTab     key={`products-${refreshKey}`}     pin={authPin} showToast={showToast} />}
        {tab === 'stats'        && <StatsTab        key={`stats-${refreshKey}`}        pin={authPin} showToast={showToast} />}
        {tab === 'cards'        && <CardsTab        key={`cards-${refreshKey}`}        pin={authPin} showToast={showToast} />}
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
          pin={pin}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(d) => save(d, editing?.id)}
        />
      )}
    </section>
  );
}

function PersonnelModal({
  initial, branches, pin, onClose, onSave,
}: {
  initial: Personnel | null;
  branches: Branch[];
  pin: string;
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
          <ImageUpload
            value={form.image ?? ''}
            onChange={(url) => setForm({ ...form, image: url })}
            pin={pin}
            folder="personnel"
            label="Profil Fotoğrafı (opsiyonel)"
          />
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
          pin={pin}
          onClose={() => setEditing(null)}
          onSave={(d) => save(d, editing.id)}
        />
      )}
    </section>
  );
}

function BranchModal({
  initial, pin, onClose, onSave,
}: {
  initial: Branch;
  pin: string;
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
          <ImageUpload
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
            pin={pin}
            folder="branches"
            label="Şube Görseli"
          />
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
   TIME SLOTS TAB
   ═══════════════════════════════════════════════ */

function SlotsTab({ pin, showToast }: { pin: string; showToast: (t: 'ok'|'err', m: string) => void }) {
  const [list, setList] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTime, setNewTime] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/time-slots', { headers: authHeaders(pin) });
      if (res.ok) setList(await res.json());
    } finally {
      setLoading(false);
    }
  }, [pin]);
  useEffect(() => { load(); }, [load]);

  const addSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime) return;
    setAdding(true);
    try {
      const order = list.length > 0
        ? Math.max(...list.map((s) => s.order)) + 1
        : 1;
      const res = await fetch('/api/admin/time-slots', {
        method: 'POST',
        headers: authHeaders(pin),
        body: JSON.stringify({ time: newTime, order }),
      });
      if (res.ok) {
        showToast('ok', 'Saat eklendi');
        setNewTime('');
        await load();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast('err', err.error || 'Eklenemedi');
      }
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: string, time: string) => {
    if (!confirm(`${time} saatini silmek istiyor musunuz?`)) return;
    const res = await fetch(`/api/admin/time-slots/${id}`, {
      method: 'DELETE',
      headers: authHeaders(pin),
    });
    if (res.ok) {
      showToast('ok', 'Silindi');
      await load();
    } else {
      showToast('err', 'Silinemedi');
    }
  };

  const toggle = async (s: TimeSlot) => {
    const res = await fetch(`/api/admin/time-slots/${s.id}`, {
      method: 'PATCH',
      headers: authHeaders(pin),
      body: JSON.stringify({ active: !s.active }),
    });
    if (res.ok) {
      showToast('ok', s.active ? 'Pasif edildi' : 'Aktif edildi');
      await load();
    } else {
      showToast('err', 'Güncellenemedi');
    }
  };

  // Sayısal sıraya göre göster
  const sorted = [...list].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2>Randevu Saatleri</h2>
          <p>Müşterilere randevu sırasında gösterilecek saatleri ekle/çıkar.</p>
        </div>
      </div>

      <form className="slots-add" onSubmit={addSlot}>
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          className="slots-add-input"
          required
        />
        <button
          type="submit"
          className="admin-btn-primary"
          disabled={!newTime || adding}
        >
          + Saat Ekle
        </button>
      </form>

      {loading ? (
        <div className="admin-loading">Yükleniyor…</div>
      ) : sorted.length === 0 ? (
        <div className="admin-empty">
          Henüz saat eklenmemiş. Yukarıdaki kutudan saat ekleyin.
        </div>
      ) : (
        <div className="slots-grid">
          {sorted.map((s) => (
            <div key={s.id} className={`slot-chip ${!s.active ? 'inactive' : ''}`}>
              <span className="slot-chip-time">{s.time}</span>
              <span className={`slot-chip-state ${s.active ? 'on' : 'off'}`}>
                {s.active ? 'Aktif' : 'Pasif'}
              </span>
              <div className="slot-chip-actions">
                <button
                  className="slot-chip-toggle"
                  onClick={() => toggle(s)}
                  title={s.active ? 'Gizle' : 'Aktif et'}
                  aria-label={s.active ? 'Gizle' : 'Aktif et'}
                >
                  {s.active ? '◐' : '○'}
                </button>
                <button
                  className="slot-chip-del"
                  onClick={() => remove(s.id, s.time)}
                  title="Sil"
                  aria-label="Sil"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════
   GALLERY TAB
   ═══════════════════════════════════════════════ */

function GalleryTab({ pin, showToast }: { pin: string; showToast: (t: 'ok'|'err', m: string) => void }) {
  const [list, setList] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/gallery', { headers: authHeaders(pin) });
      if (res.ok) setList(await res.json());
    } finally {
      setLoading(false);
    }
  }, [pin]);
  useEffect(() => { load(); }, [load]);

  const uploadFiles = async (files: FileList) => {
    setUploading(true);
    let added = 0;
    let failed = 0;
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'gallery');
        const upRes = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { [HEADER]: pin },
          body: fd,
        });
        if (!upRes.ok) { failed++; continue; }
        const { url } = await upRes.json();

        // Boyutları al (lightbox için)
        let width: number | undefined, height: number | undefined;
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => { width = img.naturalWidth; height = img.naturalHeight; resolve(); };
          img.onerror = () => resolve();
          img.src = url;
        });

        const order = list.length + added + 1;
        const cRes = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: authHeaders(pin),
          body: JSON.stringify({ url, width, height, order }),
        });
        if (cRes.ok) added++;
        else failed++;
      } catch (_) {
        failed++;
      }
    }
    setUploading(false);
    if (added > 0) showToast('ok', `${added} fotoğraf eklendi`);
    if (failed > 0) showToast('err', `${failed} fotoğraf yüklenemedi`);
    if (added > 0) await load();
  };

  const remove = async (id: string) => {
    if (!confirm('Bu fotoğrafı galeriden silmek istiyor musunuz?')) return;
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: 'DELETE',
      headers: authHeaders(pin),
    });
    if (res.ok) { showToast('ok', 'Silindi'); await load(); }
    else showToast('err', 'Silinemedi');
  };

  const toggle = async (g: GalleryItem) => {
    const res = await fetch(`/api/admin/gallery/${g.id}`, {
      method: 'PATCH',
      headers: authHeaders(pin),
      body: JSON.stringify({ active: !g.active }),
    });
    if (res.ok) { showToast('ok', g.active ? 'Gizlendi' : 'Yayında'); await load(); }
    else showToast('err', 'Güncellenemedi');
  };

  const saveMeta = async (id: string, data: Partial<GalleryItem>) => {
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: 'PATCH',
      headers: authHeaders(pin),
      body: JSON.stringify(data),
    });
    if (res.ok) { showToast('ok', 'Güncellendi'); await load(); setEditing(null); }
    else showToast('err', 'Güncellenemedi');
  };

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2>Galeri</h2>
          <p>Site galerinizdeki fotoğrafları yönetin. Birden çok fotoğraf birden seçebilirsiniz.</p>
        </div>
        <button
          className="admin-btn-primary"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Yükleniyor…' : '+ Fotoğraf Ekle'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) uploadFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {loading ? (
        <div className="admin-loading">Yükleniyor…</div>
      ) : list.length === 0 ? (
        <div className="admin-empty">
          Henüz fotoğraf eklenmemiş. Yukarıdaki "+ Fotoğraf Ekle" ile başlayın.
        </div>
      ) : (
        <div className="gal-grid">
          {list.map((g) => (
            <article key={g.id} className={`gal-item ${!g.active ? 'inactive' : ''}`}>
              <img src={g.url} alt={g.title ?? 'Galeri'} loading="lazy" />
              <div className="gal-item-overlay">
                {g.title && <strong>{g.title}</strong>}
                {g.category && <span>{g.category}</span>}
              </div>
              <div className="gal-item-toolbar">
                <button
                  className="gal-icon-btn"
                  onClick={() => toggle(g)}
                  title={g.active ? 'Gizle' : 'Yayınla'}
                  aria-label={g.active ? 'Gizle' : 'Yayınla'}
                >
                  {g.active ? '◐' : '○'}
                </button>
                <button
                  className="gal-icon-btn"
                  onClick={() => setEditing(g)}
                  title="Düzenle"
                  aria-label="Düzenle"
                >
                  ✎
                </button>
                <button
                  className="gal-icon-btn gal-icon-del"
                  onClick={() => remove(g.id)}
                  title="Sil"
                  aria-label="Sil"
                >
                  ✕
                </button>
              </div>
              {!g.active && <div className="gal-inactive-badge">Gizli</div>}
            </article>
          ))}
        </div>
      )}

      {editing && (
        <GalleryEditModal
          item={editing}
          onClose={() => setEditing(null)}
          onSave={(d) => saveMeta(editing.id, d)}
        />
      )}
    </section>
  );
}

function GalleryEditModal({
  item, onClose, onSave,
}: {
  item: GalleryItem;
  onClose: () => void;
  onSave: (data: Partial<GalleryItem>) => void;
}) {
  const [form, setForm] = useState({
    title: item.title ?? '',
    category: item.category ?? '',
    order: item.order,
  });
  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <form
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      >
        <header className="admin-modal-head">
          <h3>Fotoğraf Bilgisi</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>✕</button>
        </header>
        <div className="admin-modal-body">
          <img
            src={item.url}
            alt=""
            style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 10, marginBottom: 6 }}
          />
          <Field label="Başlık (opsiyonel)">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Örn: Klasik kesim" />
          </Field>
          <Field label="Kategori (opsiyonel)">
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Örn: Saç, Sakal, Mekan" />
          </Field>
          <Field label="Sıra">
            <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
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

/* ═══════════════════════════════════════════════
   IMAGE UPLOAD
   ═══════════════════════════════════════════════ */

function ImageUpload({
  value, onChange, pin, folder = 'misc', label = 'Görsel',
}: {
  value: string;
  onChange: (url: string) => void;
  pin: string;
  folder?: string;
  label?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  const upload = async (file: File) => {
    setErr('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { [HEADER]: pin },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || 'Yükleme başarısız');
        return;
      }
      onChange(data.url);
    } catch (e) {
      setErr('Bağlantı hatası');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-field">
      <span>{label}</span>
      <div className="img-upload">
        {value ? (
          <div className="img-upload-preview">
            <img src={value} alt="" />
            <div className="img-upload-actions">
              <button
                type="button"
                className="img-upload-change"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Yükleniyor…' : 'Değiştir'}
              </button>
              <button
                type="button"
                className="img-upload-remove"
                onClick={() => onChange('')}
                disabled={uploading}
              >
                Kaldır
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="img-upload-empty"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <span className="img-upload-icon">📷</span>
            <strong>{uploading ? 'Yükleniyor…' : 'Fotoğraf yükle'}</strong>
            <small>JPG, PNG veya WEBP — en fazla 5MB</small>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = ''; // aynı dosyayı tekrar seçebilmek için
          }}
        />
        {err && <p className="img-upload-err">{err}</p>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CONTENT TAB — SiteContent (key-value metinler)
   ═══════════════════════════════════════════════ */

const CONTENT_GROUP_LABELS: Record<string, string> = {
  global:    '🌐 Genel',
  contact:   '📞 İletişim',
  home:      '🏠 Anasayfa',
  about:     '📖 Hakkımızda',
  hizmetler: '✂️  Hizmetler',
  urunler:   '🧴 Ürünler',
  ekip:      '👥 Ekip',
  galeri:    '🖼️  Galeri',
  footer:    '⬇️  Alt Bölüm',
};

function ContentTab({ pin, showToast }: { pin: string; showToast: (t: 'ok'|'err', m: string) => void }) {
  const [list, setList] = useState<SiteContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<string>('global');
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/site-content', { headers: authHeaders(pin) });
      if (res.ok) {
        const data: SiteContentItem[] = await res.json();
        setList(data);
        const map: Record<string, string> = {};
        for (const item of data) map[item.id] = item.value;
        setEdits(map);
      }
    } finally {
      setLoading(false);
    }
  }, [pin]);
  useEffect(() => { load(); }, [load]);

  const groups = Array.from(new Set(list.map((x) => x.group)));
  const filtered = list.filter((x) => x.group === activeGroup).sort((a, b) => a.order - b.order);

  const save = async (item: SiteContentItem) => {
    const newValue = edits[item.id] ?? '';
    if (newValue === item.value) return;
    setSaving(item.id);
    try {
      const res = await fetch(`/api/admin/site-content/${item.id}`, {
        method: 'PATCH',
        headers: authHeaders(pin),
        body: JSON.stringify({ value: newValue }),
      });
      if (res.ok) {
        showToast('ok', 'Kaydedildi');
        await load();
      } else {
        showToast('err', 'Kaydedilemedi');
      }
    } finally {
      setSaving(null);
    }
  };

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2>Site İçerikleri</h2>
          <p>Web sitesindeki tüm metin ve etiketleri buradan düzenle.</p>
        </div>
      </div>

      {loading ? <div className="admin-loading">Yükleniyor…</div> : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {groups.map((g) => (
              <button
                key={g}
                className={`admin-tab ${activeGroup === g ? 'active' : ''}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setActiveGroup(g)}
              >
                {CONTENT_GROUP_LABELS[g] || g}
                <span style={{ marginLeft: 6, opacity: 0.6 }}>({list.filter((x) => x.group === g).length})</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((item) => {
              const dirty = (edits[item.id] ?? '') !== item.value;
              return (
                <div key={item.id} className="admin-field" style={{ background: 'var(--surface, #fafafa)', padding: 14, borderRadius: 10, border: '1px solid var(--border, #e5e5e5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 12 }}>
                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                    <code style={{ fontSize: '0.7rem', opacity: 0.55 }}>{item.key}</code>
                  </div>
                  {item.multiline ? (
                    <textarea
                      rows={3}
                      value={edits[item.id] ?? ''}
                      onChange={(e) => setEdits((m) => ({ ...m, [item.id]: e.target.value }))}
                      style={{ width: '100%', minHeight: 80 }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={edits[item.id] ?? ''}
                      onChange={(e) => setEdits((m) => ({ ...m, [item.id]: e.target.value }))}
                      style={{ width: '100%' }}
                    />
                  )}
                  {dirty && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="admin-btn-primary"
                        disabled={saving === item.id}
                        onClick={() => save(item)}
                      >
                        {saving === item.id ? 'Kaydediliyor…' : '💾 Kaydet'}
                      </button>
                      <button
                        type="button"
                        className="admin-btn-ghost"
                        onClick={() => setEdits((m) => ({ ...m, [item.id]: item.value }))}
                      >
                        Geri Al
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && <div className="admin-empty">Bu grupta içerik yok.</div>}
          </div>
        </>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════
   TESTIMONIALS TAB
   ═══════════════════════════════════════════════ */

function TestimonialsTab({ pin, showToast }: { pin: string; showToast: (t: 'ok'|'err', m: string) => void }) {
  const [list, setList] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/testimonials', { headers: authHeaders(pin) });
      if (res.ok) setList(await res.json());
    } finally { setLoading(false); }
  }, [pin]);
  useEffect(() => { load(); }, [load]);

  const save = async (data: Omit<Testimonial, 'id'>, id?: string) => {
    const res = await fetch(id ? `/api/admin/testimonials/${id}` : '/api/admin/testimonials', {
      method: id ? 'PATCH' : 'POST',
      headers: authHeaders(pin),
      body: JSON.stringify(data),
    });
    if (res.ok) { showToast('ok', id ? 'Güncellendi' : 'Eklendi'); await load(); setEditing(null); setCreating(false); }
    else showToast('err', 'Kaydedilemedi');
  };

  const remove = async (id: string) => {
    if (!confirm('Bu görüşü silmek istiyor musunuz?')) return;
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE', headers: authHeaders(pin) });
    if (res.ok) { showToast('ok', 'Silindi'); await load(); } else showToast('err', 'Silinemedi');
  };

  const toggleActive = (t: Testimonial) => save({ quote: t.quote, author: t.author, location: t.location, active: !t.active, order: t.order }, t.id);

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2>Müşteri Görüşleri</h2>
          <p>Anasayfada görünen müşteri yorumları.</p>
        </div>
        <button className="admin-btn-primary" onClick={() => setCreating(true)}>+ Yeni Görüş</button>
      </div>

      {loading ? <div className="admin-loading">Yükleniyor…</div> : (
        <div className="admin-grid">
          {list.map((t) => (
            <article key={t.id} className={`svc-item ${!t.active ? 'inactive' : ''}`}>
              <p style={{ fontStyle: 'italic', marginBottom: 12, lineHeight: 1.6 }}>{t.quote}</p>
              <div className="svc-item-row">
                <span><strong>{t.author}</strong> · {t.location}</span>
                <span className={`svc-item-state ${t.active ? 'on' : 'off'}`}>{t.active ? 'Aktif' : 'Pasif'}</span>
              </div>
              <div className="svc-item-actions">
                <button className="admin-btn-ghost" onClick={() => toggleActive(t)}>{t.active ? 'Gizle' : 'Aktif Et'}</button>
                <button className="admin-btn-ghost" onClick={() => setEditing(t)}>Düzenle</button>
                <button className="admin-btn-danger" onClick={() => remove(t.id)}>Sil</button>
              </div>
            </article>
          ))}
          {list.length === 0 && <div className="admin-empty">Henüz görüş eklenmemiş.</div>}
        </div>
      )}

      {(editing || creating) && (
        <TestimonialModal
          initial={editing ?? { id: '', quote: '', author: '', location: '', active: true, order: list.length + 1 }}
          isNew={creating}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(d) => save(d, editing?.id)}
        />
      )}
    </section>
  );
}

function TestimonialModal({ initial, isNew, onClose, onSave }: {
  initial: Testimonial; isNew: boolean;
  onClose: () => void; onSave: (data: Omit<Testimonial, 'id'>) => void;
}) {
  const [form, setForm] = useState<Omit<Testimonial, 'id'>>({
    quote: initial.quote, author: initial.author, location: initial.location,
    active: initial.active, order: initial.order,
  });
  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
        <header className="admin-modal-head">
          <h3>{isNew ? 'Yeni Görüş' : 'Görüş Düzenle'}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>✕</button>
        </header>
        <div className="admin-modal-body">
          <Field label="Yorum" required>
            <textarea rows={4} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} required />
          </Field>
          <div className="admin-row-2">
            <Field label="İsim" required>
              <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required placeholder="Ozan T." />
            </Field>
            <Field label="Şube">
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Plus" />
            </Field>
          </div>
          <div className="admin-row-2">
            <Field label="Sıra">
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </Field>
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
   FAQ TAB
   ═══════════════════════════════════════════════ */

function FaqsTab({ pin, showToast }: { pin: string; showToast: (t: 'ok'|'err', m: string) => void }) {
  const [list, setList] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/faqs', { headers: authHeaders(pin) });
      if (res.ok) setList(await res.json());
    } finally { setLoading(false); }
  }, [pin]);
  useEffect(() => { load(); }, [load]);

  const save = async (data: Omit<FaqItem, 'id'>, id?: string) => {
    const res = await fetch(id ? `/api/admin/faqs/${id}` : '/api/admin/faqs', {
      method: id ? 'PATCH' : 'POST',
      headers: authHeaders(pin),
      body: JSON.stringify(data),
    });
    if (res.ok) { showToast('ok', id ? 'Güncellendi' : 'Eklendi'); await load(); setEditing(null); setCreating(false); }
    else showToast('err', 'Kaydedilemedi');
  };

  const remove = async (id: string) => {
    if (!confirm('Bu soruyu silmek istiyor musunuz?')) return;
    const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE', headers: authHeaders(pin) });
    if (res.ok) { showToast('ok', 'Silindi'); await load(); } else showToast('err', 'Silinemedi');
  };

  const toggleActive = (f: FaqItem) => save({ question: f.question, answer: f.answer, active: !f.active, order: f.order }, f.id);

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2>Sıkça Sorulanlar</h2>
          <p>Hizmetler sayfasındaki SSS bölümünü yönet.</p>
        </div>
        <button className="admin-btn-primary" onClick={() => setCreating(true)}>+ Yeni Soru</button>
      </div>

      {loading ? <div className="admin-loading">Yükleniyor…</div> : (
        <div className="admin-grid">
          {list.map((f) => (
            <article key={f.id} className={`svc-item ${!f.active ? 'inactive' : ''}`}>
              <h3 style={{ marginBottom: 6 }}>{f.question}</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.answer}</p>
              <div className="svc-item-actions">
                <button className="admin-btn-ghost" onClick={() => toggleActive(f)}>{f.active ? 'Gizle' : 'Aktif Et'}</button>
                <button className="admin-btn-ghost" onClick={() => setEditing(f)}>Düzenle</button>
                <button className="admin-btn-danger" onClick={() => remove(f.id)}>Sil</button>
              </div>
            </article>
          ))}
          {list.length === 0 && <div className="admin-empty">Henüz soru eklenmemiş.</div>}
        </div>
      )}

      {(editing || creating) && (
        <FaqModal
          initial={editing ?? { id: '', question: '', answer: '', active: true, order: list.length + 1 }}
          isNew={creating}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(d) => save(d, editing?.id)}
        />
      )}
    </section>
  );
}

function FaqModal({ initial, isNew, onClose, onSave }: {
  initial: FaqItem; isNew: boolean;
  onClose: () => void; onSave: (data: Omit<FaqItem, 'id'>) => void;
}) {
  const [form, setForm] = useState<Omit<FaqItem, 'id'>>({
    question: initial.question, answer: initial.answer, active: initial.active, order: initial.order,
  });
  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
        <header className="admin-modal-head">
          <h3>{isNew ? 'Yeni Soru' : 'Soru Düzenle'}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>✕</button>
        </header>
        <div className="admin-modal-body">
          <Field label="Soru" required>
            <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
          </Field>
          <Field label="Cevap" required>
            <textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required />
          </Field>
          <div className="admin-row-2">
            <Field label="Sıra">
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </Field>
            <label className="admin-check">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <span>Aktif</span>
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
   PACKAGES TAB
   ═══════════════════════════════════════════════ */

function PackagesTab({ pin, showToast }: { pin: string; showToast: (t: 'ok'|'err', m: string) => void }) {
  const [list, setList] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PackageItem | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/packages', { headers: authHeaders(pin) });
      if (res.ok) setList(await res.json());
    } finally { setLoading(false); }
  }, [pin]);
  useEffect(() => { load(); }, [load]);

  const save = async (data: Omit<PackageItem, 'id'>, id?: string) => {
    const res = await fetch(id ? `/api/admin/packages/${id}` : '/api/admin/packages', {
      method: id ? 'PATCH' : 'POST',
      headers: authHeaders(pin),
      body: JSON.stringify(data),
    });
    if (res.ok) { showToast('ok', id ? 'Güncellendi' : 'Eklendi'); await load(); setEditing(null); setCreating(false); }
    else showToast('err', 'Kaydedilemedi');
  };

  const remove = async (id: string) => {
    if (!confirm('Bu paketi silmek istiyor musunuz?')) return;
    const res = await fetch(`/api/admin/packages/${id}`, { method: 'DELETE', headers: authHeaders(pin) });
    if (res.ok) { showToast('ok', 'Silindi'); await load(); } else showToast('err', 'Silinemedi');
  };

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2>Paketler</h2>
          <p>Hizmetler sayfasındaki kombine paketleri yönet.</p>
        </div>
        <button className="admin-btn-primary" onClick={() => setCreating(true)}>+ Yeni Paket</button>
      </div>

      {loading ? <div className="admin-loading">Yükleniyor…</div> : (
        <div className="admin-grid">
          {list.map((p) => (
            <article key={p.id} className={`svc-item ${!p.active ? 'inactive' : ''}`}>
              <div className="svc-item-head">
                <span className="svc-item-icon">{p.icon}</span>
                <div className="svc-item-meta">
                  <h3>{p.name} {p.popular && <span className="svc-popular">★</span>}</h3>
                  <span className="svc-item-price">{p.price}</span>
                </div>
              </div>
              <ul style={{ margin: '8px 0', paddingLeft: 16, color: 'var(--text-muted)' }}>
                {p.services.map((s, i) => <li key={i} style={{ fontSize: '0.85rem' }}>{s}</li>)}
              </ul>
              <div className="svc-item-actions">
                <button className="admin-btn-ghost" onClick={() => save({ ...p, active: !p.active }, p.id)}>{p.active ? 'Gizle' : 'Aktif Et'}</button>
                <button className="admin-btn-ghost" onClick={() => setEditing(p)}>Düzenle</button>
                <button className="admin-btn-danger" onClick={() => remove(p.id)}>Sil</button>
              </div>
            </article>
          ))}
          {list.length === 0 && <div className="admin-empty">Henüz paket eklenmemiş.</div>}
        </div>
      )}

      {(editing || creating) && (
        <PackageModal
          initial={editing ?? { id: '', name: '', price: '', icon: '✂️', services: [], popular: false, active: true, order: list.length + 1 }}
          isNew={creating}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(d) => save(d, editing?.id)}
        />
      )}
    </section>
  );
}

function PackageModal({ initial, isNew, onClose, onSave }: {
  initial: PackageItem; isNew: boolean;
  onClose: () => void; onSave: (data: Omit<PackageItem, 'id'>) => void;
}) {
  const [form, setForm] = useState<Omit<PackageItem, 'id'>>({
    name: initial.name, price: initial.price, icon: initial.icon, services: initial.services,
    popular: initial.popular, active: initial.active, order: initial.order,
  });
  const [text, setText] = useState(initial.services.join('\n'));
  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...form, services: text.split('\n').map((s) => s.trim()).filter(Boolean) });
      }}>
        <header className="admin-modal-head">
          <h3>{isNew ? 'Yeni Paket' : 'Paket Düzenle'}</h3>
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
          <Field label="Paket Adı" required>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Fiyat" required>
            <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="780₺" />
          </Field>
          <Field label="İçerikler (her satıra bir tane)">
            <textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="Saç Kesimi&#10;Sakal Şekillendirme&#10;..." />
          </Field>
          <div className="admin-row-2">
            <label className="admin-check">
              <input type="checkbox" checked={form.popular} onChange={(e) => setForm({ ...form, popular: e.target.checked })} />
              <span>En Popüler</span>
            </label>
            <label className="admin-check">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <span>Aktif</span>
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
   PRODUCTS TAB
   ═══════════════════════════════════════════════ */

function ProductsTab({ pin, showToast }: { pin: string; showToast: (t: 'ok'|'err', m: string) => void }) {
  const [list, setList] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProductItem | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products', { headers: authHeaders(pin) });
      if (res.ok) setList(await res.json());
    } finally { setLoading(false); }
  }, [pin]);
  useEffect(() => { load(); }, [load]);

  const save = async (data: Omit<ProductItem, 'id'>, id?: string) => {
    const res = await fetch(id ? `/api/admin/products/${id}` : '/api/admin/products', {
      method: id ? 'PATCH' : 'POST',
      headers: authHeaders(pin),
      body: JSON.stringify(data),
    });
    if (res.ok) { showToast('ok', id ? 'Güncellendi' : 'Eklendi'); await load(); setEditing(null); setCreating(false); }
    else showToast('err', 'Kaydedilemedi');
  };

  const remove = async (id: string) => {
    if (!confirm('Bu ürünü silmek istiyor musunuz?')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', headers: authHeaders(pin) });
    if (res.ok) { showToast('ok', 'Silindi'); await load(); } else showToast('err', 'Silinemedi');
  };

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2>Ürünler</h2>
          <p>Ürünler sayfasındaki bakım ürünlerini yönet.</p>
        </div>
        <button className="admin-btn-primary" onClick={() => setCreating(true)}>+ Yeni Ürün</button>
      </div>

      {loading ? <div className="admin-loading">Yükleniyor…</div> : (
        <div className="admin-grid">
          {list.map((p) => (
            <article key={p.id} className={`prs-item ${!p.active ? 'inactive' : ''}`}>
              <div className="prs-avatar">
                {p.image ? <img src={p.image} alt={p.name} /> : <span>📦</span>}
              </div>
              <div className="prs-meta">
                <h3>{p.name} {p.featured && <span style={{ color: 'var(--orange)' }}>★ Öne Çıkan</span>}</h3>
                <span className="prs-role">{p.subtitle}</span>
                <span className="prs-branch">{p.category} · {p.tag}</span>
                <span className="prs-pin"><strong>{p.price}</strong></span>
              </div>
              <div className="prs-actions">
                <button className="admin-btn-ghost" onClick={() => save({ ...p, active: !p.active }, p.id)}>{p.active ? 'Gizle' : 'Aktif Et'}</button>
                <button className="admin-btn-ghost" onClick={() => setEditing(p)}>Düzenle</button>
                <button className="admin-btn-danger" onClick={() => remove(p.id)}>Sil</button>
              </div>
            </article>
          ))}
          {list.length === 0 && <div className="admin-empty">Henüz ürün eklenmemiş.</div>}
        </div>
      )}

      {(editing || creating) && (
        <ProductModal
          initial={editing ?? { id: '', name: '', subtitle: '', category: '', price: '', tag: '', image: null, description: '', featured: false, active: true, order: list.length + 1 }}
          isNew={creating}
          pin={pin}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(d) => save(d, editing?.id)}
        />
      )}
    </section>
  );
}

function ProductModal({ initial, isNew, pin, onClose, onSave }: {
  initial: ProductItem; isNew: boolean; pin: string;
  onClose: () => void; onSave: (data: Omit<ProductItem, 'id'>) => void;
}) {
  const [form, setForm] = useState<Omit<ProductItem, 'id'>>({
    name: initial.name, subtitle: initial.subtitle, category: initial.category,
    price: initial.price, tag: initial.tag, image: initial.image,
    description: initial.description, featured: initial.featured,
    active: initial.active, order: initial.order,
  });
  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
        <header className="admin-modal-head">
          <h3>{isNew ? 'Yeni Ürün' : 'Ürün Düzenle'}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>✕</button>
        </header>
        <div className="admin-modal-body">
          <ImageUpload value={form.image ?? ''} onChange={(url) => setForm({ ...form, image: url || null })} pin={pin} folder="products" label="Ürün Görseli" />
          <Field label="Ürün Adı" required>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Alt Başlık">
            <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Güçlü Tutuş · Mat Bitim" />
          </Field>
          <div className="admin-row-2">
            <Field label="Kategori">
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Saç / Sakal / Cilt / Styling" />
            </Field>
            <Field label="Etiket">
              <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="⭐ Çok Satan" />
            </Field>
          </div>
          <div className="admin-row-2">
            <Field label="Fiyat" required>
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="₺320" />
            </Field>
            <Field label="Sıra">
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Açıklama">
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="admin-row-2">
            <label className="admin-check">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              <span>Öne Çıkan (Ürünler sayfası başında)</span>
            </label>
            <label className="admin-check">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <span>Aktif</span>
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
   STATS TAB
   ═══════════════════════════════════════════════ */

const STAT_GROUP_LABELS: Record<string, string> = {
  'home-hero':   'Anasayfa Hero',
  'about-story': 'Hakkımızda Story',
};

function StatsTab({ pin, showToast }: { pin: string; showToast: (t: 'ok'|'err', m: string) => void }) {
  const [list, setList] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StatItem | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats', { headers: authHeaders(pin) });
      if (res.ok) setList(await res.json());
    } finally { setLoading(false); }
  }, [pin]);
  useEffect(() => { load(); }, [load]);

  const save = async (data: Omit<StatItem, 'id'>, id?: string) => {
    const res = await fetch(id ? `/api/admin/stats/${id}` : '/api/admin/stats', {
      method: id ? 'PATCH' : 'POST',
      headers: authHeaders(pin),
      body: JSON.stringify(data),
    });
    if (res.ok) { showToast('ok', id ? 'Güncellendi' : 'Eklendi'); await load(); setEditing(null); setCreating(false); }
    else showToast('err', 'Kaydedilemedi');
  };

  const remove = async (id: string) => {
    if (!confirm('Bu istatistiği silmek istiyor musunuz?')) return;
    const res = await fetch(`/api/admin/stats/${id}`, { method: 'DELETE', headers: authHeaders(pin) });
    if (res.ok) { showToast('ok', 'Silindi'); await load(); } else showToast('err', 'Silinemedi');
  };

  const grouped = list.reduce<Record<string, StatItem[]>>((acc, s) => {
    (acc[s.group] ??= []).push(s);
    return acc;
  }, {});

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2>İstatistikler</h2>
          <p>Anasayfa ve Hakkımızda sayfasındaki rakamları yönet.</p>
        </div>
        <button className="admin-btn-primary" onClick={() => setCreating(true)}>+ Yeni İstatistik</button>
      </div>

      {loading ? <div className="admin-loading">Yükleniyor…</div> : (
        <>
          {Object.keys(grouped).map((g) => (
            <div key={g} style={{ marginBottom: 30 }}>
              <h3 style={{ marginBottom: 12, fontSize: '0.95rem', opacity: 0.7 }}>
                {STAT_GROUP_LABELS[g] || g}
              </h3>
              <div className="admin-grid">
                {grouped[g].map((s) => (
                  <article key={s.id} className={`svc-item ${!s.active ? 'inactive' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                      <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--orange)' }}>{s.value}</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{s.label}</span>
                    </div>
                    <div className="svc-item-actions">
                      <button className="admin-btn-ghost" onClick={() => save({ ...s, active: !s.active }, s.id)}>{s.active ? 'Gizle' : 'Aktif Et'}</button>
                      <button className="admin-btn-ghost" onClick={() => setEditing(s)}>Düzenle</button>
                      <button className="admin-btn-danger" onClick={() => remove(s.id)}>Sil</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
          {list.length === 0 && <div className="admin-empty">Henüz istatistik eklenmemiş.</div>}
        </>
      )}

      {(editing || creating) && (
        <StatModal
          initial={editing ?? { id: '', value: '', label: '', group: 'home-hero', active: true, order: list.length + 1 }}
          isNew={creating}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(d) => save(d, editing?.id)}
        />
      )}
    </section>
  );
}

function StatModal({ initial, isNew, onClose, onSave }: {
  initial: StatItem; isNew: boolean;
  onClose: () => void; onSave: (data: Omit<StatItem, 'id'>) => void;
}) {
  const [form, setForm] = useState<Omit<StatItem, 'id'>>({
    value: initial.value, label: initial.label, group: initial.group,
    active: initial.active, order: initial.order,
  });
  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
        <header className="admin-modal-head">
          <h3>{isNew ? 'Yeni İstatistik' : 'İstatistik Düzenle'}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>✕</button>
        </header>
        <div className="admin-modal-body">
          <div className="admin-row-2">
            <Field label="Değer" required>
              <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required placeholder="15K+" />
            </Field>
            <Field label="Etiket" required>
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required placeholder="Mutlu Müşteri" />
            </Field>
          </div>
          <Field label="Grup" required>
            <select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} required>
              <option value="home-hero">Anasayfa Hero</option>
              <option value="about-story">Hakkımızda Story</option>
            </select>
          </Field>
          <div className="admin-row-2">
            <Field label="Sıra">
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </Field>
            <label className="admin-check">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <span>Aktif</span>
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
   INFO CARDS TAB (values, perks, quality, timeline, mv)
   ═══════════════════════════════════════════════ */

const CARD_GROUP_LABELS: Record<string, string> = {
  'about-values':    'Hakkımızda — Değerler',
  'about-mv':        'Hakkımızda — Misyon & Vizyon',
  'about-timeline':  'Hakkımızda — Tarihçe',
  'team-perks':      'Ekip — Kariyer Avantajları',
  'product-quality': 'Ürünler — Kalite Kartları',
};

function CardsTab({ pin, showToast }: { pin: string; showToast: (t: 'ok'|'err', m: string) => void }) {
  const [list, setList] = useState<InfoCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<InfoCardItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string>('about-values');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/info-cards', { headers: authHeaders(pin) });
      if (res.ok) setList(await res.json());
    } finally { setLoading(false); }
  }, [pin]);
  useEffect(() => { load(); }, [load]);

  const save = async (data: Omit<InfoCardItem, 'id'>, id?: string) => {
    const res = await fetch(id ? `/api/admin/info-cards/${id}` : '/api/admin/info-cards', {
      method: id ? 'PATCH' : 'POST',
      headers: authHeaders(pin),
      body: JSON.stringify(data),
    });
    if (res.ok) { showToast('ok', id ? 'Güncellendi' : 'Eklendi'); await load(); setEditing(null); setCreating(false); }
    else showToast('err', 'Kaydedilemedi');
  };

  const remove = async (id: string) => {
    if (!confirm('Bu kartı silmek istiyor musunuz?')) return;
    const res = await fetch(`/api/admin/info-cards/${id}`, { method: 'DELETE', headers: authHeaders(pin) });
    if (res.ok) { showToast('ok', 'Silindi'); await load(); } else showToast('err', 'Silinemedi');
  };

  const filtered = list.filter((c) => c.group === activeGroup);

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2>Bilgi Kartları</h2>
          <p>Değerler, kariyer avantajları, ürün kalitesi, tarihçe ve M/V kartlarını yönet.</p>
        </div>
        <button className="admin-btn-primary" onClick={() => setCreating(true)}>+ Yeni Kart</button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {Object.keys(CARD_GROUP_LABELS).map((g) => (
          <button
            key={g}
            className={`admin-tab ${activeGroup === g ? 'active' : ''}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveGroup(g)}
          >
            {CARD_GROUP_LABELS[g]}
            <span style={{ marginLeft: 6, opacity: 0.6 }}>({list.filter((x) => x.group === g).length})</span>
          </button>
        ))}
      </div>

      {loading ? <div className="admin-loading">Yükleniyor…</div> : (
        <div className="admin-grid">
          {filtered.map((c) => (
            <article key={c.id} className={`svc-item ${!c.active ? 'inactive' : ''}`}>
              <div className="svc-item-head">
                <span className="svc-item-icon">{c.icon}</span>
                <div className="svc-item-meta">
                  <h3>{c.title}</h3>
                  {c.subtitle && <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{c.subtitle}</span>}
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{c.description}</p>
              {c.bullets.length > 0 && (
                <ul style={{ margin: '8px 0', paddingLeft: 16 }}>
                  {c.bullets.map((b, i) => <li key={i} style={{ fontSize: '0.8rem' }}>{b}</li>)}
                </ul>
              )}
              <div className="svc-item-actions">
                <button className="admin-btn-ghost" onClick={() => save({ ...c, active: !c.active }, c.id)}>{c.active ? 'Gizle' : 'Aktif Et'}</button>
                <button className="admin-btn-ghost" onClick={() => setEditing(c)}>Düzenle</button>
                <button className="admin-btn-danger" onClick={() => remove(c.id)}>Sil</button>
              </div>
            </article>
          ))}
          {filtered.length === 0 && <div className="admin-empty">Bu grupta kart yok.</div>}
        </div>
      )}

      {(editing || creating) && (
        <CardModal
          initial={editing ?? { id: '', group: activeGroup, icon: '', title: '', subtitle: null, description: '', bullets: [], active: true, order: filtered.length + 1 }}
          isNew={creating}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={(d) => save(d, editing?.id)}
        />
      )}
    </section>
  );
}

function CardModal({ initial, isNew, onClose, onSave }: {
  initial: InfoCardItem; isNew: boolean;
  onClose: () => void; onSave: (data: Omit<InfoCardItem, 'id'>) => void;
}) {
  const [form, setForm] = useState<Omit<InfoCardItem, 'id'>>({
    group: initial.group, icon: initial.icon, title: initial.title,
    subtitle: initial.subtitle, description: initial.description,
    bullets: initial.bullets, active: initial.active, order: initial.order,
  });
  const [bulletText, setBulletText] = useState(initial.bullets.join('\n'));
  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...form, bullets: bulletText.split('\n').map((s) => s.trim()).filter(Boolean) });
      }}>
        <header className="admin-modal-head">
          <h3>{isNew ? 'Yeni Kart' : 'Kart Düzenle'}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>✕</button>
        </header>
        <div className="admin-modal-body">
          <Field label="Grup" required>
            <select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} required>
              {Object.entries(CARD_GROUP_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <div className="admin-row-2">
            <Field label="İkon (emoji veya yıl)">
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🎯 veya 1979" />
            </Field>
            <Field label="Sıra">
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Başlık" required>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </Field>
          <Field label="Alt başlık (sadece M/V için: 'mission' / 'vision')">
            <input value={form.subtitle ?? ''} onChange={(e) => setForm({ ...form, subtitle: e.target.value || null })} />
          </Field>
          <Field label="Açıklama">
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Madde işaretleri (M/V için, her satıra bir tane)">
            <textarea rows={4} value={bulletText} onChange={(e) => setBulletText(e.target.value)} placeholder="(boş bırakılabilir)" />
          </Field>
          <label className="admin-check">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            <span>Aktif</span>
          </label>
        </div>
        <footer className="admin-modal-foot">
          <button type="button" className="admin-btn-ghost" onClick={onClose}>İptal</button>
          <button type="submit" className="admin-btn-primary">Kaydet</button>
        </footer>
      </form>
    </div>
  );
}

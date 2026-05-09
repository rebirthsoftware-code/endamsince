// Yeni personele varsayılan olarak eklenen randevu saatleri.
// 09:00 - 20:00 arası yarım saat aralıklı.
export const DEFAULT_SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let h = 9; h < 20; h++) {
    out.push(`${String(h).padStart(2, '0')}:00`);
    out.push(`${String(h).padStart(2, '0')}:30`);
  }
  out.push('20:00');
  return out;
})();

export interface ClientBrand {
  color: string;
  accent: string;
  initials: string;
}

const PALETTE = [
  { color: '#1e3a5f', accent: '#3b82f6' },
  { color: '#14532d', accent: '#22c55e' },
  { color: '#7c2d12', accent: '#f97316' },
  { color: '#581c87', accent: '#a855f7' },
  { color: '#831843', accent: '#ec4899' },
  { color: '#134e4a', accent: '#14b8a6' },
  { color: '#713f12', accent: '#eab308' },
  { color: '#1e1b4b', accent: '#6366f1' },
  { color: '#450a0a', accent: '#ef4444' },
  { color: '#164e63', accent: '#06b6d4' },
  { color: '#365314', accent: '#84cc16' },
  { color: '#4a044e', accent: '#d946ef' },
];

export function getClientBrand(clientId: string, clientName: string): ClientBrand {
  const num = parseInt(clientId.replace(/\D/g, ''), 10) || 0;
  const palette = PALETTE[num % PALETTE.length];
  const words = clientName.split(/\s+/);
  const initials =
    words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : clientName.slice(0, 2).toUpperCase();
  return { ...palette, initials };
}

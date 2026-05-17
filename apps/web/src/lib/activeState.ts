const ACTIVE_WORLD_KEY = 'loreweaver-active-world';
const ACTIVE_CHARACTER_KEY = 'loreweaver-active-character';

export function getActiveWorldId(): number | null {
  try {
    const raw = localStorage.getItem(ACTIVE_WORLD_KEY);
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export function setActiveWorldId(id: number) {
  localStorage.setItem(ACTIVE_WORLD_KEY, String(id));
}

export function getActiveCharacterId(): number | null {
  try {
    const raw = localStorage.getItem(ACTIVE_CHARACTER_KEY);
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export function setActiveCharacterId(id: number) {
  localStorage.setItem(ACTIVE_CHARACTER_KEY, String(id));
}

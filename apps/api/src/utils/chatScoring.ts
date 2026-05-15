export interface RelationshipDelta {
  trust: number;
  respect: number;
  affection: number;
  rivalry: number;
  fear: number;
  alignment: number;
}

const INTENSIFIERS = new Set([
  'very', 'deeply', 'truly', 'completely', 'absolutely', 'utterly',
  'totally', 'greatly', 'highly', 'strongly', 'intensely', 'profoundly',
]);

const NEGATORS = new Set([
  'not', 'no', 'never', 'nothing', 'nobody', 'neither', 'nowhere',
  "don't", "doesn't", "didn't", "won't", "wouldn't", "can't", "cannot",
  "shouldn't", "couldn't", "isn't", "aren't", "wasn't", "weren't",
]);

const KEYWORD_MAP: Record<keyof RelationshipDelta, string[]> = {
  trust: ['trust', 'believe', 'rely', 'confide', 'secret', 'honest', 'truth', 'faith', 'loyal', 'depend'],
  respect: ['respect', 'admire', 'honor', 'salute', 'worthy', 'esteem', 'revere', 'regard', 'praise', 'commend'],
  affection: ['love', 'like', 'care', 'fond', 'miss', 'dear', 'friend', 'companion', 'affection', 'adore', 'cherish'],
  rivalry: ['rival', 'compete', 'challenge', 'enemy', 'oppose', 'betray', 'threat', 'foe', 'nemesis', 'adversary'],
  fear: ['fear', 'afraid', 'scared', 'terror', 'dread', 'dangerous', 'worry', 'anxious', 'uneasy', 'cautious', 'wary'],
  alignment: ['agree', 'align', 'same', 'together', 'ally', 'cause', 'share', 'common', 'unite', 'join', 'support', 'side'],
};

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

const RAW_DELTA_CAP = 5; // maximum raw delta per axis per message
const DAMPEN_AFTER_HITS = 1; // after N keyword hits, dampen further hits
const DAMPEN_FACTOR = 0.3;

function computeDelta(tokens: string[], keywords: string[], base: number): number {
  let delta = 0;
  let hitCount = 0;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (keywords.some((kw) => token.includes(kw))) {
      let intensity = 1;
      hitCount += 1;
      if (hitCount > DAMPEN_AFTER_HITS) {
        intensity *= DAMPEN_FACTOR;
      }
      // look back up to 3 words for negation or intensifier
      for (let j = Math.max(0, i - 3); j < i; j++) {
        if (INTENSIFIERS.has(tokens[j])) intensity += 0.5;
        if (NEGATORS.has(tokens[j])) intensity *= -1;
      }
      delta += base * intensity;
    }
  }
  return Math.min(RAW_DELTA_CAP, Math.max(-RAW_DELTA_CAP, delta));
}

export function scoreChatRelationship(text: string): RelationshipDelta {
  const tokens = normalize(text);
  const base = 1.0;
  return {
    trust: computeDelta(tokens, KEYWORD_MAP.trust, base),
    respect: computeDelta(tokens, KEYWORD_MAP.respect, base),
    affection: computeDelta(tokens, KEYWORD_MAP.affection, base),
    rivalry: computeDelta(tokens, KEYWORD_MAP.rivalry, base),
    fear: computeDelta(tokens, KEYWORD_MAP.fear, base),
    alignment: computeDelta(tokens, KEYWORD_MAP.alignment, base),
  };
}

export function extractSummary(text: string): { topic: string; significance: number } {
  const tokens = normalize(text);

  // Heuristic: pick capitalized phrases as likely entities/names
  const rawWords = text.split(/\s+/);
  const candidates: string[] = [];
  let current = '';
  for (const word of rawWords) {
    if (/^[A-Z][a-z]+$/.test(word)) {
      current = current ? `${current} ${word}` : word;
    } else if (current) {
      candidates.push(current);
      current = '';
    }
  }
  if (current) candidates.push(current);

  const topic = candidates.slice(0, 2).join(', ') || tokens.slice(0, 5).join(' ');

  let significance = 1;
  for (const t of tokens) {
    if (INTENSIFIERS.has(t)) significance += 0.5;
    if (['death', 'kill', 'murder', 'war', 'battle', 'betray', 'reveal', 'discover', 'secret'].includes(t)) {
      significance += 1;
    }
  }
  significance = Math.min(10, Math.max(1, significance));

  return { topic, significance };
}

export function clampScore(value: number, min = -100, max = 100): number {
  return Math.max(min, Math.min(max, value));
}



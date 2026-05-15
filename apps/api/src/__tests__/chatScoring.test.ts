import { describe, it, expect } from 'vitest';
import { scoreChatRelationship, extractSummary, clampScore } from '../utils/chatScoring.js';

describe('scoreChatRelationship', () => {
  it('returns zero for neutral text', () => {
    const d = scoreChatRelationship('The weather is clear today.');
    expect(d.trust).toBe(0);
    expect(d.respect).toBe(0);
    expect(d.affection).toBe(0);
    expect(d.rivalry).toBe(0);
    expect(d.fear).toBe(0);
    expect(d.alignment).toBe(0);
  });

  it('increases affection for friendly text', () => {
    const d = scoreChatRelationship('I really like you my dear friend.');
    expect(d.affection).toBeGreaterThan(0);
    expect(d.affection).toBeLessThanOrEqual(5);
  });

  it('increases trust for trusting language', () => {
    const d = scoreChatRelationship('I trust you completely and confide in you.');
    expect(d.trust).toBeGreaterThan(0);
    expect(d.trust).toBeLessThanOrEqual(5);
  });

  it('increases fear for threatening language', () => {
    const d = scoreChatRelationship('I am afraid of the dangerous enemy.');
    expect(d.fear).toBeGreaterThan(0);
    expect(d.fear).toBeLessThanOrEqual(5);
  });

  it('caps per-axis delta at 5 even with many keywords', () => {
    const d = scoreChatRelationship(
      'trust trust trust trust trust trust trust trust trust trust trust trust trust trust trust trust trust trust trust trust',
    );
    expect(d.trust).toBeLessThanOrEqual(5);
    expect(d.trust).toBeGreaterThan(0);
  });

  it('dampens after first hit', () => {
    const d1 = scoreChatRelationship('I trust you.');
    const d2 = scoreChatRelationship('I trust you and confide in you and rely on your honest truth.');
    expect(d2.trust).toBeGreaterThan(d1.trust);
    expect(d2.trust).toBeLessThanOrEqual(5);
  });

  it('negates with negators', () => {
    const d = scoreChatRelationship("I do not trust you at all. I don't believe you.");
    expect(d.trust).toBeLessThanOrEqual(0);
  });
});

describe('extractSummary', () => {
  it('returns a topic and significance', () => {
    const s = extractSummary('We discovered the Ancient Map.');
    expect(s.topic).toBeTruthy();
    expect(s.significance).toBeGreaterThanOrEqual(1);
    expect(s.significance).toBeLessThanOrEqual(10);
  });

  it('boosts significance for high-stakes words', () => {
    const s = extractSummary('The secret of the war and betrayal was revealed.');
    expect(s.significance).toBeGreaterThanOrEqual(3);
    expect(s.significance).toBeLessThanOrEqual(10);
  });

  it('boosts significance for intensifiers', () => {
    const s = extractSummary('I very strongly believe this is truly important.');
    expect(s.significance).toBeGreaterThanOrEqual(2);
  });
});

describe('clampScore', () => {
  it('returns the value within bounds', () => {
    expect(clampScore(50)).toBe(50);
    expect(clampScore(-50)).toBe(-50);
    expect(clampScore(0)).toBe(0);
  });

  it('clamps to max', () => {
    expect(clampScore(200)).toBe(100);
  });

  it('clamps to min', () => {
    expect(clampScore(-200)).toBe(-100);
  });

  it('uses custom bounds', () => {
    expect(clampScore(5, 0, 1)).toBe(1);
    expect(clampScore(-1, 0, 1)).toBe(0);
  });
});

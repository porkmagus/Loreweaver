import { describe, it, expect } from 'vitest';
import { chunkText } from '../services/chunker.js';
describe('chunkText', () => {
    it('returns one chunk for short text', () => {
        const chunks = chunkText('Hello world');
        expect(chunks).toHaveLength(1);
        expect(chunks[0].text).toBe('Hello world');
    });
    it('splits large text into multiple chunks', () => {
        const sentence = 'This is a long sentence with many words to demonstrate chunking behavior in the lore ingestion pipeline. ';
        const text = sentence.repeat(80);
        const chunks = chunkText(text);
        expect(chunks.length).toBeGreaterThan(1);
    });
    it('preserves paragraphs where possible', () => {
        const text = 'First para.\n\nSecond para.\n\nThird para.';
        const chunks = chunkText(text);
        expect(chunks.length).toBe(1);
        expect(chunks[0].text).toContain('First para.');
        expect(chunks[0].text).toContain('Third para.');
    });
    it('returns empty array for empty input', () => {
        expect(chunkText('')).toHaveLength(0);
    });
});
//# sourceMappingURL=chunker.test.js.map
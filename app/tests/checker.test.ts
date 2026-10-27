import { describe, expect, it } from 'vitest';
import { checkMessage, linkReasons, toSegments } from '../src/engine/checker.ts';

const rules = (text: string) => checkMessage(text).map((f) => f.rule);

describe('Check a message', () => {
  it('finds urgency and threats', () => {
    expect(rules('Your account will be closed within 24 hours.')).toContain('urgency');
    expect(rules('Act now or a warrant will be issued for your arrest.')).toContain('urgency');
  });

  it('finds unusual payment requests', () => {
    expect(rules('Please pay with gift cards from the store.')).toContain('payment');
    expect(rules('Send it by wire transfer today.')).toContain('payment');
    expect(rules('We only accept Bitcoin.')).toContain('payment');
  });

  it('finds secrecy', () => {
    expect(rules("Please don't tell Mom about this.")).toContain('secrecy');
    expect(rules('Keep this between us.')).toContain('secrecy');
  });

  it('finds requests for codes, passwords and SSN', () => {
    expect(rules('Read me the code we just sent you.')).toContain('codes');
    expect(rules('Confirm your password and PIN.')).toContain('codes');
    expect(rules('We need your Social Security number.')).toContain('codes');
  });

  it('finds prize and lottery claims', () => {
    expect(rules("Congratulations! You've won a $1,000 prize.")).toContain('prize');
    expect(rules('You are a lottery winner.')).toContain('prize');
  });

  it('flags link shorteners', () => {
    expect(linkReasons('bit.ly/3xYz')[0]).toMatch(/short link/);
  });

  it('flags http (not https) links', () => {
    expect(linkReasons('http://bluebirdbank.com/login').some((r) => r.includes('not secure'))).toBe(true);
    expect(linkReasons('https://bluebirdbank.com')).toEqual([]);
  });

  it('flags links that are just numbers', () => {
    expect(linkReasons('http://192.168.4.20/pay').some((r) => r.includes('string of numbers'))).toBe(true);
  });

  it('flags addresses with many hyphens', () => {
    expect(linkReasons('bluebird-bank-help.net').some((r) => r.includes('hyphens'))).toBe(true);
    expect(linkReasons('bluebird-bank.net').some((r) => r.includes('hyphens'))).toBe(false);
  });

  it('flags "login", "verify" or "secure" in the address', () => {
    expect(linkReasons('bluebirdbank-verify.net').some((r) => r.includes('look official'))).toBe(true);
    expect(linkReasons('securelogin.example.com').some((r) => r.includes('look official'))).toBe(true);
  });

  it('flags look-alike swaps: 0 for o and rn for m', () => {
    expect(linkReasons('bluebirdb0nk.com').some((r) => r.includes('0 for o'))).toBe(true);
    expect(linkReasons('maplernarket.com').some((r) => r.includes('the letter m'))).toBe(true);
  });

  it('checks links found inside a message', () => {
    const found = checkMessage('Tap here: http://bluebird-bank-verify.net now');
    expect(found.filter((f) => f.rule === 'link').length).toBeGreaterThanOrEqual(3);
  });

  it('finds nothing in an ordinary message', () => {
    expect(checkMessage('Hi Grandma, see you at lunch on Sunday. Love, Sam')).toEqual([]);
    expect(checkMessage('Maple Street Library: your hold is ready for pickup until Nov 3.')).toEqual([]);
  });

  it('does not match parts of other words', () => {
    expect(rules('I was so upset about the pinwheel.')).toEqual([]);
  });

  it('marks the right words in the text', () => {
    const text = 'Pay with gift cards now.';
    const [f] = checkMessage(text);
    expect(text.slice(f.start, f.end)).toBe('gift cards');
  });

  it('splits text into plain and highlighted parts, joining overlaps', () => {
    const text = 'Act now: http://bit.ly/x please';
    const segments = toSegments(text, checkMessage(text));
    expect(segments.map((s) => s.text).join('')).toBe(text); // nothing lost or repeated
    const marked = segments.filter((s) => s.reasons.length > 0);
    expect(marked.map((s) => s.text)).toEqual(['Act now', 'http://bit.ly/x']);
    expect(marked[1].reasons.length).toBe(2); // short link + not secure, in one highlight
  });

  it('returns the whole text as one plain part when nothing is found', () => {
    expect(toSegments('Hello there', [])).toEqual([{ text: 'Hello there', reasons: [] }]);
  });
});

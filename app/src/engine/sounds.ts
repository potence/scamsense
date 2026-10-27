// Small tactile sound effects made with the Web Audio API (no sound files).
// Off by default; the user turns them on with the header toggle.
// Every function is safe to call when sound is off or the browser has no Web Audio.
import { defaultStore } from './storage.ts';
import type { KeyValueStore } from './storage.ts';

export type SoundName = 'tap' | 'spotted' | 'miss' | 'done' | 'ring';

const KEY = 'scamsense-sound-v1';

// The sounds are tactile, not beeps: a key-press click, a soft bell "ding", a low muffled buzz.
// Each recipe schedules a few building blocks (below) starting at time `t` on the context.
type Recipe = (ctx: AudioContext, out: AudioNode, t: number) => void;
const RECIPES: Record<SoundName, Recipe> = {
  // A key press: a short bright click with a tiny low thump under it.
  tap: (ctx, out, t) => {
    click(ctx, out, t, 0.5, 3200);
    thump(ctx, out, t, 0.35, 170);
  },
  // A checkmark: a light click, then a clear bell that rings out.
  spotted: (ctx, out, t) => {
    click(ctx, out, t, 0.3, 3600);
    bell(ctx, out, t + 0.01, 1318, 0.32, 0.7);
  },
  // A gentle error: two short, low, muffled buzzes, like a phone vibrating in a hand.
  miss: (ctx, out, t) => {
    buzz(ctx, out, t, 0.11, 0.3);
    buzz(ctx, out, t + 0.16, 0.11, 0.3);
  },
  // Finished: a soft thump, then two bell notes going up.
  done: (ctx, out, t) => {
    thump(ctx, out, t, 0.4, 140);
    bell(ctx, out, t + 0.02, 1046, 0.28, 0.8);
    bell(ctx, out, t + 0.16, 1568, 0.24, 1.0);
  },
  // An incoming call: a phone vibrating on a table (long, short), not an electronic ring.
  ring: (ctx, out, t) => {
    buzz(ctx, out, t, 0.4, 0.35);
    buzz(ctx, out, t + 0.55, 0.4, 0.35);
  },
};

const MASTER = 0.3; // overall level: quiet, well under the narrator

// --- Building blocks ---

// A click: a few milliseconds of filtered noise.
function click(ctx: AudioContext, out: AudioNode, t: number, level: number, hz: number): void {
  const length = 0.03;
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * length), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.004));
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = hz;
  filter.Q.value = 1.2;
  const gain = ctx.createGain();
  gain.gain.value = level;
  src.connect(filter).connect(gain).connect(out);
  src.start(t);
}

// A thump: a very short low tone that drops in pitch, felt more than heard.
function thump(ctx: AudioContext, out: AudioNode, t: number, level: number, hz: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(hz, t);
  osc.frequency.exponentialRampToValueAtTime(hz * 0.5, t + 0.06);
  gain.gain.setValueAtTime(level, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
  osc.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + 0.08);
}

// A bell: a pure note plus a quieter overtone, instant attack, natural fade (no flat "beep").
function bell(ctx: AudioContext, out: AudioNode, t: number, hz: number, level: number, decay: number): void {
  for (const [mult, share] of [[1, 1], [2.76, 0.25], [5.4, 0.08]] as const) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = hz * mult;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(level * share, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + decay / mult ** 0.5);
    osc.connect(gain).connect(out);
    osc.start(t);
    osc.stop(t + decay + 0.05);
  }
}

// A buzz: a low rough tone through a soft filter, like a vibration motor.
function buzz(ctx: AudioContext, out: AudioNode, t: number, length: number, level: number): void {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = 95;
  filter.type = 'lowpass';
  filter.frequency.value = 420;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(level, t + 0.015);
  gain.gain.setValueAtTime(level, t + length - 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(filter).connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + length + 0.02);
}

export function isSoundOn(store: KeyValueStore | null = defaultStore()): boolean {
  try {
    return store?.getItem(KEY) === 'on';
  } catch {
    return false;
  }
}

export function setSoundOn(on: boolean, store: KeyValueStore | null = defaultStore()): void {
  try {
    store?.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // storage blocked: the setting lasts until the page is closed
  }
  soundOn = on;
}

let soundOn = isSoundOn();
let callerPlaying = false; // effects stay quiet while a caller recording plays
let context: AudioContext | null = null;

// The audio player calls this when a recording starts and stops.
export function setCallerPlaying(playing: boolean): void {
  callerPlaying = playing;
}

// Plays a sound effect. Only ever called from a click (browsers need that before audio).
export function playSound(name: SoundName): void {
  if (!soundOn || callerPlaying) return;
  try {
    context ??= new AudioContext();
    const ctx = context;
    const master = ctx.createGain();
    master.gain.value = MASTER;
    master.connect(ctx.destination);
    RECIPES[name](ctx, master, ctx.currentTime + 0.005);
  } catch {
    // no Web Audio in this browser: stay silent
  }
}

import { useEffect, useRef, useState } from 'react';
import manifestData from '../data/audio-manifest.json';
import type { Manifest } from '../engine/narration.ts';
import { Icon } from './Icon.tsx';

const manifest = manifestData as Manifest;
// Filled in by vite.config.ts: the recordings that exist, e.g. "narration/teach-phone.mp3".
declare const __NARRATION_FILES__: string[];
const recorded = new Set(typeof __NARRATION_FILES__ === 'undefined' ? [] : __NARRATION_FILES__);

// Only one narration plays at a time: starting one pauses the one before.
let current: HTMLAudioElement | null = null;

// "Read aloud" with a recorded narrator. The button only appears when:
//  - the manifest has a recording for this id,
//  - it was recorded from exactly this text (otherwise it would be out of date), and
//  - the file exists (checked at build time, so the button shows at once) and it loads.
// It plays only when clicked.
export function ReadAloud({ id, text, label = 'Read aloud' }: { id: string; text: string; label?: string }) {
  const entry = manifest[id];
  const [ready, setReady] = useState(true); // hidden only if the file then fails to load
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Stop reading when this part of the screen goes away.
  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);

  if (!entry || entry.text !== text || !recorded.has(entry.file)) return null;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      return;
    }
    if (current && current !== audio) current.pause();
    current = audio;
    audio.currentTime = 0;
    audio.play().catch(() => setReady(false));
  };

  return (
    <>
      {/* preload="metadata" only checks the file exists; nothing plays until the click. */}
      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/${entry.file}`}
        preload="metadata"
        onError={() => setReady(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      {ready && (
        <button type="button" className="read-aloud" onClick={toggle} aria-pressed={playing}>
          <Icon name={playing ? 'stop' : 'speaker'} />
          <span>{playing ? 'Stop reading' : label}</span>
        </button>
      )}
    </>
  );
}

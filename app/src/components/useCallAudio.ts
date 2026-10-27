// One audio element for a whole phone call. `play(file)` is called directly inside a
// click (Pick up, an answer), which is what lets the browser start the sound,
// including on iPhones. When a line ends, or its recording is missing or fails,
// `onLineDone` runs so the answer buttons can appear. Leaving the page stops it.
import { useEffect, useRef, useState } from 'react';
import { setCallerPlaying } from '../engine/sounds.ts';

export function useCallAudio(onLineDone: () => void) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const doneRef = useRef(onLineDone);
  doneRef.current = onLineDone; // always call the latest version
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false); // true = show only the transcript

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    const start = () => {
      setPlaying(true);
      setCallerPlaying(true); // keep sound effects quiet over the caller
    };
    const stop = () => {
      setPlaying(false);
      setCallerPlaying(false);
    };
    const ended = () => {
      stop();
      doneRef.current();
    };
    const error = () => {
      stop();
      setFailed(true);
      doneRef.current();
    };
    audio.addEventListener('play', start);
    audio.addEventListener('pause', stop);
    audio.addEventListener('ended', ended);
    audio.addEventListener('error', error);
    return () => {
      // The call left the screen (next question, another page): stop the voice.
      audio.pause();
      audio.removeAttribute('src');
      setCallerPlaying(false);
    };
  }, []);

  // Plays one line of the call from the start.
  const play = (file?: string) => {
    const audio = audioRef.current;
    if (!audio || !file) {
      setFailed(true);
      doneRef.current();
      return;
    }
    setFailed(false);
    audio.src = `${import.meta.env.BASE_URL}audio/${file}`;
    audio.play().catch(() => {
      setFailed(true);
      doneRef.current();
    });
  };

  const stop = () => audioRef.current?.pause();

  return { play, stop, playing, failed };
}

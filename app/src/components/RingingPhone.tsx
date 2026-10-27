// The phone ringing before a call: who is calling, and Pick up / Decline.
// The gentle pulse is CSS (switched off for reduced motion); the soft ring is a
// synthesized sound that only plays if the user turned Sound on.
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { playSound } from '../engine/sounds.ts';
import { Feedback } from './Feedback.tsx';
import { Icon } from './Icon.tsx';

export function RingingPhone({ caller, onPickUp, onDecline }: { caller: string; onPickUp: () => void; onDecline: () => void }) {
  // Ring a few times, then stop on its own.
  useEffect(() => {
    playSound('ring');
    let rings = 1;
    const timer = setInterval(() => {
      if (rings++ >= 3) clearInterval(timer);
      else playSound('ring');
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const split = caller.match(/^(.*?)\s*(\+?[\d(][\d\s()+-]{6,})$/);

  return (
    <div className="ringing">
      <div className="phone-call-screen" role="region" aria-label="Incoming phone call">
        <div className="phone-call-notch" aria-hidden="true" />
        <span className="phone-call-sub">Incoming call</span>
        {/* "Unknown number (800) 555-0142" shows the number big on its own line. */}
        <h3 className="phone-call-number">
          {split ? (
            <>
              <span className="phone-call-name">{split[1]}</span>
              {split[2]}
            </>
          ) : (
            caller
          )}
        </h3>

        <div className="phone-call-actions" role="group" aria-label="Incoming call options">
          <button
            type="button"
            className="call-btn-action"
            onClick={onDecline}
            aria-label={`Decline call from ${caller}`}
          >
            <span className="call-btn-circle call-btn-decline" aria-hidden="true">
              <Icon name="phone" />
            </span>
            <span className="call-btn-label">Decline</span>
          </button>

          <button
            type="button"
            className="call-btn-action"
            onClick={onPickUp}
            aria-label={`Pick up call from ${caller}`}
          >
            <span className="call-btn-circle call-btn-pickup" aria-hidden="true">
              <Icon name="phone" />
            </span>
            <span className="call-btn-label">Pick up</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Waveform indicator displayed while the caller audio plays
export function Waveform({ playing }: { playing: boolean }) {
  return (
    <div className={`waveform${playing ? ' playing' : ''}`} aria-hidden="true">
      <span className="waveform-bar" />
      <span className="waveform-bar" />
      <span className="waveform-bar" />
      <span className="waveform-bar" />
      <span className="waveform-bar" />
    </div>
  );
}

// Shown after Decline: praise the habit, and offer to hear the call anyway.
export function DeclinedNote({ onHear, children }: { onHear: () => void; children?: ReactNode }) {
  return (
    <>
      <Feedback tone="good" title="Smart habit">
        <p>Letting an unknown call go to voicemail is a smart habit. A real caller will leave a message.</p>
        {children}
      </Feedback>
      <button type="button" className="btn btn-secondary" onClick={onHear}>
        Hear what they would have said
      </button>
    </>
  );
}

// Replay / Stop for the current line. Hidden when the recording is missing:
// then the transcript on the phone is all there is.
export function ReplayButton({ playing, failed, onReplay, onStop }: { playing: boolean; failed: boolean; onReplay: () => void; onStop: () => void }) {
  if (failed) return null;
  return (
    <div className="audio">
      <button type="button" className="btn btn-secondary" onClick={playing ? onStop : onReplay} aria-pressed={playing}>
        <Icon name={playing ? 'stop' : 'speaker'} />
        <span>{playing ? 'Stop' : 'Replay'}</span>
      </button>
    </div>
  );
}

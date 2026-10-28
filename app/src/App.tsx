import { useEffect, useState } from 'react';
import { Home } from './screens/Home.tsx';
import { Learn } from './screens/Learn.tsx';
import { Lesson } from './screens/Lesson.tsx';
import { Practice } from './screens/Practice.tsx';
import { Inbox } from './screens/Inbox.tsx';
import { Today } from './screens/Today.tsx';
import { Group } from './screens/Group.tsx';
import { FacilitatorGuide, WalletCard } from './screens/PrintPages.tsx';
import { HelpersHub, PracticeHub } from './screens/Hubs.tsx';
import { Help } from './screens/Help.tsx';
import { Words } from './screens/Words.tsx';
import { Certificate } from './screens/Certificate.tsx';
import { Logo } from './components/Logo.tsx';
import { Icon } from './components/Icon.tsx';
import type { IconName } from './components/Icon.tsx';
import { TextSizeControl } from './components/TextSizeControl.tsx';
import { loadProgress } from './engine/storage.ts';
import { isSoundOn, setSoundOn } from './engine/sounds.ts';
import { trackClicks, trackPage } from './engine/analytics.ts';
import type { Progress } from './types.ts';

// Hash routing: the page part lives after "#" (like #/lesson/phone), so it works
// on GitHub Pages without a server. Routes:
//   #/  #/learn  #/lesson/:id
//   #/practice (hub)  #/practice/round  #/inbox  #/today
//   #/helpers (hub)  #/group  #/print/card  #/print/guide
// Shelved pages send old links somewhere useful. "Check a message" (#/check) is
// shelved: its keyword rules rated a clearly threatening message as safe.
const SHELVED: Record<string, string> = { '/check': '/practice' };

function currentRoute(): string {
  const route = window.location.hash.replace(/^#/, '') || '/';
  if (SHELVED[route]) {
    // replaceState swaps the address without adding a Back step.
    history.replaceState(null, '', `#${SHELVED[route]}`);
    return SHELVED[route];
  }
  return route;
}

// The wordmark is the link home, so the nav only needs these three.
// `matches` marks a nav item as current for every page that lives under it.
// Phones show them as a bottom tab bar; wider screens show them in the top bar.
const NAV: { href: string; label: string; icon: IconName; matches: (route: string) => boolean }[] = [
  { href: '#/learn', label: 'Learn', icon: 'book', matches: (r) => r.startsWith('/learn') || r.startsWith('/lesson') },
  { href: '#/practice', label: 'Practice', icon: 'target', matches: (r) => ['/practice', '/inbox', '/today'].some((p) => r.startsWith(p)) },
  { href: '#/helpers', label: 'Helpers', icon: 'people', matches: (r) => ['/helpers', '/group', '/print'].some((p) => r.startsWith(p)) },
];

export default function App() {
  const [route, setRoute] = useState(currentRoute);
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [sound, setSound] = useState(isSoundOn); // sound effects: off unless the user turns them on

  useEffect(() => {
    const onChange = () => {
      setRoute(currentRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    const stopClicks = trackClicks(); // buttons marked data-track="..." count as events
    return () => {
      window.removeEventListener('hashchange', onChange);
      stopClicks();
    };
  }, []);

  // Each screen counts as a page view (anonymous; see engine/analytics.ts).
  useEffect(() => trackPage(route), [route]);

  let page;
  if (route === '/learn') page = <Learn progress={progress} />;
  else if (route.startsWith('/lesson/')) {
    const id = route.slice('/lesson/'.length);
    // key = id, so switching lessons starts the new one from the beginning
    page = <Lesson key={id} topicId={id} progress={progress} onUpdateProgress={setProgress} />;
  } else if (route === '/practice') page = <PracticeHub />;
  else if (route === '/practice/round') page = <Practice progress={progress} onUpdateProgress={setProgress} />;
  else if (route === '/inbox') page = <Inbox progress={progress} onUpdateProgress={setProgress} />;
  else if (route === '/today') page = <Today progress={progress} onUpdateProgress={setProgress} />;
  else if (route === '/group') page = <Group />;
  else if (route === '/print/card') page = <WalletCard />;
  else if (route === '/print/guide') page = <FacilitatorGuide />;
  else if (route === '/helpers') page = <HelpersHub />;
  else if (route === '/help') page = <Help />;
  else if (route === '/words') page = <Words />;
  else if (route === '/certificate') page = <Certificate progress={progress} />;
  else page = <Home progress={progress} />;

  return (
    <>
      {/* Focuses main instead of following "#main", which would change the hash route. */}
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to main content
      </a>
      <header className="topbar">
        <div className="container topbar-row">
          <a className="brand" href="#/" aria-current={route === '/' ? 'page' : undefined}>
            <Logo />
          </a>
          <nav aria-label="Main" className="topnav">
            {NAV.map((item) => (
              <a key={item.href} className="topnav-link" href={item.href} aria-current={item.matches(route) ? 'page' : undefined}>
                <Icon name={item.icon} className="topnav-icon" />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <TextSizeControl />
            <button
              type="button"
              className="sound-toggle"
              aria-pressed={sound}
              data-track={`sound-${sound ? 'off' : 'on'}`}
              onClick={() => {
                setSoundOn(!sound);
                setSound(!sound);
              }}
            >
              <Icon name={sound ? 'speaker' : 'speakerOff'} />
              <span>Sound {sound ? 'on' : 'off'}</span>
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="container" tabIndex={-1}>
        {/* key = route: a new screen remounts and gets the short fade-in from styles.css */}
        <div key={route} className="screen">
          {page}
        </div>
      </main>

      {/* Phones: the same three places as a bottom tab bar. */}
      <nav aria-label="Main" className="tabbar">
        {NAV.map((item) => (
          <a key={item.href} className="tab" href={item.href} aria-current={item.matches(route) ? 'page' : undefined}>
            <Icon name={item.icon} />
            {item.label}
          </a>
        ))}
      </nav>

      <footer className="container site-footer">
        <p className="footer-name">
          <Logo />
        </p>
        <p className="footer-links">
          <a href="#/help">I think I was scammed (immediate help)</a>
          {' · '}
          <a href="#/words">Scam words glossary</a>
        </p>
        <p>All names, numbers and websites in the examples are made up.</p>
      </footer>
    </>
  );
}

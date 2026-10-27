// The ScamSense wordmark, used in the top bar and the footer.
// To use your own logo: put the file in app/public/ (for example app/public/logo.svg)
// and set LOGO_FILE to its name. Everything else updates on its own.
const LOGO_FILE = ''; // e.g. 'logo.svg'

export function Logo() {
  if (LOGO_FILE) return <img className="logo-img" src={`${import.meta.env.BASE_URL}${LOGO_FILE}`} alt="ScamSense" />;
  // The second S picks up the accent colour (cobalt on paper, sky on navy).
  return (
    <span className="wordmark">
      Scam<span className="wordmark-s">S</span>ense
    </span>
  );
}

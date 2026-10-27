# ScamSense

> Stop. Spot. Block.

ScamSense is an interactive scam-awareness trainer designed for older adults and non-technical people. It provides hands-on practice in a safe sandbox with simulated phone calls, text messages, emails, websites, and QR codes so learners can spot scams before they cost money or compromise accounts.

## Features

- **12 Interactive Lessons:** Practical practice covering phishing, fake websites, QR codes, pop-up alerts, payment scams, emergency imposter calls, government impersonation, stranger messages, fake prizes, online shopping fraud, credentials security, and recovery steps.
- **Multiple Training Formats:**
  - *Red Flag Tap:* Tap suspicious phrases and details in realistic messages.
  - *Pick the Safe One:* Compare look-alike URLs and web addresses side by side.
  - *Order the Steps:* Arrange emergency first-hour recovery actions in order.
  - *Scan or Skip:* Evaluate physical QR codes in everyday situations.
  - *Interactive Phone Calls:* Answer simulated calls with audio recordings, real-time transcripts, and decision branches.
- **Real or Scam Inbox:** A 12-item sorting exercise to test quick judgment on incoming communications.
- **Daily Challenge:** A fresh three-scenario drill every day.
- **Accessibility by Design:**
  - High-contrast, large-print typography (22px base body).
  - Integrated text-size controls (Standard 1×, Large 1.15×, Extra Large 1.3×).
  - Tactile audio cues and built-in text-to-speech audio narration.
  - Keyboard navigation and screen-reader support.
- **Offline & Private:** All progress is stored locally in the browser with zero tracking and no runtime external API dependencies.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or newer)
- npm

### Installation & Development

```bash
# Navigate to the app directory
cd app

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open `http://localhost:5173/scamsense/` in your web browser.

### Running Tests

```bash
cd app
npm test
```

To validate content and scenario schemas:

```bash
cd app
npm run validate:strict
```

### Building for Production

```bash
cd app
npm run build
```

The production output is placed in `app/dist/` and deployed to GitHub Pages via the repository's `docs/` folder.

## License

MIT

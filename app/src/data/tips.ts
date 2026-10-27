export interface DailyTip {
  id: number;
  category: string;
  tip: string;
}

export const DAILY_TIPS: DailyTip[] = [
  { id: 1, category: 'Phone safety', tip: 'If a caller claims to be your bank, hang up and call the customer service number printed on the back of your card.' },
  { id: 2, category: 'Gift cards', tip: 'No government agency, utility company, or real business will ever demand payment using retail gift cards.' },
  { id: 3, category: 'Login security', tip: 'Never read a 6-digit text verification code aloud to anyone over the phone, even if they say they are fraud prevention.' },
  { id: 4, category: 'Urgency warning', tip: 'Scammers create artificial panic to make you act before you think. Real organizations always give you time to verify.' },
  { id: 5, category: 'Computer pop-ups', tip: 'Real computer error messages never tell you to call an 800 number. If your screen locks with sirens, simply restart your computer.' },
  { id: 6, category: 'Government imposters', tip: 'The IRS and Social Security Administration never call demanding immediate payment or threatening arrest by police.' },
  { id: 7, category: 'QR code caution', tip: 'Before scanning a public QR code on a parking meter or menu, feel if a fraudulent sticker was pasted over the real sign.' },
  { id: 8, category: 'Family emergency', tip: 'If someone calls claiming a grandchild is in jail or injured, call your grandchild or their parents directly on their saved number.' },
  { id: 9, category: 'Remote access', tip: 'Never download AnyDesk, TeamViewer, or remote software at the request of an unexpected caller or pop-up.' },
  { id: 10, category: 'Package delivery', tip: 'Unexpected texts about missed package deliveries with odd links are almost always phishing traps trying to steal card numbers.' },
  { id: 11, category: 'Secret payments', tip: 'If someone tells you to keep a transaction secret from your family or bank teller, it is guaranteed to be a scam.' },
  { id: 12, category: 'Look-alike links', tip: 'Look closely at website addresses. Criminals substitute similar letters like "rn" to mimic "m" (e.g. arnazon.com).' },
  { id: 13, category: 'Prizes & lotteries', tip: 'You never have to pay taxes, insurance fees, or shipping costs upfront to collect a legitimate lottery prize or sweepstakes.' },
  { id: 14, category: 'Online shopping', tip: 'Too-good-to-be-true discounts on social media ads usually lead to counterfeit storefronts that steal card credentials.' },
  { id: 15, category: 'Bitcoin kiosks', tip: 'Anyone directing you to deposit cash into a grocery store Bitcoin or cryptocurrency machine is a scammer.' },
  { id: 16, category: 'Wrong numbers', tip: 'If a stranger texts "Hey, are you free for lunch?", do not reply. Scammers use friendly wrong numbers to strike up conversations.' },
  { id: 17, category: 'Wire transfers', tip: 'Treat wire transfers like sending cash in an envelope. Once money is wired, it is virtually impossible to recover.' },
  { id: 18, category: 'Medicare cards', tip: 'Medicare will never call you uninvited offering a "new chip card" in exchange for your Medicare or Social Security number.' },
  { id: 19, category: 'Tech support', tip: 'Microsoft, Apple, and Google never place unsolicited calls warning people that their computers are compromised.' },
  { id: 20, category: 'Overpayment checks', tip: 'If a buyer sends you a check for more than the sale price and asks you to refund the difference, the check is counterfeit.' },
  { id: 21, category: 'Two-factor protection', tip: 'Turn on two-factor authentication on your email account. Your email is the master key to resetting your other passwords.' },
  { id: 22, category: 'Caller ID spoofing', tip: 'Caller ID displays can easily be faked to show your bank\'s real name. Never trust caller ID alone as proof of identity.' },
  { id: 23, category: 'Charity appeals', tip: 'After disasters, search for verified charities yourself at CharityNavigator.org rather than donating through links in texts.' },
  { id: 24, category: 'Free trials', tip: 'Watch out for "free trial" offers requiring credit cards that quietly enroll you in high-cost recurring monthly charges.' },
  { id: 25, category: 'Social Security', tip: 'Your Social Security number is never "suspended" or "frozen" due to suspicious activity. That is a fabricated scam script.' },
  { id: 26, category: 'Password safety', tip: 'Never reuse your primary email or banking password across shopping websites or social networks.' },
  { id: 27, category: 'Unsubscribe links', tip: 'Clicking "unsubscribe" in suspicious spam texts confirms your number is active. Block and report the sender instead.' },
  { id: 28, category: 'Recovery scams', tip: 'If someone contacts you claiming they can recover funds you previously lost to a scam for an advance fee, it is a second scam.' },
  { id: 29, category: 'Trust your gut', tip: 'If a call or message makes your stomach drop with anxiety, that emotional reaction is your brain spotting high-pressure manipulation.' },
  { id: 30, category: 'The golden rule', tip: 'When in doubt, Stop, Spot, Block. Hang up, take a breath, and verify through a trusted contact on a saved number.' }
];

export function getTipOfTheDay(date: Date = new Date()): DailyTip {
  // Deterministic day index based on year, month, date
  const dayIndex = (date.getFullYear() * 12 + date.getMonth() * 31 + date.getDate()) % DAILY_TIPS.length;
  return DAILY_TIPS[Math.abs(dayIndex) % DAILY_TIPS.length];
}

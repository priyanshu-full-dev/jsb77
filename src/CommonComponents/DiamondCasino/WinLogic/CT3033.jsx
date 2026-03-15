// helpers placed above the component or inside the component file

// Map display rank to numeric rank: A=1, J=11, Q=12, K=13
const toRank = (token) => {
  if (!token) return null;
  if (token === "A") return 1;
  if (token === "K") return 13;
  if (token === "Q") return 12;
  if (token === "J") return 11;
  const n = parseInt(token, 10);
  return Number.isFinite(n) ? n : null;
};

// Parse a card string like "A♠", "10H", "Q-D", "7C", etc.
// Returns { rank: number, suit: string } or null if unknown.
const parseCard = (card) => {
  if (!card || card === "1") return null; // "1" means hidden
  // Extract leading rank token (A/K/Q/J or 1-13)
  const rankMatch = card.match(/^(A|K|Q|J|\d{1,2})/i);
  if (!rankMatch) return null;
  const rankVal = toRank(rankMatch[0].toUpperCase());
  if (!rankVal) return null;

  // Extract suit: try common encodings (unicode, letters, or symbols)
  // Examples supported: S/H/D/C, ♠/♥/♦/♣, or custom glyphs like } { ] [
  const rest = card.slice(rankMatch[0].length).trim();

  // Normalize a single suit token from the remainder
  // Priority check: unicode, letter, custom glyph.
  let suit = null;
  if (/[♠♥♦♣]/.test(rest)) {
    suit = rest.match(/[♠♥♦♣]/)?.[0];
  } else if (/[SHDC]/i.test(rest)) {
    suit = rest.match(/[SHDC]/i)?.[0].toUpperCase(); // S H D C
  } else if (/[\}\{\]\[]/.test(rest)) {
    suit = rest.match(/[\}\{\]\[]/)?.[0]; // } { ] [
  } else if (rest.length) {
    // fallback: first non-numeric char
    suit = rest[0];
  }

  return { rank: rankVal, suit };
};

// Define suit priority for tie-breaking: index 0 is highest.
// IMPORTANT: replace this with your exact sequence for
// "1} 1st, 1{ 2nd, 1] 3rd, 1[ 4th"
const SUIT_ORDER = [
  "}", // 1st
  "{", // 2nd
  "]", // 3rd
  "[", // 4th
];

// Also support common suit encodings by mapping them into the above order if your feed uses them.
// If your assets use S/H/D/C, map them here in your required priority.
// Example (change to your real order): Spades > Hearts > Diamonds > Clubs
const SUIT_ORDER_FALLBACK = ["S", "H", "D", "C", "♠", "♥", "♦", "♣"];

// Compare two parsed cards with rank then suit-priority
const compareCards = (a, b) => {
  if (!a || !b) return 0;
  if (a.rank !== b.rank) return a.rank - b.rank; // positive => a higher
  // ranks equal: tiebreak by configured suit order
  const ia = SUIT_ORDER.indexOf(a.suit);
  const ib = SUIT_ORDER.indexOf(b.suit);
  if (ia !== -1 && ib !== -1) return ib - ia; // positive => a higher (lower index is stronger)
  // fallback if input uses S/H/D/C or unicode suits
  const ia2 = SUIT_ORDER_FALLBACK.indexOf(a.suit);
  const ib2 = SUIT_ORDER_FALLBACK.indexOf(b.suit);
  if (ia2 !== -1 && ib2 !== -1) return ib2 - ia2;
  // if suit not recognized, treat as equal
  return 0;
};

// Resolve winner among Dragon, Tiger, Lion
// Returns { winner: 'DRAGON'|'TIGER'|'LION'|'TIE', sorted: [{name, card, parsed}] }
export const resolveDTL = (dragonCard, tigerCard, lionCard) => {
  const d = parseCard(dragonCard);
  const t = parseCard(tigerCard);
  const l = parseCard(lionCard);

  if (!d || !t || !l) return { winner: null, sorted: [] };

  // Compare pairs and pick max by rank then suit
  const entries = [
    { name: "DRAGON", card: dragonCard, parsed: d },
    { name: "TIGER", card: tigerCard, parsed: t },
    { name: "LION", card: lionCard, parsed: l },
  ];

  // Sort descending by strength
  entries.sort((A, B) => compareCards(A.parsed, B.parsed)).reverse();

  const top = entries[0];
  const second = entries[1];

  // If top equals second by rank and suit, it is a true tie (rare if suits fully ordered)
  const sameRank = top.parsed.rank === second.parsed.rank;
  const sameSuit = top.parsed.suit === second.parsed.suit;
  const isTieTopTwo = sameRank && sameSuit;

  return { winner: isTieTopTwo ? "TIE" : top.name, sorted: entries };
};

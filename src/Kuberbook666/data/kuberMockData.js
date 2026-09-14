// ==========================================================================
// KUBERBOOK666 - MOCK & FALLBACK DATA WITH RICH INDUSTRY-GRADE ASSETS
// ==========================================================================

export const TOP_NAV_CHIPS = [
  { id: "home", label: "HOME", icon: "FaHome", path: "/" },
  { id: "sports", label: "SPORTS", icon: "FaTrophy", path: "/sports" },
  { id: "aura", label: "AURA", icon: "GiSpades", path: "/aura" },
  { id: "mac88", label: "MAC88", icon: "GiDiceSixFacesFive", path: "/mac88" },
  { id: "live_casino", label: "LIVE CASINO", icon: "GiCardPlay", path: "/live-casino" },
  { id: "slots", label: "SLOTS", icon: "MdCasino", path: "/slots" },
  { id: "crash", label: "CRASH", icon: "FaRocket", path: "/crash" },
  { id: "table", label: "TABLE", icon: "MdTableRestaurant", path: "/table" },
];

export const HERO_CATEGORY_BANNERS = [
  {
    id: "aviator",
    title: "Aviator",
    badge: "100X",
    subtitle: "Fly High & Win Big",
    gradient: "from-[#d0102b] via-[#e51937] to-[#990a1d]",
    iconType: "aviator",
    path: "/crash",
    tag: "100X AVIATOR",
  },
  {
    id: "mac88",
    title: "MAC88",
    badge: "♠ ♥",
    subtitle: "Premium Table Games",
    gradient: "from-[#1f1d19] via-[#3a3424] to-[#12110e]",
    iconType: "mac88",
    path: "/mac88",
    tag: "MAC88",
  },
  {
    id: "evolution",
    title: "Evolution",
    badge: "LIVE",
    subtitle: "Live Casino Shows",
    gradient: "from-[#801b38] via-[#a8254c] to-[#590f23]",
    iconType: "evolution",
    path: "/live-casino",
    tag: "LIVE SHOW",
  },
  {
    id: "color_game",
    title: "Color Game",
    badge: "NEW",
    subtitle: "Predict Colors",
    gradient: "from-[#c2185b] via-[#d81b60] to-[#880e4f]",
    iconType: "colorgame",
    path: "/slots",
    tag: "COLOR GAME",
  },
];

export const ORIGINALS_GAMES = [
  {
    id: "ball-by-ball",
    name: "Ball By Ball",
    category: "Originals",
    image: "/assets/ballByBall.png",
  },
  {
    id: "aviator",
    name: "Aviator",
    category: "Crash Games",
    image: "/assets/ballByBall.png",
  },
  {
    id: "mines",
    name: "Mines",
    category: "Originals",
    image: "/assets/ballByBall.png",
  },
  {
    id: "crash",
    name: "Crash",
    category: "Crash Games",
    image: "/assets/ballByBall.png",
  },
  {
    id: "coin-toss",
    name: "Coin Toss",
    category: "Originals",
    image: "/assets/ballByBall.png",
  },
  {
    id: "slot",
    name: "Slot",
    category: "Originals",
    image: "/assets/ballByBall.png",
  },
  {
    id: "classic-disc",
    name: "Classic Disc",
    category: "Live Roulette",
    image: "/assets/ballByBall.png",
  },
  {
    id: "limbo",
    name: "Limbo",
    category: "Crash Games",
    image: "/assets/ballByBall.png",
  },
  {
    id: "money-wheel",
    name: "Money Wheel",
    category: "Money Wheel",
    image: "/assets/ballByBall.png",
  },
  {
    id: "plinko",
    name: "Plinko",
    category: "Originals",
    image: "/assets/ballByBall.png",
  },
];

export const GAME_SHOW_GAMES = [
  {
    id: "aviator-spribe",
    name: "Aviator",
    category: "Game Show",
    image: "/assets/ballByBall.png",
  },
  {
    id: "jili",
    name: "JILI",
    category: "Lottery",
    image: "/assets/ballByBall.png",
  },
  {
    id: "1m-fortunes",
    name: "1 Million Fortunes",
    category: "Game Show",
    image: "/assets/ballByBall.png",
  },
  {
    id: "1m-megaways",
    name: "1 Million Megaways",
    category: "Game Show",
    image: "/assets/ballByBall.png",
  },
  {
    id: "scratch-king",
    name: "Scratch King",
    category: "Scratch Card",
    image: "/assets/ballByBall.png",
  },
  {
    id: "wheel",
    name: "Wheel",
    category: "Game Show",
    image: "/assets/ballByBall.png",
  },
];

export const INPLAY_TENNIS_MATCHES = [
  {
    id: "tennis-match-1",
    sport: "Tennis",
    matchName: "Juan Cruz Martin ... vs Gerard Campana Lee",
    score: "Live Set",
    status: "LIVE",
    hasVideo: true,
    odds: {
      team1: { back: "2.22", size: "3" },
      draw: { back: "-", size: "-" },
      team2: { back: "1.72", size: "4" },
    },
  },
  {
    id: "tennis-match-2",
    sport: "Tennis",
    matchName: "Giuseppe La Vela vs Federico Iannaccone",
    score: "Live Set",
    status: "LIVE",
    hasVideo: true,
    odds: {
      team1: { back: "2.46", size: "28" },
      draw: { back: "-", size: "-" },
      team2: { back: "1.61", size: "15" },
    },
  },
  {
    id: "tennis-match-3",
    sport: "Tennis",
    matchName: "Izan Almazan Valie... vs Gianmarco Ferrari",
    score: "Live Set",
    status: "LIVE",
    hasVideo: true,
    odds: {
      team1: { back: "1.36", size: "46" },
      draw: { back: "-", size: "-" },
      team2: { back: "3.7", size: "59" },
    },
  },
];

export const INDIAN_CARD_GAMES = [
  {
    id: "teen-patti",
    title: "Teen Patti 20-20",
    dealer: "Anjali (Certified)",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    type: "Live Dealer",
    badge: "24x7 Certified Expert",
    category: "Indian",
    minBet: 50,
  },
  {
    id: "andar-bahar",
    title: "Andar Bahar Live",
    dealer: "Pooja (Certified)",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
    type: "Live Dealer",
    badge: "24x7 Certified Expert",
    category: "Indian",
    minBet: 100,
  },
  {
    id: "dragon-tiger-20",
    title: "Dragon Tiger 20",
    dealer: "Riya (Certified)",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80",
    type: "Live Dealer",
    badge: "24x7 Certified Expert",
    category: "Indian",
    minBet: 50,
  },
  {
    id: "lucky7",
    title: "Lucky 7 Live",
    dealer: "Divya (Certified)",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80",
    type: "Live Dealer",
    badge: "24x7 Certified Expert",
    category: "Indian",
    minBet: 50,
  },
];

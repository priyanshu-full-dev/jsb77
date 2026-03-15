// --- Teen Patti Winner Logic ---
export const getTeenPattiWinner = (playerA, playerB) => {
  const suitsOrder = { spade: 4, heart: 3, club: 2, diamond: 1 };
  const ranksOrder = { A: 14, K: 13, Q: 12, J: 11, "10": 10, "9": 9, "8": 8, "7": 7, "6": 6, "5": 5, "4": 4, "3": 3, "2": 2 };

  const parseCard = (card) => {
    const rank = card.match(/^(A|K|Q|J|\d{1,2})/)[0];
    const suitChar = card.slice(-1);
    const suitMap = { S: "spade", H: "heart", C: "club", D: "diamond" };
    return { rank, suit: suitMap[suitChar], rankValue: ranksOrder[rank] };
  };

  const evaluateHand = (cards) => {
    const parsed = cards.map(parseCard);
    const ranks = parsed.map(c => c.rankValue).sort((a, b) => b - a);
    const suits = parsed.map(c => c.suit);
    const isFlush = suits.every(s => s === suits[0]);
    const isStraight =
      (ranks[0] - ranks[1] === 1 && ranks[1] - ranks[2] === 1) ||
      (ranks.includes(14) && ranks.includes(3) && ranks.includes(2)); // A-2-3 case
    const isTrio = ranks[0] === ranks[1] && ranks[1] === ranks[2];
    const isPair = ranks[0] === ranks[1] || ranks[1] === ranks[2] || ranks[0] === ranks[2];
    const isStraightFlush = isStraight && isFlush;

    let category = 1, rankValue = ranks[0];
    if (isTrio) category = 6;
    else if (isStraightFlush) category = 5;
    else if (isStraight) category = 4;
    else if (isFlush) category = 3;
    else if (isPair) category = 2;

    return { parsed, ranks, suits, category, rankValue };
  };

  const compareHands = (handA, handB) => {
    if (handA.category > handB.category) return "A";
    if (handB.category > handA.category) return "B";

    // same category
    if (handA.rankValue > handB.rankValue) return "A";
    if (handB.rankValue > handA.rankValue) return "B";

    // tie-break by high cards
    for (let i = 0; i < 3; i++) {
      if (handA.ranks[i] > handB.ranks[i]) return "A";
      if (handB.ranks[i] > handA.ranks[i]) return "B";
    }

    // final tie-breaker → suit of highest card
    const highA = handA.parsed.sort((a, b) => b.rankValue - a.rankValue)[0];
    const highB = handB.parsed.sort((a, b) => b.rankValue - a.rankValue)[0];
    if (suitsOrder[highA.suit] > suitsOrder[highB.suit]) return "A";
    if (suitsOrder[highB.suit] > suitsOrder[highA.suit]) return "B";

    return "Tie";
  };

  const handA = evaluateHand(playerA);
  const handB = evaluateHand(playerB);
  return compareHands(handA, handB);
};

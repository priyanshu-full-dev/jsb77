// utils/resolveAAA.js
export function resolveAAA(card) {
  if (!card) return null;

  const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const suits = ["HEART","DIAMOND","CLUB","SPADE"];

  // Extract rank and suit
  const match = card.match(/([A2-9JQK10]+)([HDCS])/i);
  if (!match) return null;

  const rank = match[1].toUpperCase();
  const suitCode = match[2].toUpperCase();

  const suit =
    suitCode === "H" ? "HEART" :
    suitCode === "D" ? "DIAMOND" :
    suitCode === "C" ? "CLUB" :
    "SPADE";

  // Determine main winner
  let winner = null;
  if (["A","2","3","4","5","6"].includes(rank)) winner = "AMAR";
  else if (["7","8","9","10"].includes(rank)) winner = "AKBAR";
  else if (["J","Q","K"].includes(rank)) winner = "ANTHONY";

  // Determine side results
  const isEven = ["2","4","6","8","10","Q"].includes(rank);
  const isOdd = ["A","3","5","7","9","J","K"].includes(rank);
  const color = ["HEART","DIAMOND"].includes(suit) ? "RED" : "BLACK";
  const under7 = ["A","2","3","4","5","6"].includes(rank);
  const over7 = ["8","9","10","J","Q","K"].includes(rank);
  const halfLoss = rank === "7"; // for Under/Over special case

  return {
    rank,
    suit,
    winner, // "AMAR" | "AKBAR" | "ANTHONY"
    evenOdd: isEven ? "EVEN" : "ODD",
    color,  // "RED" | "BLACK"
    underOver: halfLoss ? "HALF_LOSS" : under7 ? "UNDER_7" : over7 ? "OVER_7" : null,
  };
}

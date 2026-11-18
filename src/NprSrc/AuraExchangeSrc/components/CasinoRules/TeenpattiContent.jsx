import React from "react";

const TeenpattiContent = () => {
  return (
    <div className="p-4 space-y-4 leading-relaxed text-gray-800">
      {/* Heading */}
      <h2 className="text-2xl font-bold">
        TEEN PATTI
      </h2>

      {/* Intro Section */}
      <div className="space-y-3">
        <p>1. Teen Patti is 3 card poker version of Asia.</p>

        <p>
          2. Teen Patti lets the player bet against the dealer, or bet on the
          value of their own three-card hand, or bet both against the dealer and
          on the value of their own hand.{" "}
          <strong>
            You only need three consecutive cards to make a STRAIGHT and three
            of a suit to make a FLUSH
          </strong>
          . In Three Card Poker, a STRAIGHT Beats a FLUSH.
        </p>

        <p>
          3. Teen Patti (also spelled Teen Patti and sometimes referred to as
          Flash) is a gambling card game that originated in India and became
          popular in Southeast Asia. Teen Patti is India’s twist on 3 card poker
          and is identical to 3-card brag which is popular in the UK.
        </p>

        <p>4. &nbsp;Ranking of the hands</p>

        <p>
          5. Aces are ranked the highest and 2's are the lowest. The objective
          of the game is to have the best 3-card hand and to maximize the pot
          before the showdown. The categories are ranked as follows (from high
          to low):
        </p>
      </div>

      {/* Rankings */}
      <div className="space-y-4">
        <p>
          --&gt;&nbsp; <strong>Trail (three of a kind):</strong> Three cards of
          the same rank. Three aces are the highest and three 2’s are the
          lowest.&nbsp;
        </p>
        <img src="/aura/img1.png" alt="Trail example" />

        <p>
          --&gt; &nbsp;<strong>Pure Sequence (Straight Flush):</strong> Three
          consecutive cards of the same suit.
        </p>
        <img src="/aura/img2.png" alt="Pure Sequence example" />

        <p>
          --&gt; &nbsp;<strong>Sequence (Straight):</strong> Three consecutive
          cards not all in the same suit. &nbsp;&nbsp;
        </p>
        <img src="/aura/img3.png" alt="Sequence example" />

        <p>
          --&gt;&nbsp;<strong>Color (Flush):</strong> Three cards of the same
          suit that are not in sequence. When comparing two colors, first
          compare the highest card. If these are equal, compare the second and
          if these are equal compare the lowest. Highest flush is A-K-J and the
          lowest flush is 5-3-2.
        </p>
        <img src="/aura/img4.png" alt="Flush example" />

        <p>
          --&gt; &nbsp;<strong>Pair (two of a kind):</strong> Two cards of the
          same rank. Between two pairs, the one with the higher value is the
          winner. If the pairs are of equal value then the kicker card
          determines the winner. The highest pair is A-A-K and the lowest is
          2-2-3.
        </p>
        <img src="/aura/img5.png" alt="Pair example" />

        <p>
          --&gt; &nbsp;<strong>High Card:</strong> A hand in which the three
          cards are not in sequence, not all the same suit and no two cards have
          the same rank. If two players share a common high card, the next
          highest card is used to determine the winner. The best high card hand
          would be an AKJ of different suits and the worst is 5-3-2.
        </p>
        <img src="/aura/img6.png" alt="High Card example" />
      </div>

      {/* Fancy Bets */}
      <div>
        <p className="font-bold text-[13px]">
          --&gt; <u>FANCY BETS</u>
        </p>

        <div className="p-3 bg-gray-50 rounded-md shadow-sm mt-0">
          <ul className="space-y-2">
            <li className="flex justify-between pb-1 font-bold text-[13px]">
              <span>PAIR (DOUBLE)</span>
              <span>Pay Out = 1:4</span>
            </li>
            <li className="flex justify-between pb-1 font-bold text-[13px]">
              <span>FLUSH (COLOR)</span>
              <span>Pay Out = 1:8</span>
            </li>
            <li className="flex justify-between pb-1 font-bold text-[13px]">
              <span>STRAIGHT (ROWN)</span>
              <span>Pay Out = 1:14</span>
            </li>
            <li className="flex justify-between pb-1 font-bold text-[13px]">
              <span>STRAIGHT FLUSH (PAKKI ROWN)</span>
              <span>Pay Out = 1:40</span>
            </li>
            <li className="flex justify-between pb-1 font-bold text-[13px]">
              <span>TRIO (TEEN)</span>
              <span>Pay Out = 1:75</span>
            </li>
            <li className="flex justify-between pb-1 font-bold text-[13px]">
              <span>PUTLA (1 PICTURE IN GAME)</span>
              <span>Pay Out = 1:0.70</span>
            </li>
            <li className="flex justify-between pb-1 font-bold text-[13px]">
              <span>PUTLA (2 PICTURE IN GAME)</span>
              <span>Pay Out = 1:4</span>
            </li>
            <li className="flex justify-between pb-1 font-bold text-[13px]">
              <span>PUTLA (3 PICTURE IN GAME)</span>
              <span>Pay Out = 1:25</span>
            </li>
            <li className="flex justify-between pb-1 font-bold text-[13px]">
              <span>LOVE MARRIAGE (Q &amp; K WITH SAME SUIT)</span>
              <span>Pay Out = 1:25</span>
            </li>
            <li className="flex justify-between pb-1 font-bold text-[13px]">
              <span>BF LOVE GF (J &amp; Q WITH SAME SUIT)</span>
              <span>Pay Out = 1:25</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeenpattiContent;

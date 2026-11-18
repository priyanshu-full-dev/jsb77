import React from 'react';

const RulesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-1">
      {/* Modal Card - Centered, Max Width, Responsive Padding */}
      <div className="w-full mt-2 max-w-4xl mx-auto rounded-lg bg-white text-[#23282c] shadow-2xl overflow-hidden">
        
        {/* Scrollable Content Area */}
        <div className="max-h-[72vh] overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="space-y-8 text-sm leading-relaxed">

            {/* Cricket General Rules */}
            <div style={{ lineHeight: '17px' }}>
              <p>1. Cricket General :- If a ball is not bowled during a competition, series or match then all bets will be void except for those on any market that has been unconditionally determined (e.g. in the 'Completed Match' market).</p><br/>
              <p>2. Cricket General :- If a match is shortened by weather, all bets will be settled according to the official result (including for limited overs matches, the result determined by the Duckworth Lewis method).</p><br/>
              <p>3. Cricket General :- In the event of a match being decided by a bowl-off or toss of the coin, all bets will be void except for those on markets that have been unconditionally determined.</p><br/>
              <p>4. Cricket Test matches :- If a match starts but is later abandoned for any reason other than weather (which may include but is not limited to: dangerous or unplayable wicket or outfield; pitch vandalism; strike or boycott; crowd protests/violence; stadium damage; acts of terrorism; and acts of God), Betfair reserves the right to void all bets, except for those on markets that have been unconditionally determined.</p><br/>
              <p>5. In case anyone is found using 2 different IDs and logging in from same IP his winning in both accounts will be cancelled.</p><br/>
              <p>6. Cricket Test matches :- If the match is not scheduled to be completed within five days after the original scheduled completion date, then all bets on markets for this event will be void, except for bets on any markets that have been unconditionally determined.</p><br/>
              <p>7. Cricket Limited Over matches :- If a match is declared No Result, bets will be void on all markets for the event except for those markets which have been unconditionally determined or where the minimum number of overs have been bowled as laid out in the market specific information.</p><br/>
              <p>8. Cricket Limited Over matches :- In the event of a new toss taking place on a scheduled reserve day for a limited overs match all bets that were placed after 30 minutes before the original scheduled start of play on the first day will be made void. This rule relates to all markets except those that have been unconditionally determined (e.g. in the win the toss and toss combination markets).</p><br/>
              <p>9. Multiple Bets :- Multiple Bets With Same Time And Same User Will Be Voided Immediately.</p>
            </div>

            {/* Cricket Bookmaker */}
            <div className="my-8">
              <h3 className="mb-4 text-xl font-bold ">Cricket Bookmaker</h3>
              
              <div className="overflow-x-auto rounded-lg border border-gray-300">
                <table className="w-full border border-gray-700 text-center text-xs md:text-sm">
                  <thead className="bg-white text-[#23282c]">
                    <tr>
                      <th colSpan={2} className="border border-gray-700 py-3 font-bold ">
                        BOOKMAKER RATE PATTERN
                      </th>
                    </tr>
                    <tr>
                      <th className="border border-gray-700 py-2">BETFAIR RATES</th>
                      <th className="border border-gray-700 py-2">BOOKMAKER RATE</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-50">
                    <tr>
                      <td className="border border-gray-700 py-2">1.54</td>
                      <td className="border border-gray-700 py-2">54 = 54 PAISA</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 py-2">1.58</td>
                      <td className="border border-gray-700 py-2">58 = 58 PAISA</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 py-2">2.72</td>
                      <td className="border border-gray-700 py-2">172 = 1 RUPEE 72 PAISA</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 py-2">2.84</td>
                      <td className="border border-gray-700 py-2">184 = 1 RUPEE 84 PAISA</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 space-y-2 text-xs md:text-sm">
                <p>1. Due to any reason any team will be getting advantage or disadvantage we are not concerned.</p>
                <p>2. We will simply compare both teams 25 overs score higher score team will be declared winner in ODI (25 over comparison)</p>
                <p>3. We will simply compare both teams 10 overs higher score team will be declared winner in T20 matches (10 over comparison)</p>
                <p>4. Any query about the result or rates should be contacted within 7 days of the specific event, the same will not be considered valid post 7 days from the event.</p>
              </div>

              <div className="mt-6 space-y-1">
                <p className="font-bold">Next Man Out/Caught Out</p>
                <p>1. Advance Market wil be Valid in Both Innings</p>
                <p>2. If Player does not Come Then All Bets Will Be Voided.</p>
                <p>3. If Both Player Remain Not Out till Innings end, Then All Bets will be voided.</p>
              </div>

              <div className="mt-6 space-y-1">
                <p className="font-bold">Lunch Favourite Market</p>
                <p>1. In the innings Break Which Team is Favourite will be Considered as lunch Favourite.</p>
                <p>2. If Match gets TIE All bets will be voided.</p>
                <p>3. In case Overs are reduced in a match, the team which favourite at the inning break will be considered as Lunch Favourite.</p>
              </div>
            </div>

            {/* Rules Of Fancy Bets */}
            <div className="mt-10">
              <h3 className="mb-4 text-xl font-bold ">Rules Of Fancy Bets</h3>
              <div className="space-y-2 text-xs md:text-sm">
                <p>1. Once all session/fancy bets are completed and settled there will be no reversal even if the Match is Tied or is Abandoned.</p>
                <p>2. All Advance Fancy Bets Market will be Suspended 60 mins prior to Match and will be Settled.</p>
                <p>3. Under the Rules of Fancy Market if Market Gets Suspended for any reason and does not resume then all Previous Bets will remain Valid and become Har-Jeet bets.</p>
                <p>4. All decisions relating to settlement of wrong market being offered will be taken by management. Management will consider all actual facts and decision taken will be full and final.</p>
                <p>5. Due to any technical error market is open and result has came all bets after result will be Voided.</p>
                <p>6. If any case wrong rate has been given in fancy, that particular bets will be Voided (Wrong Commentary).</p>
                <p>7. Should there be a power failure or a problem with the Internet Connection at our end and Fancy Market does not get suspended then our decision on the outcome is final.</p>
                <p>8. In case customer make bets in wrong fancy we are not liable to delete. No changes will be made and bets will be consider as confirm bet.</p>
                <p>9. In any circumstances management decision will be final related to all exchange items. Our scorecard will be considered as valid if there is any mismatch in online portal.</p>
                <p>10. Any bets which are deemed of being suspicious, including bets which have been placed from the stadium or from a source at the stadium maybe voided at anytime. The decision of whether to void the particular bet in question or to void the entire market will remain at the discretion of Company. The final decision of whether bets are suspicious will be taken by Company and that decision will be full and final.</p>
                <p>11. Any sort of cheating bet, any sort of Matching (Passing of funds), Court Siding (Ghaobaazi on commentary), Sharpening, Commission making is not allowed in Company, If any company User is caught in any of such act then all the funds belonging that account would be seized and confiscated. No argument or claim in that context would be entertained and the decision made by company management will stand as final authority.</p>
                <p>12. Fluke hunting/Seeking is prohibited in Company, All the fluke bets will be reversed. Cricket Commentary and Live Streaming is just an additional feature and facility for company user but company is not responsible for any delay or mistake in Commentary and Live Streaming.</p>
                <p>13. Penalty Runs - Any Penalty Runs in the Match Will be Counted While Settling in our Exchange.</p>
              </div>

              {/* Test Match Fancy Rules */}
              <div className="mt-8">
                <p className="font-bold text-yellow-300">Test Match Fancy Rules</p>
                <div className="mt-3 space-y-2 text-xs md:text-sm">
                  <p><strong>1. Session Market (Test Match)</strong></p>
                  <p>1.1 Complete session valid in test.</p>
                  <p>1.2 In Case of team all out, running session will be settled at current score</p>
                  <p>1.3 Due to Innings Declaration or Team all out, middle session and session is not completed so that particular over is considered completed and remaining over will bet counted in next inning.</p>
                  <p className="ml-4 italic">For Example:-</p>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>You are Placing Advance Bets in 1st innings 80 over runs ADV in case team-A declares or all-out at 70 over next 10 over counted in Team-B's 1st inning</li>
                    <li>Current over is 70.4 and 75 Over Session is Running and Inning Has been Declared or All out, Following Condition Will be Applied<br />
                      <ul className="ml-6 list-circle">
                        <li>Over Will Be Rounded 71.</li>
                        <li>Remaining 4 Over Will Be Counted From Next Inning.</li>
                      </ul>
                    </li>
                  </ul>
                  <p>1.4 Test match both advance session is valid on Both Team's 1st Innings.</p>
                  <p>1.5 1st day 1st session Runs minimum 25 over will be played then result will given otherwise 1st day 1st session will be Voided.</p>
                  <p>1.6 1st day 2nd session Runs minimum Total 50 over will be played then result will given otherwise 1st day 2nd session Runs will be Voided.</p>
                  <p>1.7 1st Day Total Runs minimum total 80 over will be played then result will given otherwise 1st day total Runs will be Voided.</p>
                </div>
              </div>
            </div>

            {/* IPL, PSL, Hundred Rules */}
            <div className="mt-10 space-y-8">
              <div>
                <h3 className="mb-3 text-xl font-bold ">Indian Premier League (IPL)</h3>
                <p className="text-xs md:text-sm">1. If IPL fixture of 74 matches gets reduced due to any reason, then all the special fancies will be voided (Match abandoned due to rain/bad light will not be considered in this).</p>
                <p className="text-xs md:text-sm">2. At any situation if result is given for any particular event based on the rates given for the same, then the particular result will be considered valid, similarly if the tournament gets canceled due to any reason the previously given result will be considered valid.</p>
              </div>

              <div>
                <h3 className="mb-3 text-xl font-bold ">Pakistan Super League (PSL)</h3>
                <p className="text-xs md:text-sm">1. If PSL fixture of 34 matches gets reduced due to any reason, then all the special fancies will be voided (Match abandoned due to rain/bad light will not be considered in this)</p>
              </div>

              <div>
                <h3 className="mb-3 text-xl font-bold ">THE HUNDRED TOURNAMENT RULES</h3>
                <p className="text-xs md:text-sm">If Hundred fixture of 34 matches gets reduced due to any reason, then all the special fancies will be voided (Match abandoned due to rain/bad light will not be considered in this)</p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer with OK Button */}
        <div className="border-t border-gray-300 bg-gray-50 p-1 text-center">
          <button
            onClick={onClose}
            className="mx-auto block w-36 rounded border border-[#23282c] text-xs py-[3px] text-black font-bold"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
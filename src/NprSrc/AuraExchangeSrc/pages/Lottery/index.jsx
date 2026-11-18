import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LOTTERY_MARKETS } from "./lotteryMockData";

export default function Lottery() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");

  const filterTabs = [
    {
      id: "all",
      label: "All markets",
      icon: (
        <svg
          className="market-filter-icon"
          viewBox="0 0 16 16"
          fill="currentColor"
          width="16"
          height="16"
        >
          <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z" />
        </svg>
      ),
    },
    {
      id: "day",
      label: "Day markets",
      icon: (
        <svg
          className="market-filter-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="16"
          height="16"
        >
          <path d="M12 17.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zm0 2a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zm0-19a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V1.5a1 1 0 0 1 1-1zm9.192 3.808a1 1 0 0 1 0 1.414l-1.414 1.414a1 1 0 1 1-1.414-1.414l1.414-1.414a1 1 0 0 1 1.414 0zM4.222 18.364a1 1 0 0 1 0 1.414l-1.414 1.414a1 1 0 1 1-1.414-1.414l1.414-1.414a1 1 0 0 1 1.414 0zm15.97 1.414a1 1 0 0 1-1.414 1.414l-1.414-1.414a1 1 0 1 1 1.414-1.414l1.414 1.414zM4.222 5.222a1 1 0 0 1-1.414 1.414L1.394 5.222a1 1 0 0 1 1.414-1.414L4.222 5.222zM21.5 11a1 1 0 0 1 1 1 1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1 1 1 0 0 1 1-1h2zM3.5 11a1 1 0 0 1 1 1 1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1 1 1 0 0 1 1-1h2z" />
        </svg>
      ),
    },
    {
      id: "night",
      label: "Night markets",
      icon: (
        <svg
          className="market-filter-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="16"
          height="16"
        >
          <path d="M21.64 13a1 1 0 0 0-1.05-.14 8.049 8.049 0 0 1-3.37.73A8.15 8.15 0 0 1 9.08 5.49a8.59 8.59 0 0 1 .25-2A1 1 0 0 0 8 2.36a10.14 10.14 0 1 0 14 11.69 1 1 0 0 0-.36-1.05z" />
        </svg>
      ),
    },
    {
      id: "main",
      label: "Main markets",
      icon: (
        <svg
          className="market-filter-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="16"
          height="16"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
  ];

  const filteredMarkets = useMemo(() => {
    if (activeFilter === "all") return LOTTERY_MARKETS;
    if (activeFilter === "day") {
      return LOTTERY_MARKETS.filter((m) => m.category === "day");
    }
    if (activeFilter === "night") {
      return LOTTERY_MARKETS.filter((m) => m.category === "night");
    }
    if (activeFilter === "main") {
      return LOTTERY_MARKETS.filter((m) => m.isMain);
    }
    return LOTTERY_MARKETS;
  }, [activeFilter]);

  const handleCardClick = (market, e) => {
    e.preventDefault();
    navigate(`/lottery/${market.gameId}/${market.marketId}`);
  };

  return (
    <>
      {/* 100% exact CSS styles as provided by user without any external CSS file */}
      <style>{`
        .lottery {
          display: block;
          min-width: 0;
          padding: 8px;
          background: #f7f7f7;
          color: #343434;
        }
        .market-filters {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          padding: 5px 4px 8px;
          gap: 10px;
          margin: 0 0 6px;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .market-filters::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        .market-filter {
          flex: 1 0 auto;
          white-space: nowrap;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 36px;
          padding: 6px 12px;
          border: 0;
          border-radius: 28px;
          background: linear-gradient(#fff, #fafafa);
          box-shadow: 0 3px 3px rgba(0, 0, 0, 0.07);
          color: #343434;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
        }
        .market-filter .market-filter-icon {
          font-size: 16px;
        }
        .market-filter.active {
          background: #ff7012;
          color: #fff;
        }
        .market-filter:hover {
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
        }
        .market-filter:focus-visible, .market-card:focus-visible {
          outline: 3px solid #ff7012;
          outline-offset: 4px;
        }
        .lottery-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .market-card {
          --card-tint: 0, 71, 29;
          position: relative;
          display: flex;
          align-items: flex-end;
          aspect-ratio: 1.45;
          min-width: 0;
          overflow: hidden;
          border-radius: 10px;
          background: #10251c;
          box-shadow: 0 4px 7px rgba(0, 0, 0, 0.15);
          color: #fff;
          text-decoration: none;
          transition: transform .16s ease, box-shadow .16s ease;
        }
        .card-ruby {
          --card-tint: 91, 4, 24;
        }
        .card-amber {
          --card-tint: 76, 40, 5;
        }
        .market-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 7px 14px rgba(0, 0, 0, 0.19);
        }
        .market-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .market-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 30%, rgba(var(--card-tint), .25) 48%, rgba(var(--card-tint), .95) 80%, #06130ef5);
          pointer-events: none;
        }
        .market-content {
          position: relative;
          width: 100%;
        }
        .market-name {
          margin: 0;
          padding: 8px 6px;
          color: #fff;
          text-align: center;
          font-size: clamp(14px, 1.25vw, 20px);
          font-weight: 900;
          font-style: italic;
          line-height: 1.15;
          text-transform: uppercase;
          overflow-wrap: anywhere;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.46);
        }
        .market-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: 6px 0;
          background: #00000045;
          border-radius: 12px 12px 0 0;
        }
        .market-time {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 0 7px;
          min-width: 0;
        }
        .market-time + .market-time {
          border-left: 1px solid #ffffff35;
        }
        .detail-label {
          color: #e0e0e0;
          font-size: 11px;
          white-space: nowrap;
          display: flex;
          align-items: center;
        }
        .detail-label i {
          margin-right: 4px;
          display: inline-flex;
          align-items: center;
        }
        .detail-value {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          transform-origin: left center;
          color: #ffffff;
          animation: time-heartbeat 4s ease-in-out infinite;
          animation-delay: 0s;
        }
        .closing-time {
          color: #ff801e;
        }
        @keyframes time-heartbeat {
          0%, 25%, 100% {
            transform: scale(1);
            text-shadow: none;
          }
          6% {
            transform: scale(1.1);
            text-shadow: 0 0 8px currentColor;
          }
          12% {
            transform: scale(1);
            text-shadow: none;
          }
          18% {
            transform: scale(1.1);
            text-shadow: 0 0 8px currentColor;
          }
        }
        .lottery-help {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 10px;
          margin-top: 15px;
          border: 1px solid #f7e1d1;
          border-radius: 18px;
          background: #fff2e9;
        }
        .help-icon {
          display: grid;
          place-items: center;
          flex: 0 0 48px;
          height: 48px;
          border-radius: 50%;
          background: #ff7012;
          color: #fff;
          font-size: 25px;
        }
        .lottery-help h3 {
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 700;
          color: #343434;
        }
        .lottery-help p {
          margin: 0;
          font-size: 14px;
          line-height: 1.55;
          color: #343434;
        }
        .help-coins {
          margin-left: auto;
          padding-left: 16px;
          color: #efa917;
          font-size: 46px;
        }
        @media (max-width: 1100px) {
          .lottery {
            padding: 8px;
          }
          .market-filters {
            gap: 12px;
            margin-inline: 0;
          }
          .lottery-grid {
            gap: 10px;
          }
          .market-filter {
            gap: 8px;
            font-size: 12px;
          }
          .market-time {
            padding-inline: 8px;
          }
          .detail-label, .detail-value {
            font-size: 11px;
          }
        }
        @media (max-width: 767px) {
          .lottery {
            padding: 8px 8px 16px;
          }
          .market-filters {
            gap: 10px;
            margin-bottom: 8px;
          }
          .market-filter {
            min-width: 145px;
            min-height: 36px;
            font-size: 11px;
          }
          .market-filter .market-filter-icon {
            font-size: 17px;
          }
          .lottery-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .market-card {
            border-radius: 10px;
            aspect-ratio: 1.2;
          }
          .market-name {
            font-size: clamp(13px, 3.4vw, 17px);
            padding: 6px;
          }
          .market-time {
            padding-inline: 6px;
          }
          .detail-label, .detail-value {
            font-size: 10px;
          }
          .detail-label i {
            margin-right: 2px;
          }
          .lottery-help {
            gap: 12px;
            margin-top: 20px;
            padding: 16px 12px;
            border-radius: 12px;
            align-items: flex-start;
          }
          .help-icon {
            flex-basis: 32px;
            height: 32px;
            font-size: 18px;
          }
          .lottery-help h3 {
            font-size: 15px;
            margin: 0 0 6px;
          }
          .lottery-help p {
            font-size: 12px;
          }
          .help-coins {
            display: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .detail-value, .closing-time {
            animation: none;
          }
          .market-card {
            transition: none;
          }
          .market-card:hover {
            transform: none;
          }
        }
      `}</style>

      <section aria-label="Lottery markets" className="lottery">
        {/* Navigation Filters */}
        <nav aria-label="Filter lottery markets" className="market-filters">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`market-filter ${isActive ? "active" : ""}`}
                aria-pressed={isActive}
              >
                <i aria-hidden="true">{tab.icon}</i>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Lottery Grid */}
        <div className="lottery-grid">
          {filteredMarkets.map((market) => {
            const cardClass = `market-card ${
              market.variant === "ruby"
                ? "card-ruby"
                : market.variant === "amber"
                ? "card-amber"
                : ""
            }`;

            return (
              <a
                key={market.id}
                className={cardClass}
                aria-label={`${market.name} — View market`}
                href={`/lottery/${market.gameId}/${market.marketId}`}
                onClick={(e) => handleCardClick(market, e)}
              >
                <img
                  alt=""
                  loading="lazy"
                  className="market-image"
                  src={market.image}
                />
                <div className="market-shade"></div>
                <div className="market-content">
                  <h2 className="market-name">{market.name}</h2>
                  <div className="market-details">
                    <div className="market-time">
                      <span className="detail-label">
                        <i aria-hidden="true">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width="11"
                            height="11"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        </i>{" "}
                        Open Time
                      </span>
                      <span className="detail-value">{market.openTime}</span>
                    </div>
                    <div className="market-time">
                      <span className="detail-label">
                        <i aria-hidden="true">
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="11"
                            height="11"
                          >
                            <path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zM10 9.5l-4-4V4h8v1.5l-4 4z" />
                          </svg>
                        </i>{" "}
                        Close Time
                      </span>
                      <span className="detail-value closing-time">
                        {market.closeTime}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* How it works? Help section */}
        <aside className="lottery-help">
          <span aria-hidden="true" className="help-icon">
            <i className="fas fa-info">
              <svg viewBox="0 0 192 512" fill="currentColor" width="16" height="16">
                <path d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32h64c17.7 0 32 14.3 32 32v192h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32h32V256H32c-17.7 0-32-14.3-32-32z" />
              </svg>
            </i>
          </span>
          <div>
            <h3>How it works?</h3>
            <p>
              Choose a market, select your lucky numbers and place your bet before the closing time.<br />
              Results will be available at the draw time.
            </p>
          </div>
          <span aria-hidden="true" className="help-coins">
            <i className="fas fa-coins">
              <svg viewBox="0 0 512 512" fill="currentColor" width="46" height="46">
                <path d="M512 80c0 18-57 34.9-153.6 45.5C334.9 80.4 298 48 256 48S177.1 80.4 153.6 125.5C57 114.9 0 98 0 80 0 35.8 114.6 0 256 0S512 35.8 512 80zM393.2 214.7c20.8-7.4 39.9-16.9 56.4-28.1 38-25.9 62.4-58.4 62.4-94.6v64c0 36.2-24.4 68.7-62.4 94.6-20.5 13.9-45.2 25.2-72.8 33.1 10.6-21.4 16.4-44.1 16.4-69zm-137.2 65.3c141.4 0 256-35.8 256-80v64c0 44.2-114.6 80-256 80S0 308.2 0 264v-64c0 44.2 114.6 80 256 80zm0 160c141.4 0 256-35.8 256-80v64c0 44.2-114.6 80-256 80S0 468.2 0 424v-64c0 44.2 114.6 80 256 80z" />
              </svg>
            </i>
          </span>
        </aside>
      </section>
    </>
  );
}

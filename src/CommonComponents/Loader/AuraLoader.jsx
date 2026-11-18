import React from "react";
import { useSelector } from "react-redux";
import { selectSite } from "../../utils/helper/commonSelectors";


const AuraLoader = () => {
  const siteDetails = useSelector(selectSite());
  return (
    <>
      <div className="black-overlay"></div>
      <div className="loading-wrap-wrapper">
        <div className="loading-wrap">
          <ul className="loading">
            <li>
              <div className="loading-spinner-dual-ball">
                <div className="loader">
                  <div></div>
                  <div
                  style={{
                    background: siteDetails?.headerColor
                      ? `linear-gradient(180deg, ${siteDetails?.headerColor?.start}, ${siteDetails?.headerColor?.end})`
                      : "red"
                  }}
                  
                  ></div>
                  <div></div>
                </div>
              </div>
            </li>
            <li>#00723c</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default AuraLoader;

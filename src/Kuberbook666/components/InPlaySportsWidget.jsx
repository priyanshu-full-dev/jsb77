import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { IN_PLAY_SPORTS_DATA } from "../data/inPlaySportsData";
import { socket } from "../../socketClient";
import {
  setRunningData,
  setMarketName,
  setMarketOddsData,
} from "../../redux/slices/fullmarketSlice";
import BetSlip from "./BetSlip";
import {
  handleOpenPlaceBet,
  handleCancelPlaceBet,
} from "../../redux/slices/placeBetSlice";

// ==========================================
// SVG ICONS (EXACT PIXEL-PERFECT VECTORS)
// ==========================================
const InPlayHeaderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="29"
    height="29"
    viewBox="0 0 29 29"
    fill="none"
  >
    <g clipPath="url(#clip0_1696_2272)">
      <path
        d="M14.5 2.83337C8.06004 2.83337 2.83337 8.06004 2.83337 14.5C2.83337 20.94 8.06004 26.1667 14.5 26.1667C20.94 26.1667 26.1667 20.94 26.1667 14.5C26.1667 8.06004 20.94 2.83337 14.5 2.83337ZM12.1667 19.75V9.25004L19.1667 14.5L12.1667 19.75Z"
        fill="var(--color-quaternary)"
      />
    </g>
    <defs>
      <clipPath id="clip0_1696_2272">
        <rect
          width="28"
          height="28"
          fill="white"
          transform="translate(0.5 0.5)"
        />
      </clipPath>
    </defs>
  </svg>
);

const CricketIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 19 18"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="9.5" cy="9" r="8.5" fill="#ffffff" />
    <path
      d="M4.36255 16.7108C4.35063 16.7037 4.34109 16.6966 4.32917 16.6895C3.88333 16.4077 3.4518 16.107 3.05842 15.7566C2.91299 15.6263 2.77709 15.489 2.63404 15.3564C2.59828 15.3256 2.61974 15.3067 2.63642 15.283C2.81524 15.0533 2.99643 14.8213 3.17524 14.5916C3.92148 13.635 4.6701 12.676 5.41634 11.7194C6.27225 10.6231 7.12578 9.52678 7.98169 8.43047C8.8066 7.37204 9.6339 6.31125 10.4588 5.25282C11.329 4.14231 12.1969 3.02942 13.0647 1.9189C13.2292 1.70816 13.3961 1.49506 13.5582 1.28195C13.5797 1.25354 13.5916 1.24644 13.6274 1.26538C13.9468 1.45244 14.2472 1.67028 14.5333 1.90233C14.6692 2.01125 14.8123 2.1107 14.9458 2.22199C15.0817 2.34038 15.2128 2.46351 15.3439 2.58663C15.3773 2.61742 15.3535 2.63162 15.3368 2.65293C15.1008 2.95602 14.8623 3.26147 14.6263 3.56455C13.9254 4.46433 13.222 5.36411 12.5211 6.26389C11.7343 7.27259 10.9476 8.28129 10.1584 9.29C9.42648 10.2277 8.69693 11.1653 7.965 12.103C7.12101 13.1827 6.2794 14.2648 5.43542 15.3446C5.08971 15.7874 4.7464 16.2278 4.40069 16.6706C4.39116 16.6848 4.38401 16.7037 4.36255 16.7108Z"
      fill="#c10b32"
    />
    <path
      d="M17.9928 8.49706C17.9761 8.16556 17.9451 7.83643 17.8927 7.50967C17.8283 7.11424 17.7305 6.72591 17.6137 6.33995C17.3777 5.55146 17.0225 4.8198 16.5814 4.12365C16.4336 3.89161 16.2762 3.66903 16.1022 3.45119C16.0879 3.46776 16.0736 3.48197 16.0617 3.49854C15.7231 3.93423 15.3869 4.36991 15.0484 4.80322C14.2426 5.84271 13.4367 6.88219 12.6309 7.92167C11.7988 8.99431 10.9691 10.0669 10.1371 11.1372C9.34792 12.1554 8.55639 13.1759 7.76724 14.1941C6.99001 15.1981 6.2104 16.202 5.43317 17.2036C5.40456 17.2391 5.40695 17.251 5.44986 17.2699C6.43213 17.6867 7.45492 17.9211 8.52063 17.9803C9.05468 18.0087 9.58872 17.9921 10.1204 17.9258C10.571 17.869 11.0144 17.7814 11.4483 17.6511C12.247 17.412 13.0052 17.0852 13.7157 16.6495C14.4619 16.1925 15.1247 15.6385 15.7112 14.9897C16.0998 14.5587 16.4455 14.097 16.7411 13.5998C17.1917 12.8421 17.5136 12.0346 17.7353 11.1846C17.8736 10.6518 17.9594 10.1096 17.988 9.56022C18.0095 9.20741 18.0119 8.85224 17.9928 8.49706ZM9.17865 15.8587C8.93547 16.1618 8.70182 16.472 8.46579 16.7821C8.3299 16.9621 8.15586 17.0473 7.92936 16.9952C7.69572 16.9408 7.54552 16.7443 7.5479 16.5051C7.54552 16.382 7.58843 16.2754 7.66472 16.1783C7.90075 15.8776 8.13678 15.5745 8.37281 15.2738C8.52778 15.0797 8.7805 15.0063 8.98792 15.1128C9.31931 15.2809 9.336 15.6598 9.17865 15.8587ZM11.105 13.2612C11.0955 13.3606 11.055 13.4435 10.9954 13.5216C10.7569 13.8271 10.5233 14.1349 10.2873 14.4403C10.1633 14.6014 10.0012 14.6795 9.79853 14.644C9.58157 14.6061 9.44567 14.4688 9.39322 14.2557C9.38369 14.2201 9.38369 14.1823 9.3813 14.1444C9.3813 14.026 9.42183 13.9194 9.49336 13.8271C9.73654 13.5169 9.97972 13.2043 10.2253 12.8941C10.3588 12.726 10.6115 12.6621 10.807 12.7426C10.9977 12.8231 11.1265 13.0457 11.105 13.2612ZM12.8407 11.1443C12.5927 11.4569 12.3519 11.7742 12.0992 12.082C11.98 12.2264 11.8131 12.3069 11.6176 12.2643C11.4078 12.2169 11.2695 12.082 11.2242 11.8689C11.1932 11.7268 11.2266 11.5918 11.3172 11.4734C11.5485 11.1704 11.7845 10.872 12.0134 10.5666C12.2494 10.2493 12.7501 10.28 12.9098 10.666C12.936 10.7276 12.9432 10.7915 12.9432 10.8554C12.9432 10.9644 12.9098 11.0591 12.8407 11.1443ZM14.6645 8.77646C14.419 9.09139 14.1758 9.41105 13.9326 9.72834C13.7991 9.90119 13.5678 9.97459 13.358 9.90829C13.1602 9.84673 13.0195 9.66204 13.0123 9.44656C13.0076 9.31633 13.0576 9.19794 13.1363 9.09849C13.3747 8.79067 13.6203 8.48996 13.8635 8.18687C14.0018 8.01639 14.2235 7.95009 14.4238 8.02112C14.624 8.09216 14.7575 8.27922 14.7599 8.49943C14.7528 8.59414 14.7313 8.69122 14.6645 8.77646ZM16.5099 6.40152C16.2667 6.71644 16.0235 7.03373 15.7827 7.34866C15.6254 7.55466 15.4084 7.62333 15.1795 7.53808C14.9888 7.46705 14.86 7.27288 14.8648 7.03847C14.8624 6.94375 14.9077 6.8372 14.9816 6.74012C15.2153 6.44177 15.4465 6.14342 15.6826 5.84508C15.8638 5.61303 16.1308 5.56804 16.3835 5.72432C16.5933 5.85691 16.6601 6.20736 16.5099 6.40152Z"
      fill="#c10b32"
    />
    <path
      d="M12.5188 0.709924C11.5127 0.274241 10.4589 0.0469281 9.36222 0.00667475C8.58975 -0.0217394 7.82444 0.0398245 7.06866 0.205573C6.33911 0.364219 5.63817 0.605739 4.97299 0.94434C3.79522 1.54104 2.7915 2.35084 1.96896 3.38559C1.49213 3.98702 1.09398 4.63344 0.784041 5.33432C0.469333 6.04467 0.245222 6.78581 0.116478 7.55062C0.0592586 7.88212 0.0306488 8.21598 0.0163439 8.54985C0.00203901 8.85057 0.00203901 9.14891 0.0163439 9.44963C0.0282647 9.72904 0.0521062 10.0108 0.0902526 10.2878C0.142704 10.6738 0.233302 11.0527 0.338204 11.4268C0.457412 11.8577 0.602845 12.2816 0.791193 12.6888C0.979541 13.0937 1.19888 13.4821 1.4373 13.8609C1.57796 14.0835 1.72816 14.2966 1.89029 14.5097C5.44744 9.91609 8.99982 5.32248 12.5522 0.733602C12.5451 0.717027 12.5308 0.71466 12.5188 0.709924ZM3.05375 11.1379C2.81057 11.4505 2.56739 11.7654 2.31943 12.0732C2.17162 12.2579 1.91651 12.3171 1.70909 12.2082C1.45637 12.0732 1.3014 11.7441 1.5279 11.4741C1.61134 11.3747 1.68525 11.2681 1.76393 11.1639C1.92366 10.9532 2.07863 10.7377 2.24076 10.5294C2.37427 10.3565 2.55308 10.2831 2.77004 10.3328C2.987 10.3826 3.11097 10.5246 3.15627 10.7401C3.15865 10.7472 3.15865 10.7567 3.16104 10.7638C3.16104 10.7851 3.16104 10.8064 3.16104 10.8277C3.16342 10.9414 3.12528 11.0456 3.05375 11.1379ZM4.8824 8.78427C4.68213 9.03999 4.48186 9.29809 4.28159 9.55382C4.24583 9.60117 4.21006 9.64853 4.17192 9.69352C4.06463 9.82849 3.91681 9.89952 3.6784 9.89715C3.5282 9.89242 3.38753 9.77166 3.29932 9.5917C3.21349 9.42122 3.24687 9.2602 3.36369 9.10866C3.60449 8.79611 3.83814 8.47882 4.07655 8.16389C4.20291 7.99814 4.37457 7.92711 4.57722 7.96263C4.78226 7.99814 4.91816 8.1189 4.97538 8.32254C5.02544 8.49302 4.98968 8.64693 4.8824 8.78427ZM6.69673 6.43063C6.4607 6.73372 6.22467 7.03443 5.98864 7.33515C5.85275 7.508 5.66917 7.55772 5.46413 7.508C5.27101 7.46064 5.14704 7.32804 5.09697 7.13625C5.05882 6.98471 5.09935 6.84264 5.18995 6.72424C5.4379 6.40222 5.69301 6.08729 5.95049 5.77C6.07209 5.62083 6.23659 5.5711 6.42017 5.61136C6.61806 5.65398 6.74203 5.78421 6.79687 5.98074C6.80879 6.02099 6.81117 6.06125 6.80879 6.11571C6.81594 6.227 6.77303 6.33355 6.69673 6.43063ZM8.59452 3.9515C8.52538 4.09831 8.41332 4.21433 8.31796 4.33983C8.15107 4.55767 7.98179 4.77551 7.81013 4.98862C7.68139 5.14963 7.50496 5.21119 7.30708 5.17094C7.09727 5.12832 6.96138 4.99572 6.91369 4.78498C6.90654 4.75183 6.90654 4.71395 6.90177 4.67843C6.90416 4.5553 6.95422 4.45348 7.02575 4.35877C7.25701 4.05332 7.49066 3.75023 7.72669 3.44715C7.88166 3.24825 8.13199 3.17722 8.34657 3.2814C8.6279 3.42347 8.71134 3.70288 8.59452 3.9515ZM10.3683 1.70679C10.1299 2.02408 9.88673 2.33663 9.64355 2.65155C9.5148 2.8173 9.28115 2.8836 9.08089 2.81967C8.88062 2.75574 8.74234 2.57105 8.73518 2.35557C8.7328 2.22534 8.78287 2.10695 8.85678 2.00513C9.09042 1.69495 9.32884 1.38713 9.56725 1.07931C9.665 0.953812 9.79852 0.885144 9.97494 0.878041C10.1704 0.894616 10.3254 0.998801 10.4232 1.17639C10.5281 1.36108 10.4899 1.54577 10.3683 1.70679Z"
      fill="#c10b32"
    />
  </svg>
);

const FootballIcon = () => (
  <svg
    viewBox="0 0 96 96"
    height="20"
    width="20"
    className="fill-[#000000] dark:fill-[#ffffff]"
  >
    <path d="M95.994 53.946a11.3 11.3 0 0 0-4.743-1.029c-1.718 0-3.349.38-4.814 1.059l.07-.03c.313-1.146.494-2.46.494-3.814 0-5.252-2.702-9.874-6.787-12.551l-.057-.037c6.913-.642 10.53-12.58 10.53-12.58-4.555-8.412-11.233-15.168-19.328-19.69l-.247-.127S59.454 3.54 55.956 7.236C51.615.202 39.275.202 39.275.202c-9.79 1.878-18.28 6.503-24.888 13.03l.006-.005a12.33 12.33 0 0 0 4.637 9.629l.024.018c-6.15 1.447-12.542 10.09-11.496 13.588a6.71 6.71 0 0 0-5.378-2.695q-.089 0-.178.003h.009C.745 37.897.009 42.64 0 47.554v.009c0 5.303.868 10.401 2.47 15.165l-.097-.335a15.8 15.8 0 0 0 4.95-6.925l.033-.109c3.048 2.011 6.79 3.205 10.809 3.205 1.977 0 3.889-.29 5.695-.829l-.142.036c-1.266 2.56-2.008 5.572-2.008 8.759 0 4 1.17 7.727 3.184 10.856l-.048-.078a16.44 16.44 0 0 0-9.838 5.173l-.012.013c8.632 8.23 20.344 13.298 33.242 13.304 4.1-.009 8.077-.537 11.867-1.52l-.329.073c-2.24-5.189-6.32-9.229-11.396-11.363l-.142-.051c5.629-.323 11.176-8.563 12.06-14.191 4.043 1.839 8.77 2.909 13.748 2.909a34 34 0 0 0 3.605-.19l-.147.012c-.863 2.12-1.363 4.58-1.363 7.154 0 2.575.5 5.035 1.41 7.287l-.044-.13c9.876-7.609 16.678-18.794 18.463-31.583l.03-.253zM59.131 62.67c-6.15-8.683-23.757-13.869-33.004-8.722 5.306-13.025 3.458-21.506-3.136-30.511 12.06 1.124 26.372-5.146 32.16-13.184 1.65 8.722 11.255 23.275 20.1 26.208-14.39 6.551-16.039 16.883-16.12 26.209" />
  </svg>
);

const TennisIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 20 20"
    fill="#7FBA42"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.5403 19.3516C9.28848 19.3516 9.03913 19.3516 8.78731 19.3516C8.74781 19.3516 8.73546 19.3442 8.73793 19.3021C8.78237 18.8565 8.7725 18.4135 8.75275 17.9679C8.73546 17.5595 8.69596 17.1535 8.6219 16.7526C8.49599 16.0743 8.30836 15.4109 8.06395 14.7624C7.68128 13.7476 7.15542 12.8119 6.4839 11.9579C6.13086 11.5074 5.74326 11.0891 5.3285 10.698C4.65698 10.0668 3.91387 9.53709 3.09916 9.10639C2.31902 8.69549 1.50924 8.3638 0.652565 8.15835C0.548875 8.1336 0.445185 8.11132 0.341495 8.08904C0.306931 8.08162 0.294587 8.07419 0.301994 8.02964C0.363714 7.74498 0.418028 7.45785 0.49703 7.17566C0.679722 6.51724 0.93401 5.88604 1.26977 5.28949C1.51418 4.85137 1.78081 4.42809 2.09188 4.03452C2.43505 3.59887 2.81031 3.19788 3.23001 2.83648C3.64724 2.47509 4.09162 2.15578 4.56811 1.87607C5.41244 1.38349 6.30862 1.02953 7.26405 0.829027C7.68128 0.742392 8.10592 0.687936 8.53302 0.660707C9.02678 0.631004 9.52055 0.650806 10.0143 0.660707C10.0513 0.660707 10.0587 0.675559 10.0563 0.707738C10.0513 0.801799 10.0513 0.898335 10.0464 0.992396C10.0316 1.30428 10.0365 1.61617 10.0464 1.92558C10.0587 2.28697 10.0958 2.64589 10.1452 3.00233C10.2143 3.49244 10.318 3.97512 10.4562 4.45037C10.6636 5.16821 10.9549 5.84891 11.3055 6.50734C11.6462 7.14844 12.0437 7.74993 12.5053 8.30935C13.004 8.91331 13.5669 9.4554 14.1866 9.93313C14.9124 10.495 15.6951 10.9629 16.5295 11.344C17.122 11.6139 17.7392 11.8144 18.3688 11.9752C18.5021 12.0099 18.4996 12.0099 18.4749 12.1411C18.3169 12.9802 18.038 13.7797 17.6479 14.5372C17.3343 15.1411 16.9517 15.6981 16.5122 16.2179C15.9074 16.9308 15.2087 17.5347 14.4162 18.0248C13.5669 18.5521 12.6584 18.9358 11.6832 19.1536C11.2586 19.2476 10.8265 19.3095 10.392 19.3417C10.1081 19.3615 9.82421 19.3665 9.5403 19.3665C9.5403 19.3615 9.5403 19.3566 9.5403 19.3516Z"
      fill="#7FBA42"
    />
    <path
      d="M0.00561523 10.3862C0.338905 10.4729 0.659851 10.5694 0.975859 10.6882C1.85969 11.0174 2.65712 11.4952 3.38048 12.0967C3.95819 12.5769 4.45442 13.1338 4.8914 13.7452C5.42219 14.4903 5.8172 15.3046 6.08137 16.1809C6.22456 16.6561 6.32331 17.1388 6.38009 17.6289C6.41713 17.9458 6.43194 18.2626 6.43935 18.5794C6.44181 18.6686 6.44181 18.7577 6.41713 18.8443C6.39244 18.9285 6.37269 18.9359 6.29122 18.9062C5.56785 18.6413 4.88893 18.2898 4.25198 17.8567C3.86684 17.5943 3.50393 17.3047 3.15829 16.9928C2.71884 16.5943 2.32136 16.1586 1.96339 15.6858C1.64244 15.2626 1.36099 14.817 1.11411 14.3467C0.763541 13.6809 0.489503 12.9853 0.299404 12.2576C0.178432 11.7848 0.0895549 11.3046 0.0401786 10.8194C0.0253657 10.6759 0.0179593 10.5323 0.00561523 10.3862Z"
      fill="#7FBA42"
    />
    <path
      d="M19.0056 9.63093C18.3218 9.45518 17.6725 9.21013 17.0553 8.87596C16.5097 8.5814 16.006 8.22744 15.5369 7.82397C14.8481 7.23237 14.2704 6.54672 13.8014 5.77196C13.3718 5.05907 13.0484 4.29916 12.8385 3.49222C12.7151 3.01944 12.6336 2.53923 12.599 2.0516C12.5793 1.78922 12.5694 1.52437 12.5768 1.25951C12.5768 1.24218 12.5793 1.22238 12.5818 1.20505C12.604 1.08624 12.6262 1.07386 12.7373 1.11594C13.3027 1.32634 13.8433 1.58872 14.3593 1.90308C14.8728 2.21745 15.3567 2.57389 15.806 2.97241C16.127 3.25707 16.4282 3.56648 16.7072 3.89569C17.4429 4.76699 18.0082 5.73978 18.423 6.80167C18.6501 7.38337 18.8032 7.98486 18.8995 8.60121C18.9513 8.93289 18.9809 9.26706 19.0056 9.60122C19.0056 9.61112 19.0056 9.62102 19.0056 9.63093Z"
      fill="#7FBA42"
    />
  </svg>
);

const LiveDotIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="6"
    height="6"
    viewBox="0 0 9 9"
    fill="#29ab2b"
    className="animate-pulse"
  >
    <circle cx="4.5" cy="4.5" r="4.5" fill="#29ab2b"></circle>
  </svg>
);

const TvIcon = ({ active = true }) => (
  <svg
    width="13"
    height="11"
    viewBox="0 0 13 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.8182 0H1.18182C0.525909 0 0 0.543889 0 1.22222V8.55556C0 9.22778 0.525909 9.77778 1.18182 9.77778H4.13636V11H8.86364V9.77778H11.8182C12.4682 9.77778 12.9941 9.22778 12.9941 8.55556L13 1.22222C13 0.543889 12.4682 0 11.8182 0ZM11.8182 8.55556H1.18182V1.22222H11.8182V8.55556ZM8.86364 4.88889L4.72727 7.33333V2.44444L8.86364 4.88889Z"
      fill={active ? "var(--inplay-tv-color, #29ab2b)" : "#9ca3af"}
      opacity={active ? "1" : "0.35"}
    />
  </svg>
);

// ==========================================
// HELPER FUNCTIONS FOR LIVE ODDS & TEAMS
// ==========================================
const parseTeams = (eventName, runners = [], matchRunners = []) => {
  if (matchRunners && matchRunners.length >= 2) {
    return {
      team1: matchRunners[0]?.runnerName || "Team 1",
      team2: matchRunners[1]?.runnerName || "Team 2",
    };
  }
  if (eventName) {
    if (eventName.includes(" vs ")) {
      const parts = eventName.split(" vs ");
      return { team1: parts[0]?.trim(), team2: parts[1]?.trim() };
    }
    if (eventName.includes(" v ")) {
      const parts = eventName.split(" v ");
      return { team1: parts[0]?.trim(), team2: parts[1]?.trim() };
    }
    if (eventName.includes(" / ")) {
      const parts = eventName.split(" / ");
      return { team1: parts[0]?.trim(), team2: parts[1]?.trim() };
    }
    if (eventName.includes(" - ")) {
      const parts = eventName.split(" - ");
      return { team1: parts[0]?.trim(), team2: parts[1]?.trim() };
    }
  }
  const t1 =
    runners?.[0]?.runnerName ||
    runners?.[0]?.selectionName ||
    eventName ||
    "Team 1";
  const t2 =
    runners?.[1]?.runnerName || runners?.[1]?.selectionName || "Team 2";
  return { team1: t1, team2: t2 };
};

const extractOdds = (
  rawMatch,
  team1Fallback = "Team 1",
  team2Fallback = "Team 2",
) => {
  const market =
    rawMatch?.matchOdds?.find(
      (m) =>
        m?.marketId === rawMatch?.marketId || m?.marketName === "Match Odds",
    ) || rawMatch?.matchOdds?.[0];

  const rawRunners = market?.runners || [];

  // Match runners with names from matchRunners for accurate Draw / Team detection
  const runnerNameMap = new Map();
  (rawMatch?.matchRunners || []).forEach((mr) => {
    if (mr?.selectionId) runnerNameMap.set(mr.selectionId, mr.runnerName);
  });

  const runners = rawRunners.map((r) => ({
    ...r,
    runnerName:
      r?.runnerName ||
      r?.selectionName ||
      runnerNameMap.get(r?.selectionId) ||
      "",
  }));

  const drawIndex = runners.findIndex((r) => {
    const name = (r?.runnerName || "").toLowerCase();
    return name.includes("draw") || name.includes("tie");
  });

  let r1 = null;
  let rDraw = null;
  let r2 = null;

  if (drawIndex !== -1) {
    rDraw = runners[drawIndex];
    const nonDraw = runners.filter((_, idx) => idx !== drawIndex);
    r1 = nonDraw[0] || null;
    r2 = nonDraw[1] || null;
  } else if (runners.length >= 3) {
    r1 = runners[0];
    r2 = runners[1];
    rDraw = runners[2];
  } else {
    r1 = runners[0] || null;
    r2 = runners[1] || null;
    rDraw = null;
  }

  const getPriceAndSize = (runner, type, defaultName, defaultSelectionId) => {
    const rName =
      runner?.runnerName || runner?.selectionName || defaultName || "";
    const selId = runner?.selectionId || defaultSelectionId;
    const isBack = String(type).toLowerCase() === "back";

    if (!runner?.ex) {
      return {
        price: "-",
        size: "",
        disabled: true,
        runnerName: rName,
        selectionId: selId,
        type: isBack ? "Back" : "Lay",
      };
    }

    const list = isBack ? runner.ex.availableToBack : runner.ex.availableToLay;
    const best = list?.[0];
    if (!best || !best.price || best.price === 0 || best.price === "-") {
      return {
        price: "-",
        size: "",
        disabled: true,
        runnerName: rName,
        selectionId: selId,
        type: isBack ? "Back" : "Lay",
      };
    }

    const rawSize = best.size;
    let formattedSize = "";
    if (rawSize !== undefined && rawSize !== null && rawSize !== "") {
      formattedSize =
        typeof rawSize === "number"
          ? rawSize.toLocaleString(undefined, { maximumFractionDigits: 2 })
          : String(rawSize);
    }

    return {
      price: best.price,
      size: formattedSize,
      disabled: false,
      runnerName: rName,
      selectionId: selId,
      type: isBack ? "Back" : "Lay",
    };
  };

  const back1 = getPriceAndSize(r1, "Back", team1Fallback, 101);
  const backDraw = rDraw
    ? getPriceAndSize(rDraw, "Back", "The Draw", 103)
    : {
        price: "-",
        size: "",
        disabled: true,
        runnerName: "The Draw",
        selectionId: 103,
        type: "Back",
      };
  const back2 = getPriceAndSize(r2, "Back", team2Fallback, 102);

  const lay1 = getPriceAndSize(r1, "Lay", team1Fallback, 101);
  const layDraw = rDraw
    ? getPriceAndSize(rDraw, "Lay", "The Draw", 103)
    : {
        price: "-",
        size: "",
        disabled: true,
        runnerName: "The Draw",
        selectionId: 103,
        type: "Lay",
      };
  const lay2 = getPriceAndSize(r2, "Lay", team2Fallback, 102);

  return {
    back: [back1, backDraw, back2],
    lay: [lay1, layDraw, lay2],
  };
};

// ==========================================
// ODDS BUTTON COMPONENT (WITH 0.2s YELLOW FLASH ON UPDATE)
// ==========================================
const OddsButton = ({ price, size, disabled, isLay, onClick }) => {
  const [flashing, setFlashing] = useState(false);
  const prevPriceRef = useRef(price);
  const prevSizeRef = useRef(size);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      prevPriceRef.current = price;
      prevSizeRef.current = size;
      return;
    }

    // Check if price or size updated
    const priceChanged =
      price !== undefined &&
      prevPriceRef.current !== undefined &&
      String(price) !== String(prevPriceRef.current);
    const sizeChanged =
      size !== undefined &&
      prevSizeRef.current !== undefined &&
      String(size) !== String(prevSizeRef.current);

    if (priceChanged || sizeChanged) {
      prevPriceRef.current = price;
      prevSizeRef.current = size;
      setFlashing(true);
      const timer = setTimeout(() => {
        setFlashing(false);
      }, 200); // exactly 0.2s (200ms) yellow flash

      return () => clearTimeout(timer);
    } else {
      prevPriceRef.current = price;
      prevSizeRef.current = size;
    }
  }, [price, size]);

  const defaultBg = isLay
    ? disabled
      ? "bg-[#fed7e2] border border-[#fbb6ce]"
      : "bg-bg_LayBtnBg border border-layBtn"
    : disabled
      ? "bg-[#bfdbfe] border border-[#93c5fd]"
      : "bg-bg_BackBtnBg border border-backBtn";

  // Flash yellow with !important rule from kuber.css for 0.2s then fade back
  const bgClass = flashing ? "odds-flash-yellow shadow-md" : defaultBg;
  const isClickable = !disabled && price && price !== "-";
  const stateClass = !isClickable
    ? "cursor-default opacity-85"
    : "cursor-pointer active:scale-95 opacity-100";

  return (
    <span className="col-span-4">
      <span className="flex items-center justify-center w-full h-full p-[1px] md:p-[2px] overflow-hidden">
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (isClickable && onClick) onClick();
          }}
          className={`overflow-hidden relative ${stateClass} w-full h-full px-1 py-[1px] rounded-sm flex flex-col items-center justify-center transition-colors duration-200 ease-out ${bgClass}`}
        >
          <span
            id="oddBtnPrice"
            className="relative z-10 transition-all ease-in-out duration-200 origin-center flex items-center justify-center w-full text-text_OddValue leading-5 text-sm md:text-[15px] font-semibold "
          >
            {price || "-"}
          </span>
          <span
            id="oddBtnSize"
            className="relative z-10 transition-all ease-in-out duration-200 origin-center flex items-center justify-center w-full text-[10px] text-text_OddValue leading-3 text-center whitespace-normal font-normal "
          >
            <span className="w-max break-all truncate">
              {size ? <div className="odd-button__volume">{size}</div> : null}
            </span>
          </span>
        </div>
      </span>
    </span>
  );
};

// ==========================================
// MATCH ROW COMPONENT
// ==========================================
const MatchRow = ({
  match,
  onOpen,
  activeBet,
  onOddsClick,
  onCloseBet,
  onBetChange,
}) => {
  const isBetOpen =
    activeBet && String(activeBet.eventId) === String(match.eventId);

  return (
    <div className="col-span-12 grid grid-cols-12">
      {/* 1) First Box: Green Dot & LIVE text + Second Box: Team Names (Clickable) */}
      <div
        onClick={() => onOpen(match)}
        className="col-span-6 h-12 lg:col-span-5 grid grid-cols-7 border-t border-borderColorOfMarket cursor-pointer hover:bg-white/[0.03] transition-colors"
      >
        <span
          id="inPlayTime"
          className="flex  items-center justify-center flex-col col-span-2 pl-[1px] pr-[1px] active:scale-[94%] transition-all ease-in-out duration-100"
        >
          <div className="flex w-full text-text_InPlayEventsScoreAndTime gap-x-1 items-center justify-center px-0.5">
            <LiveDotIcon />
            <div id="inPlay" className="font-semibold text-[#29ab2b] text-x">
              LIVE
            </div>
          </div>
        </span>

        {/* 2) Second Box: Event Name (Team 1, Team 2) & TV Svg */}
        <span
          id="inPlayTeamName"
          className=" text-selection-none flex items-center justify-start col-span-5 px-1 relative border-l border-r border-borderColorOfMarket active:scale-[94%] transition-all ease-in-out duration-100"
        >
          <span className="flex flex-col items-center justify-start w-[87%] cursor-pointer ">
            <span className=" text-selection-none w-full flex items-center justify-start">
              <span className=" w-[5px] h-[5px] p-[1px] mr-[2px]"></span>
              <span className=" text-[11px] font-bold text-text_Ternary-new truncate sm:text-xs md:text-sm">
                {match.team1}
              </span>
            </span>
            <span className=" text-selection-none w-full flex items-center justify-start">
              <span className=" w-[5px] h-[5px] p-[1px] mr-[2px]"></span>
              <span className=" text-[11px] font-bold text-text_Ternary-new truncate sm:text-xs md:text-sm">
                {match.team2}
              </span>
            </span>
          </span>
          {/* 3) TV Svg: Active green if true, offline gray if false */}
          <span className="cursor-pointer absolute top-0.5 right-0.5">
            <TvIcon active={match.tv} />
          </span>
        </span>
      </div>

      {/* Right: Exchange Back & Lay Odds */}
      <span className=" col-span-6 h-12 lg:col-span-7 w-full overflow-auto border-t border-borderColorOfMarket ">
        <div
          className="w-full overflow-x-auto flex h-full sm:px-[2px]"
          id="hideScrollBar"
        >
          {/* 4) Blue Box: 3 Back Odds (1, X, 2) */}
          <span className="grid grid-cols-12 grid-flow-col overflow-auto h-full min-w-[100%]">
            {match.back.map((item, idx) => (
              <OddsButton
                key={`back-${idx}`}
                price={item.price}
                size={item.size}
                disabled={item.disabled}
                isLay={false}
                onClick={() =>
                  onOddsClick && onOddsClick(match, item, "Back", idx)
                }
              />
            ))}
          </span>

          {/* 5) Other 3 Boxes: 3 Lay Odds (1, X, 2) in Pink */}
          <span className="grid grid-cols-12 grid-flow-col overflow-auto h-full min-w-[100%]">
            {match.lay.map((item, idx) => (
              <OddsButton
                key={`lay-${idx}`}
                price={item.price}
                size={item.size}
                disabled={item.disabled}
                isLay={true}
                onClick={() =>
                  onOddsClick && onOddsClick(match, item, "Lay", idx)
                }
              />
            ))}
          </span>
        </div>
      </span>

      {/* Inline BetSlip when open */}
      {isBetOpen && (
        <div className="col-span-12 w-full p-2 border-t border-b border-borderColorOfMarket bg-bg_Quaternary-new">
          <BetSlip
            activeBet={activeBet}
            onClose={onCloseBet}
            onBetChange={onBetChange}
            min={100}
            max={100000}
            sportId={String(match.sportId || "4")}
            competitionId={
              match.raw?.competitionId || match.competitionId || "comp-1"
            }
            eventId={String(match.eventId)}
            eventName={match.eventName || `${match.team1} v ${match.team2}`}
            currentSport={match.sportName || "Cricket"}
          />
        </div>
      )}
    </div>
  );
};

// ==========================================
// SPORT BLOCK COMPONENT
// ==========================================
const SportBlock = ({
  sportData,
  onOpen,
  activeBet,
  onOddsClick,
  onCloseBet,
  onBetChange,
}) => {
  if (!sportData?.matches || sportData.matches.length === 0) return null;

  const renderSportIcon = () => {
    switch (sportData.sport) {
      case "Cricket":
        return <CricketIcon />;
      case "Football":
        return <FootballIcon />;
      case "Tennis":
        return <TennisIcon />;
      default:
        return <CricketIcon />;
    }
  };

  return (
    <div className="bg-bg_Quaternary-new rounded-b border border-ternary4 border-t-0 border-b-0 shadow-lg">
      <div className="eventHeadName grid grid-cols-12">
        {/* Sport Header */}
        <div className="text-text_Ternary-new  px-2 h-full py-2.5 col-span-6 lg:col-span-5 pl-2 flex items-center justify-start w-full gap-x-2 border-t-[color:var(--border-borderColorOfMarket)] border-t border-solid">
          <span>{renderSportIcon()}</span>
          <div className="text-text_Ternary-new  md:text-[18px] text-base font-semibold leading-3 tracking-wide text-center">
            {sportData.sport}
          </div>
        </div>

        {/* 1 X 2 Market Header */}
        <div className=" col-span-6 py-2.5 lg:col-span-7 grid grid-cols-12 h-full border-t-[color:var(--border-borderColorOfMarket)] border-t border-solid">
          <span className="text-text_Ternary-new  text-xs font-semibold col-span-4 text-center flex items-center justify-center tracking-0.3">
            1
          </span>
          <span className="text-text_Ternary-new  text-xs font-semibold col-span-4 text-center flex items-center justify-center tracking-0.3">
            X
          </span>
          <span className="text-text_Ternary-new  text-xs font-semibold col-span-4 text-center flex items-center justify-center tracking-0.3">
            2
          </span>
        </div>

        {/* Match Rows */}
        {sportData.matches.map((match, idx) => (
          <MatchRow
            key={match.eventId || idx}
            match={match}
            onOpen={onOpen}
            activeBet={activeBet}
            onOddsClick={onOddsClick}
            onCloseBet={onCloseBet}
            onBetChange={onBetChange}
          />
        ))}
      </div>
    </div>
  );
};

// ==========================================
// MAIN IN-PLAY SPORTS WIDGET COMPONENT
// ==========================================
export default function InPlaySportsWidget() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Read real-time matches from Redux store
  const { matches: cricketState } = useSelector(
    (state) => state.matches.cricket,
  );
  const { matches: soccerState } = useSelector((state) => state.matches.soccer);
  const { matches: tennisState } = useSelector((state) => state.matches.tennis);

  // Direct zero-latency socket state for instant UI re-renders on socket events
  const [liveSocketMatches, setLiveSocketMatches] = useState({
    cricket: null,
    soccer: null,
    tennis: null,
  });

  useEffect(() => {
    // 1) Direct socket event listener for zero-delay updates
    const handleMatchUpdate = (data) => {
      if (!data?.matches || !data?.sport) return;
      const sportKey = data.sport.toLowerCase();
      if (
        sportKey === "cricket" ||
        sportKey === "soccer" ||
        sportKey === "tennis"
      ) {
        setLiveSocketMatches((prev) => ({
          ...prev,
          [sportKey]: data.matches,
        }));
      }
    };

    socket.on("matchUpdate", handleMatchUpdate);

    // 2) Function to request freshest live exchange odds from socket
    const streamLiveOdds = () => {
      socket.emit("subscribeToMatches", { eventId: 4, eventType: 4 });
      socket.emit("subscribeToMatches", { eventId: 1, eventType: 1 });
      socket.emit("subscribeToMatches", { eventId: 2, eventType: 2 });
    };

    // Immediate initial subscription
    streamLiveOdds();

    // Fast 1.5s interval to ensure exchange odds stay real-time instant
    const streamInterval = setInterval(streamLiveOdds, 1500);

    const handleConnect = () => {
      streamLiveOdds();
    };
    socket.on("connect", handleConnect);

    return () => {
      clearInterval(streamInterval);
      socket.off("matchUpdate", handleMatchUpdate);
      socket.off("connect", handleConnect);
    };
  }, []);

  const sportsData = useMemo(() => {
    const getMatchList = (liveList, sportObj) => {
      if (Array.isArray(liveList) && liveList.length > 0) return liveList;
      if (!sportObj) return [];
      if (Array.isArray(sportObj.matches?.data)) return sportObj.matches.data;
      if (Array.isArray(sportObj.matches)) return sportObj.matches;
      if (Array.isArray(sportObj.data)) return sportObj.data;
      if (Array.isArray(sportObj)) return sportObj;
      return [];
    };

    const rawCricket = getMatchList(liveSocketMatches.cricket, cricketState);
    const rawSoccer = getMatchList(liveSocketMatches.soccer, soccerState);
    const rawTennis = getMatchList(liveSocketMatches.tennis, tennisState);

    const mapMatches = (list, sportName, fallbackSportIndex) => {
      // 1) Filter ONLY in-play matches: "agar in play hai to"
      const inPlayList = (list || []).filter((m) =>
        Boolean(
          m?.inplay ||
          m?.inPlay ||
          m?.matchOdds?.some((o) => o?.inplay || o?.inPlay),
        ),
      );

      if (inPlayList.length > 0) {
        return inPlayList.map((rawMatch, mIdx) => {
          const runners =
            rawMatch?.matchOdds?.find(
              (m) =>
                m?.marketId === rawMatch?.marketId ||
                m?.marketName === "Match Odds",
            )?.runners ||
            rawMatch?.matchOdds?.[0]?.runners ||
            [];

          const { team1, team2 } = parseTeams(
            rawMatch?.eventName,
            runners,
            rawMatch?.matchRunners,
          );
          const { back, lay } = extractOdds(rawMatch);

          const sportIdVal =
            fallbackSportIndex === 0
              ? "4"
              : fallbackSportIndex === 1
                ? "1"
                : "2";

          return {
            eventId:
              rawMatch?.eventId ||
              `3605086${fallbackSportIndex * 10 + mIdx + 1}`,
            team1,
            team2,
            inplay: true,
            tv: Boolean(rawMatch?.tv),
            back,
            lay,
            raw: rawMatch,
            sportId: sportIdVal,
            sportName,
            bm: rawMatch?.bm ?? sportIdVal === "4",
            fancy: rawMatch?.fancy ?? sportIdVal === "4",
            eventName: rawMatch?.eventName || `${team1} v ${team2}`,
          };
        });
      }

      // If server has 0 in-play for this sport right now, map fallback with valid eventId and raw data
      const fallbackList =
        IN_PLAY_SPORTS_DATA[fallbackSportIndex]?.matches || [];
      const sportIdVal =
        fallbackSportIndex === 0 ? "4" : fallbackSportIndex === 1 ? "1" : "2";

      return fallbackList.map((fbMatch, mIdx) => {
        const evId = `3605086${fallbackSportIndex * 10 + mIdx + 1}`;
        const evName = `${fbMatch.team1} v ${fbMatch.team2}`;
        const isCricket = sportIdVal === "4";

        const runnersList = [
          { runnerName: fbMatch.team1, selectionId: 101 },
          { runnerName: fbMatch.team2, selectionId: 102 },
          ...(sportIdVal === "1"
            ? [{ runnerName: "The Draw", selectionId: 103 }]
            : []),
        ];

        return {
          ...fbMatch,
          eventId: evId,
          sportId: sportIdVal,
          sportName,
          inplay: true,
          tv: true,
          bm: isCricket,
          fancy: isCricket,
          eventName: evName,
          raw: {
            eventId: evId,
            sportId: sportIdVal,
            eventName: evName,
            inplay: true,
            tv: true,
            bm: isCricket,
            fancy: isCricket,
            matchRunners: runnersList,
            matchOdds: [
              {
                marketName: "Match Odds",
                marketId: `m-${evId}`,
                runners: runnersList.map((r, rIdx) => ({
                  ...r,
                  ex: {
                    availableToBack:
                      fbMatch.back?.[rIdx]?.price !== "-"
                        ? [
                            {
                              price: fbMatch.back?.[rIdx]?.price,
                              size: fbMatch.back?.[rIdx]?.size,
                            },
                          ]
                        : [],
                    availableToLay:
                      fbMatch.lay?.[rIdx]?.price !== "-"
                        ? [
                            {
                              price: fbMatch.lay?.[rIdx]?.price,
                              size: fbMatch.lay?.[rIdx]?.size,
                            },
                          ]
                        : [],
                  },
                })),
              },
            ],
          },
        };
      });
    };

    return [
      {
        sport: "Cricket",
        matches: mapMatches(rawCricket, "cricket", 0),
      },
      {
        sport: "Football",
        matches: mapMatches(rawSoccer, "soccer", 1),
      },
      {
        sport: "Tennis",
        matches: mapMatches(rawTennis, "tennis", 2),
      },
    ];
  }, [liveSocketMatches, cricketState, soccerState, tennisState]);

  // Console log in-play matches and expose testing utility in DevTools
  useEffect(() => {
    console.group(
      "%c🔥 [IN-PLAY MATCHES RENDERED] 🔥",
      "color: #40af52; font-size: 14px; font-weight: bold;",
    );
    console.log("Sports Data:", sportsData);
    console.groupEnd();

    if (typeof window !== "undefined") {
      window.inPlaySportsData = sportsData;
      // Expose testOddsFlash utility in browser console so developer can test 0.2s yellow flash anytime
      window.testOddsFlash = (
        sport = "Cricket",
        teamIndex = 0,
        newPrice = "2.14",
        newSize = "1,500",
      ) => {
        const sportKey = sport.toLowerCase();
        setLiveSocketMatches((prev) => {
          const current = prev[sportKey] || [];
          if (current.length > 0) {
            const cloned = JSON.parse(JSON.stringify(current));
            const targetRunner =
              cloned[teamIndex]?.matchOdds?.[0]?.runners?.[0];
            if (targetRunner?.ex?.availableToBack?.[0]) {
              targetRunner.ex.availableToBack[0].price = newPrice;
              targetRunner.ex.availableToBack[0].size = newSize;
            }
            return { ...prev, [sportKey]: cloned };
          }
          return prev;
        });
        console.log(
          `⚡ [testOddsFlash] Flashed odds on ${sport} match #${teamIndex} with price ${newPrice}`,
        );
      };
    }
  }, [sportsData]);

  const handleOpen = (match) => {
    if (!match) return;

    const raw = match.raw || match;
    const eventId = raw.eventId || match.eventId || "36050867";
    const sportId =
      raw.sportId ||
      match.sportId ||
      (match.sportName === "Football" || match.sportName === "soccer"
        ? "1"
        : match.sportName === "Tennis" || match.sportName === "tennis"
          ? "2"
          : "4");
    const eventName =
      raw.eventName ||
      match.eventName ||
      `${match.team1 || "Team 1"} v ${match.team2 || "Team 2"}`;
    const marketId = raw.marketId || match.marketId || `m-${eventId}`;
    const competitionId = raw.competitionId || match.competitionId || "comp-1";
    const bm =
      raw.bm !== undefined
        ? raw.bm
        : match.bm !== undefined
          ? match.bm
          : sportId === "4";
    const fancy =
      raw.fancy !== undefined
        ? raw.fancy
        : match.fancy !== undefined
          ? match.fancy
          : sportId === "4";

    const runners = raw.matchRunners || [
      { runnerName: match.team1 || "Team 1", selectionId: 101 },
      { runnerName: match.team2 || "Team 2", selectionId: 102 },
      ...(sportId === "1"
        ? [{ runnerName: "The Draw", selectionId: 103 }]
        : []),
    ];

    dispatch(setRunningData(runners));
    dispatch(
      setMarketName(raw.markets || [{ marketName: "Match Odds", marketId }]),
    );

    if (raw.matchOdds) {
      dispatch(
        setMarketOddsData({
          data: { data: raw.matchOdds },
          sport: match.sportName || "cricket",
        }),
      );
    }

    navigate(
      `/full-market?eventType=${sportId}&eventId=${eventId}&marketId=${marketId}&joinedMarketIds=${marketId}&competitionId=${competitionId}&bm=${bm}&fancy=${fancy}&pc=false&eventName=${encodeURIComponent(
        eventName,
      )}&openDate=${raw.openDate || ""}&tv=${raw.tv || match.tv || "true"}`,
    );
  };

  const [activeBet, setActiveBet] = useState(null);

  const handleOddsClick = (match, oddsItem, betType, idx = 0) => {
    if (!oddsItem || !oddsItem.price || oddsItem.price === "-") return;

    const runnerName =
      oddsItem.runnerName ||
      (idx === 0 ? match.team1 : idx === 1 ? "The Draw" : match.team2);
    const selectionId =
      oddsItem.selectionId || (idx === 0 ? 101 : idx === 1 ? 103 : 102);
    const resolvedBetKey = `${match.eventId}_${selectionId}_${betType}`;

    // If clicking the same runner and type, toggle off
    if (
      activeBet &&
      activeBet.betKey === resolvedBetKey &&
      activeBet.betType === betType
    ) {
      setActiveBet(null);
      dispatch(handleCancelPlaceBet());
      return;
    }

    const betInfo = {
      betKey: resolvedBetKey,
      runnerName: runnerName,
      selectionId: selectionId,
      betType: betType,
      odds: String(oddsItem.price),
      marketType: "Match Odds",
      size: oddsItem.size || "",
      min: 100,
      max: 100000,
      marketId: match.marketId || `m-${match.eventId}`,
      sportId: String(match.sportId || "4"),
      competitionId:
        match.raw?.competitionId || match.competitionId || "comp-1",
      eventId: String(match.eventId),
      eventName: match.eventName || `${match.team1} v ${match.team2}`,
      currentSport: match.sportName || "Cricket",
      betBoxBgColor: betType === "Back" ? "#72bbef" : "#faa9ba",
    };

    setActiveBet(betInfo);

    dispatch(
      handleOpenPlaceBet({
        sportName: match.sportName || "Cricket",
        sportId: String(match.sportId || "4"),
        competitionId:
          match.raw?.competitionId || match.competitionId || "comp-1",
        eventId: String(match.eventId),
        market: "Match Odds",
        markettype: "Match Odds",
        marketId: match.marketId || `m-${match.eventId}`,
        selectionId: selectionId,
        teamName: runnerName,
        odds: oddsItem.price,
        betType: betType,
        betBoxBgColor: betType === "Back" ? "#72bbef" : "#faa9ba",
      }),
    );
  };

  const handleCloseBet = () => {
    setActiveBet(null);
    dispatch(handleCancelPlaceBet());
  };

  const handleBetChange = (changes) => {
    setActiveBet((prev) => (prev ? { ...prev, ...changes } : null));
  };

  return (
    <div className="py-1 px-[6px] w-full">
      <div className=" w-full font-helvetica-neue">
        {/* Main In-Play Header */}
        <div
          className=" w-full flex items-center justify-between rounded-t-[3px] py-1.5 px-[7px]  bg-inPlayBlockBg"
          style={{
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
            background:
              "var(--color-bg-inPlayBlockBg, linear-gradient(89deg, #40af52, #2e924b 89.28%))",
          }}
        >
          <div className=" flex items-center text-text_Quaternary-new  font-semibold text-[18px] tracking-wide justify-start w-full gap-[5px] ">
            <InPlayHeaderIcon />
            <span>In Play</span>
          </div>
          <div
            className=" w-max text-nowrap"
            onClick={() => navigate("/sports")}
          >
            <span className=" text-xs tracking-wide text-text_Quaternary-new  text-nowrap whitespace-nowrap font-normal cursor-pointer">
              Open Bets
            </span>
            <sup className="font-features sups">
              <span
                className="text-x font-normal tracking-wide text-text_color_primary2 bg-bg_brand_primary min-w-4 min-h-4  text-center px-1 py-0.5 font-lato rounded-full"
                style={{ backgroundImage: "var(--toltips-bg-color)" }}
              >
                0
              </span>
            </sup>
          </div>
        </div>

        {/* Sports Sections */}
        {sportsData.map((sportItem) => (
          <SportBlock
            key={sportItem.sport}
            sportData={sportItem}
            onOpen={handleOpen}
            activeBet={activeBet}
            onOddsClick={handleOddsClick}
            onCloseBet={handleCloseBet}
            onBetChange={handleBetChange}
          />
        ))}
      </div>
    </div>
  );
}

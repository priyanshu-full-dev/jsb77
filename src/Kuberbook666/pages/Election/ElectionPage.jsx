export default function ElectionPage() {
  return (
    <div
      className="w-full md:mt-[0px] lg:overflow-auto lg:w-[54%] mx-auto"
      style={{ minHeight: "calc(100dvh - 110px)", display: "flex", alignItems: "center" }}
    >
      <div className="w-full h-full">
        <div className="w-full mb-2">
          <div className="w-full font-helvetica-neue">
            <div className="flex flex-col items-center justify-start gap-y-1 px-2">
              <h6 className="text-start w-full text-sm font-semibold text-text_Primary"></h6>
              <div className="flex w-full">
                <div className="flex flex-col w-full items-center">
                  <div className="w-full flex flex-row font-lato items-center">
                    <div className="flex flex-row items-center justify-evenly w-full">
                      <span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          xmlnsXlink="http://www.w3.org/1999/xlink"
                          width="100"
                          height="100"
                          x="0"
                          y="0"
                          viewBox="0 0 512 512"
                          xmlSpace="preserve"
                        >
                          <g>
                            <path
                              fill="#e49542"
                              d="M491.627 307.967H20.373V509.39a2.61 2.61 0 0 0 2.61 2.61h466.035a2.61 2.61 0 0 0 2.61-2.61V307.967z"
                              opacity="1"
                            ></path>
                            <path
                              fill="#e28424"
                              d="M491.627 307.967H20.373v30.572c0 .476.386.862.863.862h469.53a.862.862 0 0 0 .862-.862v-30.572z"
                              opacity="1"
                            ></path>
                            <path
                              fill="#e49542"
                              d="M.71 233.947a2.611 2.611 0 0 0-.058.544v81.141a2.61 2.61 0 0 0 2.61 2.61h505.475a2.61 2.61 0 0 0 2.61-2.61v-81.141c0-.183-.02-.366-.058-.544L256 196.178z"
                              opacity="1"
                            ></path>
                            <path
                              fill="#e7a561"
                              d="M511.13 233.448 440.06 70.407a2.61 2.61 0 0 0-2.393-1.567H74.333a2.61 2.61 0 0 0-2.393 1.567L.87 233.448c-.07.161-.123.328-.16.499h510.58a2.661 2.661 0 0 0-.16-.499z"
                              opacity="1"
                            ></path>
                            <path
                              fill="#e28424"
                              d="M139.459 133.606a5.134 5.134 0 0 0-4.707 3.083l-11.031 25.306c-1.478 3.392 1.007 7.187 4.707 7.187h40.265l21.352-35.575h-50.586zM388.279 161.994l-11.031-25.306a5.135 5.135 0 0 0-4.707-3.083h-51.602l22.368 35.575h40.265c3.7.001 6.186-3.794 4.707-7.186z"
                              opacity="1"
                            ></path>
                            <path
                              fill="#f1f1f4"
                              d="M343.308 169.181H168.692V4.035A4.035 4.035 0 0 1 172.727 0h166.546a4.035 4.035 0 0 1 4.035 4.035z"
                              opacity="1"
                            ></path>
                            <path
                              fill="#dfdde2"
                              d="M168.692 148.63h174.615v20.551H168.692z"
                              opacity="1"
                            ></path>
                            <path
                              fill="#b3e59f"
                              d="m285.595 52.607-41.102 41.102a1.245 1.245 0 0 1-1.762 0l-16.326-16.326a3.49 3.49 0 0 0-4.935 0l-15.91 15.91a3.49 3.49 0 0 0 0 4.935l35.585 35.585a3.49 3.49 0 0 0 4.935 0l60.361-60.361a3.49 3.49 0 0 0 0-4.935l-15.91-15.91a3.49 3.49 0 0 0-4.936 0z"
                              opacity="1"
                            ></path>
                          </g>
                        </svg>
                      </span>
                    </div>
                  </div>
                  <span className="text-text_Ternary text-gray-700 dark:text-gray-300 font-semibold text-[14px] py-[4px] px-[2px]">
                    No Events Found for Election
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

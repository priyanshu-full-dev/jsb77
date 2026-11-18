const MinusIcon = ({ size = 19, className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 19 19"
      fill="none"
      className={className}
    >
      <path
        fill="currentColor"
        d="M8.056,10.838H0.409V8.091h7.647 M2,8.091h16.591v2.747H8"
      />
    </svg>
  );
};

export default MinusIcon;
const PlusIcon = ({ size = 19, className = "" }) => {
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
        d="M10.946,0.127v7.964h7.646v2.747h-7.646v8.035h-2.89v-8.035H0.409V8.091h7.647V0.127H10.946z"
      />
    </svg>
  );
};

export default PlusIcon;
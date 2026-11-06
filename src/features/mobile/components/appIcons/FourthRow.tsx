const FourthRow = () => {
  return (
    <div className="flex items-center justify-start gap-15">
      {/* Podcasts */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-b from-fuchsia-500 to-purple-700 flex items-center justify-center">
          <svg width="44" height="44" viewBox="0 0 100 100" aria-hidden="true">
            <g fill="none" stroke="white" strokeWidth="6" strokeLinecap="round">
              <path d="M36.2 51.6 A18 18 0 1 1 63.8 51.6" />
              <path d="M28.6 58 A28 28 0 1 1 71.4 58" />
            </g>
            <circle cx="50" cy="40" r="9" fill="white" />
            <path
              d="M50 54 C43 54 41 60 42 67 L44 82 C44.5 87 55.5 87 56 82 L58 67 C59 60 57 54 50 54 Z"
              fill="white"
            />
          </svg>
        </div>
        <span className="text-white text-[11px] leading-none">Podcasts</span>
      </div>

      {/* Maps */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-2xl overflow-hidden">
          <svg width="56" height="56" viewBox="0 0 100 100" aria-hidden="true">
            <rect width="100" height="100" fill="#F4F2EC" />
            <path d="M0 58 L38 48 L30 100 L0 100 Z" fill="#A8DB8F" />
            <path d="M70 0 L100 0 L100 40 L80 30 Z" fill="#9CCBF2" />
            <line
              x1="58"
              y1="-5"
              x2="34"
              y2="105"
              stroke="#F7D774"
              strokeWidth="16"
            />
            <line
              x1="100"
              y1="62"
              x2="38"
              y2="70"
              stroke="white"
              strokeWidth="9"
            />
            <circle
              cx="32"
              cy="42"
              r="19"
              fill="#2F7DF6"
              stroke="white"
              strokeWidth="4"
            />
            <polygon points="32,29 43,55 32,48 21,55" fill="white" />
            <rect x="54" y="50" width="40" height="38" rx="13" fill="white" />
            <rect x="58" y="54" width="32" height="30" rx="10" fill="#3E6FB5" />
            <rect x="58" y="59" width="32" height="6" fill="#E5484D" />
            <text
              x="74"
              y="79"
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="white"
              fontFamily="sans-serif"
            >
              280
            </text>
          </svg>
        </div>
        <span className="text-white text-[11px] leading-none">Maps</span>
      </div>

      {/* Empty slots so this row is as wide as the other rows */}
      <div className="w-14 h-14 invisible" aria-hidden="true" />
      <div className="w-14 h-14 invisible" aria-hidden="true" />
    </div>
  );
};

export default FourthRow;

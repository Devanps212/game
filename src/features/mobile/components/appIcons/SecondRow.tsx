const SecondRow = () => {
  return (
    <div className="flex items-center gap-15">
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
          <svg width="44" height="44" viewBox="0 0 100 100" aria-hidden="true">
            {[
              { y: 22, color: "#FF9500" },
              { y: 50, color: "#007AFF" },
              { y: 78, color: "#FF3B30" },
            ].map(({ y, color }) => (
              <g key={y}>
                <circle cx="16" cy={y} r="8" fill={color} />
                <line
                  x1="34"
                  y1={y}
                  x2="92"
                  y2={y}
                  stroke="#D1D1D6"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </svg>
        </div>
        <span className="text-white text-[11px] leading-none">Reminders</span>
      </div>

      {/* Notes */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-2xl bg-white flex flex-col overflow-hidden">
          <div className="h-5 bg-yellow-400" />
          <div className="flex-1 flex flex-col justify-center gap-2 px-2.5">
            <div className="h-px bg-gray-300" />
            <div className="h-px bg-gray-300" />
            <div className="h-px bg-gray-300" />
          </div>
        </div>
        <span className="text-white text-[11px] leading-none">Notes</span>
      </div>

      {/* Camera */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-b from-gray-200 to-gray-400 flex items-center justify-center">
          <svg width="44" height="44" viewBox="0 0 100 100" aria-hidden="true">
            <rect x="34" y="18" width="32" height="16" rx="6" fill="#1C1C1E" />
            <rect x="8" y="26" width="84" height="58" rx="14" fill="#1C1C1E" />
            <circle cx="50" cy="55" r="22" fill="#3A3A3C" />
            <circle cx="50" cy="55" r="14" fill="#0A0A0A" />
            <circle cx="45" cy="50" r="3.5" fill="white" opacity="0.5" />
            <circle cx="80" cy="38" r="3" fill="#FFCC00" />
          </svg>
        </div>
        <span className="text-white text-[11px] leading-none">Camera</span>
      </div>

      {/* Contacts */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-b from-gray-200 to-gray-400 overflow-hidden flex items-center justify-center">
          <svg width="56" height="56" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="44" cy="36" r="15" fill="#6B7280" />
            <path
              d="M14 88 C14 64 28 56 44 56 C60 56 74 64 74 88 Z"
              fill="#6B7280"
            />
            <rect x="86" y="18" width="14" height="10" rx="3" fill="#FF9500" />
            <rect x="86" y="34" width="14" height="10" rx="3" fill="#FFCC00" />
            <rect x="86" y="50" width="14" height="10" rx="3" fill="#34C759" />
            <rect x="86" y="66" width="14" height="10" rx="3" fill="#007AFF" />
          </svg>
        </div>
        <span className="text-white text-[11px] leading-none">Contacts</span>
      </div>
    </div>
  );
};

export default SecondRow;

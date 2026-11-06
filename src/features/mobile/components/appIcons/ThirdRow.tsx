import { BookOpen } from "lucide-react";

const ThirdRow = () => {
  return (
    <div className="flex items-center gap-15">
      {/* App Store */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-b from-sky-400 to-blue-600 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 100 100" aria-hidden="true">
            <line
              x1="50"
              y1="20"
              x2="26"
              y2="76"
              stroke="white"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <line
              x1="50"
              y1="20"
              x2="74"
              y2="76"
              stroke="white"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <line
              x1="24"
              y1="60"
              x2="76"
              y2="60"
              stroke="white"
              strokeWidth="9"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="text-white text-[11px] leading-none">App Store</span>
      </div>

      {/* Books */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-b from-orange-400 to-orange-600 flex items-center justify-center">
          <BookOpen
            className="w-9 h-9 text-white"
            fill="white"
            strokeWidth={1.5}
          />
        </div>
        <span className="text-white text-[11px] leading-none">Books</span>
      </div>

      {/* Apple TV */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center">
          <span className="text-white text-2xl font-semibold leading-none tracking-tight">
            tv
          </span>
        </div>
        <span className="text-white text-[11px] leading-none">Apple TV</span>
      </div>

      {/* Settings */}
      {/* Settings */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-b from-gray-200 to-gray-400 flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 100 100" aria-hidden="true">
            {/* Fine teeth */}
            <g fill="#4B4F56">
              {Array.from({ length: 24 }).map((_, i) => (
                <rect
                  key={i}
                  x="46.5"
                  y="3"
                  width="7"
                  height="12"
                  rx="1.5"
                  transform={`rotate(${i * 15} 50 50)`}
                />
              ))}
            </g>

            {/* Gear body */}
            <circle cx="50" cy="50" r="40" fill="#4B4F56" />
            <circle cx="50" cy="50" r="35" fill="#A3A7AE" />
            <circle cx="50" cy="50" r="31" fill="#3A3D43" />

            {/* Three spokes */}
            <g stroke="#B8BCC3" strokeWidth="6" strokeLinecap="round">
              <line x1="50" y1="50" x2="50" y2="24" />
              <line x1="50" y1="50" x2="27.5" y2="63" />
              <line x1="50" y1="50" x2="72.5" y2="63" />
            </g>

            {/* Hub */}
            <circle cx="50" cy="50" r="9" fill="#B8BCC3" />
            <circle cx="50" cy="50" r="4" fill="#3A3D43" />
          </svg>
        </div>
        <span className="text-white text-[11px] leading-none">Settings</span>
      </div>
    </div>
  );
};

export default ThirdRow;

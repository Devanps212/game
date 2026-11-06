import { Video } from "lucide-react";

const FirstRow = () => {
  return (
    <div className="flex items-center gap-15">
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center">
          <Video
            className="w-10 h-10 text-white"
            fill="white"
            strokeWidth={1.5}
          />
        </div>
        <span className="text-white text-[11px] leading-none">FaceTime</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-2xl bg-white flex flex-col items-center justify-center p-2">
          <h3 className="m-0 text-red-500 text-sm leading-none">MON</h3>
          <h1 className="m-0 text-3xl font-light leading-none">22</h1>
        </div>
        <span className="text-white text-[11px] leading-none">Calendar</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center">
          <svg width="44" height="44" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="47" fill="white" />

            {/* Tick marks */}
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="8"
                x2="50"
                y2={i % 3 === 0 ? "17" : "13"}
                stroke="black"
                strokeWidth={i % 3 === 0 ? 3.5 : 2}
                strokeLinecap="round"
                transform={`rotate(${i * 30} 50 50)`}
              />
            ))}

            {/* Hour hand (pointing near 10) */}
            <line
              x1="50"
              y1="50"
              x2="34"
              y2="30"
              stroke="black"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Minute hand (pointing at 2) */}
            <line
              x1="50"
              y1="50"
              x2="76"
              y2="32"
              stroke="black"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Second hand */}
            <line
              x1="50"
              y1="58"
              x2="50"
              y2="14"
              stroke="#FF9500"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="50" cy="50" r="3" fill="#FF9500" />
          </svg>
        </div>
        <span className="text-white text-[11px] leading-none">Clock</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
          <svg width="44" height="44" viewBox="0 0 100 100" aria-hidden="true">
            {[
              "#FFCC00", // yellow
              "#FF9500", // orange
              "#FF3B30", // red
              "#FF2D92", // pink
              "#AF52DE", // purple
              "#5856D6", // indigo
              "#32ADE6", // blue
              "#34C759", // green
            ].map((color, i) => (
              <ellipse
                key={color}
                cx="50"
                cy="29"
                rx="14"
                ry="21"
                fill={color}
                opacity="0.9"
                transform={`rotate(${i * 45} 50 50)`}
                style={{ mixBlendMode: "multiply" }}
              />
            ))}
          </svg>
        </div>
        <span className="text-white text-[11px] leading-none">Photos</span>
      </div>
    </div>
  );
};

export default FirstRow;

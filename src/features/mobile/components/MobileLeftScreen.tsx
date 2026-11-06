const MobileLeftScreen = () => {
  return (
    <div className="flex flex-col items-start justify-start gap-4 w-58 overflow-hidden font-sans">
      <div className="space-y-2">
        <h1 className="text-white text-6xl">9:51</h1>
        <span className="text-white text-base">MONDAY, JUNE 12</span>
      </div>

      <div className="flex items-center justify-center gap-2">
        {/* Calendar */}
        <div className="w-28 h-28 rounded-3xl bg-white p-3 overflow-hidden">
          <h1 className="text-red-500 text-xs font-semibold">MONDAY</h1>
          <span className="text-3xl leading-none text-black">12</span>
          <div className="mt-1 flex items-start justify-start gap-1.5">
            <div className="w-1 h-7 shrink-0 rounded-full bg-blue-500" />
            <div className="min-w-0 leading-tight">
              <h2 className="text-xs font-medium truncate text-black">
                Kickoff meeting
              </h2>
              <p className="text-[10px] text-gray-500">10:30 AM</p>
            </div>
          </div>
        </div>

        {/* Weather */}
        <div className="w-28 h-28 rounded-3xl bg-linear-to-b from-blue-400 to-blue-300 p-3 overflow-hidden text-white flex flex-col justify-between">
          <p className="text-xs font-medium truncate">San Francisco</p>
          <div>
            <p className="text-4xl font-extralight leading-none">61°</p>
            <div className="flex items-center gap-1 mt-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FACC15"
                strokeWidth="2"
                strokeLinecap="round"
                className="shrink-0"
              >
                <circle cx="12" cy="12" r="4" fill="#FACC15" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
              </svg>
              <p className="text-xs truncate">Mostly Sunny</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Stories */}
      <div className="w-full rounded-3xl bg-white h-28 p-3 overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-red-500">Top Stories</span>
          <div className="w-4 h-4 rounded bg-rose-500"></div>
        </div>

        <div className="flex items-center gap-2 text-black">
          <p className="flex-1 min-w-0 text-xs font-bold truncate">
            Climate concerns as Siberia experiences record heat
          </p>
          <div className="w-6 h-6 shrink-0 rounded bg-linear-to-br from-orange-300 to-stone-500"></div>
        </div>

        <div className="flex items-center gap-2 text-black">
          <p className="flex-1 min-w-0 text-xs font-bold truncate">
            Traditional Sports Look to Gamers to Reshape Viewers' Experience
          </p>
          <div className="w-6 h-6 shrink-0 rounded bg-linear-to-br from-slate-400 to-indigo-900"></div>
        </div>
      </div>

      {/* Music */}
      <div className="w-full rounded-3xl bg-white h-28 p-3 overflow-hidden flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-16 h-16 shrink-0 rounded-xl bg-linear-to-br from-zinc-900 to-zinc-600"></div>
          <div className="min-w-0 leading-tight text-black">
            <p className="text-sm font-semibold truncate">Chromatica</p>
            <p className="text-xs text-pink-500 truncate">Lady Gaga</p>
          </div>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="#F43F5E"
          className="shrink-0"
        >
          <path
            d="M9 18V6l11-2v12"
            stroke="#F43F5E"
            strokeWidth="2"
            fill="none"
            strokeLinejoin="round"
          />
          <circle cx="6.5" cy="18" r="3" />
          <circle cx="17.5" cy="16" r="3" />
        </svg>
      </div>
    </div>
  );
};

export default MobileLeftScreen;

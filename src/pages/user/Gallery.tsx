import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Heart,
  Images,
  Layers,
  ListFilter,
  PanelLeft,
  Search,
} from "lucide-react";
import type { ReactNode } from "react";

const PHOTOS: string[] = [];

const TILE_GRADIENTS = [
  "from-orange-300 to-sky-400",
  "from-sky-300 to-amber-200",
  "from-rose-300 to-sky-500",
  "from-amber-200 to-teal-500",
  "from-sky-400 to-orange-300",
];

const NAV = [
  { label: "Library", icon: <Images size={18} /> },
  { label: "Collections", icon: <Layers size={18} /> },
  { label: "Favorites", icon: <Heart size={18} /> },
] as const;

type NavLabel = (typeof NAV)[number]["label"];

const TABS = ["Years", "Months", "All Photos"] as const;

const BAR_OFFSET = "pt-12";

const GlassButton = ({
  children,
  onClick,
  className = "",
  label,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  label?: string;
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`flex h-9 items-center justify-center rounded-full bg-white/25 text-sm font-medium text-white backdrop-blur-xl ${className}`}
  >
    {children}
  </button>
);

const Gallery = ({ onClose }: { onClose: () => void }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState<NavLabel>("Library");
  const [tab, setTab] = useState<(typeof TABS)[number]>("All Photos");

  // Esc closes the gallery
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    // No top padding here: content may extend under the status bar
    <div className="relative flex h-full w-full overflow-hidden bg-black">
      {/* ---------- Sidebar ---------- */}
      {sidebarOpen && (
        <aside className="flex h-full w-[22%] shrink-0 flex-col bg-zinc-200/90 backdrop-blur-2xl">
          <div
            className={`flex items-center justify-between px-3 pb-3 ${BAR_OFFSET}`}
          >
            <button className="rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-gray-800">
              Edit
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Hide sidebar"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-gray-700"
            >
              <PanelLeft size={18} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 pb-4 text-[15px] text-gray-900">
            {NAV.map((item) => (
              <button
                key={item.label}
                onClick={() => setActive(item.label)}
                className={`flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-left ${
                  active === item.label ? "bg-black/10" : ""
                }`}
              >
                <span className="text-blue-500">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
      )}

      {/* ---------- Main ---------- */}
      <main className="relative flex-1 overflow-hidden">
        {/* Photo grid: starts at the very top, under the status bar */}
        <div className="absolute inset-0 grid grid-cols-5 content-start gap-px overflow-y-auto pb-24">
          {Array.from({ length: 60 }).map((_, i) =>
            PHOTOS[i] ? (
              <img
                key={`${active}-${i}`}
                src={PHOTOS[i]}
                alt=""
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div
                key={`${active}-${i}`}
                className={`aspect-square bg-linear-to-br ${TILE_GRADIENTS[i % TILE_GRADIENTS.length]}`}
              />
            ),
          )}
        </div>

        {/* Header: buttons and title sit below the status bar */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between bg-linear-to-b from-black/50 to-transparent px-4 pb-8 ${BAR_OFFSET}`}
        >
          <div className="flex items-start gap-3">
            {/* Back button: leaves the gallery */}
            <GlassButton
              onClick={onClose}
              label="Back"
              className="pointer-events-auto w-9"
            >
              <ChevronLeft size={20} />
            </GlassButton>

            {!sidebarOpen && (
              <GlassButton
                onClick={() => setSidebarOpen(true)}
                label="Show sidebar"
                className="pointer-events-auto w-9"
              >
                <PanelLeft size={18} />
              </GlassButton>
            )}

            <div className="text-white drop-shadow">
              <h1 className="text-3xl font-bold leading-tight">{active}</h1>
              <p className="text-xs font-semibold">Dec 17, 2025</p>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <GlassButton className="w-9" label="Filter">
              <ListFilter size={18} />
            </GlassButton>
            <GlassButton className="px-4">Select</GlassButton>
            <GlassButton className="w-9" label="Search">
              <Search size={18} />
            </GlassButton>
          </div>
        </div>

        {/* Years / Months / All Photos */}
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full bg-black/35 p-1 backdrop-blur-xl">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-1.5 text-sm font-medium text-white ${
                tab === t ? "bg-white/30" : ""
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          aria-label="Close gallery"
          className="absolute bottom-1.5 left-1/2 z-10 h-1 w-32 -translate-x-1/2 cursor-pointer rounded-full bg-white/80"
        />
      </main>
    </div>
  );
};

export default Gallery;

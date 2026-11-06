import { Eye, File, Play, Users } from "lucide-react";

const Stats = () => {
  const stats = [
    { title: "CASES ARCHIVED", number: "2451", icon: <Play /> },
    { title: "INVESTIGATORS", number: "781435", icon: <Users /> },
    { title: "TOTAL VIEWS", number: "1235678966", icon: <Eye /> },
    { title: "THEORIES SUBMITTED", number: "18392", icon: <File /> },
  ];

  return (
    <section className="flex flex-wrap items-center gap-2 w-full">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="vhs-card relative flex items-center justify-center gap-5
 custom-card w-full sm:w-[calc(50%-4px)] lg:w-[calc(25%-6px)]
  h-24 overflow-hidden cursor-pointer"
        >
          <div className="pointer-events-none absolute inset-0 vhs-scanlines" />
          <div className="pointer-events-none absolute inset-0 vhs-noise" />
          <div className="pointer-events-none absolute inset-0 vhs-tracking" />

          <span className="text-2xl relative z-10 vhs-icon">{stat.icon}</span>

          <div className="relative z-10 vhs-content">
            <div className="relative">
              <h5 className="text-red-500 text-3xl relative z-10">
                {stat.number}
              </h5>
              {/* RGB ghost copies, clipped to bands, only visible during glitch */}
              <h5 className="text-3xl vhs-ghost vhs-ghost-r" aria-hidden="true">
                {stat.number}
              </h5>
              <h5 className="text-3xl vhs-ghost vhs-ghost-b" aria-hidden="true">
                {stat.number}
              </h5>
            </div>
            <span className="text-sm text-white block">{stat.title}</span>
          </div>

          <style>{`
            .vhs-scanlines {
              background: repeating-linear-gradient(
                to bottom,
                rgba(255,255,255,0.05) 0px,
                rgba(255,255,255,0.05) 1px,
                transparent 1px,
                transparent 3px
              );
              mix-blend-mode: overlay;
              opacity: 0.35;
            }

            .vhs-noise {
              opacity: 0;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
              mix-blend-mode: overlay;
            }

            .vhs-tracking {
              opacity: 0;
              background: linear-gradient(
                to bottom,
                transparent 0%,
                rgba(255,255,255,0.5) 48%,
                rgba(255,255,255,0.5) 52%,
                transparent 100%
              );
            }

            .vhs-ghost {
              position: absolute;
              top: 0;
              left: 0;
              opacity: 0;
              pointer-events: none;
              mix-blend-mode: screen;
            }
            .vhs-ghost-r { color: #ff2b4d; }
            .vhs-ghost-b { color: #2be0ff; }

            /* ===== Hover-triggered, plays once ===== */
            .vhs-card:hover { animation: vhsFlicker 0.5s steps(2) 1; }
            .vhs-card:hover .vhs-noise { animation: vhsNoise 0.5s steps(1) 1; }
            .vhs-card:hover .vhs-tracking { animation: vhsTrack 0.5s ease-out 1; }
            .vhs-card:hover .vhs-content { animation: vhsShift 0.5s steps(3) 1; }
            .vhs-card:hover .vhs-icon { animation: vhsShift 0.5s steps(3) 1 reverse; }
            .vhs-card:hover .vhs-ghost-r { animation: vhsGhostR 0.5s steps(3) 1; }
            .vhs-card:hover .vhs-ghost-b { animation: vhsGhostB 0.5s steps(3) 1; }

            @keyframes vhsFlicker {
              0% { filter: none; }
              15% { filter: brightness(1.6) contrast(1.3); }
              30% { filter: brightness(0.7) saturate(1.4); }
              50% { filter: brightness(1.3); }
              70% { filter: brightness(0.85); }
              100% { filter: none; }
            }

            @keyframes vhsNoise {
              0% { opacity: 0; }
              15% { opacity: 0.5; }
              30% { opacity: 0.15; }
              45% { opacity: 0.4; }
              60% { opacity: 0.05; }
              100% { opacity: 0; }
            }

            @keyframes vhsTrack {
              0% { opacity: 0; transform: translateY(-100%); }
              25% { opacity: 0.8; transform: translateY(20%); }
              55% { opacity: 0.5; transform: translateY(70%); }
              100% { opacity: 0; transform: translateY(140%); }
            }

            @keyframes vhsShift {
              0% { transform: translate(0, 0) skewX(0deg); }
              15% { transform: translate(-5px, 0) skewX(3deg); }
              30% { transform: translate(4px, -1px) skewX(-2deg); }
              50% { transform: translate(-3px, 1px) skewX(1deg); }
              70% { transform: translate(2px, 0) skewX(0deg); }
              100% { transform: translate(0, 0) skewX(0deg); }
            }

            @keyframes vhsGhostR {
              0% { opacity: 0; transform: translate(0, 0); clip-path: inset(0 0 0 0); }
              15% { opacity: 0.8; transform: translate(-6px, 0); clip-path: inset(10% 0 60% 0); }
              30% { opacity: 0.6; transform: translate(-3px, 0); clip-path: inset(50% 0 10% 0); }
              50% { opacity: 0.7; transform: translate(-4px, 0); clip-path: inset(0 0 70% 0); }
              70% { opacity: 0.3; transform: translate(-2px, 0); clip-path: inset(30% 0 30% 0); }
              100% { opacity: 0; transform: translate(0, 0); }
            }

            @keyframes vhsGhostB {
              0% { opacity: 0; transform: translate(0, 0); clip-path: inset(0 0 0 0); }
              15% { opacity: 0.8; transform: translate(6px, 0); clip-path: inset(60% 0 10% 0); }
              30% { opacity: 0.6; transform: translate(3px, 0); clip-path: inset(10% 0 50% 0); }
              50% { opacity: 0.7; transform: translate(4px, 0); clip-path: inset(70% 0 0 0); }
              70% { opacity: 0.3; transform: translate(2px, 0); clip-path: inset(30% 0 30% 0); }
              100% { opacity: 0; transform: translate(0, 0); }
            }
          `}</style>
        </div>
      ))}
    </section>
  );
};

export default Stats;

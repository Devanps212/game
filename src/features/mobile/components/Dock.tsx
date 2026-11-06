import type { ReactNode } from "react";
import { Folder, Mail, MessageCircle, Phone } from "lucide-react";

const DockItem = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className="shrink-0 cursor-pointer origin-bottom transition-transform duration-200 ease-out hover:scale-[1.2] active:scale-100"
  >
    {children}
  </div>
);

const Dock = ({
  onOpenMessages,
  onOpenGallery,
}: {
  onOpenMessages: () => void;
  onOpenGallery: () => void;
}) => {
  return (
    <div className="mt-4 rounded-2xl bg-white/50 h-18 max-w-xl mx-auto flex items-center justify-center gap-2.5 px-2">
      {/* Call (icon only) */}
      <DockItem>
        <div className="w-14 h-14 rounded-2xl bg-linear-to-b from-green-400 to-green-600 flex items-center justify-center">
          <Phone
            className="w-8 h-8 text-white"
            fill="white"
            strokeWidth={1.5}
          />
        </div>
      </DockItem>

      {/* Messages */}
      <DockItem onClick={onOpenMessages}>
        <div className="w-14 h-14 rounded-2xl bg-linear-to-b from-green-400 to-green-600 flex items-center justify-center">
          <MessageCircle
            className="w-8 h-8 text-white"
            fill="white"
            strokeWidth={1.5}
          />
        </div>
      </DockItem>

      {/* Compass (Safari) */}
      <DockItem>
        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
          <svg width="44" height="44" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="40" fill="#3B9BFF" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="4"
            />
            <g transform="rotate(45 50 50)">
              <polygon points="50,18 59,50 41,50" fill="#FF3B30" />
              <polygon points="50,82 59,50 41,50" fill="white" />
            </g>
          </svg>
        </div>
      </DockItem>

      {/* Music */}
      <DockItem>
        <div className="w-14 h-14 rounded-2xl bg-linear-to-b from-rose-400 to-red-600 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 100 100" aria-hidden="true">
            <path
              d="M38 70 V30 L72 22 V62"
              fill="none"
              stroke="white"
              strokeWidth="7"
              strokeLinejoin="round"
            />
            <polygon points="38,30 72,22 72,38 38,46" fill="white" />
            <circle cx="29" cy="72" r="11" fill="white" />
            <circle cx="63" cy="64" r="11" fill="white" />
          </svg>
        </div>
      </DockItem>

      {/* Email */}
      <DockItem>
        <div className="w-14 h-14 rounded-2xl bg-linear-to-b from-sky-400 to-blue-600 flex items-center justify-center">
          <Mail className="w-8 h-8 text-white" strokeWidth={1.75} />
        </div>
      </DockItem>

      {/* Files */}
      <DockItem>
        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
          <Folder
            className="w-9 h-9 text-blue-500"
            fill="#3B9BFF"
            strokeWidth={1.5}
          />
        </div>
      </DockItem>

      {/* Divider */}
      <div className="w-px h-10 shrink-0 bg-white/70 mx-1" />

      {/* Gallery (Photos) */}
      <DockItem onClick={onOpenGallery}>
        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
          <svg width="44" height="44" viewBox="0 0 100 100" aria-hidden="true">
            {[
              "#FFCC00",
              "#FF9500",
              "#FF3B30",
              "#FF2D92",
              "#AF52DE",
              "#5856D6",
              "#32ADE6",
              "#34C759",
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
      </DockItem>

      {/* Notes */}
      <DockItem>
        <div className="w-14 h-14 rounded-2xl bg-white flex flex-col overflow-hidden">
          <div className="h-5 bg-yellow-400" />
          <div className="flex-1 flex flex-col justify-center gap-2 px-2.5">
            <div className="h-px bg-gray-300" />
            <div className="h-px bg-gray-300" />
            <div className="h-px bg-gray-300" />
          </div>
        </div>
      </DockItem>
    </div>
  );
};

export default Dock;

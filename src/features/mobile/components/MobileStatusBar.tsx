import { WifiIcon } from "lucide-react";
import IPhoneBattery from "./BatteryIcon";

const MobileStatusBar = () => {
  return (
    <div className="flex items-center justify-end gap-2 p-1 bg-black/10">
      <WifiIcon className="w-4 h-4 text-white -translate-y-0.5" />
      <span className="text-white text-sm">100%</span>
      <IPhoneBattery />
    </div>
  );
};

export default MobileStatusBar;

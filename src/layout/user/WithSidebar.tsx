import type { ReactNode } from "react";
import Sidebar from "../../components/users/layout/Sidebar";

const WithSidebar = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex gap-3">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};

export default WithSidebar;

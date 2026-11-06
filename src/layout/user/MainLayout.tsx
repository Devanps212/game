import { Outlet } from "react-router-dom";
import Navbar from "../../components/users/layout/Navbar";

const MainLayout = () => {
  return (
    <div className="h-dvh flex flex-col">
      <Navbar />
      <main className="flex-1 min-h-0 bg-black text-white p-3 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;

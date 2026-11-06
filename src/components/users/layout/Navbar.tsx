import { Search, Upload, User } from "lucide-react";

const Navbar = () => {
  return (
    <header className="bg-black text-white p-3 flex items-center justify-between">
      <div className="w-56">
        <img src="/logo/logo.png" alt="Logo" className="w-full h-auto" />
      </div>
      <div className="flex items-center border border-gray-700 h-10 rounded-sm w-1/3 p-5">
        <input
          type="text"
          placeholder="Search Cases, locations, keywords..."
          className="bg-transparent border-none focus:outline-none text-white w-full"
        />
        <button className="ml-2">
          <Search className="text-white/70" />
        </button>
      </div>
      <div className="flex items-center gap-5">
        <button className="flex items-center gap-2 border border-gray-700 text-white/70 py-2 px-4 rounded-sm">
          <Upload className="text-sm" /> Upload Videos
        </button>
        <button className="flex items-center gap-2 text-white/70 py-2 px-4 rounded-sm">
          <User className="text-sm" /> Login
        </button>
        <button className="flex items-center gap-2 bg-[#791517] text-white py-2 px-4 rounded-sm">
          Register
        </button>
      </div>
    </header>
  );
};

export default Navbar;

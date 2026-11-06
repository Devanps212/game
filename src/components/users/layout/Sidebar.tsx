import {
  Box,
  Home,
  Info,
  LayoutGrid,
  Mail,
  Map,
  Search,
  SearchCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

const Sidebar = () => {
  const links = [
    { icon: <Home />, label: "Home", link: "/" },
    { icon: <Search />, label: "Browse Cases", link: "/" },
    { icon: <LayoutGrid />, label: "Categories", link: "/" },
    { icon: <SearchCheck />, label: "Investigations", link: "/" },
    { icon: <Map />, label: "Map", link: "/" },
    { icon: <Users />, label: "Community", link: "/" },
    { icon: <Info />, label: "About", link: "/" },
    { icon: <Mail />, label: "Contact", link: "/" },
  ];

  return (
    <div className="p-2 mr-2 w-1/5 h-full bg-black">
      <div className="flex flex-col items-start justify-start space-y-2 bg-[#0f0f0ffc] px-4 py-3 rounded-sm">
        {links.map((link, index) => (
          <motion.a
            key={index}
            whileHover={{
              background:
                "linear-gradient(to right, rgba(255, 0, 0, 0.25), rgba(255, 0, 0, 0))",
              borderLeft: "3px solid rgba(255, 0, 0, 0.8)",
              color: "rgba(255, 0, 0, 0.9)",
            }}
            href="#"
            className="text-white w-full hover:text-gray-300 flex items-start rounded-sm gap-3 p-2 py-3 text-lg font-medium"
          >
            {link.icon}
            {link.label}
          </motion.a>
        ))}
      </div>

      <div className="w-full bg-[#0f0f0ffc] mt-4 p-3 rounded-sm">
        <h4 className="text-white text-lg text-center">RANDOM CASES</h4>
        <p className="text-gray-300 text-center text-sm mt-2">
          Can't decide? Let fate <br /> choose for you.
        </p>
        <div
          className="
    w-full mt-2 p-3 rounded-sm flex flex-col items-center justify-center
    bg-[conic-gradient(from_0deg,#dc2626,#450a0a,#dc2626)]
  "
        >
          <p className="text-white py-2 px-4 rounded-sm text-center">
            Show me something disturbing
          </p>

          <Box className="ml-2 text-red-300 text-3xl" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

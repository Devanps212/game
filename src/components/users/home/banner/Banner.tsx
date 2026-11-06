import { ArrowRight } from "lucide-react";
import "./banner.css";

const Banner = () => {
  return (
    <section
      aria-labelledby="hero-title"
      className="bg-[url('/user/banner/banner.jpg')] bg-cover bg-center w-full min-h-137.5"
    >
      <div
        id="hero-title"
        className="flex flex-col items-start justify-start h-full p-6"
      >
        <span className="text-3xl font-semibold text-white/60">WELCOME TO</span>
        <h1 className="text-6xl font-medium leading-tight mt-1">
          <span className="vhs-glitch block" data-text="THE INTERNET'S">
            THE INTERNET'S
          </span>
          <span className="vhs-glitch block" data-text="UNSOLVED FOOTAGE">
            UNSOLVED FOOTAGE
          </span>
          <span className="vhs-glitch block" data-text="ARCHIVE">
            ARCHIVE
          </span>
        </h1>
        <span className="text-lg text-white mt-4">
          Real or fake? You decide.
        </span>
        <p className="text-white/80 mt-2">
          Explore the darkest, creepiest and most <br /> mysterious footage
          found online.
        </p>
        <a className="flex items-center justify-between gap-3 w-64 px-5 py-4 text-xl bg-gradient-to-r from-red-950 via-red-800 to-red-600 text-white font-bold rounded-md mt-6 hover:from-red-900 hover:via-red-700 hover:to-red-500 transition-all duration-300">
          EXPLORE CASES
          <ArrowRight aria-hidden="true" />
        </a>
      </div>
    </section>
  );
};

export default Banner;

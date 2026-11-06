import { ArrowRight, Eye, Flame, Star } from "lucide-react";

const Trending = () => {
  return (
    <section className="p-4 rounded-md mt-7 custom-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center gap-3">
          <Flame className="text-red-500" />
          <h1 className="text-3xl">TRENDING CASES</h1>
        </div>
        <a className="flex items-center justify-center gap-3">
          View All Cases
          <ArrowRight className="text-red-500" />
        </a>
      </div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 h-72">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="w-full h-full rounded-md overflow-hidden border border-gray-800"
          >
            <div className="relative h-48 w-full">
              <img
                src="/user/banner/banner.jpg"
                alt="thumbnail"
                className="w-full h-full object-cover"
              />
              <span className="absolute left-0 top-0 z-10 py-1 px-2 m-3 rounded-md bg-red-500/30 text-red-300">
                0{i + 1}
              </span>
              <div className="absolute bottom-0 left-3 right-3 flex items-end justify-between pb-2 pointer-events-none">
                <div className="w-10 h-10 border-l-2 border-b-2 border-white/70"></div>

                <div className="text-right font-mono text-white/80">
                  <h5 className="text-xs tracking-widest uppercase text-red-500 flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    CAM 01
                  </h5>
                  <p className="text-sm tabular-nums">02:17:34</p>
                </div>
              </div>
            </div>
            <div className="p-3">
              <h4 className="text-2xl">The Figure In The Hallway</h4>
              <div className="flex items-center justify-between mt-3 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-gray-400">2.4 M Views</span>
                </div>

                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-400">4.2</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Trending;

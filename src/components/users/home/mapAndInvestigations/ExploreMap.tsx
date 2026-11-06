const ExploreMap = () => {
  return (
    <div className="relative flex-1 rounded-md p-5 custom-card space-y-4 overflow-hidden">
      <img
        src="/user/banner/map.png"
        alt="map"
        className="absolute right-0 top-0 w-fit h-full object-cover"
      />

      <div className="relative z-10">
        <h1 className="text-white text-3xl">EXPLORE THE MAP</h1>

        <p className="max-w-sm text-md text-gray-300">
          Discover cases from around the world. Who knows what's hiding near
          you?
        </p>

        <button className="mt-5 px-6 py-3 bg-linear-to-r from-red-950 via-red-800 to-red-600 rounded-sm">
          OPEN MAP
        </button>

        {/* Additional content */}
        <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg">
          <div className="border border-white/10 bg-black/20 rounded-md p-4">
            <p className="text-gray-400 text-sm">CASES</p>
            <p className="text-white text-2xl font-bold">1,284</p>
          </div>

          <div className="border border-white/10 bg-black/20 rounded-md p-4">
            <p className="text-gray-400 text-sm">LOCATIONS</p>
            <p className="text-white text-2xl font-bold">76</p>
          </div>

          <div className="border border-white/10 bg-black/20 rounded-md p-4">
            <p className="text-gray-400 text-sm">COUNTRIES</p>
            <p className="text-white text-2xl font-bold">32</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-gray-400 text-sm">
            Explore reported incidents, strange encounters, and unexplained
            events from locations around the world.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExploreMap;

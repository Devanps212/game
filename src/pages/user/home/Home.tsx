import Banner from "../../../components/users/home/banner/Banner";
import Stats from "../../../components/users/home/Stats";
import Trending from "../../../components/users/home/trendingCases/Trending";
import ExploreMap from "../../../components/users/home/mapAndInvestigations/ExploreMap";
import ActiveInvestigations from "../../../components/users/home/mapAndInvestigations/ActiveInvestigations";
import RecentCasesAndStatistics from "../../../components/users/home/recentCasesAndStatistics/RecentCasesAndStatistics";
import WithSidebar from "../../../layout/user/WithSidebar";

const Home = () => {
  return (
    <>
      <WithSidebar>
        <Banner />
        <Stats />
        <Trending />
      </WithSidebar>

      <div className="flex items-stretch gap-4 my-3">
        <ExploreMap />
        <ActiveInvestigations />
      </div>

      <RecentCasesAndStatistics />

      <div className="flex gap-3 flex-1 w-full h-37.5">
        <div className="relative flex-1 h-full p-5 custom-card overflow-hidden">
          <img
            src="/user/newsletter/glitch_image.jpg"
            alt="glitch"
            className="absolute left-0 top-0 w-62.5 h-full object-cover"
          />

          <div className="relative z-10 ml-62.5 h-full flex items-end gap-8">
            <div className="w-55 shrink-0">
              <h4 className="text-2xl">STAY UPDATED</h4>

              <p className="text-gray-400 text-sm">
                Get notified when new footages found and major investigation
                updates
              </p>
            </div>

            <div className="flex items-center gap-3 flex-1 p-3 rounded-sm border border-gray-700/40">
              <input
                type="text"
                className="outline-none bg-transparent flex-1 min-w-0"
                placeholder="Enter your email"
              />

              <button className="bg-linear-to-r from-red-950 via-red-800 to-red-600 text-white px-5 py-2 shrink-0 rounded-md">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>

        <div className="w-125 custom-card flex items-center justify-center p-4">
          <div>
            <h4 className="text-2xl text-red-500">WARNING</h4>

            <p className="text-gray-400 text-sm">
              Get notified when new footages found and major investigation
              updates
            </p>
          </div>
          <img
            src="/user/newsletter/handprint.jpg"
            alt="handPrint"
            className="w-32 h-full"
          />
        </div>
      </div>
    </>
  );
};

export default Home;

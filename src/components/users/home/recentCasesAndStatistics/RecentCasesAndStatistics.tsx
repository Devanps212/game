import { ArrowRight } from "lucide-react";

const RecentCasesAndStatistics = () => {
  return (
    <div className="flex items-stretch gap-4 my-3">
      <div className="flex-1 p-5 custom-card">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl">RECENTLY FOUND</h1>
          <a className="flex items-center justify-center gap-3">
            View All Cases
            <ArrowRight className="text-red-500" />
          </a>
        </div>
        <div className="mt-3 flex items-center gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-62.5 p-3">
              <div className="relative w-full h-37.5">
                <img
                  src="/user/banner/banner.jpg"
                  alt="image"
                  className="w-full h-full object-cover"
                />
                <span className="absolute left-0 top-0 m-2 p-1 bg-red-500/30 text-sm">
                  NEW
                </span>
              </div>
              <h5>Strange Recording From An Old Phone</h5>
              <span className="text-gray-400 text-sm">Found 1 Hour ago</span>
            </div>
          ))}
        </div>
      </div>
      <div className="w-87.5 custom-card p-5 space-y-3">
        <h1 className="text-3xl">CASE STATISTICS</h1>
        <div className="w-full h-25 bg-gray-400" />
        <div className="space-y-2 mt-5">
          <div className="flex items-start justify-between">
            <p className="text-gray-400">New Cases (This week)</p>
            <span>54</span>
          </div>
          <div className="flex items-start justify-between">
            <p className="text-gray-400">Cases Solved</p>
            <span>312</span>
          </div>
          <div className="flex items-start justify-between">
            <p className="text-gray-400">Unsolved Cases</p>
            <span>2139</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentCasesAndStatistics;

import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ActiveInvestigations = () => {
  return (
    <div className="w-1/3 rounded-md custom-card p-5 ">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">ACTIVE INVESTIGATIONS</h1>
        <a className="flex items-center justify-center gap-3">
          View All Cases
          <ArrowRight className="text-red-500" />
        </a>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between mt-4">
          <div className="flex items-start gap-3">
            <div className="w-20 h-20 bg-gray-400 rounded-lg"></div>
            <div>
              <span className="text-red-300 text-sm">CASE #4231</span>
              <h5 className="text-md mt-2">The Abandoned Hospital Tapes</h5>
              <p className="text-sm text-gray-400">Investigators: 1734</p>
            </div>
          </div>
          <Link
            to="#"
            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 uppercase"
          >
            Investigate
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ActiveInvestigations;

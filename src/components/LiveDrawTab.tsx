
import { Trophy } from "lucide-react";
import { LiveTicker } from "./LiveTicker";

export const LiveDrawTab = () => {
  return (
    <div className="space-y-8">
      <LiveTicker />
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg text-center space-y-8">
        <Trophy size={48} className="text-gold mx-auto" strokeWidth={1.5} />
        <h2 className="text-3xl font-bold">Today's Prize Pool</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-cream rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Grand Prize</h3>
            <p>2018 Château Margaux</p>
          </div>
          <div className="bg-cream rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Second Prize</h3>
            <p>2015 Opus One</p>
          </div>
          <div className="bg-cream rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Third Prize</h3>
            <p>2019 Sassicaia</p>
          </div>
        </div>
      </div>
    </div>
  );
};

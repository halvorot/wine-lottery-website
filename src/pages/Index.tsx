
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timer, Wine, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const CountdownTimer = () => {
  const [time, setTime] = useState({ hours: 4, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => {
        const totalSeconds =
          prevTime.hours * 3600 + prevTime.minutes * 60 + prevTime.seconds - 1;
        if (totalSeconds < 0) return { hours: 4, minutes: 0, seconds: 0 };
        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-4 text-4xl font-bold text-charcoal">
      <div className="flex flex-col items-center">
        <span className="bg-cream p-4 rounded-lg min-w-[80px]">
          {String(time.hours).padStart(2, "0")}
        </span>
        <span className="text-sm mt-2">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="bg-cream p-4 rounded-lg min-w-[80px]">
          {String(time.minutes).padStart(2, "0")}
        </span>
        <span className="text-sm mt-2">Minutes</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="bg-cream p-4 rounded-lg min-w-[80px]">
          {String(time.seconds).padStart(2, "0")}
        </span>
        <span className="text-sm mt-2">Seconds</span>
      </div>
    </div>
  );
};

const LiveTicker = () => {
  return (
    <div className="overflow-hidden whitespace-nowrap w-full bg-cream/50 backdrop-blur-sm rounded-lg p-4">
      <div className="animate-ticker inline-block">
        {Array(10)
          .fill(0)
          .map((_, i) => (
            <span key={i} className="inline-block mx-8">
              John Doe #{i + 1} entered with {Math.floor(Math.random() * 5) + 1}{" "}
              tickets
            </span>
          ))}
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-white text-charcoal">
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="lottery" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-[400px] mx-auto mb-8">
            <TabsTrigger value="lottery">Lottery</TabsTrigger>
            <TabsTrigger value="live">Live Draw</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="lottery" className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-block animate-float">
                <Wine
                  size={48}
                  className="text-wine mx-auto mb-4"
                  strokeWidth={1.5}
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-wine to-gold bg-clip-text text-transparent">
                Welcome to Today's Wine Lottery!
              </h1>
              <p className="text-lg text-charcoal/80 max-w-2xl mx-auto">
                Join our exclusive wine lottery for a chance to win premium
                selections from renowned vineyards.
              </p>
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-center space-y-8">
                <h2 className="text-2xl font-semibold">Next Draw In</h2>
                <CountdownTimer />
                <div className="flex justify-center gap-4">
                  <Button
                    size="lg"
                    className="bg-wine hover:bg-wine-light text-white"
                  >
                    Enter Now
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-wine text-wine hover:bg-wine/5"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="live" className="space-y-8">
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
          </TabsContent>

          <TabsContent value="admin" className="space-y-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                <Button className="bg-wine hover:bg-wine-light text-white">
                  Draw Winner
                </Button>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-cream rounded-lg p-6">
                  <Users className="mb-2" />
                  <h3 className="text-xl font-semibold">Total Entries</h3>
                  <p className="text-2xl font-bold">247</p>
                </div>
                <div className="bg-cream rounded-lg p-6">
                  <Timer className="mb-2" />
                  <h3 className="text-xl font-semibold">Time Left</h3>
                  <p className="text-2xl font-bold">03:45:22</p>
                </div>
                <div className="bg-cream rounded-lg p-6">
                  <Trophy className="mb-2" />
                  <h3 className="text-xl font-semibold">Total Prizes</h3>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Tickets</th>
                      <th className="text-left p-4">Entry Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-4">John Doe #{i + 1}</td>
                          <td className="p-4">
                            {Math.floor(Math.random() * 5) + 1}
                          </td>
                          <td className="p-4">2 minutes ago</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;


export const LiveTicker = () => {
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

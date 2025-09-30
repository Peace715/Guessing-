import { useEffect, useState } from "react";

export default function TimerBar({ socket }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [maxTime, setMaxTime] = useState(60);

  useEffect(() => {
    if (!socket) return;

    // When a new game starts
    socket.on("game_started", ({ maxTime }) => {
      setMaxTime(maxTime);
      setTimeLeft(maxTime); // reset instantly
    });

    // When server says time is up
    socket.on("time_up", () => setTimeLeft(0));

    return () => {
      socket.off("game_started");
      socket.off("time_up");
    };
  }, [socket]);

  // Countdown effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0)); // never below 0
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  if (timeLeft <= 0) return null;

  const widthPercent = (timeLeft / maxTime) * 100;
  const barColor = timeLeft <= 10 ? "bg-red-500" : "bg-green-500";
  const dangerPulse = timeLeft <= 5 ? "animate-pulse" : "";

  return (
    <div className="mb-4">
      {/* Timer text */}
      <div className="flex justify-between items-center mb-1">
        <span
          className={`text-sm font-medium ${
            timeLeft <= 10 ? "text-red-600" : "text-gray-700"
          }`}
        >
          ⏳ {timeLeft}s left
        </span>
        <span className="text-sm text-gray-500">Max: {maxTime}s</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`${barColor} ${dangerPulse} h-3 transition-all duration-1000 ease-linear`}
          style={{ width: `${widthPercent}%` }}
        ></div>
      </div>
    </div>
  );
}

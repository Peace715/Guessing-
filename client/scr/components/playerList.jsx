import { useEffect, useState } from "react";

export default function PlayerList({ socket }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.on("player_list", (list) => {
      setPlayers(list);
    });

    socket.on("player_won", ({ winner }) => {
      setPlayers((prev) =>
        prev.map((p) =>
          p.username === winner ? { ...p, score: (p.score || 0) + 10 } : p
        )
      );
    });

    return () => {
      socket.off("player_list");
      socket.off("player_won");
    };
  }, [socket]);

  return (
    <div
      className="
        bg-white shadow-md rounded-2xl p-4
        h-[60vh] sm:h-[80vh]
        w-full sm:w-64
        flex flex-col
      "
    >
      {/* Title */}
      <h2 className="text-xl font-bold mb-3 text-center">Players</h2>

      {/* Players list */}
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {players.length === 0 && (
            <li className="text-gray-500 text-center">No players yet</li>
          )}

          {players.map((p, i) => (
            <li
              key={i}
              className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg shadow-sm"
            >
              <span className="font-medium">{p.username}</span>
              <span className="text-sm text-gray-600">{p.score ?? 0} pts</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

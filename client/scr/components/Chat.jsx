import { useEffect, useState } from "react";

export default function Chat({ socket }) {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [guess, setGuess] = useState("");

  useEffect(() => {
    if (!socket) return;

    socket.on("player_list", (list) =>
      setMessages((m) => [
        ...m,
        {
          system: true,
          text: `Players: ${list.map((p) => p.username).join(", ")}`,
        },
      ])
    );

    socket.on("game_started", ({ question }) =>
      setMessages((m) => [
        ...m,
        { system: true, text: `🎮 Game started - Question: ${question}` },
      ])
    );

    socket.on("guess_made", ({ username, guess }) =>
      setMessages((m) => [...m, { username, text: guess }])
    );

    socket.on("player_won", ({ winner, answer }) =>
      setMessages((m) => [
        ...m,
        { system: true, text: `🏆 ${winner} won! Answer: ${answer}` },
      ])
    );

    return () => {
      socket.off("player_list");
      socket.off("game_started");
      socket.off("guess_made");
      socket.off("player_won");
    };
  }, [socket]);

  const handleSendGuess = () => {
    if (guess.trim()) {
      socket.emit("make_guess", { username, code, guess });
      setGuess("");
    }
  };

  return (
    <div className="flex flex-col h-[80vh]">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200 mb-3">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center italic">💬 No messages yet</p>
        ) : (
          messages.map((msg, i) => (
            <p
              key={i}
              className={`mb-2 ${
                msg.system ? "text-sm text-gray-600 italic" : "text-base"
              }`}
            >
              {msg.system ? (
                <em>{msg.text}</em>
              ) : (
                <>
                  <span className="font-semibold text-indigo-600">
                    {msg.username}:
                  </span>{" "}
                  {msg.text}
                </>
              )}
            </p>
          ))
        )}
      </div>

      {/* Inputs */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Enter game code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter your guess"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
          <button
            onClick={handleSendGuess}
            className="px-4 py-2 bg-indigo-500 text-white font-medium rounded-lg shadow hover:bg-indigo-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

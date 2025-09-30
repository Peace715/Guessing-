import { io } from "socket.io-client";
import Chat from "./components/Chat";
import PlayerList from "./components/PlayerList";
import TimerBar from "./components/TimerBar";

const socket = io("http://localhost:5000/game");

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-12 gap-6">
        
        {/* Sidebar - Players */}
        <aside className="col-span-3 bg-white shadow-lg rounded-2xl p-4">
          <PlayerList socket={socket} />
        </aside>

        {/* Main Content */}
        <main className="col-span-9 flex flex-col gap-4">
          {/* Timer */}
          <div className="bg-white shadow-lg rounded-2xl p-4">
            <TimerBar socket={socket} />
          </div>

          {/* Chat */}
          <div className="bg-white shadow-lg rounded-2xl p-4 flex-1">
            <Chat socket={socket} />
          </div>
        </main>
      </div>
    </div>
  );
}

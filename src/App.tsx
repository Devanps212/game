import "./App.css";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Home from "./pages/user/home/Home";
import GameLoader from "./layout/user/GameLoader";
import Intro from "./features/games/components/GameIntro";
import Mobile from "./pages/user/Mobile";
import Chat from "./pages/user/Chat";
import GameLobby from "./features/games/components/GameLobby";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Every game lives under /game/<gameId>/... */}
        <Route path="/game/:gameId" element={<GameLoader />}>
          <Route index element={<Navigate to="lobby" replace />} />
          <Route path="lobby" element={<GameLobby />} />
          <Route path="intro" element={<Intro />} />
          <Route path="mobile" element={<Mobile />} />
          <Route path="chat" element={<Chat />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

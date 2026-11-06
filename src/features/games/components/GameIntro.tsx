import { Navigate, useNavigate } from "react-router-dom";
import { useGame } from "../context/gameContext";

const Intro = () => {
  const game = useGame();
  const navigate = useNavigate();
  const { Intro: GameIntro } = game;

  if (!GameIntro) return <Navigate to="../mobile" replace />;

  return (
    <GameIntro onComplete={() => navigate("../mobile", { replace: true })} />
  );
};

export default Intro;

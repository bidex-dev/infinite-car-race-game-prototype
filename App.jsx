// Infinite Car Race Game Prototype
// UI/UX: Levels, credits, and Flutterwave payment placeholder

import { useState, useRef, useEffect } from "react";

const CAR_WIDTH = 60, CAR_HEIGHT = 100, ROAD_WIDTH = 340, ROAD_HEIGHT = 520;
const OBSTACLE_WIDTH = 60, OBSTACLE_HEIGHT = 100, TRACK_MARGIN = 20;
const LANE_COUNT = 3, LEVEL_SPEED_INC = 1.1, INITIAL_LIVES = 3;
const OBSTACLE_COLOR = "#e53e3e", CAR_COLOR = "#2563eb";
const OBSTACLES_PER_LEVEL = 10; // number of obstacles before next level

function randomLane() {
  return Math.floor(Math.random() * LANE_COUNT);
}

function laneToX(lane) {
  return TRACK_MARGIN + lane * (ROAD_WIDTH - 2 * TRACK_MARGIN - CAR_WIDTH) / (LANE_COUNT - 1);
}

function collide(ob, carY, carX) {
  // Obstacle: {x, y}
  return (
    ob.y + OBSTACLE_HEIGHT > carY &&
    ob.y < carY + CAR_HEIGHT &&
    Math.abs(ob.x - carX) < OBSTACLE_WIDTH * 0.75
  );
}

export default function App() {
  // Game state
  const [credits, setCredits] = useState(5);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [level, setLevel] = useState(1);
  const [paused, setPaused] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  // Player state
  const [carLane, setCarLane] = useState(1);
  const [score, setScore] = useState(0);

  // Obstacle state
  const [obstacles, setObstacles] = useState([]);
  const [obstaclesPassed, setObstaclesPassed] = useState(0);

  // Animation
  const animationRef = useRef();

  // Controls: goto lane
  function moveLeft() {
    setCarLane((lane) => Math.max(0, lane - 1));
  }
  function moveRight() {
    setCarLane((lane) => Math.min(LANE_COUNT - 1, lane + 1));
  }

  function restart() {
    setLevel(1);
    setLives(INITIAL_LIVES);
    setScore(0);
    setGameOver(false);
    setCarLane(1);
    setObstacles([]);
    setObstaclesPassed(0);
    setPaused(true);
  }

  function continueGame() {
    if (credits > 0) {
      setCredits((c) => c - 1);
      setLives(INITIAL_LIVES);
      setGameOver(false);
      setPaused(true);
    }
  }

  // Main game loop
  useEffect(() => {
    if (paused || gameOver) return;

    let lastTime = performance.now();
    function frame(time) {
      // Speed based on level
      const speed = 3.5 * Math.pow(LEVEL_SPEED_INC, level - 1);

      // Move obstacles
      setObstacles((oldObs) => {
        const newObs = oldObs
          .map((ob) => ({ ...ob, y: ob.y + speed }))
          .filter((ob) => ob.y < ROAD_HEIGHT);
        // Count passed
        setObstaclesPassed((passed) =>
          passed + (oldObs.length - newObs.length)
        );
        return newObs;
      });

      // Add new obstacles at random interval
      if (obstacles.length === 0 || (obstacles[obstacles.length - 1]?.y > 110)) {
        setObstacles((obs) =>
          obs.concat({
            lane: randomLane(),
            x: laneToX(randomLane()),
            y: -OBSTACLE_HEIGHT,
            key: Math.random().toString(36),
          })
        );
      }

      // Collision
      const carX = laneToX(carLane), carY = ROAD_HEIGHT - CAR_HEIGHT - 10;
      for (let ob of obstacles) {
        if (collide(ob, carY, carX)) {
          setLives((l) => l - 1);
          setObstacles([]);
          return;
        }
      }

      // Level up
      if (obstaclesPassed >= OBSTACLES_PER_LEVEL * level) {
        setLevel((l) => l + 1);
      }

      // Score
      setScore((s) => s + Math.floor(speed / 3.5));

      if (!gameOver && !paused) {
        animationRef.current = requestAnimationFrame(frame);
      }
    }

    animationRef.current = requestAnimationFrame(frame);
    return () => animationRef.current && cancelAnimationFrame(animationRef.current);
    // eslint-disable-next-line
  }, [paused, gameOver, level, carLane, obstacles]);

  useEffect(() => {
    // Lose life
    if (lives < 1) {
      setGameOver(true);
      setObstacles([]);
    }
  }, [lives]);

  // Keyboard control
  useEffect(() => {
    function handle(e) {
      if (paused || gameOver) return;
      if (e.key === "ArrowLeft") moveLeft();
      if (e.key === "ArrowRight") moveRight();
      if (e.key === " " && paused) setPaused(false);
    }
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  });

  // Payment placeholder
  const handleBuyCredits = () => {
    window.open('https://www.flutterwave.com/ng/', '_blank');
    // For real: here wire up your Flutterwave API!
    setCredits((c) => c + 5); // For demo, just add
  };

  // Main UI
  return (
    <div className="bg-gradient-to-b from-blue-900 via-gray-900 to-black min-h-screen flex flex-col items-center justify-center py-5">
      <h1 className="text-5xl font-extrabold from-yellow-500 to-orange-600 bg-gradient-to-r bg-clip-text text-transparent mb-4">
        Infinity Car Race
      </h1>
      {/* Scoreboard & controls */}
      <div className="flex gap-8 items-center mb-4">
        <div className="bg-white/10 rounded-lg px-6 py-2 flex flex-col items-center shadow">
          <span className="text-lg font-semibold text-yellow-300">Level</span>
          <span className="text-2xl font-bold">{level}</span>
        </div>
        <div className="bg-white/10 rounded-lg px-6 py-2 flex flex-col items-center shadow">
          <span className="text-lg font-semibold text-green-300">Score</span>
          <span className="text-2xl font-bold">{score}</span>
        </div>
        <div className="bg-white/10 rounded-lg px-6 py-2 flex flex-col items-center shadow">
          <span className="text-lg font-semibold text-red-300 flex items-center">
            <span className="inline-block mr-1">❤️</span> Lives
          </span>
          <span className="text-2xl font-bold">{lives}</span>
        </div>
        <div className="bg-white/10 rounded-lg px-6 py-2 flex flex-col items-center shadow">
          <span className="text-lg font-semibold text-blue-300 flex items-center">
            <span className="inline-block mr-1">💳</span> Credits
          </span>
          <span className="text-2xl font-bold">{credits}</span>
        </div>
      </div>
      {/* Game board */}
      <div
        className="rounded-2xl relative shadow-xl border-4 border-blue-400"
        style={{
          width: ROAD_WIDTH,
          height: ROAD_HEIGHT,
          background:
            "linear-gradient(180deg, #29304d 80%, #21222d 100%)",
          overflow: "hidden",
        }}
      >
        {/* Road lanes */}
        {[...Array(LANE_COUNT - 1)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left:
                TRACK_MARGIN +
                ((i + 1) * (ROAD_WIDTH - 2 * TRACK_MARGIN)) / LANE_COUNT,
              top: 0,
              width: 6,
              height: "100%",
              background:
                "repeating-linear-gradient(to bottom,#e5e7eb 0 15px,transparent 15px 35px)",
              opacity: 0.15,
              zIndex: 1,
              borderRadius: 2,
            }}
          />
        ))}
        {/* Obstacles */}
        {obstacles.map((ob, i) => (
          <div
            key={ob.key}
            style={{
              position: "absolute",
              left: ob.x,
              top: ob.y,
              width: OBSTACLE_WIDTH,
              height: OBSTACLE_HEIGHT,
              background: OBSTACLE_COLOR,
              borderRadius: 14,
              boxShadow: "0 3px 12px #0008",
              border: "3px solid #ffa3a3",
              zIndex: 2,
              display: "flex",
              alignItems: "end",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: 28,
            }}
          >
            <span role="img" aria-label="">🚗</span>
          </div>
        ))}
        {/* Player Car */}
        <div
          style={{
            position: "absolute",
            left: laneToX(carLane),
            top: ROAD_HEIGHT - CAR_HEIGHT - 10,
            width: CAR_WIDTH,
            height: CAR_HEIGHT,
            background: CAR_COLOR,
            borderRadius: 22,
            boxShadow: "0 6px 16px #0008",
            border: "6px solid #262626",
            zIndex: 9,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: 32,
            color: "#fff",
          }}
        >
          <span role="img" aria-label="car">🚙</span>
        </div>
      </div>
      {/* Buttons */}
      <div className="flex gap-6 mt-6 items-center">
        <button
          className={`rounded-lg bg-indigo-600 hover:bg-indigo-800 px-7 py-3 text-white shadow-lg text-lg font-bold transition-all 
          ${paused || gameOver ? "" : "opacity-70 cursor-not-allowed"}`}
          disabled={!paused && !gameOver}
          onClick={() => setPaused(false)}
        >
          {gameOver ? "Restart" : paused ? "Start Race" : "Running..."}
        </button>
        <button
          className="rounded-lg bg-amber-400 hover:bg-amber-500 px-7 py-3 text-black font-bold transition-all shadow"
          onClick={handleBuyCredits}
        >
          Buy Credits (+5)
        </button>
        <button
          className="rounded-lg bg-blue-900 hover:bg-blue-700 px-5 py-3 text-white font-bold transition-all"
          onClick={restart}
        >
          Reset Game
        </button>
      </div>
      {/* Game over overlay */}
      {gameOver && (
        <div className="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center z-50"
          style={{
            backdropFilter: 'blur(6px)',
            background: "rgba(30,30,40,0.82)",
          }}>
          <div className="bg-black/60 rounded-2xl p-10 border-4 border-red-500 shadow-2xl flex flex-col items-center">
            <h2 className="text-5xl mb-4 font-bold text-red-400">Game Over</h2>
            <p className="text-2xl mb-2 font-semibold text-yellow-100">
              Level: {level} &middot; Score: {score}
            </p>
            {credits > 0 ? (
              <button className="bg-green-500 hover:bg-green-700 px-8 py-3 rounded-lg font-bold mt-2 text-white text-lg"
                onClick={continueGame}>
                Continue (1 Credit)
              </button>
            ) : (
              <button className="bg-amber-400 hover:bg-amber-600 px-8 py-3 rounded-lg font-bold text-lg mt-4"
                onClick={handleBuyCredits}>
                Buy Credits to Continue
              </button>
            )}
            <button className="mt-4 text-blue-400 hover:underline" onClick={restart}>
              New Game
            </button>
          </div>
        </div>
      )}
      <p className="mt-7 text-center text-gray-500 max-w-xl">
        Use <span className="font-mono">←</span> <span className="font-mono">→</span> arrow keys to move • Avoid the red cars! <br />
        <span className="text-yellow-500 font-bold">Tip:</span> Earn more score as you race! <br />
        <span className="text-indigo-400 font-semibold">Integrate Flutterwave payment in <span className="font-mono">handleBuyCredits()</span> <br />
        For leaderboard and account save, connect a database and authentication.</span>
      </p>
    </div>
  );
}
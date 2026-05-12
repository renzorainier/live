"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TotemTracker() {
  // --- STATE MANAGEMENT ---
  const [followCount, setFollowCount] = useState(0);
  const [popCount, setPopCount] = useState(0);
  const [lastAction, setLastAction] = useState(null);

  const mockUsers = ["Darwin", "Ken", "Ralph", "Eunice", "RandomViewer_99"];

  // --- DERIVED UI STATES ---
  const isPhase1 = followCount < 5;
  const isPhase2 = followCount >= 5 && popCount < 5;
  const isReady = popCount >= 5;

  /* --- DEV TEST FUNCTIONS --- */
  const simulateFollow = () => {
    if (followCount < 5) {
      setFollowCount((prev) => prev + 1);
      setLastAction({ name: mockUsers[followCount], type: 'FOLLOW' });
      setTimeout(() => setLastAction(null), 3000);
    }
  };

  const simulatePop = () => {
    if (isPhase2 && popCount < 5) {
      setPopCount((prev) => prev + 1);
      setLastAction({ name: mockUsers[popCount], type: 'POP' });
      setTimeout(() => setLastAction(null), 3000);
    }
  };

  const resetTracker = () => {
    setFollowCount(0);
    setPopCount(0);
    setLastAction(null);
  };
  /* ------------------------- */

  return (
    <motion.div
      animate={{
        backgroundColor: isReady ? ['rgba(0,0,0,0)', 'rgba(234, 179, 8, 0.4)', 'rgba(220, 38, 38, 0.3)', 'rgba(0,0,0,0)'] : 'rgba(0,0,0,0)'
      }}
      transition={{ repeat: isReady ? Infinity : 0, duration: 0.6 }}
      className="h-screen w-full flex flex-col items-center justify-start pt-10 overflow-hidden relative font-sans"
    >

      {/* --- THE MAIN UI --- */}
      <AnimatePresence mode="wait">

        {/* STATE 3: THE CLIMAX WITH TOTEM ICON */}
        {isReady && (
          <motion.div
            key="climax"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center mt-10"
          >
            {/* The Floating, Glowing Totem Image */}
            <motion.div
              animate={{
                y: [-15, 15, -15],
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="relative mb-6"
            >
              {/* Fallback glow behind the image */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute inset-0 bg-yellow-500 rounded-full blur-[50px] -z-10"
              />

              {/* Make sure to put totem.png in your /public folder! */}
              <img
                src="./totem.png"
                alt="Fully Charged Totem"
                className="w-40 h-40 object-contain drop-shadow-[0_0_25px_rgba(250,204,21,0.8)]"
                onError={(e) => {
                  e.target.style.display='none';
                  e.target.nextSibling.style.display='flex';
                }}
              />
              {/* Fallback Emoji just in case the image doesn't load immediately */}
              <div className="hidden w-40 h-40 items-center justify-center text-8xl drop-shadow-[0_0_25px_rgba(250,204,21,0.8)]">
                🗿
              </div>
            </motion.div>

            <motion.h1
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
              className="text-4xl text-white font-black tracking-[0.2em] mb-2 drop-shadow-lg"
            >
              CHARGE COMPLETE
            </motion.h1>
            <motion.h2
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
              className="text-7xl text-yellow-400 font-black tracking-widest drop-shadow-[0_0_25px_rgba(250,204,21,1)]"
            >
              TAKE FLIGHT!
            </motion.h2>
          </motion.div>
        )}

        {/* STATE 2: WAITING FOR POPS */}
        {isPhase2 && (
          <motion.div
            key="phase2"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="flex flex-col items-center w-full px-8"
          >
            <motion.h1
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="text-3xl text-red-400 font-black tracking-widest drop-shadow-[0_0_10px_rgba(248,113,113,0.8)] mb-4"
            >
              🔥 SPAM "POP" IN CHAT! 🔥
            </motion.h1>

            <div className="w-[450px] h-12 bg-gray-900/80 border-4 border-red-600 rounded-full overflow-hidden relative shadow-[0_0_25px_rgba(220,38,38,0.6)]">
              <motion.div
                className="h-full bg-gradient-to-r from-red-600 to-orange-400"
                initial={{ width: 0 }}
                animate={{ width: `${(popCount / 5) * 100}%` }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-white drop-shadow-md">
                {popCount} / 5
              </div>
            </div>
          </motion.div>
        )}

        {/* STATE 1: WAITING FOR FOLLOWS */}
        {isPhase1 && (
          <motion.div
            key="phase1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="flex flex-col items-center w-full px-8"
          >
            <h1 className="text-2xl text-cyan-300 font-bold tracking-widest drop-shadow-md mb-4 uppercase">
              Step 1: Follow to Charge
            </h1>

            <div className="w-[400px] h-10 bg-gray-900/80 border-2 border-cyan-600 rounded-full overflow-hidden relative shadow-[0_0_15px_rgba(8,145,178,0.5)]">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${(followCount / 5) * 100}%` }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white drop-shadow-md">
                {followCount} / 5
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* --- RECENT ACTION NOTIFICATION (Toast) --- */}
      <div className="absolute top-56 left-1/2 transform -translate-x-1/2 z-50">
        <AnimatePresence>
          {lastAction && !isReady && (
            <motion.div
              initial={{ y: -50, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className={`backdrop-blur-md px-6 py-3 rounded-full font-bold text-xl shadow-lg border-2 text-white
                ${lastAction.type === 'FOLLOW'
                  ? 'bg-blue-900/80 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                  : 'bg-red-900/80 border-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.5)]'
                }`}
            >
              {lastAction.type === 'FOLLOW' ? (
                <>✨ <span className="text-cyan-300">{lastAction.name}</span> Followed!</>
              ) : (
                <>🔥 <span className="text-orange-300">{lastAction.name}</span> typed POP!</>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- DEV CONTROLS (Hide this later via CSS or delete it) --- */}
      <div className="absolute bottom-10 flex space-x-4 bg-black/90 p-4 rounded-xl border border-gray-600 z-50 shadow-2xl">
        <div className="text-white text-sm absolute -top-6 left-2 font-mono text-gray-400 font-bold">Dev Tools (Test the Flow)</div>

        <button
          onClick={simulateFollow}
          disabled={!isPhase1}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-500 text-white px-4 py-2 rounded font-bold transition-colors w-32"
        >
          +1 Follow
        </button>

        <button
          onClick={simulatePop}
          disabled={!isPhase2}
          className="bg-orange-600 hover:bg-orange-500 disabled:bg-gray-800 disabled:text-gray-500 text-white px-4 py-2 rounded font-bold transition-colors w-32"
        >
          +1 "POP"
        </button>

        <button
          onClick={resetTracker}
          className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded font-bold transition-colors border-l-2 border-gray-500 ml-4 pl-6"
        >
          Reset All
        </button>
      </div>

    </motion.div>
  );
}

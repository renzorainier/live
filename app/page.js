"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Flame,
  Users,
  Zap,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

export default function TotemTracker() {
  const [followCount, setFollowCount] = useState(0);
  const [popCount, setPopCount] = useState(0);
  const [lastAction, setLastAction] = useState(null);

  const mockUsers = ["Darwin", "Ken", "Ralph", "Eunice", "RandomViewer_99"];

  const isPhase1 = followCount < 5;
  const isPhase2 = followCount >= 5 && popCount < 5;
  const isReady = popCount >= 5;

  const simulateFollow = () => {
    if (followCount < 5) {
      setFollowCount((prev) => prev + 1);

      setLastAction({
        name: mockUsers[followCount],
        type: "FOLLOW",
      });

      setTimeout(() => setLastAction(null), 2500);
    }
  };

  const simulatePop = () => {
    if (isPhase2 && popCount < 5) {
      setPopCount((prev) => prev + 1);

      setLastAction({
        name: mockUsers[popCount],
        type: "POP",
      });

      setTimeout(() => setLastAction(null), 2500);
    }
  };

  const resetTracker = () => {
    setFollowCount(0);
    setPopCount(0);
    setLastAction(null);
  };

  const followProgress = (followCount / 5) * 100;
  const popProgress = (popCount / 5) * 100;

  return (
    <div className="min-h-screen bg-[#060816] text-white overflow-hidden relative">
      {/* background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-120px] left-[-100px] w-[400px] h-[400px] bg-cyan-500/20 blur-[120px]" />
        <div className="absolute bottom-[-120px] right-[-100px] w-[400px] h-[400px] bg-orange-500/20 blur-[120px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* main desktop layout */}
      <div className="relative z-10 flex h-screen">
        {/* LEFT PANEL */}
        <div className="w-[320px] border-r border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col">
          {/* logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Zap size={24} />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-wide">
                TOTEM CORE
              </h1>
              <p className="text-xs text-gray-400 uppercase tracking-[0.3em]">
                Stream Event Tracker
              </p>
            </div>
          </div>

          {/* phase cards */}
          <div className="space-y-5">
            {/* follow phase */}
            <motion.div
              animate={{
                borderColor: isPhase1
                  ? "rgba(34,211,238,0.7)"
                  : "rgba(255,255,255,0.08)",
              }}
              className="bg-[#0c1024] rounded-3xl border p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-cyan-300 uppercase tracking-widest">
                    Phase 01
                  </p>
                  <h2 className="text-lg font-bold">Follow Charge</h2>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                  <Users className="text-cyan-300" />
                </div>
              </div>

              <div className="h-4 bg-black/40 rounded-full overflow-hidden mb-3">
                <motion.div
                  animate={{ width: `${followProgress}%` }}
                  transition={{ type: "spring", stiffness: 70 }}
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Followers</span>
                <span className="font-bold text-cyan-300">
                  {followCount}/5
                </span>
              </div>
            </motion.div>

            {/* pop phase */}
            <motion.div
              animate={{
                borderColor: isPhase2
                  ? "rgba(249,115,22,0.7)"
                  : "rgba(255,255,255,0.08)",
              }}
              className="bg-[#0c1024] rounded-3xl border p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-orange-300 uppercase tracking-widest">
                    Phase 02
                  </p>
                  <h2 className="text-lg font-bold">POP Spam</h2>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                  <Flame className="text-orange-300" />
                </div>
              </div>

              <div className="h-4 bg-black/40 rounded-full overflow-hidden mb-3">
                <motion.div
                  animate={{ width: `${popProgress}%` }}
                  transition={{ type: "spring", stiffness: 70 }}
                  className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">POP Messages</span>
                <span className="font-bold text-orange-300">
                  {popCount}/5
                </span>
              </div>
            </motion.div>

            {/* status */}
            <div className="bg-gradient-to-br from-[#10162e] to-[#0a0f22] border border-white/10 rounded-3xl p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">
                Current Status
              </p>

              <div className="flex items-center gap-3">
                {isReady ? (
                  <>
                    <CheckCircle2 className="text-green-400" />
                    <span className="font-bold text-green-300">
                      Totem Fully Charged
                    </span>
                  </>
                ) : isPhase2 ? (
                  <>
                    <Flame className="text-orange-400" />
                    <span className="font-bold text-orange-300">
                      Awaiting POP Spam
                    </span>
                  </>
                ) : (
                  <>
                    <Users className="text-cyan-400" />
                    <span className="font-bold text-cyan-300">
                      Awaiting Followers
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* controls */}
          <div className="mt-auto space-y-3">
            <button
              onClick={simulateFollow}
              disabled={!isPhase1}
              className="w-full h-12 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-800 disabled:text-gray-500 font-bold transition-all"
            >
              + Add Follow
            </button>

            <button
              onClick={simulatePop}
              disabled={!isPhase2}
              className="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-400 disabled:bg-gray-800 disabled:text-gray-500 font-bold transition-all"
            >
              + Add POP
            </button>

            <button
              onClick={resetTracker}
              className="w-full h-12 rounded-2xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              Reset Session
            </button>
          </div>
        </div>

        {/* CENTER */}
        <div className="flex-1 flex flex-col items-center justify-center relative px-10">
          {/* title */}
          <div className="absolute top-8 left-10">
            <h1 className="text-5xl font-black tracking-tight">
              Totem Reactor
            </h1>

            <p className="text-gray-400 mt-2 text-lg">
              Interactive live event charging system
            </p>
          </div>

          {/* center reactor */}
          <motion.div
            animate={{
              scale: isReady ? [1, 1.04, 1] : [1, 1.01, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: isReady ? 1 : 2,
            }}
            className="relative"
          >
            {/* glow */}
            <motion.div
              animate={{
                scale: isReady ? [1, 1.3, 1] : [1, 1.1, 1],
                opacity: isReady ? [0.7, 1, 0.7] : [0.3, 0.5, 0.3],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
              }}
              className={`absolute inset-0 rounded-full blur-[80px]
              ${
                isReady
                  ? "bg-yellow-400/60"
                  : isPhase2
                  ? "bg-orange-500/40"
                  : "bg-cyan-500/40"
              }`}
            />

            {/* reactor circle */}
            <div className="relative w-[420px] h-[420px] rounded-full border border-white/10 bg-[#0d1228]/90 backdrop-blur-2xl flex items-center justify-center shadow-2xl">
              {/* animated rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 15,
                  ease: "linear",
                }}
                className="absolute w-[360px] h-[360px] rounded-full border border-dashed border-white/10"
              />

              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  repeat: Infinity,
                  duration: 10,
                  ease: "linear",
                }}
                className="absolute w-[300px] h-[300px] rounded-full border border-dashed border-white/10"
              />

              {/* totem */}
              <motion.div
                animate={{
                  y: [-10, 10, -10],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut",
                }}
                className="flex flex-col items-center"
              >
                <img
                  src="./totem.png"
                  alt="Totem"
                  className="w-52 h-52 object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.35)]"
                />

                <AnimatePresence mode="wait">
                  {isReady ? (
                    <motion.div
                      key="ready"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center mt-4"
                    >
                      <h2 className="text-5xl font-black text-yellow-300 tracking-wide">
                        TAKE FLIGHT
                      </h2>

                      <p className="text-yellow-100/80 mt-2 tracking-[0.4em] uppercase text-sm">
                        Reactor Fully Charged
                      </p>
                    </motion.div>
                  ) : isPhase2 ? (
                    <motion.div
                      key="pop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center mt-4"
                    >
                      <h2 className="text-4xl font-black text-orange-300">
                        SPAM POP
                      </h2>

                      <p className="text-orange-100/70 mt-2 uppercase tracking-[0.3em] text-sm">
                        Community ignition required
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="follow"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center mt-4"
                    >
                      <h2 className="text-4xl font-black text-cyan-300">
                        CHARGE THE TOTEM
                      </h2>

                      <p className="text-cyan-100/70 mt-2 uppercase tracking-[0.3em] text-sm">
                        Waiting for followers
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[320px] border-l border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
              Live Feed
            </p>

            <h2 className="text-2xl font-black mt-2">
              Recent Activity
            </h2>
          </div>

          {/* activity card */}
          <div className="flex-1 rounded-3xl bg-[#0c1024] border border-white/10 p-5 overflow-hidden relative">
            <AnimatePresence>
              {lastAction ? (
                <motion.div
                  key={lastAction.name + lastAction.type}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`rounded-2xl p-5 border mb-4
                  ${
                    lastAction.type === "FOLLOW"
                      ? "bg-cyan-500/10 border-cyan-500/30"
                      : "bg-orange-500/10 border-orange-500/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center
                      ${
                        lastAction.type === "FOLLOW"
                          ? "bg-cyan-500/20"
                          : "bg-orange-500/20"
                      }`}
                    >
                      {lastAction.type === "FOLLOW" ? (
                        <Users className="text-cyan-300" />
                      ) : (
                        <Flame className="text-orange-300" />
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-lg">
                        {lastAction.name}
                      </h3>

                      <p className="text-sm text-gray-400">
                        {lastAction.type === "FOLLOW"
                          ? "followed the stream"
                          : 'typed "POP" in chat'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-gray-500">
                  Waiting for activity...
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* bottom card */}
          <div className="mt-5 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Rocket className="text-cyan-300" />
              <h3 className="font-bold">Mission Goal</h3>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              Reach 5 followers to unlock the POP phase. Once the
              community sends 5 POP messages, the totem launches into
              full reactor mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

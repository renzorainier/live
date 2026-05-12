"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { io } from 'socket.io-client';

// 1. IMPORT AUDIO HOOK
import { useAudio } from './useAudio';
import { subscribeToAdminCommands } from '../lib/firebase';

// Static imports
import totemImg from './totem.png';
import popGif from './pop.gif';

export default function TotemTracker() {
  // 2. INITIALIZE AUDIO
  const {
    isAudioEnabled,
    setIsAudioEnabled,
    playFollowSound,
    playPopSound,
    playExplosionSound
  } = useAudio();

  const [followCount, setFollowCount] = useState(0);
  const [popCount, setPopCount] = useState(0);
  const [avatars, setAvatars] = useState([]);
  const [isPopping, setIsPopping] = useState(false);
  const [flash, setFlash] = useState(false);

  // --- DUAL-QUEUE ARCHITECTURE ---
  const [followQueue, setFollowQueue] = useState([]);
  const [popQueue, setPopQueue] = useState([]);

  const lastAdminCommandId = useRef(null);
  const particlesRef = useRef(null);
  const MAX = 5;

  const isPhase1 = followCount < MAX;
  const isPhase2 = followCount >= MAX && popCount < MAX;
  const isReady = popCount >= MAX;

  const triggerFlash = useCallback(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
  }, []);

  const spawnParticles = useCallback((color, n, speedMult = 1) => {
    if (!particlesRef.current) return;
    const host = particlesRef.current;
    const rect = host.getBoundingClientRect();
    const cx = rect.width * 0.3;
    const cy = rect.height * 0.45;

    for (let i = 0; i < n; i++) {
      const p = document.createElement('div');
      const sz = 8 + Math.random() * 12;
      const angle = Math.random() * 360;
      const dist = 60 + Math.random() * (180 * speedMult);
      const x = cx + Math.cos((angle * Math.PI) / 180) * dist;
      const y = cy + Math.sin((angle * Math.PI) / 180) * dist;

      p.style.cssText = `
        position: absolute; width: ${sz}px; height: ${sz}px;
        background: ${color}; left: ${x}px; top: ${y}px;
        border-radius: 50%; pointer-events: none;
        box-shadow: 0 0 15px ${color};
        animation: floatP ${0.5 + Math.random() * 0.4}s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      `;
      host.appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }
  }, []);

  // --- WEBSOCKET CONNECTION ---
  useEffect(() => {
    const socket = io('http://localhost:4000');

    socket.on('connect', () => console.log('Connected to TikTok Backend!'));

    socket.on('tiktok-event', (data) => {
      if (data.type === 'FOLLOW') {
        setFollowQueue(prev => [...prev, data]);
      } else if (data.type === 'POP') {
        setPopQueue(prev => [...prev, data]);
      } else if (data.type === 'CHAT') {
        const msg = (data.text || "").toUpperCase();
        if (msg.includes('P') && msg.includes('O')) {
          setPopQueue(prev => [...prev, { type: 'POP', name: data.name }]);
        }
      }
    });

    return () => socket.disconnect();
  }, []);

  // --- SMART QUEUE PROCESSOR WITH AUDIO ---
  useEffect(() => {
    if (isPopping || isReady) return;

    const timer = setTimeout(() => {
      if (isPhase1) {
        if (popQueue.length > 0) setPopQueue([]);

        if (followQueue.length > 0) {
          const event = followQueue[0];
          setFollowQueue(prev => prev.slice(1));

          // 3. TRIGGER AUDIO: Follow
          playFollowSound();

          const newCount = followCount + 1;
          setFollowCount(newCount);
          setAvatars(prev => [...prev.slice(-4), { id: Math.random(), name: event.name, type: 'FOLLOW' }]);
          spawnParticles('#fe2c55', 15, 1.5);
          if (newCount >= MAX) triggerFlash();
        }
      } else if (isPhase2) {
        if (popQueue.length > 0) {
          const event = popQueue[0];
          setPopQueue(prev => prev.slice(1));

          // 4. TRIGGER AUDIO: Pop
          playPopSound();

          const newCount = popCount + 1;
          setPopCount(newCount);

          if (popCount === 0) setAvatars([{ id: Math.random(), name: event.name, type: 'POP' }]);
          else setAvatars(prev => [...prev.slice(-4), { id: Math.random(), name: event.name, type: 'POP' }]);

          spawnParticles('#69e9b5', 15, 1.5);
          if (newCount >= MAX) {
            triggerFlash();
            setTimeout(() => {
              spawnParticles('#fe2c55', 40, 2.5);
              spawnParticles('#ffffff', 25, 3);
              spawnParticles('#69e9b5', 25, 2.5);
            }, 100);
          }
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [followQueue, popQueue, isPhase1, isPhase2, isPopping, isReady, followCount, popCount, spawnParticles, triggerFlash, playFollowSound, playPopSound]);

  // --- CONTINUOUS EFFECTS ---
  useEffect(() => {
    let interval;
    if (isPopping) {
      interval = setInterval(() => {
        spawnParticles('#fe2c55', 6, 2.5);
        spawnParticles('#fbbf24', 4, 3);
        spawnParticles('#ffffff', 3, 3.5);
      }, 100);
    } else if (isReady) {
      interval = setInterval(() => {
        spawnParticles('#69e9b5', 2, 0.5);
        spawnParticles('#fe2c55', 1, 0.8);
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPopping, isReady, spawnParticles]);

  const queueRemoteEvents = useCallback((type, count = 1) => {
    const events = Array.from({ length: Math.max(1, Number(count) || 1) }, (_, index) => ({
      type,
      name: type === 'FOLLOW' ? `Remote Follow ${index + 1}` : `Remote POP ${index + 1}`
    }));

    if (type === 'FOLLOW') setFollowQueue(prev => [...prev, ...events]);
    else setPopQueue(prev => [...prev, ...events]);
  }, []);

  const doReset = useCallback(() => {
    if (isPopping) return;
    setIsPopping(true);
    triggerFlash();

    // 5. TRIGGER AUDIO: Explosion
    playExplosionSound();

    spawnParticles('#fe2c55', 50, 4);
    spawnParticles('#ffffff', 40, 4.5);
    spawnParticles('#fbbf24', 30, 3.5);

    setTimeout(() => {
      setFollowCount(0);
      setPopCount(0);
      setAvatars([]);
      setPopQueue([]);
      setIsPopping(false);
    }, 2200);
  }, [isPopping, triggerFlash, playExplosionSound, spawnParticles]);

  useEffect(() => {
    const unsubscribe = subscribeToAdminCommands((command) => {
      if (!command?.id || command.id === lastAdminCommandId.current) return;
      lastAdminCommandId.current = command.id;

      switch (command.type) {
        case 'RESET':
          doReset();
          break;
        case 'QUEUE_FOLLOW':
          queueRemoteEvents('FOLLOW', command.payload ?? 1);
          break;
        case 'QUEUE_POP':
          queueRemoteEvents('POP', command.payload ?? 1);
          break;
        case 'ENABLE_AUDIO':
          setIsAudioEnabled(true);
          break;
        case 'DISABLE_AUDIO':
          setIsAudioEnabled(false);
          break;
        case 'TOGGLE_AUDIO':
          setIsAudioEnabled(prev => !prev);
          break;
        default:
          break;
      }
    }, (remoteState) => {
      if (typeof remoteState.audioEnabled === 'boolean') {
        setIsAudioEnabled(remoteState.audioEnabled);
      }
    });

    return () => unsubscribe?.();
  }, [doReset, queueRemoteEvents, setIsAudioEnabled]);

  // --- DEV TOOLS MOCK ---
  const addMockEvent = (type) => {
    const data = { type, name: `User${Math.floor(Math.random() * 9999)}` };
    if (type === 'FOLLOW') setFollowQueue(prev => [...prev, data]);
    else setPopQueue(prev => [...prev, data]);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 font-sans bg-transparent relative">

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatP { 0% { opacity: 1; transform: translateY(0) scale(0.5); } 100% { opacity: 0; transform: translateY(-200px) scale(2); } }
        @keyframes pulseDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.45; transform: scale(0.8); } }
        @keyframes uiShake { 0%, 100% {transform: translate(0, 0) rotate(0deg);} 20% {transform: translate(-4px, 3px) rotate(-2deg);} 40% {transform: translate(4px, -3px) rotate(2deg);} 60% {transform: translate(-4px, -3px) rotate(0deg);} 80% {transform: translate(4px, 3px) rotate(-2deg);} }
        .shake-active { animation: uiShake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        .shake-extreme { animation: uiShake 0.2s infinite cubic-bezier(.36,.07,.19,.97) both; }
      `}} />

      <AnimatePresence>
        {flash && (
          <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="fixed inset-0 bg-white pointer-events-none z-50 mix-blend-overlay" />
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          boxShadow: isPopping ? '0 0 120px rgba(254,44,85,1)' :
                     isReady ? ['0 0 30px rgba(254,44,85,0.3)', '0 0 80px rgba(254,44,85,0.8)', '0 0 30px rgba(254,44,85,0.3)'] :
                     '0 0 0px rgba(0,0,0,0)'
        }}
        transition={{ repeat: isReady && !isPopping ? Infinity : 0, duration: 0.8 }}
        className={`relative w-[660px] h-[440px] bg-[#0a0a0a] rounded-[24px] overflow-hidden flex flex-row border border-white/10 ${flash ? 'shake-active' : ''} ${isPopping ? 'shake-extreme bg-[#1a0509]' : ''} transition-colors duration-300`}
      >
        <div ref={particlesRef} className="absolute inset-0 pointer-events-none z-10" />

        {/* --- LEFT PANEL --- */}
        <div className="w-[400px] h-full flex flex-col justify-between p-7 relative z-20">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-black text-[#fe2c55] uppercase tracking-widest drop-shadow-[0_0_8px_rgba(254,44,85,0.8)]">
              <div className="w-[8px] h-[8px] rounded-full bg-[#fe2c55] animate-[pulseDot_0.8s_infinite] shadow-[0_0_8px_#fe2c55]" />
              Live
            </div>

            <AnimatePresence>
              {followQueue.length > 0 && (!isPhase1 || isReady || isPopping) && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex gap-2">
                  <span className="text-[10px] text-white font-bold bg-[#fe2c55]/80 px-2 py-1 rounded-md shadow-[0_0_10px_rgba(254,44,85,0.5)]">
                    BANKED FOLLOWS: {followQueue.length}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              key={isPhase1 ? 'p1' : isPhase2 ? 'p2' : 'p3'}
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className={`text-[11px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full
              ${isPhase1 ? 'bg-[#fe2c55]/20 text-[#fe2c55] shadow-[0_0_10px_rgba(254,44,85,0.3)]' :
                isPhase2 ? 'bg-[#69e9b5]/20 text-[#69e9b5] shadow-[0_0_10px_rgba(105,233,181,0.3)]' :
                'bg-[#fe2c55] text-white animate-[pulseDot_1s_infinite] shadow-[0_0_15px_rgba(254,44,85,0.8)]'}`}
            >
              {isPhase1 ? 'Phase 1 — Follow' : isPhase2 ? 'Phase 2 — Spam POP' : 'Totem Charged!'}
            </motion.div>
          </div>

          <div className="w-full flex-1 flex flex-col items-center justify-center -mt-4">
            <AnimatePresence mode="wait">
              {isPopping ? (
                <motion.div key="popping" initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: 1.3, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex flex-col items-center">
                  <Image src={popGif} alt="Totem Popping!" width={160} height={160} unoptimized={true} className="object-contain drop-shadow-[0_0_50px_rgba(254,44,85,1)]" />
                  <motion.h2 animate={{ scale: [1, 1.1, 1], rotate: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 0.2 }} className="text-[32px] font-black text-[#fe2c55] tracking-widest mt-4 uppercase drop-shadow-[0_0_20px_rgba(254,44,85,1)]">TOTEM POPPED!</motion.h2>
                </motion.div>
              ) : isReady ? (
                <motion.div key="climax" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col items-center">
                  <motion.div animate={{ y: [-15, 15, -15] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="relative flex justify-center mb-6">
                    <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute w-28 h-28 bg-[#fe2c55] rounded-full blur-[30px] -z-10" />
                    <Image src={totemImg} alt="Totem" width={140} height={140} className="object-contain drop-shadow-[0_0_20px_rgba(254,44,85,0.9)]" priority={true} />
                  </motion.div>
                  <motion.div animate={{ boxShadow: ['0 0 0px rgba(254,44,85,0)', '0 0 25px rgba(254,44,85,0.8)', '0 0 0px rgba(254,44,85,0)'] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-full text-center p-4 bg-[#fe2c55]/20 border border-[#fe2c55]/50 rounded-xl relative overflow-hidden">
                    <motion.div animate={{ left: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
                    <h2 className="text-[26px] font-black text-white tracking-widest drop-shadow-[0_0_10px_rgba(254,44,85,0.9)]">TOTEM POP READY!</h2>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="labels" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
                  <motion.div animate={{ y: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="mb-6 relative">
                    <motion.div animate={{ opacity: isPhase2 ? [0.3, 0.7, 0.3] : 0, scale: isPhase2 ? [1, 1.2, 1] : 1 }} transition={{ repeat: Infinity, duration: 1 }} className="absolute inset-0 bg-[#69e9b5] rounded-full blur-[20px] -z-10" />
                    <Image src={totemImg} alt="Charging Totem" width={80} height={80} className={`object-contain transition-all duration-300 ${isPhase1 ? 'opacity-40 grayscale-[60%]' : 'opacity-100 drop-shadow-[0_0_15px_rgba(105,233,181,0.6)] scale-110'}`} />
                  </motion.div>
                  <h1 className={`text-[32px] font-black tracking-tight leading-none ${isPhase2 ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]' : 'text-white/90'}`}>
                    {isPhase1 ? 'Charge the Totem' : 'Spam POP Now!'}
                  </h1>
                  <p className={`text-[15px] mt-2 tracking-widest font-black uppercase ${isPhase2 ? 'text-[#69e9b5]' : 'text-white/40'}`}>
                    {isPhase1 ? 'Follow to charge the totem' : 'Type POP in chat to ignite!'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={`w-full transition-all duration-300 ${isPopping ? 'opacity-0 translate-y-4' : 'opacity-100'}`}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[13px] font-bold text-white/50 uppercase tracking-wider">{isPhase1 ? 'Followers' : 'POP messages'}</span>
              <motion.strong key={isPhase1 ? followCount : popCount} initial={{ scale: 2, color: '#ffffff' }} animate={{ scale: 1, color: isPhase1 ? '#fe2c55' : '#69e9b5' }} className="text-[18px] font-black drop-shadow-[0_0_8px_currentColor]">
                <span className="text-white">{isPhase1 ? followCount : popCount}</span> / {MAX}
              </motion.strong>
            </div>
            <div className="flex gap-2 w-full h-[14px]">
              {[...Array(MAX)].map((_, i) => (
                <div key={i} className="flex-1 rounded-full bg-white/10 overflow-hidden relative shadow-inner">
                  <motion.div animate={{ scaleX: i < (isPhase1 ? followCount : popCount) ? 1 : 0 }} className={`absolute inset-0 origin-left rounded-full shadow-[0_0_12px_currentColor] ${!isPhase1 ? 'bg-[#69e9b5] text-[#69e9b5]' : 'bg-[#fe2c55] text-[#fe2c55]'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: LIVE FEED --- */}
        <div className="w-[260px] h-full bg-white/[0.02] border-l border-white/10 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col relative z-20 overflow-hidden">
          <div className="w-full bg-black/40 py-3 border-b border-white/10 text-center shrink-0">
            <span className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase">Live Action Feed</span>
          </div>
          <div className={`flex-1 w-full flex flex-col gap-2.5 p-4 overflow-hidden justify-start transition-opacity duration-300 ${isPopping ? 'opacity-0' : 'opacity-100'}`}>
            <AnimatePresence>
              {avatars.length > 0 ? avatars.map((avatar, i) => (
                  <motion.div key={avatar.id} initial={{ opacity: 0, x: 50, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8, x: -50 }} className={`w-full p-2.5 px-3 rounded-xl border flex flex-col justify-center shadow-lg ${avatar.type === 'FOLLOW' ? 'bg-[#fe2c55]/10 border-[#fe2c55]/30 shadow-[#fe2c55]/10' : 'bg-[#69e9b5]/10 border-[#69e9b5]/30 shadow-[#69e9b5]/10'}`}>
                     <span className={`text-[10px] font-black uppercase tracking-widest ${avatar.type === 'FOLLOW' ? 'text-[#fe2c55]/70' : 'text-[#69e9b5]/70'}`}>{i + 1}. {avatar.type === 'FOLLOW' ? 'Followed' : 'Spammed POP'}</span>

                     {/* TEXT COLOR CHANGED TO WHITE WITH COLORED GLOW PRESERVED */}
                     <strong className={`text-[20px] leading-none font-black tracking-tight truncate mt-0.5 text-white ${avatar.type === 'FOLLOW' ? 'drop-shadow-[0_0_8px_rgba(254,44,85,0.8)]' : 'drop-shadow-[0_0_8px_rgba(105,233,181,0.8)]'}`}>{avatar.name}</strong>

                  </motion.div>
                )) : (
                <motion.div key="empty" className="w-full h-full flex items-center justify-center">
                  <span className="text-[13px] font-black text-white/20 tracking-widest uppercase text-center">Waiting for<br/>Chat Action...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* DEV CONTROLS + AUDIO TOGGLE */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-900/90 backdrop-blur-md p-4 rounded-2xl border border-gray-700 shadow-2xl z-50">
        <div className="absolute -top-3 left-4 bg-gray-800 text-xs text-gray-400 px-2 py-0.5 rounded font-mono font-bold border border-gray-600">Admin Controls</div>

        <Link href="/admin" className="w-[130px] h-[46px] rounded-xl font-black text-[14px] uppercase flex items-center justify-center transition-all bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:scale-95">
          📱 Control
        </Link>

        <div className="w-[1px] h-8 bg-gray-600 mx-2" />

        {/* 6. AUDIO UNMUTE TOGGLE */}
        <button
          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
          className={`w-[130px] h-[46px] rounded-xl font-black text-[14px] uppercase flex items-center justify-center transition-all
          ${isAudioEnabled ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:scale-95' : 'bg-gray-700 text-white/50 border border-gray-500 hover:scale-95'}`}
        >
          {isAudioEnabled ? '🔊 Audio ON' : '🔇 Audio OFF'}
        </button>

        <div className="w-[1px] h-8 bg-gray-600 mx-2" />

        <button onClick={() => addMockEvent(isPhase1 ? 'FOLLOW' : 'POP')} className={`w-[140px] h-[46px] rounded-xl font-black text-[14px] tracking-widest uppercase flex items-center justify-center transition-all ${isPhase1 ? 'bg-[#fe2c55] text-white hover:scale-95' : 'bg-[#69e9b5] text-[#0a0a0a] hover:scale-95'}`}>Queue Mock</button>
        <div className="w-[1px] h-8 bg-gray-600 mx-2" />
        <button onClick={doReset} disabled={isPopping} className={`w-[60px] h-[46px] rounded-xl flex items-center justify-center text-white/90 font-bold text-[22px] transition-all disabled:opacity-30 ${isReady ? 'bg-[#fe2c55] animate-pulse hover:scale-95' : 'bg-gray-700 border border-gray-500 hover:scale-95'}`}>↻</button>
      </div>

    </div>
  );
}

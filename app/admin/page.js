"use client";

import { useState, useEffect } from 'react';
import {
  resetTotem,
  queueRemoteFollow,
  queueRemotePop,
  toggleAudio,
  subscribeToAdminCommands
} from '../../lib/firebase';

export default function AdminPanel() {
  const [followCount, setFollowCount] = useState(1);
  const [popCount, setPopCount] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToAdminCommands(
      () => {},
      (state) => {
        if (state.audioEnabled !== null) {
          setAudioEnabled(state.audioEnabled);
        }
      }
    );
    return () => unsubscribe?.();
  }, []);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 2000);
  };

  const handleAction = async (action, successMsg, errorMsg) => {
    setLoading(true);
    try {
      await action();
      showFeedback(successMsg);
    } catch (err) {
      showFeedback(errorMsg);
    }
    setLoading(false);
  };

  const adjustCount = (value, setter, min = 1, max = 100) => {
    setter(Math.max(min, Math.min(max, value)));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-slate-900 to-black p-4 sm:p-8">
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
        .animate-pulse-subtle { animation: pulse 2s infinite; }
      `}</style>

      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8 animate-slide-in">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl">🎬</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">Totem Control</h1>
          <p className="text-gray-400 text-sm">Live remote access</p>
        </div>

        {/* Status Bar */}
        <div className="mb-8 p-4 rounded-xl bg-slate-800/50 border border-slate-700 animate-slide-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${audioEnabled ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-white font-semibold">Audio</span>
            </div>
            <span className={`text-sm font-bold ${audioEnabled ? 'text-green-400' : 'text-red-400'}`}>
              {audioEnabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Feedback Toast */}
        {feedback && (
          <div className="mb-6 p-4 rounded-xl bg-blue-500/20 border border-blue-400 text-blue-100 text-center font-semibold text-sm animate-slide-in">
            {feedback}
          </div>
        )}

        {/* Main Actions */}
        <div className="space-y-4 mb-8">
          {/* Follow Section */}
          <div className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-slide-in" style={{animationDelay: '0.1s'}}>
            <div className="text-white mb-4">
              <div className="text-sm font-semibold opacity-90 mb-1">👥 Queue Follows</div>
              <div className="text-3xl font-black">{followCount}</div>
            </div>

            {/* Counter Controls */}
            <div className="flex gap-2 mb-4">
              {[1, 5, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setFollowCount(n)}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                    followCount === n
                      ? 'bg-white text-pink-600 scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* +/- Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => adjustCount(followCount - 1, setFollowCount)}
                className="flex-1 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold"
              >
                −
              </button>
              <button
                onClick={() => adjustCount(followCount + 1, setFollowCount)}
                className="flex-1 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={() => handleAction(
                () => queueRemoteFollow(followCount),
                `✓ Queued ${followCount} follow${followCount !== 1 ? 's' : ''}!`,
                '✗ Failed'
              )}
              disabled={loading}
              className="w-full py-3 bg-white text-pink-600 font-black rounded-xl hover:bg-pink-50 disabled:opacity-50 transition-all"
            >
              {loading ? '⏳ Sending...' : '📤 Send'}
            </button>
          </div>

          {/* Pop Section */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-slide-in" style={{animationDelay: '0.2s'}}>
            <div className="text-white mb-4">
              <div className="text-sm font-semibold opacity-90 mb-1">💥 Queue POPs</div>
              <div className="text-3xl font-black">{popCount}</div>
            </div>

            {/* Counter Controls */}
            <div className="flex gap-2 mb-4">
              {[1, 5, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setPopCount(n)}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                    popCount === n
                      ? 'bg-white text-green-600 scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* +/- Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => adjustCount(popCount - 1, setPopCount)}
                className="flex-1 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold"
              >
                −
              </button>
              <button
                onClick={() => adjustCount(popCount + 1, setPopCount)}
                className="flex-1 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={() => handleAction(
                () => queueRemotePop(popCount),
                `✓ Queued ${popCount} pop${popCount !== 1 ? 's' : ''}!`,
                '✗ Failed'
              )}
              disabled={loading}
              className="w-full py-3 bg-white text-green-600 font-black rounded-xl hover:bg-green-50 disabled:opacity-50 transition-all"
            >
              {loading ? '⏳ Sending...' : '📤 Send'}
            </button>
          </div>

          {/* Audio Toggle */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-slide-in" style={{animationDelay: '0.3s'}}>
            <div className="text-white mb-4">
              <div className="text-sm font-semibold opacity-90 mb-1">🔊 Audio</div>
              <div className="text-2xl font-black">{audioEnabled ? 'Enabled' : 'Disabled'}</div>
            </div>

            <button
              onClick={() => handleAction(
                () => toggleAudio(),
                `✓ Audio ${audioEnabled ? 'disabled' : 'enabled'}!`,
                '✗ Failed'
              )}
              disabled={loading}
              className="w-full py-3 bg-white text-yellow-600 font-black rounded-xl hover:bg-yellow-50 disabled:opacity-50 transition-all"
            >
              {loading ? '⏳ Toggling...' : '⚡ Toggle'}
            </button>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => handleAction(
              () => resetTotem(),
              '✓ Totem reset!',
              '✗ Failed'
            )}
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-black py-4 rounded-2xl hover:shadow-xl disabled:opacity-50 transition-all animate-slide-in shadow-lg"
            style={{animationDelay: '0.4s'}}
          >
            {loading ? '⏳ Resetting...' : '🔴 EMERGENCY RESET'}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>Sync: Firebase Firestore</p>
          <p className="mt-1">Keep this open on another device</p>
        </div>
      </div>
    </div>
  );
}

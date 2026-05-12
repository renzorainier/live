"use client";

import { useState, useEffect } from 'react';
import {
  resetTotem,
  queueRemoteFollow,
  queueRemotePop,
  toggleAudio,
  enableAudio,
  disableAudio,
  setAudioState,
  subscribeToAdminCommands
} from '../../lib/firebase';

export default function AdminPanel() {
  const [followCount, setFollowCount] = useState(1);
  const [popCount, setPopCount] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Listen for state changes
  useEffect(() => {
    const unsubscribe = subscribeToAdminCommands(
      () => {}, // We don't need command callbacks here
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

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetTotem();
      showFeedback('✓ Totem reset!');
    } catch (err) {
      showFeedback('✗ Failed to reset');
    }
    setLoading(false);
  };

  const handleQueueFollows = async () => {
    setLoading(true);
    try {
      await queueRemoteFollow(followCount);
      showFeedback(`✓ Queued ${followCount} follow(s)!`);
    } catch (err) {
      showFeedback('✗ Failed to queue follows');
    }
    setLoading(false);
  };

  const handleQueuePops = async () => {
    setLoading(true);
    try {
      await queueRemotePop(popCount);
      showFeedback(`✓ Queued ${popCount} pop(s)!`);
    } catch (err) {
      showFeedback('✗ Failed to queue pops');
    }
    setLoading(false);
  };

  const handleToggleAudio = async () => {
    setLoading(true);
    try {
      await toggleAudio();
      showFeedback(`✓ Audio ${audioEnabled ? 'disabled' : 'enabled'}!`);
    } catch (err) {
      showFeedback('✗ Failed to toggle audio');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Totem Control Panel</h1>
          <p className="text-gray-400">Control the totem overlay from any device</p>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-400 rounded-lg text-blue-100 font-semibold text-center">
            {feedback}
          </div>
        )}

        {/* Control Grid */}
        <div className="space-y-6">
          {/* Reset Section */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-red-500/50 transition-colors">
            <h2 className="text-xl font-bold text-white mb-4">Emergency Reset</h2>
            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-bold rounded-lg transition-colors"
            >
              {loading ? 'Resetting...' : 'RESET TOTEM'}
            </button>
          </div>

          {/* Queue Follows Section */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-pink-500/50 transition-colors">
            <h2 className="text-xl font-bold text-white mb-4">Queue Follows</h2>
            <div className="flex gap-4 items-center">
              <input
                type="number"
                min="1"
                max="100"
                value={followCount}
                onChange={(e) => setFollowCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={handleQueueFollows}
                disabled={loading}
                className="flex-1 py-2 px-6 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-600 text-white font-bold rounded-lg transition-colors"
              >
                {loading ? 'Queueing...' : 'Queue'}
              </button>
            </div>
          </div>

          {/* Queue Pops Section */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-green-500/50 transition-colors">
            <h2 className="text-xl font-bold text-white mb-4">Queue POPs</h2>
            <div className="flex gap-4 items-center">
              <input
                type="number"
                min="1"
                max="100"
                value={popCount}
                onChange={(e) => setPopCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-green-500"
              />
              <button
                onClick={handleQueuePops}
                disabled={loading}
                className="flex-1 py-2 px-6 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-bold rounded-lg transition-colors"
              >
                {loading ? 'Queueing...' : 'Queue'}
              </button>
            </div>
          </div>

          {/* Audio Section */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-yellow-500/50 transition-colors">
            <h2 className="text-xl font-bold text-white mb-4">Audio Control</h2>
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">
                Audio: <span className={audioEnabled ? 'text-green-400' : 'text-red-400'}>
                  {audioEnabled ? 'ON' : 'OFF'}
                </span>
              </span>
              <button
                onClick={handleToggleAudio}
                disabled={loading}
                className="py-2 px-8 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-600 text-white font-bold rounded-lg transition-colors"
              >
                {loading ? 'Toggling...' : 'TOGGLE'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-700 text-center">
          <p className="text-gray-500 text-sm">
            Commands are sent live via Firebase Realtime Database.
            <br />
            Open the main totem display on your primary device and use these controls from another device.
          </p>
        </div>
      </div>
    </div>
  );
}

import React from "react";

export default function BackgroundPanel() {
  return (
    // transparent glass panel so background image shows through
    <div className="relative text-white p-10 flex items-center">
      {/* glass card (fills the right side) */}
      {/* <div className="w-full rounded-r-2xl p-8 backdrop-blur-lg bg-white/8 border border-white/10"> */}
        <div className="max-w-lg ml-6">
          <div className="mb-3">
            <span className="px-3 py-1 text-xs font-semibold bg-white/12 rounded-full">
              ✨ AI-Powered Security
            </span>
          </div>

          <h2 className="text-3xl font-extrabold mb-4 leading-tight">
            Adaptive Security,
            <br /> Simplified
          </h2>

          <p className="text-white/85 mb-6 leading-relaxed">
            Experience dynamic cryptography powered by machine-learning intrusion
            detection. AdaptiveKeyShield continuously monitors for anomalies and
            secures your data with real-time key rotation.
          </p>

          {/* feature boxes : translucent cards */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/7 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-lg">
                🧠
              </div>
              <div>
                <p className="font-semibold text-white">AI Insights</p>
                <p className="text-sm text-white/80">Detect anomalies in real time</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/7 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-lg">
                🔐
              </div>
              <div>
                <p className="font-semibold text-white">Key Rotation</p>
                <p className="text-sm text-white/80">Automatic adaptive encryption</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/7 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-lg">
                ⚡
              </div>
              <div>
                <p className="font-semibold text-white">Performance</p>
                <p className="text-sm text-white/80">Lightweight, scalable security</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/70 mt-10">© 2025 AdaptiveKeyShield. All rights reserved.</p>
        </div>
      </div>
    //</div>
  );
}

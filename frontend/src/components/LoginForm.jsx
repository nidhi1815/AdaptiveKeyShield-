import React, { useState } from "react";

export default function LoginForm() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    // integration point
    console.log({ userId, password });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-6">
        <img src="https://png.pngtree.com/png-vector/20250820/ourlarge/pngtree-green-and-white-circular-badge-with-secure-payment-text-lock-icon-png-image_17048788.webp" alt="logo" className="h-10 w-10 mx-auto mb-2" />
        <h1 className="text-2xl font-bold text-cyan-600">AdaptiveKeyShield</h1>
        <p className="text-sm text-gray-500">Your AI-driven security companion</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">User ID</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md text-gray-800 border-gray-200 focus:ring-2 focus:ring-cyan-400"
            placeholder="Enter your user ID"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="mt-1 block w-full px-3 py-2 border rounded-md text-gray-800 border-gray-200 focus:ring-2 focus:ring-cyan-400"
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="flex justify-end">
          <a className="text-sm text-cyan-600" href="#">Forgot Password?</a>
        </div>

        <button className="w-full py-2 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold">
          Login
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Don’t have an account? <a href="#" className="text-cyan-600">Create one</a>
      </p>

      <div className="mt-6 text-center text-xs text-gray-400">🔒 Bank-grade security · 256-bit encryption</div>
    </div>
  );
}

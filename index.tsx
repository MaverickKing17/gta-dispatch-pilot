
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("Bootstrap: Initializing GTA Dispatch Pilot...");

const mountNode = document.getElementById('root');
if (mountNode) {
  try {
    const root = createRoot(mountNode);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Bootstrap: React Mounted Successfully.");
  } catch (err) {
    console.error("Bootstrap Error:", err);
    mountNode.innerHTML = `<div style="padding: 20px; color: #F97316; font-family: sans-serif; text-align: center;">
      <h1 style="font-weight: 900;">SYSTEM BOOT FAILURE</h1>
      <p style="color: white;">Please check the browser console for details.</p>
    </div>`;
  }
} else {
  console.error("Critical: Could not find mount point #root");
}

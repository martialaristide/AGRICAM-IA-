import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// === Apply persisted theme BEFORE React renders to avoid flicker (FOUC) ===
try {
  const savedTheme = localStorage.getItem("agricam_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  if (savedTheme === "light") {
    document.documentElement.style.colorScheme = "light";
    document.body && (document.body.style.backgroundColor = "#ffffff");
  } else {
    document.documentElement.style.colorScheme = "dark";
  }
} catch (e) { /* localStorage unavailable */ }

// Register Service Worker for PWA / Offline mode
// IMPORTANT: We auto-update + claim clients, and unregister stale SWs to avoid splash/cache lock
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")
      .then((reg) => {
        console.log("[PWA] Service Worker registered:", reg.scope);
        // Always check for updates on every load
        reg.update();
        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New SW available — reload to use fresh bundle
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((err) => console.warn("[PWA] SW registration failed:", err));

    // If the controller changes (after skipWaiting), reload once
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

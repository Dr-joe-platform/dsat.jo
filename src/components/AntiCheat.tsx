"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function AntiCheat() {
  const { appUser } = useAuth();

  useEffect(() => {
    // Only apply to students
    if (!appUser || appUser.role !== 'student') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        alert("Screenshots are disabled for security reasons.");
        navigator.clipboard.writeText(""); // Clear clipboard
      }
      // Mac Shift+Cmd+3 or 4
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "s" || e.key === "S")) {
        e.preventDefault();
        alert("Screenshots are disabled for security reasons.");
      }
      // Ctrl+P / Cmd+P
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        alert("Printing is disabled.");
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("Copying content is disabled.");
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("copy", handleCopy);

    // Dynamic style to disable text selection and dragging
    const style = document.createElement("style");
    style.innerHTML = `
      body {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
      img {
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("copy", handleCopy);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [appUser]);

  return null;
}

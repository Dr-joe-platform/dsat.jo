"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";

export default function VocabularyPopover() {
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties | null>(null);
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPopoverStyle(null);
        return;
      }
      
      const text = selection.toString().trim();
      if (text.length === 0 || text.split(" ").length > 5) { // Only single words or short phrases
        setPopoverStyle(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setPopoverStyle({
        position: "fixed",
        top: `${rect.top - 40}px`, // Place above the selection
        left: `${rect.left + rect.width / 2}px`,
        transform: "translateX(-50%)",
        zIndex: 9999,
      });
      setSelectedText(text);
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // MOCK SAVE: In the future this should call an API endpoint to save to a database.
    console.log("Saving to vocabulary:", selectedText);
    alert(`Saved "${selectedText}" to vocabulary!`);

    // Clear selection after adding
    window.getSelection()?.removeAllRanges();
    setPopoverStyle(null);
  };

  if (!popoverStyle) return null;

  return (
    <button
      onMouseDown={handleAdd} // use onMouseDown to prevent selection from clearing on blur
      style={{
        ...popoverStyle,
        background: "#0f172a",
        color: "#fff",
        border: "none",
        borderRadius: "0.5rem",
        padding: "0.4rem 0.8rem",
        fontSize: "0.85rem",
        fontWeight: "600",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      }}
    >
      <Plus size={14} /> Add to vocabulary
    </button>
  );
}

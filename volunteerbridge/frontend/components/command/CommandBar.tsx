/**
 * CommandBar — Cmd+K command palette for the VolunteerBridge coordinator dashboard.
 * Provides instant navigation, filtering, and AI-powered natural language commands.
 */

"use client";

import { useRef, useEffect, useCallback } from "react";
import { Search, MapPin, Filter, Zap, CornerDownLeft } from "lucide-react";
import { useCommandBar } from "@/hooks/useCommandBar";
import CommandResultRow, { AiLoadingDots, AiResponseCard } from "./CommandResult";

function getCategoryIcon(icon: string, color: string) {
  const size = 14;
  switch (icon) {
    case "MapPin": return <MapPin size={size} color={color} />;
    case "Filter": return <Filter size={size} color={color} />;
    case "Zap": return <Zap size={size} color={color} />;
    default: return <MapPin size={size} color={color} />;
  }
}

export default function CommandBar() {
  const {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    results,
    loading,
    selectedIndex,
    setSelectedIndex,
    executeCommand,
    defaultSuggestions,
    flatSuggestions,
    aiResponse,
  } = useCommandBar();

  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Keyboard navigation inside the modal
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = query.trim() ? results : flatSuggestions;
      const count = items.length;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(count, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + Math.max(count, 1)) % Math.max(count, 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (count > 0 && selectedIndex < count) {
          executeCommand(items[selectedIndex]);
        }
      }
    },
    [query, results, flatSuggestions, selectedIndex, setSelectedIndex, executeCommand]
  );

  // Click outside to close
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        setIsOpen(false);
      }
    },
    [setIsOpen]
  );

  if (!isOpen) return null;

  const showSuggestions = !query.trim() && !aiResponse;
  const showResults = query.trim() && results.length > 0;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 100,
          animation: "cmdFadeIn 150ms ease-out",
        }}
      >
        {/* Modal */}
        <div
          onKeyDown={handleKeyDown}
          style={{
            position: "fixed",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "580px",
            maxWidth: "calc(100vw - 32px)",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
            animation: "cmdScaleIn 150ms ease-out",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search Input */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              height: "56px",
              padding: "0 20px",
              borderBottom: "1px solid #E2E8F0",
              gap: "12px",
            }}
          >
            <Search size={20} color="#94A3B8" style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "16px",
                color: "#1A202C",
                backgroundColor: "transparent",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            />
            <span
              style={{
                backgroundColor: "#F1F5F9",
                color: "#64748B",
                fontSize: "11px",
                padding: "2px 6px",
                borderRadius: "4px",
                fontFamily: "monospace",
                flexShrink: 0,
                border: "1px solid #E2E8F0",
              }}
            >
              ESC
            </span>
          </div>

          {/* Content Area */}
          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              padding: "8px 0",
            }}
          >
            {/* AI Response Card (shown inline) */}
            {aiResponse && <AiResponseCard response={aiResponse} />}

            {/* Default Suggestions (when input is empty) */}
            {showSuggestions && (
              <>
                {defaultSuggestions.map((group, gi) => {
                  // Calculate offset for global index
                  const offset = defaultSuggestions.slice(0, gi).reduce((s, g) => s + g.items.length, 0);

                  return (
                    <div key={group.category}>
                      {/* Category Header */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 20px 4px",
                          marginTop: gi > 0 ? "4px" : "0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "22px",
                            height: "22px",
                            borderRadius: "6px",
                            backgroundColor: group.color + "14",
                          }}
                        >
                          {getCategoryIcon(group.icon, group.color)}
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {group.category}
                        </span>
                      </div>

                      {/* Suggestion Items */}
                      {group.items.map((item, ii) => {
                        const globalIdx = offset + ii;
                        const isSelected = globalIdx === selectedIndex;
                        return (
                          <div
                            key={item.text}
                            onClick={() => executeCommand(item.action)}
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: "12px",
                              padding: "8px 20px",
                              cursor: "pointer",
                              backgroundColor: isSelected ? "#EFF6FF" : "transparent",
                              transition: "background-color 0.1s ease",
                            }}
                            onMouseEnter={(e) => {
                              setSelectedIndex(globalIdx);
                              if (!isSelected) e.currentTarget.style.backgroundColor = "#F8FAFC";
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            <span style={{ fontSize: "14px", color: "#1A202C", flex: 1 }}>
                              {item.text}
                            </span>
                            <CornerDownLeft size={14} color="#CBD5E1" style={{ flexShrink: 0 }} />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            )}

            {/* Loading */}
            {loading && <AiLoadingDots />}

            {/* Parsed Results */}
            {showResults &&
              !loading &&
              results.map((action, i) => (
                <CommandResultRow
                  key={i}
                  action={action}
                  isSelected={i === selectedIndex}
                  onExecute={() => executeCommand(action)}
                />
              ))}

            {/* Empty state */}
            {query.trim() && !loading && results.length === 0 && !aiResponse && (
              <div style={{ padding: "24px 20px", textAlign: "center" }}>
                <p style={{ fontSize: "14px", color: "#64748B", margin: 0 }}>
                  No commands found. Try asking in natural language.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              height: "36px",
              padding: "0 16px",
              borderTop: "1px solid #F1F5F9",
            }}
          >
            <div style={{ display: "flex", gap: "12px" }}>
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>↑↓ navigate</span>
              <span style={{ fontSize: "11px", color: "#CBD5E1" }}>·</span>
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>↵ select</span>
              <span style={{ fontSize: "11px", color: "#CBD5E1" }}>·</span>
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>esc close</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "13px", color: "#CBD5E1" }}>✦</span>
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>Powered by Gemini AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes cmdFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cmdScaleIn {
          from { opacity: 0; transform: translateX(-50%) scale(0.95); }
          to { opacity: 1; transform: translateX(-50%) scale(1); }
        }
      `}</style>
    </>
  );
}

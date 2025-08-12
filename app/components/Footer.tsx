import React from "react";

export function Footer() {
  return (
    <footer className="mt-12 pt-8 border-t border-neutral-700">
      <div className="text-center">
        <p className="text-neutral-400 text-sm">
          Built with{" "}
          <span className="text-red-400 animate-pulse">❤️</span>{" "}
          by{" "}
          <a
            className="text-emerald-400 hover:text-emerald-300 underline transition-colors"
            href="https://github.com/engageintellect"
            target="_blank"
            rel="noopener noreferrer"
          >
            @engageintellect
          </a>
        </p>
        <p className="text-neutral-500 text-xs mt-2">
          Open source • Guitar scales made simple
        </p>
      </div>
    </footer>
  );
}

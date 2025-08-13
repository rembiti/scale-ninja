import React from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";

export function Header() {
  return (
    <div className="mb-4 animate-fade-in relative">
      <Link
        href="/"
        className="text-5xl md:text-6xl text-neutral-100 mb-2 flex items-center gap-4 group"
      >
        <Icon
          icon="game-icons:guitar-head"
          className="w-12 h-12 md:w-16 md:h-16 text-emerald-500 transition-all duration-300 group-hover:rotate-12 group-hover:scale-105"
        />
        <span className="transition-all duration-300 group-hover:text-emerald-400">
          scale-ninja
        </span>
      </Link>

      {/* GitHub Link */}
      <Link
        href="https://github.com/engageintellect/scale-ninja"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-0 right-0 p-2 text-neutral-400 hover:text-emerald-400 transition-all duration-300 transform hover:scale-110 group"
        aria-label="View source code on GitHub"
      >
        <Icon
          icon="mdi:github"
          className="w-8 h-8 transition-all duration-300 group-hover:rotate-12"
        />
      </Link>
    </div>
  );
}

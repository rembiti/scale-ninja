import React from "react";
import { Icon } from "@iconify/react";

export function Header() {
  return (
    <div className="mb-4">
      <h1 className="text-5xl md:text-6xl text-neutral-100 mb-2 flex items-center gap-4">
        <Icon
          icon="game-icons:guitar-head"
          className="w-12 h-12 md:w-16 md:h-16 text-emerald-500"
        />
        scale-ninja
      </h1>
    </div>
  );
}

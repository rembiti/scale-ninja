import React from "react";
import {
  ScaleKind,
  Position,
  Position5,
  PositionCAGED,
  POSITION_LABELS,
  CAGED_LABELS,
  NOTE_NAMES_SHARP,
  NOTE_NAMES_FLAT,
} from "./types";

interface KeyDisplayProps {
  selectedKey: string;
  selectedScale: ScaleKind;
  selectedMode: "3nps" | "full" | "pent5" | "hex5" | "caged";
  selectedPosition: Position;
  selectedBox: Position5;
  selectedCAGEDShape: PositionCAGED;
  useFlats: boolean;
}

export function KeyDisplay({
  selectedKey,
  selectedScale,
  selectedMode,
  selectedPosition,
  selectedBox,
  selectedCAGEDShape,
  useFlats,
}: KeyDisplayProps) {
  // Helper function to get relative major/minor key
  const getRelativeKey = (key: string, scale: ScaleKind): string => {
    const noteNames = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
    const keyIndex = noteNames.findIndex(note => note === key);
    
    if (keyIndex === -1) return key; // Fallback if key not found
    
    if (scale === "major") {
      // Relative minor is 3 semitones down (9 semitones up in 12-tone system)
      const relativeIndex = (keyIndex + 9) % 12;
      return noteNames[relativeIndex];
    } else {
      // Relative major is 3 semitones up
      const relativeIndex = (keyIndex + 3) % 12;
      return noteNames[relativeIndex];
    }
  };

  const relativeKey = getRelativeKey(selectedKey, selectedScale);
  const relativeScale = selectedScale === "major" ? "minor" : "major";

  return (
    <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-700 mb-6">
      <div className="flex items-center justify-between">
        {/* Left side - Key information */}
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">
              {selectedKey}
            </div>
            <div className="text-lg font-semibold text-emerald-300 mt-1">
              {selectedScale === "major" ? "Major" : "Minor"}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Current Key
            </div>
          </div>
          
          <div className="text-neutral-600 text-3xl font-light">|</div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-neutral-300">
              {relativeKey}
            </div>
            <div className="text-lg font-semibold text-neutral-400 mt-1">
              {relativeScale === "major" ? "Major" : "Minor"}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Relative {relativeScale === "major" ? "Major" : "Minor"}
            </div>
          </div>
        </div>

        {/* Right side - Mode information */}
        <div className="text-right">
          <div className="text-lg font-semibold text-neutral-300">
            {selectedMode === "3nps" && `Position ${selectedPosition + 1}`}
            {(selectedMode === "pent5" || selectedMode === "hex5") && `Box ${selectedBox + 1}`}
            {selectedMode === "caged" && `${CAGED_LABELS[selectedCAGEDShape]}`}
            {selectedMode === "full" && "Full Neck"}
          </div>
          <div className="text-sm text-neutral-400 mt-1">
            {selectedMode === "3nps" && POSITION_LABELS[selectedPosition]}
            {selectedMode === "pent5" && "Pentatonic Scale"}
            {selectedMode === "hex5" && "Hexatonic Scale"}
            {selectedMode === "caged" && "CAGED System"}
            {selectedMode === "full" && "Complete Fretboard"}
          </div>
          <div className="text-xs text-neutral-500 mt-1 capitalize">
            {selectedMode === "3nps" ? "3 Notes Per String" : selectedMode === "caged" ? "Chord Shape" : selectedMode.replace(/\d/, " ")} Mode
          </div>
        </div>
      </div>
    </div>
  );
}

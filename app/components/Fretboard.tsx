"use client";

import React, { useState, useEffect } from 'react';
import { ScaleKind, ScalePoint, NOTE_NAMES_SHARP, NOTE_NAMES_FLAT, SCALE_STEPS, MINOR_PENT_STEPS, MINOR_HEX_STEPS } from './types';

interface FretboardProps {
  points: ScalePoint[];
  minFret: number;
  maxFret: number;
  keyPc: number;
  scale: ScaleKind;
  labelMode: "note" | "degree";
  useFlats: boolean;
  mode: "3nps" | "full" | "pent5" | "hex5" | "caged";
}

export function Fretboard({
  points,
  minFret,
  maxFret,
  keyPc,
  scale,
  labelMode,
  useFlats,
  mode,
}: FretboardProps) {
  const [dimensions, setDimensions] = useState({ bubbleR: 20, fretW: 48, padL: 60, padR: 20 });

  useEffect(() => {
    const calculateOptimalSizing = () => {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') return;
      
      const viewportWidth = window.innerWidth;
      const containerPadding = 32; // Account for page container padding
      const availableWidth = viewportWidth - containerPadding;
      
      // Determine fret count based on pattern and mode
      const baseFretCount = Math.max(12, maxFret) - minFret + 1;
      const isDesktop = viewportWidth >= 1024;
      const displayFretCount = isDesktop ? 22 : baseFretCount;
      
      // Calculate optimal dimensions
      let padL, padR, bubbleR, fretW;
      
      if (viewportWidth >= 1024) {
        // Desktop: prioritize readability
        padL = 60;
        padR = 20;
        bubbleR = 20;
        fretW = 48;
      } else if (viewportWidth >= 768) {
        // Tablet: balanced approach
        padL = 50;
        padR = 20;
        const remainingWidth = availableWidth - padL - padR;
        fretW = Math.max(42, Math.min(52, remainingWidth / displayFretCount));
        bubbleR = 18; // Fixed size, slightly smaller than desktop
      } else {
        // Mobile: use fixed small bubbles, maximize fret space
        padL = 15;
        padR = 5;
        const remainingWidth = availableWidth - padL - padR;
        fretW = Math.max(28, Math.min(40, remainingWidth / displayFretCount));
        bubbleR = 16; // Fixed size, smaller than desktop but readable
      }
      
      setDimensions({ bubbleR, fretW, padL, padR });
    };

    // Initial calculation with a small delay to ensure DOM is ready
    const timer = setTimeout(calculateOptimalSizing, 100);
    
    const handleResize = () => calculateOptimalSizing();
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [minFret, maxFret, mode]); // Recalculate when pattern changes

  const { bubbleR, fretW, padL, padR } = dimensions;
  const NOTE_R = bubbleR;
  const stringCount = 6;
  const padV = 30;
  const padBottom = 80;
  
  // Ensure enough vertical space so circles never overlap on Y axis
  const minStringGap = NOTE_R * 2 + 16; // diameter + even larger margin for mobile
  const baseHeight = 320;
  const requiredHeight = padV + padBottom + (stringCount - 1) * minStringGap;
  const height = Math.max(baseHeight, requiredHeight);
  
  // Calculate display parameters
  const baseFretCount = Math.max(12, maxFret) - minFret + 1;
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const displayMinFret = isDesktop ? 0 : minFret;
  const displayFretCount = isDesktop ? 22 : baseFretCount;
  const innerW = displayFretCount * fretW;
  const width = padL + padR + innerW;
  const stringH = (height - padV - padBottom) / (stringCount - 1);

  const pcToName = (pc: number) =>
    useFlats ? NOTE_NAMES_FLAT[pc] : NOTE_NAMES_SHARP[pc];
  const visY = (s: number) => (stringCount - 1 - s) * stringH + padV; // player view (low-E bottom)

  const strokeNut = "#aaa",
    strokeFret = "#333",
    strokeString = "#777";

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="shrink-0"
      >
        {/* Fret spaces background (shade open-string space) */}
        <g transform={`translate(${padL},0)`}>
          {Array.from({ length: displayFretCount }, (_, i) => {
            const x = i * fretW;
            const isOpenSpace = displayMinFret === 0 && i === 0;
            return (
              <rect
                key={`bg-${i}`}
                x={x}
                y={padV}
                width={fretW}
                height={height - padV - padBottom}
                className={
                  isOpenSpace ? "fill-neutral-400" : "fill-transparent"
                }
                rx={4}
              />
            );
          })}
        </g>

        {/* Frets */}
        <g transform={`translate(${padL},0)`}>
          <line
            x1={0}
            y1={padV}
            x2={0}
            y2={height - padBottom}
            stroke={strokeNut}
            strokeWidth={minFret === 0 ? 4 : 2}
          />
          {Array.from({ length: displayFretCount }, (_, i) => {
            const x = (i + 1) * fretW;
            return (
              <line
                key={i}
                x1={x}
                y1={padV}
                x2={x}
                y2={height - padBottom}
                stroke={strokeFret}
              />
            );
          })}
          {Array.from({ length: displayFretCount }, (_, i) => {
            // Label each fret space by its starting fret number (centered in the space)
            const fret = displayMinFret + i;
            const x = i * fretW + fretW / 2;
            return (
              <text
                key={i}
                x={x}
                y={height - 20}
                className="fill-neutral-300 text-xl md:text-2xl font-bold"
                textAnchor="middle"
              >
                {fret}
              </text>
            );
          })}
        </g>

        {/* Strings */}
        <g transform={`translate(${padL},0)`}>
          {Array.from({ length: stringCount }, (_, s) => (
            <line
              key={s}
              x1={0}
              y1={visY(s)}
              x2={innerW}
              y2={visY(s)}
              stroke={strokeString}
              strokeWidth={1 + (stringCount - 1 - s) * 0.2}
            />
          ))}
        </g>

        {/* Notes moved to HTML overlay */}
      </svg>
      {/* HTML overlay for note bubbles */}
      <div
        className="absolute top-0 left-0 z-10 pointer-events-none"
        style={{ width, height }}
      >
        {points.map((p, i) => {
          // Center each bubble in its fret space
          const x = padL + (p.fret - displayMinFret + 0.5) * fretW;
          const y = visY(p.string);
          const isRoot = p.pc === keyPc;
          const currentSteps =
            mode === "pent5"
              ? MINOR_PENT_STEPS
              : mode === "hex5"
              ? MINOR_HEX_STEPS
              : SCALE_STEPS[scale];
          const label =
            labelMode === "degree"
              ? (() => {
                  const len = currentSteps.length;
                  const zeroIdx = currentSteps.indexOf(0);
                  const degNum = ((p.degreeIdx - zeroIdx + len) % len) + 1;
                  return String(degNum);
                })()
              : pcToName(p.pc);

          // In CAGED mode, make chord tones larger and with different styling
          const isChordTone = p.isChordTone;
          const chordToneMultiplier = isChordTone && mode === "caged" ? 1.3 : 1;
          const adjustedBubbleR = bubbleR * chordToneMultiplier;
          const borderStyle = isChordTone && mode === "caged" 
            ? { border: '2px solid #fff', boxShadow: '0 0 8px rgba(255,255,255,0.5)' }
            : {};

          return (
            <div
              key={i}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full text-neutral-100 font-semibold select-none ${
                isRoot ? "bg-emerald-500" : "bg-zinc-600/90"
              }`}
              style={{ 
                left: x, 
                top: y,
                width: `${adjustedBubbleR * 2}px`,
                height: `${adjustedBubbleR * 2}px`,
                fontSize: `${Math.max(10, adjustedBubbleR * 0.7)}px`,
                ...borderStyle
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React, { useMemo, useState, useEffect } from "react";

/** Tailwind-only • Player view (low-E at bottom) • Correct 3NPS • 7 positions */

type ScaleKind = "major" | "minor";
type Position = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Ionian..Locrian

const NOTE_NAMES_SHARP = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;
const NOTE_NAMES_FLAT = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

// Standard tuning low→high: E2 A2 D3 G3 B3 E4
const OPEN_STRINGS_MIDI = [40, 45, 50, 55, 59, 64] as const;
const OPEN_STRINGS_PC = OPEN_STRINGS_MIDI.map(
  (m) => ((m % 12) + 12) % 12
) as number[];

// Scale steps (semitones from tonic)
const SCALE_STEPS: Record<ScaleKind, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11], // Ionian
  minor: [0, 2, 3, 5, 7, 8, 10], // Aeolian (natural minor)
};

// Intervals between adjacent strings in semitones (E→A=5, A→D=5, D→G=5, G→B=4, B→e=5)
const STRING_INTERVALS = [5, 5, 5, 4, 5];

// UI data
const ALL_KEYS = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
];
const POSITION_LABELS = [
  "Ionian",
  "Dorian",
  "Phrygian",
  "Lydian",
  "Mixolydian",
  "Aeolian",
  "Locrian",
];

/* ------------------------------ helpers ------------------------------ */

function keyToPc(key: string): number {
  const map: Record<string, number> = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };
  return map[key];
}

function nearestFretForPcOnString(
  targetPc: number,
  stringIdx: number,
  approxFret: number
): number {
  const openPc = OPEN_STRINGS_PC[stringIdx];
  const base = (targetPc - openPc + 120) % 12; // 0..11
  let best = base,
    dist = Math.abs(base - approxFret);
  for (let k = -2; k <= 3; k++) {
    const f = base + 12 * k;
    if (f < 0) continue;
    const d = Math.abs(f - approxFret);
    if (d < dist) {
      dist = d;
      best = f;
    }
  }
  return best;
}

/** Build a single 3NPS shape for key/scale at modal offset `position` (0..6) */
function build3NPS(
  keyPc: number,
  scale: ScaleKind,
  position: Position,
  anchorLowEFret = 5
): { string: number; fret: number; pc: number; degreeIdx: number }[] {
  const steps = SCALE_STEPS[scale];
  const degrees = Array.from({ length: 18 }, (_, j) => (position + j) % 7); // 6 strings × 3 notes

  // First note on low E close to anchor
  const firstPc = (keyPc + steps[degrees[0]]) % 12;
  const firstFret = nearestFretForPcOnString(firstPc, 0, anchorLowEFret);

  const out: { string: number; fret: number; pc: number; degreeIdx: number }[] =
    [];
  let expectedFret = firstFret;

  for (let j = 0; j < 18; j++) {
    const s = Math.floor(j / 3); // string index (0 = low E)
    const d = degrees[j];
    const pc = (keyPc + steps[d]) % 12;

    if (j > 0 && j % 3 === 0) {
      // move to next string: shift expected fret by string interval (approx position mapping)
      expectedFret -= STRING_INTERVALS[s - 1];
    } else if (j > 0) {
      // next note on same string: typically ~2 frets up
      expectedFret += 2;
    }

    const fret = nearestFretForPcOnString(pc, s, expectedFret);
    expectedFret = fret;
    out.push({ string: s, fret, pc, degreeIdx: d });
  }

  return out;
}

/** Build full-neck set (all positions) */
function buildFullNeck(
  keyPc: number,
  scale: ScaleKind,
  maxFret = 21
): { string: number; fret: number; pc: number; degreeIdx: number }[] {
  const steps = SCALE_STEPS[scale];
  const pcs = steps.map((d) => (keyPc + d) % 12);
  const out: { string: number; fret: number; pc: number; degreeIdx: number }[] =
    [];
  for (let s = 0; s < 6; s++) {
    for (let f = 0; f <= maxFret; f++) {
      const pc = (OPEN_STRINGS_PC[s] + f) % 12;
      const idx = pcs.indexOf(pc);
      if (idx !== -1) out.push({ string: s, fret: f, pc, degreeIdx: idx });
    }
  }
  return out;
}

/* ---------------------------------- UI ---------------------------------- */

export default function Page() {
  const [keyName, setKeyName] = useState("A");
  const [scale, setScale] = useState<ScaleKind>("major");
  const [mode, setMode] = useState<"3nps" | "full">("3nps");
  const [useFlats, setUseFlats] = useState(false);
  const [labelMode, setLabelMode] = useState<"note" | "degree">("degree");
  const [position, setPosition] = useState<Position>(0); // Ionian

  const keyPc = keyToPc(keyName);

  const points = useMemo(() => {
    if (mode === "3nps") return build3NPS(keyPc, scale, position, 5);
    return buildFullNeck(keyPc, scale, 21);
  }, [keyPc, scale, mode, position]);

  const minFret = useMemo(
    () => Math.max(0, Math.min(...points.map((p) => p.fret)) - 1),
    [points]
  );
  const maxFret = useMemo(
    () => Math.max(...points.map((p) => p.fret)) + 1,
    [points]
  );

  // quick sanity tests once
  useEffect(() => {
    const lowE = build3NPS(keyToPc("A"), "major", 0, 5)
      .filter((p) => p.string === 0)
      .map((p) => p.fret);
    if (JSON.stringify(lowE) !== JSON.stringify([5, 7, 9])) {
      console.warn("Expected A major Ionian on low-E to be [5,7,9], got", lowE);
    }
  }, []);

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-xl font-semibold tracking-tight">
          Guitar Fretboard Scale Explorer — 3NPS
        </h1>

        {/* Controls */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Key">
            <select
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
            >
              {ALL_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Scale">
            <div className="mt-1 flex gap-2">
              {(["major", "minor"] as ScaleKind[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={[
                    "flex-1 rounded-md px-3 py-2 text-sm border",
                    scale === s
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                      : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700/60",
                  ].join(" ")}
                >
                  {s === "major" ? "Major (Ionian)" : "Minor (Aeolian)"}
                </button>
              ))}
            </div>
          </Field>

          <Field label="View">
            <div className="mt-1 flex gap-2">
              {(["3nps", "full"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={[
                    "flex-1 rounded-md px-3 py-2 text-sm border",
                    mode === m
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                      : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700/60",
                  ].join(" ")}
                >
                  {m === "3nps" ? "3 Notes / String" : "Full Neck"}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Position selector */}
        {mode === "3nps" && (
          <Field label="Position (3NPS shape)" className="mt-3">
            <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
              {POSITION_LABELS.map((name, idx) => (
                <button
                  key={name}
                  onClick={() => setPosition(idx as Position)}
                  className={[
                    "rounded-md px-3 py-2 text-sm border",
                    position === idx
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                      : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700/60",
                  ].join(" ")}
                >
                  {name}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              Tip: A Major + Ionian shows low-E{" "}
              <span className="text-neutral-200">5-7-9</span>. Switch positions
              to walk all seven shapes.
            </p>
          </Field>
        )}

        {/* Label + Accidentals */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Note Labels">
            <div className="mt-1 flex gap-2">
              {(["degree", "note"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLabelMode(l)}
                  className={[
                    "flex-1 rounded-md px-3 py-2 text-sm border",
                    labelMode === l
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                      : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700/60",
                  ].join(" ")}
                >
                  {l === "degree" ? "Scale Degrees" : "Note Names"}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Accidentals">
            <div className="mt-1 flex gap-2">
              <button
                onClick={() => setUseFlats(false)}
                className={[
                  "flex-1 rounded-md px-3 py-2 text-sm border",
                  !useFlats
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                    : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700/60",
                ].join(" ")}
              >
                Sharps
              </button>
              <button
                onClick={() => setUseFlats(true)}
                className={[
                  "flex-1 rounded-md px-3 py-2 text-sm border",
                  useFlats
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                    : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700/60",
                ].join(" ")}
              >
                Flats
              </button>
            </div>
          </Field>
        </div>

        {/* Fretboard */}
        <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <Fretboard
            points={points}
            minFret={minFret}
            maxFret={maxFret}
            keyPc={keyPc}
            scale={scale}
            labelMode={labelMode}
            useFlats={useFlats}
          />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-neutral-800 bg-neutral-900 p-3 ${className}`}
    >
      <label className="text-xs uppercase tracking-wider text-neutral-400">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ------------------------------- Fretboard ------------------------------- */

function Fretboard({
  points,
  minFret,
  maxFret,
  keyPc,
  scale,
  labelMode,
  useFlats,
}: {
  points: { string: number; fret: number; pc: number; degreeIdx: number }[];
  minFret: number;
  maxFret: number;
  keyPc: number;
  scale: ScaleKind;
  labelMode: "note" | "degree";
  useFlats: boolean;
}) {
  // Responsive bubble radius (matches Tailwind sizes below)
  // base (mobile): w-14 -> 56px diameter -> r=28
  // md (tablet):   w-12 -> 48px diameter -> r=24
  // lg (desktop):  w-10 -> 40px diameter -> r=20
  const [bubbleR, setBubbleR] = useState(20);
  useEffect(() => {
    // Match Tailwind's breakpoints: md >= 768px, lg >= 1024px
    const mqMd = window.matchMedia("(min-width: 768px)");
    const mqLg = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      if (mqLg.matches) {
        // Desktop (lg+)
        setBubbleR(20);
      } else if (mqMd.matches) {
        // Tablet (md)
        setBubbleR(24);
      } else {
        // Mobile (base)
        setBubbleR(28);
      }
    };
    update();
    // Subscribe (support older Safari)
    if (typeof mqMd.addEventListener === "function") {
      mqMd.addEventListener("change", update);
      mqLg.addEventListener("change", update);
    } else if (typeof mqMd.addListener === "function") {
      mqMd.addListener(update);
      mqLg.addListener(update);
    }
    return () => {
      if (typeof mqMd.removeEventListener === "function") {
        mqMd.removeEventListener("change", update);
        mqLg.removeEventListener("change", update);
      } else if (typeof mqMd.removeListener === "function") {
        mqMd.removeListener(update);
        mqLg.removeListener(update);
      }
    };
  }, []);

  const NOTE_R = bubbleR;
  const stringCount = 6;
  const padL = 60,
    padR = 20,
    padV = 30,
    padBottom = 80;
  // Ensure enough vertical space so circles never overlap on Y axis
  const baseHeight = 320;
  const minStringGap = NOTE_R * 2 + 8; // diameter + margin
  const requiredHeight = padV + padBottom + (stringCount - 1) * minStringGap;
  const height = Math.max(baseHeight, requiredHeight);
  // Fixed per-fret width for readability; container scrolls horizontally if needed
  // Map per-fret width to bubble radius (mobile/tablet/desktop)
  // mobile r=28 -> 56px per fret; tablet r=24 -> 64px; desktop r=20 -> 48px
  const FRET_W = bubbleR === 20 ? 48 : bubbleR === 24 ? 64 : 56;
  const baseFretCount = Math.max(12, maxFret) - minFret + 1;
  const isDesktop = bubbleR === 20;
  const displayMinFret = isDesktop ? 0 : minFret;
  const displayFretCount = isDesktop ? 22 : baseFretCount; // full neck (0-21) on desktop
  const innerW = displayFretCount * FRET_W;
  const width = padL + padR + innerW;
  const fretW = FRET_W;
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
                height={(height - padBottom) - padV}
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
            y2={visY(stringCount - 1)}
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
                y2={height - padBottom + 8}
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
                y={height - 10}
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
          const label =
            labelMode === "degree"
              ? isRoot
                ? "1"
                : String(
                    (p.degreeIdx + 1 - SCALE_STEPS[scale].indexOf(0) + 7) % 7 ||
                      7
                  )
              : pcToName(p.pc);
          return (
            <div
              key={i}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full text-neutral-100 font-semibold select-none ${
                isRoot ? "bg-emerald-500" : "bg-zinc-600/90"
              }
                w-14 h-14 text-lg md:w-12 md:h-12 md:text-base lg:w-10 lg:h-10 lg:text-sm`}
              style={{ left: x, top: y }}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

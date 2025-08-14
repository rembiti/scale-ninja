/** Audio playback engine for Scale Ninja */

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private async initializeAudio(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    try {
      // @ts-expect-error - webkitAudioContext is not in standard types but needed for Safari compatibility
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Play a note given its MIDI number
   * @param midiNote - MIDI note number (40 = E2, 64 = E4)
   * @param duration - Duration in seconds (default: 1.2)
   */
  async playNote(midiNote: number, duration: number = 1.2): Promise<void> {
    await this.initializeAudio();
    
    if (!this.audioContext) {
      console.warn('Audio context not available');
      return;
    }

    // Resume audio context if suspended (required by some browsers)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const frequency = this.midiToFrequency(midiNote);
    const currentTime = this.audioContext.currentTime;

    // Create a more realistic guitar sound with multiple harmonics
    this.createGuitarSound(frequency, currentTime, duration);
  }

  /**
   * Create a realistic guitar sound using multiple oscillators and filtering
   */
  private createGuitarSound(frequency: number, startTime: number, duration: number): void {
    if (!this.audioContext) return;

    // Master gain node
    const masterGain = this.audioContext.createGain();
    
    // Low-pass filter to simulate guitar pickup and amp characteristics
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, startTime); // Cut high frequencies
    filter.Q.setValueAtTime(1, startTime);
    
    // High-pass filter to remove muddy low end
    const highPassFilter = this.audioContext.createBiquadFilter();
    highPassFilter.type = 'highpass';
    highPassFilter.frequency.setValueAtTime(80, startTime);
    
    // Connect filters
    masterGain.connect(highPassFilter);
    highPassFilter.connect(filter);
    filter.connect(this.audioContext.destination);

    // Create multiple harmonics for realistic guitar timbre
    const harmonics = [
      { ratio: 1.0, gain: 0.8 },    // Fundamental
      { ratio: 2.0, gain: 0.4 },    // Octave
      { ratio: 3.0, gain: 0.2 },    // Perfect fifth
      { ratio: 4.0, gain: 0.15 },   // Second octave
      { ratio: 5.0, gain: 0.1 },    // Major third
      { ratio: 6.0, gain: 0.08 },   // Perfect fifth
      { ratio: 7.0, gain: 0.05 },   // Minor seventh
    ];

    harmonics.forEach((harmonic, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const harmonicGain = this.audioContext!.createGain();
      
      // Use different waveforms for different harmonics
      oscillator.type = index === 0 ? 'sawtooth' : 'sine';
      oscillator.frequency.setValueAtTime(frequency * harmonic.ratio, startTime);
      
      // Connect harmonic
      oscillator.connect(harmonicGain);
      harmonicGain.connect(masterGain);
      
      // Individual harmonic envelope
      harmonicGain.gain.setValueAtTime(0, startTime);
      harmonicGain.gain.linearRampToValueAtTime(harmonic.gain * 0.3, startTime + 0.005); // Quick attack
      harmonicGain.gain.exponentialRampToValueAtTime(harmonic.gain * 0.7, startTime + 0.02); // Peak
      harmonicGain.gain.exponentialRampToValueAtTime(harmonic.gain * 0.4, startTime + 0.1); // Decay
      harmonicGain.gain.setValueAtTime(harmonic.gain * 0.4, startTime + duration * 0.6); // Sustain
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Release
      
      // Start and stop
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
      
      // Clean up
      oscillator.onended = () => {
        oscillator.disconnect();
        harmonicGain.disconnect();
      };
    });

    // Master envelope with guitar-like characteristics
    masterGain.gain.setValueAtTime(0, startTime);
    masterGain.gain.linearRampToValueAtTime(0.8, startTime + 0.003); // Very quick attack like plucked string
    masterGain.gain.exponentialRampToValueAtTime(0.6, startTime + 0.05); // Quick decay
    masterGain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.2); // Longer decay
    masterGain.gain.setValueAtTime(0.3, startTime + duration * 0.5); // Sustain
    masterGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Natural release

    // Add slight vibrato for realism (after initial attack)
    const vibratoLFO = this.audioContext.createOscillator();
    const vibratoGain = this.audioContext.createGain();
    
    vibratoLFO.type = 'sine';
    vibratoLFO.frequency.setValueAtTime(4.5, startTime); // 4.5 Hz vibrato
    vibratoGain.gain.setValueAtTime(0, startTime);
    vibratoGain.gain.setValueAtTime(0, startTime + 0.3); // No vibrato initially
    vibratoGain.gain.linearRampToValueAtTime(2, startTime + duration * 0.8); // Gradual vibrato
    
    vibratoLFO.connect(vibratoGain);
    vibratoGain.connect(filter.frequency);
    
    vibratoLFO.start(startTime);
    vibratoLFO.stop(startTime + duration);
    
    // Clean up vibrato
    vibratoLFO.onended = () => {
      vibratoLFO.disconnect();
      vibratoGain.disconnect();
      masterGain.disconnect();
      filter.disconnect();
      highPassFilter.disconnect();
    };
  }

  /**
   * Convert MIDI note number to frequency in Hz
   */
  private midiToFrequency(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  /**
   * Calculate MIDI note number from string and fret
   * @param stringIndex - 0-5 (low E to high E)
   * @param fret - 0-24
   */
  stringFretToMidi(stringIndex: number, fret: number): number {
    // Standard tuning MIDI notes for open strings
    const openStringMidi = [40, 45, 50, 55, 59, 64]; // E2, A2, D3, G3, B3, E4
    return openStringMidi[stringIndex] + fret;
  }

  /**
   * Play a note from string and fret position
   */
  async playStringFret(stringIndex: number, fret: number, duration?: number): Promise<void> {
    const midiNote = this.stringFretToMidi(stringIndex, fret);
    await this.playNote(midiNote, duration);
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();

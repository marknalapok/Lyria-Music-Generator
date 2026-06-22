import { MusicSpec } from "./types";

interface ChordProgression {
  chords: number[][]; // midi offset notes
  roots: number[];    // MIDI root notes
}

export class ProceduralSynth {
  private ctx: AudioContext | null = null;
  private spec: MusicSpec;
  private analyser: AnalyserNode | null = null;
  private activeNodes: AudioNode[] = [];
  private schedulerTimer: any = null;
  private isPlaying: boolean = false;
  private currentStep: number = 0;
  private bpm: number;
  private scale: number[] = []; // semi-tone offsets
  private progression: ChordProgression = { chords: [], roots: [] };
  private gainNode: GainNode | null = null;

  constructor(spec: MusicSpec) {
    this.spec = spec;
    this.bpm = spec.tempo || 120;
    this.setupScaleAndProgression();
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  private setupScaleAndProgression() {
    const moodClean = this.spec.mood.toLowerCase();
    const genreClean = this.spec.genre.toLowerCase();

    // Minor pentatonic for dreamy/atmospheric, Major/Pentatonic for uplifting, Phrygian for dark etc.
    if (moodClean.includes("sad") || moodClean.includes("dreamy") || moodClean.includes("cozy") || moodClean.includes("ambient") || moodClean.includes("moody")) {
      // Natural Minor Scale (Root: C = 60)
      this.scale = [0, 2, 3, 5, 7, 8, 10]; 
      this.progression = {
        // i - VI - III - VII progression (Am - F - C - G equivalent)
        chords: [
          [0, 3, 7, 12],  // i (Minor)
          [-4, 0, 3, 8],  // VI (Major style)
          [0, 4, 7, 12],  // III (Major style)
          [2, 5, 9, 14],  // v/VII style
        ],
        roots: [57, 53, 48, 55] // A, F, C, G midi
      };
    } else if (moodClean.includes("epic") || moodClean.includes("cinematic") || moodClean.includes("dark") || moodClean.includes("mysterious")) {
      // Harmonic Minor (more dramatic)
      this.scale = [0, 2, 3, 5, 7, 8, 11];
      this.progression = {
        // i - V - VI - iv progression
        chords: [
          [0, 3, 7, 12],
          [-1, 2, 7, 11],
          [0, 3, 8, 12],
          [-2, 1, 5, 10],
        ],
        roots: [57, 52, 53, 50] // A, E, F, D
      };
    } else {
      // Major Pentatonic / Standard Major (cheerful, upbeat, corporate, playful)
      this.scale = [0, 2, 4, 7, 9];
      this.progression = {
        // I - V - vi - IV progression
        chords: [
          [0, 4, 7, 12],  // I (Major)
          [-1, 2, 7, 11],  // V
          [0, 4, 9, 12],  // vi (Minor)
          [0, 5, 9, 12],  // IV
        ],
        roots: [60, 55, 57, 53] // C, G, A, F
      };
    }
  }

  public play(onStepChange?: (step: number) => void) {
    if (this.isPlaying) return;

    // Create AudioContext lazily on user gesture
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) {
      console.warn("Web Audio API is not supported in this browser.");
      return;
    }

    this.ctx = new AudioCtxClass();
    this.isPlaying = true;
    this.currentStep = 0;

    // Set up local analyser on the identical AudioContext (avoids separate context connection issues)
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.analyser.connect(this.ctx.destination);

    // Master Gain
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.35, this.ctx.currentTime);

    // Routings: connect gain to our correctly created local analyser
    this.gainNode.connect(this.analyser);

    const stepDuration = 60 / this.bpm / 2; // eighth notes

    const scheduleNextEvent = () => {
      if (!this.isPlaying || !this.ctx) return;

      const time = this.ctx.currentTime;
      this.triggerStep(time, this.currentStep);

      if (onStepChange) {
        onStepChange(this.currentStep);
      }

      this.currentStep = (this.currentStep + 1) % 16;
      this.schedulerTimer = setTimeout(scheduleNextEvent, stepDuration * 1000);
    };

    scheduleNextEvent();
  }

  private triggerStep(time: number, step: number) {
    if (!this.ctx || !this.gainNode) return;

    const chordIndex = Math.floor(step / 4) % this.progression.roots.length;
    const rootMIDI = this.progression.roots[chordIndex];
    const chordNotes = this.progression.chords[chordIndex];

    const instruments = this.spec.instrumentation.map(i => i.toLowerCase());

    // 1. Kick Drum / Low Beat pulse
    const hasDrums = instruments.some(i => i.includes("drum") || i.includes("percussion") || i.includes("beat") || i.includes("lofi"));
    if (hasDrums && (step % 4 === 0 || (step % 8 === 6 && Math.random() > 0.4))) {
      this.playKick(time);
    }

    // 2. Snare / Clicks on weak beats
    if (hasDrums && step % 8 === 4) {
      this.playSnare(time);
    }

    // 3. Hi-Hat / High ticks on uneven steps
    if (hasDrums && step % 2 === 1) {
      this.playHihat(time);
    }

    // 4. Bassline: play long warm tone on downbeats, or bouncy note depending on genre
    const hasBass = instruments.some(i => i.includes("bass") || i.includes("brass") || i.includes("synth") || i.includes("orchestral"));
    if (hasBass && (step % 4 === 0 || step % 8 === 2)) {
      this.playBass(time, rootMIDI - 12);
    }

    // 5. Ambient Chord Pads: plays on chord boundary changes
    const hasPads = instruments.some(i => i.includes("piano") || i.includes("pad") || i.includes("string") || i.includes("violin") || i.includes("orchestral") || i.includes("synth"));
    if (hasPads && step % 8 === 0) {
      this.playPad(time, rootMIDI, chordNotes);
    }

    // 6. Arpeggiator Lead/Melody
    const hasLead = instruments.some(i => i.includes("guitar") || i.includes("arpeggiator") || i.includes("pluck") || i.includes("flute") || i.includes("lead") || i.includes("synth") || i.includes("acoustic"));
    const isLeadStep = step % 2 === 0 || (step % 4 === 3 && Math.random() > 0.5);
    if (hasLead && isLeadStep) {
      // Pick a semi-random note from the current chord notes or scale
      const randomNoteOffset = chordNotes[Math.floor(Math.random() * chordNotes.length)];
      const leadMIDINote = rootMIDI + 12 + randomNoteOffset;
      this.playLead(time, leadMIDINote, step % 4 === 0);
    }
  }

  // Synthesize procedural instruments
  private playKick(time: number) {
    if (!this.ctx || !this.gainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.gainNode);

    // Fast pitch envelope
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);

    // Volume envelope
    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

    osc.start(time);
    osc.stop(time + 0.3);

    this.activeNodes.push(osc);
  }

  private playSnare(time: number) {
    if (!this.ctx || !this.gainNode) return;

    // Soft white noise snare
    const bufferSize = this.ctx.sampleRate * 0.15; // 150ms
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    noiseSource.start(time);
    noiseSource.stop(time + 0.2);

    this.activeNodes.push(noiseSource);
  }

  private playHihat(time: number) {
    if (!this.ctx || !this.gainNode) return;

    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(10000, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(8000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.005, time + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + 0.06);

    this.activeNodes.push(osc);
  }

  private playBass(time: number, midiNote: number) {
    if (!this.ctx || !this.gainNode) return;

    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    const freq = this.midiToFreq(midiNote);
    osc.frequency.setValueAtTime(freq, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0, time);
    gain.gain.linearRampToValueAtTime(0.5, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    osc.connect(gain);
    gain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + 0.6);

    this.activeNodes.push(osc);
  }

  private playPad(time: number, rootMIDI: number, chordOffsets: number[]) {
    if (!this.ctx || !this.gainNode) return;

    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(0.0, time);
    padGain.gain.linearRampToValueAtTime(0.15, time + 0.8);
    padGain.gain.exponentialRampToValueAtTime(0.01, time + 3.0);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, time);
    filter.frequency.exponentialRampToValueAtTime(1500, time + 1.2);
    filter.frequency.exponentialRampToValueAtTime(400, time + 3.0);

    padGain.connect(filter);
    filter.connect(this.gainNode);

    // Play multiple notes together to form a warm ambient chord
    chordOffsets.forEach((offset) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(this.midiToFreq(rootMIDI + offset), time);

      const microDetune = (Math.random() - 0.5) * 10; // Detuning for width
      osc.detune.setValueAtTime(microDetune, time);

      osc.connect(padGain);
      osc.start(time);
      osc.stop(time + 3.2);

      this.activeNodes.push(osc);
    });
  }

  private playLead(time: number, midiNote: number, accent: boolean) {
    if (!this.ctx || !this.gainNode) return;

    const osc = this.ctx.createOscillator();
    const isSineNeeded = this.spec.mood.toLowerCase().includes("ambient") || this.spec.mood.toLowerCase().includes("cozy");
    osc.type = isSineNeeded ? "sine" : "triangle";
    osc.frequency.setValueAtTime(this.midiToFreq(midiNote), time);

    const gain = this.ctx.createGain();
    const peakGain = accent ? 0.25 : 0.15;
    gain.gain.setValueAtTime(0.0, time);
    gain.gain.linearRampToValueAtTime(peakGain, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.005, time + 0.35);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(accent ? 1400 : 900, time);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + 0.4);

    this.activeNodes.push(osc);
  }

  private midiToFreq(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  public stop() {
    this.isPlaying = false;
    if (this.schedulerTimer) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    try {
      this.activeNodes.forEach((node) => {
        try {
          (node as any).stop();
        } catch (e) {}
      });
      this.activeNodes = [];

      if (this.ctx && this.ctx.state !== "closed") {
        this.ctx.close();
      }
    } catch (err) {
      console.warn("Error cleaning up Web Audio nodes:", err);
    }

    this.ctx = null;
  }
}

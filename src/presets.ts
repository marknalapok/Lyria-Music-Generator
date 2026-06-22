import { UseCasePreset } from "./types";

export const USE_CASE_PRESETS: Record<string, UseCasePreset> = {
  soundtrack: {
    useCase: "soundtrack",
    title: "Cinematic Soundtrack",
    description: "Rich, atmospheric, and emotional compositions designed for narrative storytelling, gaming, and cinematic visual backdrops.",
    defaultGenre: "Cinematic Orchestral",
    defaultMood: "Dramatic / Epic",
    defaultTempo: 95,
    defaultDuration: 30,
    defaultInstruments: ["Violin Section", "French Horn", "Timpani", "Cinema Pad", "Concert Grand Piano"],
    allowedGenres: [
      "Cinematic Orchestral",
      "Cyberpunk Industrial",
      "Sci-Fi Synthwave",
      "Dark Ambient",
      "Neo-Classical",
      "Epic Orchestral Metal"
    ],
    allowedMoods: [
      "Dramatic / Epic",
      "Mysterious / Suspenseful",
      "Heavy / Melancholic",
      "Futuristic / Cyber",
      "Triumphant / Heroic",
      "Eerie / Horrific"
    ],
    allowedInstruments: [
      "Violin Section",
      "Cello Solo",
      "French Horn",
      "Timpani",
      "Cinema Pad",
      "Concert Grand Piano",
      "Sub-Bass",
      "Industrial Drums",
      "Church Organ",
      "Acoustic Choir"
    ]
  },
  jingle: {
    useCase: "jingle",
    title: "Marketing Jingle",
    description: "Punchy, fast-tempo, catchy hooks crafted for commercials, social media branding, intros, and professional marketing campaigns.",
    defaultGenre: "Modern Electro Swing",
    defaultMood: "Bright / Energetic",
    defaultTempo: 125,
    defaultDuration: 15,
    defaultInstruments: ["Brass Section", "Slap Bass", "Modern Drum Machine", "Chippy Synths", "Acoustic Pluck"],
    allowedGenres: [
      "Chunky Funk",
      "Modern Electro Swing",
      "Upbeat Indie Pop",
      "Commercial Acoustic Folk",
      "Retro 80s Synthwave",
      "Corporate Tech-Optimist"
    ],
    allowedMoods: [
      "Bright / Energetic",
      "Playful / Quirky",
      "Corporate / Professional / Tech-Forward",
      "Inspiring / Uplifting",
      "Funky / Swagger",
      "Catchy / Retro"
    ],
    allowedInstruments: [
      "Brass Section",
      "Slap Bass",
      "Modern Drum Machine",
      "Chippy Synths",
      "Acoustic Pluck",
      "Electric Clavinet",
      "Wind Chime / Glockenspiel",
      "Handclaps & Percussion",
      "Crisp Acoustic Guitar"
    ]
  },
  background: {
    useCase: "background",
    title: "Vibe Background Music",
    description: "Mellow textures, loops, and rhythms that sit perfectly in the background of podcasts, workspaces, videos, or streaming streams.",
    defaultGenre: "Lofi Hip-Hop Chill",
    defaultMood: "Cozy / Relaxed",
    defaultTempo: 80,
    defaultDuration: 30,
    defaultInstruments: ["Rhodes Electric Piano", "Chill Hop Beat", "Warm Tape Pad", "Muted Trumpet", "Vinyl Crackle Filter"],
    allowedGenres: [
      "Lofi Hip-Hop Chill",
      "Chillout Lounge Jazz",
      "Minimalist Ambient Drone",
      "Dreamy Post-Rock",
      "Warm Acoustic Folk",
      "Deep House Sleep Vibe"
    ],
    allowedMoods: [
      "Cozy / Relaxed",
      "Focus / Thoughtful / Study",
      "Ethereal / Floating / Meditative",
      "Chilly / Nostalgic",
      "Gentle / Calming",
      "Hypnotic / Cyclic"
    ],
    allowedInstruments: [
      "Rhodes Electric Piano",
      "Chill Hop Beat",
      "Warm Tape Pad",
      "Muted Trumpet",
      "Vinyl Crackle Filter",
      "Harp Pluck",
      "Sustained Drone Pad",
      "Nylon String Acoustic",
      "Muted Bassline",
      "Ambient Rain / Stream FX"
    ]
  }
};

export const PROMPT_ASSIST_SUGGESTIONS = [
  "A majestic sunrise slowly lighting up a misty mountain range, starting quiet and swelling to an epic orchestral crescendo.",
  "Upbeat, bounce-heavy tech-startup background theme with crisp synthesized handclaps, bouncy bassline, and warm optimism.",
  "Chill lofi lofi beat with dusty piano chords, coffee-shop ambient rain patter, vinyl hiss, and a lazy drum snare.",
  "A high-speed cybernetic police chase through rain-slicked Tokyo streets, heavy industrial kick drums, screeching synths, and aggressive pace.",
  "An emotional, tearful acoustic fingerstyle guitar solo that moves into a warm, supportive cello harmony.",
  "A quirky, bouncy jingle for a retro platformer game with 8-bit sound effects, playful chiptune arpeggios, and cute woodwinds."
];

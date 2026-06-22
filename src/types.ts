export type UseCase = "soundtrack" | "jingle" | "background";

export interface MusicParams {
  model: "lyria-3-clip-preview" | "lyria-3-pro-preview";
  prompt: string;
  useCase: UseCase;
  genre: string;
  mood: string;
  tempo: number;
  instrumentation: string[];
  duration: number;
  imageData?: string; // base64 string
  imageName?: string; // name of file
}

export interface MusicSpec {
  model: string;
  useCase: string;
  genre: string;
  mood: string;
  tempo: number;
  instrumentation: string[];
  duration: number;
}

export interface Track {
  id: string;
  title: string;
  createdAt: string;
  lyrics: string;
  isSimulated: boolean;
  warning?: string;
  audioUrl?: string; // if resolved
  audioData?: string; // base64
  spec: MusicSpec;
  prompt: string;
  imageThumbnail?: string; // representation of image if uploaded
  likes: number;
  isFavorite: boolean;
}

export interface UseCasePreset {
  useCase: UseCase;
  title: string;
  description: string;
  defaultGenre: string;
  defaultMood: string;
  defaultTempo: number;
  defaultDuration: number;
  defaultInstruments: string[];
  allowedGenres: string[];
  allowedMoods: string[];
  allowedInstruments: string[];
}

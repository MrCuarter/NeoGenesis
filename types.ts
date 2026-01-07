
export type Language = 'ES' | 'EN';

export interface CharacterParams {
  mode: 'image' | 'video'; 
  promptFormat: 'midjourney' | 'generic'; 
  designMode: 'quick' | 'advanced'; 
  
  // 1. Identity
  race: string;
  gender: string;
  age: string;
  classCategory: 'fantasy' | 'realistic'; // Toggle crucial
  role: string;
  secondaryRole: string;
  subRole: string;
  bodyType: string;
  
  // 2. Head & Face Details
  skinTone: string; // Text description (Pale, Dark)
  skinColor: string[]; // Specific Hex override (Max 1)
  
  hairStyle: string;
  hairColors: string[]; // Hex (Max 2)
  
  eyeFeature: string; // New: Shape/Feature (Third eye, etc)
  eyeColors: string[]; // Hex (Max 1)
  
  denture: string;
  noseShape: string;
  faceMarkings: string;

  // 3. Outfit & Gear
  headwear: string;
  upperBody: string;
  lowerBody: string;
  fullBody: string;
  footwear: string;
  
  outfitColors: string[]; // Hex (Max 2)
  
  heldItem: string;
  classExtras: string; // New: Backpack, Wings, Aura...

  // 4. Expression & Movement
  emotion: string;
  pose: string; 
  action: string; 

  // 5. Composition & Tech
  style: string;
  setting: string;
  background: string;
  framing: string; 
  lighting: string;
  atmosphere: string;
  colors: string[]; // Global palette / Ambient
  details: string; 
  aspectRatio: string;
}

export interface GeneratedData {
  prompt: string;
  negativePrompt: string;
  timestamp?: number;
  modelParams?: Partial<CharacterParams>;
}

export interface LoreData {
  name: string;
  epithet: string; // e.g. "The Shadow Walker"
  alignment: string; // D&D style or Moral Compass
  personality: string[]; // Keywords
  backstory: string; // Short bio
  motivation: string;
  fear: string;
}

export interface ExpressionEntry {
  label: string;
  prompt: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  EDITOR = 'EDITOR',
  AI_IMAGE = 'AI_IMAGE',
  AI_VIDEO = 'AI_VIDEO',
  COLLAGE = 'COLLAGE',
  ID_PHOTO = 'ID_PHOTO',
  HISTORY = 'HISTORY'
}

export interface GeneratedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  prompt: string;
  date: number;
}

export interface ImageFilter {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  blur: number;
}

export interface IDPhotoConfig {
  widthMm: number;
  heightMm: number;
  name: string;
}

export const ID_SIZES: IDPhotoConfig[] = [
  { name: 'Standard 3x4 cm', widthMm: 30, heightMm: 40 },
  { name: 'Standard 4x6 cm', widthMm: 40, heightMm: 60 },
  { name: 'Passport (3.5x4.5 cm)', widthMm: 35, heightMm: 45 },
  { name: 'Visa (5x5 cm)', widthMm: 50, heightMm: 50 },
];

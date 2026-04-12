export interface Zone {
  id: string;
  name?: string;
  image?: string;
  top?: number;
  left?: number;
  width?: number;
  height?: number;
  activity?: string;
  rotate?: boolean;
  description: {
    id: string;
    en: string;
  };
  video?: string;
}

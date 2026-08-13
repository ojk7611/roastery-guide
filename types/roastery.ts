export type Region = "seoul" | "busan" | "jeju" | "gwangju" | "daejeon" | "daegu";

export interface RegionMeta {
  slug: Region;
  label: string;
  description: string;
}

export interface Roastery {
  id: string;
  slug: string;
  name: string;
  region: Region;
  neighborhood: string;
  address: string;
  hours: string;
  tags: string[];
  description: string;
  signature: string[];
  lat: number;
  lng: number;
  source?: string;
}

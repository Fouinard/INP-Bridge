import { vars } from 'nativewind';

export function generateRandomHue(): number {
  return Math.floor(Math.random() * 360);
}

export function getHueStyle(hue: number) {
  return vars({ "--h": hue });
}

export function getHueFromString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360);
}
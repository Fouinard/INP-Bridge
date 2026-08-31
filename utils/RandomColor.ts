import { vars } from 'nativewind';

export function generateRandomHue(): number {
  return Math.floor(Math.random() * 360);
}

export function getHueStyle(hue: number) {
  return vars({ "--h": hue });
}
import { ProcessChunk } from "../classes/proceso";

export interface IMemoria {
  address: string,
  processChunk: ProcessChunk,
  color?: string
}
export function generatePastelColor(): string {
  let color;
  do {
    const randomChannel = () => Math.floor((Math.random() * 128) + 127);
    const r = randomChannel();
    const g = randomChannel();
    const b = randomChannel();
    color = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } while (color.toUpperCase() === '#FFD700');

  return color;
}

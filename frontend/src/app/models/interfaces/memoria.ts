import { ProcessChunk } from "../classes/proceso";

export interface IMemoria {
  address: string,
  processChunk: ProcessChunk | undefined
}

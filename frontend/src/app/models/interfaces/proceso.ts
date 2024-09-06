export interface Proceso {
}
export type ProcessResource =
  'memory' |
  'processor' |
  'graphicsCard' |
  'hardDrive';

export interface ProcessForm {
  processName: string;
  processSize: number;
  processResource: ProcessResource;
}

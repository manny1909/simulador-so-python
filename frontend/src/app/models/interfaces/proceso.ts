export type ProcessResource =
  'memory' |
  'processor' |
  'graphicsCard' |
  'hardDrive';
export type Prominencia =
  'si' |
  'no' |
  undefined;
export type ProcessStatus =
  'nuevo' |
  'listo' |
  'ejecutando' |
  'bloqueado' |
  'terminado';

export interface ProcessForm {
  processName: string;
  processSize: number;
  processResource: ProcessResource[];
  prominencia: Prominencia;
}

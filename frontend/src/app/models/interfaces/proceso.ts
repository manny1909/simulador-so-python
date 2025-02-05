export type ProcessResource =
  'memory' |
  'processor' |
  'graphicsCard' |
  'micrófono' |
  'hardDrive';
export type Preeminencia =
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
  preeminence: Preeminencia;
}

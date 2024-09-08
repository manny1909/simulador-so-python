export type ProcessResource =
  'memory' |
  'processor' |
  'graphicsCard' |
  'hardDrive';
export type ProcessStatus =
  'nuevo' |
  'listo' |
  'ejecutando' |
  'bloqueado' |
  'terminado';

export interface ProcessForm {
  processName: string;
  processSize: number;
  processResource: ProcessResource;
}

import { Proceso } from "../classes/proceso";
import { ProcessStatus } from "./proceso";

export interface listaProcesoPorEstado{
  estado: ProcessStatus
  procesos: Array<Proceso>
}

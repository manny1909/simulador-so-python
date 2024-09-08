import { ProcessResource } from "./proceso";

export interface IResource {
  recurso: ProcessResource,
  idProceso: number | undefined,
  ocupado?: boolean | false
}

import { ProcessResource } from "../interfaces/proceso"

export class Proceso {
  id?:number
  processName: string
  processSize: number
  processResource: ProcessResource
  constructor(processName: string, processSize: number, processResource:ProcessResource) {
    this.processName = processName
    this.processSize = processSize
    this.processResource = processResource
  }
}

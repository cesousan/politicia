export type AssemblyId = string

export enum AssemblyType {
  ASSEMBLEE_NATIONALE = 'ASSEMBLEE_NATIONALE',
  SENAT = 'SENAT',
  PARLEMENT_EUROPEEN = 'PARLEMENT_EUROPEEN',
}

export interface Assembly {
  id: AssemblyId
  name: string
}

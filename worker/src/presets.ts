export type WorkerPresetName = 'default-lyqht' | 'plain' | 'geekshacking'

export interface WorkerPreset {
  name: WorkerPresetName
  foreground: string
  background: string
  finderOuter: string
  finderInner: string
  margin: number
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
}

export const workerPresets: Record<WorkerPresetName, WorkerPreset> = {
  'default-lyqht': {
    name: 'default-lyqht',
    foreground: '#abcbca',
    background: '#697d80',
    finderOuter: '#abcbca',
    finderInner: '#abcbca',
    margin: 0,
    errorCorrectionLevel: 'Q'
  },
  plain: {
    name: 'plain',
    foreground: '#000000',
    background: '#ffffff',
    finderOuter: '#000000',
    finderInner: '#000000',
    margin: 0,
    errorCorrectionLevel: 'Q'
  },
  geekshacking: {
    name: 'geekshacking',
    foreground: '#cebe2c',
    background: '#000000',
    finderOuter: '#ced043',
    finderInner: '#ced043',
    margin: 0,
    errorCorrectionLevel: 'Q'
  }
}

export function getWorkerPreset(name?: string): WorkerPreset {
  if (!name) return workerPresets.plain

  return workerPresets[name as WorkerPresetName] ?? workerPresets.plain
}

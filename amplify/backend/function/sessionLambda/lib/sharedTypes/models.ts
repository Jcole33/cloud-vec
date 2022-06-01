export interface Emulator {
    id: string
    name: string
}

export interface Session {
    userId: string
    instanceId: string
    instanceStatus: string
    info?: unknown
}
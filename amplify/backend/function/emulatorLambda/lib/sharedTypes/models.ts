export interface Emulator {
    id: Readonly<string>
    name: Readonly<string>
}

export interface Session {
    userId: Readonly<string>
    instanceId: Readonly<string>
}
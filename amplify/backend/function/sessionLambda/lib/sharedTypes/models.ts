export interface Emulator {
    id: Readonly<string>
    name: Readonly<string>
    info: Readonly<Record<string, any>>
}

export interface Session {
    userId: Readonly<string>
    emulatorId: Readonly<string>
    info: Readonly<Record<string, any>>
}
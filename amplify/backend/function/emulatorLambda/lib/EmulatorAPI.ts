import { APISpec, RealAPI } from './sharedTypes/APISpec'
import { Emulator } from './sharedTypes/models'

interface API extends APISpec {
    '/emulator': {
        get: {
            response: Emulator[]
        }
    }
    '/emulator/{id}': {
        get: {
            params: { id: string }
            response: Emulator
        }
    }
}

export type EmulatorAPI = RealAPI<API>
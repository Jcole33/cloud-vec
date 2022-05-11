import { APISpec, RealAPI } from './sharedTypes/APISpec'
import { Emulator } from './sharedTypes/models'

interface API extends APISpec {
    //get list of all emulator options
    '/emulator': {
        get: {
            response: Emulator[]
        }
    }
    //get details on a specific emulator
    '/emulator/{id}': {
        get: {
            //just the uuid of the emulator included in the route ex: /emulator/123e4567-e89b-12d3-a456-426614174000
            params: { id: string }
            response: Emulator
        }
    }
}

export type EmulatorAPI = RealAPI<API>
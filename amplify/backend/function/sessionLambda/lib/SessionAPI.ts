import { APISpec, RealAPI } from './sharedTypes/APISpec'
import { Session } from './sharedTypes/models'

interface API extends APISpec {
    '/session': {
        get: {
            response: Session
        }
        post: {
            body: {emulatorId: string}
            response: string
        }
        delete: {
            response: string
        }
    }
}

export type SessionAPI = RealAPI<API>
import { APISpec, RealAPI } from './sharedTypes/APISpec'
import { Session } from './sharedTypes/models'

interface API extends APISpec {
    '/session': {
        //create a new emulator session
        post: {
            body: {emulatorId: string}
            response: {sessionId: string}
        }
    }
    '/session/{id}': {
        //get details on a running emulator session
        get: {
            params: {
                id: string
            }
            response: Session
        }
        //end an emulator session
        delete: {
            params: {
                id: string
            }
            response: string
        }
    }
}

export type SessionAPI = RealAPI<API>
import { APISpec, RealAPI } from './sharedTypes/APISpec'
import { Session } from './sharedTypes/models'

interface API extends APISpec {
    '/session': {
        //get details on a running emulator session
        get: {
            response: Session
        }
        //create a new emulator session
        post: {
            //what should be included in the body of the request
            body: {emulatorId: string}
            response: string
        }
        //end an emulator session
        delete: {
            response: string
        }
    }
}

export type SessionAPI = RealAPI<API>
## General Types: ##
- Schema for commonly used types - https://github.com/Jcole33/cloud-vec/blob/master/amplify/backend/function/sessionLambda/lib/sharedTypes/models.ts
## API Schema ##
- NOTE: all responses are of the form:
    type SuccessResponse<R> = { success: true, body: R } | { success: false, message: string, error?: unknown }
    Meaning that if the spec says "response: string" then the success response is: {success: true, body: "some data" }
 
- API Schema for /emulator route - https://github.com/Jcole33/cloud-vec/blob/master/amplify/backend/function/emulatorLambda/lib/EmulatorAPI.ts
- API Schema for /session route - https://github.com/Jcole33/cloud-vec/blob/master/amplify/backend/function/sessionLambda/lib/SessionAPI.ts

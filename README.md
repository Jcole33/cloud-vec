## Description ##
Welcome to the github repo for VEC! The two main folders are the amplify and src folders
## src Folder ##
This folder contains the code for our front end. It is a usual html/js/css front end. The index.html page is the main html page while the main.js file generates and handles changes to the ui on that page. The main.js file also handles requests to our API.  The server.js file serves the index.html file along with any dependencies. The style.css file contains our custom css as well as the Bootstrap library's css
## amplify Folder ## 
This folder is generated from the AWS amplify cli tool and is used to manage the backend using a declarative infrastructure as code environment. The bulk of our work is contained within the amplify/backend/function folder. This folder contains all of our AWS Lambda function code. There is a sub folder for each function which contains a lib folder for our written Typescript code. 
## General Types ##
- Schema for commonly used types - https://github.com/Jcole33/cloud-vec/blob/master/amplify/backend/function/sessionLambda/lib/sharedTypes/models.ts
## API Schema ##
- NOTE: all responses are of the form:
    type SuccessResponse<R> = { success: true, body: R } | { success: false, message: string, error?: unknown }
    Meaning that if the spec says "response: string" then the success response is: {success: true, body: "some data" }
 
- API Schema for /emulator route - https://github.com/Jcole33/cloud-vec/blob/master/amplify/backend/function/emulatorLambda/lib/EmulatorAPI.ts
- API Schema for /session route - https://github.com/Jcole33/cloud-vec/blob/master/amplify/backend/function/sessionLambda/lib/SessionAPI.ts

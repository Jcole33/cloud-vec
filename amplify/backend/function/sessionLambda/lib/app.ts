/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_EMULATOR_ARN
	STORAGE_EMULATOR_NAME
	STORAGE_EMULATOR_STREAMARN
	STORAGE_SESSION_ARN
	STORAGE_SESSION_NAME
	STORAGE_SESSION_STREAMARN
Amplify Params - DO NOT EDIT */

import AWS from 'aws-sdk'
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware.js'
import bodyParser from 'body-parser'
import express from 'express'
import {SessionAPI} from './SessionAPI'
import { MethodDefinition } from './sharedTypes/APISpec'
import {Session} from './sharedTypes/models'
import axios from "axios"
import {password} from "./parsecPassword.js"

axios.defaults.headers.post['Content-Type'] = 'application/json';
AWS.config.update({ region: process.env.TABLE_REGION });
if (!process.env.PROXY_PATH) throw "MISSING PROXY PATH"
const proxyPath: string = process.env.PROXY_PATH
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

let tableName = "session";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}
let emulatorTable = "emulator";
if (process.env.ENV && process.env.ENV !== "NONE") {
  emulatorTable = emulatorTable + '-' + process.env.ENV;
}

const partitionKeyName = "userId";
const path = "/session";

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});
/*
can uncomment if we re-enable cognito login
declare module 'express-serve-static-core' {
  interface Request {
    userId: string
  }
}
app.use(function (req, res, next) {
  const userId = req.apiGateway?.event.requestContext.identity.cognitoIdentityId
  req.userId = 'UNAUTHENTICATED'
  if (userId) {
  } else {
    return res.status(403).json({ success: false, message: 'Unauthenticated user' })
  }
  next()
})*/

/*****************************************
* HTTP Get method for get single object *
*****************************************/
type GetDefinition = MethodDefinition<SessionAPI, '/session/{id}', 'get'>

app.get<GetDefinition['params'], GetDefinition['response'], GetDefinition['body'], GetDefinition['query']>(path + "/:id", function (req, res) {
 const getItemParams: AWS.DynamoDB.DocumentClient.GetItemInput = {
   TableName: tableName,
   Key: {
     userId: req.params.id
   },
   ProjectionExpression: 'userId, instanceId'
 }
 dynamodb.get(getItemParams, (err, data) => {
   if (err) {
     res.statusCode = 500
     return res.json({ success: false, message: 'dynamodb error', error: err.message })
   } else {
     if (!data.Item) {
       return res.json({ success: false, message: 'item not found' })
     }
     //@ts-expect-error
     const session: Omit<Session, "instanceStatus"> = data.Item
     ec2.describeInstanceStatus({InstanceIds: [session.instanceId]}, function(err, data) {
      if (err) {
        console.log("Error", err)
        return res.json({ success: false, message: 'describe instance error' })
      } else if (data && data.InstanceStatuses) {
        const status = data.InstanceStatuses[0].InstanceState?.Name
        if (status) {
          res.json({
            success: true,
            body: {...session, instanceStatus: status}
          })
        } else {
          res.status(500).json({
            success: false,
            message: "EC2 status error"
          })
        }
        
      }
     })

     
   }
 })
})

/************************************
* HTTP post method for insert object *
*************************************/
type PostDefinition = MethodDefinition<SessionAPI, '/session', 'post'>

app.post<PostDefinition['params'], PostDefinition['response'], PostDefinition['body'], PostDefinition['query']>(path, async function (req, res) {
  try {
      if (!req.body.emulatorId) return res.status(400).json({success: false, message: "Missing emulatorId in request body"})
      const instanceParams = {
          ImageId: req.body.emulatorId, 
          InstanceType: 't2.micro',
          KeyName: 'cloud',
          MinCount: 1,
          MaxCount: 1
      }
      const instanceData = await ec2.runInstances(instanceParams).promise();
      if (!instanceData.Instances || !instanceData.Instances[0].InstanceId) throw "Instance Start Error!"
      const instanceId =  instanceData.Instances[0].InstanceId 
      //get parsec session id through proxy
      const sessionResponse = await axios.post(proxyPath, {
        password: password
      });
      const session: Omit<Session, "instanceStatus"> = {
        userId: sessionResponse.data.body.session_id,
        instanceId: instanceId
      }
      const putItemParams: AWS.DynamoDB.DocumentClient.PutItemInput = {
        TableName: tableName,
        Item: session,
        ConditionExpression: 'attribute_not_exists(userId)'
      }
      dynamodb.put(putItemParams, (err) => {
        if (err) {
          res.statusCode = 500
          res.json({ success: false, message: 'dynamodb error', error: err })
        } else {
          res.json({ success: true, body: {sessionId: sessionResponse.data.body.session_id} })
        }
      })
    } catch(error) {
      res.statusCode = 500
      res.json({success: false, message: 'Session create error', error: error})
    }
})

/**************************************
* HTTP remove method to delete object *
***************************************/
type DeleteDefinition = MethodDefinition<SessionAPI, '/session/{id}', 'delete'>

app.delete<DeleteDefinition['params'], DeleteDefinition['response'], DeleteDefinition['body'], DeleteDefinition['query']>(path + "/:id", function (req, res) {
  const getItemParams: AWS.DynamoDB.DocumentClient.GetItemInput = {
    TableName: tableName,
    Key: {
      userId: req.params.id
    },
    ProjectionExpression: 'userId, instanceId'
  }
  dynamodb.get(getItemParams, (err, data) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'dynamodb error', error: err.message })
    } else {
      if (!data.Item) {
        return res.status(500).json({ success: false, message: 'item not found' })
      }
      //@ts-ignore
      const session: Session = data.Item
      const params = {
        InstanceIds: [session.instanceId]
      }
      ec2.stopInstances(params, function(err, data) {
        if (err) {
          console.log("Error", err)
          return res.json({ success: false, message: 'stop instance error' })
        } else if (data) {
          console.log("Success", data.StoppingInstances)
          ec2.terminateInstances(params, function(err, data) {
            if (err) {
              console.log("Error", err)
              return res.json({ success: false, message: 'terminate instance error' })
            } else if (data) {
              const removeItemParams: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
                TableName: tableName,
                Key: {
                  userId: req.params.id
                }
              }
              dynamodb.delete(removeItemParams, (err) => {
                if (err) {
                  res.statusCode = 500
                  res.json({ success: false, message: 'dynamodb error', error: err })
                } else {
                  res.json({ success: true, body: 'success' })
                }
              })
            }
          })
        }
      });
    }
  })
})

app.listen(3000, function () {
 console.log('App started')
})

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
export { app }

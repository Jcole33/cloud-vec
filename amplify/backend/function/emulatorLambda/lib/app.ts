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
Amplify Params - DO NOT EDIT */
import AWS from 'aws-sdk'
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware'
import bodyParser from 'body-parser'
import express from 'express'
import {EmulatorAPI} from './EmulatorAPI'
import { MethodDefinition } from './sharedTypes/APISpec'
import {Emulator} from './sharedTypes/models'

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "emulator";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

const uuidRegex = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
const partitionKeyName = "id";
const path = "/emulator";
const hashKeyPath = '/:' + partitionKeyName + '(' + uuidRegex + ')'

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

declare module 'express-serve-static-core' {
  interface Request {
    userId: string
  }
}
app.use(function (req, res, next) {
  const userId = req.apiGateway?.event.requestContext.identity.cognitoIdentityId
  if (userId) {
    req.userId = userId
  } else {
    return res.status(403).json({ success: false, message: 'Unauthenticated user' })
  }
  next()
})

/********************************
 * HTTP Get method for list objects *
 ********************************/

 type ListDefinition = MethodDefinition<EmulatorAPI, '/emulator', 'get'>

 app.get<ListDefinition['params'], ListDefinition['response'], ListDefinition['body'], ListDefinition['query']>(path, function (req, res) {
  const queryParams: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: tableName,
    ProjectionExpression: 'id, #name, info',
    ExpressionAttributeNames: {
      '#name': 'name'
    }
  }
  dynamodb.query(queryParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({success: false, message: 'Could not load items', error: err});
    } else {
      if (!data.Items) {
        return res.json({ success: false, message: 'item not found' })
      }
      //hate doing this, but trying to tell typescript what the type of item is is just too much atm
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const emulators: Emulator[] = data.Items
      res.json({
        success: true,
        body: emulators
      })
    }
  });
});

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/
 type GetDefinition = MethodDefinition<EmulatorAPI, '/emulator/{id}', 'get'>

 app.get<GetDefinition['params'], GetDefinition['response'], GetDefinition['body'], GetDefinition['query']>(path + hashKeyPath, function (req, res) {
  const getItemParams: AWS.DynamoDB.DocumentClient.GetItemInput = {
    TableName: tableName,
    Key: {
      id: req.params.id
    },
    ProjectionExpression: 'id, #name, info',
    ExpressionAttributeNames: {
      '#name': 'name'
    }
  }
  dynamodb.get(getItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500
      return res.json({ success: false, message: 'dynamodb error', error: err.message })
    } else {
      if (!data.Item) {
        return res.json({ success: false, message: 'item not found' })
      }
      //hate doing this, but trying to tell typescript what the type of item is is just too much atm
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const emulator: Emulator = data.Item
      res.json({
        success: true,
        body: emulator
      })
    }
  })
})

app.listen(3000, function() {
  console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
export { app }

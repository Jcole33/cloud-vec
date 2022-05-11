"use strict";
/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.app = void 0;
/* Amplify Params - DO NOT EDIT
    ENV
    REGION
    STORAGE_EMULATOR_ARN
    STORAGE_EMULATOR_NAME
    STORAGE_EMULATOR_STREAMARN
Amplify Params - DO NOT EDIT */
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var middleware_1 = __importDefault(require("aws-serverless-express/middleware"));
var body_parser_1 = __importDefault(require("body-parser"));
var express_1 = __importDefault(require("express"));
aws_sdk_1["default"].config.update({ region: process.env.TABLE_REGION });
var dynamodb = new aws_sdk_1["default"].DynamoDB.DocumentClient();
var tableName = "emulator";
if (process.env.ENV && process.env.ENV !== "NONE") {
    tableName = tableName + '-' + process.env.ENV;
}
var uuidRegex = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';
var partitionKeyName = "id";
var path = "/emulator";
var hashKeyPath = '/:' + partitionKeyName + '(' + uuidRegex + ')';
// declare a new express app
var app = (0, express_1["default"])();
exports.app = app;
app.use(body_parser_1["default"].json());
app.use(middleware_1["default"].eventContext());
// Enable CORS for all methods
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});
app.use(function (req, res, next) {
    var _a;
    var userId = (_a = req.apiGateway) === null || _a === void 0 ? void 0 : _a.event.requestContext.identity.cognitoIdentityId;
    if (userId) {
        req.userId = userId;
    }
    else {
        return res.status(403).json({ success: false, message: 'Unauthenticated user' });
    }
    next();
});
app.get(path, function (req, res) {
    var queryParams = {
        TableName: tableName,
        ProjectionExpression: 'id, #name, info',
        ExpressionAttributeNames: {
            '#name': 'name'
        }
    };
    dynamodb.query(queryParams, function (err, data) {
        if (err) {
            res.statusCode = 500;
            res.json({ success: false, message: 'Could not load items', error: err });
        }
        else {
            if (!data.Items) {
                return res.json({ success: false, message: 'item not found' });
            }
            //hate doing this, but trying to tell typescript what the type of item is is just too much atm
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            var emulators = data.Items;
            res.json({
                success: true,
                body: emulators
            });
        }
    });
});
app.get(path + hashKeyPath, function (req, res) {
    var getItemParams = {
        TableName: tableName,
        Key: {
            id: req.params.id
        },
        ProjectionExpression: 'id, #name, info',
        ExpressionAttributeNames: {
            '#name': 'name'
        }
    };
    dynamodb.get(getItemParams, function (err, data) {
        if (err) {
            res.statusCode = 500;
            return res.json({ success: false, message: 'dynamodb error', error: err.message });
        }
        else {
            if (!data.Item) {
                return res.json({ success: false, message: 'item not found' });
            }
            //hate doing this, but trying to tell typescript what the type of item is is just too much atm
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            var emulator = data.Item;
            res.json({
                success: true,
                body: emulator
            });
        }
    });
});
app.listen(3000, function () {
    console.log("App started");
});

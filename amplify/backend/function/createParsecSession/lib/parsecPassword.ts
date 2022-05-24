import SSM from 'aws-sdk/clients/ssm.js'
if (!process.env.PARSEC_PASSWORD) throw 'MISSING API KEY ENV!'

const ENCRYPTED_NAME = process.env.PARSEC_PASSWORD
const { Parameters } = await (new SSM({ region: process.env.TABLE_REGION }))
    .getParameters({
        Names: [ENCRYPTED_NAME],
        WithDecryption: true,
    })
    .promise()

const password = Parameters?.find((param) => param.Name == ENCRYPTED_NAME)?.Value
if (!password) throw 'MISSING REAL API KEY!'


export { password }
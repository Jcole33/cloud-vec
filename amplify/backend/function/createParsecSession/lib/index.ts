
import axios from "axios"
import {password} from "./parsecPassword.js"

export const handler = async (): Promise<{success: true, body: unknown} | {success: false, message: string}> => {
    try {

        const sessionResponse = await axios({
            method: 'post',
            url: 'https://kessel-api.parsecgaming.com/v1/auth',
            headers: {
              'Content-Type': 'application/json'
            }, 
            data: {
              email: "unluckywizard33@gmail.com",
              password: password
            }
        })
        return { success: true, body: sessionResponse.data }
    } catch(error) {
        console.log(error)
        return {success: false, message: "login error"}
    }
}

import { User } from "../entities/user.entities"
import { apiError } from "./apiError"

type tokens={
    accessToken:string,
    refreshToken:string
}



export const generateAccessAndRefreshTokens= async (userId:string):Promise<tokens>=>{
    try {
        
       const user= await User.findOneBy({ id: userId })


        if(!user){
            throw new apiError(404, "user not found")
        }
        const accessToken= user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        if(!accessToken || !refreshToken){
            throw new apiError(400,"token was not generated")
        }

        user.accessToken=accessToken
        user.refreshToken=refreshToken
       await user.save()

        return {accessToken , refreshToken}



    } catch (error) {
        throw error
    }
}
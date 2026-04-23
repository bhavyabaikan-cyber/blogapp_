import jwt from 'jsonwebtoken'
const { verify } = jwt
import { config } from 'dotenv'
config()


export const verifyToken = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            //get token from cookie
            const token = req.cookies?.token
            //check token existed or not
            if (!token) {
                return res.status(401).json({ message: "Please login" })
            }
            //validate token(decode the token)
            let decodedToken = verify(token, process.env.SECRET_KEY)
            //check the role is same as role in decodedToken
            if (!allowedRoles.includes(decodedToken.role)) {
                return res.status(403).json({ message: "You are not authorised" })
            }
            //add decoded token
            req.user = decodedToken
            //call next
            next()
        } catch (err) {
            res.status(401).json({ message: "Invalid token" })
        }
    }
}


// export function verifyToken(req, res, next) {
//     try {
//         //get token from cookie
//         const token = req.cookies?.token
//         //check token existed or not
//         if (!token) {
//             return res.status(401).json({ message: "Please login" })
//         }

//         //validate token(decode the token)
//         let decodedToken = verify(token, process.env.SECRET_KEY)
//         //check the role is same as role in decodedToken

//         //add decoded token
//         req.user = decodedToken
//         //call next
//         next()
//     } catch (err) {
//         res.status(401).json({ message: "Invalid token" })
//     }
// }
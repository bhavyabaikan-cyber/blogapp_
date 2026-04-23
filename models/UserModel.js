import {Schema,model} from 'mongoose'

const UserSchema = new Schema({
    firstName : {
        type : String,
        required : [true,"First name is required"],
    },
    lastNamse : {
        type : String,
    },
    email : {
        type : String,
        required : [true,"Email is required"],
        unique : true
    },
    password : {
        type : String,
        required : [true,"Password required"],
    },
    role : {
        type : String,
        enum : ["USER","AUTHOR","ADMIN"],
        required :[true,"invalid role"]
    },
    profileImageUrl :{
        type : String,
    },
    isUserActive : {
        type : Boolean,
        default : true,
    }},{
        timestamps: true,
        versionKey: false,
        strict :"throws"
    
})

export const UserModel = model("user",UserSchema)
const mongoose =require('mongoose');
const Schema=mongoose.Schema;
const UserSchema=  new Schema({
   firstName:{
       type:String,
       required:true
   },
    lastName:{
       type:String,
        required: true
    },
    phoneNumber:{
       type:Number,
        required:true
    },
    email:{
       type:String,
        required:true
    },
    password:{
       type:String,
        required: true
    },

    reset_password_token:{
       type:String,

    },
    reset_password_expires:{
       type:String
    },
    date:{
        type:Date,
        default:Date.now
    },


});
const user = mongoose.model('users', UserSchema);
module.exports=user;

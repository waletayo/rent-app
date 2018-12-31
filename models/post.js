const mongoose= require('mongoose');
const Schema= mongoose.Schema;
const PostSchema =Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required: true
    },
    negotiable:{
        type:Boolean,
        default:false
    },
    postImg:{
        type:String
    },
    likes: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'

            }
        }
    ],
    comment: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref:
                    'users'
            },
            text: {
                type: String,
                required: true
            },
            name: {
                type: String
            },
            avatar: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }



});
const post = mongoose.model('post', PostSchema);
module.exports=post;

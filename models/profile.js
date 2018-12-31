const mongoose =require('mongoose');
const Schema= mongoose.Schema;
const profileSchema= new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },
    fName:{
      type:String,
      required:true
    },
    username:{
        type: String,
        required:true
    },
    Dob:{
      type:String,
      required:true
    },
    hobbies:{
        type:String,
        required:true
    },
    mobile:{
      type:Number
    },
    location:[
        {
            country:{
                type:String
            },
            state:{
                type:String
            },
            city:{
                type:String
            },
            haddress:{
                type:String
            }
        }
    ],
    student:[
        {
            school:{
                type:String,
                required:false
            },
            degree:{
                type:String,

            },
            fieldOfStudy: {
                type:String,
            },
            from:{
                type:String,

            },
            to:{
                type:String,

            },
            current:{
                type:Boolean,
                required:false


            },
            description:{
                type:String,


            }

        }
    ],
    social:{
        youtube:{
            type:String
        },
        twitter:{
            type:String
        },
        facebook :{
            type:String,
            required:true
        },
        linkdin:{
            type:String
        },
        instagram:{
            type:String
        },
        date:{
            type:Date,
            default:Date.now
        }
    },

    profileImg:[
        {
            imgUp:{
                type:String,
                required:true
            }
        }
    ]



});

const profile = mongoose.model('profile', profileSchema);
module.exports=profile;

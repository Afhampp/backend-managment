const mongoose =require('mongoose')
const studentscema=mongoose.Schema({
    name: {type:String, 
        required: true,
    },
    email: {type:String, 
        required: true,
    },
    password:  {
        type:String, 
        required: true
    },
    phone: {type:String, 
        required: true,
    },
    image:{type:String
    },
   
})

module.exports=mongoose.model('studentdb',studentscema)
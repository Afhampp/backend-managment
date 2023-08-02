const mongoose =require('mongoose')
const assigmentschema=mongoose.Schema({
  
    name: {type:String, 
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacherdb',
      },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'classdb',
      },
    from:{
        type:Date
    },
    to:{
        type:Date
    },
    file:{
        type:String
    },
    submittion:[{
        student:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'studentdb',
        },
        file:{
            type:String
        },
        date:{
            type:Date,
        }

    }
    ]
   
})

module.exports=mongoose.model('assigmentdb',assigmentschema)
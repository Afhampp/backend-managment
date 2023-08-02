const mongoose =require('mongoose')
const notesschema=mongoose.Schema({
  
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
    file:{
        type:String
    }
   
})

module.exports=mongoose.model('notesdb',notesschema)
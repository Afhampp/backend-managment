const mongoose =require('mongoose')
const subjectschema=mongoose.Schema({
  
    subject: {type:String, 
        required: true,
    }
   
})

module.exports=mongoose.model('subjectdb',subjectschema)
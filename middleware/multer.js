const path=require('path')
const multer=require('multer')

var storage= multer.diskStorage({
    destination:'./public/images/uploads/',
 
    filename:function(req,file,cb){
        console.log("hai")
        let ext=path.extname(file.originalname)
        cb(null,Date.now()+ext)
    }
})
var upload=multer({
    storage:storage,
   
})
module.exports=upload
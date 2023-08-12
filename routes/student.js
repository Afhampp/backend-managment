var express = require('express');
var router = express.Router();
const studentcontroller=require('../controllers/studentcontroller')
const assigmentcontroller=require('../controllers/assignementcontroller')
const jwt=require('../middleware/jwt')
const upload=require('../middleware/multer')

/* GET home page. */
router.post('/login',studentcontroller.studentlogin )
router.get('/getassigment',jwt,assigmentcontroller.getstudentassigment)
router.get('/getnotes',jwt,studentcontroller.getnotes)
router.put('/assigmentsubmittion/:id',jwt,upload.single('file'),assigmentcontroller.assigmentsubmittion)
router.get('/getstudentid',jwt,studentcontroller.getstudentid)
router.get('/getattendace',jwt,studentcontroller.getattendace)
router.get('/getclass',studentcontroller.getclass)


module.exports = router;

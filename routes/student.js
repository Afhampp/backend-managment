var express = require('express');
var router = express.Router();
const studentcontroller=require('../controllers/studentcontroller')
const assigmentcontroller=require('../controllers/assignementcontroller')
const jwt=require('../middleware/jwt/jwt_student')
const upload=require('../middleware/multer')

/* GET home page. */
router.get('/',studentcontroller.mock)
router.post('/login',studentcontroller.studentlogin )
router.get('/getassigment',jwt,assigmentcontroller.getstudentassigment)
router.get('/getnotes',jwt,studentcontroller.getnotes)
router.put('/assigmentsubmittion/:id',jwt,upload.single('file'),assigmentcontroller.assigmentsubmittion)
router.get('/getstudentid',jwt,studentcontroller.getstudentid)
router.get('/getattendace',jwt,studentcontroller.getattendace)
router.get('/getclass',studentcontroller.getclass)
router.get('/getcountstudent',jwt,studentcontroller.getcountstudent)
router.put('/profilechange',jwt,upload.single('file'),studentcontroller.profilechange)
router.get('/getprofile',studentcontroller.getprofile)
router.put('/forgetpass',studentcontroller.forgetpass)


module.exports = router;

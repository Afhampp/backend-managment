var express = require('express');
var router = express.Router();
const teacherconroller=require('../controllers/teachercontroller')
const assigmentcontroller=require('../controllers/assignementcontroller')
const notecontroller=require('../controllers/notecontroller')
const jwt=require('../middleware/jwt')
const upload=require('../middleware/multer')

/* GET home page. */
router.post('/login',teacherconroller.teacherlogin )
router.get('/getstuentfromclass/:id',teacherconroller.getstudentfromclass)
router.get('/getclasses',jwt,teacherconroller.getclasses)
router.post('/assigemntquestion', jwt, upload.single('file'), assigmentcontroller.postassigment);
router.get('/showassigment',jwt,assigmentcontroller.showassigment)
router.get('/getbaseurl/:fileName',teacherconroller.baseurl)
router.put('/updateassignment/:id', upload.single('file'),assigmentcontroller.updateassignment)
router.delete('/assigmentdelete/:id',assigmentcontroller.deleteassigment)
router.get('/getassigmentsubmitted/:id',assigmentcontroller.getassigmentsubmitted)
router.get('/getteacherid',jwt,teacherconroller.getteacherid)
router.get('/shownotes',jwt,notecontroller.shownotes)
router.post('/notesubmittion',jwt,upload.single('file'),notecontroller.postnotes)
router.put('/updatenotes/:id',upload.single('file'),notecontroller.updatenotes)
router.delete('/deletenotes/:id',notecontroller.deletenotes)
router.get('/getattendancedata/:id',jwt,teacherconroller.getattendacedata)
router.put('/addattendace',teacherconroller.addattendace)
router.get('/getattedancedate/:classid',jwt, teacherconroller.getattedancedate);
router.put('/updateattendace',teacherconroller.updateattendace)
router.put('/updatemark',assigmentcontroller.updatemark)


module.exports = router;

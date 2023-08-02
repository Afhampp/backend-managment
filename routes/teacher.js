var express = require('express');
var router = express.Router();
const teacherconroller=require('../controllers/teachercontroller')
const jwt=require('../middleware/jwt')
const upload=require('../middleware/multer')

/* GET home page. */
router.post('/login',teacherconroller.teacherlogin )
router.get('/getstuentfromclass/:id',teacherconroller.getstudentfromclass)
router.get('/getclasses',jwt,teacherconroller.getclasses)
router.post('/assigemntquestion', jwt, upload.single('file'), teacherconroller.postassigment);
router.get('/showassigment',jwt,teacherconroller.showassigment)
router.get('/getbaseurl/:fileName',teacherconroller.baseurl)
router.put('/updateassignment/:id', upload.single('file'),teacherconroller.updateassignment)
router.delete('/assigmentdelete/:id',teacherconroller.deleteassigment)
router.get('/getassigmentsubmitted/:id',teacherconroller.getassigmentsubmitted)
router.get('/getteacherid',jwt,teacherconroller.getteacherid)
router.get('/shownotes',jwt,teacherconroller.shownotes)
router.post('/notesubmittion',jwt,upload.single('file'),teacherconroller.postnotes)
router.put('/updatenotes/:id',upload.single('file'),teacherconroller.updatenotes)
router.delete('/deletenotes/:id',teacherconroller.deletenotes)

module.exports = router;

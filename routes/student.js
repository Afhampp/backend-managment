var express = require('express');
var router = express.Router();
const studentcontroller=require('../controllers/studentcontroller')
const jwt=require('../middleware/jwt')
const upload=require('../middleware/multer')

/* GET home page. */
router.post('/login',studentcontroller.studentlogin )
router.get('/getassigment',jwt,studentcontroller.getassigment)
router.get('/getnotes',jwt,studentcontroller.getnotes)
router.put('/assigmentsubmittion/:id',jwt,upload.single('file'),studentcontroller.assigmentsubmittion)
router.get('/getstudentid',jwt,studentcontroller.getstudentid)


module.exports = router;

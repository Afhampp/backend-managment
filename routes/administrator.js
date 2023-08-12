var express = require('express');
var router = express.Router();
const admincontroller=require('../controllers/admincontroller')
const jwt=require('../middleware/jwt');
const admin = require('../models/admin');

/* GET users listing. */
router.post('/login',admincontroller.adminlogin )
router.post('/addteacher',admincontroller.addtecher )
router.post('/subjectadd',admincontroller.addsubject )
router.get('/getteacher',jwt,admincontroller.getteacher)
router.get('/getsubject',admincontroller.getsubject)
router.get('/getstudent',admincontroller.getstudent)
router.get('/getclass',admincontroller.getclass)
router.get('/getclassstudent/:id',admincontroller.getclassstudent)
router.put('/updatedata/:id',admincontroller.updateteacher)
router.put('/updatesubject/:id',admincontroller.updatesubject)
router.delete('/deletedata/:id',admincontroller.deleteteacher)
router.delete('/deletesubject/:id',admincontroller.deletesubject)
router.post('/addstudent',admincontroller.addstudent)
router.put('/updatestudent/:id',admincontroller.updatestudent)
router.delete('/deletestudent/:id',admincontroller.deletestudent)
router.post('/addclass',admincontroller.addclass)
router.delete('/deleteclass/:id',admincontroller.deletaclass)
router.put('/updateclass/:id',admincontroller.updateclass)
router.get('/getclass/:id',admincontroller.getclassid)
router.post('/teachertoclass/:id',admincontroller.teachertoclass)
router.put('/removeteacher/:id',admincontroller.removeteacher)
router.post('/studenttoclass/:id',admincontroller.studenttoclass)
router.put('/removestudent/:id',admincontroller.removestudent)
router.get('/getclassschedule/:id',admincontroller.getschedule)
router.put('/updateschedule/:id',admincontroller.updateshedule)
router.get('/getcount',admincontroller.getcount)

module.exports = router;

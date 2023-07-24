var express = require('express');
var router = express.Router();
const teacherconroller=require('../controllers/teachercontroller')
const jwt=require('../middleware/jwt')

/* GET home page. */
router.post('/login',teacherconroller.teacherlogin )
router.get('/getstuentfromclass/:id',teacherconroller.getstudentfromclass)
router.get('/getclasses',jwt,teacherconroller.getclasses)

module.exports = router;

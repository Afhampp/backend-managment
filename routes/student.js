var express = require('express');
var router = express.Router();
const studentcontroller=require('../controllers/studentcontroller')
const jwt=require('../middleware/jwt')

/* GET home page. */
router.post('/login',studentcontroller.studentlogin )


module.exports = router;

const cloudinary = require('cloudinary').v2;
  
cloudinary.config({ 
  cloud_name: 'dbin1cdds', 
  api_key:"578993181531165", 
  api_secret:"lwjoU_2uNf5EfgALis5LgsflB3w",
  secure: true
});

module.exports = cloudinary;
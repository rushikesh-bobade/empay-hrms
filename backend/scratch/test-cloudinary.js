require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Testing Cloudinary Connection...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.api.ping()
  .then(result => {
    console.log('✅ Cloudinary Connection Successful:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Cloudinary Connection Failed:');
    console.error(error);
    process.exit(1);
  });

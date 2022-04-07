import mongoose from 'mongoose';

try {
  mongoose.connect(process.env.MONGODB_URI!)
  console.log('DB Connected')
} catch (err) {
  console.log(err)
  console.log('Error')
}
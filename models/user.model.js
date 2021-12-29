import mongoose from 'mongoose';
import validator from 'validator';

const User = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        maxLength: [30, 'Please enter at most 30 characters'],
        minLength: [4, 'Name must be at least 4 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email address'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minLength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    roles: {
        type: String,
        default: 'guest'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})
export default mongoose.model('User', User)
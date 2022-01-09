import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

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
        minLength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    active: {
        type: Boolean,
        default: false
    },
    tokenForSignup: String,
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

// User.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//         next()
//     }
//     this.password = await bcrypt.hash(this.password, 10)
// })
export default mongoose.model('User', User)
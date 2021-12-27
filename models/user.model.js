import mongoose from 'mongoose';

const User = mongoose.model({
    email: String,
    password: String,
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }]
})
export default mongoose.Schema('User', User)
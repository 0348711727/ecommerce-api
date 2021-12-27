import mongoose from 'mongoose';
const Role = mongoose.model({
    name: String
})
export default mongoose.Schema('Roles', Role)
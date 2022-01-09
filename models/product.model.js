import mongoose from 'mongoose';

const Product = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter product Name"]
    },
    description: {
        type: String,
        required: [true, "Please Enter description"]
    },
    price: {
        type: Number,
        required: [true, "Please Enter Price"],
        maxLength: [8, "Price can't exceed with 8 character"]
    },
    rating: {
        type: Number,
        default: 0
    },
    images: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    category: {
        type: String,
        required: [true, "Please Enter Product Category"]
    },
    stock: {
        type: String,
        required: [true, "Please Enter Stock"],
        maxLength: [4, "Stock can't exceed 4 characters"],
        default: 1
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviewers: [
        {
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comments: {
                type: String,
                required: true
            }

        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('Products', Product);
const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
    },
    email: {
        required: true,
        type: String,
    },
    email: {
        required: true,
        type: String,
    },
    password: {
        required: true,
        type: String,
    },
    stocks: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Stock',
    }
}, { timestamps: true }

)

module.exports = mongoose.model('user', userSchema);

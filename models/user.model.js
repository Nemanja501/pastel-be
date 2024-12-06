const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String, 
        requred: true
    },
    profilePicUrl: {
        type: String,
        default: null
    }
});

module.exports = mongoose.model('User', userSchema);
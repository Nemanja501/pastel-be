const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const postSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
}, {timestamps: true});

module.exports = mongoose.model('Post', postSchema);
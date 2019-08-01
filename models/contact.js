var mongoose = require('mongoose');
const validator = require('validator');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },

    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        validate: {
            validator: validator.isEmail,
            message: "Email invalide"
        },
        unique: true
    },
    subject: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true

    },
    dateReq: {
        type: Date,
        default: new Date()
    },



});

module.exports = mongoose.model('contactrequests', blogSchema);

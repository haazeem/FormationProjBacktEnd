var mongoose = require('mongoose');
const validator = require('validator');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
    nom: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },
    prenom: {
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
    password: String,
    role: {
        type: String
    },
    status: {
        type: Boolean,
        default: false
    },
    secret_key: {
        type: String,
        default: null
    },
    dateConnexion: {
        type: Date,
        default: null
    },
    dateDeconexion: {
        type: Date,
        default: null
    },
    nbrRequest: {
        type: Number,
        default: 0
    },
    maxrequest: {
        type: Number
    },
    totalFileSize: {
        type: Number,
        default : 0
    }
});

module.exports = mongoose.model('user', blogSchema);

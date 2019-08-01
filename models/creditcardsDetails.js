var mongoose = require('mongoose');
const validator = require('validator');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
    idUser: {
        type: String,
        required: true,
    },
    nameCard: {
        type: String,
        required: true
    },
    creditnumber: {
        type: String,
        required: true,
        maxlength: 16,
        minlength: 16
    },
    cvvNumber: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 3
    },
    monthExpr: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 2
    },
    yearExpr: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 4
    },
    dateSubscribe: {
        type: Date,
        default: new Date()
    }

});

module.exports = mongoose.model('creditCardsDetail', blogSchema);

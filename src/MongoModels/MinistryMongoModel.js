import mongoose from 'mongoose';

const ministrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
    leaderId: {
        type: String,
    },
    contactEmail: {
        type: String,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Ministry = mongoose.model('Ministry', ministrySchema);

export default Ministry;

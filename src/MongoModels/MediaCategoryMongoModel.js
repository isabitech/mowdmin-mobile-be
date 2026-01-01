import mongoose from 'mongoose';

const MediaCategoryMongoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
}, {
  timestamps: true,
  collection: 'media_categories',
});

export default mongoose.model('MediaCategoryMongo', MediaCategoryMongoSchema);

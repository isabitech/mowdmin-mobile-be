
let MediaBookmarkModel;
let UserModel;
let MediaModel;

const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const MediaBookmarkRepository = {
  async getModels() {
    if (!MediaBookmarkModel || (!isMongo && (!UserModel || !MediaModel))) {
      if (isMongo) {
        MediaBookmarkModel = (await import('../MongoModels/MediaBookmarksMongoModel.js')).default;
        UserModel = (await import('../MongoModels/UserMongoModel.js')).default;
        MediaModel = (await import('../MongoModels/MediaMongoModel.js')).default;
      } else {
        MediaBookmarkModel = (await import('../Models/MediaBookmarksModel.js')).default;
        UserModel = (await import('../Models/UserModel.js')).default;
        MediaModel = (await import('../Models/MediaModel.js')).default;
      }
    }
    return { MediaBookmarkModel, UserModel, MediaModel };
  },

  async create(payload) {
    const { MediaBookmarkModel } = await this.getModels();
    return MediaBookmarkModel.create(payload);
  },

  async findAll(options = {}) {
    const { MediaBookmarkModel, UserModel, MediaModel } = await this.getModels();
    if (isMongo) {
      return MediaBookmarkModel.find({})
        .populate('userId', 'name email')
        .populate('mediaId');
    } else {
      return MediaBookmarkModel.findAll({
        ...options,
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name', 'email']
          },
          {
            model: MediaModel,
            as: 'media'
          }
        ]
      });
    }
  },

  async findAllByUserId(userId, options = {}) {
    const { MediaBookmarkModel, MediaModel } = await this.getModels();
    if (isMongo) {
      return MediaBookmarkModel.find({ userId, ...options })
        .populate('mediaId');
    } else {
      return MediaBookmarkModel.findAll({
        where: { userId },
        ...options,
        include: [
          {
            model: MediaModel,
            as: 'media'
          }
        ]
      });
    }
  },

  async findById(id, options = {}) {
    const { MediaBookmarkModel, UserModel, MediaModel } = await this.getModels();
    if (isMongo) {
      return MediaBookmarkModel.findById(id)
        .populate('userId', 'name email')
        .populate('mediaId');
    } else {
      return MediaBookmarkModel.findByPk(id, {
        ...options,
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name', 'email']
          },
          {
            model: MediaModel,
            as: 'media'
          }
        ]
      });
    }
  },

  async updateById(id, payload, options = {}) {
    const { MediaBookmarkModel } = await this.getModels();
    if (isMongo) {
      return MediaBookmarkModel.findByIdAndUpdate(id, payload, { new: true });
    } else {
      return MediaBookmarkModel.update(payload, { where: { id }, returning: true, ...options });
    }
  },

  async deleteById(id, options = {}) {
    const { MediaBookmarkModel } = await this.getModels();
    if (isMongo) {
      const result = await MediaBookmarkModel.findByIdAndDelete(id);
      return !!result;
    } else {
      return MediaBookmarkModel.destroy({ where: { id }, ...options });
    }
  },
};

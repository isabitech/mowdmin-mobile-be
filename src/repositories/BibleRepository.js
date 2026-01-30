let BibleStoryModel;
let BibleVerseModel;

const isMongo = process.env.DB_CONNECTION === 'mongodb';

export const BibleRepository = {
    async getModels() {
        if (!BibleStoryModel || !BibleVerseModel) {
            if (isMongo) {
                BibleStoryModel = (await import('../MongoModels/BibleStoryMongoModel.js')).default;
                BibleVerseModel = (await import('../MongoModels/BibleVerseMongoModel.js')).default;
            } else {
                BibleStoryModel = (await import('../Models/BibleStoryModel.js')).default;
                BibleVerseModel = (await import('../Models/BibleVerseModel.js')).default;
            }
        }
        return { BibleStoryModel, BibleVerseModel };
    },

    // Bible Story Methods
    async findAllStories(filters = {}) {
        const { BibleStoryModel } = await this.getModels();
        if (isMongo) {
            await import('../MongoModels/MediaMongoModel.js');
            return BibleStoryModel.find(filters).populate('media').sort({ order: 1 });
        }
        const Media = (await import('../Models/MediaModel.js')).default;
        return BibleStoryModel.findAll({
            where: filters,
            include: [{ model: Media, as: 'media' }],
            order: [['order', 'ASC']]
        });
    },

    async createStory(data) {
        const { BibleStoryModel } = await this.getModels();
        return BibleStoryModel.create(data);
    },

    // Bible Verse Methods
    async findAllVerses(filters = {}) {
        const { BibleVerseModel } = await this.getModels();
        if (isMongo) return BibleVerseModel.find(filters);
        return BibleVerseModel.findAll({ where: filters });
    },

    async findDailyVerse() {
        const { BibleVerseModel } = await this.getModels();
        if (isMongo) return BibleVerseModel.findOne({ isDaily: true });
        return BibleVerseModel.findOne({ where: { isDaily: true } });
    },

    async createVerse(data) {
        const { BibleVerseModel } = await this.getModels();
        return BibleVerseModel.create(data);
    }
};

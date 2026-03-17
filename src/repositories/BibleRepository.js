let BibleStoryModel;
let BibleVerseModel;

const isMongo = process.env.DB_CONNECTION === "mongodb";
const DEFAULT_BIBLE_PAGE_SIZE = 20;
const MAX_BIBLE_PAGE_SIZE = 100;

const getPagination = (filters = {}) => {
  const parsedLimit = Number.parseInt(filters.limit, 10);
  const parsedOffset = Number.parseInt(filters.offset, 10);
  return {
    limit:
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_BIBLE_PAGE_SIZE)
        : DEFAULT_BIBLE_PAGE_SIZE,
    offset:
      Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0,
  };
};

export const BibleRepository = {
  async getModels() {
    if (!BibleStoryModel || !BibleVerseModel) {
      if (isMongo) {
        BibleStoryModel = (
          await import("../MongoModels/BibleStoryMongoModel.js")
        ).default;
        BibleVerseModel = (
          await import("../MongoModels/BibleVerseMongoModel.js")
        ).default;
      } else {
        BibleStoryModel = (await import("../Models/BibleStoryModel.js"))
          .default;
        BibleVerseModel = (await import("../Models/BibleVerseModel.js"))
          .default;
      }
    }
    return { BibleStoryModel, BibleVerseModel };
  },

  // Bible Story Methods
  async findAllStories(filters = {}) {
    const { BibleStoryModel } = await this.getModels();
    const { limit, offset } = getPagination(filters);
    const { limit: _limit, offset: _offset, ...where } = filters;
    if (isMongo) {
      await import("../MongoModels/MediaMongoModel.js");
      return BibleStoryModel.find(where)
        .populate("media", "title media_url type thumbnail")
        .sort({ order: 1 })
        .skip(offset)
        .limit(limit)
        .lean();
    }
    const Media = (await import("../Models/MediaModel.js")).default;
    return BibleStoryModel.findAll({
      where,
      include: [{ model: Media, as: "media" }],
      order: [["order", "ASC"]],
      offset,
      limit,
    });
  },

  async createStory(data) {
    const { BibleStoryModel } = await this.getModels();
    return BibleStoryModel.create(data);
  },

  // Bible Verse Methods
  async findAllVerses(filters = {}) {
    const { BibleVerseModel } = await this.getModels();
    const { limit, offset } = getPagination(filters);
    const { limit: _limit, offset: _offset, ...where } = filters;
    if (isMongo)
      return BibleVerseModel.find(where).skip(offset).limit(limit).lean();
    return BibleVerseModel.findAll({ where, offset, limit });
  },

  async findDailyVerse() {
    const { BibleVerseModel } = await this.getModels();
    if (isMongo) return BibleVerseModel.findOne({ isDaily: true });
    return BibleVerseModel.findOne({ where: { isDaily: true } });
  },

  async createVerse(data) {
    const { BibleVerseModel } = await this.getModels();
    return BibleVerseModel.create(data);
  },
};

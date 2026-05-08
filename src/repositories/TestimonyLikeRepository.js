import mongoose from "mongoose";

let TestimonyLikeModel;

const getIsMongo = () => process.env.DB_CONNECTION === "mongodb";

class TestimonyLikeRepository {
  isValidId(id) {
    if (!getIsMongo()) return true;
    return mongoose.Types.ObjectId.isValid(id);
  }

  async getModel() {
    if (!TestimonyLikeModel) {
      TestimonyLikeModel = (
        await import("../MongoModels/TestimonyLikeMongoModel.js")
      ).default;
    }
    return TestimonyLikeModel;
  }

  async findOne(testimonyId, userId, options = {}) {
    const Model = await this.getModel();
    if (!this.isValidId(testimonyId) || !this.isValidId(userId)) return null;
    let query = Model.findOne({ testimonyId, userId });
    if (options.session) {
      query = query.session(options.session);
    }
    return query.lean();
  }

  async create(data, options = {}) {
    const Model = await this.getModel();
    return Model.create([data], { session: options.session }).then(
      ([document]) => document,
    );
  }

  async deleteByTestimonyAndUser(testimonyId, userId, options = {}) {
    const Model = await this.getModel();
    if (!this.isValidId(testimonyId) || !this.isValidId(userId)) return false;
    const result = await Model.deleteOne(
      { testimonyId, userId },
      { session: options.session },
    );
    return result.deletedCount > 0;
  }

  async deleteManyByTestimonyId(testimonyId, options = {}) {
    const Model = await this.getModel();
    if (!this.isValidId(testimonyId)) return 0;
    const result = await Model.deleteMany(
      { testimonyId },
      { session: options.session },
    );
    return result.deletedCount || 0;
  }

  async findLikedTestimonyIdsByUserId(userId) {
    const Model = await this.getModel();
    if (!this.isValidId(userId)) return [];
    const likes = await Model.find({ userId }).select("testimonyId").lean();
    return likes.map((like) => like.testimonyId?.toString());
  }
}

export default new TestimonyLikeRepository();

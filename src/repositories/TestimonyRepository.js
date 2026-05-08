import mongoose from "mongoose";

let TestimonyModel;
let UserModel;

const getIsMongo = () => process.env.DB_CONNECTION === "mongodb";

const populateAuthor = (query) => query.populate("userId", "name photo");

const selectFields =
  "userId title description isPublic likeCount commentCount createdAt updatedAt";

class TestimonyRepository {
  isValidId(id) {
    if (!getIsMongo()) return true;
    return mongoose.Types.ObjectId.isValid(id);
  }

  async getModel() {
    if (!TestimonyModel) {
      TestimonyModel = (await import("../MongoModels/TestimonyMongoModel.js"))
        .default;
    }
    if (!UserModel) {
      UserModel = (await import("../MongoModels/UserMongoModel.js")).default;
    }
    return TestimonyModel;
  }

  async create(testimonyData, options = {}) {
    const Model = await this.getModel();
    const testimony = new Model(testimonyData);
    return testimony.save({ session: options.session });
  }

  async getPublic(options = {}) {
    const Model = await this.getModel();
    let query = Model.find({ isPublic: true }).select(selectFields);
    query = populateAuthor(query).sort({ createdAt: -1 });
    if (options.session) {
      query = query.session(options.session);
    }
    return query.lean();
  }

  async getByUserId(userId, options = {}) {
    const Model = await this.getModel();
    let query = Model.find({ userId }).select(selectFields);
    query = populateAuthor(query).sort({ createdAt: -1 });
    if (options.session) {
      query = query.session(options.session);
    }
    return query.lean();
  }

  async getById(id, options = {}) {
    const Model = await this.getModel();
    if (!this.isValidId(id)) return null;
    let query = Model.findById(id).select(selectFields);
    query = populateAuthor(query);
    if (options.session) {
      query = query.session(options.session);
    }
    return query.lean();
  }

  async updateById(id, updateData, options = {}) {
    const Model = await this.getModel();
    if (!this.isValidId(id)) return null;
    let query = Model.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      session: options.session,
    }).select(selectFields);
    query = populateAuthor(query);
    return query.lean();
  }

  async updateCounts(id, incData, options = {}) {
    const Model = await this.getModel();
    if (!this.isValidId(id)) return null;
    let query = Model.findByIdAndUpdate(
      id,
      { $inc: incData },
      {
        new: true,
        runValidators: true,
        session: options.session,
      },
    ).select(selectFields);
    query = populateAuthor(query);
    return query.lean();
  }

  async deleteById(id, options = {}) {
    const Model = await this.getModel();
    if (!this.isValidId(id)) return null;
    return Model.findByIdAndDelete(id, { session: options.session });
  }
}

export default new TestimonyRepository();

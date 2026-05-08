import mongoose from "mongoose";

let TestimonyCommentModel;
let UserModel;

const getIsMongo = () => process.env.DB_CONNECTION === "mongodb";

const selectFields = "userId testimonyId comment createdAt updatedAt";

class TestimonyCommentRepository {
  isValidId(id) {
    if (!getIsMongo()) return true;
    return mongoose.Types.ObjectId.isValid(id);
  }

  async getModel() {
    if (!TestimonyCommentModel) {
      TestimonyCommentModel = (
        await import("../MongoModels/TestimonyCommentMongoModel.js")
      ).default;
    }
    if (!UserModel) {
      UserModel = (await import("../MongoModels/UserMongoModel.js")).default;
    }
    return TestimonyCommentModel;
  }

  async create(data, options = {}) {
    const Model = await this.getModel();
    const comment = new Model(data);
    return comment.save({ session: options.session });
  }

  async findById(id, options = {}) {
    const Model = await this.getModel();
    if (!this.isValidId(id)) return null;
    let query = Model.findById(id)
      .select(selectFields)
      .populate("userId", "name photo");
    if (options.session) {
      query = query.session(options.session);
    }
    return query.lean();
  }

  async findAllByTestimonyId(testimonyId, options = {}) {
    const Model = await this.getModel();
    if (!this.isValidId(testimonyId)) return [];
    let query = Model.find({ testimonyId })
      .select(selectFields)
      .populate("userId", "name photo")
      .sort({ createdAt: -1 });
    if (options.session) {
      query = query.session(options.session);
    }
    return query.lean();
  }

  async deleteById(id, options = {}) {
    const Model = await this.getModel();
    if (!this.isValidId(id)) return null;
    return Model.findByIdAndDelete(id, { session: options.session });
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
}

export default new TestimonyCommentRepository();

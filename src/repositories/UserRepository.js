import User from "../Models/UserModel.js";

export const UserRepository = {
  findByEmail: (email) => User.findOne({ where: { email } }),
  findById: (id) => User.findByPk(id),
  create: (payload) => User.create(payload),
};

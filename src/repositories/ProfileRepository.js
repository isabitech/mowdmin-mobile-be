import Profile from "../Models/ProfileModel.js";

export const ProfileRepository = {
  findByUserId: (userId) => Profile.findOne({ where: { userId } }),
  findByIdWithUser: (id, UserModel) =>
    Profile.findByPk(id, {
      include: [{ model: UserModel, as: "user", attributes: ["id", "name", "email"] }],
    }),
  update: (profile, payload) => profile.update(payload),
  create: (payload) => Profile.create(payload),
};

import PrayerRequest from "../Models/PrayerRequestModel.js";
import Profile from "../Models/ProfileModel.js";
import User from "../Models/UserModel.js";


class PrayerRequestService {
    async create(data) {
        const res = PrayerRequest.create(data);
        return res;
    }
    async update(id, data) {
        const res = this.findById(id)
        res.update(data);
        return res;

    }
    async findById(id) {
        const res = PrayerRequest.findByPk(id);
        return res;
    }
    async findByIdForAUser(id, userId) {
        const res = PrayerRequest.findOne({
            where: { id: id, userId: userId }
        });
        return res;
    }
    async getAll() {
        const res = await PrayerRequest.findAll({
            order: [["createdAt", "ASC"]],
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name", "email", "photo"],
                    include: [
                        {
                            model: Profile,
                            as: "profile",
                            attributes: ["id", "displayName", "photoUrl", "bio", "location"],
                        },
                    ],
                },
            ],
        });

        return res;
    }
    async delete(id) {
        const res = this.findById(id);
        res.delete();
        return true;
    }
    async getAllByUserId(userId) {
        const res = await PrayerRequest.findAll({
            where: { userId: userId },
            order: [["createdAt", "ASC"]],
        });

        return res;
    }

}

export default new PrayerRequestService();
import Prayer from "../Models/PrayerModel.js";
import PrayerRequest from "../Models/PrayerRequestModel.js";
import Profile from "../Models/ProfileModel.js";
import User from "../Models/UserModel.js";


class PrayerService {
    async create(data) {
        const res = Prayer.create(data);
        return res;
    }
    async update(id, data) {
        const res = this.findById(id)
        res.update(data);
        return res;

    }
    async findById(id) {
        const res = Prayer.findByPk(id);
        return res;
    }
    async findByIdForAUser(id, userId) {
        const res = Prayer.findOne({
            where: { id: id, userId: userId }
        });
        return res;
    }
    async getAll() {
        const res = await Prayer.findAll({
            order: [["createdAt", "ASC"]],
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "email", "photo"],
                    include: [
                        {
                            model: Profile,
                            as: "profile",
                            attributes: ["id", "displayName", "photoUrl", "bio", "location"],
                        },
                    ],
                    model: PrayerRequest,
                    as: "prayerRequest"
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
        const res = await Prayer.findAll({
            where: { userId: userId },
            order: [["createdAt", "ASC"]],
        });

        return res;
    }

}

export default new PrayerService();
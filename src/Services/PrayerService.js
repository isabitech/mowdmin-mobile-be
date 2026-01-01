import { PrayerRepository } from "../repositories/PrayerRepository.js";


class PrayerService {
    async create(data) {
        const res = await PrayerRepository.create(data);
        return res;
    }
    async update(id, data) {
        const res = await this.findById(id);
        if (!res) return null;
        await res.update(data);
        return res;

    }
    async findById(id) {
        const res = await PrayerRepository.findById(id);
        return res;
    }
    async findByIdForAUser(id, userId) {
        const res = await PrayerRepository.findOne({ id, userId });
        return res;
    }
    async getAll() {
        const res = await PrayerRepository.findAll({
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
        const res = await this.findById(id);
        if (!res) return null;
        await res.destroy();
        return true;
    }
    async getAllByUserId(userId) {
        const res = await PrayerRepository.findAll({
            where: { userId: userId },
            order: [["createdAt", "ASC"]],
        });

        return res;
    }

}

export default new PrayerService();
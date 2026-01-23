import { PrayerRequestRepository } from "../repositories/PrayerRequestRepository.js";


class PrayerRequestService {
    async create(data) {
        return PrayerRequestRepository.create(data);
    }
    async update(id, data) {
        const updated = await PrayerRequestRepository.updateById(id, data);
        return updated;
    }
    async findById(id) {
        return PrayerRequestRepository.findById(id);
    }
    async findByIdForAUser(id, userId) {
        return PrayerRequestRepository.findOne({ id, userId });
    }
    async getAll() {
        const res = await PrayerRequestRepository.findAll({
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
        const deleted = await PrayerRequestRepository.deleteById(id);
        return deleted;
    }
    async getAllByUserId(userId) {
        return PrayerRequestRepository.findAllByUserId(userId, {
            order: [["createdAt", "ASC"]],
        });
    }

}

export default new PrayerRequestService();
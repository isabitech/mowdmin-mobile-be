import { PrayerRepository } from "../repositories/PrayerRepository.js";
//import { NotificationService } from "./NotificationService.js";

class PrayerService {
    async notify(userId, title, message, type = "info", metadata = {}) {
        const NotificationService = (await import("./NotificationService.js")).default;
        await NotificationService.create(userId, title, message, type, metadata);
    }

    async createPrayer(data) {
        const prayer = await this.create(data);
        await this.notify(data.userId, "New Prayer Created", `Your prayer '${data.title}' was created.`, "prayer", { prayerId: prayer.id });
        return prayer;
    }

    async createFromRequest(requestId, adminId) {
        const PrayerRequestService = (await import("./PrayerRequestService.js")).default;
        const request = await PrayerRequestService.findById(requestId);
        if (!request) return null;

        const prayerData = {
            title: request.title,
            description: request.description,
            images: request.images || [],
            isPublic: true,
            prayerRequestId: request.id,
            userId: adminId, // Published by admin
        };
        return this.create(prayerData);
    }

    async likePrayer(id, userId) {
        const prayer = await this.findById(id);
        if (!prayer) return null;
        prayer.likeCount = (prayer.likeCount || 0) + 1;
        await prayer.save();
        if (prayer.userId && prayer.userId !== userId) {
            await this.notify(prayer.userId, "Prayer Liked", `Your prayer was liked.`, "like", { prayerId: prayer.id });
        }
        return prayer;
    }

    async commentPrayer(id, userId, comment) {
        const prayer = await this.findById(id);
        if (!prayer) return null;
        prayer.commentCount = (prayer.commentCount || 0) + 1;
        await prayer.save();
        if (prayer.userId && prayer.userId !== userId) {
            await this.notify(prayer.userId, "New Comment on Prayer", `Your prayer received a new comment.`, "comment", { prayerId: prayer.id, comment });
        }
        return prayer;
    }

    async create(data) {
        return PrayerRepository.create(data);
    }
    async update(id, data) {
        const prayer = await this.findById(id);
        if (!prayer) return null;
        return PrayerRepository.updateById ? PrayerRepository.updateById(id, data) : prayer.update(data);
    }
    async findById(id) {
        return PrayerRepository.findById(id);
    }
    async findByIdForAUser(id, userId) {
        return PrayerRepository.findOne({ id, userId });
    }
    async getAll() {
        return PrayerRepository.findAll({
            where: { isPublic: true },
            order: [["createdAt", "DESC"]],
        });
    }
    async delete(id) {
        return PrayerRepository.deleteById(id);
    }
    async getAllByUserId(userId) {
        return PrayerRepository.findAll({
            where: { userId: userId },
            order: [["createdAt", "DESC"]],
        });
    }
}

export default new PrayerService();
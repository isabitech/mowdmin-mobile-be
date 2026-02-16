import "../env.js";

let AuthModel;
const getIsMongo = () => process.env.DB_CONNECTION === 'mongodb';

export const AuthRepository = {
    async getModel() {
        if (!AuthModel) {
            if (getIsMongo()) {
                AuthModel = (await import('../MongoModels/AuthMongoModel.js')).default;
            } else {
                AuthModel = (await import('../Models/AuthModel.js')).default;
            }
        }
        return AuthModel;
    },

    async create(data) {
        const Model = await this.getModel();
        return Model.create(data);
    },

    async findByUserId(userId) {
        const Model = await this.getModel();
        return getIsMongo() ? Model.find({ userId }) : Model.findAll({ where: { userId } });
    },

    async findByTokenHash(tokenHash) {
        const Model = await this.getModel();
        // Since we are doing soft logout, we prefer to return the record even if logged out
        // so the middleware can explicitly say "You have logged out" vs "Invalid token".
        return getIsMongo() ? Model.findOne({ tokenHash }) : Model.findOne({ where: { tokenHash } });
    },

    async revokeToken(userId, tokenHash) {
        const Model = await this.getModel();
        const updateData = { isLoggedOut: true, loggedOutAt: new Date() };

        if (getIsMongo()) {
            // MongoDB
            // Handle specific revoke by hash (safe) or by userId + hash
            let query = { tokenHash };
            if (userId) query.userId = userId;
            return Model.updateOne(query, updateData);
        } else {
            // Sequelize
            let where = { tokenHash };
            if (userId) where.userId = userId;
            return Model.update(updateData, { where });
        }
    },

    async revokeAllUserTokens(userId) {
        const Model = await this.getModel();
        const updateData = { isLoggedOut: true, loggedOutAt: new Date() };

        if (getIsMongo()) {
            return Model.updateMany({ userId }, updateData);
        } else {
            return Model.update(updateData, { where: { userId } });
        }
    }
    ,

    async touchToken(tokenHash, touchedAt = new Date()) {
        const Model = await this.getModel();
        const updateData = { lastLogin: touchedAt };

        if (getIsMongo()) {
            // Only touch active sessions
            return Model.updateOne({ tokenHash, isLoggedOut: false }, updateData);
        }

        return Model.update(updateData, { where: { tokenHash, isLoggedOut: false } });
    }
};

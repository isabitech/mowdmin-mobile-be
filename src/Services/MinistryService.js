import { MinistryRepository } from "../repositories/MinistryRepository.js";

class MinistryService {
    async getAllMinistries() {
        return await MinistryRepository.findAll();
    }

    async getMinistryById(id) {
        return await MinistryRepository.findById(id);
    }

    async createMinistry(data) {
        return await MinistryRepository.create(data);
    }

    async updateMinistry(id, data) {
        return await MinistryRepository.update(id, data);
    }

    async deleteMinistry(id) {
        return await MinistryRepository.delete(id);
    }
}

export default new MinistryService();

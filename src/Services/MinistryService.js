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
}

export default new MinistryService();

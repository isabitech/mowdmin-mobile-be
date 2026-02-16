import { OrderRepository } from '../repositories/OrderRepository.js';
import mongoose from 'mongoose';

// Mock the models
const mockOrderModel = {
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    save: jest.fn(),
};

const mockOrderItemModel = {
    create: jest.fn(),
};

// Mock the imports in getModels
jest.mock('../MongoModels/OrderMongoModel.js', () => ({
    __esModule: true,
    default: mockOrderModel
}), { virtual: true });

jest.mock('../MongoModels/OrderItemMongoModel.js', () => ({
    __esModule: true,
    default: mockOrderItemModel
}), { virtual: true });

jest.mock('../MongoModels/UserMongoModel.js', () => ({
    __esModule: true,
    default: {}
}), { virtual: true });

describe('OrderRepository MongoDB Create', () => {
    beforeEach(() => {
        process.env.DB_CONNECTION = 'mongodb';
        jest.clearAllMocks();
    });

    it('should create an order and items correctly', async () => {
        const orderId = new mongoose.Types.ObjectId();
        const orderDoc = {
            _id: orderId,
            save: jest.fn().mockResolvedValue(true),
        };

        mockOrderModel.create.mockResolvedValue(orderDoc);

        const itemId1 = new mongoose.Types.ObjectId();
        const itemId2 = new mongoose.Types.ObjectId();

        mockOrderItemModel.create
            .mockResolvedValueOnce({ _id: itemId1 })
            .mockResolvedValueOnce({ _id: itemId2 });

        const data = {
            userId: new mongoose.Types.ObjectId(),
            totalAmount: 100,
            items: [
                { productId: new mongoose.Types.ObjectId(), quantity: 2 },
                { productId: new mongoose.Types.ObjectId(), quantity: 1 }
            ]
        };

        const result = await OrderRepository.create(data);

        expect(mockOrderModel.create).toHaveBeenCalledWith(expect.not.objectContaining({ items: expect.anything() }));
        expect(mockOrderItemModel.create).toHaveBeenCalledTimes(2);
        expect(orderDoc.items).toEqual([itemId1, itemId2]);
        expect(orderDoc.save).toHaveBeenCalled();
        expect(result).toBe(orderDoc);
    });
});

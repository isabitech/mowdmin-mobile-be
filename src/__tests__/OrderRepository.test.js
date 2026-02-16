import { jest } from '@jest/globals';
import { OrderRepository } from '../repositories/OrderRepository.js';
import mongoose from 'mongoose';

// Mock the models
const createMockChain = (finalValue) => {
    const chain = {
        populate: jest.fn(() => chain),
        sort: jest.fn(() => chain),
        limit: jest.fn(() => chain),
        skip: jest.fn(() => chain),
        then: jest.fn((resolve) => resolve(finalValue)),
    };
    // To support await
    chain[Symbol.toStringTag] = 'Promise';
    chain.catch = jest.fn().mockReturnThis();
    chain.finally = jest.fn().mockReturnThis();
    return chain;
};

const mockOrderModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
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

describe('OrderRepository MongoDB', () => {
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

        expect(mockOrderModel.create).toHaveBeenCalled();
        expect(mockOrderItemModel.create).toHaveBeenCalledTimes(2);
        expect(orderDoc.items).toEqual([itemId1, itemId2]);
        expect(orderDoc.save).toHaveBeenCalled();
        expect(result).toBe(orderDoc);
    });

    it('should find all orders for a user with deep population', async () => {
        const userId = new mongoose.Types.ObjectId();
        const mockOrders = [{ _id: new mongoose.Types.ObjectId() }];

        mockOrderModel.find.mockReturnValue(createMockChain(mockOrders));

        const result = await OrderRepository.findAllByUserId(userId);

        expect(mockOrderModel.find).toHaveBeenCalledWith({ userId: expect.any(mongoose.Types.ObjectId) });
        expect(result).toBe(mockOrders);
    });

    it('should find all orders with deep population', async () => {
        const mockOrders = [{ _id: new mongoose.Types.ObjectId() }];

        mockOrderModel.find.mockReturnValue(createMockChain(mockOrders));

        const result = await OrderRepository.findAll();

        expect(mockOrderModel.find).toHaveBeenCalledWith({});
        expect(result).toBe(mockOrders);
    });

    it('should find order by id with deep population', async () => {
        const orderId = new mongoose.Types.ObjectId();
        const mockOrder = { _id: orderId };

        mockOrderModel.findById.mockReturnValue(createMockChain(mockOrder));

        const result = await OrderRepository.findById(orderId);

        expect(mockOrderModel.findById).toHaveBeenCalledWith(orderId);
        expect(result).toBe(mockOrder);
    });
});

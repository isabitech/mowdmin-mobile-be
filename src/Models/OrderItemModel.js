import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";
import Product from "./ProductModel.js";

const OrderItem = sequelize.define(
    "OrderItem",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        orderId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        productId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
        },
    },
    { tableName: "order_items", timestamps: true }
);
async () => {
    OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });
    OrderItem.belongsTo(Order, {
        foreignKey: "orderId",
        as: "order",
    })
}



export default OrderItem;

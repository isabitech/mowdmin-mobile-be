import { DataTypes } from "sequelize";
import sequelize from "../Config/db.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
    type: {
      type: DataTypes.ENUM("Book", "Album")
    },
    price: {
      type: DataTypes.DECIMAL(10, 2)
    },
    currency: {
      type: DataTypes.STRING
    },
    language: {
      type: DataTypes.ENUM("EN", "FR", "DE")
    },
    stock: {
      type: DataTypes.INTEGER
    },
    image: {
      type: DataTypes.STRING
    },
    url: {
      type: DataTypes.STRING
    }
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

export default Product;

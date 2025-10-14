import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ShopItem = sequelize.define(
    "ShopItem",
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
      tableName: "shop_items",
      timestamps: true,
    }
  );

  return ShopItem;
};

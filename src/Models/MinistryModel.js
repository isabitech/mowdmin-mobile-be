import { DataTypes } from "sequelize";
import getSequelizeInstance from "../Config/db.js";

const sequelize = getSequelizeInstance();

const Ministry = sequelize.define("Ministry", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    leaderId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    contactEmail: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: true,
    tableName: 'ministries'
});

export default Ministry;

import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js";

const BibleVerse = getSequelize().define("BibleVerse", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    passage: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    version: {
        type: DataTypes.STRING,
        defaultValue: "KJV",
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isDaily: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: true,
    tableName: 'bible_verses'
});

export default BibleVerse;

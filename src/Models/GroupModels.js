import { DataTypes } from "sequelize";
import getSequelizeInstance from "../Config/db.js";
import User from "./UserModel.js";

const sequelize = getSequelizeInstance();

// Group Model
export const Group = sequelize.define("Group", {
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
    },
    image: {
        type: DataTypes.STRING,
    },
    creatorId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    isPrivate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: true,
    tableName: 'groups'
});

// Group Member Model
export const GroupMember = sequelize.define("GroupMember", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    groupId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("Admin", "Member"),
        defaultValue: "Member",
    }
}, {
    timestamps: true,
    tableName: 'group_members'
});

// Group Message Model
export const GroupMessage = sequelize.define("GroupMessage", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    groupId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: "text",
    }
}, {
    timestamps: true,
    tableName: 'group_messages'
});

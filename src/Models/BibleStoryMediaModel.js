import { DataTypes } from "sequelize";
import getSequelizeInstance from "../Config/db.js";

const sequelize = getSequelizeInstance();

const BibleStoryMedia = sequelize.define("BibleStoryMedia", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    bibleStoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'bible_story_id'
    },
    mediaId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'media_id'
    }
}, {
    timestamps: true,
    tableName: 'bible_story_media'
});

export default BibleStoryMedia;

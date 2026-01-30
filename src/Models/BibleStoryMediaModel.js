import { DataTypes } from "sequelize";
import getSequelize from "../Config/db.js";

const BibleStoryMedia = getSequelize().define("BibleStoryMedia", {
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

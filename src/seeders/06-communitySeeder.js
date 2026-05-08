import { faker } from "@faker-js/faker";
import { fileURLToPath } from "url";
import { connectDB } from "../Config/db.js";
import { connectMongoDB } from "../Config/mongodb.js";
import "../env.js";
import { GroupRepository } from "../repositories/GroupRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";

const communityGroupTemplates = [
  {
    name: "Daily Prayer Circle",
    description:
      "A welcoming space for believers to share prayer needs, testimonies, and short daily encouragement.",
    isPrivate: false,
    image:
      "https://ui-avatars.com/api/?name=Daily+Prayer+Circle&background=1F6F8B&color=ffffff&size=256",
    messages: [
      "Good morning everyone. What prayer points are we trusting God for today?",
      "Please remember families going through difficult seasons this week.",
      "Sharing Psalm 46 today as a reminder that God is our refuge and strength.",
      "Thank God with us, a member received healing after weeks of discomfort.",
      "Let's take a few minutes tonight to pray for peace in our communities.",
    ],
  },
  {
    name: "Young Adults Fellowship",
    description:
      "For students and young professionals growing in faith, purpose, relationships, and practical Christian living.",
    isPrivate: false,
    image:
      "https://ui-avatars.com/api/?name=Young+Adults+Fellowship&background=3A7D44&color=ffffff&size=256",
    messages: [
      "This week's discussion is on finding direction while trusting God's timing.",
      "What book or sermon has helped your spiritual growth recently?",
      "Reminder: our virtual fellowship starts by 7 PM on Friday.",
      "Please pray for wisdom for members making study and career decisions.",
      "Thank you everyone for making new members feel welcome here.",
    ],
  },
  {
    name: "Women of Faith Network",
    description:
      "A supportive community for women to pray together, share testimonies, and encourage one another in every season.",
    isPrivate: false,
    image:
      "https://ui-avatars.com/api/?name=Women+of+Faith+Network&background=A44A6A&color=ffffff&size=256",
    messages: [
      "You are all invited to share one testimony from this month.",
      "Please keep our mothers and caregivers in prayer this week.",
      "Today's encouragement: God sees the quiet sacrifices we make.",
      "Who would like to lead the devotion for our next meeting?",
      "Thank God with us for answered prayers concerning safe delivery.",
    ],
  },
  {
    name: "Bible Study Hub",
    description:
      "A group dedicated to weekly scripture study, thoughtful questions, and practical application of God's word.",
    isPrivate: false,
    image:
      "https://ui-avatars.com/api/?name=Bible+Study+Hub&background=6C4AB6&color=ffffff&size=256",
    messages: [
      "This week we are studying James chapter 1. Please read before tomorrow evening.",
      "What stood out to you most from Sunday's teaching?",
      "Let's share one practical lesson we can apply before the end of the week.",
      "Question for discussion: how do we remain doers of the word?",
      "Thank you for the thoughtful insights in yesterday's study session.",
    ],
  },
  {
    name: "Marriage and Family Support",
    description:
      "Encouragement, prayer, and scripture-based conversations for marriages, parents, and family life.",
    isPrivate: true,
    image:
      "https://ui-avatars.com/api/?name=Marriage+and+Family+Support&background=C06C2B&color=ffffff&size=256",
    messages: [
      "Please share prayer requests for marriages and family unity this week.",
      "Today's topic is healthy communication at home.",
      "Remember to keep families with young children in prayer this weekend.",
      "A gentle reminder that grace and patience go a long way in every home.",
      "Thank you all for the wisdom shared during the last conversation.",
    ],
  },
  {
    name: "New Believers Corner",
    description:
      "A safe place for new Christians to ask questions, build spiritual habits, and grow in confidence.",
    isPrivate: false,
    image:
      "https://ui-avatars.com/api/?name=New+Believers+Corner&background=D17B0F&color=ffffff&size=256",
    messages: [
      "Welcome to everyone who joined recently. Feel free to ask any faith question here.",
      "Today's starter topic: how to build a consistent prayer life.",
      "If you are new to studying the Bible, begin with the book of John this week.",
      "No question is too simple here. We are learning and growing together.",
      "Please share your favorite worship song or scripture from this week.",
    ],
  },
];

const normalizeId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value.id) return String(value.id);
    if (value._id) return String(value._id);
    if (typeof value.toString === "function") return value.toString();
  }
  return String(value);
};

const getEntityId = (entity) => normalizeId(entity?.id ?? entity?._id);

const getGroupTemplate = (index) => {
  const template = communityGroupTemplates[index % communityGroupTemplates.length];
  if (index < communityGroupTemplates.length) {
    return template;
  }

  return {
    ...template,
    name: `${template.name} ${Math.floor(index / communityGroupTemplates.length) + 1}`,
  };
};

const seedCommunity = async (count = communityGroupTemplates.length) => {
  try {
    console.log(`Seeding ${count} community groups...`);
    const users = await UserRepository.findAll({});
    const limitUsers = users.slice(0, 20);

    if (limitUsers.length === 0) {
      console.warn("No users found. Skipping community seeding.");
      return;
    }

    for (let i = 0; i < count; i++) {
      const template = getGroupTemplate(i);
      const creator = faker.helpers.arrayElement(limitUsers);
      const creatorId = getEntityId(creator);
      const group = await GroupRepository.createGroup({
        name: template.name,
        description: template.description,
        creatorId,
        isPrivate: template.isPrivate,
        image: template.image,
      });
      const groupId = getEntityId(group);
      console.log(`Created group: ${group.name}`);

      const numMembers = faker.number.int({ min: 2, max: 8 });
      const members = [];

      for (let j = 0; j < numMembers; j++) {
        const user = faker.helpers.arrayElement(limitUsers);
        const userId = getEntityId(user);
        if (userId === creatorId) continue;

        const existing = members.find(
          (member) => getEntityId(member) === userId,
        );
        if (existing) continue;

        const dbMembers = await GroupRepository.findMembersByGroup(groupId);
        const isDbMember = dbMembers.find(
          (member) => normalizeId(member.userId) === userId,
        );
        if (isDbMember) continue;

        members.push(user);

        await GroupRepository.addMember({
          groupId,
          userId,
          role: "Member",
        });
      }

      const dbMembers = await GroupRepository.findMembersByGroup(groupId);
      const isCreatorMember = dbMembers.find(
        (member) => normalizeId(member.userId) === creatorId,
      );

      if (!isCreatorMember) {
        await GroupRepository.addMember({
          groupId,
          userId: creatorId,
          role: "Admin",
        });
      }

      const allGroupUsers = [creator, ...members];
      for (const messageContent of template.messages) {
        const sender = faker.helpers.arrayElement(allGroupUsers);
        const senderId = getEntityId(sender);
        await GroupRepository.createMessage({
          groupId,
          senderId,
          content: messageContent,
        });
      }
    }

    console.log("Community seeded successfully.");
  } catch (error) {
    console.error("Error seeding community:", error);
  }
};

const __filename = fileURLToPath(import.meta.url);
const entryFile = process.argv[1];

if (entryFile === __filename || entryFile?.endsWith("06-communitySeeder.js")) {
  (async () => {
    try {
      if (process.env.DB_CONNECTION === "mongodb") {
        await connectMongoDB();
      } else {
        await connectDB();
      }
      await seedCommunity();
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })();
}

export default seedCommunity;

import { PrayerCommentRepository } from "../repositories/PrayerCommentRepository.js";
import { PrayerLikeRepository } from "../repositories/PrayerLikeRepository.js";
import { PrayerRepository } from "../repositories/PrayerRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";

const prayerWallTemplates = [
  {
    title: "Prayer for Healing and Strength",
    description:
      "Please join us in praying for members and families trusting God for healing, renewed strength, and peace through difficult medical seasons.",
    comments: [
      "Standing in faith with everyone believing God for complete healing.",
      "Praying for strength for caregivers as well as quick recovery for the sick.",
      "May the Lord give peace, comfort, and good reports this week.",
    ],
    likeTarget: 4,
  },
  {
    title: "Prayer for Open Doors and Employment",
    description:
      "We are lifting up those seeking jobs, business opportunities, and direction in their careers. May God grant favor and divine connections.",
    comments: [
      "Praying for testimonies of interviews turning into offers.",
      "May God order every step and open the right doors at the right time.",
      "Trusting God for provision and clarity for everyone waiting.",
    ],
    likeTarget: 5,
  },
  {
    title: "Prayer for Families and Marriages",
    description:
      "Let us pray for peace in homes, wisdom for parents, restoration in marriages, and grace for every family carrying heavy burdens.",
    comments: [
      "Praying for unity, patience, and understanding in every home.",
      "May strained relationships be restored by God's mercy.",
      "Lifting up parents raising children in challenging times.",
    ],
    likeTarget: 4,
  },
  {
    title: "Prayer for Students and Young Adults",
    description:
      "We are praying for students, graduates, and young professionals for wisdom, discipline, academic success, and purpose-filled decisions.",
    comments: [
      "Praying for focus, excellence, and peace during exams and interviews.",
      "May young adults receive clear direction for their next steps.",
      "Trusting God for favor in admissions, scholarships, and career paths.",
    ],
    likeTarget: 3,
  },
  {
    title: "Prayer for Nation and Community Peace",
    description:
      "Join us as we pray for peace in our communities, wisdom for leaders, safety in our cities, and justice for those in need.",
    comments: [
      "Praying for peace, safety, and healing across our communities.",
      "May leaders be guided by wisdom, integrity, and compassion.",
      "Trusting God to comfort families affected by hardship and unrest.",
    ],
    likeTarget: 4,
  },
  {
    title: "Prayer of Thanksgiving for Answered Prayers",
    description:
      "Today we thank God for answered prayers, protection, provision, and testimonies that remind us He is still faithful in every season.",
    comments: [
      "Thank You Lord for Your faithfulness and daily mercies.",
      "Celebrating every testimony and trusting God for more.",
      "Grateful for protection, provision, and the strength to keep going.",
    ],
    likeTarget: 5,
  },
];

const prayerRequestTemplates = [
  {
    title: "Prayer for a New Job Opportunity",
    description:
      "Please pray with me for favor, wisdom, and the right open door as I apply for a new role.",
    isPublic: false,
  },
  {
    title: "Prayer for Healing for My Mother",
    description:
      "My mother is recovering from illness. Please join us in prayer for complete healing and strength.",
    isPublic: true,
  },
  {
    title: "Prayer for Peace in My Family",
    description:
      "Kindly pray for restoration, understanding, and peace in my family during a difficult time.",
    isPublic: false,
  },
  {
    title: "Prayer for Academic Success",
    description:
      "I have important exams ahead. Please pray for wisdom, focus, and a calm mind.",
    isPublic: true,
  },
  {
    title: "Prayer for Financial Provision",
    description:
      "Please pray for God's provision as I work through urgent financial responsibilities this month.",
    isPublic: false,
  },
  {
    title: "Prayer for Safe Delivery",
    description:
      "Please stand with our family in prayer for a safe delivery and good health for mother and baby.",
    isPublic: true,
  },
  {
    title: "Prayer for Spiritual Growth",
    description:
      "Pray for me to remain consistent in prayer, Bible study, and obedience to God's leading.",
    isPublic: false,
  },
  {
    title: "Prayer for Marriage Restoration",
    description:
      "Please pray for healing, wisdom, and renewed love in our marriage.",
    isPublic: false,
  },
  {
    title: "Prayer for Travel Mercy",
    description:
      "I will be traveling soon. Kindly pray for safety, favor, and peace throughout the journey.",
    isPublic: true,
  },
  {
    title: "Prayer for Strength During Grief",
    description:
      "Our family recently lost a loved one. Please pray for comfort, strength, and God's peace.",
    isPublic: true,
  },
];

const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity === "string") return entity;
  if (entity.id) return String(entity.id);
  if (entity._id) return String(entity._id);
  return String(entity);
};

const uniqueById = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const id = getEntityId(item);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const resolveAdminUser = async () => {
  const adminEmail = "admin@mowdmin.com";
  const adminByEmail = await UserRepository.findByEmail(adminEmail);
  if (adminByEmail) return adminByEmail;

  const adminUsers = await UserRepository.findAll({
    where: { isAdmin: true },
    limit: 1,
  });
  if (adminUsers.length > 0) return adminUsers[0];

  const users = await UserRepository.findAll({ limit: 1 });
  return users[0] || null;
};

const seedPrayers = async () => {
  try {
    console.log("Seeding curated prayer wall...");

    const admin = await resolveAdminUser();
    const users = await UserRepository.findAll({ limit: 12 });
    const participants = uniqueById([admin, ...users].filter(Boolean));

    if (participants.length === 0) {
      console.log("No users found for seeding prayers. Please run user seeder first.");
      return;
    }

    const prayerLikeModel = await PrayerLikeRepository.getModel();

    for (let index = 0; index < prayerWallTemplates.length; index++) {
      const template = prayerWallTemplates[index];
      const author = participants[index % participants.length];
      const authorId = getEntityId(author);

      const existingPrayer = await PrayerRepository.findOne({
        title: template.title,
        userId: authorId,
      });
      if (existingPrayer) {
        console.log(`Prayer already exists, skipping: ${template.title}`);
        continue;
      }

      const prayer = await PrayerRepository.create({
        userId: authorId,
        title: template.title,
        description: template.description,
        images: [],
        isPublic: true,
        likeCount: 0,
        commentCount: 0,
      });
      const prayerId = getEntityId(prayer);

      const otherParticipants = participants.filter(
        (participant) => getEntityId(participant) !== authorId,
      );
      const likeUsers = otherParticipants.slice(
        0,
        Math.min(template.likeTarget, otherParticipants.length),
      );

      for (const likeUser of likeUsers) {
        const userId = getEntityId(likeUser);
        const existingLike = await PrayerLikeRepository.findOne(prayerId, userId);
        if (!existingLike) {
          await prayerLikeModel.create({ prayerId, userId });
        }
      }

      const commentUsers =
        otherParticipants.length > 0 ? otherParticipants : [author];
      for (let commentIndex = 0; commentIndex < template.comments.length; commentIndex++) {
        const commentAuthor =
          commentUsers[commentIndex % commentUsers.length] || author;
        await PrayerCommentRepository.create({
          prayerId,
          userId: getEntityId(commentAuthor),
          comment: template.comments[commentIndex],
        });
      }

      await PrayerRepository.updateById(prayerId, {
        likeCount: likeUsers.length,
        commentCount: template.comments.length,
      });
      console.log(`Created curated prayer: ${template.title}`);
    }

    console.log("Curated prayer wall seeded successfully.");
  } catch (error) {
    console.error("Error seeding prayers:", error);
  }
};

export { prayerRequestTemplates };
export default seedPrayers;

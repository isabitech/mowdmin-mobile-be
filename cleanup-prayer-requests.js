import fs from "fs/promises";
import path from "path";

import "./src/env.js";
import { connectMongoDB } from "./src/Config/mongodb.js";
import mongoose from "./src/Config/mongodb.js";
import PrayerMongoModel from "./src/MongoModels/PrayerMongoModel.js";
import PrayerRequestMongoModel from "./src/MongoModels/PrayerRequestMongoModel.js";
import UserMongoModel from "./src/MongoModels/UserMongoModel.js";

const KNOWN_FAKE_BURST_DATES = new Set(["2026-03-29", "2026-04-12"]);
const MANUAL_TEST_TITLES = new Set(["test", "testing"]);

const shouldApply = process.argv.includes("--apply");
const includeManualTestTitles = !process.argv.includes("--faker-only");

const toDayString = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

const getReason = ({ createdDay, hasUser, title }) => {
  const normalizedTitle = normalizeText(title).toLowerCase();

  if (
    KNOWN_FAKE_BURST_DATES.has(createdDay) &&
    !hasUser &&
    normalizeText(title).endsWith(".")
  ) {
    return "faker-burst-orphan";
  }

  if (includeManualTestTitles && MANUAL_TEST_TITLES.has(normalizedTitle)) {
    return "manual-test-title";
  }

  return null;
};

const run = async () => {
  if (process.env.DB_CONNECTION !== "mongodb") {
    throw new Error(
      "This cleanup script currently supports only MongoDB prayer requests.",
    );
  }

  await connectMongoDB();

  const [prayerRequests, users, linkedPrayers] = await Promise.all([
    PrayerRequestMongoModel.find({}).lean(),
    UserMongoModel.find({}, { _id: 1 }).lean(),
    PrayerMongoModel.find(
      { prayerRequestId: { $exists: true, $ne: null } },
      { prayerRequestId: 1 },
    ).lean(),
  ]);

  const userIds = new Set(users.map((user) => String(user._id)));
  const linkedPrayerRequestIds = new Set(
    linkedPrayers
      .map((prayer) => prayer.prayerRequestId)
      .filter(Boolean)
      .map((id) => String(id)),
  );

  const matches = prayerRequests
    .map((request) => {
      const id = String(request._id);
      const createdDay = toDayString(request.createdAt);
      const title = normalizeText(request.title);
      const hasUser = userIds.has(String(request.userId));
      const isLinkedToPrayerWall = linkedPrayerRequestIds.has(id);
      const reason = getReason({ createdDay, hasUser, title });

      if (!reason || isLinkedToPrayerWall) {
        return null;
      }

      return {
        ...request,
        _id: id,
        userId: request.userId ? String(request.userId) : null,
        createdDay,
        hasUser,
        isLinkedToPrayerWall,
        cleanupReason: reason,
      };
    })
    .filter(Boolean);

  const backupTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(
    process.cwd(),
    "backups",
    `prayer-requests-cleanup-backup-${backupTimestamp}.json`,
  );

  const payload = {
    generatedAt: new Date().toISOString(),
    mode: shouldApply ? "apply" : "dry-run",
    criteria: {
      fakerBurstDates: [...KNOWN_FAKE_BURST_DATES],
      includeManualTestTitles,
      manualTestTitles: [...MANUAL_TEST_TITLES],
    },
    summary: {
      totalPrayerRequests: prayerRequests.length,
      matchedForCleanup: matches.length,
      linkedPrayerRequestCount: linkedPrayerRequestIds.size,
      fakerBurstMatches: matches.filter(
        (match) => match.cleanupReason === "faker-burst-orphan",
      ).length,
      manualTestMatches: matches.filter(
        (match) => match.cleanupReason === "manual-test-title",
      ).length,
    },
    prayerRequests: matches,
  };

  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.writeFile(backupPath, JSON.stringify(payload, null, 2), "utf8");

  console.log(`Total prayer requests: ${prayerRequests.length}`);
  console.log(`Matched for cleanup: ${matches.length}`);
  console.log(
    `Faker/orphan matches: ${
      payload.summary.fakerBurstMatches
    }`,
  );
  console.log(
    `Manual test-title matches: ${
      payload.summary.manualTestMatches
    }`,
  );
  console.log(`Backup written to: ${backupPath}`);

  if (!shouldApply) {
    console.log("Dry run only. Re-run with --apply to delete the matched records.");
    return;
  }

  if (matches.length === 0) {
    console.log("No prayer requests matched the cleanup criteria.");
    return;
  }

  const matchedIds = matches.map((match) => new mongoose.Types.ObjectId(match._id));
  const result = await PrayerRequestMongoModel.deleteMany({
    _id: { $in: matchedIds },
  });

  console.log(`Deleted prayer requests: ${result.deletedCount}`);
};

run()
  .catch((error) => {
    console.error("Error cleaning prayer requests:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting from MongoDB:", disconnectError);
    }
  });

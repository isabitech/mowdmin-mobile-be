import mongoose from "mongoose";
import TestimonyRepository from "../repositories/TestimonyRepository.js";
import TestimonyLikeRepository from "../repositories/TestimonyLikeRepository.js";
import TestimonyCommentRepository from "../repositories/TestimonyCommentRepository.js";

const toPlain = (value) => {
  if (!value) return null;
  if (typeof value.toObject === "function") return value.toObject();
  if (typeof value.toJSON === "function") return value.toJSON();
  return value;
};

const normalizeAuthor = (user) => {
  if (!user) return null;
  const plainUser = toPlain(user);
  return {
    // _id: plainUser._id || plainUser.id,
    name: plainUser.name || null,
    avatar:
      plainUser.photo || plainUser.profilePicture || plainUser.avatar || null,
  };
};

const normalizeTestimony = (testimony, likedSet = new Set()) => {
  if (!testimony) return null;
  const plainTestimony = toPlain(testimony);
  const populatedUser = plainTestimony.userId;
  const testimonyId = plainTestimony._id || plainTestimony.id;

  return {
    _id: testimonyId,
    // userId: populatedUser?._id || populatedUser?.id || plainTestimony.userId,
    title: plainTestimony.title,
    description: plainTestimony.description,
    isPublic: plainTestimony.isPublic,
    likeCount: plainTestimony.likeCount || 0,
    commentCount: plainTestimony.commentCount || 0,
    createdAt: plainTestimony.createdAt,
    updatedAt: plainTestimony.updatedAt,
    author: normalizeAuthor(populatedUser),
    isLiked: likedSet.has(String(testimonyId)),
  };
};

const normalizeComment = (comment) => {
  if (!comment) return null;
  const plainComment = toPlain(comment);
  const populatedUser = plainComment.userId;

  return {
    _id: plainComment._id || plainComment.id,
    userId: populatedUser?._id || populatedUser?.id || plainComment.userId,
    testimonyId:
      plainComment.testimonyId?._id ||
      plainComment.testimonyId?.id ||
      plainComment.testimonyId,
    comment: plainComment.comment,
    createdAt: plainComment.createdAt,
    updatedAt: plainComment.updatedAt,
    author: normalizeAuthor(populatedUser),
  };
};

class TestimonyService {
  async getPublicTestimonies(userId = null) {
    const testimonies = await TestimonyRepository.getPublic();
    let likedSet = new Set();

    if (userId) {
      const likedIds =
        await TestimonyLikeRepository.findLikedTestimonyIdsByUserId(userId);
      likedSet = new Set(likedIds.filter(Boolean).map(String));
    }

    return testimonies.map((testimony) =>
      normalizeTestimony(testimony, likedSet),
    );
  }

  async getUserTestimonies(userId) {
    const testimonies = await TestimonyRepository.getByUserId(userId);
    const likedIds =
      await TestimonyLikeRepository.findLikedTestimonyIdsByUserId(userId);
    const likedSet = new Set(likedIds.filter(Boolean).map(String));
    return testimonies.map((testimony) =>
      normalizeTestimony(testimony, likedSet),
    );
  }

  async createTestimony(userId, data) {
    const payload = {
      userId,
      title: String(data.title || "").trim(),
      description: String(data.description || "").trim(),
      isPublic: data.isPublic !== undefined ? Boolean(data.isPublic) : true,
    };

    const created = await TestimonyRepository.create(payload);
    return normalizeTestimony(created, new Set());
  }

  async updateTestimony(testimonyId, userId, data) {
    const testimony = await TestimonyRepository.getById(testimonyId);
    if (!testimony) return null;

    const ownerId =
      testimony.userId?._id || testimony.userId?.id || testimony.userId;
    if (String(ownerId) !== String(userId)) {
      return { forbidden: true };
    }

    const updatePayload = {};
    if (data.title !== undefined) {
      updatePayload.title = String(data.title).trim();
    }
    if (data.description !== undefined) {
      updatePayload.description = String(data.description).trim();
    }
    if (data.isPublic !== undefined) {
      updatePayload.isPublic = Boolean(data.isPublic);
    }

    const updated = await TestimonyRepository.updateById(
      testimonyId,
      updatePayload,
    );
    return normalizeTestimony(updated, new Set());
  }

  async deleteTestimony(testimonyId, userId) {
    const testimony = await TestimonyRepository.getById(testimonyId);
    if (!testimony) return null;

    const ownerId =
      testimony.userId?._id || testimony.userId?.id || testimony.userId;
    if (String(ownerId) !== String(userId)) {
      return { forbidden: true };
    }

    if (process.env.DB_CONNECTION === "mongodb") {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await TestimonyLikeRepository.deleteManyByTestimonyId(testimonyId, {
            session,
          });
          await TestimonyCommentRepository.deleteManyByTestimonyId(
            testimonyId,
            {
              session,
            },
          );
          await TestimonyRepository.deleteById(testimonyId, { session });
        });
      } finally {
        await session.endSession();
      }
    } else {
      await TestimonyLikeRepository.deleteManyByTestimonyId(testimonyId);
      await TestimonyCommentRepository.deleteManyByTestimonyId(testimonyId);
      await TestimonyRepository.deleteById(testimonyId);
    }

    return true;
  }

  async toggleLike(testimonyId, userId) {
    const testimony = await TestimonyRepository.getById(testimonyId);
    if (!testimony) return null;

    const session =
      process.env.DB_CONNECTION === "mongodb"
        ? await mongoose.startSession()
        : null;
    let liked = false;
    let updatedTestimony = null;

    const run = async (transactionSession = null) => {
      const existingLike = await TestimonyLikeRepository.findOne(
        testimonyId,
        userId,
        { session: transactionSession },
      );

      if (existingLike) {
        await TestimonyLikeRepository.deleteByTestimonyAndUser(
          testimonyId,
          userId,
          { session: transactionSession },
        );
        updatedTestimony = await TestimonyRepository.updateCounts(
          testimonyId,
          { likeCount: -1 },
          { session: transactionSession },
        );
        liked = false;
        return;
      }

      await TestimonyLikeRepository.create(
        { testimonyId, userId },
        { session: transactionSession },
      );
      updatedTestimony = await TestimonyRepository.updateCounts(
        testimonyId,
        { likeCount: 1 },
        { session: transactionSession },
      );
      liked = true;
    };

    if (session) {
      try {
        await session.withTransaction(() => run(session));
      } finally {
        await session.endSession();
      }
    } else {
      await run();
    }

    return {
      testimony: normalizeTestimony(
        updatedTestimony,
        liked ? new Set([String(testimonyId)]) : new Set(),
      ),
      liked,
    };
  }

  async getComments(testimonyId) {
    const comments =
      await TestimonyCommentRepository.findAllByTestimonyId(testimonyId);
    return comments.map((comment) => normalizeComment(comment));
  }

  async addComment(testimonyId, userId, comment) {
    const testimony = await TestimonyRepository.getById(testimonyId);
    if (!testimony) return null;

    const session =
      process.env.DB_CONNECTION === "mongodb"
        ? await mongoose.startSession()
        : null;
    let createdComment = null;

    const run = async (transactionSession = null) => {
      createdComment = await TestimonyCommentRepository.create(
        {
          testimonyId,
          userId,
          comment: String(comment).trim(),
        },
        { session: transactionSession },
      );
      await TestimonyRepository.updateCounts(
        testimonyId,
        { commentCount: 1 },
        { session: transactionSession },
      );
    };

    if (session) {
      try {
        await session.withTransaction(() => run(session));
      } finally {
        await session.endSession();
      }
    } else {
      await run();
    }

    return normalizeComment(createdComment);
  }

  async deleteComment(commentId, userId) {
    const comment = await TestimonyCommentRepository.findById(commentId);
    if (!comment) {
      return { success: false, message: "Resource not found" };
    }

    const ownerId = comment.userId?._id || comment.userId?.id || comment.userId;
    if (String(ownerId) !== String(userId)) {
      return { success: false, message: "Forbidden" };
    }

    const testimonyId =
      comment.testimonyId?._id ||
      comment.testimonyId?.id ||
      comment.testimonyId;
    const session =
      process.env.DB_CONNECTION === "mongodb"
        ? await mongoose.startSession()
        : null;

    const run = async (transactionSession = null) => {
      await TestimonyCommentRepository.deleteById(commentId, {
        session: transactionSession,
      });
      await TestimonyRepository.updateCounts(
        testimonyId,
        { commentCount: -1 },
        { session: transactionSession },
      );
    };

    if (session) {
      try {
        await session.withTransaction(() => run(session));
      } finally {
        await session.endSession();
      }
    } else {
      await run();
    }

    return { success: true };
  }
  async getTestimonyById(testimonyId, userId) {
    const testimony = await TestimonyRepository.getById(testimonyId);
    if (!testimony) return null;
    const likedIds = userId
      ? await TestimonyLikeRepository.findLikedTestimonyIdsByUserId(userId)
      : [];
    const likedSet = new Set(likedIds.filter(Boolean).map(String));
    return normalizeTestimony(testimony, likedSet);
  }
}

export default new TestimonyService();

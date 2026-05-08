import { MediaCategoryRepository } from "../repositories/MediaCategoryRepository.js";
import { MediaRepository } from "../repositories/MediaRepository.js";
import mongoose from "mongoose";

const toPlain = (value) => {
  if (!value) return null;
  if (typeof value.toJSON === "function") return value.toJSON();
  if (typeof value.toObject === "function") return value.toObject();
  return value;
};

const normalizeMedia = (media) => {
  const plainMedia = toPlain(media);
  if (!plainMedia) return null;

  const category = plainMedia.category || plainMedia.category_id;
  const normalizedCategory =
    category && typeof category === "object"
      ? {
          _id: category._id || category.id,
          name: category.name,
        }
      : category || null;

  return {
    ...plainMedia,
    category_id: normalizedCategory,
  };
};

const normalizeMediaCollection = (items = []) =>
  items.map((item) => normalizeMedia(item));

class MediaService {
  async createMedia(data) {
    if (!data) {
      return await MediaRepository.create(data);
    }

    const payload = { ...data };
    const categoryValueRaw = payload.category_id ?? payload.categoryId;

    if (
      process.env.DB_CONNECTION !== "mongodb" ||
      categoryValueRaw === undefined ||
      categoryValueRaw === null ||
      categoryValueRaw === ""
    ) {
      return await MediaRepository.create(payload);
    }

    const categoryValue = String(categoryValueRaw).trim();

    if (!categoryValue) {
      return await MediaRepository.create(payload);
    }

    let finalCategoryId;

    // 1. Check if it's a valid ObjectId
    const isValidId = mongoose.Types.ObjectId.isValid(categoryValue);

    if (isValidId) {
      // Optional: confirm it actually exists
      const existingCategory =
        await MediaCategoryRepository.findById(categoryValue);

      if (existingCategory) {
        finalCategoryId = existingCategory._id;
      } else {
        throw new Error("Category ID does not exist");
      }
    } else {
      // 2. Treat as name
      let findCategory =
        await MediaCategoryRepository.findByName(categoryValue);

      if (findCategory) {
        finalCategoryId = findCategory._id;
      } else {
        const newCategory = await MediaCategoryRepository.create({
          name: categoryValue,
        });
        finalCategoryId = newCategory._id;
      }
    }

    payload.category_id = finalCategoryId;
    delete payload.categoryId;

    return await MediaRepository.create(payload);
  }
  async create(data) {
    return await this.createMedia(data);
  }

  async update(id, data) {
    return await MediaRepository.updateById(id, data);
  }

  async findById(id) {
    const media = await MediaRepository.findById(id);
    return normalizeMedia(media);
  }

  async getAll(filters = {}, pagination = {}) {
    const media = await MediaRepository.findAll({
      where: filters,
      ...pagination,
    });
    return normalizeMediaCollection(media);
  }

  async getAllWithCount(filters = {}, pagination = {}) {
    const result = await MediaRepository.findAllWithCount({
      where: filters,
      ...pagination,
    });
    return {
      items: normalizeMediaCollection(result.items),
      total: result.total,
    };
  }

  async delete(id) {
    const media = await this.findById(id);
    if (!media) return null;
    return await MediaRepository.deleteById(id);
  }
}

export default new MediaService();

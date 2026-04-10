import BibleService from "../Services/BibleService.js";
import { sendSuccess, sendError } from "../core/response.js";
import { paginate } from "../Utils/helper.js";

class BibleController {
  // Stories
  async getAllStories(req, res) {
    const { page, limit: pageSize } = req.query;
    const stories = await BibleService.getAllStories(
      paginate(page || 1, pageSize),
    );
    return sendSuccess(res, {
      message: "Bible stories fetched successfully",
      data: stories,
    });
  }

  async createStory(req, res) {
    const story = await BibleService.createStory(req.body);
    return sendSuccess(res, {
      message: "Bible story created successfully",
      data: story,
      statusCode: 201,
    });
  }

  // Verses
  async getAllVerses(req, res) {
    const { page, limit: pageSize } = req.query;
    const verses = await BibleService.getAllVerses(
      paginate(page || 1, pageSize),
    );
    return sendSuccess(res, {
      message: "Bible verses fetched successfully",
      data: verses,
    });
  }

  async getDailyVerse(req, res) {
    const verse = await BibleService.getDailyVerse();
    if (!verse)
      return sendError(res, {
        message: "Resource not found",
        statusCode: 404,
      });
    return sendSuccess(res, {
      message: "Daily verse fetched successfully",
      data: verse,
    });
  }

  async createVerse(req, res) {
    const verse = await BibleService.createVerse(req.body);
    return sendSuccess(res, {
      message: "Bible verse created successfully",
      data: verse,
      statusCode: 201,
    });
  }
}

export default new BibleController();

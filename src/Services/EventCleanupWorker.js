import cron from "node-cron";
import { logger } from "../core/logger.js";
import EventService from "../Services/EventService.js";

/**
 * Event Cleanup Worker
 * Automatically removes past events from the database on a scheduled basis
 */
class EventCleanupWorker {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Start the cleanup worker with a specified schedule
   * Default: Run daily at 2 AM
   * @param {string} schedule - Cron schedule expression
   */
  start(schedule = "0 2 * * *") {
    if (this.isRunning) {
      logger.warn("Event cleanup worker is already running");
      return;
    }

    logger.info(`Starting event cleanup worker with schedule: ${schedule}`);
    
    this.job = cron.schedule(schedule, async () => {
      await this.performCleanup();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    this.isRunning = true;
    logger.info("Event cleanup worker started successfully");
  }

  /**
   * Stop the cleanup worker
   */
  stop() {
    if (this.job) {
      this.job.stop();
      this.job.destroy();
      this.isRunning = false;
      logger.info("Event cleanup worker stopped");
    }
  }

  /**
   * Perform the cleanup operation
   */
  async performCleanup() {
    try {
      logger.info("Starting scheduled event cleanup...");
      
      const result = await EventService.cleanupPastEvents();
      
      if (result.deletedCount > 0) {
        logger.info(`Event cleanup completed: Deleted ${result.deletedCount} past events`, {
          deletedCount: result.deletedCount,
          date: result.date
        });
      } else {
        logger.info("Event cleanup completed: No past events to delete");
      }
      
    } catch (error) {
      logger.error("Error during scheduled event cleanup:", error);
    }
  }

  /**
   * Run cleanup immediately (for testing or manual execution)
   */
  async runNow() {
    if (this.isRunning) {
      logger.info("Running event cleanup manually...");
      await this.performCleanup();
    } else {
      logger.warn("Event cleanup worker is not running");
    }
  }

  /**
   * Get the status of the worker
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      schedule: this.job ? this.job.getStatus() : null,
      nextRun: this.job ? this.job.nextDate() : null
    };
  }
}

export default new EventCleanupWorker();
import cron from "node-cron";
import { logger } from "../core/logger.js";
import EventNotificationService from "./EventNotificationService.js";

class EventNotificationWorker {
  constructor() {
    this.isRunning = false;
  }

  start(schedule = "*/5 * * * *") {
    if (this.isRunning) {
      logger.warn("Event notification worker is already running");
      return;
    }

    logger.info(
      `Starting event notification worker with schedule: ${schedule}`,
    );

    this.job = cron.schedule(
      schedule,
      async () => {
        await this.processPendingReminders();
      },
      {
        scheduled: true,
        timezone: "UTC",
      },
    );

    this.isRunning = true;
    logger.info("Event notification worker started successfully");
  }

  stop() {
    if (!this.job) {
      return;
    }

    this.job.stop();
    this.job.destroy();
    this.isRunning = false;
    logger.info("Event notification worker stopped");
  }

  async processPendingReminders() {
    try {
      const summary = await EventNotificationService.processPendingReminders();
      logger.info("Event reminder run completed", summary);
      return summary;
    } catch (error) {
      logger.error("Event reminder run failed", {
        message: error.message,
      });
      throw error;
    }
  }

  async runNow() {
    return this.processPendingReminders();
  }
}

export default new EventNotificationWorker();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationsWorker = createNotificationsWorker;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const notifications_constants_1 = require("./notifications.constants");
function createNotificationsWorker(notificationsService, configService) {
    const logger = new common_1.Logger('NotificationsWorker');
    const redisUrl = configService.get('REDIS_URL') ?? 'redis://localhost:6379';
    const connection = new ioredis_1.default(redisUrl, { maxRetriesPerRequest: null });
    const worker = new bullmq_1.Worker(notifications_constants_1.NOTIFICATIONS_QUEUE, async (job) => {
        logger.log(`Processing notification job: ${job.name} for ${job.data.to}`);
        await notificationsService.sendEmail(job.data);
    }, { connection, concurrency: 5 });
    worker.on('completed', (job) => {
        logger.log(`Notification job ${job.id} completed`);
    });
    worker.on('failed', (job, err) => {
        logger.error(`Notification job ${job?.id} failed: ${err.message}`);
    });
    return worker;
}
//# sourceMappingURL=notifications.processor.js.map
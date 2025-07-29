import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { postHideJobName, postHideQueueName } from './post-hide.job';
import { PrismaService } from 'src/prisma/prisma.service';
import { Job } from 'bullmq';

@Processor(postHideQueueName)
@Injectable()
export class PostHideProcessor extends WorkerHost {
    private readonly logger = new Logger(PostHideProcessor.name);

    constructor(private readonly prisma: PrismaService) {
        super();
    }
    async process(job: Job<any, any, string>): Promise<any> {
        if (job.name !== postHideJobName) {
            this.logger.warn(`Bỏ qua job không hợp lệ: ${job.name}`);
            return;
        }

        const updatedPosts = await this.prisma.post.updateMany({
            where: {
                deletedAt: null,
                createdAt: {
                    lte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
                isHidden: false,
            },
            data: {
                isHidden: true,
            },
        });
        this.logger.log(`[PostHideJob]: Số bài viết đã ẩn:: ${updatedPosts.count}`);
    }
}

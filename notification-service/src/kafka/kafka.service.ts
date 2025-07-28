import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { KAFKA_CLIENTS, KAFKA_PATTERNS } from "src/constants/app.constant";

@Injectable()
export class KafkaService implements OnModuleInit {
    constructor(
        @Inject(KAFKA_CLIENTS.NOTIFICATION) private readonly authClient: ClientKafka,

    ) { }

    async onModuleInit() {
        this.authClient.subscribeToResponseOf(KAFKA_PATTERNS.AUTH.VERIFY_TOKEN);
        this.authClient.subscribeToResponseOf(KAFKA_PATTERNS.USER.FIND_ONE);

        await this.authClient.connect();
    }

    async verifyToken(patterns: string, data: any) {
        return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.AUTH.VERIFY_TOKEN, data));
    }

    async findUser(patterns: string, userId: string) {
        return firstValueFrom(this.authClient.send(KAFKA_PATTERNS.USER.FIND_ONE, userId));
    }
}

import { Controller, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { KAFKA_CLIENTS } from "src/constants/app.constants";

@Controller("users")
export class UserGatewayController {
    constructor(@Inject(KAFKA_CLIENTS.AUTH) private readonly client: ClientProxy) { }
}
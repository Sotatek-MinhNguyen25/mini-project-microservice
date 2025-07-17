import { Global, Module } from '@nestjs/common';
import { ConfigService, ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration';

@Global()
@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            load: [configuration],
        }),
    ],
    providers: [ConfigService],
    exports: [ConfigService]
})
export class ConfigModule { }

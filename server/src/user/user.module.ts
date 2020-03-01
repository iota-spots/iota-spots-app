import { Module, Inject, MiddlewareConsumer } from '@nestjs/common';
import { UserController } from './user.controller';
import { SuperloginModule } from 'src/superlogin/superlogin-module';
import { superloginConfig } from 'src/config/superlogin-config';

@Module({
    imports: [
        SuperloginModule.forRoot(superloginConfig),
    ],
    controllers: [
        UserController
    ],
    providers: [],
})
export class UserModule {
    constructor(@Inject('superlogin') private superlogin: any) { }

    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(this.superlogin.requireAuth)
            .forRoutes('user');
        consumer
            .apply(this.superlogin.requireAuth, this.superlogin.requireRole('admin'))
            .forRoutes('user/admin/');
    }
}

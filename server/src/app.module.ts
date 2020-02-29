import { Module, Inject, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

import { dbSetup } from './db-setup';
import { superloginConfig } from './config/superlogin-config';
import { SuperloginModule } from './superlogin/superlogin-module';
import { signupHandler } from './superlogin/signup-handler';
import { UserController } from './user/user.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SuperloginModule.forRoot(superloginConfig),
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {

  constructor(@Inject('superlogin') private superlogin: any) {
    this.superlogin.on('signup', signupHandler);
    dbSetup();
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(this.superlogin.requireAuth)
      .forRoutes('user');
    consumer
      .apply(this.superlogin.requireAuth, this.superlogin.requireRole('admin'))
      .forRoutes('user/list');
  }
}
import { Module, Inject } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { dbSetup } from './db-setup';
import { superloginConfig } from './config/superlogin-config';
import { SuperloginModule } from './superlogin/superlogin-module';
import { signupHandler } from './superlogin/signup-handler';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SuperloginModule.forRoot(superloginConfig),
    UserModule,
  ],
  controllers: [],
  providers: [],
})

export class AppModule {
  constructor(@Inject('superlogin') private superlogin: any) {
    this.superlogin.on('signup', signupHandler);
    dbSetup();
  }
}
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
var paymentModule = require('iota-payment');

import { AppModule } from './app.module';
import { SuperloginModule } from './superlogin/superlogin-module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  const CorsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: true,
    optionsSuccessStatus: 204,
    credentials: true,
  };
  app.enableCors(CorsOptions);
  app.useStaticAssets(join(__dirname, '.', 'superlogin/email-templates'));
  SuperloginModule.setup('/auth', app);
  var options = {
    api: true,
    websockets: true
    // ...
}

const server = paymentModule.createServer(app, options)

//Create an event handler which is called, when a payment was successfull
var onPaymentSuccess = function (payment) {
  console.log('payment success!', payment);
  // create a sot with payment.data
}

paymentModule.on('paymentSuccess', onPaymentSuccess);


await server.listen(5001);
await app.listen(5000);



}
bootstrap();

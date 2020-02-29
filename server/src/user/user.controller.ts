import { Controller, Get, Req, Inject, UseGuards } from '@nestjs/common';

@Controller('user')
export class UserController {

    constructor(@Inject('superlogin') private superlogin: any) { }

    @Get('info')
    getUserDoc(userId) {
        return this.superlogin.getUser('max');
    }
}

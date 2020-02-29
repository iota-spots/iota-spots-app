import { Controller, Get, Req, Inject, UseGuards, Param } from '@nestjs/common';
import * as nano from 'nano';


@Controller('user')
export class UserController {

    couch: any = nano({
        url: 'http://' + process.env.COUCHDB_USR + ':' + process.env.COUCHDB_PW + '@' + process.env.COUCHDB_HOST + ':' + process.env.COUCHDB_PORT
    });
    users = this.couch.use('users');

    constructor(@Inject('superlogin') private superlogin: any) { }

    @Get('info/:id')
    getUserDoc(@Param() id) {
        return this.superlogin.getUser(id.id);
    }

    @Get('delete/:id')
    deleteUser(@Param() id) {
        return this.superlogin.removeUser(id.id, true);
    }

    @Get('list')
    async listUser() {
        let users = [];
        await this.users.view('userDoc', 'all_users', {
            'include_docs': true
        }).then((body) => {
            body.rows.forEach((doc) => {
                users.push(doc.doc);
            })
        }).catch((err) => {
            console.log(err);
            return err;
        });
        return users;
    }

}

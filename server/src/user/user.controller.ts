import { Controller, Get, Req, Inject, UseGuards, Param, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
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

    @Get('admin/list')
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

    @Post('admin/edit')
    editUser(@Body() newDetails, @Res() res: Response) {
        this.users.get(newDetails.user_id).then((body) => {
            let userDoc = body;
            userDoc.roles.splice(0, 1, newDetails.role);
            userDoc.email = newDetails.email;
            this.users.insert(userDoc).then(
                result => {
                    res.send(result);
                },
                err => {
                    res.send(err.message);
                }
            );
        }).catch((err) => {
            res.send(err);
        });
    }

}

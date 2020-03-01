import { Controller, Get, Req, Inject, UseGuards, Param, Post, Body, Res, HttpStatus } from '@nestjs/common';
import * as nano from 'nano';

@Controller('spots')
export class SpotsController {

    couch: any = nano({
        url: 'http://' + process.env.COUCHDB_USR + ':' + process.env.COUCHDB_PW + '@' + process.env.COUCHDB_HOST + ':' + process.env.COUCHDB_PORT
    });
    spots = this.couch.use('spots');
}

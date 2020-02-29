<img src="https://git.heichling.xyz/max/cain-stack/raw/branch/master/cain_stack_slaying_zend.jpg" width="320" alt="CAIN Stack slaying Zend" align="right">
# CAIN Stack Template

## About

This project is a template to build an offline first web application with authentication, that can be ported easily to other platforms (Android, iOS, Electron). It runs on the **CAIN Stack** which consists of following technologies:
* [**C**ouchDB](https://couchdb.apache.org/) as remote server database / [PouchDB](https://pouchdb.com/) as local database
* [**A**ngular](https://angular.io/) as frontend framework
* [**I**onic](https://ionicframework.com/) for cross platform components and [capacitor](https://capacitor.ionicframework.com/) as wrapper
* [**N**estJS](https://nestjs.com/) as backend framework


## Features

* Complete User authentication with confirm mail, password forget, user roles and more
* Admin Panel for editing users
* Private and shared database (admins can edit every document in every database)
* Fully functional offline and syncing enabled by default
* Native Apis like calling network state (more can be easily added with [capacitor](https://capacitor.ionicframework.com/))
* Cross Platform 

## Installation

Requirements: Installed Ionic Cli, NodeJS, NestJS and CouchDB locally. Disable the cors policy in couchdb and register an admin (credentials can be edited in the .env file, further below).

Install the client dependencies by `cd client` and running `npm i` . Do the same in the server folder ( `cd server`  `npm i` ). Start the client framework by running `ionic serve` , after adding the .env file into the `server` directory, start the server by running `nest start --watch` .

### .env

Put a .env file into the root of the server folder

``` 
BASEURL=http://localhost:8100
NESTURL=http://localhost:3000
COUCHDB_HOST=localhost
COUCHDB_PORT=5984
COUCHDB_USR=admin
COUCHDB_PW=couchdb
MAILER_USR=gmailaccountname
MAILER_PW=gmailaccountpassword
```

## Additional information

### db-setup.ts ( `server/src/db-setup.ts` )
The setup function automatically creates all necessary databases and design documents (can be found in `server/src/design-docs` ). For developing it can be useful to purge all databases. Just uncomment the function at the beginning of the setup handler, save, comment again and save again.

### superlogin-config ( `server/src/config/superlogin-config.ts` )

Authentication heavily relies on [superlogin](https://git.heichling.xyz/max/superlogin). Press the link to read the full documentation. Almost all main apis are included in this template.

### User roles

User roles can be defined and will be automatically added to the user doc (see `server/src/superlogin/signup-handler.ts` on line 30). By default users with the `admin` role will have access to all documents. Routes can be guarded by user role (see `server/src/app.module.ts` on line 32)

### maxperience.blog

[Check out this blog post for more information](https://maxperience.blog/post/webdev-endgame-2020/)


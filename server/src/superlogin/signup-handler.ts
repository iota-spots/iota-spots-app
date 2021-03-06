import * as nano from 'nano';

export const signupHandler = async (userDoc, provider) => {

    const couch: any = nano({
        url: 'http://' + process.env.COUCHDB_USR + ':' + process.env.COUCHDB_PW + '@' + process.env.COUCHDB_HOST + ':' + process.env.COUCHDB_PORT
    });

    // define couchDB variables
    const users = couch.use('users');

    // get just signed up users private DB name
    const regex = /^private\$(.+)$/;
    let privateDB;
    for (let dbs in userDoc.personalDBs) {
        if (regex.test(dbs)) {
            privateDB = dbs;
        }
    }

    // Replicate design documents to private DB
    couch.db.replicate('user-resources', privateDB).then((body) => {
        return couch.db.replication.query(body.id);
    }).then((response) => {
        // console.log(response);
    }).catch((err) => {
        console.log(err);
    });

    // add role to user doc
    if (userDoc.role != 'user') {
        let userRoleDoc;
        users.get(privateDB.match(regex)[1]).then((body) => {
            userRoleDoc = body;
            userRoleDoc.roles.splice(0, 1, userDoc.role);
            users.insert(userRoleDoc).then(
                result => {
                    // console.log(result);
                },
                err => {
                    console.log(err.message);
                }
            );
        }).catch((err) => {
            console.log(err);
        });
    }

    // Replication handler, fetches admins and respective admin dbs and creates master<->master replications
    // fetch admin users
    let adminUsers = [];
    await users.view('userDoc', 'admin_users', {
        'include_docs': true
    }).then((body) => {
        body.rows.forEach((doc) => {
            adminUsers.push(doc.id);
        })
    }).catch((err) => {
        console.log(err);
    });

    // fetch non admin users
    let nonAdminUsers = [];
    await users.view('userDoc', 'non_admin_users', {
        'include_docs': true
    }).then((body) => {
        body.rows.forEach((doc) => {
            nonAdminUsers.push(doc.id);
        })
    }).catch((err) => {
        console.log(err);
    });

    // handle replications
    // opts for user to admin db replication
    const optsUserToAdminRep = {
        continuous: true,
        create_target: true,
        // exclude design documents
        selector: {
            "_id": {
                "$regex": "^(?!_design\/)",
            }
        }
    };

    if (userDoc.role === 'admin') {
        nonAdminUsers.forEach((user) => {
            // opts for admin to replication
            const optsAdminToUserRep = {
                continuous: true,
                // only include relevant user documents & exclude design documents
                selector: {
                    "_id": {
                        "$regex": "^(?!_design\/)",
                    },
                    "author": {
                        "$eq": user,
                    }
                }
            };
            // enable replication from private DB to admin privateDB
            couch.db.replication.enable('private$' + user, privateDB, optsUserToAdminRep).then((body) => {
                return couch.db.replication.query(body.id);
            }).then((response) => {
                // console.log(response);
            }).catch((err) => {
                console.log(err);
            });
            // enable replication from private DB to admin privateDB
            couch.db.replication.enable(privateDB, 'private$' + user, optsAdminToUserRep).then((body) => {
                return couch.db.replication.query(body.id);
            }).then((response) => {
                // console.log(response);
            }).catch((err) => {
                console.log(err);
            });
        })
    } else { // if user is not admin
        adminUsers.forEach((admin) => {
            // opts for admin to replication
            const optsAdminToUserRep = {
                continuous: true,
                // only include relevant user documents & exclude design documents
                selector: {
                    "_id": {
                        "$regex": "^(?!_design\/)",
                    },
                    "author": {
                        "$eq": privateDB.match(regex)[1],
                    }
                }
            };
            // enable replication from private DB to admin privateDB
            couch.db.replication.enable(privateDB, 'private$' + admin, optsUserToAdminRep).then((body) => {
                return couch.db.replication.query(body.id);
            }).then((response) => {
                // console.log(response);
            }).catch((err) => {
                console.log(err);
            });
            // enable replication from private DB to admin privateDB
            couch.db.replication.enable(privateDB, 'private$' + admin, optsAdminToUserRep).then((body) => {
                return couch.db.replication.query(body.id);
            }).then((response) => {
                // console.log(response);
            }).catch((err) => {
                console.log(err);
            });
        })
    }
}

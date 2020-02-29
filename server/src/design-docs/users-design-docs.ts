export const usersDesignDocuments = [
    {
        _id: '_design/userDoc',
        language: 'javascript',
        views: {
            admin_users: {
                map: "function(doc){ if(doc.type == 'user' && doc.role == 'admin'){emit(doc);} }"
            },
            non_admin_users: {
                map: "function(doc){ if(doc.type == 'user' && doc.role != 'admin'){emit(doc);} }"
            },
            all_users: {
                map: "function(doc){ if(doc.type == 'user'){emit(doc);} }"
            }
        }
    }
]
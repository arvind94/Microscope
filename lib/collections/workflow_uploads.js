Workflows = new FS.Collection('workflows', {
 stores: [new FS.Store.FileSystem('workflows',{path:'Users/arvindramtyagarajan/projectUploads'})]
});
Workflows.allow({
    insert: function (userId, doc) {
        return !!userId;
     },
    update: function (userId, doc) {
        return doc.creatorId == userId
    },
    download: function (userId, doc) {
        return !!userId;
    },
    remove: function (userId, doc) { 
        return !!userId;
    }
});

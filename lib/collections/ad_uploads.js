Uploads = new FS.Collection('uploads', {
 stores: [new FS.Store.FileSystem('uploads',{path:'Users/arvindramtyagarajan/projectUploads'})]
});
Uploads.allow({
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

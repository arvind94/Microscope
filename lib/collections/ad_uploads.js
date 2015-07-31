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
// Meteor.methods({
//     adInsert: function(adAttributes) {    
//         var user = Meteor.user();
//         var ad = _.extend(adAttributes, {
//             userId: user._id, author: user.username, submitted: new Date(), campaignId:campaignName
//         });
//         var adIdentity = Uploads.insert(ad);
//         return {
//             _id: adIdentity
//         }; 
//     }
// });

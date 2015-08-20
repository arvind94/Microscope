Edges = new Mongo.Collection('edges');
Edges.allow({
    insert: function (userId, edge) {
        return !!userId;
    },
    update: function (userId, edge) {
        return edge.userId === Meteor.userId();
    },
    remove: function (userId, edge) { 
        return ownsDocument(userId, edge); 
    }
});
// validateEdge = function (edge) { 
//     var errors = {};
//     // console.log(campaignName);
//     if (!node.title)
//     errors.title = "Please fill in a Name";
//     // console.log(Uploads.find({'original.name': node.title,'campaignId': campaignName, 'creatorId': Meteor.userId()}).fetch());
//     if(Uploads.find({'original.name': node.title,'campaignId': node.campaign, 'creatorId': Meteor.userId()}).fetch().length===0)
//     errors.title = "This Ad does not exist in this Campaign"
//     return errors; 
// }
Meteor.methods({
    edgeInsert: function(edgeAttributes) {
        check(Meteor.userId(), String);
        check(edgeAttributes, {
            d3id: String,
            campaign: String,
            rules:String,
            saved: String,
            deleted: Boolean,
            targetd3id: Number,
            sourced3id: Number
        });
        // console.log(campaignName);
        // var errors = validateNode(nodeAttributes); 
        // if (errors.title)
        // throw new Meteor.Error('invalid-ad', "You must choose an ad from the current campaign");   
        var user = Meteor.user();
        var edge = _.extend(edgeAttributes, {
            userId: user._id, author: user.username, submitted: new Date()
        });
        // console.log("yo");
        var edgeIdentity = Edges.insert(edge, function(error,result){
            if (error)
                console.log(error);
            // if (result)
            //     console.log(result);
        });
        return {
            _id: edgeIdentity
        }; 
    }
});
Nodes = new Mongo.Collection('nodes');
Nodes.allow({
    insert: function (userId, node) {
        return !!userId;
    },
    update: function (userId, node) {
        return node.userId === Meteor.userId();
    },
    remove: function (userId, node) { 
        return ownsDocument(userId, node); 
    }
});
validateNode = function (node) { 
    var errors = {};
    // console.log(campaignName);
    console.log(!node.title);
    if (!node.title)
    errors.title = "Please fill in a Name";
    // console.log(Uploads.find({'original.name': node.title,'campaignId': campaignName, 'creatorId': Meteor.userId()}).fetch());
    if(Uploads.find({'original.name': node.title,'campaignId': node.campaign, 'creatorId': Meteor.userId()}).fetch().length===0)
    errors.title = "This Ad does not exist in this Campaign"
    return errors; 
}
Meteor.methods({
    nodeInsert: function(nodeAttributes) {
        check(Meteor.userId(), String);
        check(nodeAttributes, {
            title: String,
            campaign: String,
            saved: String,
            d3id: Number,
            deleted: Boolean,
            targets: Array,
            sources: Array
        });
        // console.log(campaignName);
        var errors = validateNode(nodeAttributes); 
        if (errors.title)
        throw new Meteor.Error('invalid-ad', "You must choose an ad from the current campaign");   
        var user = Meteor.user();
        var node = _.extend(nodeAttributes, {
            userId: user._id, author: user.username, submitted: new Date()
        });
        // console.log("yo");
        var nodeIdentity = Nodes.insert(node, function(error,result){
            if (error)
                console.log(error);
            // if (result)
            //     console.log(result);
        });
        return {
            _id: nodeIdentity
        }; 
    }
});
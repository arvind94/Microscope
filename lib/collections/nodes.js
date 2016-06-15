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
    // error if node does not have a title
    if (!node.title)
    errors.title = "Please fill in a Name";
    // error if node title is not a valid ad for the current user in the current campaign
    if(Uploads.find({'original.name': node.title,'campaignId': node.campaign, 'creatorId': Meteor.userId()}).fetch().length===0)
    errors.title = "This Ad does not exist in this Campaign"
    return errors; 
}
Meteor.methods({
    nodeInsert: function(nodeAttributes) {
        check(Meteor.userId(), String);
        // checks types of node properties
        check(nodeAttributes, {
            title: String,
            campaign: String,
            saved: String,
            d3id: Number,
            deleted: Boolean,
            targets: Array,
            sources: Array
        });
        // ensures node title is an existing ad for current user in current campaign
        var errors = validateNode(nodeAttributes); 
        // throws an error in case node title is not an existing ad for current user in current campaign
        if (errors.title)
        throw new Meteor.Error('invalid-ad', "You must choose an ad from the current campaign");   
        var user = Meteor.user();
        // creates a variable that contains all node properties and adds other properties to it
        var node = _.extend(nodeAttributes, {
            userId: user._id, author: user.username, submitted: new Date()
        });
        // inserts node in node collection
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
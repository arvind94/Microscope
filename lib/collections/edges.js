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

Meteor.methods({
    edgeInsert: function(edgeAttributes) {
        check(Meteor.userId(), String);
        // checks types of edge properties
        check(edgeAttributes, {
            d3id: String,
            campaign: String,
            oldRules: String,
            rules: String,
            oldPriority: String,
            priority: String,
            saved: String,
            deleted: Boolean,
            targetd3id: Number,
            sourced3id: Number
        });
        
        var user = Meteor.user();
        // creates a variable that contains all edge properties and adds other properties to it
        var edge = _.extend(edgeAttributes, {
            userId: user._id, author: user.username, submitted: new Date()
        });
        // inserts edge in edge collection
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
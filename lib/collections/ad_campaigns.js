Campaigns = new Mongo.Collection('campaigns');
Campaigns.allow({
    insert: function (userId, campaign) {
        return !!userId;
    },
    update: function (userId, campaign) {
        return doc.creatorId == userId
    },
    remove: function (userId, campaign) { 
        return ownsDocument(userId, campaign); 
    }
});
validateCampaign = function (campaign) { 
    var errors = {};
    if (!campaign.title)
    errors.title = "Please fill in a Name";
    return errors; 
}
Meteor.methods({
    campaignInsert: function(campaignAttributes) {
        check(Meteor.userId(), String);
        check(campaignAttributes, {
            title: String
        });
        var errors = validateCampaign(campaignAttributes); 
        if (errors.title)
        throw new Meteor.Error('invalid-campaign', "You must set a title for your campaign");
        var campaignWithSameTitle = Campaigns.findOne({title: campaignAttributes.title, userId: this.userId}); 
        if (campaignWithSameTitle) {
            return {
                campaignExists: true,
                _id: campaignWithSameTitle._id
            } 
        }    
        var user = Meteor.user();
        var campaign = _.extend(campaignAttributes, {
            userId: user._id, author: user.username, submitted: new Date()
        });
        var campaignIdentity = Campaigns.insert(campaign);
        return {
            _id: campaignIdentity
        }; 
    }
});
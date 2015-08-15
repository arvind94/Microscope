Rules = new Mongo.Collection('rules');
Rules.allow({
    insert: function (userId, rules) {
        return !!userId;
    },
    update: function (userId, rules) {
        return rules.userId === Meteor.userId();
    },
    remove: function (userId, rules) { 
        return ownsDocument(userId, rules); 
    }
});
validateRule = function (rule) { 
    var errors = {};
    if (!rule.gazeTime)
    errors.gazeTime = "Please fill in a gaze time";
    return errors; 
}
Meteor.methods({
    ruleInsert: function(ruleAttributes) {
        check(Meteor.userId(), String);
        check(ruleAttributes, {
            ruleNo: Number,
            gazeTime: String,
            gender: String,
            age: String,
            race: String,
            emotion: String,
            campaign:String
        });
        var errors = validateRule(ruleAttributes); 
        if (errors.gazeTime)
        throw new Meteor.Error('invalid-rule', "You must set a gaze time for your rule");
        var ruleWithSameAttributes = Rules.findOne({
            gazeTime: ruleAttributes.gazeTime,
            gender: ruleAttributes.gender,
            age: ruleAttributes.age,
            race: ruleAttributes.race,
            emotion: ruleAttributes.emotion,
            userId: this.userId,
            campaign: ruleAttributes.campaign
        }); 
        if (ruleWithSameAttributes) {
            return {
                ruleExists: true,
                _id: ruleWithSameAttributes._id
            } 
        }    
        var user = Meteor.user();
        var rule = _.extend(ruleAttributes, {
            userId: user._id, author: user.username, submitted: new Date()
        });
        var ruleIdentity = Rules.insert(rule);
        return {
            _id: ruleIdentity
        }; 
    }
});
Template.Rule.helpers({
  sameCampaign:function() {
    return this.campaign === sessionStorage.campaignName;
  },
  rules:function() {
    return Rules.find()
  },
  ruleNo: function() {
    return this.ruleNo;
  },
  gazeTime: function() {
    return this.gazeTime;
  },
  gender: function() {
    return this.gender;
  },
  age: function() {
    return this.age;
  },
  race: function() {
    return this.race;
  },
  emotion: function() {
    return this.emotion;
  },
  ownRule:function() {
    return this.userId === Meteor.userId();
  }
});
Template.Rule.events({ 
  'click .newRule': function(e) { 
    e.preventDefault();
    Router.go('ruleSubmit');
  },
  'click .backToCampaignSetup': function(e) { 
    e.preventDefault();
    Router.go('campaignSetup');
  },
  'click .delete': function(e) { 
      e.preventDefault();
      if (confirm("Delete this Rule?")) {
        var deletedRuleNo = this.ruleNo; 
        var currentRuleId = this._id; 
        var ruleCount = Rules.find({'userId': Meteor.userId(), 'campaign':sessionStorage.campaignName}).fetch().length;
        if(ruleCount>this.ruleNo){
          for(var i = this.ruleNo + 1; i <= ruleCount; i++){
            var id = Rules.find({'userId': Meteor.userId(), 'campaign': sessionStorage.campaignName, 'ruleNo': i}).fetch()[0]._id;
            Rules.update(id, {$set:{'ruleNo': i - 1}});
          }
        }
        Rules.remove(currentRuleId);
      }
  }
});

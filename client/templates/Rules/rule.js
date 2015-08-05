Template.Rule.helpers({
  sameCampaign:function() {
    // return this.campaign === campaignName;
    // return this.campaign === CurrentCampaigns.find({'userId':Meteor.userId()}).fetch()[0].title;
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
        var currentRuleId = this._id; 
        Rules.remove(currentRuleId);
      }
  }
});

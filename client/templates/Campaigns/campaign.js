Template.Campaign.helpers({
  campaigns:function() {
    return Campaigns.find()
  },
  name: function() {
    return this.title;
  },
  ownCampaign:function() {
    return this.userId === Meteor.userId();
  }
});
Template.Campaign.events({ 
  'click .newCampaign': function(e) { 
    e.preventDefault();
    Router.go('campaignSubmit');
  },
  'click .delete': function(e) { 
      e.preventDefault();
      if (confirm("Delete this Campaign?")) { 
        var currentUploadId = this._id; 
        Campaigns.remove(currentUploadId);
        console.log(this.title);
        var length = Uploads.find({'campaignId': this.title, 'creatorId': Meteor.userId()}).fetch().length;
        for( var i = 0; i < length; i++){
          Uploads.remove(Uploads.find({'campaignId': this.title, 'creatorId': Meteor.userId()}).fetch()[0]._id);
          console.log(i);
        }
        length = Nodes.find({'campaign': this.title, 'userId': Meteor.userId()}).fetch().length;
        for( var i = 0; i < length; i++){
          Nodes.remove(Nodes.find({'campaign': this.title, 'userId': Meteor.userId()}).fetch()[0]._id);
          console.log(i);
        }
        length = Rules.find({'campaign': this.title, 'userId': Meteor.userId()}).fetch().length;
        for( var i = 0; i < length; i++){
          Rules.remove(Rules.find({'campaign': this.title, 'userId': Meteor.userId()}).fetch()[0]._id);
          console.log(i);
        }
        if(Workflows.find({'campaignId': this.title, 'creatorId': Meteor.userId()}).fetch().length!==0)
          Workflows.remove(Workflows.find({'campaignId': this.title, 'creatorId': Meteor.userId()}).fetch()[0]._id);
      }
  },
  'click .campaignSelect': function(e) { 
    e.preventDefault();
    sessionStorage.campaignName = this.title;
    Router.go('campaignSetup');
  }
});

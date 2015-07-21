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
        var length = Uploads.find({'campaignId': this.title, 'creatorId': this.userId}).fetch().length;
        for( var i = 0; i < length; i++){
          Uploads.remove(Uploads.find({'campaignId': this.title, 'creatorId': this.userId}).fetch()[0]._id);
          console.log(i);
        }
      }
  },
  'click .campaignSelect': function(e) { 
    e.preventDefault();
    campaignName = this.title;
    console.log(campaignName);
    Router.go('Profile1');
  }
});

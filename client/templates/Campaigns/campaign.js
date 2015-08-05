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
    // var currentCampaign = { 
    //   title: this.title
    // };
    // var errors = validateCampaign(campaign); 
    // if (errors.title)
    // return Session.set('campaignSubmitErrors', errors);
    // Meteor.call('currentCampaignInsert', currentCampaign, function(error, result) { // display the error to the user and abort
    //   console.log("2");
    //   if (error)
    //   return throwError(error.reason);
    // });
    // console.log(CurrentCampaigns.find({'userId': Meteor.userId()}).fetch()[0].title);
    sessionStorage.campaignName = this.title;
    // console.log(sessionStorage.campaignName);
    // campaignName = this.title;
    Router.go('campaignSetup');
  }
});

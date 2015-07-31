Template.Profile1.helpers({
  uploads:function(){
    return Uploads.find();
  },
  ownUpload:function(){
    return this.creatorId === Meteor.userId();
  },
  ownCampaign:function(){
    //console.log(this.campaignId);
    return this.campaignId === campaignName;
  }
});
Template.Profile1.events({
    'change .fileInput': function(event, template) {
      FS.Utility.eachFile(event, function(file) {
        var fileObj =  new FS.File(file);
        fileObj.creatorId = Meteor.userId();
        fileObj.campaignId = campaignName;
        if(Uploads.find({'original.name': fileObj.original.name,'campaignId': campaignName, 'creatorId': Meteor.userId()}).fetch().length!==0){
          if(confirm("Ad already exists, do you want to replace it?")) {
            Uploads.remove(Uploads.find({'original.name': fileObj.original.name,'campaignId': campaignName, 'creatorId': Meteor.userId()}).fetch()[0]._id);
            Uploads.insert(fileObj, function(err) {
            if(err)
            console.log(err);
            });
          } 
        } 
        else {
          Uploads.insert(fileObj, function(err) {
            if(err)
            console.log(err);
          });
        } 
      $("#FileUploader").val('');
      });
    },
    'click .delete': function(e) { 
      e.preventDefault();
      if (confirm("Delete this Ad?")) { 
        var currentUploadId = this._id; 
        Uploads.remove(currentUploadId); 
      } 
    },
    'click .backToCampaignSetup': function(e) { 
      e.preventDefault();
      Router.go('campaignSetup');  
    }    
});
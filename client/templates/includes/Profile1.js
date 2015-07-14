Template.Profile1.helpers({
  uploads:function(){
    return Uploads.find();
  },
  ownUpload:function(){
    return this.creatorId === Meteor.userId();
  }
});
Template.Profile1.events({
    'change .fileInput': function(event, template) {
      FS.Utility.eachFile(event, function(file) {
        var fileObj =  new FS.File(file);
        fileObj.creatorId = Meteor.userId();
        Uploads.insert(fileObj, function(err) {
        if(err)
           console.log(err);
        });
        $("#FileUploader").val('');
      });
    },
    'click .delete': function(e) { 
      e.preventDefault();
      if (confirm("Delete this Ad?")) { 
        var currentUploadId = this._id; 
        Uploads.remove(currentUploadId); 
      } 
    }    
});
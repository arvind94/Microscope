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
        console.log(fileObj.original.name);
        fileObj.creatorId = Meteor.userId();
        if(Uploads.find({'original.name': fileObj.original.name}).fetch().length!==0) {
          if(confirm("Ad already exists, do you want to replace it?")) {
            Uploads.remove(Uploads.find({'original.name': fileObj.original.name}).fetch()[0]._id);
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
    }    
});
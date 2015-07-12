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
             console.log(err);
        }); 
      });
    }    
});
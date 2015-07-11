Template.Profile1.helpers({
  uploads:function(){
    return Uploads.find();
  }
});
Template.Profile1.events({
    'change .fileInput': function(event, template) {
      FS.Utility.eachFile(event, function(file) {
        var fileObj =  new FS.File(file);
        Uploads.insert(fileObj, function(err) {
             console.log(err);
        }); 
      });
    }    
});
Template.campaignSetup.events({
	'click .adUpload':function(e){
		e.preventDefault();
		Router.go('Profile1');
	},
	'click .setRules':function(e){
		e.preventDefault();
		Router.go('Rule');
	},
	'click .backToCampaigns':function(e){
		e.preventDefault();
		CurrentCampaigns.remove(CurrentCampaigns.find({'userId': Meteor.userId()}).fetch()[0]._id);
		Router.go('Campaign');
	},
	'click .createWorkflow':function(e){
		e.preventDefault();
		Router.go('workflow');
		console.log(Meteor.userId());
		console.log(sessionStorage.campaignName);
		// console.log(campaignName);
	}
});
Template.campaignSetup.onCreated(function(){
	// console.log(Meteor.CampaignName);
});
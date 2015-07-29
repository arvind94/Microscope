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
		Router.go('Campaign');
	},
	'click .createWorkflow':function(e){
		e.preventDefault();
		Router.go('workflow');
	}
});
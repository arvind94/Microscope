Template.campaignSubmit.onCreated(function() { 
	Session.set('campaignSubmitErrors', {});
});
Template.campaignSubmit.helpers({ 
	errorMessage: function(field) {
		return Session.get('campaignSubmitErrors')[field]; 
	},
	errorClass: function (field) {
		return !!Session.get('campaignSubmitErrors')[field] ? 'has-error' : '';
	} 
});
Template.campaignSubmit.events({ 
	'submit form': function(e) {
    	e.preventDefault();
		var campaign = { 
			title: $(e.target).find('[name=title]').val()
		};
		var errors = validateCampaign(campaign); 
		if (errors.title)
		return Session.set('campaignSubmitErrors', errors);
		Meteor.call('campaignInsert', campaign, function(error, result) { // display the error to the user and abort
			if (error)
			return throwError(error.reason);
			if (result.campaignExists)
			throwError('This campaign already exists');
      		Router.go('Campaign');
    	});
  	},
  	'click .cancel': function(e) { 
    e.preventDefault();
    Router.go('Campaign');
	}
});
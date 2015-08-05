Template.ruleSubmit.onCreated(function() { 
  Session.set('ruleSubmitErrors', {});
});
Template.ruleSubmit.helpers({ 
  errorMessage: function(field) {
    return Session.get('ruleSubmitErrors')[field]; 
  },
  errorClass: function (field) {
    return !!Session.get('ruleSubmitErrors')[field] ? 'has-error' : '';
  } 
});
Template.ruleSubmit.events({ 
  'submit form': function(e) { 
    e.preventDefault();
    // console.log(campaignName);
    var rule = { 
      ruleNo: $(e.target).find('[id=ruleNo]').val(),
      gazeTime: $(e.target).find('[id=gazeTime]').val(),
      gender: $(e.target).find('[id=gender]').val(),
      age: $(e.target).find('[id=age]').val(),
      race: $(e.target).find('[id=race]').val(),
      emotion: $(e.target).find('[id=emotion]').val(),
      // campaign: campaignName
      // campaign: CurrentCampaigns.find({'userId': Meteor.userId()}).fetch()[0].title
      campaign: sessionStorage.campaignName
    };
    var errors = validateRule(rule); 
    if (errors.gazeTime)
    return Session.set('ruleSubmitErrors', errors);
    Meteor.call('ruleInsert', rule, function(error, result) { // display the error to the user and abort
      if (error)
      return throwError(error.reason);
      if (result.ruleExists)
      throwError('This rule already exists');
      Router.go('Rule');
    });
  }
});

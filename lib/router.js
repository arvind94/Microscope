 Router.configure({
  	layoutTemplate: 'layout',
  	loadingTemplate: 'loading',
  	notFoundTemplate: 'notFound',
  	waitOn: function(){ 
  		return [Meteor.subscribe('notifications')];
  	}
});
PostsListController = RouteController.extend({ 
	template: 'postsList',
	increment: 5,
	postsLimit: function() {
		return parseInt(this.params.postsLimit) || this.increment; 
	},
	findOptions: function() {
		return {sort: this.sort, limit: this.postsLimit()};
	},
	subscriptions: function() {
		this.postsSub = Meteor.subscribe('posts', this.findOptions()); 
	},
	posts: function() {
		return Posts.find({}, this.findOptions());
	},
	data: function() {
		var hasMore = this.posts().count() === this.postsLimit(); 
		return {
			posts: this.posts(),
			ready: this.postsSub.ready,
			nextPath: hasMore ? this.nextPath() : null
		}; 
	}
});
NewPostsController = PostsListController.extend({ 
	sort: {
		submitted: -1, _id: -1
	},
	nextPath: function() {
		return Router.routes.newPosts.path({postsLimit: this.postsLimit() + this.increment})
	}
});
BestPostsController = PostsListController.extend({ 
	sort: {
		votes: -1, submitted: -1, _id: -1
	}, 
	nextPath: function() {
		return Router.routes.bestPosts.path({postsLimit: this.postsLimit() + this.increment})
	} 
});
Router.route('/', {
  	name: 'home',
  	controller: NewPostsController
});
Router.route('/Profile1',{
	waitOn: function () {
 		return Meteor.subscribe('uploads')
 	},
 	action: function () {
 		if (this.ready())
 			this.render('Profile1');
 		else
 			this.render('Loading');
 	}
});
Router.route('/Campaign',{
	waitOn: function () {
 		return [Meteor.subscribe('campaigns'), Meteor.subscribe('uploads')];
 	},
 	action: function () {
 		if (this.ready())
 			this.render('Campaign');
 		else
 			this.render('Loading');
 	}
});
Router.route('/campaignSetup', {name: 'campaignSetup'});
Router.route('/Rule',{
	waitOn: function () {
 		return [Meteor.subscribe('rules'),Meteor.subscribe('campaigns')];
 	},
 	action: function () {
 		if (this.ready())
 			this.render('Rule');
 		else
 			this.render('Loading');
 	}
});
Router.route('/workflow',{
	waitOn: function () {
 		return [Meteor.subscribe('uploads'),Meteor.subscribe('nodes'),Meteor.subscribe('campaigns'),Meteor.subscribe('workflows'),Meteor.subscribe('rules')];
 	},
 	action: function () {
 		if (this.ready())
 			this.render('workflow');
 		else
 			this.render('Loading');
 	}
});
Router.route('/ruleSubmit', {
	waitOn: function() {
		return [Meteor.subscribe('rules')];
	},
	action: function (){
		if(this.ready())
			this.render('ruleSubmit');
		else
			this.render('Loading');
	}
});
Router.route('/campaignsubmit', {name: 'campaignSubmit'});
Router.route('/new/:postsLimit?', {name: 'newPosts'});
Router.route('/best/:postsLimit?', {name: 'bestPosts'});
Router.route('/posts/:_id', {
  	name: 'postPage',
  	waitOn: function() {
	return [Meteor.subscribe('singlePost', this.params._id), Meteor.subscribe('comments', this.params._id)]; 
 },
data: function() {return Posts.findOne(this.params._id);}
});
Router.route('/posts/:_id/edit', {
	name: 'postEdit',
	waitOn:function() {
		return Meteor.subscribe('singlePost', this.params._id); 
	},
	data: function() { return Posts.findOne(this.params._id); }
});
Router.route('/submit', {name: 'postSubmit'});
var requireLogin = function() { 
	if (! Meteor.user()) {
		if (Meteor.loggingIn()) { 
			this.render(this.loadingTemplate);
		} 
		else { 
			this.render('accessDenied');
		}
	} 
	else {
		this.next(); }
	}
Router.onBeforeAction('dataNotFound', {only: 'postPage'});
Router.onBeforeAction(requireLogin, {only: 'postSubmit'});
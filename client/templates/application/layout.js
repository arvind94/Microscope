Template.layout.onRendered(function() { this.find('#main')._uihooks = {
insertElement: function(node, next) { $(node)
        .hide()
        .insertBefore(next)
        .fadeIn();
},
removeElement: function(node) {
$(node).fadeOut(function() { $(this).remove();
}); }
}
// below code makes website view mobile friendly
// $(document).ready(function (){
  if (/iPhone/.test(navigator.userAgent) && !window.MSStream){  	
    // $(document).on("focus", "input, textarea, select", function(){
      $('meta[name=viewport]').remove();
      $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">');
      // alert("hi1");
    // });
    // $(document).on("blur", "input, textarea, select", function(){
    //   $('meta[name=viewport]').remove();
    //   $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1">');
    //   // alert("hi2");
    // });
  }
// })
});
Template.workflow.onCreated(function() { 
  Session.set('nodeSubmitErrors', {});
  // checking if user has hit reset to last save button during current session
  sessionStorage.resetWorkflowToLastSaveCounter = 0;
  var ruleCount = Rules.find({'userId': Meteor.userId(), 'campaign':sessionStorage.campaignName}).fetch().length;
  if(ruleCount!==0)
  // html for creating rule form on edge creation or selection
  sessionStorage.formCreator = "<input type=checkbox id=check1>1</input>";
  for(var i = 2; i <= ruleCount; i++){
  // adding additional form checkboxes for each additional rule/
    sessionStorage.formCreator = sessionStorage.formCreator + "<input type=checkbox id=check" + i + ">" + i + "</input>"
  }
  // sessionStorage.formCreator = sessionStorage.formCreator + "<input type=button id=formSubmit onclick=window.hello=function(){document.getElementById(&quot;form1&quot).style.display=&quot;none&quot;;};hello()>Submit</input>";
  // adding submit button to form
  sessionStorage.formCreator = sessionStorage.formCreator + "<input type=button id=formSubmit>Submit</input>";
  // storing checked rules for each form on each edge
  sessionStorage.priorityForm = "<input type=checkbox id=check1>1</input>";
  sessionStorage.priorityCountString = "";
  sessionStorage.checkCountString = "";
  sessionStorage.numberofedges = Edges.find({'userId': Meteor.userId(), 'campaign': sessionStorage.campaignName}).fetch().length;
});

Template.workflow.helpers({ 
  errorMessage: function(field) {
    return Session.get('nodeSubmitErrors')[field]; 
  },
  errorClass: function (field) {
    return !!Session.get('nodeSubmitErrors')[field] ? 'has-error' : '';
  }
});

Template.workflow.onRendered(function(){
  $.getScript("http://d3js.org/d3.v3.js", function(){
    console.log("Script 1 loaded");
  }),
  $.getScript("http://cdn.jsdelivr.net/filesaver.js/0.1/FileSaver.min.js", function(){
    console.log("Script 2 loaded");
  })

  document.onload = (function(d3, saveAs, Blob, undefined){
    "use strict";
    // variable to check if node was successfully inserted in node collection
    var nodeInsertSuccess=false;
    // define graphcreator object
    var GraphCreator = function(svg, nodes, edges){
      var thisGraph = this;
          thisGraph.idct = 0;
      
      thisGraph.nodes = nodes || [];
      thisGraph.edges = edges || [];
      
      thisGraph.state = {
        selectedNode: null,
        selectedEdge: null,
        mouseDownNode: null,
        mouseDownLink: null,
        justDragged: false,
        justScaleTransGraph: false,
        lastKeyDown: -1,
        shiftNodeDrag: false,
        selectedText: null
      };

      // define arrow markers for graph links
      var defs = svg.append('svg:defs');
      defs.append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', "32")
        .attr('markerWidth', 3.5)
        .attr('markerHeight', 3.5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');

      // define arrow markers for leading arrow
      defs.append('svg:marker')
        .attr('id', 'mark-end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 7)
        .attr('markerWidth', 3.5)
        .attr('markerHeight', 3.5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');

      thisGraph.svg = svg;
      thisGraph.svgG = svg.append("g")
            .classed(thisGraph.consts.graphClass, true);
      var svgG = thisGraph.svgG;

      // displayed when dragging between nodes
      thisGraph.dragLine = svgG.append('svg:path')
            .attr('class', 'link dragline hidden')
            .attr('d', 'M0,0L0,0')
            .style('marker-end', 'url(#mark-end-arrow)');

      // svg nodes and edges and edge labels
      thisGraph.paths = svgG.append("g").selectAll("g");
      thisGraph.circles = svgG.append("g").selectAll("g");
      thisGraph.texts = svgG.append("g").selectAll("g");
      thisGraph.priorityTexts = svgG.append("g").selectAll("g");

      thisGraph.drag = d3.behavior.drag()
            .origin(function(d){
              return {x: d.x, y: d.y};
            })
            .on("drag", function(args){
              thisGraph.state.justDragged = true;
              thisGraph.dragmove.call(thisGraph, args);
            })
            .on("dragend", function() {
              // todo check if edge-mode is selected
            });

      // listen for key events
      d3.select(window).on("keydown", function(){
        thisGraph.svgKeyDown.call(thisGraph);
      })
      .on("keyup", function(){
        thisGraph.svgKeyUp.call(thisGraph);
      });
      svg.on("mousedown", function(d){thisGraph.svgMouseDown.call(thisGraph, d);});
      svg.on("mouseup", function(d){thisGraph.svgMouseUp.call(thisGraph, d);});

      // used for graph resizing on scrolling, but removed to implement scrollbar

      // listen for dragging
      var dragSvg = d3.behavior.zoom()
            .on("zoom", function(){
              if (d3.event.sourceEvent.shiftKey){
                // TODO  the internal d3 state is still changing
                return false;
              } else{
                thisGraph.zoomed.call(thisGraph);
              }
              return true;
            })
            .on("zoomstart", function(){
              var ael = d3.select("#" + thisGraph.consts.activeEditId).node();
              if (ael){
                ael.blur();
              }
              if (!d3.event.sourceEvent.shiftKey) d3.select('body').style("cursor", "move");
            })
            .on("zoomend", function(){
              d3.select('body').style("cursor", "auto");
            });
      
      svg.call(dragSvg).on("dblclick.zoom", null);

      // listen for resize
      window.onresize = function(){thisGraph.updateWindow(svg);};

      // handle download data
      d3.select("#save-input").on("click", function(){
        var saveEdges = [];
        thisGraph.edges.forEach(function(val, i){
          // storing each edge's source node id, target node id, and edge id
          saveEdges.push({source: val.source.id, target: val.target.id, id: val.id});
        });
        // converting current graph state into JSON string and storing it as a blob
        var blob = new Blob([window.JSON.stringify({"nodes": thisGraph.nodes, "edges": saveEdges})], {type: "text/plain;charset=utf-8"});
        // creating FS File object with  blob info
        var blobObj = new FS.File(blob);
        // storing graph state in secBlob property of FS File object
        blobObj.secBlob = window.JSON.stringify({"nodes": thisGraph.nodes, "edges": saveEdges});    
        blobObj.creatorId = Meteor.userId();
        var currentCampaignName = sessionStorage.campaignName;
        blobObj.campaignId = currentCampaignName;
        // checking for existing workflows for current user's current campaign
        if(Workflows.find({'campaignId': currentCampaignName, 'creatorId': Meteor.userId()}).fetch().length!==0){  
          if(confirm("There already exists a workflow for this campaign. Are you sure you want to save these changes?")) {
            // replacing old workflow with the new one if edge priorities make sense
            var priorityRedundancyCheck = false;
            var priorityOrderingCheck = false;
            var ruleCheck = false;            
            var adCheck = false;
            // stores number of ads in existence in current campaign
            var numberOfAds = Uploads.find({'campaignId': sessionStorage.campaignName, 'creatorId': Meteor.userId()}).fetch().length;
            var length = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved",'deleted':false}).fetch().length;
            console.log(length);
            for( var x = 0; x < length; x++){
              console.log(length);
              var noded3id = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved",'deleted':false}).fetch()[x].d3id;
              // stores node title
              var adTitle = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(),'deleted':false}).fetch()[x].title;
              // to check if node has a valid title, i.e there does exist an add with that node title
              var adPresenceCounter = 0;              
              // checks if any ads in uploads collection has same name as node title
              for(var i = 0; i < numberOfAds; i++){
                if(adTitle==(Uploads.find({'campaignId': sessionStorage.campaignName, 'creatorId': Meteor.userId()}).fetch()[i].original.name)){
                  adPresenceCounter++;
                }
              }
              console.log(adPresenceCounter);
              if(adPresenceCounter==0){
                adCheck = true;
              }
              var edgesLength = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id,'deleted':false}).fetch().length;
              // priorityCheck = false;
              // counter to check for incorrect ordering of edges
              var edgeOrderingCount = 0;
              // tracks index of array containing all edge priorities
              var edgePriorityArrayIndex = 0;
              // array to store list of edge priorities
              var edgePriorityArray = [];
              // tracks index of array containing all edge rule numbers
              var edgeRuleArrayIndex = 0;
              // array to store list of edge rule numbers
              var edgeRuleArray = [];
              for( var i = 0; i < edgesLength; i++){
                // var edgeOrderingCount = 0;
                // var edgePriorityArrayIndex = 0;
                // stores priority of first edge of node
                var temp = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id,'deleted':false}).fetch()[i].priority;
                // stores rules of first edge of node
                var ruleTemp = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id,'deleted':false}).fetch()[i].rules;                
                // converts string priority property of edge into integer priority value
                edgePriorityArray[edgePriorityArrayIndex] = parseInt(temp.substring(temp.length-2));
                // stores only numbers from string of rules for given edge
                var ruleNumbers = ruleTemp.match(/\d/g);
                console.log(ruleNumbers);
                // situation if the total number of rules on the edge is less than 10 i.e. not double digits
                for(var j = 0; j < Math.min(9, ruleNumbers.length); j++){
                  //edgeRuleArray[edgeRuleArrayIndex] = parseInt(ruleNumbers[0].substring(j,j+1));
                  // stores rule numbers on edge in array
                  edgeRuleArray[edgeRuleArrayIndex] = parseInt(ruleNumbers[j]);
                  edgeRuleArrayIndex++;
                }
                // situation when there are more than 9 but less than 100 rules on an edge i.e. double digit number of rules on an edge                
                if(ruleNumbers.length>9){
                 for(var j = 9; j < ruleNumbers.length-1; j++){
                    //edgeRuleArray[edgeRuleArrayIndex] = parseInt(ruleNumbers[0].substring(j,j+1));
                    // combines individual array elements of double digit rule numbers to form single rule number i.e. ["1","0"] and ["1","1"] to 10 and 11
                    edgeRuleArray[edgeRuleArrayIndex] = parseInt(ruleNumbers[j]+ruleNumbers[j+1]);
                    edgeRuleArrayIndex++;
                  } 
                }
                console.log(edgeRuleArray);
                // checks rule collection for existance of all rule numbers on the particular edge
                for(var j = 0;j < edgeRuleArrayIndex; j++){
                  // if rule number does not exist in rule collection
                  if(!Rules.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'ruleNo': edgeRuleArray[j]}).fetch()[0]){
                    ruleCheck = true;
                  }
                }
                // checks that the priority of that edge is different from all other edges on that node
                for( var j = i + 1; j < edgesLength; j++){
                  var newTemp = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id,'deleted':false}).fetch()[j].priority;
                  if(temp === newTemp){
                    console.log(temp);
                    console.log(Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id, 'deleted':false}).fetch()[j].priority);
                    priorityRedundancyCheck = true;
                  }
                  edgePriorityArrayIndex++;
                  // converts string priority property of edge into integer priority value
                  edgePriorityArray[edgePriorityArrayIndex] = parseInt(newTemp.substring(newTemp.length-2));

                  // var newRuleTemp = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id,'deleted':false}).fetch()[j].rules;
                  // if(ruleTemp === newRuleTemp){
                  //   console.log(ruleTemp);
                  //   console.log(Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id, 'deleted':false}).fetch()[j].rules);
                  //   throwError("There exists more than one edge with the same priority");
                  //   priorityCheck = true;
                  // }
                  // edgePriorityArrayIndex++;
                  // edgePriorityArray[edgePriorityArrayIndex] = parseInt(newTemp.substring(newTemp.length-2));
                }
              }
              console.log(edgePriorityArray);
              // checks if the edge priorities are appropriate for the number of edges
              for(var indexTracker = 1; indexTracker <= edgePriorityArrayIndex+1; indexTracker++){
                for(var k = 0; k<edgesLength;k++){
                  if(edgePriorityArray[k]==indexTracker){
                    edgeOrderingCount++;
                    console.log(edgeOrderingCount);
                  }
                }
              }
              if((edgeOrderingCount==0)&&(edgesLength!=0)){
                priorityOrderingCheck=true;
              }
            }
            if(priorityOrderingCheck==true){
              throwError("Priorities are not ordered correctly");
            }
            // throws error if non-existent rules are in workflow
            if(ruleCheck==true){
              throwError("There are non-existent rules in your workflow");
            }
            if(priorityRedundancyCheck==true){
              throwError("There exist multiple edges of a single node that have the same priority");
            }
            // throws error if non-existent nodes i.e. ads are in workflow
            if(adCheck==true){
              throwError("There are non-existent nodes (ads) in your workflow");
            }
            if((adCheck === false)&&(priorityRedundancyCheck === false)&&(priorityOrderingCheck === false)&&(ruleCheck === false)){
              Workflows.remove(Workflows.find({'campaignId': currentCampaignName, 'creatorId': Meteor.userId()}).fetch()[0]._id);
              Workflows.insert(blobObj, function(err) {
                if(err)
                console.log(err);
              });
              // situation when a completely new graph is created and old graph is not modified
              console.log(sessionStorage.resetWorkflowToLastSaveCounter);
              if(sessionStorage.resetWorkflowToLastSaveCounter==0){
                var length = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch().length;
                for( var i = 0; i < length; i++){
                  var nodeId = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch()[0]._id;
                  var noded3id = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch()[0].d3id;
                  var targetsLength = Nodes.find({'targets.d3id': noded3id}).fetch().length;
                  var sourcesLength = Nodes.find({'sources.d3id': noded3id}).fetch().length;
                  // removing previously saved node from targets list of other previously saved nodes
                  for(var i = 0; i < targetsLength; i++){
                    Nodes.update((Nodes.find({'targets.d3id': noded3id}).fetch()[0]._id), {$pull:{targets: {d3id: noded3id}}});
                  }
                  // removing previously saved node from sources list of other previously saved nodes
                  for(var i = 0; i < sourcesLength; i++){
                    Nodes.update((Nodes.find({'sources.d3id': noded3id}).fetch()[0]._id), {$pull:{sources: {d3id: noded3id}}});
                  }
                  // removing all previously saved nodes
                  Nodes.remove(nodeId);
                }
                // removing all previously saved edges
                length = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch().length;
                for( var i = 0; i < length; i++){
                  var edgeId = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch()[0]._id;
                  Edges.remove(edgeId);
                }
              }
              // situation when previously saved workflow is uploaded and modified
              // saving all unsaved nodes from current session
              var length = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch().length;
              for( var i = 0; i < length; i++){
                var id = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[0]._id;  
                Nodes.update(id, {$set:{'saved': "saved"}});
                console.log(i);
              }
              // saving all unsaved edges from current session
              length = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch().length;
              for( var i = 0; i < length; i++){
                var id = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[0]._id;
                var oldRule = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[0].rules;
                var oldPriority = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[0].priority;
                Edges.update(id, {$set:{'saved': "saved"}});
                Edges.update(id, {$set:{'oldRules': oldRule}});
                Edges.update(id, {$set:{'oldPriority': oldPriority}});
                console.log(i);
              }
              // changing oldPriorities of modified saved edges
              length = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch().length;
              for( var i = 0; i < length; i++){
                var id = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch()[i]._id;
                var oldRule = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch()[i].rules;
                var oldPriority = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch()[i].priority;                
                Edges.update(id, {$set:{'oldRules': oldRule}});
                Edges.update(id, {$set:{'oldPriority': oldPriority}});
                console.log(i);
              }
              // removing all deleted nodes from current session
              length = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'deleted': true}).fetch().length;
              for( var i = 0; i < length; i++){
                var nodeId = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'deleted': true}).fetch()[0]._id;
                var noded3id = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'deleted': true}).fetch()[0].d3id;
                var targetsLength = Nodes.find({'targets.d3id': noded3id}).fetch().length;
                var sourcesLength = Nodes.find({'sources.d3id': noded3id}).fetch().length;
                // removing deleted nodes from targets list of other previously saved nodes
                for(var i = 0; i < targetsLength; i++){
                  Nodes.update((Nodes.find({'targets.d3id': noded3id}).fetch()[0]._id), {$pull:{targets: {d3id: noded3id}}});
                }
                // removing deleted nodes from sources list of other previously saved nodes
                for(var i = 0; i < sourcesLength; i++){
                  Nodes.update((Nodes.find({'sources.d3id': noded3id}).fetch()[0]._id), {$pull:{sources: {d3id: noded3id}}});
                }
                // actually removing deleted nodes from node collection
                Nodes.remove(nodeId);
                // removing edges who's source nodes were deleted              
                var edgeSourceLength = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(),'sourced3id':noded3id}).fetch().length;
                for( var i = 0; i < edgeSourceLength; i++){
                  var id = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id}).fetch()[0]._id;
                  Edges.remove(id);
                }
                // removing edges who's target nodes were deleted
                var edgeTargetLength = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(),'targetd3id':noded3id}).fetch().length;
                for( var i = 0; i < edgeTargetLength; i++){
                  id = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'targetd3id': noded3id}).fetch()[0]._id;
                  Edges.remove(id);
                }
              }
              // removing all deleted edges from current session
              length = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'deleted': true}).fetch().length;
              for(var i = 0; i < length; i++){
                var id = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'deleted': true}).fetch()[0]._id;
                Edges.remove(id);
                console.log(i);
              }
              // situation when graph has been reset to last save, and then subsequently completely cleared, and then immediately saved
              if(thisGraph.nodes.length == 0 && thisGraph.edges.length == 0){
                // all nodes are removed
                length = Nodes.find({'userId': Meteor.userId(), 'campaign': sessionStorage.campaignName}).fetch().length;
                for(var i = 0; i < length; i++){
                  id = Nodes.find({'userId': Meteor.userId(), 'campaign': sessionStorage.campaignName}).fetch()[0]._id;
                  Nodes.remove(id);
                }
                // all edges are removed
                length = Edges.find({'userId': Meteor.userId(), 'campaign': sessionStorage.campaignName}).fetch().length;
                for(var i = 0; i < length; i++){
                  id = Edges.find({'userId': Meteor.userId(), 'campaign': sessionStorage.campaignName}).fetch()[0]._id;
                  Edges.remove(id);
                }
              }
            }
            else{
              length = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch().length;
              for( var i = 0; i < length; i++){
                var id = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch()[0]._id;
                var oldRule = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch()[0].oldRules;
                var oldPriority = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch()[0].oldPriority;
                Edges.update(id, {$set:{'rules': oldRule}});
                Edges.update(id, {$set:{'priority': oldPriority}});
                console.log(i);
              }
            }
            // // replacing old workflow with the new one if edge priorities make sense
            // var length = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch().length;
            // for( var i = 0; i < length; i++){
            //   var noded3id = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch()[0].d3id;
            //   var edgesLength = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id}).fetch().length;
            //   var priorityCheck = false;
            //   for( var i = 0; i < edgesLength; i++){
            //     var temp = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id}).fetch()[i].priority;
            //     for( var j = i + 1; j < edgesLength; j++){
            //       if(temp === Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id}).fetch()[j].priority){
            //         console.log(temp);
            //         console.log(Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id}).fetch()[j].priority);
            //         throwError("There exists more than one edge with the same priority");
            //         priorityCheck = true;
            //       }
            //     }
            //   }
            // }
            // if(priorityCheck == false){
            //   Workflows.remove(Workflows.find({'campaignId': currentCampaignName, 'creatorId': Meteor.userId()}).fetch()[0]._id);
            //   Workflows.insert(blobObj, function(err) {
            //     if(err)
            //     console.log(err);
            //   });
            // } 
          }
        }
        // situation when no previous workflow exists 
        else {
          // inserting the new workflow if priority check is successful
          var length = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(),'deleted':false}).fetch().length;
          var priorityRedundancyCheck = false;
          var priorityOrderingCheck = false;
          var ruleCheck = false;
          var adCheck = false;
          // stores number of ads in existence in current campaign
          var numberOfAds = Uploads.find({'campaignId': sessionStorage.campaignName, 'creatorId': Meteor.userId()}).fetch().length;
          for( var x = 0; x < length; x++){
            var noded3id = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(),'deleted':false}).fetch()[x].d3id;
            // stores node title
            var adTitle = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(),'deleted':false}).fetch()[x].title;
            // to check if node has a valid title, i.e there does exist an add with that node title
            var adPresenceCounter = 0;
            // checks if any ads in uploads collection has same name as node title
            for(var i = 0; i < numberOfAds; i++){              
              if(adTitle==(Uploads.find({'campaignId': sessionStorage.campaignName, 'creatorId': Meteor.userId()}).fetch()[i].original.name)){
                adPresenceCounter++;
              }
            }
            if(adPresenceCounter==0){
              adCheck = true;
            }
            var edgesLength = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id,'deleted':false}).fetch().length;
            // counter to check for incorrect ordering of edges
            var edgeOrderingCount = 0;
            // tracks index of array containing all edge priorities
            var edgePriorityArrayIndex = 0;
            // array to store list of edge priorities
            var edgePriorityArray = [];
            // tracks index of array containing all edge rule numbers
            var edgeRuleArrayIndex = 0;
            // array to store list of edge rule numbers
            var edgeRuleArray = [];
            for( var i = 0; i < edgesLength; i++){
              // var edgeOrderingCount = 0;
              // var edgePriorityArrayIndex = 0;
              // stores priority of first edge of node
              var temp = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id,'deleted':false}).fetch()[i].priority;
              // stores rules of first edge of node
              var ruleTemp = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id,'deleted':false}).fetch()[i].rules;
              // var edgePriorityArray = [];
              // converts string priority property of edge into integer priority value
              edgePriorityArray[edgePriorityArrayIndex] = parseInt(temp.substring(temp.length-2));
              // stores only numbers from string of rules for given edge
              var ruleNumbers = ruleTemp.match(/\d/g);
              console.log(ruleNumbers);
              // situation if the total number of rules on the edge is less than 10 i.e. not double digits
              for(var j = 0; j < Math.min(9, ruleNumbers.length); j++){
                //edgeRuleArray[edgeRuleArrayIndex] = parseInt(ruleNumbers[0].substring(j,j+1));
                // stores rule numbers on edge in array
                edgeRuleArray[edgeRuleArrayIndex] = parseInt(ruleNumbers[j]);
                edgeRuleArrayIndex++;
              }
              // situation when there are more than 9 but less than 100 rules on an edge i.e. double digit number of rules on an edge                
              if(ruleNumbers.length>9){
               for(var j = 9; j < ruleNumbers.length-1; j++){
                  //edgeRuleArray[edgeRuleArrayIndex] = parseInt(ruleNumbers[0].substring(j,j+1));
                  // combines individual array elements of double digit rule numbers to form single rule number i.e. ["1","0"] and ["1","1"] to 10 and 11
                  edgeRuleArray[edgeRuleArrayIndex] = parseInt(ruleNumbers[j]+ruleNumbers[j+1]);
                  edgeRuleArrayIndex++;
                } 
              }
              console.log(edgeRuleArray);
              // checks rule collection for existance of all rule numbers on the particular edge
              for(var j = 0;j < edgeRuleArrayIndex; j++){
                // if rule number does not exist in rule collection
                if(!Rules.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'ruleNo': edgeRuleArray[j]}).fetch()[0]){
                  ruleCheck = true;
                }
              }
              // checks that the priority of that edge is different from all other edges on that node
              for( var j = i + 1; j < edgesLength; j++){
                var newTemp = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id, 'deleted':false}).fetch()[j].priority
                if(temp === newTemp){
                  console.log(Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id, 'deleted': false}).fetch()[j].priority);
                  priorityRedundancyCheck = true;
                }
                edgePriorityArrayIndex++;
                // converts string priority property of edge into integer priority value
                edgePriorityArray[edgePriorityArrayIndex] = parseInt(newTemp.substring(newTemp.length-2));
              }
            }
            console.log(edgePriorityArray);
            // checks if the edge priorities are appropriate for the number of edges
            for(var indexTracker = 1; indexTracker <= edgePriorityArrayIndex+1; indexTracker++){
              for(var k = 0; k<edgesLength;k++){
                if(edgePriorityArray[k]==indexTracker){
                  edgeOrderingCount++;
                  console.log(edgeOrderingCount);
                }
              }
            }
            if((edgeOrderingCount==0)&&(edgesLength!=0)){
              priorityOrderingCheck=true;
            }
          }
          // var length = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId()}).fetch().length;
          // for( var i = 0; i < length; i++){
          //   var noded3id = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId()}).fetch()[0].d3id;
          //   var edgesLength = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id}).fetch().length;
          //   //var priorityCheck = false;
          //   for( var j = 0; j < edgesLength; j++){
          //     var temp = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id}).fetch()[j].priority;
          //     var indexOfPriority
          //     for( var k = j + 1; k < edgesLength; k++){
          //       if(temp === Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id}).fetch()[k].priority){
          //         console.log(temp);
          //         console.log(Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id}).fetch()[k].priority);
          //         throwError("There exists more than one edge with the same priority");
          //         priorityCheck = true;
          //       }
          //     }
          //   }
          // }  
          //
          if(priorityRedundancyCheck==true){
            throwError("There exist multiple edges of a single node that have the same priority");
          }
          if(priorityOrderingCheck==true){
              throwError("Priorities are not ordered correctly");
          }
          // throws error if non-existent rules are in workflow
          if(ruleCheck==true){
            throwError("There are non-existent rules in your workflow");
          }
          // throws error if non-existent nodes i.e. ads are in workflow
          if(adCheck==true){
            throwError("There are non-existent nodes (ads) in your workflow");
          }
          // when edges are ordered correctly
          if((adCheck === false)&&(priorityRedundancyCheck === false)&&(priorityOrderingCheck === false)&&(ruleCheck === false)){
            Workflows.insert(blobObj, function(err) {
              if(err)
              console.log(err);
            });
            // saving all unsaved nodes
            var length = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch().length;
            for( var i = 0; i < length; i++){
              var id = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[0]._id;  
              Nodes.update(id, {$set:{'saved': "saved"}});
            }
            // saving all unsaved edges and updating edge oldPriorities and oldRules current priorities and rules
            length = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch().length;
            for( var i = 0; i < length; i++){
              var id = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[0]._id;  
              var oldRule = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[0].rules;
              var oldPriority = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[0].priority;
              Edges.update(id, {$set:{'saved': "saved"}});
              Edges.update(id, {$set:{'oldRules': oldRule}});
              Edges.update(id, {$set:{'oldPriority': oldPriority}});
            }
          }
        } 
        // code below to download .json file of graph
        // saveAs(blob, "mydag.json");
      });

      // handle uploaded data
      d3.select("#reset-input").on("click", function(){
        // updates reset to last save button click counter
        sessionStorage.resetWorkflowToLastSaveCounter++;
        // code below uses file reader to read .json file uploaded by user and draws graph
      //   document.getElementById("hidden-file-upload").click();
      // });
      // d3.select("#hidden-file-upload").on("change", function(){
      //   if (window.File && window.FileReader && window.FileList && window.Blob) {
      //     console.log(this.files[0]);
      //     // var uploadFile = this.files[0];
      //     var uploadFile = Workflows.find({'_id':"2xdZ45oBHsm9bzEFd"}).fetch()[0].secBlob;
      //     console.log(Workflows.find({'_id':"2xdZ45oBHsm9bzEFd"}).fetch()[0].secBlob);
      //     // var uploadFile = Workflows.find({'_id':"ZA8kDBXZqoX3CdeKB"}).mainBlob;
      //     var filereader = new window.FileReader();
          
      //     filereader.onload = function(){
        // var currentCampaignName = CurrentCampaigns.find({'userId': Meteor.userId()}).fetch()[0].title;
        var currentCampaignName = sessionStorage.campaignName;
        // storing previous workflow graph state in txtRes variable
        var txtRes = Workflows.find({'campaignId': currentCampaignName, 'creatorId': Meteor.userId()}).fetch()[0].secBlob;
        // var txtRes = Workflows.find({'campaignId': campaignName, 'creatorId': Meteor.userId()}).fetch()[0].secBlob;
          // TODO better error handling
          try{
            // uses json parse to parse json file
            var jsonObj = JSON.parse(txtRes);
            // deletes current graph
            thisGraph.deleteGraph(true);
            // stores node info
            thisGraph.nodes = jsonObj.nodes;
            // stores edge rule label info
            thisGraph.texts = jsonObj.texts;
            // stores edge priority label info
            thisGraph.priorityTexts = jsonObj.priorityTexts;

            //stores edge info
            thisGraph.setIdCt(jsonObj.nodes.length + 1);
            var newEdges = jsonObj.edges;
            newEdges.forEach(function(e, i){
              // stores source node, target node, and edge id of each edge
              newEdges[i] = {source: thisGraph.nodes.filter(function(n){return n.id == e.source;})[0],
                            target: thisGraph.nodes.filter(function(n){return n.id == e.target;})[0],
                            id: e.id[0]};
            });
            thisGraph.edges = newEdges;
            thisGraph.texts = thisGraph.svgG.append("g").selectAll("g");
            thisGraph.priorityTexts = thisGraph.svgG.append("g").selectAll("g");
            thisGraph.updateGraph();
          }catch(err){
            console.log(err.message);
            window.alert("Error parsing uploaded file\nerror message: " + err.message);
            return;
          }
        //   };
        //   // filereader.readAsText(uploadFile);
        //   filereader.readAsText(uploadFile);
        //  } 
        //  else {
        //   alert("Your browser won't let you save this graph -- try upgrading your browser to IE 10+ or Chrome or Firefox.");
        // }
      });

      // handle delete graph
      d3.select("#delete-graph").on("click", function(){
        thisGraph.deleteGraph(false);
        //updates all nodes to deleted status
        var length = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId()}).fetch().length;
        for( var i = 0; i < length; i++){
          var id = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId()}).fetch()[i]._id;  
          Nodes.update(id, {$set:{'deleted': "true"}});
        }
        //updates all edges to deleted status
        var length = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId()}).fetch().length;
        for( var i = 0; i < length; i++){
          var id = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId()}).fetch()[i]._id;  
          Edges.update(id, {$set:{'deleted': "true"}});
        }
        console.log("delete");
      });
    };

    GraphCreator.prototype.setIdCt = function(idct){
      this.idct = idct;
    };

    GraphCreator.prototype.consts =  {
      selectedClass: "selected",
      connectClass: "connect-node",
      circleGClass: "conceptG",
      graphClass: "graph",
      activeEditId: "active-editing",
      BACKSPACE_KEY: 8,
      DELETE_KEY: 46,
      ENTER_KEY: 13,
      nodeRadius: 50
    };

    /* PROTOTYPE FUNCTIONS */

    GraphCreator.prototype.dragmove = function(d) {
      var thisGraph = this;
      if (thisGraph.state.shiftNodeDrag){
        thisGraph.dragLine.attr('d', 'M' + d.x + ',' + d.y + 'L' + d3.mouse(thisGraph.svgG.node())[0] + ',' + d3.mouse(this.svgG.node())[1]);
      } else{
        d.x += d3.event.dx;
        d.y +=  d3.event.dy;
        thisGraph.updateGraph();
      }
    };

    GraphCreator.prototype.deleteGraph = function(skipPrompt){
      var thisGraph = this,
          doDelete = true;
      if (!skipPrompt){
        doDelete = window.confirm("Press OK to delete this graph");
      }
      if(doDelete){
        thisGraph.nodes = [];
        thisGraph.edges = [];
        thisGraph.updateGraph();
        // removes all unsaved nodes when graph is deleted
        var length = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch().length;
        for( var i = 0; i < length; i++){
          Nodes.remove(Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[0]._id);
        }
        // removes all unsaved edges when graph is deleted
        length = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch().length;
        for( var i = 0; i < length; i++){
          Edges.remove(Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[0]._id);
        }  
      }
    };

    /* select all text in element: taken from http://stackoverflow.com/questions/6139107/programatically-select-text-in-a-contenteditable-html-element */
    GraphCreator.prototype.selectElementContents = function(el) {
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    };

    /* select all text in element: taken from http://stackoverflow.com/questions/6139107/programatically-select-text-in-a-contenteditable-html-element */
    GraphCreator.prototype.selectELementEdgeContents = function(el) {
      var range = document.createRange();
      range.selectEdgeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    };

    /* insert svg line breaks: taken from http://stackoverflow.com/questions/13241475/how-do-i-include-newlines-in-labels-in-d3-charts */
    GraphCreator.prototype.insertTitleLinebreaks = function (gEl, title) {
      var words = title.split(/\s+/g),
          nwords = words.length;
      var el = gEl.append("text")
            .attr("text-anchor","middle")
            .attr("dy", "-" + (nwords-1)*7.5);

      for (var i = 0; i < words.length; i++) {
        var tspan = el.append('tspan').text(words[i]);
        if (i > 0)
          tspan.attr('x', 0).attr('dy', '15');
      }
    };

    
    // remove edges associated with a node
    GraphCreator.prototype.spliceLinksForNode = function(node) {
      var thisGraph = this,
          toSplice = thisGraph.edges.filter(function(l) {
        return (l.source === node || l.target === node);
      });
      toSplice.map(function(l) {
        thisGraph.edges.splice(thisGraph.edges.indexOf(l), 1);
      });
    };

    GraphCreator.prototype.replaceSelectEdge = function(d3Path, edgeData){
      var thisGraph = this;
      d3Path.classed(thisGraph.consts.selectedClass, true);
      if (thisGraph.state.selectedEdge){
        thisGraph.removeSelectFromEdge();
      }
      thisGraph.state.selectedEdge = edgeData;
      // storing edge info in an array so that it can be accessed by the foreign object
      var selectedEdgeArray = [edgeData];
      // creating rule form when an edge is selected
      var newTexts = thisGraph.svg.selectAll("foreignObject")
          // .data(thisGraph.edges)
          .data(selectedEdgeArray)
          .enter()
          .append("foreignObject")
          .attr("x", function(d) {
            if (d.target.x > d.source.x) {
              return (d.source.x + (d.target.x - d.source.x)/2); }
            else {
              return (d.target.x + (d.source.x - d.target.x)/2); }
          })
          .attr("y", function(d) {
            if (d.target.y > d.source.y) {
              return (+ 30 + d.source.y + (d.target.y - d.source.y)/2); }
            else {
              return (+ 30 + d.target.y + (d.source.y - d.target.y)/2); }
          })
          .attr("height", 150)
          .attr("width", 200)
          .append("xhtml:form")
          .attr("id","form1")
          .attr("style","display:block")
          .html(sessionStorage.formCreator);

          // checking which rules have been checked for current edge when form submit button is clicked
          if(document.getElementById("formSubmit")!==null)
          document.getElementById("formSubmit").onclick = function(){
            sessionStorage.checkCountString = "";
            // counts number of checkboxes that have been checked
            var checkCount = $("input:checkbox:checked").length;
            // checks which rules have been checked and updates rules property of edge accordingly
            var ruleCount = Rules.find({'userId': Meteor.userId(), 'campaign':sessionStorage.campaignName}).fetch().length;
            for(var i = 1; i <= ruleCount; i++){
              if(checkCount == 1){
                if($('#check'+i).is(":checked"))
                sessionStorage.checkCountString = "Rule "+ i +" ";
              }
              else{
                if($('#check'+i).is(":checked"))
                sessionStorage.checkCountString = sessionStorage.checkCountString + "Rule " + i + " or ";               
                if(i == ruleCount)
                sessionStorage.checkCountString = sessionStorage.checkCountString.substring(0, sessionStorage.checkCountString.length - 4);              
              }
            }
            // stores checked rules in rules property of edge
            var tempId = Edges.find({'userId': Meteor.userId(), 'campaign': sessionStorage.campaignName, 'd3id': edgeData.id.toString()}).fetch()[0]._id;
            Edges.update(tempId, {$set:{'rules': sessionStorage.checkCountString}});
            
            thisGraph.updateGraph();
            // removes form from page
            document.getElementById("form1").style.display="none";
            d3.select("foreignObject").remove();
            
            // lists checkboxes for priority based on number of target nodes for a particular source node
            var priorityCounter = Nodes.find({'d3id': edgeData.source.id}).fetch()[0].targets.length;
            for(var i = 2; i <= priorityCounter; i++){
            // for(var i = 2; i <= sessionStorage.numberofedges; i++){
              sessionStorage.priorityForm = sessionStorage.priorityForm + "<input type=checkbox id=check" + i + ">" + i + "</input>" 
            }
            sessionStorage.priorityForm = sessionStorage.priorityForm + "<input type=button id=formSubmit2>Submit</input>";
            var newPriorities = thisGraph.svg.selectAll("foreignObject")
            // .data(thisGraph.edges)
            .data(selectedEdgeArray)
            .enter()
            .append("foreignObject")
            .attr("x", function(d) {
              if (d.target.x > d.source.x) {
                return (d.source.x + (d.target.x - d.source.x)/2); }
              else {
                return (d.target.x + (d.source.x - d.target.x)/2); }
            })
            .attr("y", function(d) {
              if (d.target.y > d.source.y) {
                return (+ 30 + d.source.y + (d.target.y - d.source.y)/2); }
              else {
                return (+ 30 + d.target.y + (d.source.y - d.target.y)/2); }
            })
            .attr("height", 150)
            .attr("width", 200)
            .append("xhtml:form")
            .attr("id","form2")
            .attr("style","display:block")
            .html(sessionStorage.priorityForm);
            if(document.getElementById("formSubmit2")!==null)
            document.getElementById("formSubmit2").onclick = function(){
              sessionStorage.priorityCountString = "";
              // counts number of checkboxes that have been checked
              var checkCount = $("input:checkbox:checked").length;
              // checks which rules have been checked and updates rules property of edge accordingly
              // var ruleCount = Rules.find({'userId': Meteor.userId(), 'campaign':sessionStorage.campaignName}).fetch().length;
              for(var i = 1; i <= sessionStorage.numberofedges; i++){
                if($('#check'+i).is(":checked"))
                sessionStorage.priorityCountString = "Priority: "+ i +" ";
              }
              // stores checked rules in rules property of edge
              var tempId = Edges.find({'userId': Meteor.userId(), 'campaign': sessionStorage.campaignName, 'd3id': edgeData.id.toString()}).fetch()[0]._id;
              var oldPriority = Edges.find({'userId': Meteor.userId(), 'campaign': sessionStorage.campaignName, 'd3id': edgeData.id.toString()}).fetch()[0].priority;
              Edges.update(tempId, {$set:{'priority': sessionStorage.priorityCountString}});
              
              thisGraph.updateGraph();
              // removes form from page
              document.getElementById("form2").style.display="none";
              d3.select("foreignObject").remove();
              sessionStorage.priorityForm = "<input type=checkbox id=check1>1</input>";
            };
          };
    };

    GraphCreator.prototype.replaceSelectNode = function(d3Node, nodeData){
      var thisGraph = this;
      d3Node.classed(this.consts.selectedClass, true);
      if (thisGraph.state.selectedNode){
        thisGraph.removeSelectFromNode();
      }
      thisGraph.state.selectedNode = nodeData;
    };
    
    GraphCreator.prototype.removeSelectFromNode = function(){
      var thisGraph = this;
      thisGraph.circles.filter(function(cd){
        return cd.id === thisGraph.state.selectedNode.id;
      }).classed(thisGraph.consts.selectedClass, false);
      thisGraph.state.selectedNode = null;
    };

    GraphCreator.prototype.removeSelectFromEdge = function(){
      var thisGraph = this;
      thisGraph.paths.filter(function(cd){
        return cd === thisGraph.state.selectedEdge;
      }).classed(thisGraph.consts.selectedClass, false);
      thisGraph.state.selectedEdge = null;
    };

    GraphCreator.prototype.pathMouseDown = function(d3path, d){
      var thisGraph = this,
          state = thisGraph.state;
      d3.event.stopPropagation();
      state.mouseDownLink = d;

      if (state.selectedNode){
        thisGraph.removeSelectFromNode();
      }
      
      var prevEdge = state.selectedEdge;  
      if (!prevEdge || prevEdge !== d){
        thisGraph.replaceSelectEdge(d3path, d);
      } else{
        thisGraph.removeSelectFromEdge();
      }
    };

    // mousedown on node
    GraphCreator.prototype.circleMouseDown = function(d3node, d){
      var thisGraph = this,
          state = thisGraph.state;
      d3.event.stopPropagation();
      state.mouseDownNode = d;
      if (d3.event.shiftKey){
        state.shiftNodeDrag = d3.event.shiftKey;
        // reposition dragged directed edge
        thisGraph.dragLine.classed('hidden', false)
          .attr('d', 'M' + d.x + ',' + d.y + 'L' + d.x + ',' + d.y);
        return;
      }
    };

    /* place editable text on node in place of svg text */
    GraphCreator.prototype.changeTextOfNode = function(d3node, d){
      var thisGraph= this,
          consts = thisGraph.consts,
          htmlEl = d3node.node();
      d3node.selectAll("text").remove();
      var nodeBCR = htmlEl.getBoundingClientRect(),
          curScale = nodeBCR.width/consts.nodeRadius,
          placePad  =  5*curScale,
          useHW = curScale > 1 ? nodeBCR.width*0.71 : consts.nodeRadius*1.42;
      // replace with editableconent text
      var d3txt = thisGraph.svg.selectAll("foreignObject")
            .data([d])
            .enter()
            .append("foreignObject")
            .attr("x", nodeBCR.left + placePad )
            .attr("y", nodeBCR.top + placePad)
            .attr("height", 2*useHW)
            .attr("width", useHW)
            .append("xhtml:p")
            .attr("id", consts.activeEditId)
            .attr("contentEditable", "true")
            .text(d.title)
            .on("mousedown", function(d){
              d3.event.stopPropagation();
            })
            .on("keydown", function(d){
              d3.event.stopPropagation();
              if (d3.event.keyCode == consts.ENTER_KEY && !d3.event.shiftKey){
                this.blur();
              }
            })
            .on("blur", function(d){
              // storing text in textbox as node title
              d.title = this.textContent;
              // thisGraph.insertTitleLinebreaks(d3node, d.title);
              // updating node id so as to not coincide with previously saved node ids
              while(Nodes.find({'d3id': d.id}).fetch().length!==0){
                d.id++;
              }
              // storing node property info
              var adInfo = { 
                title: d.title,
                campaign:sessionStorage.campaignName,
                saved: "notSaved",
                d3id: d.id,
                deleted: false,
                targets: [],
                sources: []
              };
              // checking if node title is actually an ad
              var errors = validateNode(adInfo); 
              if (errors.title){
                throwError('This ad does not exist for this campaign');
                return Session.set('nodeSubmitErrors', errors);
              }
              // inserting node into node collection
              Meteor.call('nodeInsert', adInfo, function(error, result) { // display the error to the user and abort
                if (error) {
                  nodeInsertSuccess=false;
                  // this.state.graphMouseDown = false;
                  return throwError(error.reason);
                }
                else{
                  nodeInsertSuccess=true;
                  thisGraph.insertTitleLinebreaks(d3node, d.title);
                  Session.set('nodeSubmitErrors', {});
                }
              });
              d3.select(this.parentElement).remove();
            });
      return d3txt;
    };

    // mouseup on nodes
    GraphCreator.prototype.circleMouseUp = function(d3node, d){
      var thisGraph = this,
          state = thisGraph.state,
          consts = thisGraph.consts;
      // reset the states
      state.shiftNodeDrag = false;    
      d3node.classed(consts.connectClass, false);
      
      var mouseDownNode = state.mouseDownNode;
      
      if (!mouseDownNode) return;

      thisGraph.dragLine.classed("hidden", true);

      if (mouseDownNode !== d){
        // when new edge is created
        // updating source list of target node with current source node
        // updating target list of source node with current target node
        var sourceId = Nodes.find({'d3id': mouseDownNode.id}).fetch()[0]._id;
        var targetId = Nodes.find({'d3id': d.id}).fetch()[0]._id;
        Nodes.update(sourceId, {$push:{targets: {d3id: d.id}}});
        Nodes.update(targetId, {$push:{sources: {d3id: mouseDownNode.id}}});
        
        // we're in a different node: create new edge for mousedown edge and add to graph
        // stores source node, target node, and edge id of edge    
        var newEdge = {source: mouseDownNode, target: d, id: sessionStorage.numberofedges};
        // storing edge info in an array so that it can be accessed by the foreign object
        var newEdgeArray = [newEdge];
        var filtRes = thisGraph.paths.filter(function(d){
          if (d.source === newEdge.target && d.target === newEdge.source){
            thisGraph.edges.splice(thisGraph.edges.indexOf(d), 1);
          }
          return d.source === newEdge.source && d.target === newEdge.target && d.id === newEdge.id;
        });
        if (!filtRes[0].length){
          thisGraph.edges.push(newEdge);
          // updating edge id so as to not coincide with previously saved edge ids
          // while(Edges.find({'d3id': newEdge.id}).fetch().length!==0){
          while(Edges.find({'userId': Meteor.userId(), 'campaign': sessionStorage.campaignName, 'd3id': newEdge.id}).fetch().length!==0){  
            newEdge.id++;
          }
          // converting id property of new edge to string because serves expects id in string format
          var newEdgeId = (newEdge.id).toString();
          // storing edge property info
          var edgeInfo = { 
            d3id: newEdgeId,        
            campaign:sessionStorage.campaignName,
            saved: "notSaved",
            deleted: false,
            oldRules: "",
            rules: "",
            oldPriority: "",
            priority: "",
            targetd3id: d.id,
            sourced3id: mouseDownNode.id
          };
          // inserting edge into collection
          Meteor.call('edgeInsert', edgeInfo, function(error, result) { // display the error to the user and abort
            if (error) {              
              return throwError(error.reason);
            }
          });
          // creating rule form when an edge is selected
          var newTexts = thisGraph.svg.selectAll("foreignObject")
          // .data(thisGraph.edges)
          .data(newEdgeArray)
          .enter()
          .append("foreignObject")
          .attr("x", function(d) {
            if (d.target.x > d.source.x) {
              return (d.source.x + (d.target.x - d.source.x)/2); }
            else {
              return (d.target.x + (d.source.x - d.target.x)/2); }
          })
          .attr("y", function(d) {
            if (d.target.y > d.source.y) {
              return (+ 30 + d.source.y + (d.target.y - d.source.y)/2); }
            else {
              return (+ 30 + d.target.y + (d.source.y - d.target.y)/2); }
          })
          .attr("height", 150)
          .attr("width", 200)
          .append("xhtml:form")
          .attr("id","form1")
          .attr("style","display:block")
          .html(sessionStorage.formCreator);

          // checking which rules have been checked for current edge when form submit button is clicked
          if(document.getElementById("formSubmit")!==null)
          document.getElementById("formSubmit").onclick = function(){
            sessionStorage.checkCountString = "";
            // counts number of checkboxes that have been checked
            var checkCount = $("input:checkbox:checked").length;
            // checks which rules have been checked and updates rules property of edge accordingly
            var ruleCount = Rules.find({'userId': Meteor.userId(), 'campaign':sessionStorage.campaignName}).fetch().length;
            for(var i = 1; i <= ruleCount; i++){
              if(checkCount == 1){
                if($('#check'+i).is(":checked"))
                sessionStorage.checkCountString = "Rule "+ i +" ";
              }
              else{
                if($('#check'+i).is(":checked"))
                sessionStorage.checkCountString = sessionStorage.checkCountString + "Rule " + i + " or ";               
                if(i == ruleCount)
                sessionStorage.checkCountString = sessionStorage.checkCountString.substring(0, sessionStorage.checkCountString.length - 4);              
              }
            }
            // stores checked rules in rules property of edge
            var tempId = Edges.find({'userId': Meteor.userId(), 'campaign': sessionStorage.campaignName, 'd3id': sessionStorage.numberofedges}).fetch()[0]._id;
            Edges.update(tempId, {$set:{'rules': sessionStorage.checkCountString}});
            
            thisGraph.updateGraph();

            // removes form from page
            document.getElementById("form1").style.display="none";
            d3.select("foreignObject").remove();
            // increments number of edges in current session
            sessionStorage.numberofedges++;

            // document.getElementById("form1").style.display="none";
            // d3.select("foreignObject").remove();

            // lists checkboxes for priority based on number of target nodes for a particular source node
            var priorityCounter = Nodes.find({'d3id': mouseDownNode.id}).fetch()[0].targets.length;
            for(var i = 2; i <= priorityCounter; i++){
            // for(var i = 2; i <= sessionStorage.numberofedges; i++){
              sessionStorage.priorityForm = sessionStorage.priorityForm + "<input type=checkbox id=check" + i + ">" + i + "</input>" 
            }
            sessionStorage.priorityForm = sessionStorage.priorityForm + "<input type=button id=formSubmit2>Submit</input>";
            var newPriorities = thisGraph.svg.selectAll("foreignObject")
            // .data(thisGraph.edges)
            .data(newEdgeArray)
            .enter()
            .append("foreignObject")
            .attr("x", function(d) {
              if (d.target.x > d.source.x) {
                return (d.source.x + (d.target.x - d.source.x)/2); }
              else {
                return (d.target.x + (d.source.x - d.target.x)/2); }
            })
            .attr("y", function(d) {
              if (d.target.y > d.source.y) {
                return (+ 30 + d.source.y + (d.target.y - d.source.y)/2); }
              else {
                return (+ 30 + d.target.y + (d.source.y - d.target.y)/2); }
            })
            .attr("height", 150)
            .attr("width", 200)
            .append("xhtml:form")
            .attr("id","form2")
            .attr("style","display:block")
            .html(sessionStorage.priorityForm);
            if(document.getElementById("formSubmit2")!==null)
            document.getElementById("formSubmit2").onclick = function(){
              sessionStorage.priorityCountString = "";
              // counts number of checkboxes that have been checked
              var checkCount = $("input:checkbox:checked").length;
              // checks which rules have been checked and updates rules property of edge accordingly
              // var ruleCount = Rules.find({'userId': Meteor.userId(), 'campaign':sessionStorage.campaignName}).fetch().length;
              for(var i = 1; i <= sessionStorage.numberofedges; i++){
                if($('#check'+i).is(":checked"))
                sessionStorage.priorityCountString = "Priority: "+ i +" ";
              }
              // temporarily decreases session storage value of number of edges so that d3id can be found using it
              sessionStorage.numberofedges--;
              // stores checked rules in rules property of edge
              var tempId = Edges.find({'userId': Meteor.userId(), 'campaign': sessionStorage.campaignName, 'd3id': sessionStorage.numberofedges}).fetch()[0]._id;
              Edges.update(tempId, {$set:{'priority': sessionStorage.priorityCountString}});
              
              thisGraph.updateGraph();
              // removes form from page
              document.getElementById("form2").style.display="none";
              d3.select("foreignObject").remove();
              // reincrements number of edges
              sessionStorage.numberofedges++;
              sessionStorage.priorityForm = "<input type=checkbox id=check1>1</input>";
            };
          };
          thisGraph.updateGraph();
        }
      } else{
        // we're in the same node
        if (state.justDragged) {
          // dragged, not clicked
          state.justDragged = false;
        } else{
          // clicked, not dragged
          if (d3.event.shiftKey){
            // shift-clicked node: edit text content
            var d3txt = thisGraph.changeTextOfNode(d3node, d);
            var txtNode = d3txt.node();
            thisGraph.selectElementContents(txtNode);
            txtNode.focus();
          } else{
            if (state.selectedEdge){
              thisGraph.removeSelectFromEdge();
            }
            var prevNode = state.selectedNode;            
            
            if (!prevNode || prevNode.id !== d.id){
              thisGraph.replaceSelectNode(d3node, d);
            } else{
              thisGraph.removeSelectFromNode();
            }
          }
        }
      }
      state.mouseDownNode = null;
      return;
      
    }; // end of circles mouseup

    // mousedown on main svg
    GraphCreator.prototype.svgMouseDown = function(){
      if(nodeInsertSuccess=false){
        this.state.graphMouseDown = false;
        d3.event.stopPropagation();
      }
      else  
      this.state.graphMouseDown = true;
    };

    // mouseup on main svg
    GraphCreator.prototype.svgMouseUp = function(){
      var thisGraph = this,
          state = thisGraph.state;
      if (state.justScaleTransGraph) {
        // dragged not clicked
        state.justScaleTransGraph = false;
      } else if (state.graphMouseDown && d3.event.shiftKey){
        // clicked not dragged from svg
        var xycoords = d3.mouse(thisGraph.svgG.node()),
            d = {id: thisGraph.idct++, title: "Enter Ad Name", x: xycoords[0], y: xycoords[1]};
        thisGraph.nodes.push(d);
        thisGraph.updateGraph();
        // make title of text immediently editable
        var d3txt = thisGraph.changeTextOfNode(thisGraph.circles.filter(function(dval){
          return dval.id === d.id;
        }), d),
            txtNode = d3txt.node();
        thisGraph.selectElementContents(txtNode);
        txtNode.focus();
      } else if (state.shiftNodeDrag){
        // dragged from node
        state.shiftNodeDrag = false;
        thisGraph.dragLine.classed("hidden", true);
      }
      state.graphMouseDown = false;
    };

    // keydown on main svg
    GraphCreator.prototype.svgKeyDown = function() {
      var thisGraph = this,
          state = thisGraph.state,
          consts = thisGraph.consts;
      // make sure repeated key presses don't register for each keydown
      if(state.lastKeyDown !== -1) return;

      state.lastKeyDown = d3.event.keyCode;
      var selectedNode = state.selectedNode,
          selectedEdge = state.selectedEdge;
      switch(d3.event.keyCode) {
      case consts.BACKSPACE_KEY:
      case consts.DELETE_KEY:
        d3.event.preventDefault();
        if (selectedNode){
          // if node is selected and subsequently deleted, removes foreign object text box to edit node title once node is deleted
          d3.select("foreignObject").remove();
          thisGraph.nodes.splice(thisGraph.nodes.indexOf(selectedNode), 1);
          thisGraph.spliceLinksForNode(selectedNode);
          state.selectedNode = null;
          thisGraph.updateGraph();
          // updates collection for saved nodes that have been deleted from current graph
          if(Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'd3id': selectedNode.id}).fetch()[0].saved==="saved"){
            var id = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'd3id': selectedNode.id}).fetch()[0]._id;  
            Nodes.update(id, {$set:{'deleted': true}});
            var edgeLength = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId()}).fetch().length;
            for( var i = 0; i < edgeLength; i++){
              // removes edges that have deleted node as a source node
              if(Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': selectedNode.id}).fetch().length!==0){
                var id = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': selectedNode.id}).fetch()[0]._id;
                Edges.update(id,{$set:{'deleted':true}});
              }
              // removes edges that have deleted node as a target node
              if(Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'targetd3id': selectedNode.id}).fetch().length!==0){
                var id = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'targetd3id': selectedNode.id}).fetch()[0]._id;
                Edges.update(id,{$set:{'deleted':true}});
              }
            }
          }
          else{
            // removes deleted node from collection
            Nodes.remove(Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'd3id': selectedNode.id}).fetch()[0]._id);
            var targetsLength = Nodes.find({'targets.d3id': selectedNode.id}).fetch().length;
            var sourcesLength = Nodes.find({'sources.d3id': selectedNode.id}).fetch().length;
            // removes deleted node from target lists of other nodes
            for(var i = 0; i < targetsLength; i++){
              Nodes.update((Nodes.find({'targets.d3id': selectedNode.id}).fetch()[0]._id), {$pull:{targets: {d3id: selectedNode.id}}});
            }
            // removes deleted node from source lists of other nodes
            for(var i = 0; i < sourcesLength; i++){
              Nodes.update((Nodes.find({'sources.d3id': selectedNode.id}).fetch()[0]._id), {$pull:{sources: {d3id: selectedNode.id}}});
            }
            var edgeLength = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId()}).fetch().length;
            for( var i = 0; i < edgeLength; i++){
              // removes edges that have deleted node as a source node
              if(Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': selectedNode.id}).fetch().length!==0){
                var id = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': selectedNode.id}).fetch()[0]._id;
                Edges.remove(id);
              }
              // removes edges that have deleted node as a target node
              if(Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'targetd3id': selectedNode.id}).fetch().length!==0){
                var id = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'targetd3id': selectedNode.id}).fetch()[0]._id;
                Edges.remove(id);
              }
            }
          }
        } else if (selectedEdge){
          // updates deleted property of edge when edge is deleted
          var id = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'd3id':selectedEdge.id}).fetch()[0]._id;
          Edges.update(id, {$set:{'deleted': true}});
          // removes rule form from page once selected edge is deleted
          d3.select("foreignObject").remove();
          thisGraph.edges.splice(thisGraph.edges.indexOf(selectedEdge), 1);
          state.selectedEdge = null;
          thisGraph.updateGraph();
        }
        break;
      }
    };

    GraphCreator.prototype.svgKeyUp = function() {
      this.state.lastKeyDown = -1;
    };

    // call to propagate changes to graph
    GraphCreator.prototype.updateGraph = function(){
      
      var thisGraph = this,
          consts = thisGraph.consts,
          state = thisGraph.state;
      
      thisGraph.paths = thisGraph.paths.data(thisGraph.edges, function(d){
        return String(d.source.id) + "+" + String(d.target.id);
      });
      var paths = thisGraph.paths;
      // update existing paths
      paths.style('marker-end', 'url(#end-arrow)')
        .classed(consts.selectedClass, function(d){
          return d === state.selectedEdge;
        })
        .attr("d", function(d){
          return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
        });

      // add new paths
      paths.enter()
        .append("path")
        .style('marker-end','url(#end-arrow)')
        .classed("link", true)
        .attr("d", function(d){
          return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
        })
        .on("mousedown", function(d){
          thisGraph.pathMouseDown.call(thisGraph, d3.select(this), d);
          }
        )
        .on("mouseup", function(d){
          state.mouseDownLink = null;
        })
        // stores edge id as an id attribute for each path
        .attr("id", function(d) {
          d.id;
        });

      // remove old links
      paths.exit().remove();

      // update existing nodes
      thisGraph.circles = thisGraph.circles.data(thisGraph.nodes, function(d){return d.id;});
      thisGraph.circles.attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";});

      // add new nodes
      var newGs= thisGraph.circles.enter()
            .append("g");
      newGs.classed(consts.circleGClass, true)
        .attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";})
        .on("mouseover", function(d){        
          if (state.shiftNodeDrag){
            d3.select(this).classed(consts.connectClass, true); 
          }
        })
        .on("mouseout", function(d){
          d3.select(this).classed(consts.connectClass, false);
        })
        .on("mousedown", function(d){
          thisGraph.circleMouseDown.call(thisGraph, d3.select(this), d);
        })
        .on("mouseup", function(d){
          thisGraph.circleMouseUp.call(thisGraph, d3.select(this), d);
        })
        .call(thisGraph.drag);

      newGs.append("circle")
        .attr("r", String(consts.nodeRadius));

      newGs.each(function(d){
        thisGraph.insertTitleLinebreaks(d3.select(this), d.title);
      });

      // remove old nodes
      thisGraph.circles.exit().remove();

      // edge labels
      // thisGraph.texts = thisGraph.svgG.append("g").selectAll("g");
      // data for labels comes from stored edges
      thisGraph.priorityTexts = thisGraph.priorityTexts.data(thisGraph.edges);
      var priorityTexts = thisGraph.priorityTexts;
      priorityTexts.append("text");
      
      //adding edge labels
      priorityTexts.enter()
        .append("text")
        .attr("contentEditable", "true")
        .attr("font-family", "Arial, Helvetica, sans-serif")
        .attr("fill", "Red")
        .style("font", "normal 20px Arial")
        .attr("x", function(d) {
        if (d.target.x > d.source.x) {
          return (d.source.x + (d.target.x - d.source.x)/2); }
        else {        
          return (d.target.x + (d.source.x - d.target.x)/2); }
        })
        .attr("y", function(d) {
        if (d.target.y > d.source.y) {
          return (+15 + d.source.y + (d.target.y - d.source.y)/2); }
        else {
          return (+15 + d.target.y + (d.source.y - d.target.y)/2); }
        })
        // .attr("dy", "0.35em")
        // .attr("stroke","white")
        // stores edge id info of edge to be labeled
        .attr("xlink:href", function(d) {
          d.id;
        })
        // .attr("text-anchor","start")
        // actual text for edge label is retrieved from rules property of that particular edge
        .text(function(d) {
          return Edges.find({'userId': Meteor.userId(), 'campaign': sessionStorage.campaignName, 'd3id': d.id.toString()}).fetch()[0].priority;
        });

      //updating existing edge labels      
      priorityTexts.attr("x", function(d) {
        if (d.target.x > d.source.x) {
          return (d.source.x + (d.target.x - d.source.x)/2); }
        else {
          return (d.target.x + (d.source.x - d.target.x)/2); }
        })
        .attr("y", function(d) {
        if (d.target.y > d.source.y) {
          return (+15 + d.source.y + (d.target.y - d.source.y)/2); }
        else {
          return (+15 + d.target.y + (d.source.y - d.target.y)/2); }
        })
        // .attr("dy", "0.35em")
        // .attr("text-anchor","start")
        // actual text for edge label is retrieved from rules property of that particular edge
        .text(function(d) {
          return Edges.find({'userId': Meteor.userId(), 'campaign': sessionStorage.campaignName, 'd3id': d.id.toString()}).fetch()[0].priority;
        });

      //removing old edge labels      
      priorityTexts.exit().remove();

      // edge labels
      // thisGraph.texts = thisGraph.svgG.append("g").selectAll("g");
      // data for labels comes from stored edges
      thisGraph.texts = thisGraph.texts.data(thisGraph.edges);
      var texts = thisGraph.texts;
      texts.append("text");
      
      //adding edge labels
      texts.enter()
        .append("text")
        .attr("contentEditable", "true")
        .attr("font-family", "Arial, Helvetica, sans-serif")
        .attr("fill", "Red")
        .style("font", "normal 20px Arial")
        .attr("x", function(d) {
        if (d.target.x > d.source.x) {
          return (d.source.x + (d.target.x - d.source.x)/2); }
        else {        
          return (d.target.x + (d.source.x - d.target.x)/2); }
        })
        .attr("y", function(d) {
        if (d.target.y > d.source.y) {
          return (-15 + d.source.y + (d.target.y - d.source.y)/2); }
        else {
          return (-15 + d.target.y + (d.source.y - d.target.y)/2); }
        })
        // .attr("dy", "0.35em")
        // .attr("stroke","white")
        // stores edge id info of edge to be labeled
        .attr("xlink:href", function(d) {
          d.id;
        })
        // .attr("text-anchor","start")
        // actual text for edge label is retrieved from rules property of that particular edge
        .text(function(d) {
          return Edges.find({'userId': Meteor.userId(), 'campaign': sessionStorage.campaignName, 'd3id': d.id.toString()}).fetch()[0].rules;
        });

      //updating existing edge labels      
      texts.attr("x", function(d) {
        if (d.target.x > d.source.x) {
          return (d.source.x + (d.target.x - d.source.x)/2); }
        else {
          return (d.target.x + (d.source.x - d.target.x)/2); }
        })
        .attr("y", function(d) {
        if (d.target.y > d.source.y) {
          return (-15 + d.source.y + (d.target.y - d.source.y)/2); }
        else {
          return (-15 + d.target.y + (d.source.y - d.target.y)/2); }
        })
        // .attr("dy", "0.35em")
        // .attr("text-anchor","start")
        // actual text for edge label is retrieved from rules property of that particular edge
        .text(function(d) {
          return Edges.find({'userId': Meteor.userId(), 'campaign': sessionStorage.campaignName, 'd3id': d.id.toString()}).fetch()[0].rules;
        });

      //removing old edge labels      
      texts.exit().remove();
    };

    GraphCreator.prototype.zoomed = function(){
      this.state.justScaleTransGraph = true;
      d3.select("." + this.consts.graphClass)
        .attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")"); 
    };

    GraphCreator.prototype.updateWindow = function(svg){
      var docEl = document.documentElement,
          bodyEl = document.getElementsByTagName('body')[0];
      var x = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth;
      var y = window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;
      svg.attr("width", x).attr("height", y);
    };


    
    /**** MAIN ****/

    // warn the user when leaving
    window.onbeforeunload = function(){
      return "Make sure to save your graph locally before leaving :-)";
    };      

    var docEl = document.documentElement,
        bodyEl = document.getElementsByTagName('body')[0];
    
    var width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth,
        height =  window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;

    var xLoc = width/2 - 25,
        yLoc = 100;

    // initial node data
    // var nodes = [{title: "new concept", id: 0, x: xLoc, y: yLoc},
    //              {title: "new concept", id: 1, x: xLoc, y: yLoc + 200}];
    // var edges = [{source: nodes[1], target: nodes[0]}];

    //sets initial nodes to 0
    var nodes = [];
    //sets initial edges to 0
    var edges = [];
    // binds svg to alignment div
    var svg = d3.select("#svg-aligner").append("svg")
          // sets width and height of svg canvas
          .attr("width", 1100)
          .attr("height", 2000);
    // draws svg boundary
    svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)      
      .attr("width", 1100)
      .attr("height", 2000)
      .style("stroke", 'black')
      .style("stroke-width", 1)
      .style("fill", "none");
    
    var graph = new GraphCreator(svg, nodes, edges);
        graph.setIdCt(0);
    graph.updateGraph();
    /** MAIN SVG **/
    // var svg = d3.select("body").append("svg")
    //       .attr("width", width)
    //       .attr("height", height);
    // var graph = new GraphCreator(svg, nodes, edges);
    //     graph.setIdCt(2);
    // graph.updateGraph();
  })(window.d3, window.saveAs, window.Blob);
  });

Template.workflow.events({
  'click .backToCampaignSetup': function(e) {
      e.preventDefault();
      Router.go('campaignSetup');      
  }
});

Template.workflow.onDestroyed(function(){
  // removes all unsaved nodes when navigating away from workflow page
  var length = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch().length;
  console.log(length);
  for( var i = 0; i < length; i++){
    var nodeId = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[0]._id;
    var noded3id = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[0].d3id;
    var targetsLength = Nodes.find({'targets.d3id': noded3id}).fetch().length;
    var sourcesLength = Nodes.find({'sources.d3id': noded3id}).fetch().length;
    // removes all unsaved nodes from target list of other nodes
    for(var j = 0; j < targetsLength; j++){
      Nodes.update((Nodes.find({'targets.d3id': noded3id}).fetch()[0]._id), {$pull:{targets: {d3id: noded3id}}}); 
    }
    // removes all unsaved nodes from source list of other nodes
    for(var j = 0; j < sourcesLength; j++){
      Nodes.update((Nodes.find({'sources.d3id': noded3id}).fetch()[0]._id), {$pull:{sources: {d3id: noded3id}}});
    }
    // actually removes unsaved node from node collection
    Nodes.remove(nodeId);
    var edgeLength = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId()}).fetch().length;
    for( var j = 0; j < edgeLength; j++){
      // removes edges that have unsaved node as a source node
      if(Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id}).fetch().length!==0){
        var id = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'sourced3id': noded3id}).fetch()[0]._id;
        Edges.remove(id);
      }
      if(Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'targetd3id': noded3id}).fetch().length!==0){
        // removes edges that have unsaved node as a target node
        var id = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'targetd3id': noded3id}).fetch()[0]._id;
        Edges.remove(id);
      }
    }
  }
  // removes unsaved edges
  length = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch().length;
  for( var i = 0; i < length; i++){
    var edgeId = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[0]._id;
    Edges.remove(edgeId);
  }
  // updates oldRules and oldPriorities of saved edges to current rules and priorities
  length = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch().length;
  for( var i = 0; i < length; i++){
    var id = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch()[i]._id;  
    var oldRule = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch()[i].oldRules;
    var oldPriority = Edges.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch()[i].oldPriority;
    Edges.update(id, {$set:{'rules': oldRule}});
    Edges.update(id, {$set:{'priority': oldPriority}});
  }
  // prompts workflow window to unload, preventing image from showing on other pages
  open(Router.current().route.path(), '_self').close();
});
Template.workflow.onCreated(function() { 
  Session.set('nodeSubmitErrors', {});
  sessionStorage.resetWorkflowToLastSaveCounter = 0;
  var ruleCount = Rules.find({'userId': Meteor.userId(), 'campaign':sessionStorage.campaignName}).fetch().length;
  if(ruleCount!==0)
  sessionStorage.formCreator = "<input type=checkbox id=check1>1</input>";
  for(var i = 2; i <= ruleCount; i++){
    sessionStorage.formCreator = sessionStorage.formCreator + "<input type=checkbox id=check" + i + ">" + i + "</input>"
  }
  // sessionStorage.formCreator = sessionStorage.formCreator + "<input type=button id=formSubmit onclick=window.hello=function(){document.getElementById(&quot;form1&quot).style.display=&quot;none&quot;;};hello()>Submit</input>";
  sessionStorage.formCreator = sessionStorage.formCreator + "<input type=button id=formSubmit>Submit</input>";
});
Template.workflow.helpers({ 
  errorMessage: function(field) {
    return Session.get('nodeSubmitErrors')[field]; 
  },
  errorClass: function (field) {
    return !!Session.get('nodeSubmitErrors')[field] ? 'has-error' : '';
  },
  sameCampaign:function() {
    return this.campaign === sessionStorage.campaignName;
  },
  rules:function() {
    return Rules.find()
  },
  ownRule:function() {
    return this.userId === Meteor.userId();
  },
  ruleNumber: function() {
    return this.ruleNo;
  }
});
Template.workflow.onRendered(function(){
  $.getScript("http://d3js.org/d3.v3.js", function(){
    console.log("Script 1 loaded");
  }),
  $.getScript("http://cdn.jsdelivr.net/filesaver.js/0.1/FileSaver.min.js", function(){
    console.log("Script 2 loaded");
  }),
  $.getScript(function newVisibility(){
    console.log("arvind");
  })
  // $.getScript("http://upload-icon.png", function(){
  //   console.log("Script 3 loaded");
  // }),
  // $.getScript("download-icon.png", function(){
  //   console.log("Script 4 loaded");
  // }),
  // $.getScript("trash-icon.png", function(){
  //   console.log("Script 5 loaded");
  // })
function newVisibility() {
        console.log("sup");
        // if(thisGraph.edges!==0)
        // document.getElementById("form1").style.display="none";
};
document.onload = (function(d3, saveAs, Blob, undefined){
  "use strict";
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

    // svg nodes and edges 
    thisGraph.paths = svgG.append("g").selectAll("g");
    thisGraph.circles = svgG.append("g").selectAll("g");
    thisGraph.texts = svgG.append("g").selectAll("g");

    // node labels
    
    thisGraph.linkText = svgG.append("g").selectAll("g")
    .data(thisGraph.edges)
    .append("text")
    .attr("font-family", "Arial, Helvetica, sans-serif")
    .attr("x", function(d) {
        if (d.target.x > d.source.x) {
            return (d.source.x + (d.target.x - d.source.x)/2); }
        else {
            return (d.target.x + (d.source.x - d.target.x)/2); }
    })
    .attr("y", function(d) {
        if (d.target.y > d.source.y) {
            return (d.source.y + (d.target.y - d.source.y)/2); }
        else {
            return (d.target.y + (d.source.y - d.target.y)/2); }
    })
    .attr("fill", "Black")
    .style("font", "normal 12px Arial")
    .attr("dy", ".35em")
    .text(function(d) { return "arvind"; });

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
        saveEdges.push({source: val.source.id, target: val.target.id});
      });
      var blob = new Blob([window.JSON.stringify({"nodes": thisGraph.nodes, "edges": saveEdges})], {type: "text/plain;charset=utf-8"});
      // console.log(blob);
      var blobObj = new FS.File(blob);
      // console.log(blobObj);
      // blobObj.mainBlob = blob;
      blobObj.secBlob = window.JSON.stringify({"nodes": thisGraph.nodes, "edges": saveEdges});
      // console.log(blobObj.mainBlob);
      // console.log(blobObj.secBlob);
      blobObj.creatorId = Meteor.userId();
      // var currentCampaignName = CurrentCampaigns.find({'userId': Meteor.userId()}).fetch()[0].title;
      var currentCampaignName = sessionStorage.campaignName;
      blobObj.campaignId = currentCampaignName;
      // blobObj.campaignId = campaignName;
      // if(Workflows.find({'campaignId': campaignName, 'creatorId': Meteor.userId()}).fetch().length!==0){
      if(Workflows.find({'campaignId': currentCampaignName, 'creatorId': Meteor.userId()}).fetch().length!==0){  
        if(confirm("There already exists a workflow for this campaign. Are you sure you want to save these changes?")) {
          // Workflows.remove(Workflows.find({'campaignId': campaignName, 'creatorId': Meteor.userId()}).fetch()[0]._id);
          if(sessionStorage.resetWorkflowToLastSaveCounter==0){
            var length = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch().length;
            for( var i = 0; i < length; i++){
              var nodeId = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch()[0]._id;
              var noded3id = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch()[0].d3id;
              var targetsLength = Nodes.find({'targets.d3id': noded3id}).fetch().length;
              var sourcesLength = Nodes.find({'sources.d3id': noded3id}).fetch().length;
              for(var i = 0; i < targetsLength; i++){
                Nodes.update((Nodes.find({'targets.d3id': noded3id}).fetch()[0]._id), {$pull:{targets: {d3id: noded3id}}});
              }
              for(var i = 0; i < sourcesLength; i++){
                Nodes.update((Nodes.find({'sources.d3id': noded3id}).fetch()[0]._id), {$pull:{sources: {d3id: noded3id}}});
              }
              Nodes.remove(nodeId);
            }
          }
          var length = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch().length;
          for( var i = 0; i < length; i++){
            var id = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[i]._id;  
            Nodes.update(id, {$set:{'saved': "saved"}});
            console.log(i);
          }
          length = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'deleted': true}).fetch().length;
          for( var i = 0; i < length; i++){
            var nodeId = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'deleted': true}).fetch()[0]._id;
            var noded3id = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'deleted': true}).fetch()[0].d3id;
            var targetsLength = Nodes.find({'targets.d3id': noded3id}).fetch().length;
            var sourcesLength = Nodes.find({'sources.d3id': noded3id}).fetch().length;
            for(var i = 0; i < targetsLength; i++){
              Nodes.update((Nodes.find({'targets.d3id': noded3id}).fetch()[0]._id), {$pull:{targets: {d3id: noded3id}}});
            }
            for(var i = 0; i < sourcesLength; i++){
              Nodes.update((Nodes.find({'sources.d3id': noded3id}).fetch()[0]._id), {$pull:{sources: {d3id: noded3id}}});
            }
            Nodes.remove(nodeId);  
          }
          Workflows.remove(Workflows.find({'campaignId': currentCampaignName, 'creatorId': Meteor.userId()}).fetch()[0]._id);
          Workflows.insert(blobObj, function(err) {
            if(err)
            console.log(err);
          }); 
        }
      } 
      else {
        Workflows.insert(blobObj, function(err) {
          if(err)
          console.log(err);
        });
        var length = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch().length;
        console.log(length);
        console.log(Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch());
        for( var i = 0; i < length; i++){
          var id = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[0]._id;  
          Nodes.update(id, {$set:{'saved': "saved"}});
          console.log(i);
        }
      } 
      // saveAs(blob, "mydag.json");
    });

//Upload previous workflow if it exists
// var numberofuploads = 1;
// if((Workflows.find({'campaignId': campaignName, 'creatorId': Meteor.userId()}).fetch().length!==0)&&(numberofuploads === 1)){
// var txtRes = Workflows.find({'campaignId': campaignName, 'creatorId': Meteor.userId()}).fetch()[0].secBlob;
//         // TODO better error handling
//         try{
//           var jsonObj = JSON.parse(txtRes);
//           thisGraph.deleteGraph(true);
//           thisGraph.nodes = jsonObj.nodes;
//           thisGraph.setIdCt(jsonObj.nodes.length + 1);
//           var newEdges = jsonObj.edges;
//           newEdges.forEach(function(e, i){
//             newEdges[i] = {source: thisGraph.nodes.filter(function(n){return n.id == e.source;})[0],
//                           target: thisGraph.nodes.filter(function(n){return n.id == e.target;})[0]};
//           });
//           thisGraph.edges = newEdges;
//           thisGraph.updateGraph();
//           // thisGraph = this;
//           numberofuploads++;
//           console.log(numberofuploads);
//         }catch(err){
//           window.alert("Error parsing uploaded file\nerror message: " + err.message);
//           return;
//         }
// }

    // handle uploaded data
    d3.select("#reset-input").on("click", function(){
      sessionStorage.resetWorkflowToLastSaveCounter++;
      console.log(sessionStorage.resetWorkflowToLastSaveCounter);
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
      var txtRes = Workflows.find({'campaignId': currentCampaignName, 'creatorId': Meteor.userId()}).fetch()[0].secBlob;
      // var txtRes = Workflows.find({'campaignId': campaignName, 'creatorId': Meteor.userId()}).fetch()[0].secBlob;
        // TODO better error handling
        try{
          var jsonObj = JSON.parse(txtRes);
          thisGraph.deleteGraph(true);
          thisGraph.nodes = jsonObj.nodes;
          thisGraph.setIdCt(jsonObj.nodes.length + 1);
          var newEdges = jsonObj.edges;
          newEdges.forEach(function(e, i){
            newEdges[i] = {source: thisGraph.nodes.filter(function(n){return n.id == e.source;})[0],
                          target: thisGraph.nodes.filter(function(n){return n.id == e.target;})[0]};
          });
          thisGraph.edges = newEdges;
          thisGraph.updateGraph();
        }catch(err){
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
      var length = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch().length;
        for( var i = 0; i < length; i++){
          Nodes.remove(Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[0]._id);
          console.log(i);
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
    document.getElementById("form1").style.display="inline";
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
            d.title = this.textContent;
            // thisGraph.insertTitleLinebreaks(d3node, d.title);
            while(Nodes.find({'d3id': d.id}).fetch().length!==0){
              d.id++;
            }
            var adInfo = { 
              title: d.title,
              // campaign: CurrentCampaigns.find({'userId': Meteor.userId()}).fetch()[0].title
              // campaign:campaignName
              campaign:sessionStorage.campaignName,
              saved: "notSaved",
              d3id: d.id,
              deleted: false,
              targets: [],
              sources: []
            };
            var errors = validateNode(adInfo); 
            if (errors.title){
              throwError('This ad does not exist for this campaign');
              return Session.set('nodeSubmitErrors', errors);
            }
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
            console.log(d.title);
            d3.select(this.parentElement).remove();
          });
    return d3txt;
  };

  //place editable text on edge instead of svg text
  // GraphCreator.prototype.changeTextOfEdge = function(d3path, d){
  //   var thisGraph= this,
  //       consts = thisGraph.consts,
  //       htmlEl = d3path.edge();
  //       d3path.selectAll("text").remove();
  //       var pathBCR = htmlEl.getBoundingClientRect(),
  //       curScale = pathBCR.width/consts.pathRadius,
  //       placePad  =  5*curScale,
  //       useHW = curScale > 1 ? pathBCR.width*0.71 : consts.pathRadius*1.42;
  //       // replace with editableconent text
  //       var d3txt = thisGraph.svg.selectAll("foreignObject") 
  //         .data([d])
  //         .enter()
  //         .append("foreignObject")
  //         .attr("x", pathBCR.left + placePad )
  //         .attr("y", pathBCR.top + placePad)
  //         .attr("height", 2*useHW)
  //         .attr("width", useHW)
  //         .append("xhtml:p")
  //         .attr("id", consts.activeEditId)
  //         .attr("contentEditable", "true")
  //         .text("arvind")
  //         .on("mousedown", function(edgeData){
  //           d3.event.stopPropagation();
  //         })
  //         .on("keydown", function(edgeData){
  //           d3.event.stopPropagation();
  //           if (d3.event.keyCode == consts.ENTER_KEY && !d3.event.shiftKey){
  //             this.blur();
  //           }
  //         })
  //         .on("blur", function(d){
  //           d.title = this.textContent;
            // thisGraph.insertTitleLinebreaks(d3node, d.title);
            // while(Nodes.find({'d3id': d.id}).fetch().length!==0){
            //   d.id++;
            //   console.log(d.id);
            // }
            // var adInfo = { 
            //   title: d.title,
              // campaign: CurrentCampaigns.find({'userId': Meteor.userId()}).fetch()[0].title
              // campaign:campaignName
            //   campaign:sessionStorage.campaignName,
            //   saved: "notSaved",
            //   d3id: d.id,
            //   deleted: false,
            //   targets: [],
            //   sources: []
            // };
            // var errors = validateNode(adInfo); 
            // if (errors.title){
            //   throwError('This ad does not exist for this campaign');
            //   return Session.set('nodeSubmitErrors', errors);
            // }
            // Meteor.call('nodeInsert', adInfo, function(error, result) { // display the error to the user and abort
            //   if (error) {
            //     nodeInsertSuccess=false;
            //     // this.state.graphMouseDown = false;
            //     return throwError(error.reason);
            //   }
            //   else{
            //     nodeInsertSuccess=true;
            //     thisGraph.insertTitleLinebreaks(d3node, d.title);
            //     Session.set('nodeSubmitErrors', {});
            //   }
            // });
  //           console.log(d.title);
  //           d3.select(this.parentElement).remove();
  //         });
  //   return d3txt;
  // };

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
      console.log(mouseDownNode.id)
      console.log(d.id);
      var sourceId = Nodes.find({'d3id': mouseDownNode.id}).fetch()[0]._id;
      var targetId = Nodes.find({'d3id': d.id}).fetch()[0]._id;
      // var targetsLengthOfSourceNode = Nodes.find({'d3id': mouseDownNode.id}).fetch()[0].targets.length;
      // var sourcesLengthOfTargetNode = Nodes.find({'d3id': d.id}).fetch()[0].sources.length;
      // console.log(targetsLengthOfSourceNode);
      // console.log(sourcesLengthOfTargetNode);
      // Nodes.update(sourceId, {$set:{'targets.targetsLengthOfSourceNode.d3id': d.id}});
      // Nodes.update(targetId, {$set:{'sources.sourcesLengthOfTargetNode.d3id': mouseDownNode.id}});
      // console.log(targetsLengthOfSourceNode);
      // console.log(sourcesLengthOfTargetNode);
      Nodes.update(sourceId, {$push:{targets: {d3id: d.id}}});
      Nodes.update(targetId, {$push:{sources: {d3id: mouseDownNode.id}}});
      // Nodes.update(targetId, {$push:{sources.d3id: mouseDownNode.id}});
      // we're in a different node: create new edge for mousedown edge and add to graph
      var newEdge = {source: mouseDownNode, target: d};
      var filtRes = thisGraph.paths.filter(function(d){
        if (d.source === newEdge.target && d.target === newEdge.source){
          thisGraph.edges.splice(thisGraph.edges.indexOf(d), 1);
        }
        return d.source === newEdge.source && d.target === newEdge.target;
      });
      if (!filtRes[0].length){
        thisGraph.edges.push(newEdge);
        thisGraph.updateGraph();
      //   var d3txt = thisGraph.changeTextOfEdge(thisGraph.edges.filter(function(dval){
      //   return dval.id === d.id;
      // }), d),
      //     txtEdge = d3txt.path();
      // thisGraph.selectElementEdgeContents(txtEdge);
      // txtEdge.focus();
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
        thisGraph.nodes.splice(thisGraph.nodes.indexOf(selectedNode), 1);
        thisGraph.spliceLinksForNode(selectedNode);
        state.selectedNode = null;
        thisGraph.updateGraph();
        if(Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'd3id': selectedNode.id}).fetch()[0].saved==="saved"){
          var id = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'd3id': selectedNode.id}).fetch()[0]._id;  
          Nodes.update(id, {$set:{'deleted': true}});
        }
        else{
          // if(Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'd3id': selectedNode.id}).fetch()[0].saved==="notSaved")  
          Nodes.remove(Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'd3id': selectedNode.id}).fetch()[0]._id);
          var targetsLength = Nodes.find({'targets.d3id': selectedNode.id}).fetch().length;
          var sourcesLength = Nodes.find({'sources.d3id': selectedNode.id}).fetch().length;
          for(var i = 0; i < targetsLength; i++){
            Nodes.update((Nodes.find({'targets.d3id': selectedNode.id}).fetch()[0]._id), {$pull:{targets: {d3id: selectedNode.id}}});
          }
          for(var i = 0; i < sourcesLength; i++){
            Nodes.update((Nodes.find({'sources.d3id': selectedNode.id}).fetch()[0]._id), {$pull:{sources: {d3id: selectedNode.id}}});
          }
        }
        // if(Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "saved"}).fetch().length === 0)
        // Workflows.remove(Workflows.find({'campaignId': sessionStorage.campaignName, 'creatorId': Meteor.userId()}).fetch()[0]._id);
        // console.log(selectedNode.id);
        // console.log("delete me");
      } else if (selectedEdge){
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
      .attr("id","path1");

      // paths.append("foreignObject")
      // .attr("x", 50)
      // .attr("y", 50)
      // .attr("height", 150)
      // .attr("width", 200)
      // .append("body")
      // .attr("xmln", "http://www.w3.org/1999/xhtml")
      // .append("form")
      // .append("input")
      // .attr("type", "text");

      thisGraph.texts = thisGraph.texts.data(thisGraph.edges);
      var texts = thisGraph.texts;
      texts.append("text");

      var newTexts = thisGraph.svg.selectAll("foreignObject")
      .data(thisGraph.edges)
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
      // .html("<input type=checkbox id=check1>ola</input><input type=checkbox name=check2>hi</input><input type=button onclick=newVisibility()></input>");
      // .html("<input type=checkbox id=check1>ola</input><input type=checkbox id=check2>hi</input><input type=button name=submit onclick=window.hello=function(){document.getElementById(&quot;form1&quot).style.display=&quot;none&quot;;console.log(&quot;arvind&quot;);};hello()>Submit</input>");
      .html(sessionStorage.formCreator);

      if(document.getElementById("formSubmit")!==null)
      document.getElementById("formSubmit").onclick = function(){
        thisGraph.updateGraph();
        document.getElementById("form1").style.display="none";
        d3.select(this.parentElement).remove();
      };

      function newVisibility() {
        console.log("sup");
        // if(thisGraph.edges!==0)
        // document.getElementById("form1").style.display="none";
      }
      // .html("<input type=checkbox id=check1>hi</input>")
      // .append("xhtml:p")
      // .html("<input type=checkbox id=check2>ola2</input>")
      // .append("xhtml:p")
      // .html("<input type=submit value=Submit>ola2</input>");
      // .html("<p>{{#each rules}} {{#if ownRule}} {{#if sameCampaign}} <form><input type=checkbox id=check>{{ruleNumber}}</input></form> {{/if}} {{/if}} {{/each}} </p>");

      var checkCountString ="";
      var checkCount = $("input:checkbox:checked").length;
      var ruleCount = Rules.find({'userId': Meteor.userId(), 'campaign':sessionStorage.campaignName}).fetch().length;
      for(var i = 1; i <= ruleCount; i++){
        if(checkCount == 1){
          if($('#check'+i).is(":checked"))
          checkCountString = "Rule "+ i +" ";
        }
        else{
          if($('#check'+i).is(":checked"))
          checkCountString = checkCountString + "Rule " + i + " or "; 
          if(i == ruleCount)
          checkCountString = checkCountString.substring(0, checkCountString.length - 4);
        }
      }
      console.log(checkCount);
      console.log($('#check1').is(":checked"));
      console.log($('#check2').is(":checked"));
      // .data(thisGraph.edges)
      // .attr("font-family", "Arial, Helvetica, sans-serif")
      // .attr("x", function(d) {
      //   if (d.target.x > d.source.x) {
      //       console.log(d.target.x);
      //       console.log(d.source.x);
      //       return (d.source.x + (d.target.x - d.source.x)/2); }
      //   else {
      //     console.log(d.target.x);
      //       console.log(d.source.x);
      //       return (d.target.x + (d.source.x - d.target.x)/2); }
      // })
      // .attr("y", function(d) {
      //   if (d.target.y > d.source.y) {
      //       return (d.source.y + (d.target.y - d.source.y)/2); }
      //   else {
      //       return (d.target.y + (d.source.y - d.target.y)/2); }
      // })
      // .attr("fill", "Black")
      // .style("font", "normal 12px Arial")
      // .attr("dy", ".35em")
      // .attr("x",200)
      // .attr("dy", "0.35em");
      // .attr("text-anchor","middle");
      
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
            .attr("xlink:href","#path1")
            .text(checkCountString);
            // .text(function(d) { return d.text })
            // .on("keyup", function(d) { d.text = d3.select(this).text(); });

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
            .text(checkCountString);

      texts.exit().remove();
    // paths.append("text")
    //   .attr("font-family", "Arial, Helvetica, sans-serif")
    //   .attr("x", function(d) {
    //     if (d.target.x > d.source.x) {
    //         return (d.source.x + (d.target.x - d.source.x)/2); }
    //     else {
    //         return (d.target.x + (d.source.x - d.target.x)/2); }
    //   })
    //   .attr("y", function(d) {
    //     if (d.target.y > d.source.y) {
    //         return (d.source.y + (d.target.y - d.source.y)/2); }
    //     else {
    //         return (d.target.y + (d.source.y - d.target.y)/2); }
    //   })
    //   .attr("fill", "Black")
    //   .style("font", "normal 12px Arial")
    //   .attr("dy", ".35em")
    //   .text(function(d) { return "arvind"; });

    // remove old links
    paths.exit().remove();
    
    // node labels
    
    thisGraph.linkText = thisGraph.linkText.data(thisGraph.edges, function(d){return d;});
    thisGraph.linkText.enter()
    .append("linkText")
    .data(thisGraph.edges)
    .append("text")
    .attr("font-family", "Arial, Helvetica, sans-serif")
    .attr("x", function(d) {
        if (d.target.x > d.source.x) {
            return (d.source.x + (d.target.x - d.source.x)/2); }
        else {
            return (d.target.x + (d.source.x - d.target.x)/2); }
    })
    .attr("y", function(d) {
        if (d.target.y > d.source.y) {
            return (d.source.y + (d.target.y - d.source.y)/2); }
        else {
            return (d.target.y + (d.source.y - d.target.y)/2); }
    })
    .attr("fill", "Black")
    .style("font", "normal 12px Arial")
    .attr("dy", ".35em")
    .text(function(d) { return "arvind"; });
  
    // thisGraph.linkText = thisGraph.linkText.data(thisGraph.edges, function(d){return d;});
    thisGraph.linkText.attr("transform", function(d){return "translate(" + (d.source.x + d.target.x) / 2 + "," + (d.source.y + d.target.y) / 2 + ")";});

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
  var nodes = [];
  var edges = [];
  var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);
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
      //prompts workflow window to unload, preventing image from showing on other pages, and routes to Campaign Setup
      // open('campaignSetup', '_self').close();
      Router.go('campaignSetup');      
  }
});
Template.workflow.onDestroyed(function(){
  var length = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch().length;
  for( var i = 0; i < length; i++){
    var nodeId = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[0]._id;
    var noded3id = Nodes.find({'campaign': sessionStorage.campaignName, 'userId': Meteor.userId(), 'saved': "notSaved"}).fetch()[0].d3id;
    var targetsLength = Nodes.find({'targets.d3id': noded3id}).fetch().length;
    var sourcesLength = Nodes.find({'sources.d3id': noded3id}).fetch().length;
    console.log(targetsLength);
    console.log(sourcesLength);
    for(var i = 0; i < targetsLength; i++){
      Nodes.update((Nodes.find({'targets.d3id': noded3id}).fetch()[0]._id), {$pull:{targets: {d3id: noded3id}}}); 
    }
    for(var i = 0; i < sourcesLength; i++){
      Nodes.update((Nodes.find({'sources.d3id': noded3id}).fetch()[0]._id), {$pull:{sources: {d3id: noded3id}}});
    }
    console.log(i);
    Nodes.remove(nodeId);
  }
  open(Router.current().route.path(), '_self').close();
});
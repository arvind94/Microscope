/**
 * WFNodeUtils JavaScript Library v1.0
 * http://sarveshspn.blogspot.in/2012/12/node-based-workflow-programming-in-html5.html
 * Copyright 2012, Sarvesh Navelkar
 * Licensed under the MIT license.
 * Date: Dec 12 2012
 *
 * Copyright (C) 2011 - 2012 by Sarvesh Navelkar
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
 
//The Global Object for namespacing our node objects
var WFNODEUTILS = {}

//A Node comprises a single unit or single block in the entire workflow
//Currently nodes have one or more endpoints which can be of type in or out (denoting an input
//or an output endpoint.Our Node objects would contain the display Kinetic.JS objects and each 
//of these Kinetic.JS objects will contain a back reference to it's container node object
//as events are raised by KineticJS on KineticJS objects
WFNODEUTILS.Node = function(x, y, fill) {
    this.endPoints = new Array();
    //RectX and RectY denote the upper left corner of the node
    this.rectX = x;
    this.rectY = y;
    this.rectWidth = 100;
    this.rectHeight = 50;
    this.rectFill = fill;
    this.rectStroke = 'black';
    this.rectStrokewidth = 4;
    this.kineticRect = null;
    this.group = new Kinetic.Group({
        draggable: true
    });
    this.group.wfNodeUtilsNode = this;

    //Code to draw a rectangle using HTML5 Canvas
    console.log("initing rectangular node");
    this.kineticRect = new Kinetic.Rect({
        x: this.rectX,
        y: this.rectY,
        width: this.rectWidth,
        height: this.rectHeight,
        fill: this.rectFill,
        stroke: this.rectStroke,
        strokeWidth: this.rectStrokewidth,
        });
    this.group.add(this.kineticRect);

    //Store a back reference to the container node in the property "wfNodeUtilsNode"
    this.kineticRect.wfNodeUtilsNode = this;

    //The input nodes are indexed from zero onwards
    var endpoint1 = new WFNODEUTILS.NodeEndPoint(this, 0, "in");
    this.addEndPoint(endpoint1);

    //The output nodes are indexed from zero onwards
    var endpoint2 = new WFNODEUTILS.NodeEndPoint(this, 0, "out");
    this.addEndPoint(endpoint2);
    var endpoint3 = new WFNODEUTILS.NodeEndPoint(this, 1, "out");
    this.addEndPoint(endpoint3);

}

//Adds an endpoint to the Node
WFNODEUTILS.Node.prototype.addEndPoint = function(pEndPoint) {
    this.endPoints.push(pEndPoint);
    this.group.add(pEndPoint.kineticRect);
}

//On Drag the Nodes and Endpoints rectX and rectY should be updated
//Note that all KineticJS properties are automatically updated but since rectX and rectY are custom properties
//these need to be updated seperately
WFNODEUTILS.Node.prototype.onDragUpdateNode = function() {
    this.rectX = this.kineticRect.getAbsolutePosition().x;
    this.rectY = this.kineticRect.getAbsolutePosition().y;

    for (var i = 0; i < this.endPoints.length; i++) {
        this.endPoints[i].rectX = this.endPoints[i].kineticRect.getAbsolutePosition().x;
        this.endPoints[i].rectY = this.endPoints[i].kineticRect.getAbsolutePosition().y;
    }
}

//Clone the node, this would be used when generating nodes using the node templates
WFNODEUTILS.Node.prototype.clone = function(x, y) {
    var clonedNode = new WFNODEUTILS.Node(x + 30, y + 30, this.rectFill);
    return clonedNode;
}

//Node EndPoint, a node endpoint serves as the point at which we would be connecting two nodes together.
//Two nodes are connected via their endpoints
WFNODEUTILS.NodeEndPoint = function(pParentContainerNode, index, endPointType) {
    this.node = pParentContainerNode;
    //Back reference to the node
    this.connector = null;
    //RectX and RectY denote the upper left corner of the node endpoint
    this.rectX = pParentContainerNode.rectX + pParentContainerNode.rectWidth;
    this.rectY = pParentContainerNode.rectY;
    this.rectWidth = 10;
    this.rectHeight = 10;

    if (endPointType == "in")
        this.rectFill = 'orange';
    else if (endPointType == "out")
        this.rectFill = 'green';

    this.rectStroke = 'black';
    this.rectStrokewidth = 2;

    //For multiple nodes we need to shift them from their default position by deltaX and deltaY based on the index
    if (endPointType == "out")
        this.deltaX = 0;
    else if (endPointType == "in")
        this.deltaX = -pParentContainerNode.rectWidth - this.rectWidth;

    this.deltaY = index * 15;
    this.index = index;

    //RectX and RectY denote the upper left corner of the node endpoint
    this.rectX = this.rectX + this.deltaX;
    this.rectY = this.rectY + this.deltaY;

    this.kineticRect = new Kinetic.Rect({
        x: this.rectX,
        y: this.rectY,
        width: this.rectWidth,
        height: this.rectHeight,
        fill: this.rectFill,
        stroke: this.rectStroke,
        strokeWidth: this.rectStrokewidth
    });

    this.kineticRect.WFNodeUtilsEndPoint = this;
}

//A Node Connector internally contains the endpoints which it connects together
WFNODEUTILS.NodeConnector = function() {
    this.endPoints = new Array();
    //Array of connected endpoints
    }

//Function to draw a bezier connector:WIP
WFNODEUTILS.NodeConnector.prototype.drawBezierConnector = function(node1, node2) {
    //Draw a bezier connector using the endpoints
    // var endpointA = node1.endPoints[0];
    // var endPointB = node2.endPoints[0];

}

//Draw a straight line connector connecting the two nodes
WFNODEUTILS.NodeLineConnector = function(endPoint1, endPoint2) {

    //Store the node endpoints in the connector
    this.endPoint1 = endPoint1;
    this.endPoint2 = endPoint2;

    //Calculating midpoint of endpoint on node1
    var endPoint1MidX = (endPoint1.rectX + endPoint1.rectX + endPoint1.rectWidth) / 2;
    var endPoint1MidY = (endPoint1.rectY + endPoint1.rectY + endPoint1.rectHeight) / 2;

    //Calculating midpoint of endpoint on node2
    var endPoint2MidX = (endPoint2.rectX + endPoint2.rectX + endPoint2.rectWidth) / 2;
    var endPoint2MidY = (endPoint2.rectY + endPoint2.rectY + endPoint2.rectHeight) / 2;

    //Draw a line connector using the endpoints
    this.line = new Kinetic.Line({
        points: [endPoint1MidX, endPoint1MidY, endPoint2MidX, endPoint2MidY],
        stroke: 'red',
        strokeWidth: 2,
        lineCap: 'butt',
        lineJoin: 'miter'
    });
}

//Update the connector's endpoints when the node is dragged.
//This function requires the updated rectX and rectY as obtained from onDragUpdateNode
WFNODEUTILS.NodeLineConnector.prototype.updateUsingNodesChangedPosition = function() {

    var endPoint1MidX = (this.endPoint1.rectX + this.endPoint1.rectX + this.endPoint1.rectWidth) / 2;
    var endPoint1MidY = (this.endPoint1.rectY + this.endPoint1.rectY + this.endPoint1.rectHeight) / 2;
    var endPoint2MidX = (this.endPoint2.rectX + this.endPoint2.rectX + this.endPoint2.rectWidth) / 2;
    var endPoint2MidY = (this.endPoint2.rectY + this.endPoint2.rectY + this.endPoint2.rectHeight) / 2;
    //Draw a bezier connector using the endpoints
    this.line.getPoints()[0].x = endPoint1MidX;
    this.line.getPoints()[0].y = endPoint1MidY;
    this.line.getPoints()[1].x = endPoint2MidX;
    this.line.getPoints()[1].y = endPoint2MidY;

}

//Node Template Type - WIP
WFNODEUTILS.NodeTemplateType = function(type) {
    this.type = "";
    this.XML = "";

    if (this.type == "type1") {
        this.type = "type1";
        //Type is based on the concerned domain
        this.XML = "<custom XML for the type1 goes here>";
        //Custom XML
        } else if (type == "type2") {
        this.type = "type2";
        this.XML = "<custom XML for the type2 goes here>";
        //Custom XML
        }

}

//Node Template Container, this container would contain the node templates, node templates are
//nodes which when clicked generate actual nodes which can be connected. The Node templates
//appear on the left hand side of the screen
WFNODEUTILS.NodeTemplateContainer = function() {
    this.nodeTemplates = new Array();

    //Code to add the various Node Types
    this.nodeTemplates.push(new NODEUTILS.NodeTemplateType("OpenCV1"));
    this.nodeTemplates.push(new NODEUTILS.NodeTemplateType("OpenCV2"));
}

//Add a node template to the container
WFNODEUTILS.NodeTemplateContainer.prototype.addNodeTemplate = function(type) {
    this.nodeTemplates.push(new NODEUTILS.NodeTemplateType(type));
}

//This contains the actual draggable nodes which can be connected and is also the parent top level
//container for the NodeTemplateContainer. Events and functionality is wired up based on which container 
//you add the nodes for example Nodes added to the Template Container are not draggable
WFNODEUTILS.NodeDisplayContainer = function() {
    console.log("Creating Node Display Container");
    this.stage = new Kinetic.Stage({
        container: 'container',
        width: 4 * 578,
        height: 4 * 200
    });

    this.layer = new Kinetic.Layer();
}

WFNODEUTILS.NodeDisplayContainer.prototype.addNode = function(WFNodeObject) {
    //We reassign the variables because this inside an ebent handler would refer to the context of that function rather than this one
    //and we need to use these variables inside the event handlers below
    var _self = this;
    var _stage = this.stage;
    console.log("Adding to Layer");
    //this.layer.add(WFNodeObject.kineticRect);
    this.layer.add(WFNodeObject.group);
    var _layer = this.layer;
    _self.dynamicTempLine = null;
    _self.kineticRectSrcForDynamicTempLine = null;

    //The below handles MouseDown on any of the Node Endpoints only
    this.mouseDownEventHandler = function(evt) {
        console.log('mouse click event handler fired inside Node Endpoint');
        var mousePos = _stage.getMousePosition();
        _self.dynamicTempLine = new Kinetic.Line({
            points: [this.WFNodeUtilsEndPoint.kineticRect.getAbsolutePosition().x, this.WFNodeUtilsEndPoint.kineticRect.getAbsolutePosition().y, mousePos.x, mousePos.y],
            stroke: 'red',
            strokeWidth: 2,
            lineCap: 'butt',
            lineJoin: 'miter'
        });
        console.log('line created');
        _layer.add(_self.dynamicTempLine);
        _layer.drawScene();
        //on Mouse move the line tip should follow the mouse
        //In the context of below function this would mean kineticRect as it is hooked up on mouse down
        _self.kineticRectSrcForDynamicTempLine = this;
        evt.cancelBubble = true;
    };

    for (var i = 0; i < WFNodeObject.endPoints.length; i++)
        WFNodeObject.endPoints[i].kineticRect.on('mousedown', this.mouseDownEventHandler);

    //The below handles Mouse Move on the stage for a dynamic temporary connector which is formed on connecting
    //from one node but not joining to the other
    this.mouseMoveEventHandler = function() {
        console.log('mouse move event handler fired on stage, readjusting line endpoint');
        var _mousePos = _stage.getMousePosition();
        if (_self.dynamicTempLine != null) {
            // _self.dynamicTempLine.getPoints()[0].x = WFNodeObject.endPoints[0].kineticRect.getPosition().x;
            //  _self.dynamicTempLine.getPoints()[0].y = WFNodeObject.endPoints[0].kineticRect.getPosition().y;
            _self.dynamicTempLine.getPoints()[1].x = _mousePos.x;
            _self.dynamicTempLine.getPoints()[1].y = _mousePos.y;
        }
        //_stage.add(_layer);
        _layer.drawScene();

    }

    _stage.getContainer().addEventListener('mousemove', this.mouseMoveEventHandler);

    //The below handles mouse up on an endpoint for finishing the connection between the two nodes
    this.mouseUpEventHandler = function(evt) {

        if (this != _self.kineticRectSrcForDynamicTempLine) {
            var connector = new WFNODEUTILS.NodeLineConnector(this.WFNodeUtilsEndPoint, _self.kineticRectSrcForDynamicTempLine.WFNodeUtilsEndPoint);
            _self.addConnector(connector);
            //Storing the reference so that when we drag the node the connector also gets dragged
            //The connector is stored in the endpoint rather than the node because a node may have mulitple endpoints each with it's own connector
            //We can establish a convention of having a one to one relationship between endpoints and connectors
            this.WFNodeUtilsEndPoint.connector = connector;
            _self.kineticRectSrcForDynamicTempLine.WFNodeUtilsEndPoint.connector = connector;
        }

        if (_self.dynamicTempLine != null) {
            _self.dynamicTempLine.remove();
        }
        _self.dynamicTempLine = null;
        //_stage.add(_layer);
        _layer.drawScene();

    }

    for (var i = 0; i < WFNodeObject.endPoints.length; i++)
        WFNodeObject.endPoints[i].kineticRect.on('mouseup', this.mouseUpEventHandler);

    //The below handles the drag motion of any of the nodes
    this.dragEventHandler = function(evt) {
        console.log('mouse drag event handler fired inside group');
        this.wfNodeUtilsNode.onDragUpdateNode();
        for (var i = 0; i < this.wfNodeUtilsNode.endPoints.length; i++) {
            if (this.wfNodeUtilsNode.endPoints[i].connector != null) {
                this.wfNodeUtilsNode.endPoints[i].connector.updateUsingNodesChangedPosition();
                _layer.drawScene();
            }
        }
    };

    //dragmove
    WFNodeObject.group.on('dragmove', this.dragEventHandler);

}

WFNODEUTILS.NodeDisplayContainer.prototype.addConnector = function(WFConnectorObject) {
    console.log("Adding Line to Layer");
    //this.layer.add(WFNodeObject.kineticRect);
    this.layer.add(WFConnectorObject.line);
}

//The order in which we add to layer and then add to stage matters hence we create the below function
WFNODEUTILS.NodeDisplayContainer.prototype.addLayerToStage = function() {
    console.log("Adding to Stage");
    this.stage.add(this.layer);
}

WFNODEUTILS.NodeDisplayContainer.prototype.removeDynamicTempShapes = function() {
    if (this.dynamicTempLine != null) {
        this.dynamicTempLine.remove();
        //this.layer.remove(this.dynamicTempLine);
        }

    this.dynamicTempLine = null;
    this.layer.drawScene();
}

WFNODEUTILS.NodeDisplayContainer.prototype.removeDynamicTempShapes = function() {
    if (this.dynamicTempLine != null) {
        this.dynamicTempLine.remove();
        //this.layer.remove(this.dynamicTempLine);
        }

    this.dynamicTempLine = null;
    this.layer.drawScene();
}

WFNODEUTILS.NodeDisplayContainer.prototype.addNodeTemplateContainer = function(WFNodeUtilsNodeTemplatesDisplayContainer) {

    //this.stage = this.stage
    WFNodeUtilsNodeTemplatesDisplayContainer.layer = this.layer;
    WFNodeUtilsNodeTemplatesDisplayContainer.nodeDisplayContainer = this;
    WFNodeUtilsNodeTemplatesDisplayContainer.stage = this.stage;

}

WFNODEUTILS.NodeTemplateDisplayContainer = function() {
}

//The Template Container contains a ist of nodes which can effectively be cloned
WFNODEUTILS.NodeTemplateDisplayContainer.prototype.addNodeTemplate = function(WFNodeObject) {
    var _layer = this.layer;
    var _nodeDisplayContainer = this.nodeDisplayContainer;
    var _stage = this.stage;

    this.mouseDownEventHandler = function(evt) {
        var node = this.wfNodeUtilsNode.clone(this.wfNodeUtilsNode.rectX + 50, this.wfNodeUtilsNode.rectY);
        node.group.setDraggable(true);
        _nodeDisplayContainer.addNode(node);
        _layer.drawScene();
        _stage.draw();
    }

    WFNodeObject.group.setDraggable(false);
    WFNodeObject.group.on('mousedown', this.mouseDownEventHandler);
    _layer.add(WFNodeObject.group);
    _layer.drawScene();

}
//Another Global Object for namespacing the main part of the code
var WFNODEDRAWINGAPP = {}

//The Main function which generates the various Nodes
WFNODEDRAWINGAPP.Main = function() {
    console.log("Calling Main Prototype init");
    //var nodes = new Array(); //List of nodes in the scene
    //var connectors = new Array(); //List of connectors in the scene
    this.nodeDisplayContainer = new WFNODEUTILS.NodeDisplayContainer();
    //Code to draw the Node Template Container
    this.nodeTemplateDisplayContainer = new WFNODEUTILS.NodeTemplateDisplayContainer();

    //Add the template container to the parent NodeDisplayCOntainer
    this.nodeDisplayContainer.addNodeTemplateContainer(this.nodeTemplateDisplayContainer);

    //Create all the template types here
    this.testnodetemplate1 = new WFNODEUTILS.Node(50, 75, 'green');
    this.testnodetemplate2 = new WFNODEUTILS.Node(50, 75 + 75, 'red');
    this.testnodetemplate3 = new WFNODEUTILS.Node(50, 75 + 150, 'yellow');
    this.nodeTemplateDisplayContainer.addNodeTemplate(this.testnodetemplate1);
    this.nodeTemplateDisplayContainer.addNodeTemplate(this.testnodetemplate2);
    this.nodeTemplateDisplayContainer.addNodeTemplate(this.testnodetemplate3);

    //Below is temporary code for testing of adding nodes
    //*******************************************************
    //var testnode1 = new WFNODEUTILS.Node(239,75);
    //var testnode2 = new WFNODEUTILS.Node(239+150,75+150);
    //var testnode3 = new WFNODEUTILS.Node(239+300,75+300);
    var testnode4 = new WFNODEUTILS.Node(239 + 600, 75 + 600, 'green');

    //this.nodeDisplayContainer.addNode(testnode1);
    //this.nodeDisplayContainer.addNode(testnode2);
    //this.nodeDisplayContainer.addNode(testnode3);
    this.nodeDisplayContainer.addNode(testnode4);
    //********************************************************
    console.log("Exiting Main Prototype init");
    //var connector = new WFNODEUTILS.NodeLineConnector(testnode1, testnode2);
    //nodeDisplayContainer.addConnector(connector);
    this.nodeDisplayContainer.addLayerToStage();
}
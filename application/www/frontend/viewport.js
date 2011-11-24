/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Viewport class.
 */

//class definition
function Viewport()
{
    if (arguments.length)
        this.constructor.apply(this, arguments);
}

Viewport.prototype = new DomNode;
Viewport.prototype.base = DomNode.prototype;

//members
Viewport.prototype.dom;
Viewport.prototype.dimensions;

Viewport.prototype.eventDispatcher;

Viewport.prototype.mousePosition;
Viewport.prototype.deltaPosition;
Viewport.prototype.mouseRotation;
Viewport.prototype.mouseDown = false;
Viewport.prototype.spaceDown = false;

Viewport.prototype.document;
Viewport.prototype.documentDimensions;
Viewport.prototype.maxZoomLevel;

Viewport.prototype.position;
Viewport.prototype.rotation      = 0;
Viewport.prototype.zoomLevel     = 0;
Viewport.prototype.zoomFactor    = 1;
Viewport.prototype.invZoomFactor = 1;

//constructor
Viewport.prototype.constructor = function(width, height, document)
{
    //set members
    this.document           = document;
    this.dimensions         = {width: width, height: height};
    this.eventDispatcher    = new EventDispatcher();
    this.documentDimensions = this.document.getDimensions();
    this.maxZoomLevel       = this.document.getMaxZoomLevel();
    this.position           = {
        x: -width  / 2 + this.documentDimensions.width  / 2,
        y: -height / 2 + this.documentDimensions.height / 2
    };
    
    //create dom
    this.base.constructor.call(this, '<div class="viewport"></div>');
    
    //initialize
    this.initialize();
}

/*
 * Public methods.
 */

//gets event dispatcher
Viewport.prototype.getEventDispatcher = function()
{
    return this.eventDispatcher;
}

//sets dimensions of viewer
Viewport.prototype.setDimensions = function(viewerWidth, viewerHeight)
{
    var deltaDimensions = {
        x: viewerWidth  - this.dimensions.width,
        y: viewerHeight - this.dimensions.height
    };
    
    
    //TODO: figure this out
    
    
    //var fraction = viewerWidth / this.dimensions.width;//Math.min(.., viewerHeight / this.dimensions.height);
    //var newZoomLevel = this.zoomLevel + Math.log(fraction) / Math.LN2;
    
    //var zoomPosition = {
    //    x: viewerWidth  / 2 - deltaDimensions.x / 2,
    //    y: viewerHeight / 2 - deltaDimensions.y / 2
    //};
    //var deltaZoomLevel 
    
    //this.zoom(newZoomLevel, zoomPosition);
    
    
    var newZoomLevel = this.zoomLevel + (//Math.min(
        Math.log(viewerWidth  / this.dimensions.width)//,
        //Math.log(viewerHeight / this.dimensions.height)
    ) / Math.LN2;
    
    // Round zoom level if no continuous zoom is supported.
    if (!this.document.supportsContinuousZoom())
    {
        newZoomLevel = Math.round(newZoomLevel);
    }
    
    this.dimensions = {width: viewerWidth, height: viewerHeight};
    
    this.dom.width(viewerWidth + "px");
    this.dom.height(viewerHeight + "px");
    
    this.update(undefined, newZoomLevel);
}

//gets visible area of document
Viewport.prototype.getVisibleArea = function()
{
    //calculate topleft and bottomright
    var topLeft     = this.position;
    var bottomRight = {
        x: topLeft.x + this.dimensions.width  * this.invZoomFactor,
        y: topLeft.y + this.dimensions.height * this.invZoomFactor
    };
    
    return rotateBoundingBox({topLeft: topLeft, bottomRight: bottomRight}, -this.rotation);
}

Viewport.prototype.getZoomLevel = function()
{
    return this.zoomLevel;
}

Viewport.prototype.getMaxZoomLevel = function()
{
    return this.maxZoomLevel;
}

//zooms in at a relative position to the viewport
Viewport.prototype.zoom = function(newZoomLevel, viewportPosition)
{
    //default to center position
    if (viewportPosition === undefined)
    {
        viewportPosition = {x: this.dimensions.width / 2, y: this.dimensions.height / 2};
    }
    
    //clamp zoom level before factor is calculated
    if (newZoomLevel < 0)
    {
        newZoomLevel = 0;
    }
    else if (newZoomLevel > this.maxZoomLevel)
    {
        newZoomLevel = this.maxZoomLevel;
    }
    
    // Round zoom level if no continuous zoom is supported.
    if (!this.document.supportsContinuousZoom())
    {
        newZoomLevel = Math.round(newZoomLevel);
    }
    
    //calculate new zoom factor
    var newInvZoomFactor = Math.pow(2, -newZoomLevel);
    
    //set factor of how much to subtract mouse position
    var factor = (this.zoomFactor * newInvZoomFactor - 1) * this.invZoomFactor;
    
    //calculate new topleft position
    var newPosition = {x: this.position.x - viewportPosition.x * factor, y: this.position.y - viewportPosition.y * factor};
    
    //update viewport
    this.update(newPosition, newZoomLevel);
}

Viewport.prototype.reset = function()
{
    this.rotation = 0;
    
    var newZoomLevel = Math.min(
        Math.log((this.dimensions.width  * 0.8) / this.documentDimensions.width),
        Math.log((this.dimensions.height * 0.8) / this.documentDimensions.height)
    ) / Math.LN2;
    
    this.zoom(newZoomLevel);
    this.zoom(newZoomLevel); // TODO: Most likely due to rounding errors, a second zoom operation is necessary for the correct result.
}

Viewport.prototype.setDocument = function(document)
{
    this.document.remove();
    
    this.document           = document;
    this.documentDimensions = document.getDimensions();
    this.maxZoomLevel       = document.getMaxZoomLevel();
    
    this.document.insert(this);
    this.reset();
}

/*
 * Private methods.
 */

Viewport.prototype.initialize = function()
{
    //set dimensions
    this.dom.width(this.dimensions.width + "px");
    this.dom.height(this.dimensions.height + "px");
    
    //append document to our dom
    this.document.insert(this);
    
    //initialize viewport
    this.reset();
    
    //set event listeners
    var _this = this;
    this.dom.bind('mousewheel',    function(event) { _this.scrollToZoom(event);  });
    this.dom.bind('mousedown',     function(event) { _this.startDragging(event); });
    $(document).bind('keydown',    function(event) { _this.handleKeyDown(event); });
    $(document).bind('keyup',      function(event) { _this.handleKeyUp(event);   });
    $(document).bind('mousemove',  function(event) { _this.doDragging(event);    });
    $(document).bind('mouseup',    function(event) { _this.stopDragging(event);  });
    
    //add mouse scroll event for firefox
    if (window.addEventListener)
        this.dom.get(0).addEventListener('DOMMouseScroll', function(event) { _this.scrollToZoom(event); }, false);
}

Viewport.prototype.update = function(newPosition, newZoomLevel, newRotation)
{
    //calculate position if not given
    if (newPosition === undefined)
        newPosition = this.position;
    
    //keep zoom level if not given
    if (newZoomLevel === undefined)
        newZoomLevel = this.zoomLevel;
    
    if (newRotation === undefined)
        newRotation = this.rotation;
    
    
    
    
    
    //TODO: move checking to Document, make it a common function for TextDocument and TilePyramidDocument.
    
    
    
    
    // Check zoom level.
    if (newZoomLevel < 0)
        newZoomLevel = 0;
    else if (newZoomLevel > this.maxZoomLevel)
        newZoomLevel = this.maxZoomLevel;
    
    //round new zoom level to one tens
    //newZoomLevel = Math.round(newZoomLevel * 10) / 10; //TODO: find a way around ceiling problem
    
    //calculate zoom factor
    var newZoomFactor   = Math.pow(2, newZoomLevel);
    var newInvZoomLevel = 1 / newZoomFactor;
    
    //do some bounds checking, and center document if smaller than viewport
    var scaledMargin = 20 * newInvZoomLevel; //TODO: make margin setting
    
    var topLeft     = {x: -scaledMargin, y: -scaledMargin};
    var bottomRight = {
        x: this.documentDimensions.width  + scaledMargin,
        y: this.documentDimensions.height + scaledMargin
    };
    
    var documentBox = rotateBoundingBox({topLeft: topLeft, bottomRight: bottomRight}, newRotation);
    
    var areaWidth  = (documentBox.bottomRight.x - documentBox.topLeft.x) * newZoomFactor;
    var areaHeight = (documentBox.bottomRight.y - documentBox.topLeft.y) * newZoomFactor;
    
    if (areaWidth < this.dimensions.width)
    {
        var centerOffset = {x: this.documentDimensions.width * 0.5, y: this.documentDimensions.height * 0.5};
        var rotatedCenterOffset = rotatePoint(centerOffset, newRotation);
        
        newPosition.x = rotatedCenterOffset.x - this.dimensions.width * 0.5 * newInvZoomLevel;
    }
    else if (newPosition.x < documentBox.topLeft.x)
        newPosition.x = documentBox.topLeft.x;
    else if (newPosition.x > (documentBox.bottomRight.x - this.dimensions.width * newInvZoomLevel))
        newPosition.x = documentBox.bottomRight.x - this.dimensions.width * newInvZoomLevel;
    
    if (areaHeight < this.dimensions.height)
    {
        var centerOffset = {x: this.documentDimensions.width * 0.5, y: this.documentDimensions.height * 0.5};
        var rotatedCenterOffset = rotatePoint(centerOffset, newRotation);
        
        newPosition.y = rotatedCenterOffset.y - this.dimensions.height * 0.5 * newInvZoomLevel;
    }
    else if (newPosition.y < documentBox.topLeft.y)
        newPosition.y = documentBox.topLeft.y;
    else if (newPosition.y > (documentBox.bottomRight.y - this.dimensions.height * newInvZoomLevel))
        newPosition.y = documentBox.bottomRight.y - this.dimensions.height * newInvZoomLevel;
    
    //set new zoom level and factors
    this.zoomLevel     = newZoomLevel;
    this.zoomFactor    = newZoomFactor;
    this.invZoomFactor = newInvZoomLevel;
    
    //set new position and rotation
    this.position = newPosition;
    this.rotation = newRotation;
    
    //get visible area
    this.visibleArea = this.getVisibleArea();
    
    //DEBUG: update document
    this.document.update(this.position, this.zoomLevel, this.rotation, this.visibleArea);
    
    //dispatch event
    this.eventDispatcher.trigger('change', this.position, this.zoomLevel, this.rotation, this.visibleArea);
    
    
    //DEBUG: show zoom and position
    //showStatusText("zoom: " + this.zoomLevel + ", x: " + this.position.x + ", y: " + this.position.y +
    //    ", rotation: " + this.rotation);
}

Viewport.prototype.startDragging = function(event)
{
    //start dragging
    this.mouseDown     = true;
    this.mousePosition = {x: event.pageX, y: event.pageY};
    
    //set delta position and mouse rotation
    this.deltaPosition = {x: 0, y: 0};
    this.mouseRotation = undefined;
    
    //TODO: show rotating cursor?
    
    //show grabbing cursor
    $(document.body).addClass("dragging");
    this.dom.addClass("dragging");
    
    return cancelEvent(event);
}

Viewport.prototype.doDragging = function(event)
{
    if (!this.mouseDown)
        return;
    
    //calculate delta and set new mouse position
    this.deltaPosition = {x: event.pageX - this.mousePosition.x, y: event.pageY - this.mousePosition.y};
    this.mousePosition = {x: event.pageX, y: event.pageY};
    
    //check for rotation
    var deltaRotation = 0;
    var newPosition;
    if (this.spaceDown && this.document.supportsRotation())
    {
        //get offset of viewport dom
        var domOffset = this.dom.offset();
        
        //calculate mouse position within viewport in document dimensions
        var mouseOffset = {
            x: (event.pageX - domOffset.left) * this.invZoomFactor,
            y: (event.pageY - domOffset.top) * this.invZoomFactor
        };
        
        //calculate center offset of viewport document dimensions
        var centerOffset = {
            x: this.dimensions.width  * 0.5 * this.invZoomFactor,
            y: this.dimensions.height * 0.5 * this.invZoomFactor
        };
        
        //calculate rotation of mouse
        var mouseRotation = Math.atan2(mouseOffset.y - centerOffset.y, mouseOffset.x - centerOffset.x);
        
        if (this.mouseRotation === undefined)
        {
            this.mouseRotation = mouseRotation;
        }
        else
        {
            //calculate delta rotation and store new one
            deltaRotation = mouseRotation - this.mouseRotation;
            this.mouseRotation = mouseRotation;
        }
        
        //calculate center position
        var centerPosition = {x: this.position.x + centerOffset.x, y: this.position.y + centerOffset.y};
        
        //rotate center position
        centerPosition = rotatePoint(centerPosition, deltaRotation);
        
        //set new position to topleft coordinates
        newPosition = {x: centerPosition.x - centerOffset.x, y: centerPosition.y - centerOffset.y};
    }
    else
    {
        //we lost track of mouse rotation
        this.mouseRotation = undefined;
        
        //calculate new position
        newPosition = {
            x: this.position.x - this.deltaPosition.x * this.invZoomFactor,
            y: this.position.y - this.deltaPosition.y * this.invZoomFactor
        };
    }
    
    //update viewport
    this.update(newPosition, undefined, this.rotation + deltaRotation);
}

Viewport.prototype.stopDragging = function(event)
{
    if (!this.mouseDown)
        return;
    
    //stop dragging
    this.mouseDown = false;
    
    //show normal cursor
    $(document.body).removeClass("dragging");
    this.dom.removeClass("dragging");
    
    //check for rotation
    if (this.spaceDown)
        return;
    
    //calculate new position
    var newPosition = {
        x: this.position.x - this.deltaPosition.x * 3 * this.invZoomFactor, //TODO: constant!
        y: this.position.y - this.deltaPosition.y * 3 * this.invZoomFactor
    };
    
    //animate easing out of scrolling
    var _this = this;
    
    $({percentage: 0}).animate(
        {percentage: 100},
        {
            duration: "fast",
            step: function(percentage)
            {
                //calculate fraction
                var fraction = Math.sqrt(percentage * 0.01);
                
                //linearly interpolate positions
                var stepPosition = {
                    x: fraction * newPosition.x + (1 - fraction) * _this.position.x,
                    y: fraction * newPosition.y + (1 - fraction) * _this.position.y
                };
                
                //update viewport
                _this.update(stepPosition);
            }
        }
    );
    
    return cancelEvent(event);
}

Viewport.prototype.scrollToZoom = function(event)
{
    //calculate scroll amount (0.75 is one normal step)
    var amount = event.detail ? event.detail * -1 : event.wheelDelta / 40;
    amount /= 0.75;
    
    // Zoom one level if no continuous zoom is supported.
    if (!this.document.supportsContinuousZoom())
    {
        amount = (amount < 0) ? -1 : 1;
    }
    else
    {
        amount *= 0.2;
    }
    
    //get new zoom level
    var newZoomLevel = this.zoomLevel + amount;
    
    //get offset of viewport dom
    var domOffset = this.dom.offset();
    
    //calculate mouse position within viewport
    var mousePosition = {
        x: event.pageX - domOffset.left,
        y: event.pageY - domOffset.top
    };
    
    //zoom in
    this.zoom(newZoomLevel, mousePosition);
    
    return cancelEvent(event);
}

//handles keydown events
Viewport.prototype.handleKeyDown = function(event)
{
    //check which key
    var keyCode = event.which || event.keyCode;
    
    switch (keyCode)
    {
        case 32: //space
            this.spaceDown = true;
            
            return;
            
        case 37: //left
            break;
            
        case 39: //right
            break;
            
        case 38: //up
            break;
            
        case 40: //down
            break;
        
        default:
            return;
    }
}

//handles keydown events
Viewport.prototype.handleKeyUp = function(event)
{
    //check which key
    var keyCode = event.which || event.keyCode;
    
    switch (keyCode)
    {
        case 32: //space
            this.spaceDown = false;
            
            return;
    }
}

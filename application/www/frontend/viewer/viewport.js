/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Viewport class.
 */

// Class definition.
function Viewport()
{
    if (arguments.length)
        this.constructor.apply(this, arguments);
}

Viewport.prototype = new DomNode;
Viewport.base = DomNode.prototype;

// Fields.
Viewport.prototype.dimensions;

Viewport.prototype.eventDispatcher;

Viewport.prototype.mousePosition;
Viewport.prototype.deltaPosition;
Viewport.prototype.mouseRotation;
Viewport.prototype.mouseDown = false;
Viewport.prototype.spaceDown = false;

Viewport.prototype.draggingDisabled = false;
Viewport.prototype.zoomingDisabled  = false;
Viewport.prototype.rotationDisabled = false;

Viewport.prototype.document;
Viewport.prototype.documentDimensions;
Viewport.prototype.maxZoomLevel;

Viewport.prototype.overlays;

Viewport.prototype.position;
Viewport.prototype.rotation      = 0;
Viewport.prototype.zoomLevel     = 0;
Viewport.prototype.zoomFactor    = 1;
Viewport.prototype.invZoomFactor = 1;
Viewport.prototype.visibleArea;

Viewport.prototype.animation;

// Constants.
Viewport.margin            = 20;
Viewport.scrollFactor      = 0.2;
Viewport.arrowMoveDistance = 40;
Viewport.dragEaseFactor    = 3;

// Constructor.
Viewport.prototype.constructor = function(width, height, document)
{
    // Set members.
    this.document           = document;
    this.overlays           = [];
    this.dimensions         = {width: width, height: height};
    this.eventDispatcher    = new EventDispatcher();
    this.documentDimensions = this.document.getDimensions();
    this.maxZoomLevel       = this.document.getMaxZoomLevel();
    this.position           = {
        x: -width  / 2 + this.documentDimensions.width  / 2,
        y: -height / 2 + this.documentDimensions.height / 2
    };
    
    // Create dom.
    Viewport.base.constructor.call(this, '<div class="viewport draggable"></div>');
    
    // Initialize.
    this.initialize();
}

/*
 * Public methods.
 */

// Gets event dispatcher.
Viewport.prototype.getEventDispatcher = function()
{
    return this.eventDispatcher;
}

// Disables (part of) the viewport.
Viewport.prototype.disable = function(dragging, zooming, rotation)
{
    if (dragging !== false)
    {
        this.draggingDisabled = true;
        
        this.dom.removeClass('draggable');
    }
    
    if (zooming !== false)
    {
        this.zoomingDisabled = true;
    }
    
    if (rotation !== false)
    {
        this.rotationDisabled = true;
    }
}

// Enables (part of) the viewport.
Viewport.prototype.enable = function(dragging, zooming, rotation)
{
    if (dragging !== false)
    {
        this.draggingDisabled = false;
        
        this.dom.addClass('draggable');
    }
    
    if (zooming !== false)
    {
        this.zoomingDisabled = false;
    }
    
    if (rotation !== false)
    {
        this.rotationDisabled = false;
    }
}

// Adds an overlay to the viewport.
Viewport.prototype.addOverlay = function(overlay)
{
    this.overlays.push(overlay);
    
    overlay.insert(this);
    overlay.update(this.position, this.zoomLevel, this.rotation, this.visibleArea);
}

// Removes an overlay from the viewport.
Viewport.prototype.removeOverlay = function(overlay)
{
    for (var i = this.overlays.length - 1; i >= 0; --i)
    {
        if (this.overlays[i] === overlay)
        {
            this.overlays[i].remove();
            this.overlays.splice(i, 1);
            
            return;
        }
    }
}

// Removes all overlays from the viewport.
Viewport.prototype.removeOverlays = function(overlay)
{
    // Remove all overlays.
    for (var i = this.overlays.length - 1; i >= 0; --i)
    {
        this.overlays[i].remove();
    }
    
    this.overlays = [];
}

// Sets dimensions of viewer.
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
    
    var docWidth = this.documentDimensions.width * this.zoomFactor / 0.8;
    var oldWidth = Math.max(this.dimensions.width, this.documentDimensions.width / 0.8);
    var newWidth = Math.max(viewerWidth, this.documentDimensions.width / 0.8);
    
    var newZoomLevel = this.zoomLevel;
    
    if ((newWidth < docWidth) || (oldWidth < newWidth))
    {
        newZoomLevel += Math.log(newWidth / oldWidth) / Math.LN2;
    }
    
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
    return this.visibleArea;
}

Viewport.prototype.getPosition = function()
{
    return this.position;
}

Viewport.prototype.getRotation = function()
{
    return this.rotation;
}

Viewport.prototype.getZoomLevel = function()
{
    return this.zoomLevel;
}

Viewport.prototype.getMaxZoomLevel = function()
{
    return this.maxZoomLevel;
}

// Zooms in at a relative position to the viewport.
Viewport.prototype.zoom = function(newZoomLevel, viewportPosition, animate)
{
    // Default to center position.
    if (viewportPosition === undefined)
    {
        viewportPosition = {x: this.dimensions.width * 0.5, y: this.dimensions.height * 0.5};
    }
    
    // Clamp zoom level before factor is calculated.
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
        
        animate = false;
    }
    
    // Calculate new zoom factor
    var newInvZoomFactor = Math.pow(2, -newZoomLevel);
    
    // Set factor of how much to subtract mouse position.
    //var factor = (this.zoomFactor * newInvZoomFactor - 1) * this.invZoomFactor;
    var factor = newInvZoomFactor - this.invZoomFactor;
    
    // Calculate new topleft position.
    var newPosition = {
        x: this.position.x - viewportPosition.x * factor,
        y: this.position.y - viewportPosition.y * factor
    };
    
    // Stop current animation.
    if (this.animation !== undefined)
    {
        this.animation.stop(true, true);
        this.animation = undefined;
    }
    
    // Check for animation.
    if (animate !== false)
    {
        // Animate zooming.
        var _this = this;
        
        var oldPosition      = this.position;
        var oldZoomLevel     = this.zoomLevel;
        var oldInvZoomFactor = this.invZoomFactor;
        
        this.animation = $({percentage: 0}).animate(
            {percentage: 100},
            {
                duration: 200,
                step: function(percentage)
                {
                    // Calculate fraction.
                    var fraction = Math.sqrt(percentage * 0.01);
                    
                    // Calculate new step zoom level.
                    var stepZoomLevel = newZoomLevel * fraction + oldZoomLevel * (1 - fraction);
                    
                    // Calculate new zoom factor.
                    var newInvZoomFactor = Math.pow(2, -stepZoomLevel);
                    
                    // Set factor of how much to subtract mouse position.
                    //var factor = (oldZoomFactor * newInvZoomFactor - 1) * oldInvZoomFactor;
                    var factor = newInvZoomFactor - oldInvZoomFactor;
                    
                    // Calculate new topleft position.
                    var stepPosition = {
                        x: oldPosition.x - viewportPosition.x * factor,
                        y: oldPosition.y - viewportPosition.y * factor
                    };
                    
                    // Update viewport.
                    _this.update(stepPosition, stepZoomLevel);
                }
            }
        );
    }
    else
    {
        // Update viewport.
        this.update(newPosition, newZoomLevel);
    }
}

// Zooms in at a relative position to the viewport.
Viewport.prototype.rotate = function(deltaRotation, viewportPosition, animate)
{
    // Check if rotation is supported.
    if (!this.document.supportsRotation())
    {
        return;
    }
    
    // Default to center position.
    if (viewportPosition === undefined)
    {
        viewportPosition = {x: this.dimensions.width * 0.5, y: this.dimensions.height * 0.5};
    }
    
    // Convert pixels to a document offset.
    var viewportOffset = {
        x: viewportPosition.x * this.invZoomFactor,
        y: viewportPosition.y * this.invZoomFactor
    };
    
    // Convert document offset to a document position.
    var documentPosition = {
        x: this.position.x + viewportOffset.x,
        y: this.position.y + viewportOffset.y
    };
    
    // Stop current animation.
    if (this.animation !== undefined)
    {
        this.animation.stop(true, true);
        this.animation = undefined;
    }
    
    // Check for animation.
    if (animate !== false)
    {
        // Animate rotating.
        var _this = this;
        
        var oldRotation = this.rotation;
        var newRotation = oldRotation + deltaRotation;
        
        this.animation = $({percentage: 0}).animate(
            {percentage: 100},
            {
                duration: 200,
                step: function(percentage)
                {
                    // Calculate fraction.
                    var fraction = Math.sqrt(percentage * 0.01);
                    
                    // Calculate new step rotation.
                    var stepRotation = newRotation * fraction + oldRotation * (1 - fraction);
                    
                    // Calculate delta rotation.
                    var deltaRotation = stepRotation - _this.rotation;
                    
                    // Rotate document position.
                    documentPosition = rotatePoint(documentPosition, deltaRotation);
                    
                    // Set new position of topleft coordinates.
                    var newPosition = {
                        x: documentPosition.x - viewportOffset.x,
                        y: documentPosition.y - viewportOffset.y
                    };
                    
                    // Update viewport.
                    _this.update(newPosition, undefined, stepRotation);
                }
            }
        );
    }
    else
    {
        // Rotate document position.
        documentPosition = rotatePoint(documentPosition, deltaRotation);
        
        // Set new position of topleft coordinates.
        var newPosition = {
            x: documentPosition.x - viewportOffset.x,
            y: documentPosition.y - viewportOffset.y};
        
        // Update viewport.
        this.update(newPosition, undefined, this.rotation + deltaRotation);
    }
}

// Moves the viewport a pixel amount.
Viewport.prototype.move = function(deltaPosition, animate)
{
    // Calculate new topleft position.
    var newPosition = {
        x: this.position.x + deltaPosition.x * this.invZoomFactor,
        y: this.position.y + deltaPosition.y * this.invZoomFactor
    };
    
    // Stop current animation.
    if (this.animation !== undefined)
    {
        this.animation.stop(true, true);
        this.animation = undefined;
    }
    
    // Check for animation.
    if (animate !== false)
    {
        // Animate moving.
        var currentPosition  = this.position;
        
        var _this = this;
        this.animation = $({percentage: 0}).animate(
            {percentage: 100},
            {
                duration: 200,
                step: function(percentage)
                {
                    // Calculate fraction.
                    var fraction = Math.sqrt(percentage * 0.01);
                    
                    // Linearly interpolate positions.
                    var stepPosition = {
                        x: fraction * newPosition.x + (1 - fraction) * currentPosition.x,
                        y: fraction * newPosition.y + (1 - fraction) * currentPosition.y
                    };
                    
                    // Update viewport.
                    _this.update(stepPosition);
                }
            }
        );
    }
    else
    {
        // Update viewport.
        this.update(newPosition);
    }
}

// Resets viewport.
Viewport.prototype.reset = function()
{
    this.rotation = 0;
    
    var newZoomLevel = Math.min(
        Math.log((this.dimensions.width  * 0.8) / this.documentDimensions.width),
        Math.log((this.dimensions.height * 0.8) / this.documentDimensions.height)
    ) / Math.LN2;
    
    this.zoom(newZoomLevel);
}

// Gets a new document.
Viewport.prototype.getDocument = function()
{
    return this.document;
}

// Sets a new document.
Viewport.prototype.setDocument = function(document)
{
    this.document.remove();
    this.document.destroy();
    delete this.document;
    
    this.document           = document;
    this.documentDimensions = document.getDimensions();
    this.maxZoomLevel       = document.getMaxZoomLevel();
    
    this.document.insert(this);
    
    // Reinsert overlays.
    for (var i = 0; i < this.overlays.length; ++i)
    {
        this.overlays[i].remove();
        this.overlays[i].insert(this);
    }
    
    this.reset();
}

/*
 * Private methods.
 */

Viewport.prototype.initialize = function()
{
    // Set dimensions.
    this.dom.width(this.dimensions.width + "px");
    this.dom.height(this.dimensions.height + "px");
    
    // Append document to our dom.
    this.document.insert(this);
    
    // Initialize viewport.
    this.reset();
    
    // Set event listeners.
    var _this = this;
    this.dom.bind('mousewheel',    function(event) { return _this.onMouseWheel(event);  });
    this.dom.bind('mousedown',     function(event) { return _this.onMouseDown(event);   });
    this.dom.bind('dblclick',      function(event) { return _this.onDoubleClick(event); });
    $(document).bind('keydown',    function(event) { return _this.onKeyDown(event);     });
    $(document).bind('keyup',      function(event) { return _this.onKeyUp(event);       });
    $(document).bind('mousemove',  function(event) { return _this.onMouseMove(event);   });
    $(document).bind('mouseup',    function(event) { return _this.onMouseUp(event);     });
    
    // Add mouse scroll event for Firefox.
    if (window.addEventListener)
    {
        this.dom.get(0).addEventListener('DOMMouseScroll',
            function(event)
            { 
                return _this.onMouseWheel(event); 
            }, false);
    }
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
    
    // Check zoom level.
    if (newZoomLevel < 0)
        newZoomLevel = 0;
    else if (newZoomLevel > this.maxZoomLevel)
        newZoomLevel = this.maxZoomLevel;
    
    //calculate zoom factor
    var newZoomFactor   = Math.pow(2, newZoomLevel);
    var newInvZoomLevel = 1 / newZoomFactor;
    
    //do some bounds checking, and center document if smaller than viewport
    var scaledMargin = Viewport.margin * newInvZoomLevel;
    
    var topLeft     = {
        x: -scaledMargin,
        y: -scaledMargin
    };
    var bottomRight = {
        x: this.documentDimensions.width  + scaledMargin,
        y: this.documentDimensions.height + scaledMargin
    };
    
    var documentBox = rotateBoundingBox(
        {topLeft: topLeft, bottomRight: bottomRight},
        newRotation
    );
    
    var areaWidth  = (documentBox.bottomRight.x - documentBox.topLeft.x) * newZoomFactor;
    var areaHeight = (documentBox.bottomRight.y - documentBox.topLeft.y) * newZoomFactor;
    
    if (areaWidth < this.dimensions.width)
    {
        var centerOffset = {
            x: this.documentDimensions.width * 0.5, 
            y: this.documentDimensions.height * 0.5
        };
        var rotatedCenterOffset = rotatePoint(centerOffset, newRotation);
        
        newPosition.x = rotatedCenterOffset.x - this.dimensions.width * 0.5 * newInvZoomLevel;
    }
    else if (newPosition.x < documentBox.topLeft.x)
        {
            newPosition.x = documentBox.topLeft.x;
        }
    else if (newPosition.x > (documentBox.bottomRight.x - this.dimensions.width * newInvZoomLevel))
        {
            newPosition.x = documentBox.bottomRight.x - this.dimensions.width * newInvZoomLevel;
        }
    
    if (areaHeight < this.dimensions.height)
    {
        var centerOffset = {
            x: this.documentDimensions.width * 0.5, 
            y: this.documentDimensions.height * 0.5
        };
        var rotatedCenterOffset = rotatePoint(centerOffset, newRotation);
        
        newPosition.y = rotatedCenterOffset.y - this.dimensions.height * 0.5 * newInvZoomLevel;
    }
    else if (newPosition.y < documentBox.topLeft.y)
        {
            newPosition.y = documentBox.topLeft.y;
        }
    else if (newPosition.y > (documentBox.bottomRight.y - this.dimensions.height * newInvZoomLevel))
        {
            newPosition.y = documentBox.bottomRight.y - this.dimensions.height * newInvZoomLevel;
        }
    
    //set new zoom level and factors
    this.zoomLevel     = newZoomLevel;
    this.zoomFactor    = newZoomFactor;
    this.invZoomFactor = newInvZoomLevel;
    
    //set new position and rotation
    this.position = newPosition;
    this.rotation = newRotation;
    
    // Get visible area.
    this.visibleArea = this.calculateVisibleArea();
    
    // Update document.
    this.document.update(this.position, this.zoomLevel, this.rotation, this.visibleArea);
    
    // Update overlays.
    for (var i = 0; i < this.overlays.length; ++i)
    {
        this.overlays[i].update(this.position, this.zoomLevel, this.rotation, this.visibleArea);
    }
    
    // Dispatch event.
    this.eventDispatcher.trigger('change', this.position, this.zoomLevel, this.rotation,
        this.visibleArea);
}

Viewport.prototype.calculateVisibleArea = function()
{
    // Calculate topleft and bottomright.
    var topLeft     = this.position;
    var bottomRight = {
        x: topLeft.x + this.dimensions.width  * this.invZoomFactor,
        y: topLeft.y + this.dimensions.height * this.invZoomFactor
    };
    
    return rotateBoundingBox({topLeft: topLeft, bottomRight: bottomRight}, -this.rotation);
}

/*
 * Event handlers.
 */

Viewport.prototype.onMouseDown = function(event)
{
    //check if disabled
    if (this.draggingDisabled)
    {
        return false;
    }
    
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
    
    return false;
}

Viewport.prototype.onMouseMove = function(event)
{
    //dragging must have started
    if (!this.mouseDown)
    {
        return false;
    }
    
    //calculate delta and set new mouse position
    this.deltaPosition = {
        x: event.pageX - this.mousePosition.x,
        y: event.pageY - this.mousePosition.y
    };
    this.mousePosition = {x: event.pageX, y: event.pageY};
    
    //check for rotation
    var deltaRotation = 0;
    var newPosition;
    if (this.spaceDown && this.document.supportsRotation() && !this.rotationDisabled)
    {
        //get offset of viewport dom
        var domOffset = this.dom.offset();
        
        //calculate mouse position within viewport in document dimensions
        var mouseOffset = {
            x: (event.pageX - domOffset.left) * this.invZoomFactor,
            y: (event.pageY - domOffset.top)  * this.invZoomFactor
        };
        
        //calculate center offset of viewport document dimensions
        var centerOffset = {
            x: this.dimensions.width  * 0.5 * this.invZoomFactor,
            y: this.dimensions.height * 0.5 * this.invZoomFactor
        };
        
        //calculate rotation of mouse
        var mouseRotation = Math.atan2(
            mouseOffset.y - centerOffset.y,
            mouseOffset.x - centerOffset.x
        );
        
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
        var centerPosition = {
            x: this.position.x + centerOffset.x,
            y: this.position.y + centerOffset.y
        };
        
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
    
    return false;
}

Viewport.prototype.onMouseUp = function(event)
{
    // Dragging must have started.
    if (!this.mouseDown)
    {
        return false;
    }
    
    // Stop dragging.
    this.mouseDown = false;
    
    // Show normal cursor.
    $(document.body).removeClass("dragging");
    this.dom.removeClass("dragging");
    
    // Check for rotation.
    if (this.spaceDown)
    {
        return;
    }
    
    // Calculate new position.
    var deltaPosition = {
        x: -this.deltaPosition.x * Viewport.dragEaseFactor,
        y: -this.deltaPosition.y * Viewport.dragEaseFactor
    };
    
    // Move delta position.
    this.move(deltaPosition);
    
    return false;
}

Viewport.prototype.onMouseWheel = function(event)
{
    // Check if disabled.
    if (this.zoomingDisabled)
    {
        return false;
    }
    
    // Calculate scroll amount (0.75 is one normal step).
    var amount = event.detail ? event.detail * -1 : event.wheelDelta / 40;
    amount /= 0.75;
    
    // Zoom one level if no continuous zoom is supported.
    if (!this.document.supportsContinuousZoom())
    {
        amount = (amount < 0) ? -1 : 1;
    }
    else
    {
        amount *= Viewport.scrollFactor;
    }
    
    // Get new zoom level.
    var newZoomLevel = this.zoomLevel + amount;
    
    // Get offset of viewport dom.
    var domOffset = this.dom.offset();
    
    // Calculate mouse position within viewport.
    var mousePosition = {
        x: event.pageX - domOffset.left,
        y: event.pageY - domOffset.top
    };
    
    // Zoom in.
    this.zoom(newZoomLevel, mousePosition, false);
    
    return false;
}

Viewport.prototype.onDoubleClick = function(event)
{
    // Get new zoom level.
    var newZoomLevel = this.zoomLevel + 1;
    
    // Get offset of viewport dom.
    var domOffset = this.dom.offset();
    
    // Calculate mouse position within viewport.
    var mousePosition = {
        x: event.pageX - domOffset.left,
        y: event.pageY - domOffset.top
    };
    
    // Zoom in.
    this.zoom(newZoomLevel, mousePosition);
    
    return false;
}

// Handles keydown events.
Viewport.prototype.onKeyDown = function(event)
{
    // Check which key.
    var keyCode = event.which || event.keyCode;
    
    switch (keyCode)
    {
        case 32: // Space.
            this.spaceDown = true;
            
            // Cancel event if mouse is down.
            if (this.mouseDown)
            {
                return false;
            }
            
            break;
            
        case 36: // Home.
            if (!this.zoomingDisabled && !this.draggingDisabled && !this.rotationDisabled)
            {
                this.reset();
            }
            
            break;
            
        case 107: // Numpad +.
            if (!this.zoomingDisabled)
            {
                this.zoom(this.zoomLevel + 1);
            }
            
            break;
            
        case 109: // Numpad -.
            if (!this.zoomingDisabled)
            {
                this.zoom(this.zoomLevel - 1);
            }
            
            break;
            
        case 37: // Left.
        case 100: // Numpad 4.
            if (!this.draggingDisabled)
            {
                this.move({x: -Viewport.arrowMoveDistance, y: 0});
            }
            
            break;
            
        case 39: // Right.
        case 102: // Numpad 6.
            if (!this.draggingDisabled)
            {
                this.move({x: +Viewport.arrowMoveDistance, y: 0});
            }
            
            break;
            
        case 38: // Up.
        case 104: // Numpad 8.
            if (!this.draggingDisabled)
            {
                this.move({x: 0, y: -Viewport.arrowMoveDistance});
            }
            
            break;
            
        case 40: // Down.
        case 98: // Numpad 2.
            if (!this.draggingDisabled)
            {
                this.move({x: 0, y: +Viewport.arrowMoveDistance});
            }
            
            break;
    }
}

// Handles keyup events.
Viewport.prototype.onKeyUp = function(event)
{
    // Check which key.
    var keyCode = event.which || event.keyCode;
    
    switch (keyCode)
    {
        case 32: // Space.
            this.spaceDown = false;
            
            // Cancel event if mouse is down.
            if (this.mouseDown)
            {
                return false;
            }
            
            break;
    }
}

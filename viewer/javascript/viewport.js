/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Helper functions
 */

function cancelEvent(event)
{
	event = event || window.event;
	
	if (event.stopPropagation)
		event.stopPropagation();
	
	if (event.preventDefault)
		event.preventDefault();
	
	event.cancelBubble = true;
	event.cancel       = true;
	event.returnValue  = false;
	
	return false;
}

function showStatusText(str)
{
	$("#status").text(str);
}

/*
 * Browser detection
 */

var isIE = document.all;

/*
 * Viewport class
 */

function Viewport(dom, viewerWidth, viewerHeight, documentWidth, documentHeight, levels)
{
	this.constructor(dom, viewerWidth, viewerHeight, documentWidth, documentHeight, levels);
}

//members
Viewport.prototype.dom;
Viewport.prototype.tiles;
Viewport.prototype.levelContainers;
Viewport.prototype.levelOffsets;
Viewport.prototype.levelSizes;

Viewport.prototype.mousePosition;
Viewport.prototype.deltaPosition;
Viewport.prototype.mouseRotation;
Viewport.prototype.mouseDown = false;
Viewport.prototype.spaceDown = false;

Viewport.prototype.position;
Viewport.prototype.rotation      = 0;
Viewport.prototype.zoomLevel     = -1;
Viewport.prototype.zoomFactor    = 0;
Viewport.prototype.invZoomFactor = 0;

//constants
Viewport.emToPixelsFactor = 8;
Viewport.tileSize         = 256; //TODO: set CSS to use this
Viewport.invTileSize      = 1 / Viewport.tileSize;

//which method to use: there are 4 methods: transform (preferred), zoom (nope), filter (IE), font-size (fallback)
Viewport.prototype.useTransformMethod = false; 
Viewport.prototype.useZoomMethod      = false;

//methods
Viewport.prototype.constructor = function(dom, viewerWidth, viewerHeight, documentWidth, documentHeight, levels)
{
    //set members
	this.dom                = $(dom);
	this.documentDimensions = {width: documentWidth, height: documentHeight};
	this.dimensions         = {width: viewerWidth,   height: viewerHeight};
	this.maxZoomLevel       = levels;
	this.position           = {x: 0, y: 0};
	
	//initialize
	this.initialize();
}

Viewport.prototype.initialize = function()
{
	var _this = this;
	
	//get some shortcuts
	this.tiles = $(".tiles", this.dom);
	
	//create level containers, hide them by default
	this.levelSizes   = [];
	this.levelOffsets = [];
	for (var i = 0; i <= this.maxZoomLevel; ++i)
	{
		this.tiles.append('<div class="level" id="level_' + i + '" style="display: none;"></div>');
		
		var width  = Math.pow(2, i) * this.documentDimensions.width;
		var height = Math.pow(2, i) * this.documentDimensions.height;
		
		var cols = Math.ceil(width  * Viewport.invTileSize);
		var rows = Math.ceil(height * Viewport.invTileSize);
		
		this.levelSizes.push({width: width, height: height, cols: cols, rows: rows});
		this.levelOffsets.push({x: 0, y: 0});
	}
	
	//get level containers
	this.levelContainers = $(".level", this.dom).get();
	
	//set dimensions
	this.dom.width(this.dimensions.width + "px");
	this.dom.height(this.dimensions.height + "px");
	
	//initialize viewport
	this.update({x: 0, y: 0}, 0); //TODO: be able to specify initial position and zoom level
	
	//set event listeners
	this.tiles.bind('selectstart', false);
	this.tiles.bind('dragstart',   false);
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

//sets dimensions of viewer
Viewport.prototype.setDimensions = function(viewerWidth, viewerHeight)
{
	this.dimensions = {width: viewerWidth, height: viewerHeight};
	
	this.dom.width(viewerWidth + "px");
	this.dom.height(viewerHeight + "px");
	
	this.update();
}

//rotates a point a number of degrees
Viewport.prototype.rotatePoint = function(point, angle)
{
	angle *= Math.PI / 180;
	
	var cos = Math.cos(angle);
	var sin = Math.sin(angle);
	
	var result = {
		x: point.x * cos - point.y * sin,
		y: point.x * sin + point.y * cos
	};
	
	return result;
}

//gets visible area in viewport
Viewport.prototype.getVisibleArea = function()
{
	//TODO: optimize this
	
	
	//NOTE: we just use the current zoomFactor (invZoomFactor) and rotation, cause they are already available
	
	//calculate topleft and bottomright
	var topLeft     = this.position;
	var bottomRight = {
		x: topLeft.x + this.dimensions.width  * this.invZoomFactor,
		y: topLeft.y + this.dimensions.height * this.invZoomFactor
	};
	var topRight    = {x: bottomRight.x, y: topLeft.y};
	var bottomLeft  = {x: topLeft.x, y: bottomRight.y};
	
	//rotate points, and set new topleft and bottomright
	var rotatedTopLeft     = this.rotatePoint(topLeft,     -this.rotation);
	var rotatedBottomRight = this.rotatePoint(bottomRight, -this.rotation);
	var rotatedTopRight    = this.rotatePoint(topRight,    -this.rotation);
	var rotatedBottomLeft  = this.rotatePoint(bottomLeft,  -this.rotation);
	
	topLeft = {
		x: Math.min(Math.min(rotatedTopLeft.x, rotatedBottomRight.x), Math.min(rotatedTopRight.x, rotatedBottomLeft.x)),
		y: Math.min(Math.min(rotatedTopLeft.y, rotatedBottomRight.y), Math.min(rotatedTopRight.y, rotatedBottomLeft.y))
	};
	
	bottomRight = {
		x: Math.max(Math.max(rotatedTopLeft.x, rotatedBottomRight.x), Math.max(rotatedTopRight.x, rotatedBottomLeft.x)),
		y: Math.max(Math.max(rotatedTopLeft.y, rotatedBottomRight.y), Math.max(rotatedTopRight.y, rotatedBottomLeft.y))
	};
	
	return {topLeft: topLeft, bottomRight: bottomRight};
}


//updates tiles of a certain level
Viewport.prototype.updateLevelTiles = function(area, zoomLevel)
{
	//get level container
	var levelContainer = this.levelContainers[zoomLevel];
	if (!levelContainer)
		return;
	
	//calculate new zoom factors
	var zoomFactor = Math.pow(2, zoomLevel);
	
	//calculate needed row and column numbers
	var size = this.levelSizes[zoomLevel];
	
	var startCol = Math.max(0, Math.floor(area.topLeft.x * zoomFactor * Viewport.invTileSize));
	var startRow = Math.max(0, Math.floor(area.topLeft.y * zoomFactor * Viewport.invTileSize));
	
	var endCol = Math.min(size.cols - 1, Math.floor(area.bottomRight.x * zoomFactor * Viewport.invTileSize));
	var endRow = Math.min(size.rows - 1, Math.floor(area.bottomRight.y * zoomFactor * Viewport.invTileSize));
	
	//remove old tiles
	//walking backwards is required, because otherwise a child node may not exist anymore
	var remainingTiles = {};
	for (var i = levelContainer.childNodes.length - 1; i >= 0; --i)
	{
		//get image
		var img = levelContainer.childNodes[i];
		
		//get parts from class
		var parts = img.className.substr(5).split('_');
		var row = parts[0];
		var col = parts[1];
		
		//check if image is outide viewport
		if ((row < startRow) || (row > endRow) || (col < startCol) || (col > endCol))
		{
			levelContainer.removeChild(img);
		}
		else
		{
			remainingTiles[img.className] = true;
		}
	}
	
	//check if there are no tiles anymore
	var offset = this.levelOffsets[zoomLevel];
	if (levelContainer.childNodes.length === 0)
	{
		//offset.x = startCol * Viewport.tileSize;
		//offset.y = startRow * Viewport.tileSize;
		
		//this.levelOffsets[zoomLevel] = offset;
	}
	
	//add new tiles
	var hostIndex = 0;
	for (var row = startRow; row <= endRow; ++row)
	{
		for (var col = startCol; col <= endCol; ++col)
		{
			if (remainingTiles['tile_' + row + '_' + col] !== true)
			{
				//get google maps coordinates
				var googleCol   = col;
				var googleRow   = row;
				var googleDepth = zoomLevel;
				
				var x = col * Viewport.tileSize - offset.x;
				var y = row * Viewport.tileSize - offset.y;
				
				//create image
				var img = document.createElement('img');
				
				img.className = 'tile_' + row + '_' + col;
				
				img.style.left    = Math.round(x) + 'px';
				img.style.top     = Math.round(y) + 'px';
				img.style.display = 'none';
				
				hostIndex = (hostIndex + 1) & 3; //0-3
				var baseUrl = 'http://khm' + hostIndex + '.google.nl/kh/v=92&';
				img.src = baseUrl + 'x=' + googleCol + '&y=' + googleRow + '&z=' + googleDepth + '&s=Gali';
				
				//img.src = 'file://C:/Users/gerbenvv/Dropbox/SoftwareProject/Documentatie klant/Voorbeelden/Gabriel Harveys Livy/tiles/' +
				//	'page1_' + zoomLevel + '_' + col + '_' + row + '.jpg';
				
				img.onload = function(event) {
					var event  = event || window.event;
					var target = event.target || event.srcElement;
					
					target.style.display = "";
				};
				
				//add it to the level container
				levelContainer.appendChild(img);
				
				//http://mt0.google.com/vt/lyrs=h@160000000&hl=en&x=
				//http://khm0.google.nl/kh/v=92&x
			}
		}
	}
}

//updates tiles of viewport to position and level
Viewport.prototype.updateTiles = function(newPosition, newZoomLevel, newZoomFactor, newRotation)
{
	//ceil zoom level
	var ceiledZoomLevel  = Math.ceil(newZoomLevel - 0.5);
	var ceiledZoomFactor = Math.pow(2, ceiledZoomLevel);
	
	//calculate opacity and scale of base layer
	var opacity = 1 - (ceiledZoomLevel - newZoomLevel);
	var scale   = newZoomFactor / ceiledZoomFactor;
	
	
	
	var translateTransform = "translate(" +
		Math.round(newPosition.x * -newZoomFactor) + "px," +
		Math.round(newPosition.y * -newZoomFactor) + "px)";
	
	
	
	//hide all levels above current zoom level, show all level above it
	var levelScale = scale * ceiledZoomFactor;
	for (var i = 0; i < this.levelContainers.length; ++i, levelScale *= 0.5)
	{
		var container = this.levelContainers[i];
		
		var delta = ceiledZoomLevel - i;
		if ((delta >= 0) && (delta < 3)) //TODO: constant
		{
			container.style.display = "";
			container.style.opacity = (!delta) ? opacity : "";
			
			if (false && isIE) //NOTE: not IE9+, it can do -ms-transform
			{
				container.style.filter =
					"progid:DXImageTransform.Microsoft.Matrix(SizingMethod='auto expand', FilterType=nearest, " + //bilinear
					"M11=" + levelScale + ", M12=0, M21=0, M22=" + levelScale + ")";
				
				//IE resizes around the center! (nooooo)
				
				//container.css("zoom", levelScale * 100 + "%");
				
				//container.css("font-size", levelScale * 100 + "%");
			}
			else if (true) //if (browser can do transform)
			{
				var transform = translateTransform + " scale(" + levelScale + ") rotate(" + newRotation + "deg)";
				
				var offset = this.levelOffsets[i];
				transform += " translate(" + offset.x + "px, " + offset.y + "px)";
				
				//TODO: simplify this *a* lot !
				
				container.style.transform       = transform;
				container.style.webkitTransform = transform;
				container.style.MozTransform    = transform;
				container.style.OTransform      = transform;
				container.style.msTransform     = transform;
			}
			else
			{
				//container.css("zoom", levelScale * 100 + "%");
				container.style.fontSize = levelScale * 100 + "%"; //font-size causes rounding errors
			}
		}
		else
		{
			container.style.display = "none";
			container.style.opacity = "";
			
			if (false && isIE) //NOTE: not IE9+, it can do -ms-transform
			{
				container.style.filter = "";
				
				//container.css("zoom", "");
				
				//container.css("font-size", "100%");
			}
			else if (true) //if (browser can do transform)
			{
				container.style.transform       = "";
				container.style.webkitTransform = "";
				container.style.MozTransform    = "";
				container.style.OTransform      = "";
				container.style.msTransform     = "";
			}
			else
			{
				//container.css("zoom", "");
				//container.css("font-size", "100%");
			}
		}
	}
	
	//TODO: if we are going to keep using timer, add it to prototype
	
	//clear current timer
	if (this.timer !== undefined)
	{
		clearTimeout(this.timer);
		this.timer = undefined;
	}
	
	//set timer to allow smooth zooming
	var zooming = (this.zoomLevel !== newZoomLevel);
	
	var _this = this;
	this.timer = setTimeout(
		function()
		{
			var area = _this.getVisibleArea();
			
			//update two levels of tiles
			_this.updateLevelTiles(area, ceiledZoomLevel - 1);
			_this.updateLevelTiles(area, ceiledZoomLevel);
		},
		(zooming ? 100 : 100)
	);
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
	
	//check zoom level
	if (newZoomLevel < 0)
	{
		newZoomLevel = 0;
	}
	else if (newZoomLevel > this.maxZoomLevel)
	{
		newZoomLevel = this.maxZoomLevel;
	}
	
	//round new zoom level to one tens
	newZoomLevel = Math.round(newZoomLevel * 10) / 10;
	
	//calculate zoom factor
	var newZoomFactor = Math.pow(2, newZoomLevel);
	
	
	
	//normalize rotation (NOTE: is this really needed? why not work with radians?)
	newRotation %= 360;
	if (newRotation < 0)
		newRotation = 360 + newRotation;
	
	
	
	//var factor = -this.zoomFactor;
	
	//this.tiles.css("left", Math.round(newPosition.x * factor) + "px");
	//this.tiles.css("top",  Math.round(newPosition.y * factor) + "px");
	
	
	
	//NOTE: disabled bounds check for rotation
	
	//check position
	//if (newPosition.x > (this.documentDimensions.width - this.dimensions.width / newZoomFactor))
	//	newPosition.x = (this.documentDimensions.width - this.dimensions.width / newZoomFactor);
	
	//if (newPosition.y > (this.documentDimensions.height - this.dimensions.height / newZoomFactor))
	//	newPosition.y = (this.documentDimensions.height - this.dimensions.height / newZoomFactor);
	
	//if (newPosition.x < 0)
	//	newPosition.x = 0;
	
	//if (newPosition.y < 0)
	//	newPosition.y = 0;
	
	
	
	//update tiles
	this.updateTiles(newPosition, newZoomLevel, newZoomFactor, newRotation);
	
	
	//set new zoom level and factors
	this.zoomLevel     = newZoomLevel;
	this.zoomFactor    = newZoomFactor;
	this.invZoomFactor = 1 / newZoomFactor;
	
	//set new position and rotation
	this.position = newPosition;
	this.rotation = newRotation;
	
	
	//DEBUG: show zoom and position
	showStatusText("zoom: " + this.zoomLevel + ", x: " + this.position.x + ", y: " + this.position.y +
		", rotation: " + this.rotation);
}

Viewport.prototype.startDragging = function(event)
{
	//start dragging
	this.mouseDown     = true;
	this.mousePosition = {x: event.pageX, y: event.pageY};
	
	
	

	//calculate mouse offset in document dimensions
	var mouseOffset = {
		x: this.mousePosition.x * this.invZoomFactor,
		y: this.mousePosition.y * this.invZoomFactor
	};
	
	//calculate center offset of viewport document dimensions
	var centerOffset = {
		x: this.dimensions.width  * 0.5 * this.invZoomFactor,
		y: this.dimensions.height * 0.5 * this.invZoomFactor
	};
	
	//calculate rotation of mouse
	this.mouseRotation = (180 / Math.PI) * Math.atan2(mouseOffset.y - centerOffset.y, mouseOffset.x - centerOffset.x);
	
	
	
	
		
	//check for rotation
	if (this.spaceDown)
	{
		return cancelEvent(event);
	}
	
	
	
	
	//TODO: show rotating cursor?
	
	//show grabbing cursor
	$(document.body).addClass("dragging");
	this.tiles.addClass("dragging");
	
	return cancelEvent(event);
}

Viewport.prototype.doDragging = function(event)
{
	if (!this.mouseDown)
		return;
	
	//calculate delta and set new mouse position
	this.deltaPosition = {x: event.pageX - this.mousePosition.x, y: event.pageY - this.mousePosition.y};
	this.mousePosition = {x: event.pageX, y: event.pageY};
	
	
	

	//calculate mouse offset in document dimensions
	var mouseOffset = {
		x: this.mousePosition.x * this.invZoomFactor,
		y: this.mousePosition.y * this.invZoomFactor
	};
	
	//calculate center offset of viewport document dimensions
	var centerOffset = {
		x: this.dimensions.width  * 0.5 * this.invZoomFactor,
		y: this.dimensions.height * 0.5 * this.invZoomFactor
	};
	
	//calculate rotation of mouse
	var mouseRotation = (180 / Math.PI) * Math.atan2(mouseOffset.y - centerOffset.y, mouseOffset.x - centerOffset.x);
	
	//calculate delta rotation and store new one
	var deltaRotation = mouseRotation - this.mouseRotation;
	this.mouseRotation = mouseRotation;
	
	
	
	
	
	//check for rotation
	if (this.spaceDown)
	{
		//calculate center position
		var centerPosition = {x: this.position.x + centerOffset.x, y: this.position.y + centerOffset.y};
		
		//rotate center position
		centerPosition = this.rotatePoint(centerPosition, deltaRotation);
		
		//set new position to topleft coordinates
		var newPosition = {x: centerPosition.x - centerOffset.x, y: centerPosition.y - centerOffset.y};
		
		//update viewport
		this.update(newPosition, undefined, this.rotation + deltaRotation);
		
		return cancelEvent(event);
	}
	
	
	
	
	//calculate new position
	var newPosition = {
		x: this.position.x - this.deltaPosition.x * this.invZoomFactor,
		y: this.position.y - this.deltaPosition.y * this.invZoomFactor
	};
	
	//update viewport
	this.update(newPosition);
	
	return cancelEvent(event);
}

Viewport.prototype.stopDragging = function(event)
{
	if (!this.mouseDown)
		return;
	
	//stop dragging
	this.mouseDown = false;
	
	//check for rotation
	if (this.spaceDown)
		return;
	
	//show normal cursor
	$(document.body).removeClass("dragging");
	this.tiles.removeClass("dragging");
	
	//NOTE: sometimes deltaPosition is not set !!
	
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
			//ease: "swing",
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
	
	//get new zoom level
	var newZoomLevel = this.zoomLevel + amount / 0.75 * 0.2; //NOTE: was 0.1
	
	//bail out not zooming: causes position to shift
	if ((newZoomLevel < 0) && (!this.zoomLevel))
	{
		return cancelEvent(event);
	}
	
	//calculate new zoom factor
	var invNewZoomFactor = Math.pow(2, -newZoomLevel);
	
	//get offset of viewport dom
	var domOffset = this.dom.offset();
	
	//calculate mouse position within viewport
	var mousePosition = {
		x: (event.pageX - domOffset.left) * this.invZoomFactor,
		y: (event.pageY - domOffset.top)  * this.invZoomFactor
	};
	
	
	
	
	//set factor of how much to subtract mouse position
	var factor = this.zoomFactor * invNewZoomFactor - 1;
	
	
	
	var delta = {x: -mousePosition.x * factor, y: -mousePosition.y * factor};
	
	
	
	//rotate delta
	//delta = this.rotatePoint(delta, -10);
	
	
	
	//calculate new topleft position
	var newPosition = {x: this.position.x + delta.x, y: this.position.y + delta.y};
	
	//update viewport
	this.update(newPosition, newZoomLevel);
	
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

var viewport;

$(document).ready(
	function() {
		//update the viewport size
		var windowWidth  = $(window).width();
		var windowHeight = $(window).height();
		
		//arguments are: selector of dom, document size of level 0 (width, height), maximum zoom level
		viewport = new Viewport("#viewport", windowWidth - 20, windowHeight - 60, Viewport.tileSize, Viewport.tileSize, 20);
	}
);

//resize viewport on window resizing
$(window).resize(
	function(){
		//update the viewport size
		var windowWidth  = $(window).width();
		var windowHeight = $(window).height();
		
		//update viewport dimensions
		viewport.setDimensions(windowWidth - 20, windowHeight - 60);
	}
);
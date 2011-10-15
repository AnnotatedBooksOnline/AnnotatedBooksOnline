/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Helper functions.
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
	//$("#status").text(str);
}

/*
 * Browser detection.
 */

var isIE = navigator.userAgent.indexOf("MSIE")    != -1;
var isFF = navigator.userAgent.indexOf("Firefox") != -1;

/*
 * Viewport class.
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
Viewport.prototype.levelVisible;
Viewport.prototype.levelTimers;

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
	//set class on dom
	this.dom.addClass('viewport');
	
	//create tiles div
	this.dom.append('<div class="tiles"></div>');
	
	//get shortcut
	this.tiles = $(".tiles", this.dom);
	
	//create level containers, hide them by default
	this.levelSizes   = [];
	this.levelOffsets = [];
	this.levelVisible = [];
	this.levelTimers  = [];
	for (var i = 0; i <= this.maxZoomLevel; ++i)
	{
		this.tiles.append('<div class="level" id="level_' + i + '" style="display: none;"></div>');
		
		var width  = Math.pow(2, i) * this.documentDimensions.width;
		var height = Math.pow(2, i) * this.documentDimensions.height;
		
		var cols = Math.ceil(width  * Viewport.invTileSize);
		var rows = Math.ceil(height * Viewport.invTileSize);
		
		this.levelSizes.push({width: width, height: height, cols: cols, rows: rows});
		this.levelOffsets.push({x: 0, y: 0});
		this.levelVisible.push(false);
		this.levelTimers.push(undefined);
	}
	
	//get level containers
	this.levelContainers = $(".level", this.dom).get();
	
	//set dimensions
	this.dom.width(this.dimensions.width + "px");
	this.dom.height(this.dimensions.height + "px");
	
	//initialize viewport
	this.update({x: 0, y: 0}, 0); //TODO: be able to specify initial position and zoom level
	
	//set event listeners
	var _this = this;
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


Viewport.prototype.removeInvisibleTiles = function(levelContainer, startRow, endRow, startCol, endCol)
{


	//TODO: postpone this, calculate offset without DOM

	
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
	
	
	
	return remainingTiles;
}

Viewport.prototype.addVisibleTiles =
	function(levelContainer, zoomLevel, remainingTiles, offset, startRow, endRow, startCol, endCol)
{
	//create fragment to add DOM nodes to
	var fragment = document.createDocumentFragment();
	
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
				
				img.style.left    = x + 'px';
				img.style.top     = y + 'px';
				//img.style.width   = Viewport.tileSize + 'px';
				//img.style.height  = Viewport.tileSize + 'px';
				
				//img.style.display = 'none';
				
				//hostIndex = (hostIndex + 1) & 3; //0-3
				//var baseUrl = 'http://khm' + hostIndex + '.google.nl/kh/v=92&';
				//img.src = baseUrl + 'x=' + googleCol + '&y=' + googleRow + '&z=' + googleDepth + '&s=Gali';
				
				//img.src = 'file://C:/Users/gerbenvv/Dropbox/SoftwareProject/Documentatie klant/Voorbeelden/Gabriel Harveys Livy/tiles/' +
				//	'page1_' + zoomLevel + '_' + col + '_' + row + '.jpg;
				
				img.src = 'tiles/tile_' + zoomLevel + '_' + col + '_' + row + '.jpg';
				
				//img.onload = function(event) {
				//	var event  = event || window.event;
				//	var target = event.target || event.srcElement;
				//	
				//	target.style.display = "";
				//};
				
				//add it to the fragment
				fragment.appendChild(img);
				
				//http://mt0.google.com/vt/lyrs=h@160000000&hl=en&x=
				//http://khm0.google.nl/kh/v=92&x
			}
		}
	}
	
	levelContainer.appendChild(fragment);
}

Viewport.prototype.updateLevel = function(area, zoomLevel, levelScale, delta)
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
	
	
	
	
	
	//NOTE: following call kills performance
	
	
	//remove unused tiles
	var remainingTiles = this.removeInvisibleTiles(levelContainer, startRow, endRow, startCol, endCol);
	
	
	
	//check if there are no tiles anymore
	var offset = this.levelOffsets[zoomLevel];
	
	
	
	if (levelContainer.childNodes.length === 0)
	{
		offset.x = startCol * Viewport.tileSize;
		offset.y = startRow * Viewport.tileSize;
		
		this.levelOffsets[zoomLevel] = offset;
	}
	
	
	
	
	
	/*
	
	translate(x2, y2) . scale(s) . rotate(r) . translate(x1, y1)
	
	=
	
	1  0  x2     s  0  0     cos r  -sin r  0     1  0  x1
	0  1  y2  .  0  s  0  .  sin r   cos r  0  .  0  1  y1
	0  0  1      0  0  1     0       0      1     0  0   1
	
	=
	
	s * cos r    s * -sin r    x1 * s * cos r + y1 * s * -sin r + x2
	s * sin r    s *  cos r    x1 * s * sin r + y1 * s *  cos r + y2
	0            0             1
	
	*/
	
	var scaledSin = levelScale * Math.sin(this.rotation * (Math.PI / 180));
	var scaledCos = levelScale * Math.cos(this.rotation * (Math.PI / 180));
	
	var x1 = this.levelOffsets[zoomLevel].x;
	var y1 = this.levelOffsets[zoomLevel].y;
	
	var x2 = this.position.x * -this.zoomFactor;
	var y2 = this.position.y * -this.zoomFactor;
	
	var matrix = [
		scaledCos, -scaledSin, x1 * scaledCos - y1 * scaledSin + x2,
		scaledSin,  scaledCos, x1 * scaledSin + y1 * scaledCos + y2
	];
	
	
	
	if (false && isIE) //NOTE: not IE9+, it can do -ms-transform
	{
		//SizingMethod='auto expand', 
		
		levelContainer.style.filter =
			"progid:DXImageTransform.Microsoft.Matrix(FilterType=nearest, " + //bilinear
			"M11=" + matrix[0] + ", M12=" + matrix[1] + ", M21=" + matrix[3] + ", M22=" + matrix[4] + ", " +
			"dX=" + matrix[2] + ", dY=" + matrix[5] + ")";
		
		levelContainer.style.zIndex = 0;
		levelContainer.style.width  = "1000px";
		levelContainer.style.height = "1000px";
		
		//width: 5000px;
		//height: 5000px;
		//filter: progid:DXImageTransform.Microsoft.Matrix(FilterType=bilinear,  M11=0.7, M21=0.7, M12=-0.7, M22=0.7, dX=200, dY=100);
	}
	else if (true) //if (browser can do transform)
	{
		
		
		
		var px = isFF ? 'px' : '';
		var temp = [matrix[0], matrix[3], matrix[1], matrix[4], matrix[2] + px, matrix[5] + px].join(',');
		var transform = "matrix(" + temp + ")"; //TODO: firefox, add px
		
		
		
		
		//TODO: simplify this *a* lot !
		
		levelContainer.style.transform       = transform;
		levelContainer.style.webkitTransform = transform;
		levelContainer.style.MozTransform    = transform;
		levelContainer.style.OTransform      = transform;
		levelContainer.style.msTransform     = transform;
	}
	
	//show container and set opacity
	if (!this.levelVisible[zoomLevel])
		levelContainer.style.display = "";
	
	//clear current timer
	if (this.levelTimers[zoomLevel] !== undefined)
	{
		clearTimeout(this.levelTimers[zoomLevel]);
		this.levelTimers[zoomLevel] = undefined;
	}
	
	//check whether to postpone updating tiles
	var zooming = !this.levelVisible[zoomLevel];
	if (!delta && !zooming)
	{
		//add new tiles
		this.addVisibleTiles(levelContainer, zoomLevel, remainingTiles, offset, startRow, endRow, startCol, endCol);
	}
	else
	{
	
		//set timer
		var _this = this;
		this.levelTimers[zoomLevel] = setTimeout(
			function()
			{
				//add new tiles
				_this.addVisibleTiles(levelContainer, zoomLevel, remainingTiles, offset, startRow, endRow, startCol, endCol);
			},
			100
		);
	
	}
	
	//set this level visible
	this.levelVisible[zoomLevel] = true;
}


//updates tiles of viewport to position and level
Viewport.prototype.updateLevels = function()
{
	//ceil zoom level
	var ceiledZoomLevel  = Math.ceil(this.zoomLevel - 0.5);
	var ceiledZoomFactor = Math.pow(2, ceiledZoomLevel);
	
	//calculate scale of base layer
	var scale = this.zoomFactor / ceiledZoomFactor;
	
	//calculate visible area
	var area = this.getVisibleArea();
	
	//handle three main levels
	this.updateLevel(area, ceiledZoomLevel,     scale,      0);
	this.updateLevel(area, ceiledZoomLevel - 1, scale * 2, -1);
	this.updateLevel(area, ceiledZoomLevel - 2, scale * 4, -2);
	
	//hide all levels above current zoom level, show all level above it
	for (var i = 0; i < this.levelContainers.length; ++i)
	{
		var delta = ceiledZoomLevel - i;
		if ((delta < 0) || (delta >= 3) && this.levelVisible[i])
		{
			var container = this.levelContainers[i];
			
			container.style.display = "none";
			
			if (false && isIE) //NOTE: not IE9+, it can do -ms-transform
			{
				container.style.filter = "";
			}
			else if (true) //if (browser can do transform)
			{
				container.style.transform       = "";
				container.style.webkitTransform = "";
				container.style.MozTransform    = "";
				container.style.OTransform      = "";
				container.style.msTransform     = "";
			}
			
			this.levelVisible[i] = false;
		}
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
	
	
	//set new zoom level and factors
	this.zoomLevel     = newZoomLevel;
	this.zoomFactor    = newZoomFactor;
	this.invZoomFactor = 1 / newZoomFactor;
	
	//set new position and rotation
	this.position = newPosition;
	this.rotation = newRotation;
	
	//update levels
	this.updateLevels();
	
	
	
	
	//DEBUG: show zoom and position
	showStatusText("zoom: " + this.zoomLevel + ", x: " + this.position.x + ", y: " + this.position.y +
		", rotation: " + this.rotation);
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
	
	//check for rotation
	var deltaRotation = 0;
	var newPosition;
	if (this.spaceDown)
	{
	
	
	

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
		
		if (this.mouseRotation === undefined)
		{
			this.mouseRotation = mouseRotation;
		}
		else
		{
			//calculate delta rotation and store new one
			var deltaRotation  = mouseRotation - this.mouseRotation;
			this.mouseRotation = mouseRotation;
		}
		
		
	
	
	
	
	
		//calculate center position
		var centerPosition = {x: this.position.x + centerOffset.x, y: this.position.y + centerOffset.y};
		
		//rotate center position
		centerPosition = this.rotatePoint(centerPosition, deltaRotation);
		
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
	
	//clamp zoom level before factor is calculated
	if (newZoomLevel < 0)
	{
		newZoomLevel = 0;
	}
	else if (newZoomLevel > this.maxZoomLevel)
	{
		newZoomLevel = this.maxZoomLevel;
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
	
	//calculate new topleft position
	var newPosition = {x: this.position.x - mousePosition.x * factor, y: this.position.y - mousePosition.y * factor};
	
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

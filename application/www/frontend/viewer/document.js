/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Document class.
 */

//class definition
function Document()
{
    if (arguments.length)
        this.constructor.apply(this, arguments);
}

Document.prototype = new DomNode;
Document.base = DomNode.prototype;

//members
Document.prototype.dimensions;
Document.prototype.maxZoomLevel;

Document.prototype.levelContainers;
Document.prototype.levelOffsets;
Document.prototype.levelSizes;
Document.prototype.levelVisible;
Document.prototype.levelTimers;

//NOTE: should we have some state? like current position, rotation, etc?

//constants
Document.tileSize    = 256;
Document.invTileSize = 1 / Document.tileSize;
Document.minLevelDisplay = 1;

//constructor
Document.prototype.constructor = function(width, height, zoomLevels, getImageUrl, thumbnailUrl)
{
    //set members
    this.dimensions   = {width: width, height: height};
    this.maxZoomLevel = zoomLevels - 1;
    
    this.getImageUrl = getImageUrl;
    this.thumbnailUrl = thumbnailUrl;
    
    //create dom
    Document.base.constructor.call(this, '<div class="document"></div>');
    
    //initialize
    this.initialize();
}

/*
 * Public methods.
 */

Document.prototype.getDimensions = function()
{
    return this.dimensions;
}

Document.prototype.getMaxZoomLevel = function()
{
    return this.maxZoomLevel;
}

Document.prototype.supportsContinuousZoom = function()
{
    return hasTransforms;
}

Document.prototype.supportsRotation = function()
{
    return hasTransforms;
}

Document.prototype.update = function(position, zoomLevel, rotation, area)
{
    //set new zoom level and factors
    this.zoomLevel    = zoomLevel;
    this.zoomFactor   = Math.pow(2, zoomLevel);
    this.invZoomLevel = 1 / this.zoomFactor;
    
    //set new position and rotation
    this.position = position;
    this.rotation = rotation;
    
    this.updateLevels(area);
}

/*
 * Private methods.
 */

Document.prototype.initialize = function()
{
    //create level containers, hide them by default
    this.levelSizes   = [];
    this.levelOffsets = [];
    this.levelVisible = [];
    this.levelTimers  = [];
    for (var i = 0; i <= this.maxZoomLevel; ++i)
    {
        if (i <= Document.minLevelDisplay)
        {
            this.dom.append('<div class="level"></div>');
        }
        else
        {
            this.dom.append('<div class="level" style="display: none;"></div>');
        }
        
        var width  = Math.pow(2, i) * this.dimensions.width;
        var height = Math.pow(2, i) * this.dimensions.height;
        
        var cols = Math.ceil(width  * Document.invTileSize);
        var rows = Math.ceil(height * Document.invTileSize);
        
        this.levelSizes.push({width: width, height: height, cols: cols, rows: rows});
        this.levelOffsets.push({x: 0, y: 0});
        this.levelVisible.push(i <= Document.minLevelDisplay);
        this.levelTimers.push(undefined);
    }
    
    //get level containers
    this.levelContainers = $(".level", this.dom).get();
    
    //add the thumbnail as default image, as it is already loaded.
    if (this.thumbnailUrl)
    {
        var thumbnail = document.createElement('img');
        thumbnail.src = this.thumbnailUrl;
        thumbnail.style.left = '0px';
        thumbnail.style.top = '0px';
        thumbnail.style.width = this.dimensions.width + 'px';
        thumbnail.style.height = this.dimensions.height + 'px';
        this.levelContainers[0].appendChild(thumbnail);
    }
    
    //set event listeners
    this.dom.bind('selectstart', false);
    this.dom.bind('dragstart',   false);
}

Document.prototype.removeInvisibleTiles = function(levelContainer, startRow, endRow, startCol, endCol)
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
        
        //check if image is outide Document
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

Document.prototype.addVisibleTiles =
    function(levelContainer, zoomLevel, remainingTiles, offset, startRow, endRow, startCol, endCol)
{
    //create fragment to add DOM nodes to
    var fragment = document.createDocumentFragment();
    
    //add new tiles
    for (var row = startRow; row <= endRow; ++row)
    {
        for (var col = startCol; col <= endCol; ++col)
        {
            if (remainingTiles['tile_' + row + '_' + col] !== true)
            {
                //calculate location of image
                var x = col * Document.tileSize - offset.x;
                var y = row * Document.tileSize - offset.y;
                
                //create image
                var img = document.createElement('img');
                
                img.className = 'tile_' + row + '_' + col;
                
                img.style.left    = x + 'px';
                img.style.top     = y + 'px';
                
                img.src = this.getImageUrl(row, col, zoomLevel);
                
                //add it to the fragment
                fragment.appendChild(img);
            }
        }
    }
    
    levelContainer.appendChild(fragment);
}

Document.prototype.updateLevel = function(area, zoomLevel, levelScale, mainLevel)
{
    
    //get level container
    var levelContainer = this.levelContainers[zoomLevel];
    if (!levelContainer)
    {
        return;
    }
    
    
    
    
    //calculate new zoom factors
    var zoomFactor = Math.pow(2, zoomLevel);
    
    //calculate needed row and column numbers
    var size = this.levelSizes[zoomLevel];
    
    var startCol = Math.max(0, Math.floor(area.topLeft.x * zoomFactor * Document.invTileSize));
    var startRow = Math.max(0, Math.floor(area.topLeft.y * zoomFactor * Document.invTileSize));
    
    var endCol = Math.min(size.cols - 1,
        Math.floor(area.bottomRight.x * zoomFactor * Document.invTileSize));
    var endRow = Math.min(size.rows - 1,
        Math.floor(area.bottomRight.y * zoomFactor * Document.invTileSize));
    
    
    
    
    
    //NOTE: following call kills performance
    
    
    //remove unused tiles
    var remainingTiles = this.removeInvisibleTiles(levelContainer, startRow, endRow, startCol, endCol);
    
    
    
    //check if there are no tiles anymore
    var offset = this.levelOffsets[zoomLevel];
    
    // Reset container its offset it it's empty.
    if (levelContainer.childNodes.length === 0)
    {
        offset.x = startCol * Document.tileSize;
        offset.y = startRow * Document.tileSize;
        
        this.levelOffsets[zoomLevel] = offset;
    }
    
    /*
    
    Build transformation matrix from the following transformations:
    
    translate(x2, y2) . scale(s) . rotate(r) . translate(x1, y1)
    
    =
    
    1  0  x2     s  0  0     cos r  -sin r  0     1  0  x1
    0  1  y2  .  0  s  0  .  sin r   cos r  0  .  0  1  y1
    0  0  1      0  0  1     0       0      1     0  0   1
    
    =
    
    s * cos r    s * -sin r    x1 * s * cos r + y1 * s * -sin r + x2
    s * sin r    s *  cos r    x1 * s * sin r + y1 * s *  cos r + y2
    0            0             1
    
    Legend:
    
    x1, y1: level offset
    r:      rotation
    s:      level scale
    x2, y2: scaled position
    
    */
    
    var scaledSin = levelScale * Math.sin(this.rotation);
    var scaledCos = levelScale * Math.cos(this.rotation);
    
    var x1 = this.levelOffsets[zoomLevel].x;
    var y1 = this.levelOffsets[zoomLevel].y;
    
    var x2 = this.position.x * -this.zoomFactor;
    var y2 = this.position.y * -this.zoomFactor;
    
    var matrix = [
        scaledCos, -scaledSin, x1 * scaledCos - y1 * scaledSin + x2,
        scaledSin,  scaledCos, x1 * scaledSin + y1 * scaledCos + y2
    ];
    
    if (hasTransforms)
    {
        var px = isFF ? 'px' : '';
        var temp = [matrix[0].toFixed(7), matrix[3].toFixed(7),
                    matrix[1].toFixed(7), matrix[4].toFixed(7),
                    matrix[2].toFixed(7) + px, matrix[5].toFixed(7) + px].join(',');
        var transform = 'matrix(' + temp + ')';
        
        levelContainer.style.transform       = transform;
        levelContainer.style.webkitTransform = transform;
        levelContainer.style.MozTransform    = transform;
        levelContainer.style.OTransform      = transform;
        levelContainer.style.msTransform     = transform;
    }
    else
    {
        levelContainer.style.left = matrix[2] + 'px';
        levelContainer.style.top  = matrix[5] + 'px';
    }
    
    //show container and set opacity
    if (!this.levelVisible[zoomLevel])
        levelContainer.style.display = '';
    
    //clear current timer
    if (this.levelTimers[zoomLevel] !== undefined)
    {
        clearTimeout(this.levelTimers[zoomLevel]);
        this.levelTimers[zoomLevel] = undefined;
    }
    
    //check whether to postpone updating tiles
    var zooming = !this.levelVisible[zoomLevel];
    if (mainLevel && !zooming)
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

//updates tiles of Document to position and level
Document.prototype.updateLevels = function(area)
{
    //ceil zoom level
    var ceiledZoomLevel  = Math.ceil(this.zoomLevel - 0.5);
    var ceiledZoomFactor = Math.pow(2, ceiledZoomLevel);
    
    //calculate scale of base layer
    var scale = this.zoomFactor / ceiledZoomFactor;
    
    var levelZeroScale = Math.pow(2, ceiledZoomLevel) * scale;
    
    //handle three main levels + minimal visible levels
    for (var i = 0; i <= Document.minLevelDisplay; i++)
    {
        if (this.levelContainers[i])
        {
            this.updateLevel(area, i, levelZeroScale * Math.pow(2, -i), true);
        }
    }
    if (ceiledZoomLevel > Document.minLevelDisplay)
    {
        this.updateLevel(area, ceiledZoomLevel,     scale,     true);
        this.updateLevel(area, ceiledZoomLevel - 1, scale * 2, false);
        this.updateLevel(area, ceiledZoomLevel - 2, scale * 4, false);
    }
    
    //hide all levels above current zoom level, show all level above it
    for (var i = 0; i < this.levelContainers.length; ++i)
    {
        var delta = ceiledZoomLevel - i;
        if ((delta < 0) || (delta >= 3) && this.levelVisible[i] && i > Document.minLevelDisplay)
        {
            var container = this.levelContainers[i];
            
            container.style.display = 'none';
            
            if (hasTransforms)
            {
                container.style.transform       = '';
                container.style.webkitTransform = '';
                container.style.MozTransform    = '';
                container.style.OTransform      = '';
                container.style.msTransform     = '';
            }
            else
            {
                container.style.left = '';
                container.style.top  = '';
            }
            
            this.levelVisible[i] = false;
        }
    }
}

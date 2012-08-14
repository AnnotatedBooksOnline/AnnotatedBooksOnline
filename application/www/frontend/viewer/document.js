/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Document class.
 */

// Class definition.
function Document()
{
    if (arguments.length)
        this.constructor.apply(this, arguments);
}

Document.prototype = new DomNode;
Document.base = DomNode.prototype;

// Fields.
Document.prototype.dimensions;
Document.prototype.maxZoomLevel;

Document.prototype.levelContainers;
Document.prototype.levelOffsets;
Document.prototype.levelSizes;
Document.prototype.levelVisible;
Document.prototype.levelTimers;
Document.prototype.levelTiles;

// Constants.
Document.tileSize    = 256;
Document.invTileSize = 1 / Document.tileSize;

// Constructor.
Document.prototype.constructor = function(width, height, zoomLevels, getImageUrl)
{
    // Set members.
    this.dimensions   = {width: width, height: height};
    this.maxZoomLevel = zoomLevels - 1;
    
    this.getImageUrl = getImageUrl;
    
    // Create DOM.
    Document.base.constructor.call(this, '<div class="document"></div>');
    
    // Initialize.
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
    // Set new zoom level and factors.
    this.zoomLevel    = zoomLevel;
    this.zoomFactor   = Math.pow(2, zoomLevel);
    this.invZoomLevel = 1 / this.zoomFactor;
    
    // Set new position and rotation.
    this.position = position;
    this.rotation = rotation;
    
    this.updateLevels(area);
}

/*
 * Private methods.
 */

Document.prototype.initialize = function()
{
    // Create level containers, hide them by default.
    this.levelSizes   = [];
    this.levelOffsets = [];
    this.levelVisible = [];
    this.levelTimers  = [];
    this.levelTiles   = [];
    for (var i = 0; i <= this.maxZoomLevel; ++i)
    {
        if (i === 0)
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
        this.levelVisible.push(i === 0);
        this.levelTimers.push(undefined);
        this.levelTiles.push({});
    }
    
    // Get level containers.
    this.levelContainers = $(".level", this.dom).get();
    
    // Set event listeners.
    this.dom.bind('selectstart', false);
    this.dom.bind('dragstart',   false);
}

Document.prototype.removeInvisibleTiles = function(zoomLevel, startRow, endRow, startCol, endCol)
{
    // Fetch visibile tiles.
    var tiles = this.levelTiles[zoomLevel];
    
    // Check whether each tile is visible.
    var removedTiles = [];
    for (var tile in tiles)
    {
        // Get parts from class.
        var parts = tile.split('_');
        var row   = parts[0];
        var col   = parts[1];
        
        // Check if image is outide document.
        if ((row < startRow) || (row > endRow) || (col < startCol) || (col > endCol))
        {
            removedTiles.push(tiles[tile]);
            
            delete tiles[tile];
        }
    }
    
    return removedTiles;
}

Document.prototype.deleteTiles = function(levelContainer, tiles)
{
    // Delete tiles from level container.
    for (var i = tiles.length - 1; i >= 0; --i)
    {
        levelContainer.removeChild(tiles[i]);
    }
}

Document.prototype.addVisibleTiles =
    function(levelContainer, zoomLevel, offset, startRow, endRow, startCol, endCol)
{
    // Fetch visibile tiles.
    var tiles = this.levelTiles[zoomLevel];
    
    // Create fragment to add DOM nodes to.
    var fragment = document.createDocumentFragment();
    
    // Add new tiles.
    for (var row = startRow; row <= endRow; ++row)
    {
        for (var col = startCol; col <= endCol; ++col)
        {
            if (tiles[row + '_' + col] === undefined)
            {
                // Calculate location of image.
                var x = col * Document.tileSize - offset.x;
                var y = row * Document.tileSize - offset.y;
                
                // Create image.
                var img = document.createElement('img');
                
                img.style.left = x + 'px';
                img.style.top  = y + 'px';
                
                img.src = this.getImageUrl(row, col, zoomLevel);
                
                // Add it to the fragment.
                fragment.appendChild(img);
                
                // Add it to tiles.
                tiles[row + '_' + col] = img;
            }
        }
    }
    
    levelContainer.appendChild(fragment);
}

Document.prototype.updateLevel = function(area, zoomLevel, zoomFactor, levelScale, mainLevel)
{
    // Get level container.
    var levelContainer = this.levelContainers[zoomLevel];
    if (!levelContainer)
    {
        return;
    }
    
    // Calculate needed row and column numbers.
    var size = this.levelSizes[zoomLevel];
    
    var startCol = Math.max(0, Math.floor(area.topLeft.x * zoomFactor * Document.invTileSize));
    var startRow = Math.max(0, Math.floor(area.topLeft.y * zoomFactor * Document.invTileSize));
    
    var endCol = Math.min(size.cols - 1,
        Math.floor(area.bottomRight.x * zoomFactor * Document.invTileSize));
    var endRow = Math.min(size.rows - 1,
        Math.floor(area.bottomRight.y * zoomFactor * Document.invTileSize));
    
    // Remove unused tiles.
    var removedTiles = this.removeInvisibleTiles(zoomLevel, startRow, endRow, startCol, endCol);
    
    // Check if there are no tiles anymore.
    var offset = this.levelOffsets[zoomLevel];
    
    // Reset container its offset it it's empty.
    if (this.levelTiles[zoomLevel].length === 0)
    {
        offset.x = startCol * Document.tileSize;
        offset.y = startRow * Document.tileSize;
        
        this.levelOffsets[zoomLevel] = offset;
    }
    
    /*
     * Build transformation matrix from the following transformations:
     * 
     * translate(x2, y2) . scale(s) . rotate(r) . translate(x1, y1)
     * 
     * =
     * 
     * 1  0  x2     s  0  0     cos r  -sin r  0     1  0  x1
     * 0  1  y2  .  0  s  0  .  sin r   cos r  0  .  0  1  y1
     * 0  0  1      0  0  1     0       0      1     0  0   1
     * 
     * =
     * 
     * s * cos r    s * -sin r    x1 * s * cos r + y1 * s * -sin r + x2
     * s * sin r    s *  cos r    x1 * s * sin r + y1 * s *  cos r + y2
     * 0            0             1
     * 
     * Legend:
     * 
     * x1, y1: level offset
     * r:      rotation
     * s:      level scale
     * x2, y2: scaled position
     * 
     */
    
    if (hasTransforms)
    {
        var x1 = offset.x;
        var y1 = offset.y;
        
        var x2 = this.position.x * -this.zoomFactor;
        var y2 = this.position.y * -this.zoomFactor;
        
        var transform;
        if (window.WebKitCSSMatrix !== undefined)
        {
            transform = new WebKitCSSMatrix();
            
            transform = transform.translate(x2, y2);
            transform = transform.scale(levelScale, levelScale);
            transform = transform.rotate(0, 0, this.rotation * (180 / Math.PI));
            transform = transform.translate(x1, y1);
            transform = transform.toString();
        }
        else
        {
            var scaledSin = levelScale * Math.sin(this.rotation);
            var scaledCos = levelScale * Math.cos(this.rotation);
            
            var matrix = [
                scaledCos, -scaledSin, x1 * scaledCos - y1 * scaledSin + x2,
                scaledSin,  scaledCos, x1 * scaledSin + y1 * scaledCos + y2
            ];
            
            var temp = [matrix[0].toFixed(7), matrix[3].toFixed(7),
                        matrix[1].toFixed(7), matrix[4].toFixed(7),
                        matrix[2].toFixed(7), matrix[5].toFixed(7)].join(',');
            transform = 'matrix(' + temp + ')';
        }
        
        levelContainer.style.transform       = transform;
        levelContainer.style.webkitTransform = transform;
        levelContainer.style.MozTransform    = transform;
        levelContainer.style.OTransform      = transform;
        levelContainer.style.msTransform     = transform;
    }
    else
    {
        levelContainer.style.left = (offset.x - this.position.x * this.zoomFactor) + 'px';
        levelContainer.style.top  = (offset.y - this.position.y * this.zoomFactor) + 'px';
    }
    
    // Show container and set opacity.
    if (!this.levelVisible[zoomLevel])
        levelContainer.style.display = '';
    
    // Clear current timer.
    if (this.levelTimers[zoomLevel] !== undefined)
    {
        clearTimeout(this.levelTimers[zoomLevel]);
        this.levelTimers[zoomLevel] = undefined;
    }
    
    // Check whether to postpone updating tiles.
    var zooming = !this.levelVisible[zoomLevel];
    if (mainLevel && !zooming)
    {
        // Add new tiles.
        this.addVisibleTiles(levelContainer, zoomLevel, offset, startRow, endRow, startCol, endCol);
    }
    else
    {
        // Set timer.
        var _this = this;
        this.levelTimers[zoomLevel] = setTimeout(
            function()
            {
                // Add new tiles.
                _this.addVisibleTiles(levelContainer, zoomLevel, offset, startRow, endRow, startCol, endCol);
            },
            100
        );
    }
    
    // Delete removed tiles.
    this.deleteTiles(levelContainer, removedTiles);
    
    // Set this level visible.
    this.levelVisible[zoomLevel] = true;
}

// Updates tiles of Document to position and level.
Document.prototype.updateLevels = function(area)
{
    // Ceil zoom level.
    var ceiledZoomLevel  = Math.ceil(this.zoomLevel - 0.5);
    var ceiledZoomFactor = Math.pow(2, ceiledZoomLevel);
    
    // Calculate scale of base layer.
    var scale = this.zoomFactor / ceiledZoomFactor;
    
    var levelZeroScale = ceiledZoomFactor * scale;
    
    // Handle three main levels.
    this.updateLevel(area, ceiledZoomLevel,     ceiledZoomFactor,        scale,     true);
    this.updateLevel(area, ceiledZoomLevel - 1, ceiledZoomFactor * 0.5,  scale * 2, false);
    this.updateLevel(area, ceiledZoomLevel - 2, ceiledZoomFactor * 0.25, scale * 4, false);
    
    // Hide all levels above except three main levels.
    for (var i = 0; i < this.levelContainers.length; ++i)
    {
        var delta = ceiledZoomLevel - i;
        if ((delta < 0) || (delta >= 3) && this.levelVisible[i])
        {
            var container = this.levelContainers[i];
            
            container.style.display = 'none';
            
            this.levelVisible[i] = false;
        }
    }
}


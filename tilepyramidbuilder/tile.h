/*
 * Tile class header.
 *
 */

#ifndef _TILE_H_
#define _TILE_H_

#include "common.h"

#include "tilepyramidbuilder.h"

/**
 * An object representing a tile in the image. Can either contain its raw image
 * data, or, when the tile is not atomic (tiles are atomic when their size is 1),
 * four subtiles. 
 * 
 * Whenever all four subtiles are complete and stored on disk as JPEG's, they
 * are combined and scaled to one new tile (of the same physical size). The raw
 * data of the component tiles is then immediately deallocated, greatly reducing
 * the amount of memory necessary.
 */
class Tile
{
public:
    ///Constructor. Recursively constructs subtiles until size == 1.
    Tile(Tile *parent, uint x, uint y, uint z, uint size) :
        done(false), x_pos(x), y_pos(y), z_pos(z), size(size)
    {
        if (size > 1)
        {
            uint csize = std::max(1u, size / 2);
            Tile *subtiles[] =
            {
                      new Tile(this, x        , y        , z + 1, csize),
                x + csize < max_x
                    ? new Tile(this, x + csize, y        , z + 1, csize)
                    : NULL,
                y + csize < max_y
                    ? new Tile(this, x        , y + csize, z + 1, csize)
                    : NULL,
                x + csize < max_x && y + csize < max_y
                    ? new Tile(this, x + csize, y + csize, z + 1, csize)
                    : NULL
            };
            
            std::copy(subtiles, subtiles + 4, data.subtiles);
        }
    }

    ///Destructor. Dealocates subtiles or image data.
    ~Tile()
    {
        if (done)
        {
            delete[] data.image;
        }
        else if (size > 1)
        {
            if (data.subtiles[0])
            {
                delete data.subtiles[0];
            }
            if (data.subtiles[1])
            {
                delete data.subtiles[1];
            }
            if (data.subtiles[2])
            {
                delete data.subtiles[2];
            }
            if (data.subtiles[3])
            {
                delete data.subtiles[3];
            }
        }
    }

    ///Processes a chunk
    void processImageChunk(uint y, image_t chunk);
    
private:
    //Creates and stores a JPEG from a raw image. data.image should be defined
    void flushImage();

    //Combines and scales four subtiles into a new image
    void scaleTilesToImage();
    
    //Scales to a subtile
    void scaleSubtile(uint from_x, uint from_y, uint width, uint height,
        rgb_t *image, rgb_t *output);
    
    //Calculates the average of four RGB pixels
    inline rgb_t average(const rgb_t &a, const rgb_t &b, const rgb_t &c, const rgb_t &d)
    {
        rgb_t average;
        
        average.r = (a.r + b.r + c.r + d.r) / 4;
        average.g = (a.g + b.g + c.g + d.g) / 4;
        average.b = (a.b + b.b + c.b + d.b) / 4;
        
        return average;
    }
    
    //If true, the raw image data of the tile is computed and flushed.
    bool done;

    //The content of the tile: either pointers to four subtiles, or a raw image.
    union
    {
        Tile *subtiles[4];
        rgb_t *image;
    } data;
    
    uint x_pos, //The column of the tile
         y_pos, //The row of the tile
         z_pos, //The zoom level of the tile, as indicated in the filename
         size;  //The number of atomic tiles contained
};

#endif /* _TILE_H_ */

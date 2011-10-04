/*
 * Tile pyramid builder class.
 *
 */

#include "tilepyramidbuilder.h"
#include "tile.h"
#include "jpeg.h"
#include "tiff.h"

using namespace std;

//Settings are stored in global variables for convenience:

//Tiles with coordinates above max_x or max_y lie outside of the image
//and therefore do not need to be part of the output.
uint max_y, max_x;

//The settings provided to processImage
BuilderSettings settings;

//The width in pixels of the buffer used to store scanlines
uint buf_width;

//Buffer for output images.
image_t output_buffer;

//The number of lines the input image has
uint num_lines;

TilePyramidBuilder::TilePyramidBuilder(const BuilderSettings &settings)
{
    //Check settings
    if(settings.output_quality < 0 || settings.output_quality > 100)
        throw invalid_argument("Illegal quality value.");
    if((settings.output_image_width & 1) == 1 || (settings.output_image_height & 1) == 1)
        throw invalid_argument("Dimensions of output image should be multiples of two.");

    //TODO: make local var
    ::settings = settings;
}

void TilePyramidBuilder::build(const string &filename)
{
    //Set globals
    output_buffer = new line_t[settings.output_image_height];

    try
    {
        //Create reader
        JPEGReader reader; /* TIFFReader reader; */
        
        reader.open(filename);
        
        const FileParameters info = reader.getParameters();
        
        buf_width = info.width;
        num_lines = info.height;

        //Prepare tile tree
        max_x = (info.width  - 1) / settings.output_image_width  + 1;
        max_y = (info.height - 1) / settings.output_image_height + 1;

        Tile root(NULL, 0, 0, 0, toNextPowerOfTwo(max(max_x, max_y)));

        //Prepare buffers that will be used to store scanlines
        image_t buffer = new line_t[settings.output_image_height];
        for(uint i = 0; i < settings.output_image_height; ++i)
            buffer[i] = new rgb_t[buf_width];
        
        //Keep feeding horizontal chunks of the image to the tile generator
        uint y;
        for(y = 0; y < max_y; ++y)
        {
            reader.readScanlines(buffer, settings.output_image_height);            

            //Process the chunk
            root.processImageChunk(y, buffer);
        }

        //Delete buffers
        for(uint i = 0; i < settings.output_image_height; ++i)
            delete[] buffer[i];
        delete[] buffer;
        delete output_buffer;

        reader.close();
    }
    catch(...)
    {
        //TODO
        throw;
    }
}

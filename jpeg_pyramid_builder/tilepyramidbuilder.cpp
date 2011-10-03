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
size_t max_y, max_x;

//The settings provided to processImage
BuilderSettings settings;
string output_prefix;

//The width in pixels of the buffer used to store scanlines
size_t buf_width;

//The shared compression object
ImageWriter *output;

//settings.padding_byte converted to a sample_t.
rgb_t padding;

//Buffer for output images.
image_t output_buffer;

//The number of lines the input image has
size_t num_lines;

//Helper function that gives the smallest power of two larger than or equal to x.
size_t toNextPowerOfTwo(size_t x)
{
    --x;
    x |= x >> 1;
    x |= x >> 2;
    x |= x >> 4;
    x |= x >> 8;
    x |= x >> 16;
    ++x;

    return x;
}

void processImage(const string &image_path, const string &output_pr,
    const BuilderSettings &sett)
{
    if(sett.output_quality < 0 || sett.output_quality > 100)
        throw invalid_argument("Illegal quality value.");
    if(sett.output_imgs_width % 2 == 1 || sett.output_imgs_height % 2 == 1)
        throw invalid_argument("Dimensions of output image should be multiples of two.");

    //Set globals
    settings = sett;
    output_prefix = output_pr;

    //Set decompressor
    ImageReader *input = new JPEGReader(); /* new TIFFReader(); */

    output_buffer = new line_t[settings.output_imgs_height];
    output = new JPEGWriter();

    try
    {
        input->open(image_path);
        
        const FileParameters info = input->getParameters();
        
        buf_width = info.width;
        num_lines = info.height;

        //Prepare tile tree
        max_x = (info.width  - 1) / settings.output_imgs_width  + 1;
        max_y = (info.height - 1) / settings.output_imgs_height + 1;

        Tile root(NULL, 0, 0, 0, toNextPowerOfTwo(max(max_x, max_y)));

        //Prepare buffers that will be used to store scanlines
        image_t buffer = new line_t[settings.output_imgs_height];
        for(size_t i = 0; i < settings.output_imgs_height; ++i)
            buffer[i] = new rgb_t[buf_width];

        //Keep feeding horizontal chunks of the image to the tile generator
        size_t y;
        for(y = 0; y < max_y; ++y)
        {
            input->readScanlines(buffer, settings.output_imgs_height);            

            //Process the chunk
            root.processImageChunk(y, buffer);
        }

        //Delete buffers
        for(size_t i = 0; i < settings.output_imgs_height; ++i)
            delete[] buffer[i];
        delete[] buffer;
        delete output_buffer;

        input->close();

        delete output;
        delete input;
    }
    catch(...)
    {
        //TODO
        throw;
    }
}

#include "pyramid_builder.h"

#include <jpeglib.h>
#include <cstdio>
#include <stdexcept>
#include <cmath>
#include <sstream>
#include <cassert>
#include <iostream>
#include <cstring>

using namespace std;

//Settings are stored in global variables for convenience:

//Tiles with coordinates above max_x or max_y lie outside of the image
//and therefore do not need to be part of the output.
size_t max_y, max_x;

//The settings provided to processImage
BuilderSettings settings;
string output_prefix;

//The width in bytes of the buffer used to store scanlines retrieved by libjpeg
size_t buf_width;

//The standard error handler of libjpeg. When an error occurs, a message is
//written to stdout and the program is terminated by a call to exit().
//TODO: Custom error handler that throws exceptions.
jpeg_error_mgr jerr;

//The shared compression object
jpeg_compress_struct cinfo;

//settings.padding_byte converted to a JSAMPLE.
JSAMPLE padding_byte;

//Buffer for output images.
JSAMPARRAY output_buffer;


/*
 * An object representing a tile in the image. Can either contain its raw image
 * data, or, when the tile is not atomic (tiles are atomic when their size is 1),
 * four subtiles. 
 * 
 * Whenever all four subtiles are complete and stored on disk as JPEG's, they
 * are combined and scaled to one new tile (of the same physical size). The raw
 * data of the component tiles is then immediately deallocated, greatly reducing
 * the amount of memory necessary.
 */
struct Tile
{

private:
    //If true, the raw image data of the tile is computed and flushed.
    bool done;

    //The content of the tile: either pointers to four subtiles, or a raw image.
    union
    {
        Tile * subtiles [4];
        JSAMPLE * image;
    } data;
    
    size_t x_pos, //The column of the tile
           y_pos, //The row of the tile
           z_pos, //The zoom level of the tile, as indicated in the filename
           size;  //The number of atomic tiles contained

    //Creates and stores a JPEG from a raw image. data.image should be defined
    void flushImage()
    {
        //Tiles outside image should no longer occur.
        assert(y_pos < max_y && x_pos < max_x);

        FILE * ofile = NULL;
        try
        {
            //Determine file name
            ostringstream ofilename;
            ofilename << output_prefix << '_';
            switch(settings.filename_convention)
            {
                case BuilderSettings::PREFIX_X_Y_Z_JPG:
                    ofilename << x_pos << '_' << y_pos <<'_'
                              << z_pos << ".jpg";
                    break;
                case BuilderSettings::PREFIX_Z_X_Y_JPG:
                    ofilename << z_pos << '_' << x_pos <<'_'
                              << y_pos << ".jpg";
                    break;
            }
            
            //Specify JPEG settings
            ofile = fopen(ofilename.str().c_str(), "wb");
            if(!ofile)
                throw runtime_error("Can't open output file " + ofilename.str());
            jpeg_stdio_dest(&cinfo, ofile);

            //Start writing data, row by row
            jpeg_start_compress(&cinfo, TRUE);
            size_t w = settings.output_imgs_width * 3;
            while(cinfo.next_scanline < cinfo.image_height)
            {
                size_t lines = 0;
                for (size_t i = cinfo.next_scanline; i < settings.output_imgs_height; ++i, ++lines)
                     output_buffer[i] = &data.image[w * (cinfo.next_scanline+i)];
                jpeg_write_scanlines(&cinfo, output_buffer, lines);
            }

            //Finalize compression
            jpeg_finish_compress(&cinfo);
            fclose(ofile);
            
            clog << ofilename.str() << " OK!" << endl;
        }
        catch(...)
        {
            if(ofile)
                fclose(ofile);
            throw;
        }
    }

    //Combines and scales four subtiles into a new image
    void scaleTilesToImage()
    {
        assert(!done);

        const size_t w = settings.output_imgs_width * 3,
                     h = settings.output_imgs_height;
        JSAMPLE * img0 = data.subtiles[0] ? data.subtiles[0]->data.image : NULL,
                * img1 = data.subtiles[1] ? data.subtiles[1]->data.image : NULL,
                * img2 = data.subtiles[2] ? data.subtiles[2]->data.image : NULL,
                * img3 = data.subtiles[3] ? data.subtiles[3]->data.image : NULL,
                * output = new JSAMPLE[w * h];

        //Because the size of the subtiles is exactly halved, scaling can
        //be easily accomplished by bilinear interpolation, which in this
        //case is simply taking the average of four pixel values.

        //Convenient macro to avoid repetition
#define _SCALE_SUB_IMG(fromx, fromy, img)                              \
        if(img)                                                        \
        {                                                              \
            for(size_t y = 0; y < h / 2; ++y)                          \
            for(size_t x = 0; x < w / 2; x += 3)                       \
            for(size_t i = 0; i < 3; ++i)                              \
            {                                                          \
               JSAMPLE * curr = &img[w * y * 2 + (2 * x) + i];         \
               unsigned int sampsum = curr[0] + curr[3]                \
                                    + curr[w] + curr[w + 3];           \
               output[(fromy + y) * w + fromx + x + i] =               \
                                    static_cast<JSAMPLE>(sampsum / 4); \
            }                                                          \
        }                                                              \
        else                                                           \
        {                                                              \
            for(size_t y = 0; y < h / 2; ++y)                          \
            for(size_t x = 0; x < w / 2; ++x)                          \
                output[(fromy + y) * w + fromx + x] =                  \
                        static_cast<JSAMPLE>(settings.padding_byte);   \
        }

        _SCALE_SUB_IMG(0    , 0    , img0);
        _SCALE_SUB_IMG(w / 2, 0    , img1);
        _SCALE_SUB_IMG(0    , h / 2, img2);
        _SCALE_SUB_IMG(w / 2, h / 2, img3);

#undef _SCALE_SUB_IMG

        //The new tile is defined, so the old ones can be deleted
        if(data.subtiles[0])
            delete data.subtiles[0];
        if(data.subtiles[1])
            delete data.subtiles[1];
        if(data.subtiles[2])
            delete data.subtiles[2];
        if(data.subtiles[3])
            delete data.subtiles[3];

        data.image = output;
    }

public:

    //Constructor. Recursively constructs subtiles until size == 1.
    Tile(Tile * parent, size_t x, size_t y, size_t z, size_t size)
                    : done(false), x_pos(x), y_pos(y), z_pos(z), size(size)
    {
        if(size > 1)
        {
            size_t csize = max((size_t)1u, size / 2);
            Tile * subtiles [] =
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
            copy(subtiles, subtiles + 4, data.subtiles);
        }
    }

    //Destructor. Dealocates subtiles or image data.
    ~Tile()
    {
        if(done)
        {
            delete[] data.image;
        }
        else if(size > 1)
        {
            if(data.subtiles[0])
                delete data.subtiles[0];
            if(data.subtiles[1])
                delete data.subtiles[1];
            if(data.subtiles[2])
                delete data.subtiles[2];
            if(data.subtiles[3])
                delete data.subtiles[3];
        }
    }

    /*
     * Processes a 'chunk' of the input image. A cunk being a piece of the image
     * as high as a single tile. Since JPEG's are encoded per scaline, the
     * chunks are still just as wide as the input image. This results in wider
     * input images requiring more memory to process while height has no effect
     * on maximal memory consumption.
     *
     * The argument y indicates the y-coordinate of the atomic tiles that fit in
     * this chunk.
     */
    void processImageChunk(size_t y, JSAMPARRAY chunk)
    {
        assert(!done);

        const size_t w = settings.output_imgs_width * 3,
                     h = settings.output_imgs_height;

        //If atomic, store and flush data.
        if(size == 1)
        {
            assert(y == y_pos);

            data.image = new JSAMPLE[w * h];
            const size_t chunkx = x_pos * w;
            for(size_t iy = 0; iy < h; ++iy)
            {
                if (chunkx + w <= buf_width)
                {
                    memcpy(&data.image[iy * w], &chunk[iy][chunkx], w * sizeof(JSAMPLE));
                }
                else if (chunkx < buf_width)
                {
                    memcpy(&data.image[iy * w], &chunk[iy][chunkx], (buf_width - chunkx) * sizeof(JSAMPLE));
                    memset(&data.image[iy * w + buf_width - chunkx], padding_byte, (w + chunkx - buf_width) * sizeof(JSAMPLE));
                }
                else
                {
                    // This should no longer happen, as it indicates a problem with tile pruning
                    assert(false);
                }
            }

            flushImage();
            done = true;

            return;
        }

        //If composed, recursively call processImageChunk on either the top two
        //or bottom two subtiles, depending on the y coordinate.
        if(y < y_pos + size / 2)
        {
            if(data.subtiles[0])
                data.subtiles[0]->processImageChunk(y, chunk);
            if(data.subtiles[1])
                data.subtiles[1]->processImageChunk(y, chunk);
        }
        else
        {
            if(data.subtiles[2])
                data.subtiles[2]->processImageChunk(y, chunk);
            if(data.subtiles[3])
                data.subtiles[3]->processImageChunk(y, chunk);
        }

        //If all subtiles are computed, compose and scale them. The flush the
        //result.
        if((!data.subtiles[0] || data.subtiles[0]->done) &&
           (!data.subtiles[1] || data.subtiles[1]->done) &&
           (!data.subtiles[2] || data.subtiles[2]->done) &&
           (!data.subtiles[3] || data.subtiles[3]->done))
        {
            scaleTilesToImage();
            flushImage();
            done = true;
        }
    }
};

//Helper function that gives the smallest power of two larger than or equal to x.
size_t toPow2(size_t x)
{
    //Looking at the first 1-bit of x would be faster, but this is simpler and
    //more portable.
    size_t r = 1;
    while(r < x)
        r *= 2;
    return r;
}

void processImage(const string & image_path, const string & output_pr,
                    const BuilderSettings & sett)
{
    if(sett.output_quality < 0 || sett.output_quality > 100)
        throw invalid_argument("Illegal quality value.");
    if(sett.output_imgs_width % 2 == 1 || sett.output_imgs_height % 2 == 1)
        throw invalid_argument("Dimensions of output image should be multiples of two.");

    //Set globals
    settings = sett;
    output_prefix = output_pr;

    //Initialize the compressor object
    jpeg_create_compress(&cinfo);
    cinfo.err = jpeg_std_error(&jerr);
    cinfo.input_components = 3;
    cinfo.in_color_space = JCS_RGB;
    jpeg_set_defaults(&cinfo);
    jpeg_set_quality(&cinfo, settings.output_quality, TRUE);
    cinfo.optimize_coding = TRUE; // Set only after jpeg_set_defaults()
    cinfo.image_width = settings.output_imgs_width;
    cinfo.image_height = settings.output_imgs_height;


    //Set decompressor
    jpeg_decompress_struct decinfo;
    decinfo.err = jpeg_std_error(&jerr);
    padding_byte = static_cast<JSAMPLE>(settings.padding_byte);
    output_buffer = new JSAMPROW [settings.output_imgs_height];

    FILE * ifile = NULL;
    try
    {
        //Initialise decompression object
        ifile = fopen(image_path.c_str(), "rb");
        if(!ifile)
            throw runtime_error("Failed opening input file.");

        jpeg_create_decompress(&decinfo);
        jpeg_stdio_src(&decinfo, ifile);
        jpeg_read_header(&decinfo, TRUE);
        decinfo.output_components = 3; //TODO: Make this a setting
        decinfo.out_color_space = JCS_RGB;

        jpeg_start_decompress(&decinfo);        

        assert(decinfo.output_components == 3);
        buf_width = decinfo.output_width * 3;

        //Prepare tile tree
        max_x = ((decinfo.output_width - 1)
                         / settings.output_imgs_width + 1);
        max_y = ((decinfo.output_height - 1)
                         / settings.output_imgs_height + 1);

        Tile root (NULL, 0, 0, 0, toPow2(max(max_x,max_y)));

        //Prepare buffers that will be used to store scanlines
        JSAMPARRAY buffer = new JSAMPROW[settings.output_imgs_height];
        for(size_t i = 0; i < settings.output_imgs_height; ++i)
            buffer[i] = new JSAMPLE[buf_width];

        //Keep feeding horizontal chunks of the image to the tile generator
        size_t y;
        bool stop = false;
        for(y = 0; y < max_y; ++y)
        {
            size_t lines = 0;
            while(lines < settings.output_imgs_height)
            {
                if(!stop)
                    lines += jpeg_read_scanlines(&decinfo, & buffer[lines], 
                                        settings.output_imgs_height - lines);
                if(decinfo.output_scanline == decinfo.output_height)
                {
                    //Pad buffer because end of file reached
                    for(; lines < settings.output_imgs_height; ++lines)
                    {
                        fill(buffer[lines], buffer[lines]
                         + buf_width * sizeof(JSAMPLE), padding_byte);
                    }
                    stop = true;
                    break;
                }
            }

            //Process the chunk
            root.processImageChunk(y, buffer);
        }

        //If neccessary, continue by appending padding chunks
        if(y < max_y)
        {
            for(size_t i = 0; i < settings.output_imgs_height; ++i)
                fill(buffer[i], buffer[i] + buf_width * sizeof(JSAMPLE),
                     padding_byte);
        }
        while(y < max_y)
        {
            root.processImageChunk(y++, buffer);
        }

        //Delete buffers and finalize compression
        for(size_t i = 0; i < settings.output_imgs_height; ++i)
            delete[] buffer[i];
        delete[] buffer;
        delete output_buffer;
        jpeg_destroy_decompress(&decinfo);
        fclose(ifile);
        jpeg_destroy_compress(&cinfo);
    }
    catch(...)
    {
        if(ifile)
            fclose(ifile);
        throw;
    }
}


/*
 * Tile pyramid builder class.
 *
 */

#include "tilepyramidbuilder.h"
#include "tile.h"

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
    if(sett.output_imgs_width & 1 == 1 || sett.output_imgs_height & 1 == 1)
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

    FILE *ifile = NULL;
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
        num_lines = decinfo.output_height;

        //Prepare tile tree
        max_x = (decinfo.output_width  - 1) / settings.output_imgs_width  + 1;
        max_y = (decinfo.output_height - 1) / settings.output_imgs_height + 1;

        Tile root(NULL, 0, 0, 0, toNextPowerOfTwo(max(max_x,max_y)));

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
                    lines += jpeg_read_scanlines(&decinfo, &buffer[lines], 
                        settings.output_imgs_height - lines);
                
                if(decinfo.output_scanline == decinfo.output_height)
                {
                    //Pad buffer because end of file reached
                    for(; lines < settings.output_imgs_height; ++lines)
                    {
                        fill(buffer[lines], buffer[lines] +
                            buf_width * sizeof(JSAMPLE), padding_byte);
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
            
            while(y < max_y)
            {
                root.processImageChunk(y++, buffer);
            }
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

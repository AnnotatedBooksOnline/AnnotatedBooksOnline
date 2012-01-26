/*
 * Tile class.
 *
 */

#include "tile.h"

#include "jpeg.h"

using namespace std;

//Creates and stores a compressed image from a raw image. data.image should be defined
void Tile::flushImage()
{
    //Tiles outside image should no longer occur.
    assert(y_pos < max_y && x_pos < max_x);

    try
    {
        //Determine logical position
        int depth = (int) ceil(log2(max(max_x, max_y)));
        
        uint real_x = x_pos >> (depth - z_pos);
        uint real_y = y_pos >> (depth - z_pos);
        
        //Determine file name, replace placeholders
        string filename = settings.output_path + '/' + settings.output_filename;
        
        replace(filename, "%x", toString(real_x));
        replace(filename, "%y", toString(real_y));
        replace(filename, "%z", toString(z_pos));
        replace(filename, "%e", "jpg"); //TODO: For now, should be output extension
        replace(filename, "%f", "tile"); //TODO: For now, should be filename without extension
        
        //Create writer parameters
        FileParameters params(settings.output_image_width, settings.output_image_height);
        
        //Check if we should pad the image
        uint right  = (x_pos + size) * settings.output_image_width;
        uint bottom = (y_pos + size) * settings.output_image_height;
        if (!settings.use_padding && (right > buf_width || bottom > num_lines))
        {
            if (right > buf_width)
            {
                params.width = settings.output_image_width - ((right - buf_width) >> (depth - z_pos));
            }
            
            if (bottom > num_lines)
            {
                params.height = settings.output_image_height - ((bottom - num_lines) >> (depth - z_pos));
            }
            
            assert(params.width <= settings.output_image_width && params.height <= settings.output_image_height);
        }
        
        //Create an image writer from params
        JPEGWriter writer(params);
        
        //Open the file to write and initialize the compressor
        writer.open(filename);

        //Write data
        for (uint i = 0; i < params.height; ++i)
        {
            output_buffer[i] = &data.image[i * settings.output_image_width];
        }
        
        writer.writeScanlines(output_buffer, params.height);

        //Finalize compression
        writer.close();
        
#ifdef DEBUG
        clog << ofilename.str() << " OK!" << endl;
#endif
    }
    catch(...)
    {
        //TODO
        throw;
    }
}

//Combines and scales four subtiles into a new image
void Tile::scaleTilesToImage()
{
    assert(!done);

    const uint width  = settings.output_image_width,
               height = settings.output_image_height;
    
    rgb_t *img0   = data.subtiles[0] ? data.subtiles[0]->data.image : NULL,
          *img1   = data.subtiles[1] ? data.subtiles[1]->data.image : NULL,
          *img2   = data.subtiles[2] ? data.subtiles[2]->data.image : NULL,
          *img3   = data.subtiles[3] ? data.subtiles[3]->data.image : NULL,
          *output = new rgb_t[width * height];

    //Because the size of the subtiles is exactly halved, scaling can
    //be easily accomplished by bilinear interpolation, which in this
    //case is simply taking the average of four pixel values.
    scaleSubtile(0        , 0         , width, height, img0, output);
    scaleSubtile(width / 2, 0         , width, height, img1, output);
    scaleSubtile(0        , height / 2, width, height, img2, output);
    scaleSubtile(width / 2, height / 2, width, height, img3, output);

    //The new tile is defined, so the old ones can be deleted
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
    {
    if (data.subtiles[3])
        delete data.subtiles[3];
    }
    
    data.image = output;
}

//Scales a subtile
void Tile::scaleSubtile(uint from_x, uint from_y, uint width, uint height,
    rgb_t *image, rgb_t *output)
{
    if (image)
    {
        output += from_y * width + from_x;
        
        int start_y = height / 2 - 1;
        int start_x = width  / 2 - 1;
        
        for (int y = start_y; y >= 0; --y, image += width, output += width / 2)
        {
            for (int x = start_x; x >= 0; --x, image += 2, ++output)
            {
                *output = average(image[0], image[1], image[width], image[width + 1]);
            }
        }
    }
    else if (settings.use_padding)
    {
        output += from_y * width + from_x;
        
        int start_y = height / 2 - 1;
        int start_x = width  / 2 - 1;
        
        for(int y = start_y; y >= 0; --y, output += width / 2)
        {
            for(int x = start_x; x >= 0; --x, ++output)
            {
                *output = settings.padding_color;
            }
        }
    }
}

/*
 * Processes a 'chunk' of the input image. A cunk being a piece of the image
 * as high as a single tile. Since image files are encoded per scaline, the
 * chunks are still just as wide as the input image. This results in wider
 * input images requiring more memory to process while height has no effect
 * on maximal memory consumption.
 *
 * The argument y indicates the y-coordinate of the atomic tiles that fit in
 * this chunk.
 */
void Tile::processImageChunk(uint y, image_t chunk)
{
    assert(!done);

    const uint w = settings.output_image_width,
               h = settings.output_image_height;

    //If atomic, store and flush data.
    if(size == 1)
    {
        assert(y == y_pos);

        data.image = new rgb_t[w * h];
        const uint chunk_x = x_pos * w;
        for(uint iy = 0; iy < h; ++iy)
        {
            if (chunk_x + w <= buf_width)
            {
                memcpy(&data.image[iy * w], &chunk[iy][chunk_x], w * sizeof(rgb_t));
            }
            else if (chunk_x < buf_width)
            {
                memcpy(&data.image[iy * w], &chunk[iy][chunk_x], (buf_width - chunk_x) * sizeof(rgb_t));
                
                if (settings.use_padding)
                    fill(&data.image[iy * w + buf_width - chunk_x], &data.image[iy * w + w],
                        settings.padding_color);
            }
            else
            {
                //This should no longer happen, as it indicates a problem with tile pruning
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
        {
            data.subtiles[2]->processImageChunk(y, chunk);
        }
        if(data.subtiles[3])
        {
            data.subtiles[3]->processImageChunk(y, chunk);
        }
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

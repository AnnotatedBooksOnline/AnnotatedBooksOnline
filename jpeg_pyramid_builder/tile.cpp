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
        
        //Determine file name
        ostringstream ofilename;
        ofilename << output_prefix << '_';
        switch(settings.filename_convention)
        {
            case BuilderSettings::PREFIX_X_Y_Z_JPG:
                ofilename << real_x << '_' << real_y << '_' << z_pos << ".jpg";
                break;
                
            case BuilderSettings::PREFIX_Z_X_Y_JPG:
                ofilename << z_pos << '_' << real_x << '_' << real_y << ".jpg";
                break;
        }
        
        //Create writer parameters
        FileParameters params(settings.output_imgs_width, settings.output_imgs_height);
        
        //Check if we should pad the image
        uint right  = (x_pos + size) * settings.output_imgs_width;
        uint bottom = (y_pos + size) * settings.output_imgs_height;
        if (!settings.use_padding && (right > buf_width || bottom > num_lines))
        {
            if (right > buf_width)
                params.width = settings.output_imgs_width - ((right - buf_width) >> (depth - z_pos));
            
            if (bottom > num_lines)
                params.height = settings.output_imgs_height - ((bottom - num_lines) >> (depth - z_pos));
                
            assert(params.width <= settings.output_imgs_width && params.height <= settings.output_imgs_height);
        }
        
        //Create an image writer from params
        JPEGWriter writer(params);
        
        //Open the file to write and initialize the compressor
        writer.open(ofilename.str());

        //Write data
        uint w = settings.output_imgs_width;
        
        for (uint i = 0; i < params.height; ++i)
             output_buffer[i] = &data.image[i * w];
             
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

    const uint width  = settings.output_imgs_width,
               height = settings.output_imgs_height;
    
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

//Scales a subtile
void Tile::scaleSubtile(uint from_x, uint from_y, uint width, uint height,
    rgb_t *image, rgb_t *output)
{
    if(image)
    {
        rgb_t *current = image;
        
        output += from_y * width + from_x;
        
        int start_y = height / 2 - 1;
        int start_x = width  / 2 - 1;
        
        for(int y = start_y; y >= 0; --y, current += width, output += width / 2)
        {
            for(int x = start_x; x >= 0; --x, current += 2, ++output)
            {
                *output = average(current[0], current[1], current[width], current[width + 1]);
            }
        }
    }
    else
    {
        for(uint y = 0; y < height / 2; ++y)
        {
            for(uint x = 0; x < width / 2; ++x)
                output[(from_y + y) * width + from_x + x] = settings.padding;
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

    const uint w = settings.output_imgs_width,
               h = settings.output_imgs_height;

    //If atomic, store and flush data.
    if(size == 1)
    {
        assert(y == y_pos);

        data.image = new rgb_t[w * h];
        const uint chunkx = x_pos * w;
        for(uint iy = 0; iy < h; ++iy)
        {
            if (chunkx + w <= buf_width)
            {
                memcpy(&data.image[iy * w], &chunk[iy][chunkx], w * sizeof(rgb_t));
            }
            else if (chunkx < buf_width)
            {
                memcpy(&data.image[iy * w], &chunk[iy][chunkx], (buf_width - chunkx) * sizeof(rgb_t));
                fill(&data.image[iy * w + buf_width - chunkx], &data.image[iy * w + w], settings.padding);
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

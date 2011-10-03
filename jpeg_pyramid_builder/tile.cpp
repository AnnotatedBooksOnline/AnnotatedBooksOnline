/*
 * Tile class.
 *
 */

#include "tile.h"

using namespace std;

//Creates and stores a compressed image from a raw image. data.image should be defined
void Tile::flushImage()
{
    //Tiles outside image should no longer occur.
    assert(y_pos < max_y && x_pos < max_x);

    try
    {
        //Determine logical position
        size_t real_x, real_y;
        int depth = (int)ceil(log2(max(max_x, max_y)));
        real_x = x_pos >> (depth - z_pos);
        real_y = y_pos >> (depth - z_pos);
        
        //Determine file name
        ostringstream ofilename;
        ofilename << output_prefix << '_';
        switch(settings.filename_convention)
        {
            case BuilderSettings::PREFIX_X_Y_Z_JPG:
                ofilename << real_x << '_' << real_y <<'_'
                          << z_pos << ".jpg";
                break;
            case BuilderSettings::PREFIX_Z_X_Y_JPG:
                ofilename << z_pos << '_' << real_x <<'_'
                          << real_y << ".jpg";
                break;
        }
        
        // Set the output parameters
	FileParameters params (settings.output_imgs_width,
                               settings.output_imgs_height);
		            
        size_t w = settings.output_imgs_width;

        //Check if we should pad the image
        size_t right = (x_pos + size) * settings.output_imgs_width;
        size_t bottom = (y_pos + size) * settings.output_imgs_height;
        if (!settings.use_padding && (right > buf_width || bottom > num_lines))
        {
            if (right > buf_width)
                params.width = settings.output_imgs_width - ((right - buf_width) >> (depth - z_pos));
            if (bottom > num_lines)
                params.height = settings.output_imgs_height - ((bottom - num_lines) >> (depth - z_pos));
                
            assert(params.width <= settings.output_imgs_width && params.height <= settings.output_imgs_height);
        }
        
        output->set_parameters(params);
        
        //Open the file to write and initialize the compressor
		output->open_file(ofilename.str());

        //Start writing data
        
        for (size_t i = 0; i < params.height; ++i)
             output_buffer[i] = &data.image[i * w];
             
        output->write_scanlines(output_buffer, params.height);

        //Finalize compression
        output->close_file();
        
        clog << ofilename.str() << " OK!" << endl;
    }
    catch(...)
    {
        // TODO
        throw;
    }
}
    
//Combines and scales four subtiles into a new image
void Tile::scaleTilesToImage()
{
    assert(!done);

    const size_t w   = settings.output_imgs_width,
                 h   = settings.output_imgs_height;
    rgb_t    *img0   = data.subtiles[0] ? data.subtiles[0]->data.image : NULL,
             *img1   = data.subtiles[1] ? data.subtiles[1]->data.image : NULL,
             *img2   = data.subtiles[2] ? data.subtiles[2]->data.image : NULL,
             *img3   = data.subtiles[3] ? data.subtiles[3]->data.image : NULL,
             *output = new rgb_t[w * h];

    //Because the size of the subtiles is exactly halved, scaling can
    //be easily accomplished by bilinear interpolation, which in this
    //case is simply taking the average of four pixel values.

    //Convenient macro to avoid repetition
#define _SCALE_SUB_IMG(fromx, fromy, img)                              \
    if(img)                                                        \
    {                                                              \
        for(size_t y = 0; y < h / 2; ++y)                          \
        for(size_t x = 0; x < w / 2; ++x)                          \
        {                                                          \
        	rgb_t * curr = &img[w * y * 2 + (2 * x)];              \
        	output[(fromy + y) * w + fromx + x] =                  \
        		avg(curr[0], curr[1], curr[w], curr[w + 1]);       \
        }                                                          \
    }                                                              \
    else                                                           \
    {                                                              \
        for(size_t y = 0; y < h / 2; ++y)                          \
        for(size_t x = 0; x < w / 2; ++x)                          \
            output[(fromy + y) * w + fromx + x] = settings.padding;\
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
void Tile::processImageChunk(size_t y, image_t chunk)
{
    assert(!done);

    const size_t w = settings.output_imgs_width,
                 h = settings.output_imgs_height;

    //If atomic, store and flush data.
    if(size == 1)
    {
        assert(y == y_pos);

        data.image = new rgb_t[w * h];
        const size_t chunkx = x_pos * w;
        for(size_t iy = 0; iy < h; ++iy)
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

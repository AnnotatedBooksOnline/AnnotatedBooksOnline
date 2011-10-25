/*
 * Tile pyramid builder class header.
 *
 */

#ifndef _TILEPYRAMIDBUILDER_H_
#define _TILEPYRAMIDBUILDER_H_

#include "common.h"

struct BuilderSettings
{
    /**
     * Dimensions of the output images.
     * Image not on the bottom level are scaled to fit within these dimensions.
     *
     * If dividing these dimensions by those of the input image does not yield a
     * powers of 2, the complete image and parts near edges are padded with
     * a single color.
     */
    uint output_image_width, output_image_height;
    
    /**
     * Output path. May contain placeholders.
     */
    std::string output_path;
    
    /**
     * Output filename. May contain placeholders.
     */
    std::string output_filename;
    
    /**
     * An integer between 0 and 100 indicating the quality of the output images.
     * 
     * Only applicable on lossy compression
     */
    uint output_quality;

    //TODO: More settings regarding properties of output image.
    
    /**
     * Whether or not to use padding at all. When true, images that do not fill
     * a whole tile will be padded with padding_byte. When false, images will
     * be cut to size.
     */
    bool use_padding;

    /**
     * The color used for padding.
     */
    rgb_t padding_color;
    
    /**
     * The kind of input to expect
     */
    enum
    {
    	JPEG_INPUT,
    	TIFF_INPUT,
    	AUTO_INPUT
    } input_type;
};

/**
 * The default builder settings.
 */
const BuilderSettings DEFAULT_BUILDER_SETTINGS =
{
    256,                                //output image width
    256,                                //output image height
    ".",                                //output path
    "tile_%z_%x_%y.%e",                 //output filename
    60,                                 //output quality
    false,                              //use padding
    {{{0x00, 0x00, 0x00}}}                //padding color
};

class TilePyramidBuilder
{
public:
    /**
     * Creates a tile pyramid builder.
     *
     * @param settings The settings of the pyramid builder.
     */
    TilePyramidBuilder(const BuilderSettings &settings = DEFAULT_BUILDER_SETTINGS);
    
    /**
     * Processes the image with the given path.
     *
     * @param filename The path of the image, as an ACII string.
     */
    void build(const std::string &filename);

private:
    //Helper function that gives the smallest power of two larger than or equal to x.
    uint toNextPowerOfTwo(uint x)
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
};

//TODO: make all of these members


//Tiles with coordinates above max_x or max_y lie outside of the image
//and therefore do not need to be part of the output.
extern uint max_y, max_x;

//The settings provided to processImage
extern BuilderSettings settings;

//The width in pixels of the buffer used to store scanlines
extern uint buf_width;

//Buffer for output images.
extern image_t output_buffer;

//The number of lines the input image has
extern uint num_lines;




#endif /* _TILEPYRAMIDBUILDER_H_ */

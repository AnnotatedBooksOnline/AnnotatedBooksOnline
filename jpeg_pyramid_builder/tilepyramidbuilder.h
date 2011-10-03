/*
 * Tile pyramid builder class header.
 *
 */

#ifndef _TILEPYRAMIDBUILDER_H_
#define	_TILEPYRAMIDBUILDER_H_

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
    size_t output_imgs_width, output_imgs_height;
    
    /**
     * An integer between 0 and 100 indicating the quality of the output images.
     * 
     * This value is used with the jpeg_set_quality function from libjpeg.
     */
    int output_quality;

    /**
     * The naming convention used for output files. 
     * 
     * x and y indicate the coordinates of the upper-left smallest tile, in
     * the range (0 .. number of tiles in column/row - 1).
     *
     * z indicates the zoom level. 0 is the highest level, showing the entire
     * image. It increments by one every time the zoom factor is doubled.
     */
    enum
    {
        PREFIX_X_Y_Z_JPG, //prefix_x_y_z.jpg
        PREFIX_Z_X_Y_JPG  //prefix_z_x_y.jpg
    } filename_convention;

    /**
     * The value of the byte that is appended to tiles that partially lie
     * outside of the image. The color of the pixels there will be the RGB value
     * of three padding bytes (e.g. a padding_byte of 0 will result in black
     * and one of 255 will result in white).
     */
    unsigned char padding_byte;
    
    /**
     * Whether or not to use padding at all. When TRUE, images that do not fill
     * a whole tile will be padded with padding_byte. When FALSE, images will
     * be cut to size.
     */
    bool use_padding;

    //TODO: More settings regarding properties of output image.
};

/**
 * The default builder settings.
 */
const BuilderSettings DEFAULT_BUILDER_SETTINGS =
{
    256,                                //output_imgs_width
    256,                                //output_imgs_height
    80,                                 //output_quality
    BuilderSettings::PREFIX_X_Y_Z_JPG,  //filename_convention
    '\0',                               //padding_byte
    0                                   //use_padding
};

/**
 * Processes the image with the given path.
 *
 * @param image_path The path of the image, as an ACII/UTF-8 string.
 * @param output_prefix The prefix of the paths of all output files.
 * @param settings The settings of the pyramid builder.
 */
void processImage(const std::string &image_path, const std::string &output_prefix,
    const BuilderSettings &settings = DEFAULT_BUILDER_SETTINGS);

//Tiles with coordinates above max_x or max_y lie outside of the image
//and therefore do not need to be part of the output.
extern size_t max_y, max_x;

//The settings provided to processImage
extern BuilderSettings settings;
extern string output_prefix;

//The width in bytes of the buffer used to store scanlines retrieved by libjpeg
extern size_t buf_width;

//The standard error handler of libjpeg. When an error occurs, a message is
//written to stdout and the program is terminated by a call to exit().
//TODO: Custom error handler that throws exceptions.
extern jpeg_error_mgr jerr;

//The shared compression object
extern jpeg_compress_struct cinfo;

//settings.padding_byte converted to a JSAMPLE.
extern JSAMPLE padding_byte;

//Buffer for output images.
extern JSAMPARRAY output_buffer;

//The number of lines the input image has
extern size_t num_lines;

#endif /* _TILEPYRAMIDBUILDER_H_ */

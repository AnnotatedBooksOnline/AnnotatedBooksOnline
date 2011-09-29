#ifndef JPEG_PYRAMID_BUILDER_H
#define	JPEG_PYRAMID_BUILDER_H

#include <string>

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
    '\0'                                //padding_byte
};

/**
 * Processes the image with the given path.
 *
 * @param image_path The path of the image, as an ACII/UTF-8 string.
 * @param output_prefix The prefix of the paths of all output files.
 * @param settings The settings of the pyramid builder.
 */
void processImage(const std::string & image_path, const std::string & output_prefix,
                     const BuilderSettings & settings = DEFAULT_BUILDER_SETTINGS);


#endif	/* JPEG_PYRAMID_BUILDER_H */


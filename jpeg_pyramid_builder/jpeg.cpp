/*
 * The JPEG compressor and decompressor.
 *
 */

#include "jpeg.h"
#include "tilepyramidbuilder.h"

using namespace std;

JPEGReader::JPEGReader()
{
    initialized = false;
    file = NULL;
    decinfo.err = jpeg_std_error(&jerr);
    jpeg_create_decompress(&decinfo);
}

JPEGReader::~JPEGReader()
{
    if (file)
        close();
    
    jpeg_destroy_decompress(&decinfo);
}

void JPEGReader::open(const string &name)
{
    assert(!file);
    
    //Open the file
    file = fopen(name.c_str(), "rb");
    if(!file)
    {
        throw runtime_error("Failed opening input file.");
    }
    
    //Initialise the compression object
    jpeg_stdio_src(&decinfo, file);
    jpeg_read_header(&decinfo, TRUE);
    
    //Make sure we use RGB values
    decinfo.output_components = 3;
    decinfo.out_color_space = JCS_RGB;
    jpeg_start_decompress(&decinfo);
}

void JPEGReader::readScanlines(image_t buf, uint lines)
{
    assert(file);
    
    uint l = 0;
    while(l < lines)
    {
        if(decinfo.output_scanline == decinfo.output_height)
        {
            fill(buf[l], buf[l] + decinfo.output_width, settings.padding);
            l++;
        }
        else
        {
            l += jpeg_read_scanlines(&decinfo, (JSAMPARRAY) &buf[l], lines - l);
        }
    }
}

void JPEGReader::close()
{
    assert(file);
    fclose(file);
    
    file = NULL;
}

const FileParameters JPEGReader::getParameters() const
{
    assert(file);
    
    FileParameters p(decinfo.output_width, decinfo.output_height);
    return p;
}

JPEGWriter::JPEGWriter(const FileParameters &params)
{
    file = NULL;

    jpeg_create_compress(&cinfo);
    cinfo.err = jpeg_std_error(&jerr);
    
    //Use RGB
    cinfo.input_components = 3;
    cinfo.in_color_space = JCS_RGB;
    
    jpeg_set_defaults(&cinfo);
    jpeg_set_quality(&cinfo, settings.output_quality, TRUE);
    cinfo.optimize_coding = TRUE; //Set only after jpeg_set_defaults()
    cinfo.image_width = 0;
    cinfo.image_height = 0;
    
    //Set parameters
    setParameters(params);
}

JPEGWriter::~JPEGWriter()
{
    if (file)
        close();
    jpeg_destroy_compress(&cinfo);
}

void JPEGWriter::open(const string &name)
{
    assert(!file);
    assert(cinfo.image_width > 0 && cinfo.image_height > 0);
    
    //Open the file
    file = fopen(name.c_str(), "wb");
    if(!file)
    {
        throw runtime_error("Failed opening output file " + name);
    }
    
    jpeg_stdio_dest(&cinfo, file);
    jpeg_start_compress(&cinfo, TRUE);
}

void JPEGWriter::writeScanlines(const image_t buf, uint lines)
{
    assert(file);

    uint l = 0;
    while(cinfo.next_scanline < cinfo.image_height)
    {
        l += jpeg_write_scanlines(&cinfo, (JSAMPARRAY) &buf[l], lines - l);
    }
}

void JPEGWriter::close()
{
    assert(file);
    
    jpeg_finish_compress(&cinfo);
    fclose(file);
        
    file = NULL;
}

void JPEGWriter::setParameters(const FileParameters &params)
{
    assert(!file);
    
    cinfo.image_width  = params.width;
    cinfo.image_height = params.height;
}

/*
 * The TIFF decompressor.
 */

#include "tiff.h"

#include "tilepyramidbuilder.h"

using namespace std;

TIFFReader::TIFFReader()
{
    file = NULL;
}

TIFFReader::~TIFFReader()
{
    if (file)
        close();
}

void TIFFReader::open(const string &name)
{
    assert(!file);
    
    //Open the file
    file = TIFFOpen(name.c_str(), "rb");
    if(!file)
    {
        throw runtime_error("Failed opening input file.");
    }
    
    //Get some useful information
    TIFFGetField(file, TIFFTAG_SAMPLESPERPIXEL, &components);
    TIFFGetField(file, TIFFTAG_IMAGELENGTH, &height);
    TIFFGetField(file, TIFFTAG_PLANARCONFIG, &config);
    
    //Information to check whether we can handle this kind of TIFF
    uint16 photometric;
    TIFFGetField(file, TIFFTAG_PHOTOMETRIC, &photometric);
    uint16 bitspersample;
    TIFFGetField(file, TIFFTAG_BITSPERSAMPLE, &bitspersample);
    
    if (photometric != PHOTOMETRIC_RGB || components != 3 || bitspersample != 8)
    {
        throw runtime_error("Cannot handle non 8-bit per sample RGB TIFF images.");
    }
    
    width = TIFFScanlineSize(file) / components;
    scanline = 0;
}

void TIFFReader::readScanlines(image_t buf, uint lines)
{
    assert(file);
    
    if (config == PLANARCONFIG_CONTIG)
    {
        for (uint row = scanline; row < scanline + lines; row++)
        {
            if(row >= height)
            {
                fill(buf[row - scanline], buf[row - scanline] + width, settings.padding_color);
            }
            else
            {
                TIFFReadScanline(file, (sample_t *) buf[row - scanline], row);
            }
        }
    }
    else if (config == PLANARCONFIG_SEPARATE)
    {
        throw runtime_error("Sorry, separate planar config not yet tested!"); //TODO
        
        for (uint row = scanline; row < scanline + lines; row++)
        {
            if(row >= height)
            {
                fill(buf[row - scanline], buf[row - scanline] + width, settings.padding_color);
            }
            else
            {
                for (uint s = 0; s < components; s++)
                {
                    TIFFReadScanline(file, (sample_t *) buf[row - scanline], row, s);
                }
            }
        }
    }
    
    scanline += lines;
}

void TIFFReader::close()
{
    assert(file);

    TIFFClose(file);    
    file = NULL;
}

const FileParameters TIFFReader::getParameters() const
{
    assert(file);
    
    FileParameters p(width, height);
    return p;
}

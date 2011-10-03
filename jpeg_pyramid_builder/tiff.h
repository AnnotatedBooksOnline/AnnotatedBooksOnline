/*
 * The TIFF decompressor.
 */

#ifndef _TIFF_H_
#define _TIFF_H_

#include "common.h"

#include "imagereaderwriter.h"
#include <tiffio.h>

class TIFFReader : public ImageReader
{
public:
    TIFFReader();
    ~TIFFReader();
    
    void open(const std::string &name);
    void readScanlines(image_t buf, size_t lines);
    void close();
    const FileParameters getParameters() const;
    
private:
    TIFF *file;
    uint32 width, height, config;
    uint16 components;
    size_t scanline;
};

#endif /* _TIFF_H_ */

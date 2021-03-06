/*
 * The JPEG compressor and decompressor.
 *
 */

#ifndef _JPEG_H_
#define _JPEG_H_

#include "common.h"

#include "imagereaderwriter.h"

extern "C" {
    #include <jpeglib.h>
}

class JPEGReader : public ImageReader
{
public:
    JPEGReader();
    ~JPEGReader();
    
    void open(const std::string &name);
    void readScanlines(image_t buf, uint lines);
    void close();
    const FileParameters getParameters() const;
    
private:
    FILE *file;
    
    jpeg_decompress_struct decinfo;
    jpeg_error_mgr jerr;
    
    bool initialized;
};

class JPEGWriter : public ImageWriter
{
public:
    JPEGWriter(const FileParameters &params);
    ~JPEGWriter();
    
    void open(const std::string &name);
    void writeScanlines(const image_t buf, uint lines);
    void close();
    void setParameters(const FileParameters &params);
    
private:
    FILE *file;
    
    jpeg_error_mgr jerr;
    
    bool initialized;
    
    jpeg_compress_struct cinfo;
};

#endif /* _JPEG_H_ */


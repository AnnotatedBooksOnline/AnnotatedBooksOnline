/*
 * The JPEG compressor and decompressor.
 *
 */

#ifndef _JPEG_H_
#define _JPEG_H_

#include "common.h"

#include <jpeglib.h>

class JPEGReader : public InputMethod
{
public:
	JPEGReader();
	~JPEGReader();
	
	void open_file(const std::string & name);
	void read_scanlines(image_t buf, size_t lines);
	void close_file();
	const FileParameters get_parameters() const;
    
private:
	FILE *file;
	jpeg_decompress_struct decinfo;
	jpeg_error_mgr jerr;
	bool initialized;
};

class JPEGWriter : public OutputMethod
{
public:
	JPEGWriter();
	~JPEGWriter();
	
	void open_file(const std::string & name);
	void write_scanlines(const image_t buf, size_t lines);
	void close_file();
	void set_parameters(const FileParameters & params);
    
private:
	FILE *file;
	jpeg_compress_struct cinfo;
	jpeg_error_mgr jerr;
	bool initialized;
};

#endif /* _JPEG_H_ */


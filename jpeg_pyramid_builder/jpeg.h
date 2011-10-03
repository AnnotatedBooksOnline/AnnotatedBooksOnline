/*
 * The JPEG compressor and decompressor
 */

#ifndef JPEG_H
#define JPEG_H

#include "common.h"
#include <jpeglib.h>

class JPEG_input : public InputMethod
{
private:
	jpeg_decompress_struct decinfo;
	jpeg_error_mgr jerr;
	bool initialized;
	FILE * file;

public:
	JPEG_input();
	~JPEG_input();
	
	void open_file(const std::string & name);
	void read_scanlines(image_t buf, size_t lines);
	void close_file();
	const FileParameters get_parameters() const;
};

class JPEG_output : public OutputMethod
{
private:
	FILE * file;
	jpeg_compress_struct cinfo;
	jpeg_error_mgr jerr;
	bool initialized;
	
public:
	JPEG_output();
	~JPEG_output();
	
	void open_file(const std::string & name);
	void write_scanlines(const image_t buf, size_t lines);
	void close_file();
	void set_parameters(const FileParameters & params);
};

#endif // JPEG_H


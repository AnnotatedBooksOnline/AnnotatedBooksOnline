/*
 * The TIFF decompressor
 */

#ifndef TIFF_H
#define TIFF_H

#include "common.h"
#include <tiffio.h>


class TIFFReader : public InputMethod
{
private:
	TIFF * file;
	uint32 width, height, config;
	uint16 components;
	size_t scanline;

public:
	TIFFReader();
	~TIFFReader();
	
	void open_file(const std::string & name);
	void read_scanlines(image_t buf, size_t lines);
	void close_file();
	const FileParameters get_parameters() const;
};

#endif // TIFF_H


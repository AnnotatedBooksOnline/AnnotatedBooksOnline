/*
 * Common file.
 *
 */

#ifndef _COMMON_H_
#define	_COMMON_H_

//include all globally needed headers
#include <cstdio>
#include <stdexcept>
#include <exception>
#include <cmath>
#include <sstream>
#include <cassert>
#include <iostream>
#include <cstring>
#include <string>


//Universal types describing image components
typedef unsigned char sample_t; // A singe sample (R or G or B)
union rgb_t
{
	sample_t sample[3];
}; // A single RGB pixel
typedef rgb_t * line_t; // A scanline of RGB pixels
typedef line_t * image_t; // A 2-dimensional image of RGB pixels

//Calculates the average of four RGB pixels
static inline rgb_t avg(const rgb_t & a, const rgb_t & b, const rgb_t & c, const rgb_t & d)
{
	rgb_t t;
	t.sample[0] = (a.sample[0]+b.sample[0]+c.sample[0]+d.sample[0])/4;
	t.sample[1] = (a.sample[1]+b.sample[1]+c.sample[1]+d.sample[1])/4;
	t.sample[2] = (a.sample[2]+b.sample[2]+c.sample[2]+d.sample[2])/4;
	return t;
}

//Structure describing parameters (for now only size) of an image
struct FileParameters
{
    size_t width; // The width in pixels
    size_t height; // The height in pixels

    FileParameters(size_t width, size_t height) : width(width), height(height) {}
};

// A method of reading images, with a specific kind of compression
class InputMethod
{
public:
	virtual ~InputMethod() { };

	// Opens a file for reading and starts decompressing it.
	// Must be called before get_parameters.
	virtual void open_file(const std::string & name) = 0;
	
	// Reads the given number of scanlines from the input image
	virtual void read_scanlines(image_t buf, size_t lines) = 0;
	
	// Closes the input file and ends the decompression
	virtual void close_file() = 0;
	
	// Gets the image parameters. A file must be opened.
	virtual const FileParameters get_parameters() const = 0;
};

// A method of writing images, with a specific kind of compression
class OutputMethod
{
public:
	virtual ~OutputMethod() { };
	
	// Opens a file for writing and starts the compression core
	virtual void open_file(const std::string & name) = 0;
	
	// Appends scanlines to the file
	virtual void write_scanlines(const image_t buf, size_t lines) = 0;
	
	// Closes the file and ends the compression process
	virtual void close_file() = 0;
	
	// Sets the image parameters
	virtual void set_parameters(const FileParameters & params) = 0;
};



#endif /* _COMMON_H_ */

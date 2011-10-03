#include "jpeg.h"
#include "tilepyramidbuilder.h"

using namespace std;

JPEG_input::JPEG_input()
{
	initialized = false;
	file = NULL;
    decinfo.err = jpeg_std_error(&jerr);
    jpeg_create_decompress(&decinfo);
}

JPEG_input::~JPEG_input()
{
	if (file)
		close_file();
    jpeg_destroy_decompress(&decinfo);
}

void JPEG_input::open_file(const string & name)
{
	assert(!file);
	
    // Open the file
    file = fopen(name.c_str(), "rb");
    if(!file)
    {
        throw runtime_error("Failed opening input file.");
	}
	
	// Initialise the compression object
    jpeg_stdio_src(&decinfo, file);
    jpeg_read_header(&decinfo, TRUE);
    
    // Make sure we use RGB values
    decinfo.output_components = 3;
    decinfo.out_color_space = JCS_RGB;
    jpeg_start_decompress(&decinfo);
}

void JPEG_input::read_scanlines(image_t buf, size_t lines)
{
	assert(file);
	
	size_t l = 0;
	while(l < lines)
	{
		if(decinfo.output_scanline == decinfo.output_height)
		{
			fill(buf[l], buf[l] + decinfo.output_width, settings.padding);
			break;
		}
		else
		{
			l += jpeg_read_scanlines(&decinfo, (JSAMPARRAY)&buf[l], lines - l);			
		}
	}
}

void JPEG_input::close_file()
{
	assert(file);
	fclose(file);
	
	file = NULL;
}

const FileParameters JPEG_input::get_parameters() const
{
	assert(file);
	
	FileParameters p = { decinfo.output_width, decinfo.output_height};
	return p;
}

JPEG_output::JPEG_output()
{
	file = NULL;

    jpeg_create_compress(&cinfo);
	cinfo.err = jpeg_std_error(&jerr);
	
	// Use RGB
	cinfo.input_components = 3;
	cinfo.in_color_space = JCS_RGB;
	
	jpeg_set_defaults(&cinfo);
	jpeg_set_quality(&cinfo, settings.output_quality, TRUE);
	cinfo.optimize_coding = TRUE; // Set only after jpeg_set_defaults()
	cinfo.image_width = 0;
	cinfo.image_height = 0;
}

JPEG_output::~JPEG_output()
{
	if (file)
		close_file();
	jpeg_destroy_compress(&cinfo);
}

void JPEG_output::open_file(const string & name)
{
	assert(!file);
	assert(cinfo.image_width > 0 && cinfo.image_height > 0);
	
	// Open the file
    file = fopen(name.c_str(), "wb");
    if(!file)
    {
        throw runtime_error("Failed opening output file " + name);
	}
	
	jpeg_stdio_dest(&cinfo, file);
	jpeg_start_compress(&cinfo, TRUE);
}

void JPEG_output::write_scanlines(const image_t buf, size_t lines)
{
	assert(file);

	size_t l = 0;
	while(cinfo.next_scanline < cinfo.image_height)
	{
		l += jpeg_write_scanlines(&cinfo, (JSAMPARRAY)&buf[l], lines - l);
	}
}

void JPEG_output::close_file()
{
	assert(file);
	
    jpeg_finish_compress(&cinfo);
	fclose(file);
		
	file = NULL;
}

void JPEG_output::set_parameters(const FileParameters & params)
{
	assert(!file);
	
	cinfo.image_width = params.width;
	cinfo.image_height = params.height;
}

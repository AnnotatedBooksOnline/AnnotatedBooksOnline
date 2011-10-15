/*
 * An abstract image reader and writer.
 *
 */

#ifndef _IMAGEREADERWRITER_H_
#define _IMAGEREADERWRITER_H_

//Structure describing parameters (for now only size) of an image
struct FileParameters
{
    uint width;  //The width in pixels
    uint height; //The height in pixels

    FileParameters(uint width, uint height) : width(width), height(height) { }
};

//A method of reading images, with a specific kind of compression
class ImageReader
{
public:
    virtual ~ImageReader() { };

    //Opens a file for reading and starts decompressing it.
    //Must be called before get_parameters.
    virtual void open(const std::string &name) = 0;
    
    //Reads the given number of scanlines from the input image
    virtual void readScanlines(image_t buf, uint lines) = 0;
    
    //Closes the input file and ends the decompression
    virtual void close() = 0;
    
    //Gets the image parameters. A file must be opened.
    virtual const FileParameters getParameters() const = 0;
};

//A method of writing images, with a specific kind of compression
class ImageWriter
{
public:
    virtual ~ImageWriter() { };
    
    //Opens a file for writing and starts the compression core
    virtual void open(const std::string &name) = 0;
    
    //Appends scanlines to the file
    virtual void writeScanlines(const image_t buf, uint lines) = 0;
    
    //Closes the file and ends the compression process
    virtual void close() = 0;
    
    //Sets the image parameters
    virtual void setParameters(const FileParameters &params) = 0;
};

#endif /* _IMAGEREADERWRITER_H_ */

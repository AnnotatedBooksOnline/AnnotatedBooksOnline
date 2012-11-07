#include <algorithm>

#include "jpeg.h"
#include "tiff.h"
#include "tilepyramidbuilder.h"
#include "common.h"

#define LINES_AT_ONCE ((uint)256)

using namespace std;

BuilderSettings settings;

int main(int argc, char **argv)
{
    settings = DEFAULT_BUILDER_SETTINGS;
    settings.output_quality = 95;
    
    if (argc != 3)
    {
        cerr << "Usage: tiff2jpeg <input> <output>" << endl;
        return 1;
    }
    
    try
    {
        TIFFReader reader;
        reader.open(argv[1]);
        
        const FileParameters params = reader.getParameters();
        
        try
        {
            // Create an image writer from params.
            JPEGWriter writer(params);
            
            // Open the file to write and initialize the compressor.
            writer.open(argv[2]);
            
            try
            {
                // Initialize output buffer.
                image_t buffer = new line_t[LINES_AT_ONCE];
                for (uint i = 0; i < LINES_AT_ONCE; ++i)
                {
                    buffer[i] = new rgb_t[params.width];
                }
                
                
                for (uint i = 0; i < params.height; i += LINES_AT_ONCE)
                {
                    // Read data.
                    reader.readScanlines(buffer, LINES_AT_ONCE);
                    
                    // Write data.
                    writer.writeScanlines(buffer, LINES_AT_ONCE);
                }
                
                //Delete buffers
                for (uint i = 0; i < LINES_AT_ONCE; ++i)
                {
                    delete[] buffer[i];
                }
                delete[] buffer;
            }
            catch(exception& e)
            {
                cerr << "Conversion failed: " << e.what() << endl;
                return 1;
            }
            
            // Finalize compression.
            writer.close();
        }
        catch(exception& e)
        {
            cerr << "Error while writing output file: " << e.what() << endl;
            return 1;
        }
        
        reader.close();
    }
    catch(exception& e)
    {
        cerr << "Error while reading input file: " << e.what() << endl;
        return 1;
    }
    
    return 0;
}

#include "pyramid_builder.h"
#include <iostream>
#include <sstream>
#include <exception>

using namespace std;

int main(int argc, const char * args [])
{
    try
    {
        string path, output_prefix;
        BuilderSettings settings = DEFAULT_BUILDER_SETTINGS;

        //TODO: Parse command line options specifying the settings

        if(argc != 3)
        {
            cerr << "Please provide two arguments: the path of the input image "
                 << "and the path and prefix of the output images.\n\n"
                 << "Example: pyramid_builder some_image.jpg some_dir/img" << endl;
            return 1;
        }

        path = args[1];
        output_prefix = args[2];

        processImage(path, output_prefix, settings);
        return 0;
    }
    catch(exception & ex)
    {
        cerr << "An error occured: " << ex.what() << endl;
        return 1;
    }
    catch(...)
    {
        cerr << "An error occured." << endl;
        return 1;
    }
}


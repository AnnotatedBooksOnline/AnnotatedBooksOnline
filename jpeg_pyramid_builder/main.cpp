/*
 * Main function.
 *
 */

#include "tilepyramidbuilder.h"

using namespace std;

int main(int argc, const char **args)
{
    TilePyramidBuilder *builder = NULL;
    
    try
    {
        string path, output_prefix;
        
        BuilderSettings settings = DEFAULT_BUILDER_SETTINGS;
        settings.filename_convention = BuilderSettings::PREFIX_Z_X_Y_JPG;

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

        TilePyramidBuilder *builder = new TilePyramidBuilder(settings);
        
        builder->build(path, output_prefix);
        
        delete builder;
        
        return 0;
    }
    catch(exception &e)
    {
        cerr << "An error occured: " << e.what() << endl;
        
        if (builder)
            delete builder;
        
        return 1;
    }
    catch(...)
    {
        cerr << "An error occured." << endl;
        
        if (builder)
            delete builder;
        
        return 1;
    }
}

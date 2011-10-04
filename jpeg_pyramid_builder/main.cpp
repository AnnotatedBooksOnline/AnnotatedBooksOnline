/*
 * Main function.
 *
 */

#include "tilepyramidbuilder.h"

#include <getopt.h>

using namespace std;

void showUsage(char *command)
{
    cerr << "Usage: " << command << " [options] files\n\n"
         << "Options:\n"
         << "  Option       Long variant              Description          Default value\n\n"
         << "  -i <format>  --input-format <format>   Input format         'auto'\n"
         << "  -o <path>    --output-path <path>      Output path          '.'\n"
         << "  -p <string>  --output-prefix <string>  Filename prefix      'tile_'\n"
         << "  -f <format>  --output-format <format>  Output format        'jpg'\n"
         << "  -q <int>     --output-quality <int>    Output quality       '60'\n"
         << "  -u           --use-padding             Use padding          off\n"
         << "  -c <color>   --padding-color <color>   Padding color        '#000'\n"
         << "  -h           --help                    Display this information\n\n"
         << "Formats:\n"
         << "  <string>     A sequence of characters\n"
         << "  <int>        An integer\n"
         << "  <format>     'jpg', 'tiff' or 'auto'\n"
         << "  <path>       A path to a directory\n"
         << "  <color>      A color, eg: '#FF0', '#FFFF00', 'white', or '255,255,0'\n\n"
         << "Examples:\n"
         << "  " << command << " -u -c #FFF -p tile_ -o /some/path/ input.jpg\n"
         << "  " << command << " -f tiff -i jpg -o /some/path/ input.jpg\n";
}

int main(int argc, char **argv)
{
    TilePyramidBuilder *builder = NULL;
    
    try
    {
        //Settings
        string input_file     = "";
        string input_format   = "auto";
        string output_prefix  = "tile_";
        string output_path    = ".";
        string output_format  = "jpg";
        uint   output_quality = 60;
        bool   use_padding    = false;
        rgb_t  padding_color  = {0x00, 0x00, 0x00};
        
        //Define getopt options
        static struct option long_options[] =
            {
                {"input-format",   required_argument, NULL, 'i'},
                {"output-path",    required_argument, NULL, 'o'},
                {"output-prefix",  required_argument, NULL, 'p'},
                {"output-format",  required_argument, NULL, 'f'},
                {"output-quality", required_argument, NULL, 'q'},
                {"use-padding",    no_argument,       NULL, 'u'},
                {"padding-color",  required_argument, NULL, 'c'},
                {"help",           no_argument,       NULL, 'h'},
                
                //sentinel
                {0, 0, 0, 0}
            };
        
        //Handle the options
        int option, option_index;
        while ((option = getopt_long(argc, argv, "i:o:p:f:q:uc:h", long_options, &option_index)) != -1)
        {
            switch (option)
            {
                case 'i':
                    input_format = optarg;
                    
                    break;
                    
                case 'o':
                    output_path = optarg;
                    
                    break;
                    
                case 'p':
                    output_prefix = optarg;
                    
                    break;
                    
                case 'f':
                    output_format = optarg;
                    
                    break;
                    
                case 'q':
                    output_quality = min(100, max(0, atoi(optarg)));
                    
                    break;
                    
                case 'u':
                    use_padding = true;
                    
                    break;
                    
                case 'c':
                    printf("Padding color: '%s'\n", optarg);
                    
                    //can be hex: #0F0, #00FF00, or rgb: 0,255,0, or text: white, black
                    
                    break;
                    
                case 'h':
                    showUsage(argv[0]);
                    
                    return 0;
                    
                case '?':
                    if (optopt == 'c')
                        fprintf(stderr, "Option -%c requires an argument.\n", optopt);
                    else if (isprint(optopt))
                        fprintf(stderr, "Unknown option '-%c'.\n", optopt);
                    else
                        fprintf(stderr, "Unknown option character `\\x%x'.\n", optopt);
                    
                    return 1;
                    
                default:
                    return 1;
            }
        }
        
        //Check for no input files
        if (optind == argc)
        {
            throw runtime_error("No files were passed.");
        }
        
        //Set settings
        BuilderSettings settings = DEFAULT_BUILDER_SETTINGS;
        settings.filename_convention = BuilderSettings::PREFIX_Z_X_Y_JPG;
        
        //..

        //Create tile pyramid builder
        TilePyramidBuilder *builder = new TilePyramidBuilder(settings);
        
        //Feed it the files
        for (uint i = (uint) optind; i < (uint) argc; ++i)
        {
            builder->build(argv[i], output_path + '/' + output_prefix);
        }
        
        //Finalize
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

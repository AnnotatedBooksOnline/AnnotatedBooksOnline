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
         << "  Option       Long variant                Description          Default value\n\n"
         << "  -i <type>    --input-type      <type>    Input type           'auto'\n"
         << "  -p <path>    --output-path     <path>    Output path          '.'\n"
         << "  -f <string>  --output-filename <string>  Filename prefix      'tile_%z_%x_%y.%e'\n"
         << "  -t <type>    --output-type     <type>    Output type          'jpg'\n"
         << "  -q <num>     --output-quality  <num>     Output quality       '60'\n"
         << "  -w <num>     --output-width    <num>     Tile width           '256'\n"
         << "  -e <num>     --output-height   <num>     Tile height          '256'\n"
         << "  -u           --use-padding               Use padding          off\n"
         << "  -c <color>   --padding-color   <color>   Padding color        '#000'\n"
         << "  -h           --help                      Display this information\n\n"
         << "Formats:\n"
         << "  <string>     A sequence of characters\n"
         << "  <num>        A positive number\n"
         << "  <type>       'jpg', 'tiff' or 'auto'\n"
         << "  <path>       A path to a directory\n"
         << "  <color>      A color, eg: '#FF0', '#FFFF00', 'white', or '255,255,0'\n\n"
         << "Examples:\n"
         << "  " << command << " -u -c #FFF -p tile_ -o /some/path/ input.jpg\n"
         << "  " << command << " -f tiff -i jpg -o /some/path/ input.jpg\n";
}

rgb_t parseColor(const char *str)
{
    //Check for hexadecimal colors
    uint r, g, b;
    char trailing[2];
    if (str[0] == '#')
    {
        ++str;
        
        //Match full hexadecimal form
        if (sscanf(str, "%2x%2x%2x%1s", &r, &g, &b, trailing) == 3)
        {
            rgb_t color = {uchar(r), uchar(g), uchar(b)};
            
            return color;
        }
        
        //Match short hexadecimal form
        if (sscanf(str, "%1x%1x%1x%1s", &r, &g, &b, trailing) == 3)
        {
            //Create full form from short form
            rgb_t color = {uchar(r * (16 + 1)), uchar(g * (16 + 1)), uchar(b * (16 + 1))};
            
            return color;
        }
        
        --str;
    }  
    else
    {
        //Match decimal color
        if (sscanf(str, "%3u,%3u,%3u%1s", &r, &g, &b, trailing) == 3)
        {
            rgb_t color = {uchar(r), uchar(g), uchar(b)};
            
            return color;
        }
        
        //Define two standard colors
        if (strcmp(str, "white") == 0)
        {
            rgb_t color = {0xFF, 0xFF, 0xFF};
            
            return color;
        }
        else if (strcmp(str, "black") == 0)
        {
            rgb_t color = {0x00, 0x00, 0x00};
            
            return color;
        }
    }
    
    throw runtime_error(string("Color '") + str + "' could not be parsed.");
}

int main(int argc, char **argv)
{
    TilePyramidBuilder *builder = NULL;
    
    try
    {
        //Settings
        string input_type          = "auto";
        string output_path         = ".";
        string output_filename     = "tile_%z_%x_%y.%e";
        string output_type         = "jpg";
        uint   output_quality      = 60;
        uint   output_image_width  = 256;
        uint   output_image_height = 256;
        bool   use_padding         = false;
        rgb_t  padding_color       = {0x00, 0x00, 0x00};
        
        //Define getopt options
        static struct option long_options[] =
            {
                {"input-type",      required_argument, NULL, 'i'},
                {"output-path",     required_argument, NULL, 'p'},
                {"output-filename", required_argument, NULL, 'f'},
                {"output-type",     required_argument, NULL, 't'},
                {"output-quality",  required_argument, NULL, 'q'},
                {"output-width",    required_argument, NULL, 'w'},
                {"output-height",   required_argument, NULL, 'e'},
                {"use-padding",     no_argument,       NULL, 'u'},
                {"padding-color",   required_argument, NULL, 'c'},
                {"help",            no_argument,       NULL, 'h'},
                
                //sentinel
                {0, 0, 0, 0}
            };
        
        //Disable getopt its error message
        opterr = 0;
        
        //Handle the options
        int option, option_index;
        while ((option = getopt_long(argc, argv, "i:p:f:t:q:w:e:uc:h", long_options, &option_index)) != -1)
        {
            switch (option)
            {
                case 'i':
                    input_type = optarg;
                    
                    break;
                    
                case 'p':
                    output_path = optarg;
                    
                    break;
                    
                case 'f':
                    output_filename = optarg;
                    
                    break;
                    
                case 't':
                    output_type = optarg;
                    
                    break;
                    
                case 'q':
                    output_quality = min(100, max(0, atoi(optarg)));
                    
                    break;
                    
                case 'w':
                    output_image_width = min(100000, max(10, atoi(optarg)));
                    
                    break;
                    
                case 'e':
                    output_image_height = min(100000, max(10, atoi(optarg)));
                    
                    break;
                    
                case 'u':
                    use_padding = true;
                    
                    break;
                    
                case 'c':
                    padding_color = parseColor(optarg);
                    
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
                        fprintf(stderr, "Unknown option character '\\x%x'.\n", optopt);
                    
                    return 1;
                    
                default:
                    return 1;
            }
        }
        
        //Check for no input files
        if (optind == argc)
        {
            throw runtime_error("No input files.");
        }
        
        //Set settings
        BuilderSettings settings = DEFAULT_BUILDER_SETTINGS;
        
        //Input settings
        //TODO: format
        
        //Output settings
        settings.output_path         = output_path;
        settings.output_filename     = output_filename;
        settings.output_quality      = output_quality;
        settings.output_image_width  = output_image_width;
        settings.output_image_height = output_image_height;
        //TODO: format
        
        //Padding settings
        settings.use_padding   = use_padding;
        settings.padding_color = padding_color;

        //Create tile pyramid builder
        TilePyramidBuilder *builder = new TilePyramidBuilder(settings);
        
        //Feed it the files
        for (uint i = (uint) optind; i < (uint) argc; ++i)
        {
            builder->build(argv[i]);
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

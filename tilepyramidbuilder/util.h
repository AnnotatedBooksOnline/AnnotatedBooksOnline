/*
 * Utility functions.
 */

#ifndef _UTIL_H_
#define _UTIL_H_

#include "common.h"

#ifdef DEBUG

//Include C args
#include <cstdarg>

//debug function
inline void debug(const char *format, ...) {
    FILE   *file;
    va_list args;

    //get args
    va_start(args, format);

    //write error to file
    file = fopen("debug.txt", "a+");
    vfprintf(file, format, args);
    fwrite("\n", 1, 1, file);
    fclose(file);

    //end args
    va_end(args);
}

//Assert function
#undef  assert
#define assert(arg) \
    do { \
        if (!(arg)) { \
            debug("Assertion '%s' failed in file '%s' at line %d!", #arg, __FILE__, __LINE__); \
            exit(1); \
        } \
    } while(0)

#else

//Debug function
inline void debug(const char *, ...) { }

//Assert function
#undef  assert
#define assert(arg) ((void) 0)

#endif /* DEBUG */

//Converts something to a string
template <typename T> inline std::string toString(T val) {
    std::ostringstream out;
    
    //Add value to stream
    out << val;

    //Convert stream to string
    return out.str();
}

//Replaces all occurences of 'from' with 'to'
void replace(std::string &value, const std::string &from, const std::string &to);

#endif /* _UTIL_H_ */

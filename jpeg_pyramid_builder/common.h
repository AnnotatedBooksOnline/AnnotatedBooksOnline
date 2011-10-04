/*
 * Common header file.
 *
 */

#ifndef _COMMON_H_
#define _COMMON_H_

//Set unix/osx/win32 definitions
#if defined _WIN32 || defined __WIN32__ || defined WIN32 || defined __CYGWIN__
#  undef WIN32
#  define WIN32 1
#  ifdef _DEBUG
#      undef DEBUG
#      define DEBUG 1
#  endif
#elif defined macintosh || defined __APPLE__ || defined __APPLE_CC__
#  define OSX  1
#else
#  define UNIX 1
#endif

//Include globally needed C libraries
#include <cmath>
#include <cstring>

//Include globally needed C++ libraries
#include <cstdio>
#include <cstdlib>
#include <stdexcept>
#include <exception>
#include <sstream>
#include <iostream>
#include <string>

#ifdef _MSC_VER

//64 bits types
typedef          __int64  int64;
typedef unsigned __int64 uint64;

#else

#include <inttypes.h>

//64 bits types
typedef int64_t   int64;
typedef uint64_t uint64;

#endif

//Common types
typedef unsigned int   uint;
typedef unsigned long  ulong;
typedef unsigned char  uchar;
typedef unsigned short ushort;

//Universal types describing image components
typedef uchar sample_t; //A singe sample (R or G or B)

#pragma pack(1)

struct rgb_t
{
    union
    {
        struct { sample_t r, g, b; };
        sample_t samples[3];
    };
};

#pragma pack()

typedef rgb_t  *line_t; //A scanline of RGB pixels
typedef line_t *image_t; //A 2-dimensional image of RGB pixels

//Include configuration
#include "config.h"

//Include utitility functions
#include "util.h"

#endif /* _COMMON_H_ */

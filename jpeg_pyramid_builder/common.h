/*
 * Common file.
 *
 */

#ifndef _COMMON_H_
#define _COMMON_H_

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
}; //A single RGB pixel

typedef rgb_t  *line_t; // A scanline of RGB pixels
typedef line_t *image_t; // A 2-dimensional image of RGB pixels

//Calculates the average of four RGB pixels
static inline rgb_t avg(const rgb_t &a, const rgb_t &b, const rgb_t &c, const rgb_t &d)
{
    rgb_t average;
    
    average.sample[0] = (a.sample[0] + b.sample[0] + c.sample[0] + d.sample[0]) / 4;
    average.sample[1] = (a.sample[1] + b.sample[1] + c.sample[1] + d.sample[1]) / 4;
    average.sample[2] = (a.sample[2] + b.sample[2] + c.sample[2] + d.sample[2]) / 4;
    
    return average;
}

#endif /* _COMMON_H_ */

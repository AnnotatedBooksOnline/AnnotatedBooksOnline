#!/bin/bash

g++ -O3 -Wall tiff2jpeg.cpp jpeg.cpp tiff.cpp -o bin/tiff2jpeg -ljpeg -ltiff

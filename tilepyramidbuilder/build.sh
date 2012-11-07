#!/bin/bash

g++ -O3 -Wall jpeg.cpp main.cpp tiff.cpp tile.cpp tilepyramidbuilder.cpp util.cpp -o bin/builder -ljpeg -ltiff

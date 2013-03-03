#!/bin/bash

mkdir -p bin
g++ -O3 -Wall jpeg.cpp main.cpp tiff.cpp tile.cpp tilepyramidbuilder.cpp util.cpp -o bin/builder -ljpeg -ltiff && g++ -O3 -Wall tiff2jpeg.cpp jpeg.cpp tiff.cpp -o bin/tiff2jpeg -ljpeg -ltiff

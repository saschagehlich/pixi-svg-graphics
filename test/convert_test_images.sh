#!/bin/bash
cd test/src
for i in *.svg;
do
    inkscape --export-background=ffffff --export-background-opacity=255 -z -e '../ref/'$i'.png' $i
done



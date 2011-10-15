/*
 * Utility functions.
 */

#include "util.h"

//Replaces all occurences of 'from' with 'to'
void replace(std::string &value, const std::string &from, const std::string &to) {
    std::string::size_type index;
    for (index = value.find(from); index != std::string::npos; index = value.find(from, index))
    {
        value.replace(index, from.length(), to);
        
        index += to.length();
    }
}

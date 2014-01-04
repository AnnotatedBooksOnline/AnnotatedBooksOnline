/*
 * Encoding of positive integers less than 2^31 in a non-sequential
 * reversible human-readable code, based on CRC32.
 */
var IDCode = new function()
{
    var POLYNOMIAL = 0xEDB88320;
    var MASK = 0xFFFFFFFF;

    var table = [];
    var revtable = [];

    // Extracts bytes from a 32-bit word.
    var bytes = function(num)
    {
        var result = [];
        for (var i = 3; i >= 0; i--)
        {
            result.push(num & 0xFF);
            num >>>= 8;
        }
        return result;
    };
    
    // Calculates the unique 32-bit word with given CRC32.
    var uncrc32 = function(crc)
    {
        crc ^= MASK;
        for (var i = 3; i >= 0; i--)
        {
            crc = (crc << 8) ^ revtable[crc >>> 24] ^ 0xFF;
        }
        return crc;
    };

    // Calculates the CRC32 of a single 32-bit word.
    var crc32 = function(num)
    {
        var arr = bytes(num);
        var crc = MASK;
        for (var i = 0; i < arr.length; i++)
        {
            crc = (crc >>> 8) ^ table[(crc ^ arr[i]) & 0xFF];
        }
        return crc ^ MASK;
    };

    // Creates a fixed-length Base36 representation of a 32-bit word.
    var codeToString = function(code)
    {
        var s = '0000000' + (code + 0x80000000).toString(36);
        return '#' + s.substr(s.length - 7);
    }

    // Parses a fixed-length Base36 IDCode as a 32-bit word.
    var stringToCode = function(str)
    {
        if (str.charAt(0) != "#")
        {
            return null;
        }
        return parseInt(str.substr(1), 36) - 0x80000000;
    }

    // Initialize CRC32 tables.
    var fwd, rev;
    for (var i = 0; i < 256; i++)
    {
        fwd = i;
        rev = i << 24;
        for (var j = 8; j > 0; j--)
        {
            if ((fwd & 1) == 1) {
                fwd = (fwd >>> 1) ^ POLYNOMIAL;
            } else {
                fwd >>>= 1;
            }

            if ((rev & 0x80000000) != 0) {
                rev = ((rev ^ POLYNOMIAL) << 1) | 1;
            } else {
                rev <<= 1;
            }
        }
        table.push(fwd);
        revtable.push(rev);
    }

    // Encode the integer number as IDCode.
    // If the number is negative, too big or not integral, null is returned.
    this.encode = function(id)
    {
        if (typeof id !== 'number' || parseFloat(id) != parseInt(id, 10) ||
            isNaN(id) || id >= 0x80000000 || id < 0)
        {
            return null;
        }
        return codeToString(crc32(id));
    };
    
    // Decode an IDCode as an integer number.
    // If the input is not a valid IDCode, null is returned.
    this.decode = function(str)
    {
        var code = stringToCode(str || '');
        if (code === null || isNaN(code))
        {
            return null;
        }
        code = uncrc32(code);
        if (code < 0)
        {
            return null;
        }
        return code;
    };
    
    // Replace all IDCodes in the string with the given string, or the result of
    // the given function (passed the decoded id a an argument).
    this.replaceID = function(str, fmt)
    {
        var fun = fmt;
        if (typeof fmt !== 'function')
        {
            fun = function() { return fmt; };
        }
        var result = '';
        var m;
        while ((m = str.match(/(#[a-zA-Z0-9]{7})(?:[^a-zA-Z0-9]|$)/)) !== null)
        {
            result += str.substr(0, m.index);
            var id = this.decode(m[1]);
            result += id === null ? m[1] : fun(id);
            str = str.substr(m.index + m[1].length);
        }
        return result + str;
    };
};


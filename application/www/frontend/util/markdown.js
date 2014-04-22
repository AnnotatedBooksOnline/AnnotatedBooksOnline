/**
 * Simple markdown function to convert * (bold), _ (underline), / (italic) to
 * their HTML equivalents. The operators can be escaped with backslash. HTML
 * tags are preserved: the input is assumed to be HTML (e.g. all < ... >
 * indicate tags).
 */
function markdown(str)
{
    var active = {
        b: false,
        u: false,
        i: false,
        ord: []
    };
    var inHtml = false;
    
    var res = [];

    var handleTag = function(tag, c)
    {
        if (inHtml)
        {
            res.push(c);
            return;
        }
    
        if (!active[tag])
        {
            res.push('<' + tag + '>');
            active[tag] = true;
            active.ord.push(tag);
        }
        else
        {
            active[tag] = false;
            var tmp = [];
            while(true)
            {
                var m = active.ord.pop();
                res.push('</' + m + '>');
                if (m != tag)
                {
                    tmp.push(m);
                }
                else
                {
                    break;
                }
            }
            while(tmp.length > 0)
            {
                var m = tmp.pop();
                res.push('<' + m + '>')
                active.ord.push(m);
            }
        }
    };

    var chars = str.split('');

    for (var i = 0; i < chars.length; i++)
    {
        var c = chars[i];
        switch(c)
        {
            case '\\':
                if (i < chars.length - 1 && '*_/\\'.indexOf(chars[i+1]) != -1)
                {
                    res.push(chars[i+1]);
                    i++;
                }
                else
                {
                    res.push('\\');
                }
                break;
            case '*':
                handleTag('b', c);
                break;
            case '_':
                handleTag('u', c);
                break;
            case '/':
                handleTag('i', c);
                break;
            case '<':
                inHtml = true;
                res.push(c);
                break;
            case '>':
                inHtml = false;
                res.push(c);
                break;
            default:
                res.push(c);
                break;
        }
    }
    
    while (active.ord.length > 0)
    {
        var m = active.ord.pop();
        res.push('</' + m + '>');
    }
    
    return res.join('');
}


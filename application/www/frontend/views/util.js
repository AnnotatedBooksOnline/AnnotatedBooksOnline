Ext.define('SP.JSON', {
    statics: {
        timeout: 6000,
        url: '', // TODO: default url
        doRequest: function(method, data, callback, params)
        {
            Ext.Ajax.request({
                url: SP.JSON.url,
                params: params, // sets optional GET/POST request parameter
                jsonData: {method: method, params: data},
                method: 'POST',
                success: function(response)
                {
                    var text = response.responseText;
                    callback(true, Ext.JSON.decode(text, true));
                },
                failure: function()
                {
                    callback(false);
                }
            });
        }
    }
});

// Example callback function
/*
function callback(success, data)
{
    if (!success)
    {
        alert("Request failed");
    }
    else
    {
        processData(data);
    }
}
*/


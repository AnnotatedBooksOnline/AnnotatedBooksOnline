
//
// Greet user with the welcome message if:
// - A greeter file is defined
// - The user is visiting for the first time (i.e. no cookie)
// - The user is visiting the main page (i.e. no page token given)
//
// Also, let the user watch an introductory video if one if defined.
//
Application.onLoaded(function(token)
{
    var greeterFile = getCachedSetting('greeter-file');
    var greeterTitle = getCachedSetting('greeter-title');
    var tutorialVideo = getCachedSetting('tutorial-video');
    var tutorialVideoTitle = getCachedSetting('tutorial-video-title');
    
    if (greeterFile != null && greeterFile.trim() != '')
    {
        var welcomed = Ext.util.Cookies.get('welcomed');
        if (welcomed === null || !token)
        {
            var buttons = [];
            if (tutorialVideo != null && tutorialVideo.trim() != '')
            {
                buttons.push({
                    text: 'Watch tutorial',
                    iconCls: 'video-icon',
                    handler: function()
                    {
                        var youtube = new Ext.ux.YoutubeWindow({
                            video: tutorialVideo,
                            title: tutorialVideoTitle || 'Tutorial'
                        });
                        youtube.show();
                    }
                });
            }
            buttons.push({
                text: 'Ok, I got it',
                iconCls: 'accept-icon',
                handler: function()
                {
                    Ext.util.Cookies.set('welcomed', 1);
                    this.up('staticwindow').destroy();
                }
            });
            var greeter = new Ext.ux.StaticWindow({
                title: greeterTitle || 'Welcome',
                file: greeterFile,
                buttons: buttons
            });
            greeter.show();
        }
    }
});


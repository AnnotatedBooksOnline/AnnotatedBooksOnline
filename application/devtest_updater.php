<?php
// Automatically flush output buffers
@apache_setenv('no-gzip', 1);
@ini_set('zlib.output_compression', 0);
@ini_set('implicit_flush', 1);
for ($i = 0; $i < ob_get_level(); $i++) { ob_end_flush(); }
ob_implicit_flush(1);
echo str_repeat(' ', 1024);

echo '<html><body>';
echo '<h1>Devtest updater</h1>';
if (isset($_POST['version']))
{
    $version = $_POST['version'];
    if (preg_match('/[a-zA-Z0-9_-]/', $version) === 1)
    {
        chdir('application');
        system('git show ' . $version . ' >/dev/null 2>/dev/null', $return);
        chdir('..');
        if ($return === 0)
        {
            echo '<h2>Update results</h2><pre>';
            passthru('bash ./update.sh ' . $version);
            echo '</pre>';
        }
    }
}
echo '<h2>Update devtest</h2>';
chdir('application');
exec('git fetch >/dev/null 2>/dev/null');
exec('git log origin --pretty="%H%d %s" | grep -E "^[a-z0-9]+ \(.+\) .+" | sed \'s/\([a-z0-9]\+\) (\(.\+\)) \(.*\)/\1#*#*#\2#*#*#\3/\'', $commits);
chdir('..');
$versions = array();
$isLatestVersion = false;
foreach ($commits as $commit)
{
    $commit = explode('#*#*#', $commit);
    if (count($commit) !== 3)
    {
        continue;
    }
    $decorations = explode(', ', $commit[1]);
    $oneline = $commit[2];
    $commit = $commit[0];
    $versions[$commit] = array();
    $isDecorated = false;
    $isHEAD = false;
    $isOriginHEAD = false;
    foreach ($decorations as $decoration)
    {
        if ($decoration == 'origin/HEAD')
        {
            $versions[$commit][] = 'Latest version';
            $isOriginHEAD = true;
        }
        else if ($decoration == 'HEAD')
        {
            $versions[$commit][] = 'Current version';
            $isHEAD = true;
        }
        else if (substr($decoration, 0, strlen('origin/')) != 'origin/' && $decoration != 'master')
        {
            $decoration = substr($decoration, 0, strlen('tag: ')) == 'tag: '
                ? substr($decoration, strlen('tag: '))
                : $decoration;
            $versions[$commit][] = $decoration;
            if (!$isDecorated || strlen($decoration) < strlen($commit))
            {
                $isDecorated = true;
                $versions[$decoration] = $versions[$commit];
                unset($versions[$commit]);
                $commit = $decoration;
            }
        }
    }
    if ($isHEAD && $isOriginHEAD)
    {
        $isLatestVersion = true;
    }
    if (count($versions[$commit]) == 0)
    {
        unset($versions[$commit]);
    }
    else
    {
        if (strlen($oneline) > 60)
        {
            $oneline = substr($oneline, 0, 57) . '...';
        }
        $versions[$commit] = implode(', ', $versions[$commit]) . ': ' . $oneline;
    }
}

if ($isLatestVersion)
{
    echo '<p>Devtest is up-to-date.</p>';
}
echo '<p><form method="post"><select name="version">';
foreach ($versions as $commit => $desc)
{
    echo '<option value="' . $commit . '">' . $desc . '</option>';
}
echo '</select><input type="submit" value="Update"/></form></p></body></html>';


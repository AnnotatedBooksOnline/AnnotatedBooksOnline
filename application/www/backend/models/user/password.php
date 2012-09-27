<?php
/*
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * Copyright: Bert Massop, Tom Tervoort.
 */

require_once 'util/authentication.php';

/**
 * Hashes the password according to the most recent algorithm.
 */
function hashPassword($password, $user)
{
    return hashPassword_p2($password);
}

/**
 * Verifies the given password against the given hash and user, using the correct
 * algorithm to do so. If the algorithm is outdated, it will update the password of
 * the user.
 */
function verifyPassword($password, $hash, $user)
{
    $version = getHashVersion($hash);
    if ($version === 2)
    {
        return verifyPassword_p2($password, $hash);;
    }
    
    $ok = false;
    switch($version)
    {
        case 1:
            $ok = verifyPassword_p1($password, $hash, $user->getUserId());
            break;
        case 0:
            $ok = verifyPassword_p0($password, $hash);
            break;
    }
    
    if ($ok === true)
    {
        $user->setPassword($password);
        return true;
    }
    
    sleep(2);
    return false;
}

/**
 * Returns the version of the hashing algorithm used to compute the given hash.
 */
function getHashVersion($hash)
{
    if (substr($hash, 0, 3) === 'p1_')
    {
        return 1;
    }
    if (substr($hash, 0, 3) === 'p2_')
    {
        return 2;
    }
    return 0;
}

/**
 * Calculates a secure hash for the given password using a salt and some pepper.
 *
 * @return  A secure hash for the given password.
 */
function hashPassword_p2($password, $pepper = null)
{
    // First, we retrieve the system salt, which should be unique.
    $salt = Configuration::getInstance()->getString('password-salt');
    // Then we get some pepper.
    if ($pepper === null)
    {
        // Generate some random pepper.
        $pepper = Authentication::generateUniqueToken();
    }
    // This makes for some great seasoning.
    $seasoning = sha1($salt . $pepper);
    
    // Use Blowfish with 1024 passes to generate a sufficiently secure password.
    $algorithm = '$2a';
    $passes    = '$10';
    // Only the first 22 seasoning characters are used by Blowfish.
    $config    = $algorithm . $passes . '$' . substr($seasoning, 0, 22);
    $hash = crypt($password, $config);
    
    // We now have a hash, but it contains the seasoning we used as well as the exact
    // hashing parameters. It would be nice if we could keep this secret.
    // This does not add real cryptographic security (assuming Kerckhoffs' principle),
    // but why not make attacks without access to the filesystem a little harder?
    $hash = substr($hash, strlen($config));
    
    // We still have to store the pepper we added, so we are able to regenerate the
    // seasoning when the password is to be verified.
    $hash = $pepper . '_' . $hash;
    
    // The string 'p2_' is prepended to the hash, so we will be able to lookup which
    // algorithm was used in the future.
    return 'p2_' . $hash;
}

function verifyPassword_p2($password, $hash)
{
    $breakdown = explode('_', $hash);
    return $hash === hashPassword_p2($password, $breakdown[1]);
}

/**
 * DEPRECATED. Calculates a secure hash for the given password.
 *
 * @return  A secure hash for the given password.
 */
function hashPassword_p1($password, $extra)
{
    // Generate a salt based on the password and extra information.
    // First, we retrieve the system salt, which should be unique but does not have to
    // be kept secure.
    $plainsalt = Configuration::getInstance()->getString('password-salt');
    // Still, it would be nice if the salt would change if the user changes the
    // password. It is bad practice to incorporate the password in the salt, since it
    // is stored in plaintext. Therefore, we use two first hex characters of the SHA-1
    // hash of the password as well.
    // This does not really help the attacker: but we have to keep in mind that it
    // reduces the bruteforce attack complexity by a constant factor 16, assuming
    // the real hashing function is way harder to compute than SHA-1. On the other
    // hand, it helps protecting the user by giving a 99.6% chance of a salt change
    // after a password change, thereby offering some more protection against rainbow
    // tables: for each tuple of system salt and extra information, there can be 256
    // different salts.
    $salt = md5($extra . '_' . $plainsalt . '_' . 
        substr(sha1($plainsalt . $password . $extra), 0, 2));
    
    // Use Blowfish with 1024 passes to generate a sufficiently secure password.
    // This function is so hard to compute that the factor 256 bruteforce time
    // reduction (assuming the attacker knows the salt!) does not make it feasible to
    // perform an actual bruteforce attack.
    $algorithm = '$2a';
    $passes    = '$10';
    // Only the first 22 salt characters are used by Blowfish.
    $config    = $algorithm . $passes . '$' . substr($salt, 0, 22);
    $hash = crypt($password, $config);
    
    // We now have a hash, but it contains the salt we used as well as the exact
    // hashing parameters. It would be nice if we could keep this secret.
    // This does not add real cryptographic security (assuming Kerckhoffs' principle),
    // but why not make attacks without access to the filesystem a little harder?
    $hash = substr($hash, strlen($config));
    
    // The string 'p1_' is prepended to the hash, so we will be able to lookup which
    // algorithm was used in the future.
    return 'p1_' . $hash;
}

function verifyPassword_p1($password, $hash, $userId)
{
    return $hash === hashPassword_p1($password, $userId);
}

/**
 * DEPRECATED. Calculates a not so secure hash for the given password.
 *
 * This hash only uses a system-wide salt, and is therefore not secure.
 *
 * @return  A secure hash for the given password.
 */
function hashPassword_p0($password)
{
    // Generate a salt based on the password. This salt needs to be secure, as it is
    // prefixed to the password hash.
    $plainsalt = Configuration::getInstance()->getString('password-salt');
    return sha1($plainsalt . $password);
}

function verifyPassword_p0($password, $hash)
{
    return $hash === hashPassword_p0($password);
}


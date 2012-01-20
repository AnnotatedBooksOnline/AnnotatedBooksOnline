<?php
//[[GPL]]

require_once 'framework/util/singleton.php';
require_once 'framework/util/configuration.php';
require_once 'models/setting/setting.php';
require_once 'models/user/user.php';
require_once 'framework/util/log.php';

// Exceptions.
class MailerException extends ExceptionBase { }

/**
 * General helper class for sending e-mails.
 */
class Mailer
{    
    /**
     * Sends an e-mail. Opens up and closes an SMTP connection and therefore is not very suitable
     * for 'mass mailing' a large numbers of users at once.
     * 
     * @param string $recipient The e-mail address of the recipient.
     * @param string $subject   The subject of the mail. 
     * @param string $message   The message in the body of the mail.
     * 
     * @throws MailException When an e-mail is not accepted for delivery.
     */
    public static function sendMail($recipient, $subject, $message)
    {
        $fromaddress = Setting::getSetting('mail-from-address');
        
        $headers = 'MIME-Version: 1.0' . "\r\n"
                 . 'Content-type: text/plain; charset=utf-8' . "\r\n"
                 . 'From: ' . Setting::getSetting('project-title') 
                 . ' <'     . $fromaddress . ">\r\n";
        
        $success = mail($recipient, $subject, $message, $headers);
        if(!$success)
        {
            throw new MailerException('mail-failed', $recipient);
        }
        
        Log::info("Mail to \"%s\" accepted for delivery:\n\n %s", $recipient, $message);
    }
    
    /**
     * Helper that replaces some tags in a message by certain properties.
     *
     * @param string $message The message with tags in it.
     * @param User   $user    A loaded user entity. 
     * @param string $link    A link that can optionally be provided.
     * 
     * @return string The new message.
     */
    private static function insertInfo($message, $user, $link = null)
    {
        $projectname = Setting::getSetting('project-title');
        return str_replace(
                    array('[PROJECTNAME]', '[USERNAME]', '[FIRSTNAME]', '[LASTNAME]', '[LINK]'),
                    array($projectname, $user->getUsername(), $user->getFirstName(), $user->getLastName(), $link),
                    $message);
    }
    
    
    /**
     * Sends a standard activation mail to the specified PendingUser containing his or her 
     * activation code.
     * 
     * @param PendingUser $puser The pending user entity, its values should be set.
     * 
     * @throws MailerException When something goes wrong, like the e-mail not being accepted for
     *                         delivery. 
     */
    public static function sendActivationMail($puser)
    {
        // Retrieve associated User entity.
        $user = new User($puser->getUserId());
        
        // Determine properties.
        $subject = Setting::getSetting('activation-mail-subject');
        $recipient = $user->getEmail();
        $basemessage = Setting::getSetting('activation-mail-message');
        $code = $puser->getConfirmationCode();
        $link = Configuration::getInstance()->getString('activation-url') . $code;
        
        // For the sake of security, confirm the validity of the confirmation code, which should be
        // a hexadecimal numer of 32 digits.
        if(strlen($code) != 32 || preg_match('/[^a-f^0-9]/', $code) == 1)
        {
            throw new MailerException('illegal-confirmation-code', $code);
        }
         
        // Insert user info and the activation link into the e-mail.
        $message = self::insertInfo($basemessage, $user, $link);
        
        // Now send the e-mail.
        Log::info("Sending activation code to %s.\nContents: %s.", $user->getEmail(), $message);
        self::sendMail($recipient, $subject, $message);
    }
    
    public static function sendUserDeclinedMail($puser)
    {
        // Retrieve associated User entity.
        $user = new User($puser->getUserId());
        
        // Determine properties.
        $subject = Setting::getSetting('user-declined-mail-subject');
        $recipient = $user->getEmail();
        $basemessage = Setting::getSetting('user-declined-mail-message');
        
        // Insert user info in mail.
        $message = self::insertInfo($basemessage, $user);
        
        // Now send the e-mail.
        self::sendMail($recipient, $subject, $message);
    }
    
    public static function sendPasswordRestorationMail($user)
    {
        // Determine the restoration token.
        $token = $user->getPasswordRestoreToken();
        if(!isset($token))
        {
            throw new MailerException('no-password-restore-token');
        }
        
        // Determine properties.
        $subject = Setting::getSetting('forgotpass-mail-subject');
        $recipient = $user->getEmail();
        $basemessage = Setting::getSetting('forgotpass-mail-message');
        $link = Configuration::getInstance()->getString('forgotpass-url') . $token;
        
        // For the sake of security, confirm the validity of the password token, which should be
        // a hexadecimal numer of 32 digits.
        if(strlen($token) != 32 || preg_match('/[^a-f^0-9]/', $token) == 1)
        {
            throw new MailerException('illegal-confirmation-code', $token);
        }
         
        // Insert user info and the activation link into the e-mail.
        $message = self::insertInfo($basemessage, $user, $link);
        
        // Now send the e-mail.
        Log::info("Sending activation code to %s. (password forgotten)\nContents: %s.", $user->getEmail(), $message);
        self::sendMail($recipient, $subject, $message);
    }    
}


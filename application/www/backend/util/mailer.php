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
        $fromaddress = Configuration::getInstance()->getString('from-address');
        
        $fromheader = 'From: ' . Configuration::getInstance()->getString('from-name') 
                    . ' <'     . $fromaddress
                    . ">\r\n";
        
        $success = mail($recipient, $subject, $message, $fromheader, "-f$fromaddress");
        if(!$success)
        {
            throw new MailerException('mail-failed', $recipient);
        }
        
        Log::info('Mail to "%s" accepted for delivery:\n\n%s', $recipient, $message);
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
        $message = str_replace(
                        array('[LINK]', '[USERNAME]', '[FIRSTNAME]', '[LASTNAME]'),
                        array($link, $user->getUsername(), $user->getFirstName(), $user->getLastName()),
                        $basemessage);
        
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
        $message = str_replace(
                        array('[USERNAME]', '[FIRSTNAME]', '[LASTNAME]'),
                        array($user->getUsername(), $user->getFirstName(), $user->getLastName()),
                        $basemessage);
        
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
        $link = Configuration::getInstance()->getString('forgotpass-url') . $code;
        
        // For the sake of security, confirm the validity of the password token, which should be
        // a hexadecimal numer of 32 digits.
        if(strlen($code) != 32 || preg_match('/[^a-f^0-9]/', $code) == 1)
        {
            throw new MailerException('illegal-confirmation-code', $code);
        }
         
        // Insert user info and the activation link into the e-mail.
        $message = str_replace(
        array('[LINK]', '[USERNAME]', '[FIRSTNAME]', '[LASTNAME]'),
        array($link, $user->getUsername(), $user->getFirstName(), $user->getLastName()),
        $basemessage);
        
        // Now send the e-mail.
        Log::info("Sending activation code to %s. (password forgotten)\nContents: %s.", $user->getEmail(), $message);
        self::sendMail($recipient, $subject, $message);
    }    
}

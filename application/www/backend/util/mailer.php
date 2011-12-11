<?php

require_once 'framework/util/singleton.php';
require_once 'framework/util/configuration.php';
require_once 'model/settings/setting.php';
require_once 'model/user/user.php';
require_once 'framework/util/log.php';

class MailException extends ExceptionBase
{
    
}

/**
 * General helper class for sending e-mails from the collaboratory to users.
 */
class Mailer extends Singleton
{
    /** Unique instance. */
    protected static $instance;
    
    /**
     * Constructor.
     */
    protected function __construct()
    {
        
    }
    
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
    public function sendMail($recipient, $subject, $message)
    {
        $fromheader = 'From: ' . Configuration::getInstance()->getString('from-name') 
                    . ' <'     . Configuration::getInstance()->getString('from-address') 
                    . '>\r\n';
        
        Log::debug('....');
        $success = mail($recipient, $subject, $message, $fromheader);
        Log::debug('!!!!');
        if(!$success)
        {
            throw new MailException('mail-failed', $recipient);
        }
        
        Log::info('Mail to "%s" accepted for delivery.', $recipient);
    }
    
    
    public function sendActivationMail($puser)
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
        if(strlen($code) != 32 || preg_match('/^([0-9]|[a-f])/') == 1)
        {
            throw new MailException('illegal-confirmation-code', $code);
        }
        
        // Insert the activation link into the message.
        $linkpos = strpos($basemessage, '[LINK]');
        if($linkpos === false)
        {
            throw new MailException();
        }
        $message = substr($basemessage, 0, $linkpos) . $link . substr($basemessage, $linkpos + 6);
        
        // Now send the e-mail.
        Log::info('Sending activation code to %s.', $user->getUsername(), $user->getEmail());
        $this->sendMail($recipient, $subject, $message);
    }
}
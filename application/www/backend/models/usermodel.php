<?php

require_once 'framework/model.php';

/**
 * User model.
 */
class UserModel extends Model
{
    const RANK_NONE      = 0;
    const RANK_MODERATOR = 1;
    const RANK_ADMIN     = 2;
    
    public function __construct($id)
    {
        ;
    }
    
    public function getRank()
    {
        return RANK_NONE;
    }
}

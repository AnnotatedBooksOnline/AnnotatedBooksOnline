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
 * Copyright: Mathijs Baaijens, Iris Bekker, Renze Droog,
 * Maarten van Duren, Jeroen Hanselman, Bert Massop, Robin van der Ploeg,
 * Tom Tervoort, Gerben van Veenendaal, Tom Wennink.
 */

require_once 'controllers/controllerbase.php';
require_once 'models/user/userlist.php';
require_once 'models/binding/bindinglist.php';
require_once 'models/scan/scanlist.php';
require_once 'util/authentication.php';

/**
 * Statistics controller class.
 */
class StatisticsController extends ControllerBase
{
    /**
     * Get user statistics.
     */
    public function actionNewestUsers($data)
    {
        // Check permission to view this.
        Authentication::assertPermissionTo('view-history');
        Authentication::assertPermissionTo('view-users-part');
        
        $limit = 50;
        
        // Find newest users.
        $newUsers = UserList::find(array(), 0, $limit, array("registrationDate" => "DESC"));
        $newUsers = array_filter($newUsers->getEntities(), function($user)
        {
            return !$user->isDeletedUser();
        });
        $newest = array();
        foreach($newUsers as $user)
        {
            $newest[] = array(
                "userId"           => $user->getUserId(),
                "username"         => $user->getUsername(),
                "firstName"        => $user->getFirstName(),
                "lastName"         => $user->getLastName(),
                "affiliation"      => $user->getAffiliation(),
                "registrationDate" => $user->getRegistrationDate()
            );
        }

        return $newest;
    }
    
    public function actionActiveUsers($data)
    {
        // Check permission to view this.
        Authentication::assertPermissionTo('view-history');
        Authentication::assertPermissionTo('view-users-part');
        
        $limit = 50;
        
        // Find last online users.
        $activeUsers = UserList::find(array(), 0, $limit, array("lastActive" => "DESC"));
        $activeUsers = array_filter($activeUsers->getEntities(), function($user)
        {
            return !$user->isDeletedUser();
        });
        $active = array();
        foreach($activeUsers as $user)
        {
            $active[] = array(
                "userId"      => $user->getUserId(),
                "username"    => $user->getUsername(),
                "firstName"   => $user->getFirstName(),
                "lastName"    => $user->getLastName(),
                "affiliation" => $user->getAffiliation(),
                "lastActive"  => $user->getLastActive()
            );
        }        
        
        return $active;
    }
    
    /**
     * Get binding statistics.
     */
    public function actionNewestBindings($data)
    {
        // Check permission to view this.
        Authentication::assertPermissionTo('view-history');
        
        return Database::getInstance()->doTransaction(function() use ($data)
        {
            $limit = 50;
            $bindings = BindingList::find(array(), 0, $limit, array("createdOn" => "DESC"))->getEntities();
            
            $result = array();
            foreach($bindings as $binding)
            {
                $binding = array_merge($binding->getValues(), $binding->getDefaultValues());
                $user = new User($binding['userId']);
                switch($binding['status'])
                {
                    case 0:
                        $status = "Waiting (reorder)";
                        break;
                    case 1:
                        $status = "Waiting (select)";
                        break;
                    case 2:
                        $status = "Finished";
                        break;
                    case 3:
                        $status = "Deleted";
                        break;
                    default:
                        $status = $binding['status'];
                }
                
                // Find progress of scan conversion for this binding.
                $numScans = 0;
                $numProcessed = 0;
                $numDeleted = 0;
                $numError = 0;
                ScanList::find(array("bindingId" => $binding['bindingId']), 0, 0, array(), $numScans);
                ScanList::find(array("bindingId" => $binding['bindingId'], "status" => 5), 0, 0, array(), $numProcessed);
                ScanList::find(array("bindingId" => $binding['bindingId'], "status" => 6), 0, 0, array(), $numDeleted);
                ScanList::find(array("bindingId" => $binding['bindingId'], "status" => 3), 0, 0, array(), $numError);
                $numScans -= $numDeleted;
                if ($numScans > 0)
                {
                    $progress = ($numProcessed / $numScans * 100) . "% processed";
                    if ($numError > 0)
                    {
                        $progress = "Failed (" . $progress . ")";
                    }
                }
                else
                {
                    $progress = "Deleted";
                }
                $result[] = array(
                    "bindingId"   => $binding['bindingId'],
                    "shelfmark"   => $binding['signature'],
                    "createdOn"   => $binding['createdOn'],
                    "status"      => $status,
                    "username"    => $user->getUsername(),
                    "firstName"   => $user->getFirstName(),
                    "lastName"    => $user->getLastName(),
                    "progress"    => $progress
                );
            }
            return $result;
        });
    }
    
    public function actionBinding($data)
    {
        // Check permission to view this.
        Authentication::assertPermissionTo('view-history');
        $bindingId = self::getInteger($data, 'bindingId');
        
        return Database::getInstance()->doTransaction(function() use ($bindingId)
        {
            $limit = 50;
            
            $binding = new Binding($bindingId);
            
            $query = Query::select(array(
                'annotations.mutation',
                'MIN(annotations.revisionCreateTime) revisionCreateTime',
                'scans.page',
                'COUNT(*) numMutations',
                'COUNT(DISTINCT annotations.changedUserId) numEditors',
                ))
                ->from('RevisedAnnotations annotations')
                ->join('Scans scans', array('annotations.scanId = scans.scanId'))
                ->where('scans.bindingId = :bid')
                ->orderBy('annotations.revisionCreateTime', 'DESC')
                ->groupBy('scans.page', 'DATE(revisionCreateTime)', 'mutation')
                ->limit($limit, 0);
            $rows = $query->execute(array("bid" => $bindingId));
            
            $result = array();
            foreach($rows as $row)
            {
                $book = Book::fromBindingPage($binding, $row->getValue('page'));
                if ($book != null && count($book) > 0)
                {
                    $book = $book[0]->getTitle();
                }
                else
                {
                    $book = "";
                }
                $mutation = $row->getValue('numMutations') . " annotation";
                if ($row->getValue('numMutations') > 1)
                {
                    $mutation .= "s";
                }
                switch($row->getValue('mutation'))
                {
                    case 1: $mutation .= " added"; break;
                    case 2: $mutation .= " modified"; break;
                    case 3: $mutation .= " deleted"; break;
                    case 4: $mutation .= " restored"; break;
                }
                $mutation .= " (" . $row->getValue('numEditors') . " editors)";
                $result[] = array(
                    "book"         => $book,
                    "page"         => $row->getValue('page'),
                    "date"         => Database::valueFromType($row->getValue('revisionCreateTime'), 'timestamp'),
                    "mutation"     => $mutation
                );
            }
            
            if (count($result) < $limit)
            {
                // Add binding creation event.
                $defaults = $binding->getDefaultValues();
                $result[] = array(
                    "book"         => "",
                    "page"         => NULL,
                    "date"         => $defaults['createdOn'],
                    "mutation"     => "Binding created"
                );
            }
            
            return $result;
        });
    }
    
    /**
     * Get most recently changed annotations.
     *
     * @param $data['userId'] User ID to limit the statistics to.
     */
    public function actionLatestAnnotations($data)
    {
        // Check permission to view this.
        Authentication::assertPermissionTo('view-history');
        $userId = self::getInteger($data, 'userId');
        
        return Database::getInstance()->doTransaction(function() use ($userId)
        {
            $limit = 100;
            
            try
            {
                $user = new User($userId);
            }
            catch(EntityException $e)
            {
                $userId = null;
            }
            
            $query = Query::select(array(
                'annotations.revisionCreateTime',
                'annotations.changedUserId',
                'annotations.mutation',
                'bindings.bindingId',
                'scans.page'
                ))
                ->from('RevisedAnnotations annotations')
                ->join('Scans scans', array('annotations.scanId = scans.scanId'), 'LEFT')
                ->join('Bindings bindings', array('scans.bindingId = bindings.bindingId'), 'LEFT')
                ->orderBy('annotations.revisionCreateTime', 'DESC')
                ->limit($limit, 0);
            if ($userId !== null)
            {
                $rows = $query->where('annotations.changedUserId = :uid')
                              ->execute(array('uid' => $userId));
            }
            else
            {
                $rows = $query->execute();
            }
            
            $results = array();
            foreach($rows as $row)
            {
                $user = new User($row->getValue('changedUserId'));
                $binding = new Binding($row->getValue('bindingId'));
                $book = Book::fromBindingPage($binding, $row->getValue('page'));
                if ($book != null && count($book) > 0)
                {
                    $book = $book[0]->getTitle();
                }
                else
                {
                    $book = "None (" . $binding->getShelfmark() . ")";
                }
                switch($row->getValue('mutation'))
                {
                    case 1: $mutation = "Added"; break;
                    case 2: $mutation = "Modified"; break;
                    case 3: $mutation = "Deleted"; break;
                    case 4: $mutation = "Restored"; break;
                    default: $mutation = "";
                }
                $results[] = array(
                    "annotationId" => $row->getValue('annotationId'),
                    "timeChanged"  => Database::valueFromType($row->getValue('revisionCreateTime'), 'timestamp'),
                    "bindingId"    => $row->getValue('bindingId'),
                    "page"         => $row->getValue('page'),
                    "shelfmark"    => $binding->getSignature(),
                    "firstName"    => $user->getFirstName(),
                    "lastName"     => $user->getLastName(),
                    "username"     => $user->getUsername(),
                    "book"         => $book,
                    "mutation"     => $mutation
                );
            }
    
            return $results;
        });
    }
    
    /**
     * Get upload statistics.
     */
    public function actionUpload($data)
    {
        // TODO: find most recent upload activity.
        // Simple descriptive statistics:
        // - number of pending uploads
        // - number of failed uploads last 30 days
        // - number of successful uploads last 30 days
        //
        // - users uploading last 30 days (ordered by last upload date, desc)
        //   - username
        //   - name
        //   - date of most recent upload
        //   - number of uploads last 30 days
    }
    
    /**
     * Show statistics on a simple HTML page for debug purposes.
     * This function is obsolete by design!
     */
    /*public function actionShow($data)
    {
        $page = "";
        $page .= "<html><body>";
        $page .= "<h1>ABO statistics</h1>";
        
        $page .= "<h2>Users</h2>";
        $users = $this->actionUser($data);
        $page .= "<p>Total number of users: " . $users['total'] . "</p>";
        $page .= "<h3>Newest users</h3>";
        $page .= $this->formatTable($users['newest'], array(
            "name" => "Name",
            "affiliation" => "Affiliation",
            "registrationDate" => "Registered"
        ), function($user)
        {
            return array(
                "name" => $user['firstName'] . " " . $user['lastName'],
                "affiliation" => $user['affiliation'],
                "registrationDate" => StatisticsController::formatDate($user['registrationDate'])
            );
        });
        $page .= "<h3>Last active users</h3>";
        $page .= $this->formatTable($users['active'], array(
            "name"        => "Name",
            "affiliation" => "Affiliation",
            "lastActive"  => "Last active"
        ), function($user)
        {
            return array(
                "name"        => $user['firstName'] . " " . $user['lastName'],
                "affiliation" => $user['affiliation'],
                "lastActive"  => StatisticsController::formatDate($user['lastActive'])
            );
        });
        
        $page .= "<h2>Bindings</h2>";
        $page .= "<h3>Newest additions</h3>";
        $bindings = $this->actionBinding($data);
        $page .= $this->formatTable($bindings, array(
            "shelfmark" => "Shelfmark",
            "name" => "Owner",
            "createdOn" => "Created",
            "status" => "Status"
        ), function($binding)
        {
            return array(
                "shelfmark" => $binding['shelfmark'],
                "name"      => $binding['firstName'] . " " . $binding['lastName'],
                "createdOn" => StatisticsController::formatDate($binding['createdOn']),
                "status"    => $binding['status']
            );
        });
        
        $page .= "<h2>Annotations</h2>";
        $page .= "<h3>Most recent</h3>";
        $anns = $this->actionAnnotation($data);
        $page .= $this->formatTable($anns, array(
            "mutation" => "Last mutation",
            "name" => "User",
            "book" => "Book",
            "page" => "Page",
            "timeChanged" => "Modified",
            "timeCreated" => "Created"
        ), function($ann)
        {
            return array(
                "book" => $ann['book'],
                "page" => $ann['page'],
                "name"      => $ann['firstName'] . " " . $ann['lastName'],
                "timeCreated" => StatisticsController::formatDate($ann['timeCreated']),
                "timeChanged" => StatisticsController::formatDate($ann['timeChanged']),
                "mutation" => $ann['mutation']
            );
        });
        
        $page .= "</body></html>";
        return $page;
    }*/
    
    public static function formatDate($stamp)
    {
        return date('F d, Y', $stamp);
    }
    
/*    private function formatTable($rows, $rowNames, $callback)
    {
        $table = "";
        $table .= "<table><tr>";
        $rows = array_map($callback, $rows);
        foreach($rowNames as $rowKey => $rowName)
        {
            $table .= "<th>" . $rowName . "</th>";
        }
        $table .= "</tr>";
        foreach($rows as $row)
        {
            $table .= "<tr>";
            foreach($rowNames as $rowKey => $rowName)
            {
                $table .= "<td>" . $row[$rowKey] . "</td>";
            }
            $table .= "</tr>";
        }
        $table .= "</table>";
        return $table;
    }*/
}


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

/**
 * Statistics controller class.
 */
class StatisticsController extends ControllerBase
{
    /**
     * Get user statistics.
     */
    public function actionUser($data)
    {
        // Find 10 newest users.
        $newUsers = UserList::find(array(), 0, 10, array("registrationDate" => "DESC"));
        $newUsers = array_filter($newUsers->getEntities(), function($user)
        {
            return !$user->isDeletedUser();
        });
        $newest = array();
        foreach($newUsers as $user)
        {
            $newest[] = array(
                "username"         => $user->getUsername(),
                "firstName"   => $user->getFirstName(),
                "lastName"    => $user->getLastName(),
                "affiliation"      => $user->getAffiliation(),
                "registrationDate" => $user->getRegistrationDate()
            );
        }
        
        // Find 10 last online users.
        $activeUsers = UserList::find(array(), 0, 10, array("lastActive" => "DESC"));
        $activeUsers = array_filter($activeUsers->getEntities(), function($user)
        {
            return !$user->isDeletedUser();
        });
        $active = array();
        foreach($activeUsers as $user)
        {
            $active[] = array(
                "username"    => $user->getUsername(),
                "firstName"   => $user->getFirstName(),
                "lastName"    => $user->getLastName(),
                "affiliation" => $user->getAffiliation(),
                "lastActive"  => $user->getLastActive()
            );
        }        
        
        return array(
            "total"  => UserList::getTotal() - 1, // Ignore the <deleted user>.
            "newest" => $newest,
            "active" => $active
        );
    }
    
    /**
     * Get binding statistics.
     */
    public function actionBinding($data)
    {
        $bindings = BindingList::find(array(), 0, 20, array("createdOn" => "DESC"))->getEntities();
        
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
            $result[] = array(
                "bindingId"   => $binding['bindingId'],
                "shelfmark"   => $binding['signature'],
                "createdOn"   => $binding['createdOn'],
                "status"      => $status,
                "username"    => $user->getUsername(),
                "firstName"   => $user->getFirstName(),
                "lastName"    => $user->getLastName()
            );
        }
        return $result;
    }
    
    /**
     * Get most recent annotations.
     */
    public function actionAnnotation($data)
    {
        $query = Query::select(array(
            'annotations.annotationId',
            'annotations.timeChanged',
            'annotations.timeCreated',
            'annotations.changedUserId',
            'bindings.bindingId',
            'scans.page'
            ))
            ->from('Annotations annotations')
            ->join('Scans scans', array('annotations.scanId = scans.scanId'), 'LEFT')
            ->join('Bindings bindings', array('scans.bindingId = bindings.bindingId'), 'LEFT')
            ->orderBy('annotations.timeChanged', 'DESC')
            ->limit(20, 0);
        $rows = $query->execute();
        
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
            $results[] = array(
                "annotationId" => $row->getValue('annotationId'),
                "timeChanged"  => strtotime($row->getValue('timeChanged')),
                "timeCreated"  => strtotime($row->getValue('timeCreated')),
                "bindingId"    => $row->getValue('bindingId'),
                "page"         => $row->getValue('page'),
                "firstName"    => $user->getFirstName(),
                "lastName"     => $user->getLastName(),
                "username"     => $user->getUsername(),
                "book"         => $book,
                "mutation"     => $row->getValue('timeChanged') === $row->getValue('timeCreated') ?
                                    "Added" : "Edited"
            );
        }

        return $results;
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
    public function actionShow($data)
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
                "registrationDate" => $this->formatDate($user['registrationDate'])
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
                "lastActive"  => $this->formatDate($user['lastActive'])
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
                "createdOn" => $this->formatDate($binding['createdOn']),
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
                "timeCreated" => $this->formatDate($ann['timeCreated']),
                "timeChanged" => $this->formatDate($ann['timeChanged']),
                "mutation" => $ann['mutation']
            );
        });
        
        $page .= "</body></html>";
        return $page;
    }
    
    private function formatDate($stamp)
    {
        return date('F d, Y', $stamp);
    }
    
    private function formatTable($rows, $rowNames, $callback)
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
    }
}


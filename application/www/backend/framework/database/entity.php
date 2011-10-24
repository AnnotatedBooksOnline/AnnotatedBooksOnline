<?php 
/*
* This program is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation; version 3 of the License.

* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* Copyright: Bert Massop, Gerben van Veenendaal, Iris Bekker, Jeroen Hanselman,
* Maarten van Duren, Renze Droog, Robin van der Ploeg, Tom Tervoort,
* Tom Wennink, Mathijs Baaijens.
*/

/**
 * Abstract class for any database entity.
 */
abstract class Entity
{
	/** Timestamp when this entity was created */
	private $tsCreated;
	
	/** Timestamp when this entity was last changed. */
	private $tsChanged;
	
	/** Identifier of the user who has created this entity. */
	private $userCreated;
	
	/** Identifier of the user who has last changed this entity. */
	private $userChanged;
	
	
	/**
	 * Saves the entity to the database. A database row is inserted if the entity does not exist in the
	 * database yet. A database row is updated if the entity exists in the database.
	 */
	protected function save() 
	{
		// Determine if this is a fresh entity which has to be inserted into the database.
		if ($tsCreated != null) 
		{
			// Insert the entity into the database.
		} 
		else 
		{
			// Update the existing database row.
		}
	}
	
	/**
	 * 
	 * Enter description here ...
	 */
	protected function retrieve($query) 
	{
		// Execute the query.
		
		// if count (results) != 1
		//	   throw exception
		
		// move query results to class instance variables. 
		
	}
	
	/**
	 * 
	 * Enter description here ...
	 */
	protected function retrieveWithDetails() 
	{
		retrieve();
		
		retrieveDetails();
	}
	
	/**
	 * 
	 * Implement in derived class to retrieve attribute (and associactive?) entities.
	 */
	abstract protected function retrieveDetails();
	
	
	/**
	 * 
	 * Enter description here ...
	 */
	protected function saveWithDetails() 
	{
		save();
		
		saveDetails();
	}
	
	abstract protected function saveDetails ();
}

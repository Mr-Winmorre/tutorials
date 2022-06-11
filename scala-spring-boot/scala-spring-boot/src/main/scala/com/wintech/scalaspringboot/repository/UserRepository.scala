package com.wintech.scalaspringboot.repository

import com.wintech.scalaspringboot.models.User
import org.springframework.data.repository.CrudRepository

trait UserRepository extends CrudRepository[User,Long]

package com.wintech.scalaspringboot.controllers

import com.wintech.scalaspringboot.models.User
import com.wintech.scalaspringboot.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.{RequestMapping, ResponseBody, RestController}

import scala.jdk.CollectionConverters.IterableHasAsScala

@RestController
class UserController @Autowired() (private val userRepository:UserRepository) {
  @RequestMapping(method = Array("/user"))
  @ResponseBody
  def  user:Array[User] =  {
    val data = userRepository.findAll().asScala
    data.toArray
  }
}

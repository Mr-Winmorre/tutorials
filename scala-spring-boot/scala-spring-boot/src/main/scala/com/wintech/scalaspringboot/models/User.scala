package com.wintech.scalaspringboot.models

import org.hibernate.annotations.Tables

import javax.persistence.{Entity, GeneratedValue, Id, Table}
import scala.beans.BeanProperty

@Entity
@Table(name = "User")
class User {
  @Id
  @GeneratedValue
  @BeanProperty
  var  id:Long = _

  @BeanProperty
  var name:String = _

  @BeanProperty
  var dob:String = _

  @BeanProperty
  var address:String =_
}

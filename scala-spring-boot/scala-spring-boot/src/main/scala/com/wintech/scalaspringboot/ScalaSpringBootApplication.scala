package com.wintech.scalaspringboot

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication
class ScalaSpringBootApplication

object ScalaSpringBootApplication {
  def main(args: Array[String]): Unit = {
    val app:Array[Class[_]] = Array(classOf[ScalaSpringBootApplication])
    SpringApplication.run(app, args)
  }
}

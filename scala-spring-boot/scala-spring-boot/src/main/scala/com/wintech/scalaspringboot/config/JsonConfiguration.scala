package com.wintech.scalaspringboot.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.json.JsonMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import org.springframework.context.annotation.{Bean, Configuration}

@Configuration
class JsonConfiguration {

  @Bean
  def jsonMapper:JsonMapper = {
     JsonMapper.builder()
       .addModule(DefaultScalaModule)
       .build()
  }
}

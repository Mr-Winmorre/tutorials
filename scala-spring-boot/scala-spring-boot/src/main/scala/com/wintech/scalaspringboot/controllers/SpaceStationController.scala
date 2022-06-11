package com.wintech.scalaspringboot.controllers

import org.springframework.web.bind.annotation.{GetMapping, RequestParam, RestController}

@RestController
class SpaceStationController {

  @GetMapping(value=Array("/destination"))
  def destination(@RequestParam name:String):String={
    "dear %s, please proceed to the Moon for further instruction"
      .format(name)
  }

  @GetMapping(value=Array("/all"))
  def allShips:List[String]={
    List("Hello","Dog","Cat","Yello","Tuna","Yunmo")
  }
}

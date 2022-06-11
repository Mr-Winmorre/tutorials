package org.eskimi.trial

import akka.actor.typed.ActorSystem
import akka.actor.typed.scaladsl.Behaviors
import akka.http.scaladsl.model._
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route


import scala.concurrent.ExecutionContext


object Main extends App {
  val host = "0.0.0.0"
  val port =9000

  implicit val system:ActorSystem[Nothing] = ActorSystem (Behaviors.empty,name="eskimi")
  implicit val executor:ExecutionContext   = system.executionContext

val route = path("/"){
  get{
    complete(HttpEntity(ContentTypes.`application/json`,"{id:1}"))
  }
}
  lazy val allRoutes:Route = concat(
    path("user"){get{complete(HttpEntity(ContentTypes.`application/json`,"{id:1}"))}}
  )
  
  val bindingFuture = Http().newServerAt("localhost",port).bind(route)

}

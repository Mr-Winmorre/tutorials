name := "eskimi"

version := "0.1"

scalaVersion := "2.13.6"

idePackagePrefix := Some("org.eskimi.trial")

val AkkaVersion = "2.6.16"
libraryDependencies += "com.typesafe.akka" %% "akka-actor-typed" % AkkaVersion


val AkkaHttpVersion = "10.2.6"
libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-actor-typed" % AkkaVersion,
  "com.typesafe.akka" %% "akka-stream" % AkkaVersion,
  "com.typesafe.akka" %% "akka-http" % AkkaHttpVersion
)

libraryDependencies += "io.spray" %% "spray-json" % "1.3.6"

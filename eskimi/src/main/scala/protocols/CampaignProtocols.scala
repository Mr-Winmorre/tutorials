package org.eskimi.trial
package protocols

case class Campaign(id: Int, country: String, targeting: Targeting, banners: List[Banner], bid: Double)

case class Targeting(targetedSiteIds: Seq[String],keywords:Seq[String])

case class Banner(id: Int, src: String, width: Int, height: Int)

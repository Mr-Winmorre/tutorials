package org.eskimi.trial
package protocols

case class BidResponse(id: String, bidRequestId: String, price: Double, adid: Option[String], banner: Option[Banner])

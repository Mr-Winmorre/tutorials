package org.com.akkafirst
package scala

trait BankAccountMessage {

}

case class Deposit(amount: Int) extends BankAccountMessage

case class Withdraw(amount: Int) extends BankAccountMessage

case class PrintBalance() extends BankAccountMessage


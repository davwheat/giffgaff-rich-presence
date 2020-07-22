const Goodybag = require('./Goodybag');

class Member {
  static id;
  static membername;

  static credit;
  static creditString;
  static currentGoodybag;
  static nextGoodybag;

  constructor(id, membername, credit) {
    this.id = id;
    this.membername = membername;

    this.UpdateCredit(credit);
  }

  UpdateCredit(credit) {
    // PAYG credit
    this.credit = credit.amount;
    this.creditString = `£${Math.floor(this.credit / 100)}.${String(this.credit - Math.floor(this.credit / 100) * 100).padEnd('2', '0')}`;

    // Current goodybag
    const current = credit.current;
    this.currentGoodybag = new Goodybag(
      current.sku,
      current.expiryDate,
      undefined,
      current.reserve,
      current.price,
      current.allowance,
      current.balance
    );

    // Queued/recurring goodybag
    const next = credit.next;
    this.nextGoodybag = new Goodybag(next.sku, undefined, next.startDate, next.reserve, next.price, next.allowance, undefined, true);
  }
}

module.exports = Member;

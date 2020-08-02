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
    this.creditString = `£${Math.floor(this.credit / 100)}.${String(this.credit - Math.floor(this.credit / 100) * 100).padStart('2', '0')}`;

    // Current goodybag
    const current = credit.current;
    if (!current) this.currentGoodybag = null;
    else
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
    if (!next) this.nextGoodybag = null;
    else this.nextGoodybag = new Goodybag(next.sku, undefined, next.startDate, next.reserve, next.price, next.allowance, undefined, true);
  }
}

module.exports = Member;

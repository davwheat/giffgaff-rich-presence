const Goodybag = require('./Goodybag');

const Config = require('../Config/config.json');

class Member {
  constructor(id, membername, credit) {
    if (Config.debug) console.log('[D] Creating Member class with membername ' + membername + ' (ID ' + id + ')');

    this.id = id;
    this.membername = membername;

    this.UpdateCredit(credit);
  }

  UpdateCredit(credit) {
    if (Config.debug) console.log('[D] ====== Member info ======');

    // PAYG credit
    this.credit = credit.amount;
    this.creditPounds = credit.amount / 100;
    this.creditString = `£${Math.floor(this.creditPounds)}.${String(this.credit - Math.floor(this.credit / 100) * 100).padStart('2', '0')}`;

    if (Config.debug) console.log('[D] Credit: ' + this.creditString);

    // Current goodybag
    const current = credit.current;
    if (!current) {
      this.currentGoodybag = null;
      if (Config.debug) console.log('[D] Current goodybag: none');
    } else {
      this.currentGoodybag = new Goodybag(
        current.sku,
        current.expiryDate,
        undefined,
        current.reserve,
        current.price,
        current.allowance,
        current.balance
      );
      if (Config.debug) console.log('[D] Current goodybag: ' + this.currentGoodybag.priceStringShort);
      if (Config.debug)
        console.log(
          '[D]             Data: ' +
            Math.round(this.currentGoodybag.remainingAllowances.data.GB * 1000) / 1000 +
            ' GB of ' +
            (this.currentGoodybag.allowances.data.GB + this.currentGoodybag.allowances.reserve.GB) +
            ' GB'
        );
      if (Config.debug) console.log('[D]          Expires: ' + this.currentGoodybag.expiryString);
    }

    // Queued/recurring goodybag
    const next = credit.next;
    if (!next) {
      this.nextGoodybag = null;
      if (Config.debug) console.log('[D]    Next goodybag: none');
    } else {
      this.nextGoodybag = new Goodybag(next.sku, undefined, next.startDate, next.reserve, next.price, next.allowance, undefined, true);

      if (Config.debug) console.log('[D]    Next goodybag: ' + this.nextGoodybag.priceStringShort);
      if (Config.debug)
        console.log('[D]             Data: ' + (this.nextGoodybag.allowances.data.GB + this.currentGoodybag.allowances.reserve.GB) + ' GB');
      if (Config.debug) console.log('[D]           Starts: ' + this.nextGoodybag.startString);
    }

    if (Config.debug) console.log('[D] =========================');
  }
}

module.exports = Member;

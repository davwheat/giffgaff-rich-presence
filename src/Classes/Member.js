const Goodybag = require('./Goodybag');

const Config = require('../Config/config.json');
const DebugLog = require('../Utils/DebugLog');

class Member {
  constructor(id, membername, credit) {
    DebugLog('Creating Member class with membername ' + membername + ' (ID ' + id + ')');

    this.id = id;
    this.membername = membername;

    this.UpdateCredit(credit);
  }

  UpdateCredit(credit) {
    DebugLog('====== Member info ======');

    // PAYG credit
    this.credit = credit.amount;
    this.creditPounds = credit.amount / 100;
    this.creditString = `£${Math.floor(this.creditPounds)}.${String(this.credit - Math.floor(this.credit / 100) * 100).padStart('2', '0')}`;

    DebugLog('Credit: ' + this.creditString);

    // Current goodybag
    const current = credit.current;
    if (!current) {
      this.currentGoodybag = null;
      DebugLog('Current goodybag: none');
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
      DebugLog('Current goodybag: ' + this.currentGoodybag.priceStringShort);
      DebugLog(
        '            Data: ' +
          Math.round(this.currentGoodybag.remainingAllowances.data.GB * 1000) / 1000 +
          ' GB of ' +
          (this.currentGoodybag.allowances.data.GB + this.currentGoodybag.allowances.reserve.GB) +
          ' GB'
      );
      DebugLog('         Expires: ' + this.currentGoodybag.expiryString);
    }

    // Queued/recurring goodybag
    const next = credit.next;
    if (!next) {
      this.nextGoodybag = null;
      DebugLog('   Next goodybag: none');
    } else {
      this.nextGoodybag = new Goodybag(next.sku, undefined, next.startDate, next.reserve, next.price, next.allowance, undefined, true);

      DebugLog('   Next goodybag: ' + this.nextGoodybag.priceStringShort);
      DebugLog('            Data: ' + (this.nextGoodybag.allowances.data.GB + this.currentGoodybag.allowances.reserve.GB) + ' GB');
      DebugLog('          Starts: ' + this.nextGoodybag.startString);
    }

    DebugLog('=========================');
  }
}

module.exports = Member;

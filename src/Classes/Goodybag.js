const Assets = require('../Config/assets.json');

class Goodybag {
  constructor(sku, expiryDate, startDate, reservetank, price, allowances, balances, isQueued = false) {
    this.SKU = sku;

    if (expiryDate) {
      this.expiry = new Date(expiryDate);
      this.expiryString = expiryDate;
    } else {
      this.expiry = this.expiryString = null;
    }

    if (startDate) {
      this.start = new Date(expiryDate);
      this.startString = expiryDate;
    } else {
      this.start = this.startString = null;
    }

    this.price = price;
    this.priceString = `£${Math.floor(price / 100)}.${String(price - Math.floor(price / 100) * 100).padStart('2', '0')}`;
    this.priceStringShort = `£${Math.floor(price / 100)}`;

    this.reservetank = reservetank;

    let goodybag;

    switch (sku) {
      case 'BD039': //! £6 goodybag
        goodybag = Assets.imageKeys.goodybags[6];
        break;
      case 'BD040': //! £8 goodybag
        goodybag = Assets.imageKeys.goodybags[8];
        break;
      case 'BD036': //! £10 goodybag
        goodybag = Assets.imageKeys.goodybags[10];
        break;
      case 'BD043': //! £10 golden goodybag
        this.isGolden = true;
        goodybag = Assets.imageKeys.goodybags['10-golden'];
        break;
      case 'BD037': //! £12 goodybag
        goodybag = Assets.imageKeys.goodybags[12];
        break;
      case 'BD038': //! £15 goodybag
        goodybag = Assets.imageKeys.goodybags[15];
        break;
      case 'BD044': //! £15 golden goodybag
        this.isGolden = true;
        goodybag = Assets.imageKeys.goodybags['15-golden'];
        break;
      case 'BD041': //! £20 goodybag
        goodybag = Assets.imageKeys.goodybags[20];
        break;
      case 'BD045': //! £20 golden goodybag
        this.isGolden = true;
        goodybag = Assets.imageKeys.goodybags['20-golden'];
        break;
      case 'BD042': //! £25 Always On goodybag
        goodybag = Assets.imageKeys.goodybags[25];
        break;
      case 'not assigned': //! £30 golden goodybag
        this.isGolden = true;
        goodybag = Assets.imageKeys.goodybags['30-golden'];
        break;
      case 'BD046': //! £35 golden goodybag
        this.isGolden = true;
        goodybag = Assets.imageKeys.goodybags['35-golden'];
        break;
    }

    this.imageKey = reservetank ? goodybag.reserve : goodybag.noReserve;

    this.allowances = {
      minutes: allowances.minutes,
      texts: allowances.texts,
      data: {
        KB: allowances.data,
        MB: allowances.data / 1024,
        GB: allowances.data / 1024 / 1024,
      },
      euData: {
        KB: allowances.euData,
        MB: allowances.euData / 1024,
        GB: allowances.euData / 1024 / 1024,
      },
      reserve: {
        KB: this.reservetank ? 1024 * 1024 : 0,
        MB: this.reservetank ? 1024 : 0,
        GB: this.reservetank ? 1 : 0,
      },
    };

    if (!isQueued) {
      this.remainingAllowances = {
        minutes: balances.minutes,
        texts: balances.texts,
        data: {
          KB: balances.data,
          MB: balances.data / 1024,
          GB: balances.data / 1024 / 1024,
        },
        euData: {
          KB: balances.euData,
          MB: balances.euData / 1024,
          GB: balances.euData / 1024 / 1024,
        },
        reserve: {
          KB: this.reservetank ? balances.reserve : 0,
          MB: this.reservetank ? balances.reserve / 1024 : 0,
          GB: this.reservetank ? balances.reserve / 1024 / 1024 : 0,
        },
      };

      const GB = 1,
        GBinMB = 1024,
        GBinKB = 1024 * 1024;

      this.usedAllowances = {
        minutes: balances.minutes,
        texts: balances.texts,
        data: {
          KB: allowances.data - balances.data,
          MB: (allowances.data - balances.data) / 1024,
          GB: (allowances.data - balances.data) / 1024 / 1024,
        },
        reserve: {
          KB: this.reservetank ? GBinKB - this.remainingAllowances.reserve.KB : 0,
          MB: this.reservetank ? GBinMB - this.remainingAllowances.reserve.MB : 0,
          GB: this.reservetank ? GB - this.remainingAllowances.reserve.GB : 0,
        },
      };

      this.outOfData = balances.outOfData;
    } else {
      balances = undefined;
      this.isQueued = true;
    }

    this.description = `${this.priceStringShort} ${this.isGolden ? 'golden ' : ''}goodybag`;

    this.descriptionWithData = `${this.description} with ${
      this.allowances.data.GB >= 1
        ? `${this.allowances.data.GB} GB${this.reservetank ? ` (+ 1 GB extra)` : ''}`
        : `${this.allowances.data.MB} MB`
    } data`;

    this.descriptionWithDataCompressed = `${this.description} (${
      this.allowances.data.GB >= 1 ? `${this.allowances.data.GB}${this.reservetank ? ` + 1` : ''} GB` : `${this.allowances.data.MB} MB`
    })`;
  }
}

module.exports = Goodybag;

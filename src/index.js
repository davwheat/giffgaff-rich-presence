const GetMember = require('./Utils/GetMember');
const GetOAuthToken = require('./Utils/GetOAuthToken');

const Config = require('./Config/config.json');
const Assets = require('./Config/assets.json');

console.log('Initialising');

const client = require('discord-rich-presence')('735145438293786704');

console.log('Connected to Discord');

async function Start() {
  console.log('Getting OAuth token...');

  let cookieString, oauthToken;

  let data = await GetOAuthToken();

  cookieString = data.cookies;
  oauthToken = data.token;

  console.log('OAuth token generated successfully!');

  setInterval(async () => {
    // refresh token every 8 hrs
    data = await GetOAuthToken();

    oauthToken = data.token;
    cookieString = data.cookie;
  }, 1000 * 60 * 60 * 8);

  let Member = await GetMember(oauthToken);

  if (Member === null) {
    console.log('Try again later');
    client.disconnect();
    return;
  }

  // Update goodybag info
  setInterval(async () => {
    Member = await GetMember(oauthToken);
  }, 1000 * 60 * Config.refreshInterval);

  // Reset presence every 2 mins to prevent timeouts
  // setInterval(() => {
  //   if (Config.debug) console.log('[D] Refreshing rich presence (to prevent RPC disconnects)');
  //   RefreshPresence(Member);
  // }, 1000 * 60 * 2);

  RefreshPresence(Member);
}

console.log(`Signing in to giffgaff as ${Config.membername}`);
Start();

function RefreshPresence(Member) {
  // let pctDataUsed = Math.round(
  //   (Member.currentGoodybag.usedAllowances.data.GB + Member.currentGoodybag.usedAllowances.reserve.GB) /
  //     (Member.currentGoodybag.allowances.data.GB + Member.currentGoodybag.allowances.reserve.GB)
  // );

  const hasActiveGoodybag = !!Member.currentGoodybag;
  const hasQueuedGoodybag = !!Member.nextGoodybag;

  let totalData = null,
    totalUsedData = null,
    totalRemainingData = null,
    remainingMB = null,
    dataUsage = null;

  if (hasActiveGoodybag) {
    totalData = Member.currentGoodybag.allowances.data.GB + Member.currentGoodybag.allowances.reserve.GB;
    totalUsedData = Math.round((Member.currentGoodybag.usedAllowances.data.GB + Member.currentGoodybag.usedAllowances.reserve.GB) * 100) / 100;
    totalRemainingData =
      Math.round((Member.currentGoodybag.remainingAllowances.data.GB + Member.currentGoodybag.remainingAllowances.reserve.GB) * 100) / 100;

    remainingMB = totalRemainingData * 1024;

    dataUsage = remainingMB <= 1024 ? `${remainingMB} MB left of ${totalData} GB` : `${totalUsedData} GB used of ${totalData} GB`;
  }

  let payg = `Credit: ${Member.creditString}`;

  let nextGoodybagText;
  if (hasQueuedGoodybag) {
    let nextGoodybagGB = Member.nextGoodybag.allowances.data.GB + Member.nextGoodybag.allowances.reserve.GB;

    nextGoodybagText = `Next goodybag: ${Member.nextGoodybag.priceStringShort} (${
      nextGoodybagGB >= 1 ? `${nextGoodybagGB} GB` : `${nextGoodybagGB * 1024} MB`
    })`;
  }

  if (hasActiveGoodybag) {
    console.log({
      state: dataUsage,
      details: 'Unltd mins and texts',
      largeImageKey: Member.currentGoodybag.imageKey,
      smallImageKey: Member.credit < 0.5 && hasQueuedGoodybag ? Member.nextGoodybag.imageKey : Assets.imageKeys.payg_icon,
      largeImageText: `${Member.currentGoodybag.priceStringShort} goodybag ${Member.currentGoodybag.reservetank ? 'with 1 GB extra' : ''}`,
      smallImageText: Member.credit < 0.5 && hasQueuedGoodybag ? nextGoodybagText : payg,
      instance: true,
    });

    client.updatePresence({
      state: dataUsage,
      details: 'Unltd mins and texts',
      largeImageKey: Member.currentGoodybag.imageKey,
      smallImageKey: Member.credit < 0.5 && hasQueuedGoodybag ? Member.nextGoodybag.imageKey : Assets.imageKeys.payg_icon,
      largeImageText: `${Member.currentGoodybag.priceStringShort} goodybag ${Member.currentGoodybag.reservetank ? 'with 1 GB extra' : ''}`,
      smallImageText: Member.credit < 0.5 && hasQueuedGoodybag ? nextGoodybagText : payg,
      instance: true,
    });
  } else {
    console.log({
      state: `Credit: ${payg}`,
      details: null,
      largeImageKey: Assets.imageKeys.payg_icon,
      smallImageKey: Assets.imageKeys.logo_square,
      largeImageText: 'No active goodybag - just credit',
      smallImageText: 'giffgaff, the mobile network run by you',
      instance: true,
    });

    client.updatePresence({
      state: `Credit: ${payg}`,
      details: null,
      largeImageKey: Assets.imageKeys.payg_icon,
      smallImageKey: Assets.imageKeys.logo_square,
      largeImageText: 'No active goodybag - just credit',
      smallImageText: 'giffgaff, the mobile network run by you',
      instance: true,
    });
  }
}

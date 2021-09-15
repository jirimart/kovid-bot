const dotenv = require('dotenv').config().parsed;
const fetch = require('node-fetch');

const sendData = async () => {
  try {
    const kovidDataResponse = await fetch("https://onemocneni-aktualne.mzcr.cz/api/v2/covid-19/zakladni-prehled.json", {"method":"GET"});
    const kovidData = await kovidDataResponse.json();

    const kovid = kovidData.data[0];

    const { Webhook, MessageBuilder } = require('discord-webhook-node');

    const afrika3 = new Webhook(dotenv.AFRIKA3_HOOK);
    const znasilneniSlinivky = new Webhook(dotenv.ZNASILNENI_SLINIVKY_HOOK);
    const testServer = new Webhook(dotenv.TEST_SERVER_HOOK);
    
    const embed = new MessageBuilder()
      .setColor('#FF0000')
      .setTitle(`Data za předchozí den ${kovid.potvrzene_pripady_vcerejsi_den_datum}`)
      .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/8/82/SARS-CoV-2_without_background.png')
      .addField('Nově nakažení', `${kovid.potvrzene_pripady_vcerejsi_den}`, true)
      .addField('Aktuálně hospitalizovaní', `${kovid.aktualne_hospitalizovani}`, true)
      .setTimestamp();
    
    afrika3.send(embed);
    znasilneniSlinivky.send(embed);
    testServer.send(embed);
  } catch (error) {

  }
}

sendData();

const CronJob = require('cron').CronJob;
const job = new CronJob('00 20 8 * * 0-6', function() {
  sendData();
  }, function () {
    console.log("Odesláno");
  },
  true,
  'Europe/Prague'
);
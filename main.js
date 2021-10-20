const dotenv = require('dotenv').config().parsed;
const fetch = require('node-fetch');

const sendData = async () => {
  try {
    const kovidDataResponse = await fetch("https://onemocneni-aktualne.mzcr.cz/api/v2/covid-19/zakladni-prehled.json", {"method":"GET"});
    const kovidData = await kovidDataResponse.json();
    const kovidDataFullResponse = await fetch("https://onemocneni-aktualne.mzcr.cz/api/v2/covid-19/testy-pcr-antigenni.json", {"method":"GET"});
    const kovidDataFull = await kovidDataFullResponse.json();
    const date = new Date(Date.now() - 2*24*60*60*1000);
    const fckFormatedDate = date.getFullYear() + "-" + ('0'+(date.getMonth()+1)).slice(-2) + "-" + ('0'+(date.getDate())).slice(-2);
    const kovidv2 = kovidDataFull.data;

    const kovid = kovidData.data[0];

    let secondLastDayCount;

    kovidv2.forEach(element => {
      if (element.datum == fckFormatedDate) {
        secondLastDayCount = element.incidence_pozitivni;
      }
    });

    const reproProcento = (kovid.potvrzene_pripady_vcerejsi_den * 100 / secondLastDayCount) / 100;
    const reprodukcniCislo = (reproProcento - 1) * 100;
    const predpokladaneNakazeni = kovid.potvrzene_pripady_vcerejsi_den * reproProcento;


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
      .addField('\u200B', '\u200B', false)
      .addField('Reprodukční číslo', `${reprodukcniCislo.toFixed(2)}`, true)
      .addField('Předpokládaný nárust za dnešek', `${Math.round(predpokladaneNakazeni)}`, true)
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
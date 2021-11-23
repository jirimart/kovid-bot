const dotenv = require('dotenv').config().parsed;
const fetch = require('node-fetch');

const sendData = async () => {
  try {
    const date = new Date(Date.now() - 2*24*60*60*1000);
    const covidDate = date.getFullYear() + "-" + ('0'+(date.getMonth()+1)).slice(-2) + "-" + ('0'+(date.getDate())).slice(-2);
    console.log(covidDate)

    const hospitalizaceDataResponse = await fetch(`https://onemocneni-aktualne.mzcr.cz/api/v3/hospitalizace?page=1&datum%5Bafter%5D=${covidDate}&apiToken=${dotenv.API_KEY}`, {"method":"GET", headers: {accept: 'application/json'}});
    const hospitalizaceData = await hospitalizaceDataResponse.json();

    const incidenceDataResponse = await fetch(`https://onemocneni-aktualne.mzcr.cz/api/v3/incidence-7-14-cr?page=1&datum%5Bafter%5D=${covidDate}&apiToken=${dotenv.API_KEY}`, {"method":"GET", headers: {accept: 'application/json'}});
    const incidenceData = await incidenceDataResponse.json();

    const zakladniPrehledDataResponse = await fetch(`https://onemocneni-aktualne.mzcr.cz/api/v3/zakladni-prehled?page=1&apiToken=${dotenv.API_KEY}`, {"method":"GET", headers: {accept: 'application/json'}});
    const zakladniPrehledData = await zakladniPrehledDataResponse.json();

    const ockovaniPozitivniDataResponse = await fetch(`https://onemocneni-aktualne.mzcr.cz/api/v3/ockovani-pozitivni?page=1&datum%5Bafter%5D=${covidDate}&apiToken=${dotenv.API_KEY}`, {"method":"GET", headers: {accept: 'application/json'}});
    const ockovaniPozitivniData = await ockovaniPozitivniDataResponse.json();

    const tynecNadLabemObceDataResponse = await fetch(`https://onemocneni-aktualne.mzcr.cz/api/v3/obce?page=1&datum%5Bafter%5D=${covidDate}&obec_nazev=T%C3%BDnec%20nad%20Labem&apiToken=${dotenv.API_KEY}`, {"method":"GET", headers: {accept: 'application/json'}});
    const tynecNadLabemObceData = await tynecNadLabemObceDataResponse.json();

    const { Webhook, MessageBuilder } = require('discord-webhook-node');

    const zakladniPrehledZaDenEmbed = new MessageBuilder()
      .setColor('#FF0000')
      .setTitle(`Základní přehled za ${zakladniPrehledData[0].potvrzene_pripady_vcerejsi_den_datum}`)
      .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/8/82/SARS-CoV-2_without_background.png')
      .addField('Nově nakažení', `${zakladniPrehledData[0].potvrzene_pripady_vcerejsi_den}`, true)
      .addField('Aktivní případy', `${zakladniPrehledData[0].aktivni_pripady}`, true)
      .addField('7denní incidence na 100 tisíc obyvatel', `${incidenceData[0].incidence_7_100000}`, false)
      // .addField('\u200B', '\u200B', false)
      
      .addField('Úmrtí celkem', `${zakladniPrehledData[0].umrti}`, true)
      .addField('Očkováno lidí', `${zakladniPrehledData[0].vykazana_ockovani_vcerejsi_den}`, true)
      .setTimestamp();

    const prehledSituaceVNemocnicichZaDenEmbed = new MessageBuilder()
      .setColor('#FF0000')
      .setTitle(`Přehled situace v nemocnicích za ${ockovaniPozitivniData[1].datum}`)
      .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/8/82/SARS-CoV-2_without_background.png')
      .addField('Celkový počet hospitalizovaných', `${hospitalizaceData[1].pocet_hosp}`, true)
      .addField('Hospitalizovaní v těžkém stavu', `${hospitalizaceData[1].stav_tezky}`, true)
      .setTimestamp();

    const ostatniPrehledZaDenEmbed = new MessageBuilder()
      .setColor('#FF0000')
      .setTitle(`Ostatní přehled za ${ockovaniPozitivniData[1].datum}`)
      .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/8/82/SARS-CoV-2_without_background.png')
      .addField('Pozitivní bez očkování', `${ockovaniPozitivniData[1].pozitivni_bez_ockovani + ockovaniPozitivniData[1].pozitivni_nedokoncene_ockovani}`, true)
      .addField('Pozitivní bez očkování', `${ockovaniPozitivniData[1].pozitivni_dokoncene_ockovani + ockovaniPozitivniData[1].pozitivni_posilujici_davka}`, true)
      .setTimestamp();

    const situaceVTynciNadLabemZaDenEmbed = new MessageBuilder()
      .setColor('#FF0000')
      .setTitle(`Situace v Týnci nad Labem za ${tynecNadLabemObceData[1].datum}`)
      .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/8/82/SARS-CoV-2_without_background.png')
      .addField('Aktivní případy', `${tynecNadLabemObceData[1].aktivni_pripady}`, true)
      .addField('Nově nakažení', `${tynecNadLabemObceData[1].nove_pripady}`, true)
      .setTimestamp();

    // console.log(hospitalizaceData)
    // console.log(incidenceData)
    // console.log(zakladniPrehledData)
    // console.log(ockovaniPozitivniData)
    // console.log(tynecNadLabemObceData)

    const afrika3 = new Webhook(dotenv.AFRIKA3_HOOK);
    const znasilneniSlinivky = new Webhook(dotenv.ZNASILNENI_SLINIVKY_HOOK);
    const testServer = new Webhook(dotenv.TEST_SERVER_HOOK);
    const normalniLide = new Webhook(dotenv.NORMALNI_LIDE);

    function sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }

    afrika3.send(zakladniPrehledZaDenEmbed);
    await sleep(200);
    afrika3.send(prehledSituaceVNemocnicichZaDenEmbed)
    await sleep(200);
    afrika3.send(ostatniPrehledZaDenEmbed)
    await sleep(200);
    // testServer.send(situaceVTynciNadLabemZaDenEmbed)

    await sleep(1000)

    znasilneniSlinivky.send(zakladniPrehledZaDenEmbed);
    await sleep(200);
    znasilneniSlinivky.send(prehledSituaceVNemocnicichZaDenEmbed)
    await sleep(200);
    znasilneniSlinivky.send(ostatniPrehledZaDenEmbed)
    await sleep(200);
    
    await sleep(1000)

    testServer.send(zakladniPrehledZaDenEmbed);
    await sleep(200);
    testServer.send(prehledSituaceVNemocnicichZaDenEmbed)
    await sleep(200);
    testServer.send(ostatniPrehledZaDenEmbed)
    await sleep(200);
    testServer.send(situaceVTynciNadLabemZaDenEmbed)

    await sleep(1000)

    normalniLide.send(zakladniPrehledZaDenEmbed);
    await sleep(200);
    normalniLide.send(prehledSituaceVNemocnicichZaDenEmbed)
    await sleep(200);
    normalniLide.send(ostatniPrehledZaDenEmbed)
    await sleep(200);
    normalniLide.send(situaceVTynciNadLabemZaDenEmbed)
  } catch (error) {
    console.log(error);
  }
}

const CronJob = require('cron').CronJob;
const job = new CronJob('00 20 8 * * 0-6', function() {
  sendData();
  }, function () {
    console.log("Odesláno");
  },
  true,
  'Europe/Prague'
);

const dotenv = require('dotenv').config().parsed;
const fetch = require('node-fetch');

const sendData = async () => {
  try {
    const date = new Date(Date.now() - 7*24*60*60*1000);
    const covidDate = date.getFullYear() + "-" + ('0'+(date.getMonth()+1)).slice(-2) + "-" + ('0'+(date.getDate())).slice(-2);

    const yesterday = new Date(Date.now() - 1*24*60*60*1000);
    const covidYesterday = yesterday.getFullYear() + "-" + ('0'+(yesterday.getMonth()+1)).slice(-2) + "-" + ('0'+(yesterday.getDate())).slice(-2);

    const hospitalizaceDataResponse = await fetch(`https://onemocneni-aktualne.mzcr.cz/api/v3/hospitalizace?page=1&datum%5Bafter%5D=${covidDate}&apiToken=${dotenv.API_KEY}`, {"method":"GET", headers: {accept: 'application/json'}});
    const hospitalizaceData = await hospitalizaceDataResponse.json();

    const incidenceDataResponse = await fetch(`https://onemocneni-aktualne.mzcr.cz/api/v3/incidence-7-14-cr?page=1&datum%5Bafter%5D=${covidDate}&apiToken=${dotenv.API_KEY}`, {"method":"GET", headers: {accept: 'application/json'}});
    const incidenceData = await incidenceDataResponse.json();

    const zakladniPrehledDataResponse = await fetch(`https://onemocneni-aktualne.mzcr.cz/api/v3/zakladni-prehled?page=1&apiToken=${dotenv.API_KEY}`, {"method":"GET", headers: {accept: 'application/json'}});
    const zakladniPrehledData = await zakladniPrehledDataResponse.json();

    const ockovaniPozitivniDataResponse = await fetch(`https://onemocneni-aktualne.mzcr.cz/api/v3/ockovani-pozitivni?page=1&datum%5Bafter%5D=${covidDate}&apiToken=${dotenv.API_KEY}`, {"method":"GET", headers: {accept: 'application/json'}});
    const ockovaniPozitivniData = await ockovaniPozitivniDataResponse.json();

    const tynecNadLabemObceDataResponse = await fetch(`https://onemocneni-aktualne.mzcr.cz/api/v3/obce?page=1&datum%5Bbefore%5D=${covidYesterday}&datum%5Bafter%5D=${covidYesterday}&obec_nazev=T%C3%BDnec%20nad%20Labem&apiToken=${dotenv.API_KEY}`, {"method":"GET", headers: {accept: 'application/json'}});
    const tynecNadLabemObceData = await tynecNadLabemObceDataResponse.json();

    const kolinObceDataResponse = await fetch(`https://onemocneni-aktualne.mzcr.cz/api/v3/obce?page=1&datum%5Bbefore%5D=${covidYesterday}&datum%5Bafter%5D=${covidYesterday}&obec_nazev=Kol%C3%ADn&apiToken=${dotenv.API_KEY}`, {"method":"GET", headers: {accept: 'application/json'}});
    const kolinObceData = await kolinObceDataResponse.json();

    const nymburkObceDataResponse = await fetch(`https://onemocneni-aktualne.mzcr.cz/api/v3/obce?page=1&datum%5Bbefore%5D=${covidYesterday}&datum%5Bafter%5D=${covidYesterday}&obec_nazev=Nymburk&apiToken=${dotenv.API_KEY}`, {"method":"GET", headers: {accept: 'application/json'}});
    const nymburkObceData = await nymburkObceDataResponse.json();

    const { Webhook, MessageBuilder } = require('discord-webhook-node');

    const QuickChart = require('quickchart-js');

    const nakazeniZa7DniChart = new QuickChart();
    nakazeniZa7DniChart
      .setConfig({
        type: 'line',
        data: { labels: [`${ockovaniPozitivniData[0].datum}`, `${ockovaniPozitivniData[1].datum}`,`${ockovaniPozitivniData[2].datum}`,`${ockovaniPozitivniData[3].datum}`,`${ockovaniPozitivniData[4].datum}`,`${ockovaniPozitivniData[5].datum}`,`${ockovaniPozitivniData[6].datum}`],
                datasets: [
                  { label: 'Počet nově nakažených za den za posledních 7 dní',
                    data: [`${ockovaniPozitivniData[0].pozitivni_celkem}`, `${ockovaniPozitivniData[1].pozitivni_celkem}`,`${ockovaniPozitivniData[2].pozitivni_celkem}`,`${ockovaniPozitivniData[3].pozitivni_celkem}`,`${ockovaniPozitivniData[4].pozitivni_celkem}`,`${ockovaniPozitivniData[5].pozitivni_celkem}`,`${ockovaniPozitivniData[6].pozitivni_celkem}`],
                    fill: false,
                    borderColor: 'rgb(255, 0, 0)',
                    backgroundColor: 'rgba(255, 0, 0, 0.5)'
                  }
                ]
        },
      })
      .setWidth(800)
      .setHeight(400)
      .setBackgroundColor("rgb(0,0,0)");

      const hospitalizovani7DniChart = new QuickChart();
      hospitalizovani7DniChart
        .setConfig({
          type: 'line',
          data: { labels: [`${hospitalizaceData[0].datum}`, `${hospitalizaceData[1].datum}`,`${hospitalizaceData[2].datum}`,`${hospitalizaceData[3].datum}`,`${hospitalizaceData[4].datum}`,`${hospitalizaceData[5].datum}`,`${hospitalizaceData[6].datum}`],
                  datasets: [
                    { label: 'Počet hospitalizovaných celkem za každý den za posledních 7 dní',
                      data: [`${hospitalizaceData[0].pocet_hosp}`, `${hospitalizaceData[1].pocet_hosp}`,`${hospitalizaceData[2].pocet_hosp}`,`${hospitalizaceData[3].pocet_hosp}`,`${hospitalizaceData[4].pocet_hosp}`,`${hospitalizaceData[5].pocet_hosp}`,`${hospitalizaceData[6].pocet_hosp}`],
                      fill: false,
                      borderColor: 'rgb(255, 0, 0)',
                      backgroundColor: 'rgba(255, 0, 0, 0.5)'
                    }
                  ]
          },
        })
        .setWidth(800)
        .setHeight(400)
        .setBackgroundColor("rgb(0,0,0)");

      const ockovani7DniChart = new QuickChart();
      ockovani7DniChart
        .setConfig({
          type: 'line',
          data: { labels: [`${hospitalizaceData[0].datum}`, `${hospitalizaceData[1].datum}`,`${hospitalizaceData[2].datum}`,`${hospitalizaceData[3].datum}`,`${hospitalizaceData[4].datum}`,`${hospitalizaceData[5].datum}`,`${hospitalizaceData[6].datum}`],
                  datasets: [
                    { label: 'Počet hospitalizovaných celkem za každý den za posledních 7 dní',
                      data: [`${hospitalizaceData[0].pocet_hosp}`, `${hospitalizaceData[1].pocet_hosp}`,`${hospitalizaceData[2].pocet_hosp}`,`${hospitalizaceData[3].pocet_hosp}`,`${hospitalizaceData[4].pocet_hosp}`,`${hospitalizaceData[5].pocet_hosp}`,`${hospitalizaceData[6].pocet_hosp}`],
                      fill: false,
                      borderColor: 'rgb(255, 0, 0)',
                      backgroundColor: 'rgba(255, 0, 0, 0.5)'
                    }
                  ]
          },
        })
        .setWidth(800)
        .setHeight(400)
        .setBackgroundColor("rgb(0,0,0)");

    const zakladniPrehledZaDenEmbed = new MessageBuilder()
      .setColor('#FF0000')
      .setTitle(`Základní přehled za ${zakladniPrehledData[0].potvrzene_pripady_vcerejsi_den_datum}`)
      .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/8/82/SARS-CoV-2_without_background.png')
      .addField('Nově nakažení', `${zakladniPrehledData[0].potvrzene_pripady_vcerejsi_den}`, true)
      .addField('Aktivní případy', `${zakladniPrehledData[0].aktivni_pripady}`, true)
      .addField('7denní incidence na 100 tisíc obyvatel', `${incidenceData[6].incidence_7_100000}`, false)
      // .addField('\u200B', '\u200B', false)
      
      .addField('Úmrtí celkem', `${zakladniPrehledData[0].umrti}`, true)
      .addField('Očkováno lidí', `${zakladniPrehledData[0].vykazana_ockovani_vcerejsi_den}`, true)
      .setImage(await nakazeniZa7DniChart.getUrl())
      .setTimestamp();

    const prehledSituaceVNemocnicichZaDenEmbed = new MessageBuilder()
      .setColor('#FF0000')
      .setTitle(`Přehled situace v nemocnicích za ${ockovaniPozitivniData[6].datum}`)
      .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/8/82/SARS-CoV-2_without_background.png')
      .addField('Celkový počet hospitalizovaných', `${hospitalizaceData[6].pocet_hosp}`, true)
      .addField('Hospitalizovaní v těžkém stavu', `${hospitalizaceData[6].stav_tezky}`, true)
      .setImage(await hospitalizovani7DniChart.getUrl())
      .setTimestamp();

    const ostatniPrehledZaDenEmbed = new MessageBuilder()
      .setColor('#FF0000')
      .setTitle(`Ostatní přehled za ${ockovaniPozitivniData[6].datum}`)
      .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/8/82/SARS-CoV-2_without_background.png')
      .addField('Pozitivní bez očkování', `${ockovaniPozitivniData[6].pozitivni_bez_ockovani + ockovaniPozitivniData[1].pozitivni_nedokoncene_ockovani}`, true)
      .addField('Pozitivní s očkováním', `${ockovaniPozitivniData[6].pozitivni_dokoncene_ockovani + ockovaniPozitivniData[1].pozitivni_posilujici_davka}`, true)
      .setTimestamp();
      

    const situaceVTynciNadLabemZaDenEmbed = new MessageBuilder()
      .setColor('#FF0000')
      .setTitle(`Situace v Týnci nad Labem za ${tynecNadLabemObceData[0].datum}`)
      .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/8/82/SARS-CoV-2_without_background.png')
      .addField('Aktivní případy', `${tynecNadLabemObceData[0].aktivni_pripady}`, true)
      .addField('Nově nakažení', `${tynecNadLabemObceData[0].nove_pripady}`, true)
      .setTimestamp();

    const situaceKolineZaDenEmbed = new MessageBuilder()
      .setColor('#FF0000')
      .setTitle(`Situace v Kolíně za ${kolinObceData[0].datum}`)
      .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/8/82/SARS-CoV-2_without_background.png')
      .addField('Aktivní případy', `${kolinObceData[0].aktivni_pripady}`, true)
      .addField('Nově nakažení', `${kolinObceData[0].nove_pripady}`, true)
      .setTimestamp();

    const situaceVNymburkuZaDenEmbed = new MessageBuilder()
      .setColor('#FF0000')
      .setTitle(`Situace v Nymburku za ${nymburkObceData[0].datum}`)
      .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/8/82/SARS-CoV-2_without_background.png')
      .addField('Aktivní případy', `${nymburkObceData[0].aktivni_pripady}`, true)
      .addField('Nově nakažení', `${nymburkObceData[0].nove_pripady}`, true)
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
    
    testServer.send(zakladniPrehledZaDenEmbed);
    await sleep(1000);
    testServer.send(prehledSituaceVNemocnicichZaDenEmbed)
    await sleep(1000);
    testServer.send(ostatniPrehledZaDenEmbed)
    await sleep(1000);
    testServer.send(situaceVTynciNadLabemZaDenEmbed)
    await sleep(1000);
    testServer.send(situaceKolineZaDenEmbed)
    await sleep(1000);
    testServer.send(situaceVNymburkuZaDenEmbed)
    
    await sleep(1000)

    afrika3.send(zakladniPrehledZaDenEmbed);
    await sleep(1000);
    afrika3.send(prehledSituaceVNemocnicichZaDenEmbed)
    await sleep(1000);
    afrika3.send(ostatniPrehledZaDenEmbed)
    await sleep(1000);
    afrika3.send(situaceVNymburkuZaDenEmbed)
    await sleep(1000);
    afrika3.send(situaceKolineZaDenEmbed)

    await sleep(1000)

    znasilneniSlinivky.send(zakladniPrehledZaDenEmbed);
    await sleep(1000);
    znasilneniSlinivky.send(prehledSituaceVNemocnicichZaDenEmbed)
    await sleep(1000);
    znasilneniSlinivky.send(ostatniPrehledZaDenEmbed)
    await sleep(1000);
    znasilneniSlinivky.send(situaceVTynciNadLabemZaDenEmbed)
    await sleep(1000);
    znasilneniSlinivky.send(situaceKolineZaDenEmbed)
    
    await sleep(1000)

    normalniLide.send(zakladniPrehledZaDenEmbed);
    await sleep(1000);
    normalniLide.send(prehledSituaceVNemocnicichZaDenEmbed)
    await sleep(1000);
    normalniLide.send(ostatniPrehledZaDenEmbed)
    await sleep(1000);
    normalniLide.send(situaceVTynciNadLabemZaDenEmbed)
    await sleep(1000);
    normalniLide.send(situaceKolineZaDenEmbed)
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

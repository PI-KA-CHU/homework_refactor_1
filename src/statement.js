function statement (invoice, plays) {
  return renderText(getData(invoice, plays));
}

function renderText(datas) {
  const format = forUSDFormat();
  let result = `Statement for ${datas.customer}\n`;

  for (let info of datas.payload) {
    result += ` ${info.name}: ${format(info.amount / 100)} (${info.audience} seats)\n`;
  }

  result += `Amount owed is ${format(datas.totalAmount / 100)}\n`;
  result += `You earned ${datas.volumeCredits} credits \n`;
  return result;
}

function renderHtml(datas) {
  const format = forUSDFormat();
  let result = "";

  result += `<h1>Statement for ${datas.customer}</h1>\n`;
  result += '<table>\n' + '<tr><th>play</th><th>seats</th><th>cost</th></tr>';
  for(info in datas.payload){
    result += ` <tr><td>${info.name}</td><td>${format(info.amount / 100)}</td><td>${info.audience}</td></tr>\n`
  }
  result += '</table>\n' +
    `<p>Amount owed is <em>${format(datas.totalAmount / 100)}</em></p>\n` +
    `<p>You earned <em>${datas.volumeCredits}</em> credits</p>\n`;

  return result;
}

function getData(invoice, plays){
  let result = {};

  result.volumeCredits = forVolumeCredits(invoice,plays);
  result.payload = generatePayLoad(invoice, plays);
  result.totalAmount = caculateTotalAmount(invoice, plays);
  result.customer = invoice.customer;

  return result;
}

function generatePayLoad(invoice, plays){
  let payload = [];
  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    const thisAmount = caculateAmount(play, perf);

    payload.push({
      name : play.name,
      audience : perf.audience,
      amount : thisAmount
    })
  }

  return payload;
}

function caculateTotalAmount(invoice, plays){
  let totalAmount = 0;
  for (let perf of invoice.performances) {
      const play = plays[perf.playID];
      totalAmount += caculateAmount(play, perf);
  }
  return totalAmount;
}

function forVolumeCredits(invoice, plays) {

  let volumeCredits = 0;
  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    volumeCredits += Math.max(perf.audience - 30, 0);
  
    if ('comedy' === play.type) volumeCredits += Math.floor(perf.audience / 5);
  }

  return volumeCredits;
}

function caculateAmount(play, perf) {
  let strategies = {
    'tragedy':  caculateTragedyAmount(perf.audience),
    'comedy': caculateComedyAmount(perf.audience)
  }

  if(!strategies[play.type]){
    throw new Error(`unknown type: ${play.type}`)
  }

  return strategies[play.type];

  function caculateComedyAmount(audience) {
    let result = 30000;
    if (audience > 20) {
      result += 10000 + 500 * (audience - 20);
    }
    result += 300 * audience;
    return result;
  }

  function caculateTragedyAmount(audience) {
    let result = 40000;
    if (audience > 30) {
      result += 1000 * (audience - 30);
    }
    return result;
  }
}

function forUSDFormat() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format;
}

module.exports = {
  statement,
};

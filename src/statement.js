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
  switch (play.type) {
    case 'tragedy':
      thisAmount = 40000;
      if (perf.audience > 30) {
        thisAmount += 1000 * (perf.audience - 30);
      }
      break;
    case 'comedy':
      thisAmount = 30000;
      if (perf.audience > 20) {
        thisAmount += 10000 + 500 * (perf.audience - 20);
      }
      thisAmount += 300 * perf.audience;
      break;
    default:
      throw new Error(`unknown type: ${play.type}`);
  }
  return thisAmount;
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

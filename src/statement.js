function statement (invoice, plays) {
  const format = forUSDFormat();

  const datas = getData(invoice, plays);
  let result = `Statement for ${datas.customer}\n`;

  for (let info of datas.payload) {
    result += ` ${info.name}: ${format(info.amount / 100)} (${info.audience} seats)\n`;
  }

  result += `Amount owed is ${format(datas.totalAmount / 100)}\n`;
  result += `You earned ${datas.volumeCredits} credits \n`;
  return result;

}

function getData(invoice, plays){
  let {customer} = invoice;
  let payload = [];
  let totalAmount = 0;
  let volumeCredits = 0;  
  let result = {customer, payload, totalAmount, volumeCredits};

  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    const thisAmount = caculateAmount(play, perf);

    volumeCredits += forVolumeCredits(play, perf);
    totalAmount += thisAmount;

    result.payload.push({
      name : play.name,
      audience : perf.audience,
      amount : thisAmount
    })
  }
  result.totalAmount = totalAmount;
  result.volumeCredits = volumeCredits;

  return result;
}

function forVolumeCredits(play, perf) {
  let volumeCredits = Math.max(perf.audience - 30, 0);
  
  // add extra credit for every ten comedy attendees
  if ('comedy' === play.type) volumeCredits += Math.floor(perf.audience / 5);

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

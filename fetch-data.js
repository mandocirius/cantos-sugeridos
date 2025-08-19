const https = require('https');

function getNextSunday() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    today.setDate(today.getDate() + daysUntilSunday);
    return today;
}

const nextSunday = getNextSunday();
const year = nextSunday.getFullYear();
const month = nextSunday.getMonth() + 1; // Month is 0-indexed
const day = nextSunday.getDate();

const options = {
  hostname: 'litcal.johnromanodorazio.com',
  path: `/api/v4/calendar?year=${year}&month=${month}&day=${day}`,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
  }
};

https.get(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(data);
  });

}).on('error', (err) => {
  console.error('Error: ', err.message);
});
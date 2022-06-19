const axios = require('axios');
const { subDays } = require('date-fns');
const { format, utcToZonedTime } = require('date-fns-tz');
const _ = require('lodash');

const countryInfo = require('../../tools/downloaded/countryInfo.json');

async function getDataSource() {
  const countryByCc = _.keyBy(countryInfo, 'cc');
  const globalStats = await generateGlobalStats();

  console.log('hihi', globalStats);

  return {
    countryByCc,
    globalStats,
  };
}

async function generateGlobalStats() {
  //HTTP 클라이언트 생ㅓ
  const apiClient = axios.create({
    baseURL: process.env.CORONABOARD_API_BASE_URL || 'http://localhost:8080',
  });

  const response = await apiClient.get('global-stats');

  const groupedByDate = _.groupBy(response.data.result, 'date');

  const now = new Date('2021-06-05');
  const timeZone = 'Asia/Seoul';
  const today = format(utcToZonedTime(now, timeZone), 'yyyy-MM-dd');
  const yesterday = format(
    utcToZonedTime(subDays(now, 1), timeZone),
    'yyyy-MM-dd',
  );

  if (!groupedByDate[today]) {
    throw new Error('Data for today is missing');
  }

  return createGlobalStatWithPrevField(
    groupedByDate[today],
    groupedByDate[yesterday],
  );
}

function createGlobalStatWithPrevField(todayStats, yesterdayStats) {
  //어제와 오늘 데이터를 하나의 객체 배열로 만든다.
  const yesterdayStatsByCc = _.keyBy(yesterdayStats, 'cc'); //국가 코드를 기준으로 변환한다. 국가 코드를 기준으로 검색 가능함.

  const globalStatWithPrev = todayStats.map((todayStat) => {
    const cc = todayStat.cc;
    const yesterdayStat = yesterdayStatsByCc[cc];

    if (yesterdayStat) {
      return {
        ...todayStat,
        confirmedPrev: yesterdayStat.confirmed || 0,
        deathPrev: yesterdayStat.death || 0,
        negativePrev: yesterdayStat.negative || 0,
        releasedPrev: yesterdayStat.released || 0,
        testedPrev: yesterdayStat.tested || 0,
      };
    } else return todayStat;
  });

  return globalStatWithPrev;
}

module.exports = { getDataSource };

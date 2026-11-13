// Independent academy app shares approved admissions through the Lab API.
// No source/data files are copied into another repository.
const base = process.env.SUPREMA_LAB_URL || 'https://suprema-lab.vercel.app';
(async () => {
  const url = new URL(base);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') throw new Error('HTTPS service URL required');
  const response = await fetch(new URL('/api/admissions', url), { headers: { Origin: 'https://consultantapp.vercel.app' }, signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  if (!response.ok || !data.success || !Array.isArray(data.rows)) throw new Error('공통 입결 조회 실패');
  console.log(JSON.stringify({ service: '수프리마 랩', sharedRows: data.rows.length, mode: 'shared-api', sourceCopy: false }));
})().catch(error => { console.error(error.message); process.exitCode = 1; });

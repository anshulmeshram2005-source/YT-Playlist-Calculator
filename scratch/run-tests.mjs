import { parseYouTubeUrl } from '../src/lib/youtube-parser.ts';
import { formatDuration, adjustedDuration, timeSaved, buildSpeedTable, calculateWatchPlan, calculateFinishBy } from '../src/lib/time-utils.ts';

const results = [];

function assert(name, condition, details = '') {
  results.push({ name, pass: Boolean(condition), details });
  console.log(`${condition ? 'PASS' : 'FAIL'}: ${name} ${details ? '(' + details + ')' : ''}`);
}

// 1. YouTube Parser Tests
console.log('--- Testing YouTube Parser ---');
const t1 = parseYouTubeUrl('https://www.youtube.com/playlist?list=PL1234567890123456');
assert('Parse standard playlist URL', t1.type === 'playlist' && t1.id === 'PL1234567890123456', `Got type=${t1.type}, id=${t1.id}`);

const t2 = parseYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL1234567890123456');
assert('Parse watch URL with playlist parameter', t2.type === 'playlist' && t2.id === 'PL1234567890123456', `Got type=${t2.type}, id=${t2.id}`);

const t3 = parseYouTubeUrl('PL1234567890123456');
assert('Parse raw playlist ID (PL...)', t3.type === 'playlist' && t3.id === 'PL1234567890123456', `Got type=${t3.type}, id=${t3.id}`);

const t4 = parseYouTubeUrl('OLAK5uy_k1234567890123456');
assert('Parse raw YouTube Music album playlist ID (OLAK5uy_...)', t4.type === 'playlist', `Got type=${t4.type}, id=${t4.id}`);

const t5 = parseYouTubeUrl('https://www.youtube.com/playlist?list=OLAK5uy_k1234567890123456');
assert('Parse YouTube Music album playlist URL (list=OLAK...)', t5.type === 'playlist', `Got type=${t5.type}, id=${t5.id}`);

const t6 = parseYouTubeUrl('https://youtu.be/dQw4w9WgXcQ');
assert('Parse youtu.be short URL', t6.type === 'video' && t6.id === 'dQw4w9WgXcQ', `Got type=${t6.type}, id=${t6.id}`);

const t7 = parseYouTubeUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');
assert('Parse YouTube Shorts URL', t7.type === 'video' && t7.id === 'dQw4w9WgXcQ', `Got type=${t7.type}, id=${t7.id}`);

const t8 = parseYouTubeUrl('dQw4w9WgXcQ');
assert('Parse raw video ID', t8.type === 'video' && t8.id === 'dQw4w9WgXcQ', `Got type=${t8.type}, id=${t8.id}`);

const t9 = parseYouTubeUrl('https://www.youtube.com/@mkbhd');
assert('Parse channel handle URL', t9.type === 'channel' && t9.id === 'mkbhd', `Got type=${t9.type}, id=${t9.id}`);

const t10 = parseYouTubeUrl('random_gibberish_string');
assert('Parse invalid input as unknown', t10.type === 'unknown', `Got type=${t10.type}`);

const t11 = parseYouTubeUrl('');
assert('Parse empty input as unknown', t11.type === 'unknown', `Got type=${t11.type}`);

// 2. Time Utils Tests
console.log('\n--- Testing Time Utils ---');
const d0 = formatDuration(0);
assert('Format 0 seconds', d0.display === '0s' && d0.hours === 0 && d0.minutes === 0 && d0.seconds === 0, d0.display);

const d1 = formatDuration(59);
assert('Format 59 seconds', d1.display === '59s', d1.display);

const d2 = formatDuration(3665);
assert('Format 1h 1m 5s', d2.display === '1h 1m 5s' && d2.displayShort === '1:01:05', d2.display);

const d3 = formatDuration(86400);
assert('Format 24 hours (86400s)', d3.hours === 24 && d3.display === '24h 0s', d3.display);

const a1 = adjustedDuration(3600, 2);
assert('Adjusted duration at 2x', a1 === 1800, `Got ${a1}`);

const a2 = adjustedDuration(3600, 1.5);
assert('Adjusted duration at 1.5x', a2 === 2400, `Got ${a2}`);

const a3 = adjustedDuration(3600, 0);
assert('Adjusted duration at 0x (fallback)', a3 === 3600, `Got ${a3}`);

const s1 = timeSaved(3600, 2);
assert('Time saved at 2x', s1 === 1800, `Got ${s1}`);

const plan = calculateWatchPlan(36000, 60, 1, new Date('2026-10-01'));
assert('Watch plan 10 hours at 1h/day = 10 days', plan.daysNeeded === 10, `Got ${plan.daysNeeded} days`);

const finish = calculateFinishBy(36000, new Date(Date.now() + 10 * 86400000), 1);
assert('Finish by in 10 days feasible', finish.feasible === true && finish.daysAvailable === 10, `Days: ${finish.daysAvailable}`);

const failCount = results.filter(r => !r.pass).length;
console.log(`\nTOTAL: ${results.length} tests, ${results.length - failCount} passed, ${failCount} failed.`);

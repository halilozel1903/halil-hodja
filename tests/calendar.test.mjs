import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePublicCalendar, collectPublicCalendar} from '../lib/hodja/calendar.mjs';
const now=new Date('2026-10-29T18:00:00Z');
function calendar(length=365){
  return Array.from({length},(_,i)=>{
    const date=new Date(now.getTime()-(364-i)*86400000).toISOString().slice(0,10);
    const count=i>=331?2:0;
    return `<td data-date="${date}" id="day-${i}"></td><tool-tip for="day-${i}">${count?`${count} contributions`:'No contributions'} on date.</tool-tip>`;
  }).join('');
}
test('profile contribution streak counts all visible contribution types, separately from commits',()=>{
  const a=parsePublicCalendar(calendar(),now);
  assert.equal(a.currentContributionStreakDays,34);
  assert.equal(a.longestContributionStreakDays,34);
  assert.equal(a.totalProfileContributions,68);
  assert.equal(Object.keys(a.dailyProfileContributions).length,365);
  assert.equal(a.publicCommits,undefined);
});
test('incomplete or changed calendar markup cannot become a fabricated zero streak',()=>{
  assert.throws(()=>parsePublicCalendar(calendar(364),now),/incomplete/);
  assert.throws(()=>parsePublicCalendar('<html>unavailable</html>',now),/incomplete/);
});
test('calendar request is anonymous and failures stay unavailable',async()=>{
  await assert.rejects(()=>collectPublicCalendar('dev',async(url,init)=>{
    assert.equal(url,'https://github.com/users/dev/contributions');
    assert.equal(init.headers.Authorization,undefined);
    return new Response('',{status:503});
  },now),/could not be loaded/);
});

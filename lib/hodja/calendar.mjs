import { commitStreaks } from './activity.mjs';

// This endpoint is requested anonymously. Only counts already visible on the
// public GitHub profile are read; no private repository names or events.
export function parsePublicCalendar(html, now = new Date()) {
  const byId = new Map();
  for(const tag of html.matchAll(/<td\b[^>]*data-date="[^"]+"[^>]*>/g)) {
    const date=tag[0].match(/data-date="([^"]+)"/)?.[1];
    const id=tag[0].match(/\bid="([^"]+)"/)?.[1];
    if(date&&id)byId.set(id,date);
  }
  const days={};
  for(const tag of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)) {
    const id=tag[1].match(/\bfor="([^"]+)"/)?.[1];
    const date=byId.get(id);
    if(!date)continue;
    const text=tag[2].replace(/<[^>]+>/g,'').trim();
    const number=text.match(/([\d,]+) contributions?\b/i)?.[1];
    if(number)days[date]=Number(number.replaceAll(',',''));
    else if(/No contributions?\b/i.test(text))days[date]=0;
  }
  const today=new Date(now).toISOString().slice(0,10);
  const first=new Date(Date.parse(today+'T00:00:00Z')-364*86400000).toISOString().slice(0,10);
  const daily=Object.fromEntries(Object.entries(days).filter(([date])=>date>=first&&date<=today).sort(([a],[b])=>a.localeCompare(b)));
  if(Object.keys(daily).length!==365)throw new Error('Public GitHub calendar is incomplete; streak was not inferred.');
  const s=commitStreaks(daily,now);
  const visibleTotal=Object.entries(days).filter(([date])=>date<=today).reduce((sum,[,n])=>sum+n,0);
  return {currentContributionStreakDays:s.currentStreakDays,longestContributionStreakDays:s.longestStreakDays,activeContributionDays:s.activeCommitDays,totalProfileContributions:visibleTotal,dailyProfileContributions:daily,contributionPeriod:{from:first,to:today,days:365},calendarSource:'anonymous-public-github-profile',calendarIncludes:'publicly visible GitHub contributions; may include anonymized private counts enabled by the profile owner'};
}
export async function collectPublicCalendar(username, fetcher = fetch, now = new Date()) {
  const response=await fetcher(`https://github.com/users/${username}/contributions`,{headers:{'User-Agent':'Halil-Hodja/1.2','Accept':'text/html','Accept-Language':'en'},redirect:'manual',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('Public GitHub calendar could not be loaded.');
  return parsePublicCalendar(await response.text(),now);
}

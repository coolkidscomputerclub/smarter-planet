/**
 * Returns a description of this date in relative terms.

 * Examples, where new Date().toString() == "Mon Nov 23 2009 17:36:51 GMT-0500 (EST)":
 *
 * new Date().toRelativeTime()
 * --> 'Just now'
 *
 * new Date("Nov 21, 2009").toRelativeTime()
 * --> '2 days ago'
 *
 * new Date("Nov 25, 2009").toRelativeTime()
 * --> '2 days from now'
 *
 * // One second ago
 * new Date("Nov 23 2009 17:36:50 GMT-0500 (EST)").toRelativeTime()
 * --> '1 second ago'
 *
 * toRelativeTime() takes an optional argument - a configuration object.
 * It can have the following properties:
 * - now - Date object that defines "now" for the purpose of conversion.
 *         By default, current date & time is used (i.e. new Date())
 * - nowThreshold - Threshold in milliseconds which is considered "Just now"
 *                  for times in the past or "Right now" for now or the immediate future
 * - smartDays - If enabled, dates within a week of now will use Today/Yesterday/Tomorrow
 *               or weekdays along with time, e.g. "Thursday at 15:10:34"
 *               rather than "4 days ago" or "Tomorrow at 20:12:01"
 *               instead of "1 day from now"
 *
 * If a single number is given as argument, it is interpreted as nowThreshold:
 *
 * // One second ago, now setting a now_threshold to 5 seconds
 * new Date("Nov 23 2009 17:36:50 GMT-0500 (EST)").toRelativeTime(5000)
 * --> 'Just now'
 *
 * // One second in the future, now setting a now_threshold to 5 seconds
 * new Date("Nov 23 2009 17:36:52 GMT-0500 (EST)").toRelativeTime(5000)
 * --> 'Right now'
 *
 */Date.prototype.toRelativeTime=function(){var e=function(e){var s=t(e),o=s.now||new Date,u=o-this,a=u<=0;u=Math.abs(u);if(u<=s.nowThreshold)return a?"Right now":"Just now";if(s.smartDays&&u<=6*i)return n(this,o);var f=null;for(var l in r){if(u<r[l])break;f=l;u/=r[l]}u=Math.floor(u);u!==1&&(f+="s");return[u,f,a?"from now":"ago"].join(" ")},t=function(e){e||(e=0);typeof e=="string"&&(e=parseInt(e,10));if(typeof e=="number"){isNaN(e)&&(e=0);return{nowThreshold:e}}return e},n=function(e,t){var n,r=e.getDay(),i=r-t.getDay();i==0?n="Today":i==-1?n="Yesterday":i==1&&e>t?n="Tomorrow":n=s[r];return n+" at "+e.toLocaleTimeString()},r={millisecond:1,second:1e3,minute:60,hour:60,day:24,month:30,year:12},i=r.millisecond*r.second*r.minute*r.hour*r.day,s=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];return e}();Date.fromString=function(e){return new Date(Date.parse(e))};
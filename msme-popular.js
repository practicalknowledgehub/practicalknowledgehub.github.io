(function(){'use strict';
const fallback=[
{path:'/government-msme-loan-schemes-2026.html',title:'Government Loan and Subsidy Schemes for MSMEs'},
{path:'/commercial-property-purchase-loan-msme-india.html',title:'Commercial Property Purchase Loans for MSMEs'},
{path:'/msme-loan-interest-rates-how-to-get-better-rate.html',title:'How to Get a Better MSME Loan Interest Rate'},
{path:'/13-week-cash-flow-forecast-msme.html',title:'13-Week Cash Flow Forecast for MSMEs'},
{path:'/why-banks-reject-msme-loans.html',title:'Why Banks Reject MSME Loan Applications'}];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.addEventListener('DOMContentLoaded',async()=>{
 const target=document.querySelector('[data-msme-related],#recommended-articles');if(!target)return;
 let rows=fallback,verified=false;
 try{const response=await fetch('/popular-articles.json',{cache:'no-store'});if(response.ok){const data=await response.json();if(data&&Array.isArray(data.articles)){const valid=data.articles.filter(a=>a&&/^\/[a-z0-9-]+\.html$/.test(a.path)&&typeof a.title==='string'&&a.title.trim()&& !/calculator|test\.html/i.test(a.path)).slice(0,5);if(valid.length){rows=valid;verified=true}}}}catch(e){}
 const aside=document.createElement('aside');aside.className='msme-popular-panel';
 aside.style.cssText='background:#fff;border:1px solid #dce6ef;border-radius:12px;padding:18px;margin:14px 0';
 aside.innerHTML='<h3>'+(verified?'Most Read Articles':'Recommended Reading')+'</h3><p class="msme-popular-sub">'+(verified?'Based on aggregated article views over the previous 30 days':'Selected practical guides for MSME entrepreneurs')+'</p><ol>'+rows.map(a=>'<li><a href="'+esc(a.path)+'">'+esc(a.title)+'</a></li>').join('')+'</ol>';
 target.append(aside);
});})();
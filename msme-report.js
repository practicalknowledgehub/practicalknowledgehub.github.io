/* MSME Knowledge Hub reporting: print-quality, input-validated reports. */
(()=>{'use strict';
const SITE='https://msmeknowledgehub.com';
const config={
 'msme-business-loan-emi-calculator.html':['EMI','e_calculate'],
 'ped-calculator.html':['PED','calculate'],
 'negotiated-repayment-calculator.html':['Negotiated_Repayment','calculate'],
 'business-loan-eligibility-calculator.html':['Business_Loan_Eligibility','calculate'],
 'msme-working-capital-calculator.html':['Working_Capital','calculate'],
 'msme-dscr-calculator.html':['DSCR',null],
 'msme-drawing-power-calculator.html':['Drawing_Power',null],
 'cash-credit-interest-calculator.html':['Cash_Credit_Interest','cc_calc']};
const key=location.pathname.split('/').pop(),cfg=config[key];if(!cfg)return;
const clean=x=>String(x??'').replace(/\s+/g,' ').trim();
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inputs=()=>[...document.querySelectorAll('main input,main select,main textarea,.content input,.content select')].filter(e=>!e.closest('.msme-report-actions')&&e.id!=='site-language'&&e.type!=='hidden'&&e.type!=='button'&&e.type!=='submit');
const snapshot=()=>JSON.stringify(inputs().map(e=>[e.id,e.name,e.type==='checkbox'?e.checked:e.value]));
const label=e=>{const l=e.id&&document.querySelector('label[for="'+CSS.escape(e.id)+'"]');return clean(l?.textContent||e.closest('label')?.childNodes[0]?.textContent||e.id||e.name||'Input');};
function readReport(){
 const title=clean(document.querySelector('h1')?.textContent||document.title);
 const assumptions=inputs().filter(e=>e.type!=='checkbox'||e.checked).map(e=>[label(e),e.options?e.options[e.selectedIndex]?.text:e.value]);
 const results=[];const seen=new Set();
 const selectors=['#result','#e_emi','#e_interest','#e_total','#e_fee_amount','#e_compare_summary','#total-interest','#total-paid','#first-pay','#last-pay','#netstock','#stockdp','#debtordp','#dp','#available','#cash','#debt','#ratio','#ca','#cl','#gap','#contribution','#finance','#cc_result','#cc_total','#cc_summary','#year-summary'];
 for(const sel of selectors){const e=document.querySelector(sel);if(!e||e.hidden||e.closest('[hidden]'))continue;let txt=clean(e.innerText||e.textContent);if(!txt||txt.length>1200||/^(Enter your assumptions|Please enter|See the calculation)/i.test(txt))continue;
 if(e.querySelector('table')){const clone=e.cloneNode(true);clone.querySelectorAll('table').forEach(x=>x.remove());txt=clean(clone.textContent)}
 if(txt&&!seen.has(txt)){results.push([sel.replace('#','').replace(/[-_]/g,' '),txt]);seen.add(txt)}
 }
 const outputElements=[...document.querySelectorAll('main .metric, main .result, main .results, .content .result, .content .metric')];
 for(const e of outputElements){if(e.hidden||e.closest('[hidden]')||e.querySelector('table'))continue;const t=clean(e.innerText||e.textContent);if(t&&t.length<650&&!seen.has(t)&&!/^(Enter your assumptions|Please enter)/i.test(t)){results.push(['Calculated result',t]);seen.add(t)}}
 const tables=[...document.querySelectorAll('main table,.content table')].filter(t=>!t.closest('[hidden]')&&t.rows.length>0).map(t=>[...t.rows].map(r=>[...r.cells].map(c=>clean(c.textContent))));
 // EMI: move Principal before Interest and Payment in all report tables.
 for(const t of tables){if(!t.length)continue;const h=t[0].map(x=>x.toLowerCase());const op=h.findIndex(x=>x.includes('opening')),pr=h.findIndex(x=>x.includes('principal')),int=h.findIndex(x=>x.includes('interest')),pay=h.findIndex(x=>x.includes('payment')),cl=h.findIndex(x=>x.includes('closing'));
 if([op,pr,int,pay,cl].every(i=>i>=0)){const mon=h.findIndex(x=>x.includes('month')),year=h.findIndex(x=>x==='year');const order=[mon,year,op,pr,int,pay,cl].filter(i=>i>=0);for(let i=0;i<t.length;i++)t[i]=order.map(j=>t[i][j]);}}
 return {title,assumptions,results,tables,date:new Date().toLocaleString('en-IN')};
}
function printReport(){if(!valid())return;const r=readReport();if(!r.results.length&&!r.tables.length){alert('Calculation results are unavailable. Please calculate again.');return;}
 const name='MsmeKnowledgeHub.com_'+cfg[0]+'_Calculator';
 const w=window.open('','_blank');if(!w){alert('Please allow pop-ups to open the report.');return;}
 const row=(a,b)=>'<tr><th>'+escape(a)+'</th><td>'+escape(b)+'</td></tr>';
 const table=(heading,rows)=>'<section><h2>'+escape(heading)+'</h2><table class="summary"><tbody>'+rows.map(r=>row(...r)).join('')+'</tbody></table></section>';
 const schedules=r.tables.map((rows,i)=>'<section><h2>Schedule '+(i+1)+'</h2><table class="schedule"><thead><tr>'+rows[0].map(c=>'<th>'+escape(c)+'</th>').join('')+'</tr></thead><tbody>'+rows.slice(1).map(rr=>'<tr>'+rr.map(c=>'<td>'+escape(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></section>').join('');
 const url='<a href="'+SITE+'" target="_blank" rel="noopener">'+SITE+'</a>';
 w.document.open();w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>'+name+'</title><style>@page{size:A4;margin:14mm 11mm}*{box-sizing:border-box}body{font:11px/1.5 Arial,"Noto Sans",sans-serif;color:#18314b;margin:0}header{border-bottom:3px solid #1268a3;padding-bottom:12px;margin-bottom:18px}h1{font-size:21px;margin:0;color:#103e68}h2{font-size:14px;color:#103e68;margin:17px 0 8px}.subtitle{font-size:15px;font-weight:700;margin-top:8px}.site{font-size:11px}a{color:#0868a7;text-decoration:underline}table{border-collapse:collapse;width:100%;margin:8px 0 18px}td,th{border:1px solid #c9d8e5;padding:5px 6px;vertical-align:top}th{background:#e9f3fc;font-weight:700}.summary th{width:43%;text-align:left}.schedule{font-size:9px;table-layout:auto}.schedule th,.schedule td{padding:4px 3px;word-break:normal;overflow-wrap:anywhere;text-align:right}.schedule th:first-child,.schedule td:first-child{text-align:left}thead{display:table-header-group}tr{break-inside:avoid}section{break-inside:auto}footer{margin-top:22px;border-top:1px solid #aac5d9;padding-top:9px;font-size:10px;color:#536579}footer p{margin:4px 0}.hint{margin-top:10px;color:#555}@media screen{body{max-width:900px;margin:25px auto;padding:20px;background:white}}@media print{.no-print{display:none}}</style></head><body><header><h1>MSME Knowledge Hub</h1><div class="site">'+url+'</div><div class="subtitle">'+escape(r.title)+'</div><div>Generated: '+escape(r.date)+'</div></header>'+table('Input assumptions',r.assumptions)+table('Calculated results',r.results)+schedules+'<footer><strong>MSME Knowledge Hub</strong> · '+url+'<p>Illustrative calculations only. Actual lender terms, dates, fees and rounding may differ.</p></footer><p class="no-print hint">In the print dialog, select <strong>Save as PDF</strong>. Suggested filename: '+escape(name)+'.pdf</p></body></html>');w.document.close();w.focus();setTimeout(()=>w.print(),450);
}
let lastValid=null,dirty=true;let buttons=[];let notice;
function invalidReason(){for(const e of inputs()){if(e.willValidate&&!e.checkValidity())return 'Please correct invalid inputs and calculate again.';}const err=[...document.querySelectorAll('#error,#err,#e_error,#cc_error,.error')].find(e=>e.offsetParent!==null&&clean(e.textContent));return err?'Please correct the calculator error and try again.':'';}
function valid(){if(dirty||lastValid!==snapshot()){alert('Inputs have changed. Please click Calculate to update the results before downloading your report.');return false;}if(invalidReason()){alert(invalidReason());return false;}return true;}
function setReady(ready){dirty=!ready;buttons.forEach(b=>{b.disabled=!ready;b.style.opacity=ready?'1':'.55';b.style.cursor=ready?'pointer':'not-allowed'});if(notice)notice.textContent=ready?'Report ready. Use Print / Save as PDF to download.':'Calculate or recalculate to enable PDF and CSV downloads.';}
function init(){let calc=document.getElementById(cfg[1]||'');const bar=document.createElement('div');bar.className='msme-report-actions';bar.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:16px 0;padding:12px;border:1px solid #d4e2ed;border-radius:10px;background:#f7fbff';
 const pdf=document.createElement('button');pdf.type='button';pdf.textContent='Download PDF (Save as PDF)';pdf.style.cssText='padding:11px 15px;border:0;border-radius:8px;background:#0966a8;color:white;font-weight:700';pdf.addEventListener('click',printReport);
 const print=document.createElement('button');print.type='button';print.textContent='Print / Save as PDF';print.style.cssText='padding:11px 15px;border:1px solid #0966a8;border-radius:8px;background:white;color:#0966a8;font-weight:700';print.addEventListener('click',printReport);
 buttons=[pdf,print];notice=document.createElement('small');notice.setAttribute('role','status');notice.style.cssText='flex-basis:100%;color:#526779';bar.append(pdf,print,notice);
 if(!calc){calc=document.createElement('button');calc.type='button';calc.className='action';calc.textContent='Calculate / Refresh Report';calc.style.cssText='padding:11px 15px;background:#0966a8;color:white;border:0;border-radius:8px;margin:8px 0';calc.addEventListener('click',()=>{const first=inputs()[0];if(first)first.dispatchEvent(new Event('input',{bubbles:true}));});const main=document.querySelector('main')||document.querySelector('.content');main?.prepend(calc);}
 calc.insertAdjacentElement('afterend',bar);
 // Prevent CSV export of stale schedules, including when CSV buttons already exist.
 const csv=[...document.querySelectorAll('button')].filter(b=>b!==calc&&(/csv/i.test(b.textContent)||['download','e_csv'].includes(b.id)));
 buttons.push(...csv);
 for(const b of csv){b.addEventListener('click',e=>{if(!valid()){e.preventDefault();e.stopImmediatePropagation();}},true);}
 // Detect dynamically added fields and modified yearly allocations.
 document.addEventListener('input',e=>{if(e.target.matches('input,select,textarea')&&e.target.id!=='site-language')setReady(false)},true);
 document.addEventListener('change',e=>{if(e.target.matches('input,select,textarea')&&e.target.id!=='site-language')setReady(false)},true);
 document.addEventListener('click',e=>{if(e.target.closest('#cc_add,.cc_remove'))setReady(false)},true);
 calc.addEventListener('click',()=>{setTimeout(()=>{if(invalidReason()){lastValid=null;setReady(false);return;}const r=readReport();if(!r.results.length&&!r.tables.length){lastValid=null;setReady(false);return;}lastValid=snapshot();setReady(true);},80)});
 setReady(false);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

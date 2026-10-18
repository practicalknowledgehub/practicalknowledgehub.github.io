/* MSME Knowledge Hub — unified validated report engine. */
(()=>{'use strict';
const SITE='https://msmeknowledgehub.com';
const cfg={
 'msme-business-loan-emi-calculator.html':['EMI','e_calculate'],
 'ped-calculator.html':['PED','calculate'],
 'negotiated-repayment-calculator.html':['Negotiated_Repayment','calculate'],
 'business-loan-eligibility-calculator.html':['Business_Loan_Eligibility','calculate'],
 'msme-working-capital-calculator.html':['Working_Capital','calculate'],
 'msme-dscr-calculator.html':['DSCR',null],
 'msme-drawing-power-calculator.html':['Drawing_Power',null],
 'cash-credit-interest-calculator.html':['Cash_Credit_Interest','cc_calc']};
const key=location.pathname.split('/').pop(),config=cfg[key];if(!config)return;
const $=id=>document.getElementById(id),clean=v=>String(v??'').replace(/\s+/g,' ').trim();
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const filename='MsmeKnowledgeHub.com_'+config[0]+'_Calculator.pdf';
const inputs=()=>[...document.querySelectorAll('main input,main select,main textarea')].filter(e=>e.type!=='hidden'&&e.id!=='site-language'&&!e.closest('.msme-report-actions'));
const snapshot=()=>JSON.stringify(inputs().map(e=>[e.id,e.name,e.type==='checkbox'?e.checked:e.value]));
const fmt=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
function inputLabel(e){const l=e.id&&document.querySelector('label[for="'+e.id.replace(/"/g,'')+'"]');return clean(l?.textContent||e.closest('label')?.textContent.replace(e.value,'')||e.name||e.id||'Input');}
const resultIds={
 EMI:[['e_emi','Monthly EMI after moratorium'],['e_interest','Total Interest'],['e_total','Total Repayment Including Fee'],['e_feeout','Processing Fee']],
 PED:[['first-pay','First Installment Payable'],['last-pay','Final Installment Payable'],['total-interest','Total Interest'],['total-paid','Total Repayment']],
 Negotiated_Repayment:[['first-pay','First Installment Payable'],['last-pay','Final Installment Payable'],['total-interest','Total Interest'],['total-paid','Total Repayment']],
 Business_Loan_Eligibility:[],Working_Capital:[['ca','Operating Current Assets'],['cl','Operating Current Liabilities'],['gap','Operating Working Capital Gap'],['contribution','Illustrative Borrower Contribution'],['finance','Illustrative Finance After Margin']],
 DSCR:[['cash','Cash Available for Debt Service'],['debt','Annual Debt Service'],['ratio','Indicative DSCR']],
 Drawing_Power:[['netstock','Stock After Creditor Adjustment'],['stockdp','Stock Drawing Power'],['debtordp','Receivables Drawing Power'],['dp','Total Indicative Drawing Power'],['available','Maximum Permitted Outstanding']],
 Cash_Credit_Interest:[['cc_total','Estimated Interest Payable'],['cc_days','Days Covered']]};
function readMetrics(){const kind=config[0];if(kind==='Business_Loan_Eligibility'){
 const t=clean($('result')?.textContent);const m=t.match(/(?:affordable new EMI|monthly instalment)\s*:?\s*(₹[\d,]+(?:\.\d+)?)/i),n=t.match(/(?:loan principal|loan amount)\s*:?\s*(₹[\d,]+(?:\.\d+)?)/i);
 if(m&&n)return [['Maximum Affordable New Monthly Installment',m[1]],['Indicative Eligible Loan Amount',n[1]]];return [];
 }
 const rows=(resultIds[kind]||[]).map(([id,name])=>[name,clean($(id)?.textContent)]).filter(x=>x[1]&&x[1]!=='—');
 
 if(kind==='Negotiated_Repayment')return rows;
 return rows;
}
function readTables(){const tables=[...document.querySelectorAll('main table')].filter(t=>!t.closest('[hidden]')&&t.rows.length>1).map(t=>[...t.rows].map(r=>[...r.cells].map(c=>clean(c.textContent))));
 if(config[0]==='Cash_Credit_Interest'&&!tables.length){const tb=$('cc_breakdown')?.querySelector('table');if(tb)tables.push([...tb.rows].map(r=>[...r.cells].map(c=>clean(c.textContent))));}
 for(const t of tables){const h=t[0].map(x=>x.toLowerCase());const op=h.findIndex(x=>x.includes('opening')),pr=h.findIndex(x=>x.includes('principal')),intr=h.findIndex(x=>x.includes('interest')),pay=h.findIndex(x=>x.includes('payment')||x.includes('instalment')),cl=h.findIndex(x=>x.includes('closing'));
 if([op,pr,intr,pay,cl].every(i=>i>=0)){
 const month=h.findIndex(x=>x.includes('month')),year=h.findIndex(x=>x==='year');const order=[month,year,op,pr,intr,pay,cl].filter(i=>i>=0);for(let i=0;i<t.length;i++)t[i]=order.map(j=>t[i][j]);
 const pi=order.indexOf(pay);t[0][pi]='Installment Payable (₹)';
 }
 if(config[0]==='Cash_Credit_Interest'&&$('cc_mode')?.value==='month')t.splice(1,t.length-1,...t.slice(1).sort((a,b)=>(Number(a[0].match(/\d+/)?.[0]||0)-Number(b[0].match(/\d+/)?.[0]||0))));
 }
 return tables;
}
function assumptions(){const kind=config[0];if(kind==='Cash_Credit_Interest'){
 const mode=$('cc_mode')?.value,rows=[['Calculation Mode',mode==='month'?'Single calendar month (dated ranges)':'Flexible periods (any duration)'],['Annual Interest Rate (%)',$('cc_rate')?.value]];
 if(mode==='month')rows.push(['Calendar Month',$('cc_ym')?.value]);return rows;}
 return inputs().filter(e=>e.type!=='checkbox'||e.checked).map(e=>[inputLabel(e),e.options?e.options[e.selectedIndex]?.text:e.value]);}
function balanceTable(){if(config[0]!=='Cash_Credit_Interest')return null;
 if($('cc_mode')?.value==='month'){
 const rows=[...document.querySelectorAll('#cc_ranges .cc-row')].map(e=>[e.querySelector('.cc_from')?.value,e.querySelector('.cc_to')?.value,e.querySelector('.cc_bal')?.value]).filter(r=>r.every(Boolean)).sort((a,b)=>Number(a[0])-Number(b[0]));
 return rows.length?[['From Day','To Day (Inclusive)','Outstanding (₹)'],...rows.map(r=>[r[0],r[1],fmt(+r[2])])]:null;
 }
 const rows=[...document.querySelectorAll('#cc_flex_rows .cc-flex-row')].map((e,i)=>['Period '+(i+1),e.querySelector('.cc-flex-days')?.value,fmt(+(e.querySelector('.cc-flex-balance')?.value||0))]);
 return rows.length?[['Period','Days','Outstanding (₹)'],...rows]:null;
}
function report(){const results=readMetrics(),tables=readTables();return {title:clean(document.querySelector('h1')?.textContent||document.title),date:new Date().toLocaleString('en-IN'),assumptions:assumptions(),balance:balanceTable(),results,tables};}
function sectionNames(i){if(config[0]==='Negotiated_Repayment')return i===0?'Schedule 1 – Month-wise Repayment Schedule':'Schedule 2 – Yearwise Summary';if(config[0]==='Cash_Credit_Interest')return 'Period-wise Interest Breakdown';return 'Schedule '+(i+1)+' – Month-wise Repayment Schedule';}
function reportHtml(r){const row=(a,b)=>'<tr><th>'+escape(a)+'</th><td>'+escape(b)+'</td></tr>',simple=(heading,rows)=>rows?.length?'<section><h2>'+escape(heading)+'</h2><table class="summary"><tbody>'+rows.map(x=>row(...x)).join('')+'</tbody></table></section>':'';
 const tab=(heading,rows)=>'<section><h2>'+escape(heading)+'</h2><table class="schedule"><thead><tr>'+rows[0].map(x=>'<th>'+escape(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.slice(1).map(r=>'<tr>'+r.map(x=>'<td>'+escape(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></section>';
 const link='<a href="'+SITE+'">'+SITE+'</a>';
 return '<!doctype html><html><head><meta charset="utf-8"><title>'+escape(filename)+'</title><style>@page{size:A4;margin:13mm 11mm}*{box-sizing:border-box}body{font:11px/1.5 Arial,sans-serif;color:#193449}header{border-bottom:3px solid #1268a3;padding-bottom:12px;margin-bottom:14px}h1{font-size:20px;color:#123e68;margin:0}h2{font-size:14px;color:#123e68;margin:18px 0 8px}a{color:#0966a8}table{width:100%;border-collapse:collapse;margin:8px 0 16px}td,th{border:1px solid #c9d8e5;padding:5px 6px;vertical-align:top}th{background:#e9f3fc;text-align:left}.summary th{width:47%}.schedule{font-size:9px}.schedule td{text-align:right}.schedule td:first-child{text-align:left}thead{display:table-header-group}tr{break-inside:avoid}footer{border-top:1px solid #aac5d9;padding-top:8px;margin-top:20px;color:#536579;font-size:10px}@media screen{body{max-width:900px;margin:30px auto;padding:20px}}</style></head><body><header><h1>MSME Knowledge Hub</h1>'+link+'<div style="font-weight:bold;font-size:15px;margin-top:8px">'+escape(r.title)+'</div><div>Generated: '+escape(r.date)+'</div></header>'+simple('Input Assumptions',r.assumptions)+(r.balance?tab('Outstanding Balance Periods',r.balance):'')+simple('Calculated Results',r.results)+r.tables.map((t,i)=>tab(sectionNames(i),t)).join('')+'<footer><strong>MSME Knowledge Hub</strong> · '+link+'<p>Illustrative calculations only. Actual lender terms, dates, fees and rounding may differ.</p></footer></body></html>';
}
function printReport(){if(!valid())return;const r=report();if(!r.results.length){alert('Please calculate valid results before exporting.');return;}const w=window.open('','_blank');if(!w){alert('Please allow pop-ups to open the report.');return;}w.document.open();w.document.write(reportHtml(r));w.document.close();w.focus();setTimeout(()=>w.print(),400);}
/* Offline, dependency-free, true PDF file download. Each A4 page is rasterized at 2x for Unicode ₹ support; URL annotations stay clickable. */
async function downloadReport(){if(!valid())return;const r=report();if(!r.results.length){alert('Please calculate valid results before exporting.');return;}
 const W=1240,H=1754,M=76,usable=W-2*M,canvases=[];let canvas,ctx,y;
 function page(){canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.textBaseline='top';y=92;canvases.push(canvas);}
 function txt(s,x,top,font='23px Arial',color='#193449'){ctx.font=font;ctx.fillStyle=color;ctx.fillText(String(s),x,top);}
 function wrap(s,max,font='22px Arial'){ctx.font=font;const words=String(s).split(/\s+/),lines=[];let line='';for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>max&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);return lines;}
 function need(height){if(y+height>H-125){footer();page();header(false);}}
 function header(first){txt('MSME Knowledge Hub',M,y,'bold 38px Arial','#103e68');y+=53;txt(SITE,M,y,'21px Arial','#0966a8');y+=39;if(first){for(const line of wrap(r.title,usable,'bold 26px Arial')){txt(line,M,y,'bold 26px Arial');y+=35;}txt('Generated: '+r.date,M,y,'19px Arial');y+=35;}ctx.fillStyle='#1268a3';ctx.fillRect(M,y,usable,4);y+=30;}
 function footer(){ctx.fillStyle='#a8c5d9';ctx.fillRect(M,H-100,usable,2);txt('MSME Knowledge Hub  •  '+SITE,M,H-89,'17px Arial','#516578');txt('Illustrative calculation; actual lender terms may differ.',M,H-64,'15px Arial','#516578');}
 function heading(s){need(65);txt(s,M,y,'bold 27px Arial','#103e68');y+=46;}
 function keyTable(rows){for(const [k,v] of rows){const l=wrap(k,usable*.44-22,'20px Arial'),rr=wrap(v,usable*.55-22,'20px Arial'),h=Math.max(l.length,rr.length)*29+16;need(h);ctx.strokeStyle='#c9d8e5';ctx.strokeRect(M,y,usable,h);ctx.fillStyle='#eaf3fa';ctx.fillRect(M,y,usable*.45,h);ctx.beginPath();ctx.moveTo(M+usable*.45,y);ctx.lineTo(M+usable*.45,y+h);ctx.stroke();l.forEach((s,i)=>txt(s,M+10,y+9+i*29,'20px Arial'));rr.forEach((s,i)=>txt(s,M+usable*.45+10,y+9+i*29,'20px Arial'));y+=h;}}
 function gridTable(rows){if(!rows||!rows.length)return;const count=rows[0].length,cols=count===7?[.08,.08,.18,.17,.15,.19,.15]:Array(count).fill(1/count);const sum=cols.reduce((a,b)=>a+b,0),widths=cols.map(c=>c/sum*usable);const render=(row,head)=>{const h=head?46:37;need(h+5);let x=M;row.forEach((cell,i)=>{ctx.fillStyle=head?'#e9f3fc':'#fff';ctx.fillRect(x,y,widths[i],h);ctx.strokeStyle='#c9d8e5';ctx.strokeRect(x,y,widths[i],h);const f=head?'bold 16px Arial':'16px Arial';let val=String(cell);ctx.font=f;while(val.length>2&&ctx.measureText(val).width>widths[i]-10)val=val.slice(0,-2)+'…';txt(val,x+5,y+11,f);x+=widths[i];});y+=h;};
 render(rows[0],true);for(let i=1;i<rows.length;i++){if(y+48>H-125){footer();page();header(false);render(rows[0],true);}render(rows[i],false);}y+=20;}
 page();header(true);heading('Input Assumptions');keyTable(r.assumptions);y+=12;if(r.balance){heading('Outstanding Balance Periods');gridTable(r.balance);}heading('Calculated Results');keyTable(r.results);y+=18;for(let i=0;i<r.tables.length;i++){heading(sectionNames(i));gridTable(r.tables[i]);}footer();
 const jpgs=await Promise.all(canvases.map(c=>new Promise(resolve=>c.toBlob(async b=>resolve(new Uint8Array(await b.arrayBuffer())),'image/jpeg',.87))));
 const enc=new TextEncoder(),parts=[],offsets=[0];let length=0;const push=b=>{parts.push(b);length+=b.length},str=s=>push(enc.encode(s));
 function obj(n,body){offsets[n]=length;str(n+' 0 obj\n'+body+'\nendobj\n');}
 function stream(n,dict,data){offsets[n]=length;str(n+' 0 obj\n<< '+dict+' /Length '+data.length+' >>\nstream\n');push(data);str('\nendstream\nendobj\n');}
 const count=jpgs.length,objs=2+count*3;str('%PDF-1.4\n');obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,'<< /Type /Pages /Count '+count+' /Kids ['+jpgs.map((_,i)=>(3+i*3)+' 0 R').join(' ')+'] >>');
 jpgs.forEach((bytes,i)=>{const pageNo=3+i*3,imgNo=pageNo+1,linkNo=pageNo+2;obj(pageNo,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im'+i+' '+imgNo+' 0 R >> >> /Contents '+(objs+1+i)+' 0 R /Annots ['+linkNo+' 0 R] >>');stream(imgNo,'/Type /XObject /Subtype /Image /Width '+W+' /Height '+H+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode',bytes);obj(linkNo,'<< /Type /Annot /Subtype /Link /Rect [32 775 330 815] /Border [0 0 0] /A << /S /URI /URI ('+SITE+') >> >>');});
 jpgs.forEach((_,i)=>stream(objs+1+i,'',enc.encode('q 595.28 0 0 841.89 0 0 cm /Im'+i+' Do Q\n')));
 const xref=length;str('xref\n0 '+(objs+count+1)+'\n0000000000 65535 f \n');for(let i=1;i<=objs+count;i++)str(String(offsets[i]).padStart(10,'0')+' 00000 n \n');str('trailer\n<< /Size '+(objs+count+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF');
 const blob=new Blob(parts,{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
let lastValid=null,dirty=true,buttons=[],notice;
function invalidReason(){const bad=inputs().find(e=>e.willValidate&&!e.checkValidity());if(bad)return 'Please correct invalid inputs and calculate again.';const err=[...document.querySelectorAll('#error,#err,#e_error,#cc_error,.error')].find(e=>e.offsetParent!==null&&clean(e.textContent));return err?clean(err.textContent):'';}
function valid(){if(dirty||lastValid!==snapshot()){alert('Inputs have changed. Please click Calculate to update the results before downloading your report.');return false;}const err=invalidReason();if(err){alert(err);return false;}return true;}
function setReady(ok){dirty=!ok;buttons.forEach(b=>{b.disabled=!ok;b.style.opacity=ok?'1':'.55'});if(notice)notice.textContent=ok?'Report ready. Download PDF saves a file directly.':'Calculate or recalculate to enable PDF and CSV downloads.';}
function init(){let calc=$(config[1]||'');const main=document.querySelector('main');if(!main)return;
 if(!calc){calc=document.createElement('button');calc.type='button';calc.textContent='Calculate / Refresh Report';calc.className='action';calc.style.cssText='padding:11px 15px;background:#0966a8;color:white;border:0;border-radius:8px;margin:14px 0';calc.addEventListener('click',()=>{const first=inputs()[0];if(first)first.dispatchEvent(new Event('input',{bubbles:true}));});const panel=main.querySelector('.panel,.tool-panel');(panel||main).append(calc);}
 const bar=document.createElement('div');bar.className='msme-report-actions';bar.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:16px 0;padding:12px;border:1px solid #d4e2ed;border-radius:10px;background:#f7fbff';
 const pdf=document.createElement('button');pdf.type='button';pdf.textContent='Download PDF';pdf.style.cssText='padding:11px 15px;border:0;border-radius:8px;background:#0966a8;color:white;font-weight:700';pdf.addEventListener('click',()=>downloadReport().catch(e=>{console.error(e);alert('PDF generation failed. Please use Print / Save as PDF.')}));
 const print=document.createElement('button');print.type='button';print.textContent='Print / Save as PDF';print.style.cssText='padding:11px 15px;border:1px solid #0966a8;border-radius:8px;background:white;color:#0966a8;font-weight:700';print.addEventListener('click',printReport);
 buttons=[pdf,print];notice=document.createElement('small');notice.setAttribute('role','status');notice.style.cssText='flex-basis:100%;color:#526779';bar.append(pdf,print,notice);calc.insertAdjacentElement('afterend',bar);
 const csv=[...document.querySelectorAll('button')].filter(b=>b!==calc&&(/csv/i.test(b.textContent)||['download','e_csv'].includes(b.id)));buttons.push(...csv);
 for(const b of csv)b.addEventListener('click',e=>{if(!valid()){e.preventDefault();e.stopImmediatePropagation();}},true);
 document.addEventListener('input',e=>{if(e.target.matches('input,select,textarea')&&e.target.id!=='site-language')setReady(false)},true);
 document.addEventListener('change',e=>{if(e.target.matches('input,select,textarea')&&e.target.id!=='site-language')setReady(false)},true);
 document.addEventListener('click',e=>{if(e.target.closest('#cc_add,#cc_flex_add,.cc_remove,.cc-flex-remove'))setReady(false)},true);
 calc.addEventListener('click',()=>setTimeout(()=>{if(invalidReason()||!readMetrics().length){lastValid=null;setReady(false);return;}lastValid=snapshot();setReady(true);},100));setReady(false);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

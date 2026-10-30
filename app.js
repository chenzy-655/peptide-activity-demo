'use strict';
let data,selectedId,language='zh';
try{language=localStorage.getItem('peptide-atlas-language')==='en'?'en':'zh';}catch{}
const $=id=>document.getElementById(id);
const esc=value=>String(value).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const t=key=>data.ui[language][key];
const profile=key=>data.profiles.find(p=>p.key===key).translations[language];
const fmt=(n,d=2)=>Number.isFinite(n)?n.toFixed(d):t('unavailable');
function setLanguage(lang){
 language=lang;try{localStorage.setItem('peptide-atlas-language',lang);}catch{}
 document.documentElement.lang=lang==='zh'?'zh-CN':'en';
 document.title=lang==='zh'?'Peptide Atlas · 多肽活性分析':'Peptide Atlas · Bioactivity Explorer';
 document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
 document.querySelectorAll('[data-placeholder]').forEach(el=>el.placeholder=t(el.dataset.placeholder));
 $('lang-zh').setAttribute('aria-pressed',String(lang==='zh'));$('lang-en').setAttribute('aria-pressed',String(lang==='en'));
 document.querySelector('.university img').alt=lang==='zh'?'桂林医科大学校徽':'Guilin Medical University emblem';
 const selected=$('profile').value||'ace';
 $('profile').innerHTML=data.profiles.map(p=>'<option value="'+p.key+'">'+esc(p.translations[lang].label)+'</option>').join('');
 $('profile').value=selected;
 if(!$('error').hidden)$('error').textContent=t('loadError');
 render();
}
function currentRows(){const query=$('search').value.trim().toUpperCase(),min=Number($('min-score').value),key=$('profile').value;return data.peptides.filter(r=>r.peptide.includes(query)&&r.scores[key].score>=min).sort((a,b)=>b.scores[key].score-a.scores[key].score||a.id.localeCompare(b.id));}
function render(){
 const key=$('profile').value,rows=currentRows();
 $('profile-description').textContent=profile(key).description;$('direction').textContent=profile(key).label;
 $('min-value').textContent=$('min-score').value;$('count').textContent=rows.length;
 $('table-caption').textContent=t('tableCount').replace('{n}',rows.length).replace('{total}',data.peptides.length);
 if(!rows.some(r=>r.id===selectedId))selectedId=rows[0]?.id;
 $('rows').innerHTML=rows.length?rows.map(r=>'<tr class="'+(r.id===selectedId?'selected':'')+'" data-id="'+r.id+'"><td><button class="row-button" aria-label="'+esc(t('viewRow').replace('{sequence}',r.peptide))+'"><small>'+r.id+'</small><strong>'+esc(r.peptide)+'</strong></button></td><td>'+r.length+' aa</td><td><div class="score">'+fmt(r.scores[key].score,1)+'<span class="bar"><i style="width:'+r.scores[key].score+'%"></i></span></div></td><td>'+fmt(r.hydrophobic_fraction*100,0)+'%</td><td>'+fmt(r.charge_ph7)+'</td></tr>').join(''):'<tr><td colspan="5">'+esc(t('empty'))+'</td></tr>';
 $('download').disabled=!rows.length;renderDetail();
}
function reasonsFor(r,key){return r.scores[key].translations[language];}
function renderDetail(){
 const r=data.peptides.find(p=>p.id===selectedId),key=$('profile').value;
 if(!r){$('detail-content').textContent=t('empty');return;}
 const prop=(label,value)=>'<div><span>'+esc(label)+'</span><b>'+esc(value)+'</b></div>';
 $('detail-content').innerHTML='<div class="detail-top"><div><small>'+r.id+' / '+t('example')+'</small><h3>'+esc(r.peptide)+'</h3></div><span class="badge">'+t('rule')+' '+fmt(r.scores[key].score,1)+' / 100</span></div><div class="properties">'+
 prop(t('mass'),fmt(r.monoisotopic_mass,3))+prop(t('pi'),fmt(r.isoelectric_point))+prop('GRAVY',fmt(r.gravy))+prop(t('termini'),r.n_terminal+' → '+r.c_terminal)+prop(t('colHydro'),fmt(r.hydrophobic_fraction*100,0)+'%')+prop(t('colCharge'),fmt(r.charge_ph7))+
 '</div><strong>'+t('reasons')+'</strong><ul class="reasons">'+reasonsFor(r,key).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><p class="detail-foot">'+t('detailFoot')+'</p>';
}
function csvCell(value){let s=String(value??'');if(/^[=+@\u002d]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
function downloadCSV(){
 const key=$('profile').value;
 const header=language==='zh'?['示例编号','肽序列','长度','研究方向','规则优先级分数','单同位素质量_Da','pH7净电荷','等电点','疏水残基比例','特征依据','数据来源']:['demo_id','peptide','length','research_direction','rule_priority_score','monoisotopic_mass_Da','charge_ph7','pI','hydrophobic_fraction','feature_rationale','data_source'];
 const source=language==='zh'?'演示序列；预计算描述符与规则优先级':'Illustrative sequences; precomputed descriptors and rule-based priorities';
 const rows=currentRows().map(r=>[r.id,r.peptide,r.length,profile(key).label,r.scores[key].score,r.monoisotopic_mass,r.charge_ph7,r.isoelectric_point,r.hydrophobic_fraction,reasonsFor(r,key).join('; '),source]);
 const content='\ufeff'+[header,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n');
 const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='peptide_demo_'+key+'_'+language+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function init(){
 try{
 const response=await fetch('demo-data.json');if(!response.ok)throw new Error('data');data=await response.json();
 $('lang-zh').addEventListener('click',()=>setLanguage('zh'));$('lang-en').addEventListener('click',()=>setLanguage('en'));
 for(const id of ['profile','search','min-score'])$(id).addEventListener('input',render);
 $('rows').addEventListener('click',event=>{const row=event.target.closest('tr[data-id]');if(row){selectedId=row.dataset.id;render();}});
 $('reset').addEventListener('click',()=>{$('search').value='';$('min-score').value='0';$('profile').value='ace';render();});
 $('download').addEventListener('click',downloadCSV);setLanguage(language);
 }catch(error){$('error').hidden=false;$('error').textContent=language==='zh'?'示例加载失败，请刷新后重试。':'Examples could not load. Please refresh and try again.';$('table-caption').textContent=$('error').textContent;$('download').disabled=true;}
}
init();

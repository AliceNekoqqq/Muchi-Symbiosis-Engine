// Muchi Symbiosis Engine v1.0.1
// Standalone TavernHelper module for Shen Wanzhou's intimacy/suppression gameplay.
// Story-state is stored only in current chat MVU variables; localStorage is not used.

export const SYMBIOSIS_VERSION = '1.0.1';

function resolveHost(){
  try{const b=globalThis.$?.('body')?.[0];if(b?.ownerDocument?.defaultView)return b.ownerDocument.defaultView}catch(_){ }
  try{if(globalThis.window?.parent?.document?.body)return globalThis.window.parent}catch(_){ }
  return globalThis.window||globalThis;
}

export async function mountSymbiosis(){
  await waitGlobalInitialized('Mvu');
  (()=>{
    const VERSION='1.0.1', ROOT_ID='muchi-symbiosis-v101', STYLE_ID='muchi-symbiosis-style-v101';
    const HOST=resolveHost(), DOC=HOST.document;
    const START='2024-10-27 19:42', CURE='2026-04-27 19:42';
    const PRIVACY_LABEL=['极差','差','一般','较好','好'];
    const LOCATION_PRIVACY={'地下安全屋':4,'暮迟一中':1,'雁回住宅区':2,'槐安公寓':3,'河西体育中心':1,'瑞康药房':1,'锦河商圈':1,'河西旧街':2,'河西社区医院':1,'南桥检查点':1,'南郊工业区':1};
    const ROUTES={
      '地下安全屋':{'河西旧街':8,'瑞康药房':10,'锦河商圈':16,'河西社区医院':17},
      '暮迟一中':{'雁回住宅区':12,'槐安公寓':16,'河西体育中心':9,'瑞康药房':16},
      '雁回住宅区':{'暮迟一中':12,'槐安公寓':6,'河西体育中心':15,'瑞康药房':18},
      '槐安公寓':{'雁回住宅区':6,'暮迟一中':16,'河西体育中心':14},
      '河西体育中心':{'暮迟一中':9,'雁回住宅区':15,'河西旧街':12,'瑞康药房':13},
      '瑞康药房':{'地下安全屋':10,'锦河商圈':8,'河西体育中心':13,'河西社区医院':14},
      '锦河商圈':{'瑞康药房':8,'地下安全屋':16,'河西旧街':18,'南桥检查点':15},
      '河西旧街':{'地下安全屋':8,'河西体育中心':12,'河西社区医院':13,'锦河商圈':18},
      '河西社区医院':{'河西旧街':13,'瑞康药房':14,'地下安全屋':17,'南桥检查点':20},
      '南桥检查点':{'锦河商圈':15,'河西社区医院':20,'南郊工业区':22},
      '南郊工业区':{'南桥检查点':22,'锦河商圈':32}
    };
    const CONTEXTS={
      prepare:{name:'主动准备',tag:'安全屋 / 充分准备',minPrivacy:3,minutes:[25,40],suppression:[240,360],rageDrop:[28,44],sanityGain:[14,24],after:['状态放松','依恋安定','余温未散'],afterMinutes:[75,120],desc:'在时间和环境允许时主动稳定状态，获得最完整、最可靠的抑制窗口。'},
      quick:{name:'临时准备',tag:'出发前 / 行动间隙',minPrivacy:2,minutes:[15,25],suppression:[210,300],rageDrop:[22,36],sanityGain:[10,18],after:['呼吸尚未平复','注意力重新聚焦'],afterMinutes:[45,80],desc:'时间有限时的临时稳定。效果可靠，但窗口与恢复感不如充分准备。'},
      emergency:{name:'户外紧急',tag:'发作前兆 / 半狂暴',minPrivacy:3,minutes:[10,18],suppression:[180,240],rageDrop:[36,55],sanityGain:[16,28],after:['急性躁变回落','肾上腺素余震','强烈依赖感'],afterMinutes:[50,90],desc:'只用于明显的急性失控风险。必须先找到能暂时隔绝外部危险的空间。'},
      voluntary:{name:'非必要亲近',tag:'关系型亲密',minPrivacy:3,minutes:[20,35],suppression:[120,210],rageDrop:[8,16],sanityGain:[5,12],after:['主动亲近','情绪柔软','依恋安定'],afterMinutes:[90,150],desc:'不是因为“必须救命”才靠近。数值收益较轻，主要保留恋爱关系与余韵。'}
    };
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
    const rint=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
    const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    const latestVars=()=>{try{return getAllVariables?.()||{}}catch{return {}}};
    const stat=()=>latestVars()?.stat_data||latestVars()||{};
    function parseTime(s){if(!s)return NaN;const t=Date.parse(String(s).replace(' ','T')+'+08:00');return Number.isFinite(t)?t:NaN}
    function fmtTime(ms){const d=new Date(ms+8*3600000),p=n=>String(n).padStart(2,'0');return `${d.getUTCFullYear()}-${p(d.getUTCMonth()+1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`}
    function period(ms){const h=new Date(ms+8*3600000).getUTCHours();return h<5?'深夜':h<8?'清晨':h<12?'上午':h<14?'中午':h<18?'下午':h<21?'夜间':'深夜'}
    function emptyLast(){return {时间:'',地点:'',区域:'',情境:'',阶段:'',隐蔽性:'',耗时分钟:0,起始理智:0,结束理智:0,起始躁变:0,结束躁变:0,原抑制分钟:0,新抑制分钟:0,摘要:''}}
    function emptyAfter(){return {状态:'无',标签:[],来源情境:'',开始时间:'',到期时间:''}}
    function ensure(sd){sd.共生系统=sd.共生系统||{版本:'1.0',最近一次:emptyLast(),最近记录:[],余韵:emptyAfter()};const x=sd.共生系统;x.版本='1.0';if(!x.最近一次||typeof x.最近一次!=='object')x.最近一次=emptyLast();if(!Array.isArray(x.最近记录))x.最近记录=[];if(!x.余韵||typeof x.余韵!=='object')x.余韵=emptyAfter();return x}
    function phase(sd){const inv=Number(sd?.沈挽昼?.核心状态?.侵蚀度||0),day=Number(sd?.世界?.灾变日||1),n=ensure(sd).最近记录.length;if(inv>=60)return '深蚀期';if(day<=3&&n<2)return '发现期';if(day<=10||n<5)return '适应期';return '共生期'}
    function currentLocation(sd=stat()){return String(sd?.世界?.当前地点||'未知')}
    function currentCore(sd=stat()){return sd?.沈挽昼?.核心状态||{}}
    function privacyContext(opts={},sd=stat()){
      const loc=opts.location||currentLocation(sd), areaId=opts.areaId||'';
      try{const c=HOST.MuchiExplore?.context?.(loc,areaId);if(c&&Number.isFinite(Number(c.privacyLevel)))return {...c,location:loc}}
      catch(_){ }
      const lv=Number(LOCATION_PRIVACY[loc]??1);return {location:loc,areaId:'',areaName:'当前环境',privacyLevel:lv,privacyLabel:PRIVACY_LABEL[lv],lockable:lv>=3,note:lv>=3?'存在可暂时隔绝外部视线与动静的空间':'缺少明确的封闭隐蔽空间'}
    }
    function shortest(from,to){if(from===to)return 0;const nodes=Object.keys(ROUTES),dist=Object.fromEntries(nodes.map(x=>[x,Infinity]));if(!(from in dist)||!(to in dist))return Infinity;dist[from]=0;const seen=new Set;while(seen.size<nodes.length){let u=null,b=Infinity;for(const n of nodes)if(!seen.has(n)&&dist[n]<b){u=n;b=dist[n]}if(!u)break;if(u===to)return b;seen.add(u);for(const [v,w] of Object.entries(ROUTES[u]||{}))if(dist[v]>b+w)dist[v]=b+w}return dist[to]}
    function assessPlan({from,to,exploreMin=18,exploreMax=36,returnTo='地下安全屋'}={}){const sd=stat(),sup=Number(sd?.沈挽昼?.核心状态?.抑制剩余分钟||0),a=shortest(from||currentLocation(sd),to),b=shortest(to,returnTo),lo=(Number.isFinite(a)?a:0)+exploreMin+(Number.isFinite(b)?b:0),hi=(Number.isFinite(a)?a:0)+exploreMax+(Number.isFinite(b)?b:0),margin=sup-hi;return {suppression:sup,outbound:a,returnMinutes:b,min:lo,max:hi,margin,status:margin>=30?'充足':margin>=0?'吃紧':'不足'}}
    function assessSearch({minutesMin=4,minutesMax=18,location,areaId}={}){const sd=stat(),sup=Number(sd?.沈挽昼?.核心状态?.抑制剩余分钟||0),back=shortest(location||currentLocation(sd),'地下安全屋'),need=minutesMax+(Number.isFinite(back)?back:0),margin=sup-need;return {suppression:sup,returnMinutes:back,min:minutesMin,max:minutesMax,need,margin,status:margin>=30?'充足':margin>=0?'吃紧':'不足'}}
    function availability(key,ctx,sd=stat()){
      const c=currentCore(sd),stage=String(c.异化阶段||'稳定'),rage=Number(c.躁变值||0),san=Number(c.理智值||100),sup=Number(c.抑制剩余分钟||0),p=Number(ctx.privacyLevel||0),def=CONTEXTS[key];
      if(c.是否狂暴||['狂暴','深度异化'].includes(stage))return {ok:false,reason:'完全失控状态不能通过按钮直接结算；需要先在正文中建立安全控制。'};
      if(p<def.minPrivacy)return {ok:false,reason:`当前隐蔽条件为“${ctx.privacyLabel}”，不足以安全进行这一情境。`};
      if(key==='emergency'&&!(sup<=60||rage>=35||['发作前兆','半狂暴'].includes(stage)))return {ok:false,reason:'当前没有达到紧急抑制条件。'};
      if(key==='voluntary'&&!(stage==='稳定'&&san>=50&&rage<45))return {ok:false,reason:'当前状态不适合作为非必要的关系型亲近。'};
      if(key==='prepare'&&stage==='半狂暴')return {ok:false,reason:'半狂暴状态不能按从容准备流程处理，请使用紧急情境。'};
      if(key==='quick'&&stage==='半狂暴')return {ok:false,reason:'半狂暴状态不能按临时准备流程处理，请使用紧急情境。'};
      return {ok:true,reason:''};
    }
    function advanceTime(sd,min){let now=parseTime(sd?.世界?.当前时间||START);if(!Number.isFinite(now))now=parseTime(START);now+=Math.max(0,min)*60000;sd.世界=sd.世界||{};sd.世界.当前时间=fmtTime(now);sd.世界.时段=period(now);const start=parseTime(START);sd.世界.灾变日=Math.max(1,Math.floor((now-start)/86400000)+1);const cure=parseTime(sd?.世界?.解药?.研发完成时间||CURE),rem=Math.max(0,cure-now),hours=Math.ceil(rem/3600000);if(sd?.世界?.解药){sd.世界.解药.剩余天数=Math.floor(hours/24);sd.世界.解药.剩余小时=hours%24;if(rem<=0){sd.世界.解药.状态='研发完成';if(sd.世界.解药.终局阶段==='等待研发')sd.世界.解药.终局阶段='寻找发放点'}}return sd.世界.当前时间}
    function stageAfter(sanity,rage,inv){if(rage>=85||sanity<=15)return '狂暴';if(rage>=60||sanity<35)return '半狂暴';if(rage>=35||sanity<55)return '发作前兆';return '稳定'}
    function cleanAfterTags(sd){const known=new Set(Object.values(CONTEXTS).flatMap(x=>x.after).concat(['亲密抑制后']));const a=sd?.沈挽昼?.身体状态?.状态标签;if(Array.isArray(a))sd.沈挽昼.身体状态.状态标签=a.filter(x=>!known.has(x))}
    function expireIfNeeded(sd){const sy=ensure(sd),af=sy.余韵;if(af?.状态!=='生效')return false;const now=parseTime(sd?.世界?.当前时间),end=parseTime(af.到期时间);if(Number.isFinite(now)&&Number.isFinite(end)&&now>=end){cleanAfterTags(sd);sy.余韵=emptyAfter();return true}return false}
    async function settle(key,opts={}){
      const def=CONTEXTS[key];if(!def)throw Error('未知共生情境');const base=stat(),ctx=privacyContext(opts,base),avail=availability(key,ctx,base);if(!avail.ok)throw Error(avail.reason);
      const before={san:Number(base?.沈挽昼?.核心状态?.理智值||0),rage:Number(base?.沈挽昼?.核心状态?.躁变值||0),sup:Number(base?.沈挽昼?.核心状态?.抑制剩余分钟||0),stage:String(base?.沈挽昼?.核心状态?.异化阶段||'稳定')};
      const min=rint(...def.minutes),window=rint(...def.suppression),rageDrop=rint(...def.rageDrop),sanGain=rint(...def.sanityGain),afterM=rint(...def.afterMinutes);let result=null;
      await updateVariablesWith(vars=>{vars=vars||{};vars.stat_data=vars.stat_data||{};const sd=vars.stat_data,sy=ensure(sd),liveCtx=privacyContext(opts,sd),liveAvail=availability(key,liveCtx,sd);if(!liveAvail.ok)throw Error(liveAvail.reason);expireIfNeeded(sd);const c=sd.沈挽昼=sd.沈挽昼||{};c.核心状态=c.核心状态||{};c.身体状态=c.身体状态||{当前伤口:[],当前症状:[],状态标签:[]};const oldSan=Number(c.核心状态.理智值||0),oldRage=Number(c.核心状态.躁变值||0),oldSup=Number(c.核心状态.抑制剩余分钟||0),inv=Number(c.核心状态.侵蚀度||0);const time=advanceTime(sd,min),newRage=clamp(oldRage-rageDrop,0,100),newSan=clamp(oldSan+sanGain,0,100),oldSupAfterTime=Math.max(0,oldSup-min),newSup=Math.max(oldSupAfterTime,window);c.核心状态.理智值=newSan;c.核心状态.躁变值=newRage;c.核心状态.抑制剩余分钟=newSup;c.核心状态.异化阶段=stageAfter(newSan,newRage,inv);c.核心状态.是否狂暴=false;cleanAfterTags(sd);c.身体状态.状态标签=Array.isArray(c.身体状态.状态标签)?c.身体状态.状态标签:[];for(const t of ['亲密抑制后',...def.after])if(!c.身体状态.状态标签.includes(t))c.身体状态.状态标签.push(t);const end=fmtTime(parseTime(time)+afterM*60000);sy.余韵={状态:'生效',标签:[...def.after],来源情境:def.name,开始时间:time,到期时间:end};const rec={时间:time,地点:currentLocation(sd),区域:liveCtx.areaName||'',情境:def.name,阶段:phase(sd),隐蔽性:liveCtx.privacyLabel||'',耗时分钟:min,起始理智:oldSan,结束理智:newSan,起始躁变:oldRage,结束躁变:newRage,原抑制分钟:oldSup,新抑制分钟:newSup,摘要:`${def.name}完成；抑制窗口更新至${newSup}分钟，急性躁变${oldRage}→${newRage}`};sy.最近一次=rec;sy.最近记录=[rec,...sy.最近记录].slice(0,8);result=rec;return vars},{type:'message',message_id:-1});
      try{eventEmit('muchi:symbiosis-updated',result)}catch(_){ }
      writeStory(result,ctx,def);return result;
    }
    function writeStory(rec,ctx,def){const ta=DOC.querySelector('#send_textarea');if(!ta){HOST.toastr?.warning?.('未找到输入框');return}const text=['[共生已结算]','情境：'+rec.情境,'地点：'+rec.地点+(rec.区域?` / ${rec.区域}`:''),'隐蔽条件：'+rec.隐蔽性,'已实际耗时：'+rec.耗时分钟+'分钟','理智：'+rec.起始理智+' → '+rec.结束理智,'躁变：'+rec.起始躁变+' → '+rec.结束躁变,'抑制窗口：'+rec.原抑制分钟+' → '+rec.新抑制分钟+'分钟','当前关系/感染体验阶段：'+rec.阶段,'短期余韵：'+def.after.join('、'),'请从当前关系阶段、所在地环境、时间压力与沈挽昼当前感染状态出发，自然描写这次已经发生并结算完毕的亲密共生互动。不要重复修改理智、躁变、侵蚀、抑制时间或世界时间；侵蚀度绝不下降。避免每次都写成同一种“道歉—治疗—结束”模板，关系型亲近应体现主动欲望与恋爱连续性，紧急情境则保留危险环境压力。'];ta.value=(ta.value||'').trim()?ta.value.replace(/\s+$/,'')+'\n'+text.join('\n'):text.join('\n');ta.dispatchEvent(new (HOST.Event||Event)('input',{bubbles:true}));ta.focus();close();HOST.toastr?.success?.('共生结算已写入输入框')}
    function render(){const root=mount(),sd=stat();expireIfNeeded(sd);const sy=ensure(sd),c=currentCore(sd),ctx=privacyContext({},sd),ph=phase(sd),sup=Number(c.抑制剩余分钟||0),rage=Number(c.躁变值||0),san=Number(c.理智值||0),af=sy.余韵||emptyAfter();root.querySelector('[data-ui="place"]').textContent=currentLocation(sd);root.querySelector('[data-ui="phase"]').textContent=ph;root.querySelector('[data-ui="window"]').textContent=`${Math.floor(sup/60).toString().padStart(2,'0')}:${String(sup%60).padStart(2,'0')}`;root.querySelector('[data-ui="privacy"]').textContent=`${ctx.areaName||'当前环境'} · ${ctx.privacyLabel}`;root.querySelector('[data-ui="status"]').textContent=`理智 ${san} · 躁变 ${rage} · 侵蚀 ${Number(c.侵蚀度||0)}`;root.querySelector('[data-ui="after"]').innerHTML=af.状态==='生效'?`<b>${esc(af.来源情境)}</b><span>${(af.标签||[]).map(x=>`<i>${esc(x)}</i>`).join('')}</span><small>持续至 ${esc(af.到期时间)}</small>`:'<span class="ms-empty">暂无短期余韵</span>';root.querySelector('[data-ui="actions"]').innerHTML=Object.entries(CONTEXTS).map(([k,d])=>{const a=availability(k,ctx,sd);return `<button type="button" class="ms-action ${k}" data-context="${k}" ${a.ok?'':'disabled'}><span><b>${esc(d.name)}</b><em>${esc(d.tag)}</em></span><small>${esc(a.ok?d.desc:a.reason)}</small></button>`}).join('');const list=sy.最近记录||[];root.querySelector('[data-ui="history"]').innerHTML=list.length?list.slice(0,5).map(x=>`<div class="ms-log"><div><b>${esc(x.情境)}</b><span>${esc(x.时间)}</span></div><small>${esc(x.地点)}${x.区域?` / ${esc(x.区域)}`:''} · ${esc(x.隐蔽性)}</small><p>理智 ${x.起始理智}→${x.结束理智} · 躁变 ${x.起始躁变}→${x.结束躁变} · 抑制 ${x.新抑制分钟}min</p></div>`).join(''):'<div class="ms-empty">尚无记录</div>'}
    function style(){if(DOC.getElementById(STYLE_ID))return;const s=DOC.createElement('style');s.id=STYLE_ID;s.textContent=`#${ROOT_ID}{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(5,7,9,.74);backdrop-filter:blur(11px);font-family:"Noto Sans SC","PingFang SC",sans-serif;color:#e7e0e1}#${ROOT_ID}.open{display:flex}#${ROOT_ID} *{box-sizing:border-box}#${ROOT_ID} .ms-shell{width:min(820px,94vw);height:min(720px,90dvh);display:grid;grid-template-rows:auto 1fr;overflow:hidden;border:1px solid rgba(205,150,164,.34);border-radius:18px;background:linear-gradient(180deg,#171518,#0e1113);box-shadow:0 32px 100px rgba(0,0,0,.62)}#${ROOT_ID} .ms-head{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid rgba(204,154,166,.15);background:linear-gradient(180deg,rgba(52,35,41,.92),rgba(25,21,24,.94))}#${ROOT_ID} .ms-head small{display:block;color:#9b8389;font-size:9px;letter-spacing:.18em}#${ROOT_ID} .ms-head b{display:block;margin-top:3px;font:600 20px/1.2 "Noto Serif SC",serif;letter-spacing:.08em}#${ROOT_ID} .ms-close{width:38px;height:38px;border:1px solid #5b4248;border-radius:10px;background:#171113;color:#eadde0;font-size:22px;cursor:pointer}#${ROOT_ID} .ms-main{overflow:auto;padding:16px 16px calc(24px + env(safe-area-inset-bottom))}#${ROOT_ID} .ms-top{display:grid;grid-template-columns:1.2fr .8fr;gap:10px}#${ROOT_ID} .ms-card{padding:13px;border:1px solid rgba(205,150,164,.17);border-radius:12px;background:rgba(255,255,255,.022)}#${ROOT_ID} .ms-window{font:600 36px/1.1 ui-monospace,monospace;letter-spacing:.04em;color:#f0dfe3}#${ROOT_ID} .ms-meta{margin-top:7px;color:#aa969b;font-size:10px;line-height:1.6}#${ROOT_ID} .ms-phase{display:inline-block;padding:4px 8px;border:1px solid rgba(205,150,164,.25);border-radius:999px;color:#d8b5be;font-size:9px}#${ROOT_ID} h3{margin:17px 0 8px;color:#ad969c;font-size:10px;letter-spacing:.11em}#${ROOT_ID} .ms-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}#${ROOT_ID} .ms-action{min-height:96px;text-align:left;padding:12px;border:1px solid rgba(205,150,164,.30);border-radius:12px;background:linear-gradient(180deg,#2e2226,#1b1719);color:#efe4e7;cursor:pointer}#${ROOT_ID} .ms-action:hover:not(:disabled){border-color:rgba(232,177,191,.60);transform:translateY(-1px)}#${ROOT_ID} .ms-action:disabled{opacity:.34;cursor:not-allowed}#${ROOT_ID} .ms-action span{display:flex;align-items:baseline;justify-content:space-between;gap:8px}#${ROOT_ID} .ms-action b{font-size:13px}#${ROOT_ID} .ms-action em{font-style:normal;color:#a98e95;font-size:8px}#${ROOT_ID} .ms-action small{display:block;margin-top:8px;color:#a99a9e;font-size:9px;line-height:1.55}#${ROOT_ID} .ms-action.emergency{border-color:rgba(205,113,132,.48);background:linear-gradient(180deg,#3b2028,#211419)}#${ROOT_ID} .ms-after span{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}#${ROOT_ID} .ms-after i{font-style:normal;padding:3px 7px;border-radius:999px;background:rgba(205,150,164,.10);color:#ceb3ba;font-size:8px}#${ROOT_ID} .ms-after small{color:#7f6c71;font-size:8px}#${ROOT_ID} .ms-log{padding:9px 0;border-top:1px solid rgba(205,150,164,.09)}#${ROOT_ID} .ms-log:first-child{border-top:0}#${ROOT_ID} .ms-log>div{display:flex;justify-content:space-between;gap:8px}#${ROOT_ID} .ms-log b{font-size:10px}#${ROOT_ID} .ms-log span,#${ROOT_ID} .ms-log small{color:#8c777c;font-size:8px}#${ROOT_ID} .ms-log p{margin:5px 0 0;color:#a9959a;font-size:8px}#${ROOT_ID} .ms-empty{color:#78686c;font-size:9px}@media(max-width:680px){#${ROOT_ID}{padding:5dvh 4vw}#${ROOT_ID} .ms-shell{width:92vw;height:86dvh}#${ROOT_ID} .ms-top{grid-template-columns:1fr}#${ROOT_ID} .ms-actions{grid-template-columns:1fr}#${ROOT_ID} .ms-window{font-size:31px}#${ROOT_ID} .ms-action{min-height:82px}}`;DOC.head.appendChild(s)}
    function mount(){style();let root=DOC.getElementById(ROOT_ID);if(root)return root;root=DOC.createElement('div');root.id=ROOT_ID;root.innerHTML=`<div class="ms-shell"><header class="ms-head"><div><small>SYMBIOSIS / 共生稳定监测</small><b data-ui="place"></b></div><button class="ms-close" type="button">×</button></header><main class="ms-main"><div class="ms-top"><section class="ms-card"><span class="ms-phase" data-ui="phase"></span><div class="ms-window" data-ui="window">00:00</div><div class="ms-meta" data-ui="status"></div><div class="ms-meta">当前隐蔽：<b data-ui="privacy"></b></div></section><section class="ms-card ms-after"><h3 style="margin-top:0">短期余韵</h3><div data-ui="after"></div></section></div><h3>选择情境</h3><div class="ms-actions" data-ui="actions"></div><h3>最近记录</h3><section class="ms-card" data-ui="history"></section></main></div>`;DOC.body.appendChild(root);root.querySelector('.ms-close').addEventListener('click',close);root.addEventListener('click',async e=>{const b=e.target.closest?.('[data-context]');if(!b||b.disabled)return;b.disabled=true;try{await settle(b.dataset.context,HOST.__muchiSymbiosisOpenOpts||{})}catch(err){HOST.toastr?.warning?.(err?.message||String(err));render()}});return root}
    function open(opts={}){HOST.__muchiSymbiosisOpenOpts=opts||{};const root=mount();render();root.classList.add('open');return root}
    function close(){DOC.getElementById(ROOT_ID)?.classList.remove('open')}
    async function sync(){let changed=false;await updateVariablesWith(vars=>{vars=vars||{};vars.stat_data=vars.stat_data||{};changed=expireIfNeeded(vars.stat_data);return vars},{type:'message',message_id:-1});if(changed)try{eventEmit('muchi:symbiosis-updated',{type:'afterglow-expired'})}catch(_){ }return changed}
    function cleanup(){try{DOC.getElementById(ROOT_ID)?.remove();DOC.getElementById(STYLE_ID)?.remove()}catch(_){ }for(const h of stops)try{h?.stop?.()}catch(_){ }try{if(HOST.MuchiSymbiosis?.version===VERSION)delete HOST.MuchiSymbiosis}catch(_){ }}
    const stops=[];try{if(typeof HOST.__muchiSymbiosisCleanup==='function')HOST.__muchiSymbiosisCleanup()}catch(_){ }HOST.__muchiSymbiosisCleanup=cleanup;
    const api={open,close,settle,phase:()=>phase(stat()),privacy:opts=>privacyContext(opts||{},stat()),assessPlan,assessSearch,sync,version:VERSION};HOST.MuchiSymbiosis=api;try{window.MuchiSymbiosis=api}catch(_){ }
    try{stops.push(eventOn(getButtonEvent('共生监测'),()=>open()))}catch(_){ }
    try{stops.push(eventOn('muchi:open-symbiosis',payload=>open(payload||{})))}catch(_){ }
    try{stops.push(eventOn('muchi:explore-updated',()=>setTimeout(()=>sync().catch(()=>{}),30)))}catch(_){ }
    try{HOST.addEventListener('pagehide',cleanup,{once:true})}catch(_){ }
  })();
  return resolveHost()?.MuchiSymbiosis||null;
}

export function getSymbiosisApi(){return resolveHost()?.MuchiSymbiosis||null}
export function openSymbiosis(options={}){const api=getSymbiosisApi();if(!api?.open)throw new Error('暮迟共生系统尚未挂载');return api.open(options)}
export function assessPlan(options={}){return getSymbiosisApi()?.assessPlan?.(options)||null}
export function getSymbiosisDiagnostics(){const api=getSymbiosisApi();return {moduleVersion:SYMBIOSIS_VERSION,mounted:!!api,runtimeVersion:api?.version||null}}

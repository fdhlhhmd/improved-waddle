const S=[['backlog','Backlog'],['todo','To do'],['doing','Doing'],['done','Done']];
const P=['Low','Medium','High'];
const board=document.getElementById('board');
const uid=()=>Math.random().toString(36).slice(2,9);
const rem=ts=>ts.filter(t=>t.status==='todo'||t.status==='doing').length;
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const LEN=7;
const newSprint=ts=>({start:ymd(new Date()),h:{0:rem(ts)}});
function seed(){
  const d=new Date();d.setDate(d.getDate()-3);
  const tasks=[
    {id:'a1',title:'Sketch the onboarding screens',pri:2,status:'doing'},
    {id:'a2',title:'Write tests for the login endpoint',pri:1,status:'todo'},
    {id:'a3',title:'Fix menu overflow on small phones',pri:2,status:'todo'},
    {id:'a4',title:'Reply to the supervisor email',pri:0,status:'todo'},
    {id:'a5',title:'Push the project README',pri:1,status:'done'},
    {id:'a6',title:'Set up the project repo',pri:1,status:'done'},
    {id:'b1',title:'Add a dark mode toggle',pri:0,status:'backlog'},
    {id:'b2',title:'Export tasks as CSV',pri:0,status:'backlog'},
    {id:'b3',title:'Plan the release notes',pri:1,status:'backlog'}
  ];
  return {tasks,sprint:{start:ymd(d),h:{0:6,1:6,2:5}}};
}
function load(){
  try{
    const v=JSON.parse(localStorage.getItem('docket-v2'));
    if(v&&Array.isArray(v.tasks)&&v.sprint)return v;
    const o=JSON.parse(localStorage.getItem('docket-tasks'));
    if(Array.isArray(o))return {tasks:o,sprint:newSprint(o)};
  }catch(e){}
  return null;
}
let {tasks,sprint}=load()||seed();
function dayIdx(){
  const [y,m,d]=sprint.start.split('-').map(Number),n=new Date();
  return Math.max(0,Math.round((new Date(n.getFullYear(),n.getMonth(),n.getDate())-new Date(y,m-1,d))/864e5));
}
function save(){
  sprint.h[dayIdx()]=rem(tasks);
  try{localStorage.setItem('docket-v2',JSON.stringify({tasks,sprint}))}catch(e){}
}

function card(t){
  const c=document.createElement('article');
  c.className='card';c.dataset.id=t.id;
  const label=S.find(s=>s[0]===t.status)[1];
  const next=S[(S.findIndex(s=>s[0]===t.status)+1)%S.length][1];
  c.innerHTML=
    '<button type="button" class="grip" aria-label="Drag to move task"></button>'+
    '<div><p class="title"></p><div class="meta">'+
    '<button type="button" class="pri" aria-label="Priority '+P[t.pri]+'. Change priority"><span class="bars l'+t.pri+'"><i></i><i></i><i></i></span>'+P[t.pri]+'</button>'+
    '<button type="button" class="badge" data-s="'+t.status+'" aria-label="Status '+label+'. Move to '+next+'">'+label+'</button>'+
    '</div></div>'+
    '<button type="button" class="del" aria-label="Delete task">&times;</button>';
  c.querySelector('.title').textContent=t.title;
  return c;
}

function render(){
  board.innerHTML='';
  S.forEach(([key,name])=>{
    const col=document.createElement('section');
    col.className='col'+(key==='done'?' done-col':'');
    col.dataset.s=key;
    const list=tasks.filter(t=>t.status===key);
    col.innerHTML='<div class="col-head"><h2>'+name+'</h2><span class="count">'+list.length+'</span></div><div class="col-body"></div>';
    const body=col.querySelector('.col-body');
    list.forEach(t=>body.appendChild(card(t)));
    board.appendChild(col);
  });
  const n=k=>tasks.filter(t=>t.status===k).length;
  document.getElementById('sum').textContent=rem(tasks)+' open, '+n('done')+' done, '+n('backlog')+' in backlog';
  chart();
}

board.addEventListener('click',e=>{
  const el=e.target.closest('.card');if(!el)return;
  const t=tasks.find(x=>x.id===el.dataset.id);if(!t)return;
  if(e.target.closest('.del')){tasks=tasks.filter(x=>x!==t)}
  else if(e.target.closest('.pri')){t.pri=(t.pri+1)%3}
  else if(e.target.closest('.badge')){
    t.status=S[(S.findIndex(s=>s[0]===t.status)+1)%S.length][0];
    tasks=tasks.filter(x=>x!==t);tasks.push(t);
  } else return;
  save();render();
});

document.getElementById('add').addEventListener('submit',e=>{
  e.preventDefault();
  const inp=document.getElementById('title');
  const title=inp.value.trim();if(!title)return;
  const pri=+document.querySelector('input[name=pri]:checked').value;
  tasks.unshift({id:uid(),title,pri,status:document.getElementById('dest').value});
  inp.value='';inp.focus();save();render();
});

/* Burndown: remaining = To do + Doing, one snapshot per sprint day */
function series(){
  const t=dayIdx(),a=[];
  let last=sprint.h[0]!==undefined?sprint.h[0]:rem(tasks);
  for(let d=0;d<=t;d++){if(sprint.h[d]!==undefined)last=sprint.h[d];a.push(last)}
  a[t]=rem(tasks);
  return a;
}
function chart(){
  const a=series(),t=a.length-1,N=Math.max(LEN,t),W=520,H=240,L=36,R=16,T=16,B=34;
  const step=Math.ceil(Math.max(4,...a)/4),ymax=step*4;
  const X=d=>+(L+(W-L-R)*d/N).toFixed(1),Y=v=>+(T+(H-T-B)*(1-v/ymax)).toFixed(1);
  let s='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Burndown chart: '+a[t]+' tasks remaining on day '+t+'">';
  for(let v=0;v<=ymax;v+=step)s+='<line class="grid" x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><text x="'+(L-8)+'" y="'+(Y(v)+4)+'" text-anchor="end">'+v+'</text>';
  for(let d=0;d<=N;d++)s+='<text x="'+X(d)+'" y="'+(H-12)+'" text-anchor="middle"'+(d===t?' class="now"':'')+'>'+d+'</text>';
  const line=a.map((v,d)=>(d?'L':'M')+X(d)+' '+Y(v)).join('');
  s+='<path class="area" d="'+line+'L'+X(t)+' '+Y(0)+'L'+X(0)+' '+Y(0)+'Z"/>';
  s+='<path class="ideal" d="M'+X(0)+' '+Y(a[0])+'L'+X(LEN)+' '+Y(0)+(N>LEN?'L'+X(N)+' '+Y(0):'')+'"/>';
  s+='<path class="actual" d="'+line+'"/>';
  a.forEach((v,d)=>{if(d===t||a.length<=15)s+='<circle class="pt" cx="'+X(d)+'" cy="'+Y(v)+'" r="'+(d===t?6:4)+'"/>'});
  document.getElementById('chart').innerHTML=s+'</svg>';
  const ideal=Math.max(0,a[0]*(1-Math.min(t,LEN)/LEN)),diff=a[t]-ideal;
  const verdict=Math.abs(diff)<.5?'on track':(diff>0?'behind':'ahead')+' by '+(+Math.abs(diff).toFixed(1));
  document.getElementById('burnnote').textContent='Day '+Math.min(t,LEN)+' of '+LEN+': '+a[t]+' left, ideal is '+(+ideal.toFixed(1))+', so you are '+verdict+'. Solid line is actual, dashed is ideal. Remaining counts To do and Doing; Backlog is not counted.';
}
document.getElementById('restart').addEventListener('click',()=>{sprint=newSprint(tasks);save();render()});

/* Pointer-based drag and drop: works with mouse, pen and touch */
let drag=null;
board.addEventListener('pointerdown',e=>{
  const g=e.target.closest('.grip');if(!g)return;
  e.preventDefault();
  const el=g.closest('.card'),r=el.getBoundingClientRect();
  const ghost=el.cloneNode(true);
  ghost.classList.add('ghost');
  ghost.style.cssText='width:'+r.width+'px;left:'+r.left+'px;top:'+r.top+'px';
  document.body.appendChild(ghost);
  el.classList.add('lift');
  drag={el,ghost,dx:e.clientX-r.left,dy:e.clientY-r.top,x:e.clientX,y:e.clientY};
  requestAnimationFrame(scroller);
});
addEventListener('pointermove',e=>{
  if(!drag)return;
  drag.x=e.clientX;drag.y=e.clientY;
  drag.ghost.style.left=(e.clientX-drag.dx)+'px';
  drag.ghost.style.top=(e.clientY-drag.dy)+'px';
  const hit=document.elementFromPoint(e.clientX,e.clientY);
  const col=hit&&hit.closest('.col');if(!col)return;
  const body=col.querySelector('.col-body');
  const after=[...body.querySelectorAll('.card:not(.lift)')].find(c=>{
    const b=c.getBoundingClientRect();return e.clientY<b.top+b.height/2;
  });
  body.insertBefore(drag.el,after||null);
});
function scroller(){
  if(!drag)return;
  if(drag.x<50)board.scrollLeft-=14;else if(drag.x>innerWidth-50)board.scrollLeft+=14;
  if(drag.y<70)scrollBy(0,-10);else if(drag.y>innerHeight-70)scrollBy(0,10);
  requestAnimationFrame(scroller);
}
function drop(){
  if(!drag)return;
  drag.ghost.remove();
  const next=[];
  board.querySelectorAll('.col').forEach(col=>{
    col.querySelectorAll('.card').forEach(c=>{
      const t=tasks.find(x=>x.id===c.dataset.id);
      if(t){t.status=col.dataset.s;next.push(t)}
    });
  });
  tasks=next;drag=null;save();render();
}
addEventListener('pointerup',drop);
addEventListener('pointercancel',drop);

render();
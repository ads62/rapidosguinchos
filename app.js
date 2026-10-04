(()=>{const d=document,r=d.documentElement,$=s=>d.querySelector(s),fine=matchMedia('(hover:hover) and (pointer:fine)').matches,rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
// tema com transição circular (lente)
$('#tg').onclick=e=>{const n=r.dataset.theme==='dark'?'light':'dark',set=()=>{r.dataset.theme=n;try{localStorage.setItem('theme',n)}catch(_){}};
if(!d.startViewTransition||rm)return set();const x=e.clientX,y=e.clientY,R=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
d.startViewTransition(set).ready.then(()=>r.animate({clipPath:[`circle(0 at ${x}px ${y}px)`,`circle(${R}px at ${x}px ${y}px)`]},{duration:700,easing:'cubic-bezier(.7,0,.2,1)',pseudoElement:'::view-transition-new(root)'}))};
// menu mobile
const mn=$('#mn'),nav=$('#nav'),tgl=o=>{nav.classList.toggle('open',o);mn.classList.toggle('open',o);mn.setAttribute('aria-expanded',o);d.body.style.overflow=o?'hidden':''};
mn.onclick=()=>tgl(!nav.classList.contains('open'));nav.onclick=e=>e.target.tagName==='A'&&tgl(false);d.onkeydown=e=>e.key==='Escape'&&tgl(false);
// reveal
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.2});d.querySelectorAll('.rv').forEach((el,i)=>{el.style.transitionDelay=(i%3)*.08+'s';io.observe(el)});
// 24 horas preenche com o scroll
const t=$('#t24');let tk=0;const up=()=>{tk=0;const b=t.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.85-b.top)/(b.height*.9)));t.style.setProperty('--p',p.toFixed(3))};
addEventListener('scroll',()=>{tk||(tk=requestAnimationFrame(up))},{passive:true});up();
// cursor + farol (somente mouse)
if(fine&&!rm){r.classList.add('hc');const c=$('.cur');let tx=innerWidth*.7,ty=innerHeight*.3,bx=tx,by=ty,run=0;
const loop=()=>{bx+=(tx-bx)*.08;by+=(ty-by)*.08;r.style.setProperty('--mx',bx+'px');r.style.setProperty('--my',by+'px');
const nx=(bx/innerWidth-.5),ny=(by/innerHeight-.5);r.style.setProperty('--px',nx*-8+'px');r.style.setProperty('--py',ny*-6+'px');
Math.abs(tx-bx)+Math.abs(ty-by)>.5?requestAnimationFrame(loop):run=0};
addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;c.style.transform=`translate(${tx}px,${ty}px)`;run||(run=requestAnimationFrame(loop))},{passive:true});
d.addEventListener('pointerover',e=>{const a=e.target.closest('a,button,[data-c]');c.className='cur'+(!a?'':a.matches('[data-c]')?' im':a.classList.contains('btn')?' bt':' lk')})}})();

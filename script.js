(function(){
  'use strict';
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if(isTouch) document.body.classList.add('touch');

  document.getElementById('yr').textContent = new Date().getFullYear();

  /* cursor — pointer only */
  if(!isTouch){
    var dot=document.getElementById('cur'),ring=document.getElementById('cur-r'),
        mx=0,my=0,rx=0,ry=0,shown=false;
    addEventListener('mousemove',function(e){
      mx=e.clientX;my=e.clientY;
      dot.style.transform='translate('+mx+'px,'+my+'px) translate(-50%,-50%)';
      if(!shown){shown=true;dot.style.opacity=1;ring.style.opacity=1;}
    },{passive:true});
    (function loop(){
      rx+=(mx-rx)*.16; ry+=(my-ry)*.16;
      ring.style.transform='translate('+rx+'px,'+ry+'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    var grow="a,button,.scard,.pcard,.tag,.chip,.clink";
    document.querySelectorAll(grow).forEach(function(el){
      el.addEventListener('mouseenter',function(){ring.style.width='48px';ring.style.height='48px';ring.style.borderColor='rgba(126,162,255,.85)';dot.style.transform+=' scale(1.6)';});
      el.addEventListener('mouseleave',function(){ring.style.width='30px';ring.style.height='30px';ring.style.borderColor='rgba(126,162,255,.5)';});
    });
  }

  /* nav scrolled */
  var nav=document.getElementById('nav');
  addEventListener('scroll',function(){nav.classList.toggle('scrolled',scrollY>50);},{passive:true});

  /* mobile drawer */
  var burger=document.getElementById('burger'),drawer=document.getElementById('drawer');
  function toggleDrawer(){var o=drawer.classList.toggle('open');burger.classList.toggle('open',o);document.body.style.overflow=o?'hidden':'';}
  burger.addEventListener('click',toggleDrawer);
  drawer.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){drawer.classList.remove('open');burger.classList.remove('open');document.body.style.overflow='';});});

  /* reveal observer */
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:.14,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.rv,.rv-l,.rv-r,#rose,.vine-sec').forEach(function(el){io.observe(el);});

  /* smooth scroll */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var t=document.querySelector(a.getAttribute('href'));
      if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});}
    });
  });

  /* subtle hero parallax — pointer only, rAF-throttled */
  if(!isTouch){
    var img=document.querySelector('.hero-bg img'),ticking=false;
    addEventListener('scroll',function(){
      if(ticking)return;ticking=true;
      requestAnimationFrame(function(){
        var y=scrollY,vh=innerHeight;
        if(y<vh&&img)img.style.transform='scale(1.04) translateY('+(y*.12)+'px)';
        ticking=false;
      });
    },{passive:true});
  }
})();

/* scrollspy — highlight the nav link of the section in view */
(function(){
  var links=[].slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if(!links.length)return;
  var map={};
  links.forEach(function(a){var id=a.getAttribute('href').slice(1),s=document.getElementById(id);if(s)map[id]=a;});
  var spy=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        links.forEach(function(a){a.classList.remove('active');a.removeAttribute('aria-current');});
        var a=map[e.target.id];
        if(a){a.classList.add('active');a.setAttribute('aria-current','true');}
      }
    });
  },{rootMargin:'-45% 0px -50% 0px'});
  ['about','skills','projects','contact'].forEach(function(id){var s=document.getElementById(id);if(s)spy.observe(s);});
})();

/* ambient music — fade in 0→target over 3s, play ~35s, fade out to 0 and stop. discreet toggle. */
(function(){
  var bgm=document.getElementById('bgm'),mt=document.getElementById('music-toggle');
  if(!bgm||!mt)return;
  var TARGET=0.45,started=false,fadeTimer=null;
  function ramp(from,to,ms,done){
    var t0=performance.now();
    (function step(now){
      var k=Math.min(1,(now-t0)/ms);
      bgm.volume=from+(to-from)*k;
      if(k<1)requestAnimationFrame(step);else if(done)done();
    })(performance.now());
  }
  function start(){
    if(started||localStorage.getItem('bgm')==='off')return;
    started=true;
    bgm.currentTime=0;bgm.volume=0;
    bgm.play()
      .then(function(){
        mt.classList.add('playing');
        ramp(0,TARGET,3000);
        clearTimeout(fadeTimer);
        fadeTimer=setTimeout(function(){ramp(TARGET,0,3000,function(){bgm.pause();mt.classList.remove('playing');});},35000);
      })
      .catch(function(){started=false;}); /* still blocked → retry next gesture */
  }
  function disable(){
    localStorage.setItem('bgm','off');
    mt.classList.add('off');mt.classList.remove('playing');mt.setAttribute('aria-pressed','false');
    clearTimeout(fadeTimer);bgm.pause();
  }
  function enable(){
    localStorage.removeItem('bgm');
    mt.classList.remove('off');mt.setAttribute('aria-pressed','true');
    started=false;start();
  }
  mt.addEventListener('click',function(){mt.classList.contains('off')?enable():disable();});
  if(localStorage.getItem('bgm')==='off'){mt.classList.add('off');mt.setAttribute('aria-pressed','false');}
  else{
    var kick=function(e){
      if(e&&e.target&&e.target.closest&&e.target.closest('#music-toggle'))return; /* toggle handles itself */
      start();
      if(started)['pointerdown','keydown','touchstart','scroll'].forEach(function(ev){removeEventListener(ev,kick);});
    };
    ['pointerdown','keydown','touchstart','scroll'].forEach(function(ev){addEventListener(ev,kick,{passive:true});});
  }
})();

/* Three.js decorative hero only. Optional, capped at 30 FPS, no interactivity,
   and automatically disabled for reduced motion / WebGL-unavailable clients. */
let active=null;
const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const coarse=window.matchMedia('(pointer: coarse)');
function stop(){if(active){active.stop();active=null;}}
async function boot(){
  const canvas=document.getElementById('heroWebgl');
  if(!canvas||active||prefersReduced.matches)return;
  if(coarse.matches&&window.innerWidth<460)return; // conserve phone battery
  if(!window.WebGLRenderingContext)return;
  try{
    const THREE=await import('https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js');
    if(!canvas.isConnected||active||prefersReduced.matches)return;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(45,1,0.1,100);camera.position.z=11.3;
    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.4));
    const count=175,vertices=new Float32Array(count*3);
    for(let i=0;i<count;i++){
      const a=i*2.399963229728653,r=2.45*Math.sqrt((i+.5)/count),theta=a*0.6;
      vertices[i*3]=Math.cos(a)*r+(Math.cos(theta)*.2);
      vertices[i*3+1]=Math.sin(a)*r;
      vertices[i*3+2]=Math.sin(theta)*1.4;
    }
    const pointsGeo=new THREE.BufferGeometry();pointsGeo.setAttribute('position',new THREE.BufferAttribute(vertices,3));
    const dots=new THREE.Points(pointsGeo,new THREE.PointsMaterial({color:document.documentElement.dataset.theme==='dark'?0xc3b8ff:0x7978ed,size:0.058,transparent:true,opacity:.73,sizeAttenuation:true}));
    scene.add(dots);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.7,.008,4,110),new THREE.MeshBasicMaterial({color:document.documentElement.dataset.theme==='dark'?0x8b7bed:0x7b8ce9,transparent:true,opacity:.24}));
    ring.rotation.x=1.06;ring.rotation.y=.4;scene.add(ring);
    const ring2=new THREE.Mesh(new THREE.TorusGeometry(2.14,.005,3,132),new THREE.MeshBasicMaterial({color:document.documentElement.dataset.theme==='dark'?0xa79ce9:0x97aff3,transparent:true,opacity:.19}));
    ring2.rotation.x=.7;ring2.rotation.y=-.5;scene.add(ring2);
    let raf=0,last=0;let w=0,h=0,stopped=false;
    const resize=()=>{if(!canvas.isConnected)return;const b=canvas.getBoundingClientRect();if(b.width===w&&b.height===h)return;w=b.width;h=b.height;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();};
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);resize();
    const onTheme=()=>{const dark=document.documentElement.dataset.theme==='dark';dots.material.color.setHex(dark?0xc3b8ff:0x7978ed);ring.material.color.setHex(dark?0x8b7bed:0x7b8ce9);ring2.material.color.setHex(dark?0xa79ce9:0x97aff3);};
    window.addEventListener('ict:theme',onTheme);
    const animate=t=>{if(stopped||!canvas.isConnected){stop();return;}raf=requestAnimationFrame(animate);if(document.hidden||t-last<33)return;last=t;
      const seconds=t*.001;dots.rotation.y=seconds*.035;dots.rotation.z=Math.sin(seconds*.09)*.09;
      ring.rotation.z=seconds*.052;ring2.rotation.y=-seconds*.038;
      renderer.render(scene,camera);
    };
    active={stop(){if(stopped)return;stopped=true;cancelAnimationFrame(raf);window.removeEventListener('ict:theme',onTheme);resizeObserver.disconnect();pointsGeo.dispose();dots.material.dispose();ring.geometry.dispose();ring.material.dispose();ring2.geometry.dispose();ring2.material.dispose();renderer.dispose();}};
    raf=requestAnimationFrame(animate);
  } catch(e) { /* Pure CSS design remains fully functional offline. */ }
}
function animateHeroWord(){
  const label=document.getElementById('heroDecode');if(!label||label.dataset.played)return;
  label.dataset.played='true';
  label.classList.add('decodable');
  if(window.UX?.lang!=='en'||prefersReduced.matches)return;
  const original=label.textContent;const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const chars=Array.from(original);let step=0;
  function frame(){if(!label.isConnected||window.UX?.lang!=='en')return;step++;
    label.textContent=chars.map((c,i)=> c===' '||c==='.'||i<Math.floor(step/2)?c:alphabet[(i*11+step*7)%alphabet.length]).join('');
    if(step<Math.min(chars.length*2,30))setTimeout(frame,42);else label.textContent=original;
  }
  frame();
}
let pending=false;
function update(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;if(document.getElementById('heroWebgl')){boot();animateHeroWord();}else stop();});}
window.addEventListener('ict:render',update);
window.addEventListener('ict:theme',update);
window.addEventListener('DOMContentLoaded',update);
prefersReduced.addEventListener?.('change',update);

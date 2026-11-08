// Free-form rocket editor. Positions and sizes use the same coordinates as the build grid.
const partCatalog={
 capsule:{name:'Command capsule',kind:'capsule',w:40,h:60,mass:110,color:'#e8f3ff'},
 spark:{name:'Spark engine',kind:'engine',engine:'spark',w:40,h:40,mass:55,color:'#ffba72'},
 comet:{name:'Comet engine',kind:'engine',engine:'comet',w:60,h:40,mass:75,color:'#87e8ff'},
 titan:{name:'Titan engine',kind:'engine',engine:'titan',w:80,h:60,mass:105,color:'#b9a2ff'},
 tankSmall:{name:'Small fuel tank',kind:'tank',w:40,h:40,mass:18,fuel:100,color:'#a6d5e5'},
 tankMedium:{name:'Medium fuel tank',kind:'tank',w:40,h:80,mass:30,fuel:220,color:'#b3d8eb'},
 tankLarge:{name:'Large fuel tank',kind:'tank',w:80,h:100,mass:60,fuel:460,color:'#c4dfef'},
 fin:{name:'Swept fins',kind:'fin',w:80,h:40,mass:14,color:'#ffb877'},
 finDelta:{name:'Delta fins',kind:'fin',w:100,h:60,mass:22,color:'#f9ce8e'},
 fairing:{name:'Pointed fairing',kind:'fairing',w:60,h:60,mass:15,color:'#d9e8f5'},
 fairingWide:{name:'Wide fairing',kind:'fairing',w:100,h:80,mass:28,color:'#aabfdc'},
 beam:{name:'Structural beam',kind:'structure',w:40,h:40,mass:10,color:'#849ab0'},
 truss:{name:'Wide truss',kind:'structure',w:80,h:40,mass:18,color:'#a2b8c9'},
 legs:{name:'Landing legs',kind:'legs',w:100,h:60,mass:30,color:'#c7d5dd'},
 legsHeavy:{name:'Heavy landing legs',kind:'legs',w:140,h:60,mass:50,color:'#9cafbd'},
 wheels:{name:'Rover wheels',kind:'wheel',w:100,h:40,mass:32,color:'#8fabc3'},
 wheelsBig:{name:'All-terrain wheels',kind:'wheel',w:120,h:60,mass:48,color:'#7fa1ba'},
 separator:{name:'Stage separator',kind:'separator',w:60,h:20,mass:12,color:'#f4cf68'},
 parachute:{name:'Parachute module',kind:'parachute',w:40,h:20,mass:18,color:'#f6a688'}
};
let rocketParts=[],selectedPart=null,partDrag=null,editorNotice='',nextPartId=1;
function starterRocket(){rocketParts=[['capsule',300,200],['parachute',300,240],['tankMedium',300,290],['spark',300,350],['fin',300,330],['legs',300,330]].map(([type,x,y])=>({id:nextPartId++,type,x,y}));selectedPart=null;editorNotice='Drag a part from the tray onto the grid. Drag installed parts to move them.'}
function storeBlueprint(){try{localStorage.setItem('launchLabBlueprint',JSON.stringify(rocketParts))}catch{}}
function analyzeRocket(){
 const separators=rocketParts.filter(p=>partCatalog[p.type].kind==='separator').sort((a,b)=>b.y-a.y);
 const stageOf=p=>separators.filter(s=>p.y<s.y).length;
 const stages=Array.from({length:separators.length+1},()=>({parts:[],fuel:0,dry:0,thrust:0,burn:0,engines:[]}));
 for(const part of rocketParts){const def=partCatalog[part.type],stage=stages[stageOf(part)];stage.parts.push(part.id);stage.dry+=def.mass;stage.fuel+=def.fuel||0;if(def.engine){const engine=engines[def.engine];stage.thrust+=engine.thrust;stage.burn+=engine.burn;stage.engines.push(part)}}
 const mass=stages.reduce((v,s)=>v+s.dry+s.fuel,0),twr=mass?stages[0].thrust/(mass*9.81):0;
 let error='';
 if(!rocketParts.some(p=>p.type==='capsule'))error='Add a command capsule.';
 else if(rocketParts.some(p=>partCatalog[p.type].engine&&!progress.owned.includes(partCatalog[p.type].engine)))error='Research the locked engines before launch.';
 else if(stages.some(s=>!s.thrust||!s.fuel))error='Every stage needs an engine and a fuel tank. Place separators between complete stages.';
 else if(twr<=1)error='Too heavy to lift off. Add thrust or remove heavy parts.';
 // Parts must touch the assembly, but side-mounted fins, legs, and wheels may overlap.
 const connected=new Set(rocketParts.filter(p=>p.type==='capsule').map(p=>p.id));
 for(let pass=0;pass<rocketParts.length;pass++)for(const p of rocketParts)if(!connected.has(p.id)&&rocketParts.some(q=>connected.has(q.id)&&Math.abs(p.x-q.x)<=(partCatalog[p.type].w+partCatalog[q.type].w)/2+4&&Math.abs(p.y-q.y)<=(partCatalog[p.type].h+partCatalog[q.type].h)/2+4))connected.add(p.id);
 if(!error&&connected.size!==rocketParts.length)error='Some parts are floating. Move them so their edges touch another part. Grid spacing is 10 units.';
 return{stages,stageOf,mass,twr,error};
}
function editorRefresh(){
 const analysis=analyzeRocket();$('credits').textContent=progress.credits;$('best').textContent=Math.floor(progress.best).toLocaleString()+' m';$('mass').textContent=Math.round(analysis.mass)+' kg';$('twr').textContent=analysis.twr.toFixed(2);$('buildMessage').textContent=analysis.error||editorNotice||'Ready to launch your custom design.';$('launch').disabled=false;
 const part=rocketParts.find(p=>p.id===selectedPart);$('selectedPart').textContent=part?partCatalog[part.type].name:'Drag parts from the tray. Select installed parts to delete them.';$('deletePart').disabled=!part;
 $('palette').replaceChildren(...Object.entries(partCatalog).map(([id,def])=>{const button=document.createElement('button');button.type='button';button.className='part-tile';button.setAttribute('aria-label','Drag '+def.name+' to the assembly grid');button.style.setProperty('--part-color',def.color);const label=document.createElement('span');label.textContent=def.name;const detail=document.createElement('small');const locked=def.engine&&!progress.owned.includes(def.engine);detail.textContent=locked?'Research · '+engines[def.engine].cost+' credits':(def.fuel?def.fuel+' kg fuel · ':def.engine?engines[def.engine].thrust/1000+' kN · ':'')+def.mass+' kg';const preview=document.createElement('canvas');preview.width=180;preview.height=100;preview.setAttribute('aria-hidden','true');const previewCtx=preview.getContext('2d');const scale=Math.min(1.1,140/def.w,80/def.h);previewCtx.setTransform(scale,0,0,scale,90,50);renderPart({type:id,x:0,y:0},1,previewCtx);button.append(preview,label,detail);
  button.onpointerdown=e=>{if(flight)return;if(locked){e.preventDefault();if(progress.credits>=engines[def.engine].cost){progress.credits-=engines[def.engine].cost;progress.owned.push(def.engine);save();editorNotice=def.name+' researched. Drag it onto the grid.'}else editorNotice='Not enough credits to research '+def.name+'.';editorRefresh();return}beginPartDrag(e,id,null)};
  return button}));
}
function gridPoint(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height,inside:e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom}}
function clampPart(type,x,y){const d=partCatalog[type];return{x:Math.max(d.w/2+20,Math.min(W-d.w/2-20,Math.round(x/10)*10)),y:Math.max(100+d.h/2,Math.min(H-80-d.h/2,Math.round(y/10)*10))}}
function beginPartDrag(e,type,existing){e.preventDefault();selectedPart=existing?.id??null;partDrag={type,id:existing?.id??null,x:existing?.x??300,y:existing?.y??300,startX:e.clientX,startY:e.clientY,moved:false,inside:false,offsetX:0,offsetY:0};if(existing){const p=gridPoint(e);partDrag.offsetX=p.x-existing.x;partDrag.offsetY=p.y-existing.y}e.currentTarget?.setPointerCapture?.(e.pointerId);$('dragLabel').textContent=partCatalog[type].name;$('dragLabel').hidden=false;movePartDrag(e)}
function movePartDrag(e){if(!partDrag)return;const p=gridPoint(e);partDrag.inside=p.inside;partDrag.moved ||= Math.hypot(e.clientX-partDrag.startX,e.clientY-partDrag.startY)>5;const target=clampPart(partDrag.type,p.x-partDrag.offsetX,p.y-partDrag.offsetY);partDrag.x=target.x;partDrag.y=target.y;$('dragLabel').style.left=(e.clientX+14)+'px';$('dragLabel').style.top=(e.clientY+14)+'px'}
function endPartDrag(e){if(!partDrag)return;movePartDrag(e);const drag=partDrag;partDrag=null;$('dragLabel').hidden=true;
 if(drag.inside&&(drag.id||drag.moved)){if(drag.id){Object.assign(rocketParts.find(p=>p.id===drag.id),{x:drag.x,y:drag.y});selectedPart=drag.id}else if(rocketParts.length<60){const part={id:nextPartId++,type:drag.type,x:drag.x,y:drag.y};rocketParts.push(part);selectedPart=part.id}editorNotice='Part snapped to the grid.';storeBlueprint()}else{editorNotice=drag.id?'Part kept in its original position.':'Drag a part from the tray and release it inside the grid.'}editorRefresh()}
function installEditor(){
 $('gridTools').hidden=true;$('builder').innerHTML='<h2>Parts tray</h2><p>Drag parts from this tray onto the grid. Move installed parts by dragging them. Separators split the rocket into stages from bottom to top.</p><div id="palette" class="parts-palette"></div><p id="selectedPart"></p><div class="actions"><button id="deletePart" class="secondary">Delete selected</button><button id="resetDesign" class="secondary">Starter rocket</button></div><div class="stat"><span>Liftoff mass</span><strong id="mass"></strong></div><div class="stat"><span>Thrust / weight</span><strong id="twr"></strong></div><p id="buildMessage" class="message" role="status"></p><button id="launch" class="wide">Launch custom rocket ↑</button>';
 starterRocket();try{const saved=JSON.parse(localStorage.getItem('launchLabBlueprint'));if(Array.isArray(saved)&&saved.length&&saved.length<=60&&saved.every(p=>Object.hasOwn(partCatalog,p.type)&&Number.isFinite(p.x)&&Number.isFinite(p.y))){rocketParts=saved.map(p=>{const d=partCatalog[p.type];return{id:nextPartId++,type:p.type,x:Math.max(d.w/2+20,Math.min(W-d.w/2-20,p.x)),y:Math.max(100+d.h/2,Math.min(H-80-d.h/2,p.y))}})}}catch{}
 $('deletePart').onclick=()=>{if(flight)return;rocketParts=rocketParts.filter(p=>p.id!==selectedPart);selectedPart=null;editorNotice='Part removed.';storeBlueprint();editorRefresh()};$('resetDesign').onclick=()=>{if(!flight){starterRocket();storeBlueprint();editorRefresh()}};$('launch').onclick=launch;
 canvas.addEventListener('pointerdown',e=>{if(flight)return;const p=gridPoint(e);const hit=[...rocketParts].reverse().find(part=>Math.abs(p.x-part.x)<=partCatalog[part.type].w/2+6&&Math.abs(p.y-part.y)<=partCatalog[part.type].h/2+6);if(hit)beginPartDrag(e,hit.type,hit);else{selectedPart=null;editorRefresh()}});
 window.addEventListener('pointermove',movePartDrag);window.addEventListener('pointerup',endPartDrag);window.addEventListener('pointercancel',()=>{partDrag=null;$('dragLabel').hidden=true});window.addEventListener('blur',()=>{partDrag=null;$('dragLabel').hidden=true});
}
function renderPart(part,alpha=1,renderCtx=ctx){const ctx=renderCtx;const d=partCatalog[part.type],w=d.w,h=d.h;ctx.save();ctx.globalAlpha=alpha;ctx.translate(part.x,part.y);ctx.fillStyle=d.color;ctx.strokeStyle='#142536';ctx.lineWidth=2;
 if(d.kind==='engine'){ctx.fillStyle='#617c94';ctx.fillRect(-w*.3,-h/2,w*.6,h*.35);ctx.fillStyle=d.color;ctx.beginPath();ctx.moveTo(-w*.22,-h*.2);ctx.lineTo(w*.22,-h*.2);ctx.lineTo(w/2,h/2);ctx.lineTo(-w/2,h/2);ctx.closePath();ctx.fill();ctx.stroke()}
 else if(d.kind==='fin'){for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*15,-h/2);ctx.lineTo(side*w/2,h/2);ctx.lineTo(side*15,h*.3);ctx.closePath();ctx.fill();ctx.stroke()}}
 else if(d.kind==='wheel'){ctx.strokeStyle='#9cafbc';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-w/2,0);ctx.lineTo(w/2,0);ctx.stroke();for(const side of [-1,1]){ctx.fillStyle='#16232f';ctx.beginPath();ctx.arc(side*(w/2-h*.3),0,h*.43,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=d.color;ctx.beginPath();ctx.arc(side*(w/2-h*.3),0,h*.18,0,Math.PI*2);ctx.fill()}}
 else if(d.kind==='legs'){ctx.strokeStyle=d.color;ctx.lineWidth=5;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*14,-h/2);ctx.lineTo(side*(w/2-10),h/2-5);ctx.lineTo(side*w/2,h/2-5);ctx.stroke()}}
 else if(d.kind==='structure'){ctx.strokeStyle=d.color;ctx.strokeRect(-w/2,-h/2,w,h);ctx.beginPath();ctx.moveTo(-w/2,-h/2);ctx.lineTo(w/2,h/2);ctx.moveTo(w/2,-h/2);ctx.lineTo(-w/2,h/2);ctx.stroke()}
 else if(d.kind==='fairing'||d.kind==='capsule'){ctx.beginPath();ctx.moveTo(0,-h/2);ctx.quadraticCurveTo(w*.6,-h*.1,w/2,h/2);ctx.lineTo(-w/2,h/2);ctx.quadraticCurveTo(-w*.6,-h*.1,0,-h/2);ctx.fill();ctx.stroke();if(d.kind==='capsule'){ctx.fillStyle='#59bcdf';ctx.beginPath();ctx.arc(0,h*.1,8,0,Math.PI*2);ctx.fill()}}
 else{ctx.fillRect(-w/2,-h/2,w,h);ctx.strokeRect(-w/2,-h/2,w,h);if(d.kind==='tank'){ctx.fillStyle='#58758c';ctx.fillRect(-w/2,-h*.3,w,4);ctx.fillRect(-w/2,h*.3,w,4)}if(d.kind==='parachute'){ctx.strokeStyle='#7e4a41';ctx.beginPath();ctx.arc(0,3,Math.min(13,w/3),Math.PI,Math.PI*2);ctx.stroke()}}
 if(!flight&&part.id===selectedPart){ctx.strokeStyle='#ffda8a';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.strokeRect(-w/2-4,-h/2-4,w+8,h+8);ctx.setLineDash([])}ctx.restore()}
// Replace the preset stack with the actual placed parts in both workshop and flight.
refresh=editorRefresh;
launchMass=()=>analyzeRocket().mass;
launch=function(){if(flight)return;const a=analyzeRocket();partDrag=null;$('dragLabel').hidden=true;build.stages=a.stages.length;build.fins=rocketParts.some(p=>partCatalog[p.type].kind==='fin');build.chute=rocketParts.some(p=>p.type==='parachute');build.engine=a.stages[0].engines.length?partCatalog[a.stages[0].engines[0].type].engine:'spark';flight={altitude:0,velocity:0,peak:0,stage:0,fuels:a.stages.map(s=>s.fuel),configuration:a.stages.map(s=>({...s})),parts:rocketParts.map(p=>({...p,stage:a.stageOf(p)})),elapsed:0,chute:false,done:false,earned:0,hasLiftedOff:false};paused=false;$('throttle').value=100;$('builder').hidden=true;$('flight').hidden=false;$('result').hidden=true;$('pause').disabled=false;$('pause').textContent='Pause';canvas.focus();$('flightMessage').textContent=a.error?'Test started. '+a.error:'Custom rocket launched. Space separates the bottom stage.';flightHUD()};
currentMass=()=>flight.configuration.slice(flight.stage).reduce((sum,s,i)=>sum+s.dry+flight.fuels[i+flight.stage],0);
const originalWorkshop=workshop;workshop=function(){partDrag=null;$('dragLabel').hidden=true;originalWorkshop();$('gridTools').hidden=true;editorNotice='Back at the grid — your design is preserved.';editorRefresh()};
flightHUD=function(){if(!flight)return;const capacity=flight.configuration[flight.stage].fuel,percent=capacity>0?100*flight.fuels[flight.stage]/capacity:0;$('altitude').textContent=Math.floor(flight.altitude).toLocaleString()+' m';$('speed').textContent=Math.round(flight.velocity)+' m/s';$('stage').textContent=(flight.stage+1)+' / '+build.stages;$('fuel').textContent=Math.round(percent)+'%';$('fuelBar').style.width=percent+'%';$('separate').disabled=flight.done||flight.stage>=build.stages-1;$('deploy').disabled=flight.done||!build.chute||flight.chute};
update=function(dt){if(!flight||flight.done||paused)return;const f=flight,stage=f.configuration[f.stage];f.elapsed+=dt;let thrust=0;const throttle=Number($('throttle').value)/100;if(!f.chute&&stage.burn>0&&f.fuels[f.stage]>0&&throttle>0){const used=Math.min(f.fuels[f.stage],stage.burn*throttle*dt);f.fuels[f.stage]-=used;thrust=stage.thrust*used/(stage.burn*dt)}const mass=Math.max(1,currentMass()),gravity=9.81/(1+f.altitude/6371000)**2,density=Math.exp(-f.altitude/8500),drag=(f.chute?16:build.fins?.055:.09)*density*f.velocity*Math.abs(f.velocity);f.velocity+=(thrust/mass-gravity-drag/mass)*dt;f.altitude+=f.velocity*dt;f.peak=Math.max(f.peak,f.altitude);if(f.altitude>.5)f.hasLiftedOff=true;if(f.fuels[f.stage]<=0&&!f.chute)$('flightMessage').textContent=f.stage<build.stages-1?'Stage empty! Press Space to ignite the next stage.':'Fuel exhausted. Deploy parachute below 3,000 m on descent.';if(f.altitude<=0&&!f.hasLiftedOff){f.altitude=0;f.velocity=0;if(thrust<=mass*gravity)$('flightMessage').textContent=!stage.thrust?'No engine on this stage. Separate it or revert to add an engine.':!f.fuels[f.stage]?'No fuel on this stage. Separate it or revert to add a fuel tank.':'On the launch pad. Increase throttle, or revert to lighten the rocket or add thrust.'}else if(f.altitude<=0&&f.elapsed>.3){f.altitude=0;f.impactSpeed=Math.abs(f.velocity);const legs=f.parts.some(p=>p.stage>=f.stage&&partCatalog[p.type].kind==='legs');f.landingLimit=legs?20:12;if(legs&&f.impactSpeed<20)f.velocity=-10;finish('landed')}else if(f.elapsed>=240)finish('aborted');flightHUD()};
drawBuildGrid=function(){ctx.fillStyle='#0c2031';ctx.fillRect(0,0,W,H);for(let x=0;x<=W;x+=10){ctx.strokeStyle=x%100?'#204057':'#33586e';ctx.lineWidth=x%100?.5:1;ctx.beginPath();ctx.moveTo(x,70);ctx.lineTo(x,H);ctx.stroke()}for(let y=70;y<=H;y+=10){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}ctx.fillStyle='#d0f0ff';ctx.font='bold 15px monospace';ctx.fillText('ROCKET ASSEMBLY GRID',22,30);ctx.font='12px monospace';ctx.fillText('DRAG PARTS FROM THE TRAY · SNAP TO GRID',22,52);for(const p of rocketParts)if(p.id!==partDrag?.id)renderPart(p);if(partDrag?.inside)renderPart({...partDrag},.6);ctx.fillStyle='#b6d8e9';ctx.fillText('Drag to move · Select and delete to remove',22,H-25)};
drawRocket=function(x,y,scale){if(!flight)return;const parts=flight.parts.filter(p=>p.stage>=flight.stage);if(!parts.length)return;const minY=Math.min(...parts.map(p=>p.y-partCatalog[p.type].h/2)),maxY=Math.max(...parts.map(p=>p.y+partCatalog[p.type].h/2)),centerX=(Math.min(...parts.map(p=>p.x-partCatalog[p.type].w/2))+Math.max(...parts.map(p=>p.x+partCatalog[p.type].w/2)))/2;const size=Math.min(1.3,330/Math.max(1,maxY-minY));ctx.save();ctx.translate(x-centerX*size,y-maxY*size);ctx.scale(size,size);for(const part of parts)renderPart(part);if(!flight.done&&!flight.chute&&flight.fuels[flight.stage]>0&&Number($('throttle').value)>0)for(const engine of flight.configuration[flight.stage].engines){const def=partCatalog[engine.type],throttle=Math.max(0,Math.min(1,Number($('throttle').value)/100)),flameLength=(30+Math.sin(animation*30)*8)*throttle,flameWidth=def.w*.3*Math.sqrt(throttle);ctx.fillStyle='#ffb06b';ctx.beginPath();ctx.moveTo(engine.x-flameWidth,engine.y+def.h/2);ctx.lineTo(engine.x,engine.y+def.h/2+flameLength);ctx.lineTo(engine.x+flameWidth,engine.y+def.h/2);ctx.fill()}if(flight.chute){ctx.strokeStyle='#fff1ce';ctx.beginPath();ctx.moveTo(centerX-20,minY);ctx.lineTo(centerX-70,minY-70);ctx.moveTo(centerX+20,minY);ctx.lineTo(centerX+70,minY-70);ctx.stroke();ctx.fillStyle='#f9b77f';ctx.beginPath();ctx.arc(centerX,minY-70,70,Math.PI,Math.PI*2);ctx.fill()}ctx.restore()};
const finishWithFlightRewards=finish;
finish=function(reason){
 if(!flight||flight.done)return;
 const impact=flight.impactSpeed??Math.abs(flight.velocity),limit=flight.landingLimit??12;
 if(reason==='aborted'&&!flight.hasLiftedOff){workshop();return}
 if(reason==='landed'&&impact>=limit){
  flight.crashed=true;flight.crashTime=animation;flight.impactSpeed=impact;
  const attached=flight.parts.filter(p=>p.stage>=flight.stage),minX=Math.min(...attached.map(p=>p.x)),maxX=Math.max(...attached.map(p=>p.x)),bottom=Math.max(...attached.map(p=>p.y+partCatalog[p.type].h/2));
  flight.debris=attached.map(p=>({...p,dx:p.x-(minX+maxX)/2,dy:p.y-bottom,vx:(Math.random()-.5)*160,vy:-60-Math.random()*180,spin:(Math.random()-.5)*8}));
  finishWithFlightRewards('crashed');$('resultTitle').textContent='Rocket destroyed!';$('report').textContent='Crashed into the ground at '+Math.round(impact)+' m/s. '+$('report').textContent+' Use a parachute or landing legs for a gentler touchdown.';$('result').hidden=true;$('flightMessage').textContent='Impact! Your rocket broke apart.';
 }else finishWithFlightRewards(reason);
};
const renderIntactRocket=drawRocket;
drawRocket=function(x,y,scale){
 if(!flight?.crashed){renderIntactRocket(x,y,scale);return}
 const age=Math.max(0,animation-flight.crashTime),ground=H-76;
 if(age>=1.4)$('result').hidden=false;
 for(const debris of flight.debris){const px=W/2+debris.dx*.8+debris.vx*Math.min(age,2),py=Math.min(ground-10,ground+debris.dy*.8+debris.vy*age+125*age*age);
  ctx.save();ctx.translate(px,py);ctx.rotate(debris.spin*Math.min(age,2));ctx.scale(.8,.8);renderPart({...debris,x:0,y:0});ctx.restore();
 }
 if(age<1.5){ctx.save();ctx.globalAlpha=Math.max(0,1-age/1.5);for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.fillStyle=i%2?'#ff923e':'#ffdf9c';ctx.beginPath();ctx.arc(W/2+Math.cos(a)*age*90,ground-25-Math.abs(Math.sin(a))*age*100,Math.max(2,35-age*15),0,Math.PI*2);ctx.fill()}ctx.restore()}
 ctx.save();ctx.globalAlpha=Math.max(0,.6-age*.08);ctx.fillStyle='#575d63';for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(W/2+(i-2)*22+age*10,ground-40-age*40-i*10,15+age*10,0,Math.PI*2);ctx.fill()}ctx.restore();
};
installEditor();$('revert').onclick=workshop;$('rebuild').onclick=workshop;refresh();

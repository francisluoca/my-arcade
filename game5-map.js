// A schematic navigation chart; positions and orbit sizes are deliberately not to scale.
const systemBodies=[
 {id:'mercury',name:'Mercury',color:'#b9aba0',r:8,angle:-.7,moons:[]},
 {id:'venus',name:'Venus',color:'#dfba7c',r:12,angle:1.4,moons:[]},
 {id:'earth',name:'Earth',color:'#71b7ed',r:13,angle:-1.3,moons:['Moon']},
 {id:'mars',name:'Mars',color:'#da8569',r:10,angle:.65,moons:['Phobos','Deimos']},
 {id:'jupiter',name:'Jupiter',color:'#d5b08d',r:24,angle:-.5,moons:['Io','Europa','Ganymede','Callisto']},
 {id:'saturn',name:'Saturn',color:'#deca93',r:20,angle:2.5,moons:['Titan','Enceladus','Rhea','Iapetus']},
 {id:'uranus',name:'Uranus',color:'#9ad8dc',r:17,angle:.45,moons:['Titania','Oberon','Ariel','Umbriel']},
 {id:'neptune',name:'Neptune',color:'#7297ed',r:17,angle:-2.4,moons:['Triton','Nereid']}
];
let chartPlanet='earth',chartView='system',chartMoon=null,chartPausedFlight=false,chartOpen=false;
const mapButton=document.createElement('button');mapButton.id='openMap';mapButton.className='secondary';mapButton.textContent='Planet Map · M';mapButton.type='button';document.querySelector('.header-actions').prepend(mapButton);
const mapDialog=document.createElement('dialog');mapDialog.id='planetMap';mapDialog.setAttribute('aria-labelledby','mapTitle');mapDialog.innerHTML='<div class="map-header"><div><div class="tag">MISSION NAVIGATION</div><h2 id="mapTitle">Planets & moons</h2></div><button id="closeMap" class="secondary">Back to rocket · Esc</button></div><div class="map-toolbar"><button id="systemView">Solar system</button><button id="focusView" class="secondary">View planet & moons</button><span id="mapRocketStatus"></span></div><div id="mapChart" class="map-chart"></div><div id="planetChoices" class="planet-choices" aria-label="Select a planet"></div><section class="map-detail"><h3 id="bodyTitle"></h3><p id="bodyDescription"></p><div id="moonChoices" class="planet-choices" aria-label="Select a moon"></div></section><small>Schematic navigation map · Sizes and positions are not to scale · Selected major moons shown. Current flight simulation takes place above Earth.</small>';document.body.append(mapDialog);
function chartCircle(x,y,r,color,name,attributes=''){return '<g '+attributes+' tabindex="0" role="button" aria-label="View '+name+'"><circle cx="'+x+'" cy="'+y+'" r="'+Math.max(20,r+8)+'" fill="transparent"/><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+color+'"/><text x="'+x+'" y="'+(y+r+20)+'" text-anchor="middle" fill="#dceafb" font-size="13">'+name+'</text></g>'}
function selectChartPlanet(id){if(!systemBodies.some(p=>p.id===id))return;chartPlanet=id;chartMoon=null;renderPlanetMap()}
function renderPlanetMap(){
 const planet=systemBodies.find(p=>p.id===chartPlanet);let svg='<svg viewBox="0 0 1000 560" role="group" aria-label="'+(chartView==='system'?'Solar system schematic':planet.name+' and its moons')+'" xmlns="http://www.w3.org/2000/svg">';
 for(let i=0;i<85;i++)svg+='<circle cx="'+((i*173+37)%1000)+'" cy="'+((i*97+19)%560)+'" r="'+(i%5?1:1.6)+'" fill="#99bbdc" opacity=".5"/>';
 if(chartView==='system'){
  svg+='<circle cx="500" cy="280" r="38" fill="#ffc96d"/><text x="500" y="337" text-anchor="middle" fill="#ffdc9a">Sun</text>';
  systemBodies.forEach((body,i)=>{const rx=75+i*52,ry=rx*.55,x=500+Math.cos(body.angle)*rx,y=280+Math.sin(body.angle)*ry;svg+='<ellipse cx="500" cy="280" rx="'+rx+'" ry="'+ry+'" fill="none" stroke="'+(body.id===chartPlanet?'#83dced':'#31475f')+'" stroke-width="'+(body.id===chartPlanet?2:1)+'"/>';if(body.id==='saturn')svg+='<ellipse cx="'+x+'" cy="'+y+'" rx="35" ry="10" fill="none" stroke="#cbbb93" stroke-width="5"/>';svg+=chartCircle(x,y,body.r,body.color,body.name,'data-planet="'+body.id+'"');if(body.id==='earth')svg+='<path d="M'+(x+24)+' '+(y-27)+'l7 14h-14z" fill="#ffefb8"/><text x="'+(x+35)+'" y="'+(y-24)+'" fill="#ffefb8" font-size="12">YOUR ROCKET</text>'});
 }else{
  svg+=chartCircle(500,280,planet.r*2.5,planet.color,planet.name,'data-planet="'+planet.id+'"');
  if(planet.id==='saturn')svg+='<ellipse cx="500" cy="280" rx="98" ry="27" fill="none" stroke="#cbbb93" stroke-width="9"/>';
  planet.moons.forEach((moon,i)=>{const radius=135+i*82,angle=-1.8+i*1.85,x=500+Math.cos(angle)*radius,y=280+Math.sin(angle)*radius*.65;svg+='<ellipse cx="500" cy="280" rx="'+radius+'" ry="'+radius*.65+'" fill="none" stroke="'+(chartMoon===moon?'#ffca82':'#31475f')+'"/>';svg+=chartCircle(x,y,moon==='Titan'||moon==='Ganymede'?15:10,'#d0ced0',moon,'data-moon="'+moon+'"')});
  if(!planet.moons.length)svg+='<text x="500" y="430" text-anchor="middle" fill="#a9bdd5">No moons in this planet’s chart.</text>';
  if(planet.id==='earth')svg+='<path d="M530 205l9 20h-18z" fill="#ffedb4"/><text x="550" y="215" fill="#ffedb4" font-size="14">YOUR ROCKET</text>';
 }
 $('mapChart').innerHTML=svg+'</svg>';
 $('planetChoices').replaceChildren(...systemBodies.map(body=>{const button=document.createElement('button');button.type='button';button.textContent=body.name;button.className=body.id===chartPlanet?'':'secondary';button.setAttribute('aria-pressed',String(body.id===chartPlanet));button.onclick=()=>selectChartPlanet(body.id);return button}));
 $('moonChoices').replaceChildren(...planet.moons.map(moon=>{const button=document.createElement('button');button.type='button';button.textContent=moon;button.className=chartMoon===moon?'':'secondary';button.onclick=()=>{chartMoon=moon;chartView='planet';renderPlanetMap()};return button}));
 $('bodyTitle').textContent=chartMoon||planet.name;$('bodyDescription').textContent=chartMoon?chartMoon+' · Moon of '+planet.name+'.':planet.name+(planet.id==='earth'?' · Your launch world.':' · Planet in the solar-system chart.')+' '+(planet.moons.length?'Select a moon below, or focus this planet to see its moon orbits.':'');
 $('mapRocketStatus').textContent=flight?'Your rocket · Earth · '+Math.floor(flight.altitude).toLocaleString()+' m altitude':'Your rocket · Earth · Assembly grid';
 $('systemView').className=chartView==='system'?'':'secondary';$('focusView').className=chartView==='planet'?'':'secondary';
}
function openPlanetMap(){if(chartOpen)return;partDrag=null;$('dragLabel').hidden=true;chartPausedFlight=!!flight&&!flight.done&&!paused;if(chartPausedFlight)pause();chartOpen=true;renderPlanetMap();mapDialog.showModal();$('closeMap').focus()}
function closePlanetMap(){if(!chartOpen)return;chartOpen=false;mapDialog.close();if(chartPausedFlight&&flight&&!flight.done&&paused)pause();chartPausedFlight=false;if(flight)canvas.focus();else mapButton.focus()}
mapButton.onclick=openPlanetMap;$('closeMap').onclick=closePlanetMap;mapDialog.addEventListener('cancel',e=>{e.preventDefault();closePlanetMap()});
$('systemView').onclick=()=>{chartView='system';chartMoon=null;renderPlanetMap()};$('focusView').onclick=()=>{chartView='planet';renderPlanetMap()};
function activateChart(e){const node=e.target.closest('[data-planet],[data-moon]');if(!node)return;if(node.dataset.planet){chartPlanet=node.dataset.planet;chartMoon=null;chartView='planet'}else chartMoon=node.dataset.moon;renderPlanetMap()}
$('mapChart').addEventListener('click',activateChart);$('mapChart').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activateChart(e)}});
document.addEventListener('keydown',e=>{
 if(chartOpen){
  if(e.key.toLowerCase()==='m'){e.preventDefault();e.stopImmediatePropagation();closePlanetMap();return}
  if((e.key===' '||e.key==='Enter')&&e.target.closest('[data-planet],[data-moon]')){e.preventDefault();e.stopImmediatePropagation();activateChart(e);return}
  if(!['Tab','Escape','Enter'].includes(e.key))e.stopImmediatePropagation();return;
 }
 if(e.key.toLowerCase()==='m'&&!e.repeat&&!e.target.closest('input,select,textarea')){e.preventDefault();e.stopImmediatePropagation();openPlanetMap()}
},true);
const beforeMapWorkshop=workshop;workshop=function(){if(chartOpen){chartPausedFlight=false;closePlanetMap()}beforeMapWorkshop()};$('revert').onclick=workshop;$('rebuild').onclick=workshop;

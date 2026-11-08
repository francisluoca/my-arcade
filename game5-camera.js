const flightPointers=new Map();
function cameraActive(){return !!flight&&!flight.done&&!(typeof chartOpen!=='undefined'&&chartOpen)}
function cameraLabel(){ $('cameraHelp').textContent='Drag to look around · Scroll or pinch to zoom · '+Math.round(flightCamera.zoom*100)+'%'; }
function resetFlightCamera(){flightPointers.clear();flightCamera={zoom:1,x:0,y:0};canvas.style.cursor='grab';cameraLabel()}
function zoomFlightCamera(factor,x=W/2,y=H/2){if(!cameraActive())return;const old=flightCamera.zoom,next=Math.max(.35,Math.min(4,old*factor));flightCamera.x=x-W/2-(x-W/2-flightCamera.x)*next/old;flightCamera.y=y-H/2-(y-H/2-flightCamera.y)*next/old;flightCamera.zoom=next;cameraLabel()}
function cameraPoint(e){const rect=canvas.getBoundingClientRect();return{x:(e.clientX-rect.left)*W/rect.width,y:(e.clientY-rect.top)*H/rect.height}}
function pointerGeometry(){const points=[...flightPointers.values()];if(points.length<2)return null;return{x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2,distance:Math.max(1,Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y))}}
canvas.addEventListener('wheel',e=>{if(!cameraActive())return;e.preventDefault();const point=cameraPoint(e);zoomFlightCamera(Math.exp(-Math.max(-100,Math.min(100,e.deltaY))*.004),point.x,point.y)},{passive:false});
canvas.addEventListener('pointerdown',e=>{if(!cameraActive())return;e.preventDefault();flightPointers.set(e.pointerId,cameraPoint(e));canvas.setPointerCapture?.(e.pointerId);canvas.style.cursor='grabbing'});
canvas.addEventListener('pointermove',e=>{if(!cameraActive()||!flightPointers.has(e.pointerId))return;e.preventDefault();const old=flightPointers.get(e.pointerId),before=pointerGeometry(),point=cameraPoint(e);flightPointers.set(e.pointerId,point);const after=pointerGeometry();if(before&&after){flightCamera.x+=after.x-before.x;flightCamera.y+=after.y-before.y;zoomFlightCamera(after.distance/before.distance,after.x,after.y)}else{flightCamera.x+=point.x-old.x;flightCamera.y+=point.y-old.y}cameraLabel()});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{flightPointers.delete(e.pointerId);if(!flightPointers.size)canvas.style.cursor=flight?'grab':'default'});
window.addEventListener('blur',()=>{flightPointers.clear();canvas.style.cursor=flight?'grab':'default'});
$('zoomIn').onclick=()=>zoomFlightCamera(1.25);$('zoomOut').onclick=()=>zoomFlightCamera(.8);$('followRocket').onclick=resetFlightCamera;
const launchBeforeCamera=launch;launch=function(){resetFlightCamera();launchBeforeCamera()};$('launch').onclick=launch;
const workshopBeforeCamera=workshop;workshop=function(){resetFlightCamera();workshopBeforeCamera();canvas.style.cursor='default'};$('revert').onclick=workshop;$('rebuild').onclick=workshop;
cameraLabel();

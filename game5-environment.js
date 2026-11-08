// Discarded stages remain in the flight scene instead of vanishing on separation.
let spentStages=[];
const separateWithDebris=separate;
separate=function(){
 if(!flight||flight.done||paused||flight.stage>=build.stages-1)return;
 const stage=flight.stage,parts=flight.parts.filter(p=>p.stage===stage).map(p=>({...p}));
 if(parts.length)spentStages.push({parts,altitude:flight.altitude,velocity:flight.velocity,drift:0,age:0,landed:false});
 separateWithDebris();
};$('separate').onclick=separate;
const updateWithSpentStages=update;
update=function(dt){const active=flight&&!flight.done&&!paused;updateWithSpentStages(dt);if(!active)return;
 for(const stage of spentStages){stage.age+=dt;if(stage.landed)continue;stage.velocity-=9.81*dt;stage.altitude+=stage.velocity*dt;stage.drift+=12*dt;if(stage.altitude<=0&&stage.age>.3){stage.altitude=0;stage.velocity=0;stage.landed=true}}
};
function drawSpentStages(){if(!flight)return;
 for(const stage of spentStages){const minY=Math.min(...stage.parts.map(p=>p.y-partCatalog[p.type].h/2)),maxY=Math.max(...stage.parts.map(p=>p.y+partCatalog[p.type].h/2)),cx=stage.parts.reduce((sum,p)=>sum+p.x,0)/stage.parts.length;
  const scale=.8,screenY=flightWorldY(stage.altitude);
  ctx.save();ctx.translate(W/2+60+stage.drift,screenY);ctx.rotate(stage.landed?.8:Math.min(.5,stage.age*.04));ctx.scale(scale,scale);ctx.translate(-cx,-(minY+maxY)/2);for(const part of stage.parts)renderPart(part);ctx.restore();
 }
}
const launchWithScenery=launch;launch=function(){if(!flight)spentStages=[];launchWithScenery()};$('launch').onclick=launch;
const workshopWithScenery=workshop;workshop=function(){spentStages=[];workshopWithScenery()};$('revert').onclick=workshop;$('rebuild').onclick=workshop;

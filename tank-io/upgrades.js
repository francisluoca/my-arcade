// 100 additional shared upgrades: a fuel-limited weapon and 99 distinct equipment modules.
const CIRCUIT_EXTRA_UPGRADES=[{id:'flamethrower',name:'Flamethrower',rarity:'Epic',max:1,effect:'flamethrower',amount:1,desc:'Hold Space to spray short-range fire. Ten seconds of fuel per run; release Space to conserve it.'}];
const circuitModuleFamilies=[
 ['damage','Common','shell damage',1,['Hardened tips','Tungsten inserts','Heavy casings','Dense cores','Rifled shells','Sabot rounds','Pressure jackets','Impact caps','Siege ammunition']],
 ['speed','Common','movement speed',3,['Light tracks','Ceramic bearings','Sport gearbox','Drive sprockets','Carbon wheels','Traction belts','Turbo drivetrain','Racing suspension','Vector transmission']],
 ['hull','Common','maximum health',8,['Steel rivets','Side plates','Front glacis','Layered hull','Spall lining','Ceramic tiles','Composite plates','Bulkhead braces','Fortress frame']],
 ['regen','Rare','health restored per second',.15,['Field bandages','Repair gel','Maintenance kit','Welding drone','Service pump','Nanite patch','Repair workshop','Recovery matrix','Restoration core']],
 ['reload','Rare','automatic gun reload speed',.025,['Feed spring','Ammo belt','Loader motor','Cooling sleeve','Cycle regulator','Rotary feeder','Magnetic loader','Synchronized feed','Rapid action']],
 ['velocity','Rare','bullet speed',12,['Barrel polish','Gas seal','Pressure valve','Long rifling','Accelerator coil','Precision bore','Rail sleeve','Velocity chamber','Hypervelocity tube']],
 ['fire','Epic','flamethrower damage per second',2,['Hot ignition','Napalm mixture','Thermal injector','Plasma pilot','Inferno pump','Volatile blend','Furnace chamber','Solar igniter','Dragon fuel']],
 ['cone','Rare','flame reach and width',.012,['Wide nozzle','Spray diffuser','Pressure cone','Fan jet','Reach valve','Twin spray','Flow shaper','Long jet','Flame projector']],
 ['lifesteal','Legendary','damage recovered as health',.002,['Salvage siphon','Repair siphon','Recovery conduit','Life pump','Vampire valve','Blood circuit','Vital converter','Immortal capacitor','Phoenix siphon']],
 ['defense','Rare','incoming damage resistance',.006,['Impact padding','Reactive lining','Shock isolator','Blast weave','Armor mesh','Kinetic dampener','Deflection coating','Reactive shell','Aegis lattice']],
 ['contact','Epic','contact damage per second',.5,['Bumper teeth','Track spikes','Ramming plate','Serrated hull','Shock bumper','Crusher blade','Demolition prow','Thunder ram','Titan plow']]
];
for(const [effect,rarity,label,step,names] of circuitModuleFamilies)names.forEach((name,i)=>{
 const amount=Number((step*(i+1)).toFixed(4)),percent=['reload','lifesteal','defense'].includes(effect);
 const benefit=effect==='cone'?'Extends flame range and widens its spray.':`+${percent?Number((amount*100).toFixed(2))+'%':amount} ${label}.`;
 CIRCUIT_EXTRA_UPGRADES.push({id:'module_'+effect+'_'+i,name,rarity,max:1,effect,amount,requires:['fire','cone'].includes(effect)?'flamethrower':undefined,desc:benefit+(effect==='reload'?' Main cannon still reloads in 2 seconds.':'')});
});

(function (EA) {
  'use strict';
  var mapTypes=['planicie','fortaleza','canion','ilhas','arena','caos'];
  var densityCounts={baixa:4,media:8,alta:13,extrema:19};
  var obstacleTypes=['bloco','parede','torre','pilar','plataforma','rampa'];
  function overlaps(a,b,pad){pad=pad||0;return a.x-pad<b.x+b.w&&a.x+a.w+pad>b.x&&a.y-pad<b.y+b.h&&a.y+a.h+pad>b.y;}
  function dimensions(type,rng,height){var w,h;if(type==='parede'){w=rng.int(18,34);h=rng.int(90,190);}else if(type==='torre'){w=rng.int(45,75);h=rng.int(110,210);}else if(type==='pilar'){w=rng.int(20,42);h=rng.int(55,135);}else if(type==='plataforma'){w=rng.int(80,180);h=rng.int(14,24);}else if(type==='rampa'){w=rng.int(70,130);h=rng.int(25,55);}else{w=rng.int(40,100);h=rng.int(35,100);}return{w:w,h:Math.min(h,height*.38)};}
  function MapGenerator(config,rng){this.config=config;this.rng=rng;}
  MapGenerator.prototype.generate=function(){var cfg=this.config,rng=this.rng,type=cfg.mapType==='aleatorio'?rng.pick(mapTypes):cfg.mapType,width=cfg.width,height=Math.round(width*(type==='arena'?.52:.58)),ground=height-42,count=densityCounts[cfg.density]||8,obstacles=[],attempts=0,target,i,kind,size,x,y,item;if(type==='planicie')count=Math.max(2,Math.floor(count*.5));if(type==='fortaleza')count+=4;if(type==='arena')count=Math.max(2,Math.floor(count*.55));if(type==='caos')count+=3;target=cfg.obstacles===0?0:Math.min(24,count);
    while(obstacles.length<target&&attempts<target*30){attempts+=1;kind=rng.pick(obstacleTypes);if(type==='fortaleza'&&rng.next()<.55)kind=rng.pick(['parede','torre','bloco']);if(type==='ilhas'&&rng.next()<.55)kind='plataforma';if(type==='canion'&&rng.next()<.5)kind=rng.pick(['pilar','rampa','plataforma']);size=dimensions(kind,rng,height);x=rng.int(Math.round(width*.23),Math.round(width*.77)-size.w);y=kind==='plataforma'?rng.int(Math.round(height*.42),ground-55):ground-size.h;if(type==='canion'&&kind!=='plataforma')y-=rng.int(0,35);if(type==='ilhas'&&kind!=='plataforma')y-=rng.int(0,60);item={id:'o'+obstacles.length,type:kind,x:x,y:y,w:size.w,h:size.h};if(item.x>=12&&item.y>=25&&item.x+item.w<=width-12&&item.y+item.h<=ground+1&&!obstacles.some(function(o){return overlaps(item,o,12);}))obstacles.push(item);}
    return{type:type,width:width,height:height,ground:ground,obstacles:obstacles,playableWidth:width*.42,generationAttempts:attempts};};
  EA.MapGenerator=MapGenerator;EA.MAP_TYPES=mapTypes;EA.DENSITY_COUNTS=densityCounts;
}(window.EA));

(function (EA) {
  'use strict';
  function SpawnManager(arena,config,rng){this.arena=arena;this.config=config;this.rng=rng;}
  SpawnManager.prototype.zone=function(team){var w=this.arena.width,mode=this.config.spawnMode;if(mode==='espalhado')return team==='A'?[w*.04,w*.38]:[w*.62,w*.96];if(mode==='squads')return team==='A'?[w*.04,w*.3]:[w*.7,w*.96];if(mode==='cerco')return team==='A'?[w*.34,w*.48]:[w*.55,w*.94];if(mode==='caos')return team==='A'?[w*.04,w*.47]:[w*.53,w*.96];return team==='A'?[w*.05,w*.25]:[w*.75,w*.95];};
  SpawnManager.prototype.valid=function(point,radius,placed){var a=this.arena;if(point.x-radius<8||point.x+radius>a.width-8||point.y-radius<22||point.y+radius>a.ground-3||a.blocked(point.x,point.y,radius+2))return false;return!placed.some(function(other){return EA.distance(point,other)<radius+other.radius+4;});};
  SpawnManager.prototype.positions=function(team,count,radius,placed){var zone=this.zone(team),result=[],attempts=0,max=count*600,x,y,p,row,col,cols=Math.min(8,Math.ceil(Math.sqrt(count*1.4)));while(result.length<count&&attempts<max){attempts+=1;x=this.rng.range(zone[0],zone[1]);y=this.rng.range(Math.max(radius+25,this.arena.ground-this.arena.height*.62),this.arena.ground-radius-7);if(this.config.spawnMode==='squads'){x=zone[0]+((Math.floor(result.length/4)%3)+.5)*(zone[1]-zone[0])/3+this.rng.range(-18,18);}p={x:Math.round(x),y:Math.round(y),radius:radius};if(this.valid(p,radius,placed.concat(result)))result.push(p);}
    while(result.length<count){row=Math.floor(result.length/cols);col=result.length%cols;x=zone[0]+(col+.5)*(zone[1]-zone[0])/cols;y=this.arena.ground-radius-8-row*(radius*2+6);p={x:Math.round(x),y:Math.round(y),radius:radius};if(!this.valid(p,radius,placed.concat(result)))p.y=Math.max(radius+25,p.y-radius*3);result.push(p);}
    return result;};
  EA.SpawnManager=SpawnManager;
}(window.EA));

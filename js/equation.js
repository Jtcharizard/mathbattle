(function (EA) {
  'use strict';
  var families=['linear','quadratica','cubica','senoide','cossenoide','balistica','hibrida'];
  var labels={linear:'Linear',quadratica:'Quadrática',cubica:'Cúbica limitada',senoide:'Senoide',cossenoide:'Cossenoide',balistica:'Arco balístico',hibrida:'Híbrida'};
  function Equation(o){o=o||{};this.id=o.id||('eq-'+String(o.family));this.family=o.family;this.coefficients=(o.coefficients||[]).slice(0,4);this.domain=EA.clamp(o.domain||600,30,1200);this.start={x:Number(o.start&&o.start.x)||0,y:Number(o.start&&o.start.y)||0};this.direction=o.direction===-1?-1:1;if(!this.valid())throw new Error('Parâmetros de equação inválidos.');}
  Equation.prototype.valid=function(){return families.indexOf(this.family)>=0&&this.coefficients.length>=2&&this.coefficients.every(function(v){return EA.finite(v)&&Math.abs(v)<=500;})&&EA.finite(this.domain);};
  Equation.prototype.position=function(t){t=EA.clamp(t,0,this.domain);var c=this.coefficients,u=t/100,x=this.start.x+this.direction*t,y=this.start.y;
    if(this.family==='linear')y+=c[0]*u*100;
    else if(this.family==='quadratica')y+=(c[0]*u*u+c[1]*u)*100;
    else if(this.family==='cubica')y+=EA.clamp((c[0]*u*u*u+c[1]*u*u+c[2]*u)*70,-900,900);
    else if(this.family==='senoide')y+=c[0]*Math.sin(c[1]*u+(c[2]||0));
    else if(this.family==='cossenoide')y+=c[0]*(Math.cos(c[1]*u+(c[2]||0))-Math.cos(c[2]||0));
    else if(this.family==='balistica')y+=-(c[0]*u)+0.5*(c[1]||18)*u*u;
    else y+=c[0]*Math.sin((c[1]||1)*u)+c[2]*u*u;
    return {x:x,y:y};};
  Equation.prototype.text=function(){var c=this.coefficients.map(function(v){return Number(v).toFixed(2);});var s={linear:'y = '+c[0]+'x',quadratica:'y = '+c[0]+'x² + '+c[1]+'x',cubica:'y = '+c[0]+'x³ + '+c[1]+'x² + '+c[2]+'x',senoide:'y = '+c[0]+' · sen('+c[1]+'x + '+(c[2]||0)+')',cossenoide:'y = '+c[0]+' · cos('+c[1]+'x + '+(c[2]||0)+')',balistica:'arco(vy='+c[0]+', g='+c[1]+')',hibrida:'y = '+c[0]+' · sen('+c[1]+'x) + '+c[2]+'x²'};return s[this.family];};
  EA.Equation=Equation;EA.EQUATION_FAMILIES=families;EA.familyLabel=function(f){return labels[f]||f;};
  EA.makeEquation=function(f,start,direction,c,domain){return new Equation({family:f,start:start,direction:direction,coefficients:c,domain:domain});};
}(window.EA));

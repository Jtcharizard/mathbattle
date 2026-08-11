(function (EA) {
  'use strict';
  var families=['linear','quadratica','cubica','senoide','cossenoide','balistica','hibrida'];
  var labels={linear:'Linear',quadratica:'Quadrática',cubica:'Cúbica limitada',senoide:'Senoide',cossenoide:'Cossenoide',balistica:'Arco balístico',hibrida:'Híbrida'};
  var superDigits={'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
  function superscript(value){return String(value).split('').map(function(d){return superDigits[d];}).join('');}
  function formatNumber(value){var n=Number(value),abs=Math.abs(n),text,parts;if(Object.is(n,-0)||n===0)return'0';if(abs<0.0001||abs>=10000){parts=n.toExponential(3).split('e');text=Number(parts[0]).toString()+'×10'+superscript(Number(parts[1]));}else{text=n.toFixed(abs<0.01?6:abs<1?4:abs<100?3:2);text=text.replace(/\.?0+$/,'');}return text.replace('-', '−');}
  function polynomial(terms){var output='y = ',written=0;terms.forEach(function(term){var value=Number(term.value);if(!Number.isFinite(value)||value===0)return;var abs=Math.abs(value),number=formatNumber(abs),body=(abs===1&&term.symbol?'':number)+term.symbol;if(!written)output+=(value<0?'−':'')+body;else output+=(value<0?' − ':' + ')+body;written+=1;});return written?output:'y = 0';}
  function signedInside(value){var n=Number(value);if(!n)return'';return(n<0?' − ':' + ')+formatNumber(Math.abs(n));}
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
  Equation.prototype.text=function(){var c=this.coefficients,a,b,oscillation;
    if(this.family==='linear')return polynomial([{value:c[0],symbol:'x'}]);
    if(this.family==='quadratica')return polynomial([{value:c[0],symbol:'x²'},{value:c[1],symbol:'x'}]);
    if(this.family==='cubica')return polynomial([{value:c[0],symbol:'x³'},{value:c[1],symbol:'x²'},{value:c[2],symbol:'x'}]);
    if(this.family==='senoide'||this.family==='cossenoide'){if(c[0]===0)return'y = 0';a=formatNumber(c[0]);b=formatNumber(c[1]);return'y = '+a+' · '+(this.family==='senoide'?'sen':'cos')+'('+b+'x'+signedInside(c[2])+')';}
    if(this.family==='balistica')return'arco(vy = '+formatNumber(c[0])+', g = '+formatNumber(c[1]||18)+')';
    if(c[0]===0)return polynomial([{value:c[2],symbol:'x²'}]);
    oscillation=formatNumber(c[0])+' · sen('+formatNumber(c[1]||1)+'x)';
    if(!c[2])return'y = '+oscillation;
    return'y = '+oscillation+(c[2]<0?' − ':' + ')+formatNumber(Math.abs(c[2]))+'x²';
  };
  EA.Equation=Equation;EA.EQUATION_FAMILIES=families;EA.familyLabel=function(f){return labels[f]||f;};EA.formatNumber=formatNumber;
  Equation.prototype.text=function(){var c=this.coefficients.map(function(v){return Number(v).toFixed(2);});var s={linear:'y = '+c[0]+'x',quadratica:'y = '+c[0]+'x² + '+c[1]+'x',cubica:'y = '+c[0]+'x³ + '+c[1]+'x² + '+c[2]+'x',senoide:'y = '+c[0]+' · sen('+c[1]+'x + '+(c[2]||0)+')',cossenoide:'y = '+c[0]+' · cos('+c[1]+'x + '+(c[2]||0)+')',balistica:'arco(vy='+c[0]+', g='+c[1]+')',hibrida:'y = '+c[0]+' · sen('+c[1]+'x) + '+c[2]+'x²'};return s[this.family];};
  EA.Equation=Equation;EA.EQUATION_FAMILIES=families;EA.familyLabel=function(f){return labels[f]||f;};
  EA.makeEquation=function(f,start,direction,c,domain){return new Equation({family:f,start:start,direction:direction,coefficients:c,domain:domain});};
}(window.EA));

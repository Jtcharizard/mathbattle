(function (EA) {
  'use strict';
  EA.clamp = function (v, a, b) { return Math.max(a, Math.min(b, Number(v))); };
  EA.finite = function (v) { return typeof v === 'number' && Number.isFinite(v); };
  EA.distance = function (a, b) { return Math.hypot(a.x - b.x, a.y - b.y); };
  EA.segmentCircle = function (a, b, c, r) { var dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?EA.clamp(((c.x-a.x)*dx+(c.y-a.y)*dy)/l,0,1):0; return Math.hypot(a.x+t*dx-c.x,a.y+t*dy-c.y)<=r; };
  EA.segmentRect = function (a,b,r) { var steps=Math.max(1,Math.ceil(EA.distance(a,b)/3)),i,x,y; for(i=0;i<=steps;i+=1){x=a.x+(b.x-a.x)*i/steps;y=a.y+(b.y-a.y)*i/steps;if(x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h)return true;} return false; };
}(window.EA));

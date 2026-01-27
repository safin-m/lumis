var u={GLASS_EFFECT:"[data-glass-effect]",FE_IMAGE:".fe-image",RED_CHANNEL:".red-channel",GREEN_CHANNEL:".green-channel",BLUE_CHANNEL:".blue-channel",OUTPUT_BLUR:".output-blur",EDGE_INTENSITY:".edge-intensity",EDGE_MASK:".edge-mask",INVERTED_MASK:".inverted-mask"},G={RED:"1 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 1 0",GREEN:"0 0 0 0 0, 0 1 0 0 0, 0 0 0 0 0, 0 0 0 1 0",BLUE:"0 0 0 0 0, 0 0 0 0 0, 0 0 1 0 0, 0 0 0 1 0"},M={INT:["scale","radius","blur","lightness","r","g","b"],FLOAT:["frost","saturation","displace","border","alpha"],STRING:["blend","x","y"],WARP_INT:["angle"],WARP_FLOAT:["intensity"],WARP_STRING:["color"],SHINE_INT:["angle","spread"],SHINE_FLOAT:["intensity"],SHINE_STRING:["type","color"],HOVER_FLOAT:["borderWidth","scale","duration"],HOVER_STRING:["borderColor","easing"]};var I={scale:-180,radius:16,frost:0,saturation:1,backdropBlur:1,overLight:!1,mode:"standard",shaderEdgeFadeStart:.8,shaderEdgeFadeOffset:.15,shaderCornerRadius:.3,shaderWidthFactor:.2,shaderHeightFactor:.6,shaderEdgeDistanceDivisor:2,edgeMask:!0,edgeMaskPreserveDistortion:!0,edgeMaskArithmeticBlend:!1,interactions:{enabled:!0,elasticity:.15,activationZone:200},overlays:{enabled:!0,advancedBorder:!0,borderColor:"255, 255, 255, 1",borderThickness:1.5,hoverOverlay1LightColor:"255, 255, 255, 1",hoverOverlay2LightColor:"255, 255, 255, 1",hoverOverlay1Angle:0,hoverOverlay2Angle:0,hoverLightIntensity:1,hoverOverlay1Opacity:.5,hoverOverlay2Opacity:0,hoverOverlayBlendMode:"overlay",extraOverlay:{enabled:!1,background:"radial-gradient(circle at center, rgba(186, 85, 211, 0.4) 0%, rgba(255, 0, 255, 0.3) 100%)",opacity:1,blendMode:"color"}},border:.07,lightness:50,alpha:.93,blur:11,displace:0,blend:"difference",x:"R",y:"B",r:0,g:10,b:20,warp:{angle:195,intensity:1,color:"rgba(255, 221, 153, 1)"},shine:{angle:135,intensity:.4,color:"hsla(0, 100%, 74%, 0.29)",spread:40,type:"shadow"},hover:{borderWidth:1,borderColor:"hsl(0, 0%, 100%)",scale:1,borderGradient:{startBase:33,startOffsetMultiplier:.3,endBase:66,endOffsetMultiplier:.4,opacityBase:.12,opacityMultiplier:.008,peakOpacityBase:.4,peakOpacityMultiplier:.012,secondaryBoost:.2,angleBase:135,angleMultiplier:1.2},duration:.3,easing:"ease-in-out"}},T=()=>`glass-filter-${Math.random().toString(36).substr(2,9)}`,k=R=>R.charAt(0).toUpperCase()+R.slice(1),P=R=>{let e={},{dataset:t}=R;M.INT.forEach(s=>{let r=`glass${k(s)}`;t[r]!==void 0&&(e[s]=parseInt(t[r],10))}),M.FLOAT.forEach(s=>{let r=`glass${k(s)}`;t[r]!==void 0&&(e[s]=parseFloat(t[r]))}),M.STRING.forEach(s=>{let r=`glass${k(s)}`;t[r]!==void 0&&(e[s]=t[r])});let i={};M.WARP_INT.forEach(s=>{let r=`glassWarp${k(s)}`;t[r]!==void 0&&(i[s]=parseInt(t[r],10))}),M.WARP_FLOAT.forEach(s=>{let r=`glassWarp${k(s)}`;t[r]!==void 0&&(i[s]=parseFloat(t[r]))}),M.WARP_STRING.forEach(s=>{let r=`glassWarp${k(s)}`;t[r]!==void 0&&(i[s]=t[r])}),Object.keys(i).length>0&&(e.warp=i);let n={};M.SHINE_INT.forEach(s=>{let r=`glassShine${k(s)}`;t[r]!==void 0&&(n[s]=parseInt(t[r],10))}),M.SHINE_FLOAT.forEach(s=>{let r=`glassShine${k(s)}`;t[r]!==void 0&&(n[s]=parseFloat(t[r]))}),M.SHINE_STRING.forEach(s=>{let r=`glassShine${k(s)}`;t[r]!==void 0&&(n[s]=t[r])}),Object.keys(n).length>0&&(e.shine=n);let a={};return M.HOVER_FLOAT.forEach(s=>{let r=`glassHover${k(s)}`;t[r]!==void 0&&(a[s]=parseFloat(t[r]))}),M.HOVER_STRING.forEach(s=>{let r=`glassHover${k(s)}`;t[r]!==void 0&&(a[s]=t[r])}),Object.keys(a).length>0&&(e.hover=a),e};var N=class{constructor(e,t){this.filterId=e,this.config=t}createGradient(e,t){let i=t==="horizontal";return`
      <linearGradient 
        id="${e}" 
        x1="${i?"100%":"0%"}" 
        y1="0%" 
        x2="0%" 
        y2="${i?"0%":"100%"}">
        <stop offset="0%" stop-color="#000"/>
        <stop offset="100%" stop-color="${i?"red":"blue"}"/>
      </linearGradient>
    `}createRect(e,t,i,n,a,s=""){let{radius:r}=this.config;return`<rect 
      x="${e}" 
      y="${t}" 
      width="${i}" 
      height="${n}" 
      rx="${r}" 
      fill="${a}" 
      ${s}/>`}createWarpGradient(){let{angle:e,intensity:t,color:i}=this.config.warp;if(t===0)return"";let n=e*Math.PI/180,a=50+50*Math.cos(n+Math.PI),s=50+50*Math.sin(n+Math.PI),r=50+50*Math.cos(n),l=50+50*Math.sin(n);return`
      <linearGradient id="warp-${this.filterId}" x1="${a}%" y1="${s}%" x2="${r}%" y2="${l}%">
        <stop offset="0%" stop-color="${i}" stop-opacity="0"/>
        <stop offset="50%" stop-color="${i}" stop-opacity="${t}"/>
        <stop offset="100%" stop-color="white" stop-opacity="0"/>
      </linearGradient>
    `}buildShaderMap(e,t){let i=document.createElement("canvas");i.width=e,i.height=t;let n=i.getContext("2d"),a=n.createImageData(e,t),s=a.data,r=this.config.shaderEdgeFadeStart??.8,l=this.config.shaderEdgeFadeOffset??.15,p=this.config.shaderCornerRadius??.3,c=this.config.shaderWidthFactor??.2,O=this.config.shaderHeightFactor??.6,f=this.config.shaderEdgeDistanceDivisor??2,$=(d,o,y)=>(y=Math.max(0,Math.min(1,(y-d)/(o-d))),y*y*(3-2*y)),L=(d,o)=>Math.hypot(d,o),C=(d,o,y,E,h)=>{let v=Math.abs(d)-y+h,b=Math.abs(o)-E+h;return Math.min(Math.max(v,b),0)+L(Math.max(v,0),Math.max(b,0))-h},m=1,x=new Float32Array(e*t*2),g=0;for(let d=0;d<t;d++)for(let o=0;o<e;o++){let y=o/e,E=d/t,h=y-.5,v=E-.5,b=C(h,v,p,c,O),D=$(r,0,b-l),S=$(0,1,D),w=h*S+.5,B=v*S+.5,F=w*e-o,H=B*t-d;m=Math.max(m,Math.abs(F),Math.abs(H)),x[g++]=F,x[g++]=H}m=Math.max(1,m),g=0;for(let d=0;d<t;d++)for(let o=0;o<e;o++){let y=x[g++],E=x[g++],h=Math.min(o,d,e-o-1,t-d-1),v=Math.min(1,h/f),b=y*v/m+.5,D=E*v/m+.5,S=(d*e+o)*4;s[S]=Math.max(0,Math.min(255,b*255)),s[S+1]=Math.max(0,Math.min(255,D*255)),s[S+2]=Math.max(0,Math.min(255,D*255)),s[S+3]=255}return n.putImageData(a,0,0),i.toDataURL()}build(){let{width:e,height:t,border:i,lightness:n,alpha:a,blur:s,blend:r,mode:l}=this.config,{intensity:p}=this.config.warp,c=Math.min(e,t)*(i*.5),O=e-c*2,f=t-c*2;if(l==="shader"){let $=this.buildShaderMap(e,t);return`
<svg viewBox="0 0 ${e} ${t}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${this.createGradient(`red-${this.filterId}`,"horizontal")}
    ${this.createGradient(`blue-${this.filterId}`,"vertical")}
    ${this.createWarpGradient()}
  </defs>
  
  <image href="${$}" x="0" y="0" width="${e}" height="${t}" preserveAspectRatio="none"/>
  
  ${this.createRect(0,0,e,t,`url(#red-${this.filterId})`,'style="mix-blend-mode: screen"')}
  ${this.createRect(0,0,e,t,`url(#blue-${this.filterId})`,`style="mix-blend-mode: ${r}"`)}
  
  ${this.createRect(c,c,O,f,`hsl(0 0% ${n}% / ${a})`,`style="filter:blur(${s}px)"`)}
  
  ${p>0?this.createRect(0,0,e,t,`url(#warp-${this.filterId})`,'style="mix-blend-mode: lighten"'):""}
</svg>
      `}return`
      <svg viewBox="0 0 ${e} ${t}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${this.createGradient(`red-${this.filterId}`,"horizontal")}
          ${this.createGradient(`blue-${this.filterId}`,"vertical")}
          ${this.createWarpGradient()}
        </defs>
        
        
        <rect x="0" y="0" width="${e}" height="${t}" fill="black"/>
        
        
        ${this.createRect(0,0,e,t,`url(#red-${this.filterId})`)}
        
        
        ${this.createRect(0,0,e,t,`url(#blue-${this.filterId})`,`style="mix-blend-mode: ${r}"`)}
        
        
        ${this.createRect(c,c,O,f,`hsl(0 0% ${n}% / ${a})`,`style="filter:blur(${s}px)"`)}
        
        
        ${p>0?this.createRect(0,0,e,t,`url(#warp-${this.filterId})`,'style="mix-blend-mode: lighten"'):""}
      </svg>
    `}};var A=class{constructor(e,t){this.filterId=e,this.config=t}createDisplacementChannel(e,t,i){let{x:n,y:a}=this.config,s=e.toLowerCase();return`
      <feDisplacementMap 
        in="SourceGraphic" 
        in2="map" 
        class="${i}"
        xChannelSelector="${n}" 
        yChannelSelector="${a}" 
        result="disp${e}"/>
      <feColorMatrix 
        in="disp${e}" 
        type="matrix"
        values="${t}" 
        result="${s}"/>
    `}build(){let e=u.FE_IMAGE.slice(1),t=u.RED_CHANNEL.slice(1),i=u.GREEN_CHANNEL.slice(1),n=u.BLUE_CHANNEL.slice(1),a=u.OUTPUT_BLUR.slice(1),{edgeMask:s,mode:r}=this.config,{scale:l,r:p,g:c,b:O,displace:f}=this.config,$=r==="shader"?-1:1,L=$*(l+p),C=$*(l+c),m=$*(l+O),x=this.config.width||400,g=this.config.height||400;return`
      <defs>
        <filter id="${this.filterId}" color-interpolation-filters="sRGB">
          
          <feImage 
            x="0" 
            y="0" 
            width="${x}" 
            height="${g}" 
            preserveAspectRatio="none"
            result="map" 
            class="${e}">
          </feImage>
          ${s?`
          
          
          <feColorMatrix in="map" type="matrix" values="0.3 0.3 0.3 0 0 0.3 0.3 0.3 0 0 0.3 0.3 0.3 0 0 0 0 0 1 0" result="edgeIntensity" class="${u.EDGE_INTENSITY.slice(1)}"/>
          
          <feComponentTransfer in="edgeIntensity" result="edgeMask" class="${u.EDGE_MASK.slice(1)}">
            <feFuncA type="discrete" tableValues="0 ${2*.05} 1"/>
          </feComponentTransfer>
          `:""}
          
          
          
          ${this.createDisplacementChannel("Red",G.RED,t).replace('result="dispRed"/>',`scale="${L}" result="dispRed"/>`)}
          
          ${this.createDisplacementChannel("Green",G.GREEN,i).replace('result="dispGreen"/>',`scale="${C}" result="dispGreen"/>`)}
          
          ${this.createDisplacementChannel("Blue",G.BLUE,n).replace('result="dispBlue"/>',`scale="${m}" result="dispBlue"/>`)}
          
          
          <feBlend in="red" in2="green" mode="screen" result="rg"/>
          <feBlend in="rg" in2="blue" mode="screen" result="rgb"/>
          
          ${s?`
          
          
          <feGaussianBlur in="rgb" stdDeviation="${Math.max(.1,.5-2*.1)}" result="aberratedBlurred"/>
          
          
          <feComposite in="aberratedBlurred" in2="edgeMask" operator="${this.config.edgeMaskArithmeticBlend?'arithmetic" k1="0" k2="1" k3="0" k4="0':"in"}" result="edgeAberration"/>
          
          
          <feComponentTransfer in="edgeMask" result="invertedMask" class="${u.INVERTED_MASK.slice(1)}">
            <feFuncA type="table" tableValues="1 0"/>
          </feComponentTransfer>
          
          
          <feDisplacementMap in="SourceGraphic" in2="map" scale="0" xChannelSelector="${this.config.x}" yChannelSelector="${this.config.y}" result="centerUndistorted"/>
          <feDisplacementMap in="centerUndistorted" in2="map" scale="${this.config.scale}" xChannelSelector="${this.config.x}" yChannelSelector="${this.config.y}" result="centerRedistorted"/>
          
          
          <feComposite in="centerRedistorted" in2="invertedMask" operator="${this.config.edgeMaskArithmeticBlend?'arithmetic" k1="0" k2="1" k3="0" k4="0':"in"}" result="centerClean"/>
          
          
          <feComposite in="edgeAberration" in2="centerClean" operator="${this.config.edgeMaskArithmeticBlend?'arithmetic" k1="0" k2="1" k3="1" k4="0':"over"}" result="output"/>
          `:`
          
          <feGaussianBlur 
            in="rgb" 
            class="${a}" 
            stdDeviation="${f}" 
            result="output"/>
          `}
        </filter>
      </defs>
    `}};var _=class{constructor(e,t={}){this.element=e;let i=window.getComputedStyle(e).zIndex;!e.style.zIndex&&(i==="auto"||i==="0")&&(e.style.zIndex="1"),this.config={...I,...t,warp:{...I.warp,...t.warp},shine:{...I.shine,...t.shine},hover:{...I.hover,...t.hover},interactions:{...I.interactions,...t.interactions||{}},overlays:{...I.overlays,...t.overlays||{},extraOverlay:{...I.overlays?.extraOverlay||{},...t.overlays?.extraOverlay||{}}}},this.filterId=T(),this.cachedDisplacementMap=null,this.cachedDimensions={width:0,height:0},this.updateScheduled=!1,this.createFilter(),this.cacheFilterElements(),this.createShineOverlay(),this.setupHoverEffects(),this.updateStackedDistortionClone(),this.init(),this.setupResizeObserver()}updateStackedDistortionClone(){let{edgeMask:e,edgeMaskPreserveDistortion:t}=this.config;e&&t?this.stackedDistortionClone||this.createStackedDistortionClone():(this.stackedDistortionClone&&(this.stackedDistortionClone.remove(),this.stackedDistortionClone=null),this.stackedDistortionSVG&&(this.stackedDistortionSVG.remove(),this.stackedDistortionSVG=null),this.stackedDistortionObserver&&(this.stackedDistortionObserver.disconnect(),this.stackedDistortionObserver=null))}createStackedDistortionClone(){this.stackedDistortionClone&&(this.stackedDistortionClone.remove(),this.stackedDistortionClone=null),this.stackedDistortionSVG&&(this.stackedDistortionSVG.remove(),this.stackedDistortionSVG=null),this.stackedDistortionObserver&&(this.stackedDistortionObserver.disconnect(),this.stackedDistortionObserver=null);let e=document.createElement("div");e.className=this.element.className;let t=T();this.stackedFilterId=t;let i=document.createElementNS("http://www.w3.org/2000/svg","svg");Object.assign(i.style,{position:"absolute",width:"0",height:"0",pointerEvents:"none"});let n=new A(t,this.config);i.innerHTML=n.build(),document.body.appendChild(i),this.stackedDistortionSVG=i;let a=i.querySelector(`.${u.FE_IMAGE.slice(1)}`);if(a){let l=this.buildDisplacementMap();a.setAttributeNS("http://www.w3.org/1999/xlink","href",l)}e.style.position="absolute",e.style.top=`${this.element.offsetTop}px`,e.style.left=`${this.element.offsetLeft}px`,e.style.width=`${this.element.offsetWidth}px`,e.style.height=`${this.element.offsetHeight}px`,e.style.zIndex=`${(this.element.style.zIndex||1)-1}`,e.style.pointerEvents="none",e.style.backdropFilter=`url(#${t})`,e.style.borderRadius=window.getComputedStyle(this.element).borderRadius,this.element.parentNode.insertBefore(e,this.element.nextSibling),this.stackedDistortionClone=e;let s=!1,r=()=>{s||(s=!0,requestAnimationFrame(()=>{this.element.style.top?e.style.top=this.element.style.top:e.style.top=`${this.element.offsetTop}px`,this.element.style.left?e.style.left=this.element.style.left:e.style.left=`${this.element.offsetLeft}px`,e.style.width=this.element.style.width||`${this.element.offsetWidth}px`,e.style.height=this.element.style.height||`${this.element.offsetHeight}px`,e.style.transform=this.element.style.transform,e.style.borderRadius=window.getComputedStyle(this.element).borderRadius,s=!1}))};r(),this.stackedDistortionObserver=new MutationObserver(r),this.stackedDistortionObserver.observe(this.element,{attributes:!0,attributeFilter:["style"]})}updateStackedDistortionSVG(){if(!this.stackedDistortionSVG||!this.stackedFilterId)return;let e=new A(this.stackedFilterId,this.config);this.stackedDistortionSVG.innerHTML=e.build();let t=this.stackedDistortionSVG.querySelector(`.${u.FE_IMAGE.slice(1)}`);if(t){let i=this.buildDisplacementMap();t.setAttributeNS("http://www.w3.org/1999/xlink","href",i)}}createFilter(){let e=document.createElementNS("http://www.w3.org/2000/svg","svg");Object.assign(e.style,{position:"absolute",width:"0",height:"0",pointerEvents:"none"});let t=new A(this.filterId,this.config);e.innerHTML=t.build(),document.body.appendChild(e),this.svgElement=e}exportSVGFilterMarkup(){let e=this.filterId||T();return`
<svg width="0" height="0" style="position:absolute;">
  ${new A(e,this.config).build()}
</svg>


<div style="filter:url(#${e});">
  
</div>
`}createShineOverlay(){if(!document.getElementById("glass-effect-shine-styles")){let e=document.createElement("style");e.id="glass-effect-shine-styles",e.textContent=`
        .glass-effect-shine::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          mix-blend-mode: screen;
          background: var(--shine-background, none);
          box-shadow: var(--shine-shadow, none);
        }
      `,document.head.appendChild(e)}this.element.classList.add("glass-effect-shine")}cacheFilterElements(){this.feImage=this.svgElement.querySelector(u.FE_IMAGE),this.redChannel=this.svgElement.querySelector(u.RED_CHANNEL),this.greenChannel=this.svgElement.querySelector(u.GREEN_CHANNEL),this.blueChannel=this.svgElement.querySelector(u.BLUE_CHANNEL),this.outputBlur=this.svgElement.querySelector(u.OUTPUT_BLUR)}measureContainer(){let e=this.element.getBoundingClientRect();this.config.width=Math.round(e.width),this.config.height=Math.round(e.height)}buildDisplacementMap(){let{width:e,height:t,scale:i,r:n,g:a,b:s,blur:r,lightness:l,alpha:p,border:c,blend:O,displace:f,warp:$,edgeMask:L,edgeMaskPreserveDistortion:C,edgeMaskArithmeticBlend:m,mode:x,shaderEdgeFadeStart:g,shaderEdgeFadeOffset:d,shaderCornerRadius:o,shaderWidthFactor:y,shaderHeightFactor:E,shaderEdgeDistanceDivisor:h,x:v,y:b}=this.config,D=JSON.stringify({width:e,height:t,scale:i,r:n,g:a,b:s,blur:r,lightness:l,alpha:p,border:c,blend:O,displace:f,warp:$,edgeMask:L,edgeMaskPreserveDistortion:C,edgeMaskArithmeticBlend:m,mode:x,shaderEdgeFadeStart:g,shaderEdgeFadeOffset:d,shaderCornerRadius:o,shaderWidthFactor:y,shaderHeightFactor:E,shaderEdgeDistanceDivisor:h,x:v,y:b});if(this.cachedDisplacementMap&&this.cachedDisplacementMapKey===D)return this.cachedDisplacementMap;let w=new N(this.filterId,this.config).build(),B=w.trim().startsWith("data:")?w:`data:image/svg+xml,${encodeURIComponent(w)}`;return this.cachedDisplacementMap=B,this.cachedDisplacementMapKey=D,B}updateFilterAttributes(){let{width:e,height:t,scale:i,r:n,g:a,b:s,displace:r,x:l,y:p}=this.config;this.feImage.setAttribute("width",e),this.feImage.setAttribute("height",t),this.redChannel.setAttribute("scale",i+n),this.greenChannel.setAttribute("scale",i+a),this.blueChannel.setAttribute("scale",i+s),this.redChannel.setAttribute("xChannelSelector",l),this.redChannel.setAttribute("yChannelSelector",p),this.greenChannel.setAttribute("xChannelSelector",l),this.greenChannel.setAttribute("yChannelSelector",p),this.blueChannel.setAttribute("xChannelSelector",l),this.blueChannel.setAttribute("yChannelSelector",p),this.outputBlur&&this.outputBlur.setAttribute("stdDeviation",r)}applyElementStyles(){let{filterId:e,config:t}=this,{saturation:i,frost:n,radius:a,backdropBlur:s,overLight:r}=t,l=r?s*32+12:s*32,p=l>0?`url(#${e}) blur(${l}px) saturate(${i})`:`url(#${e}) saturate(${i})`;Object.assign(this.element.style,{WebkitBackdropFilter:p,backdropFilter:p,background:`hsl(0 0% 100% / ${n})`,borderRadius:`${a}px`,position:this.element.style.position||"relative",willChange:"transform, backdrop-filter",contain:"layout style paint"}),this.applyShineEffect(),this.applyOverlayLayers()}applyShineEffect(){let{intensity:e,type:t}=this.config.shine;if(e===0){this.element.style.setProperty("--shine-background","none");return}t==="shadow"?this.applyShadowShine():this.applyGradientShine()}applyGradientShine(){let{angle:e,intensity:t,color:i,spread:n}=this.config.shine,a=e+90,s=n,r=`linear-gradient(${a}deg, 
      transparent 0%, 
      ${i} ${s}%, 
      transparent ${s*2}%)`;this.element.style.setProperty("--shine-background",r),this.element.style.setProperty("--shine-shadow","none")}applyShadowShine(){let{angle:e,intensity:t,color:i,spread:n}=this.config.shine,a=e*Math.PI/180,s=Math.cos(a)*20*t,r=Math.sin(a)*20*t,l=`inset ${s}px ${r}px ${n}px ${i}, 
            inset ${-s}px ${-r}px ${n}px ${i}`;this.element.style.setProperty("--shine-background","none"),this.element.style.setProperty("--shine-shadow",l)}setupHoverEffects(){let{borderWidth:e,borderColor:t,scale:i,duration:n,easing:a}=this.config.hover,s=this.config.interactions?.enabled;if(e>0){this.element.style.border=`${e}px solid transparent`;let r=s?`border-color ${n}s ${a}`:`transform ${n}s ${a}, border-color ${n}s ${a}`;this.element.style.transition=r,this.element.addEventListener("mouseenter",()=>{!s&&i!==1&&(this.element.style.transform=`scale(${i})`),this.element.style.borderColor=`rgba(${t})`,this.hoverOverlay1&&(this.hoverOverlay1.style.opacity=String(this.config.overlays?.hoverOverlay1Opacity??.5)),this.hoverOverlay2&&(this.hoverOverlay2.style.opacity=String(this.config.overlays?.hoverOverlay2Opacity??0))}),this.element.addEventListener("mouseleave",()=>{s||(this.element.style.transform=""),this.element.style.borderColor="transparent",this.hoverOverlay1&&(this.hoverOverlay1.style.opacity="0"),this.hoverOverlay2&&(this.hoverOverlay2.style.opacity="0")})}else i!==1&&(s||(this.element.style.transition=`transform ${n}s ${a}`),this.element.addEventListener("mouseenter",()=>{s||(this.element.style.transform=`scale(${i})`),this.hoverOverlay1&&(this.hoverOverlay1.style.opacity=String(this.config.overlays?.hoverOverlay1Opacity??.5))}),this.element.addEventListener("mouseleave",()=>{s||(this.element.style.transform=""),this.hoverOverlay1&&(this.hoverOverlay1.style.opacity="0")}))}applyOverlayLayers(){let{overlays:e}=this.config;if(!e?.enabled){this.removeBorderLayers(),this.removeExtraOverlay(),this.removeHoverOverlays();return}this.createBorderLayers(e),this.createExtraOverlay(e),this.createHoverOverlays(e),this.updateStackedDistortionClone()}createBorderLayers(e){let t=e?.borderColor||"255, 255, 255, 1",i=e?.borderThickness||1.5,n=`0 0 0 0.5px rgba(${t}) inset, 0 1px 3px rgba(${t}) inset, 0 1px 4px rgba(0, 0, 0, 0.35)`;this.borderLayer1&&(this.borderLayer1.remove(),this.borderLayer1=null),this.borderLayer2&&(this.borderLayer2.remove(),this.borderLayer2=null),e?.advancedBorder?(this.borderLayer1=document.createElement("span"),Object.assign(this.borderLayer1.style,{position:"absolute",inset:"0",pointerEvents:"none",mixBlendMode:"screen",opacity:"0.2",padding:`${i}px`,WebkitMask:"linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",WebkitMaskComposite:"xor",maskComposite:"exclude",boxShadow:n,borderRadius:`${this.config.radius}px`}),this.element.appendChild(this.borderLayer1),this.borderLayer2=document.createElement("span"),Object.assign(this.borderLayer2.style,{position:"absolute",inset:"0",pointerEvents:"none",mixBlendMode:"overlay",padding:`${i}px`,WebkitMask:"linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",WebkitMaskComposite:"xor",maskComposite:"exclude",boxShadow:n,borderRadius:`${this.config.radius}px`}),this.element.appendChild(this.borderLayer2)):(this.borderLayer1=document.createElement("span"),Object.assign(this.borderLayer1.style,{position:"absolute",inset:"0",pointerEvents:"none",border:`${i}px solid rgba(${t})`,borderRadius:`${this.config.radius}px`,boxShadow:n,background:"none"}),this.element.appendChild(this.borderLayer1))}createExtraOverlay(e){let t=e?.extraOverlay;t?.enabled?this.extraOverlay?(this.extraOverlay.style.background=t.background||"none",this.extraOverlay.style.opacity=String(t.opacity??1),this.extraOverlay.style.mixBlendMode=t.blendMode||"color",this.extraOverlay.style.borderRadius=`${this.config.radius}px`):(this.extraOverlay=document.createElement("div"),Object.assign(this.extraOverlay.style,{position:"absolute",inset:"0",pointerEvents:"none",background:t.background||"none",opacity:t.opacity??1,mixBlendMode:t.blendMode||"color",borderRadius:`${this.config.radius}px`}),this.element.appendChild(this.extraOverlay)):this.extraOverlay&&(this.extraOverlay.remove(),this.extraOverlay=null)}createHoverOverlays(e){let t=e?.hoverLightIntensity??1,i=e?.borderColor||"255, 255, 255, 1",n=e?.hoverOverlayBlendMode||"overlay",a=e?.hoverOverlay1Angle??0,s=e?.hoverOverlay1LightColor||i,r=a*Math.PI/180,l=50+50*Math.sin(r),p=50-50*Math.cos(r),c=s.split(",").map(b=>b.trim()),f=parseFloat(c[3]||"1")*t,$=`${c[0]}, ${c[1]}, ${c[2]}, ${f}`,L=`radial-gradient(circle at ${l}% ${p}%, rgba(${$}) 0%, rgba(${c[0]}, ${c[1]}, ${c[2]}, 0) 50%)`,C=e?.hoverOverlay2Angle??0,m=e?.hoverOverlay2LightColor||i,x=C*Math.PI/180,g=50+50*Math.sin(x),d=50-50*Math.cos(x),o=m.split(",").map(b=>b.trim()),E=parseFloat(o[3]||"1")*t,h=`${o[0]}, ${o[1]}, ${o[2]}, ${E}`,v=`radial-gradient(circle at ${g}% ${d}%, rgba(${h}) 0%, rgba(${o[0]}, ${o[1]}, ${o[2]}, 0) 80%)`;this.hoverOverlay1?(this.hoverOverlay1.style.backgroundImage=L,this.hoverOverlay1.style.borderRadius=`${this.config.radius}px`,this.hoverOverlay1.style.mixBlendMode=n):(this.hoverOverlay1=document.createElement("div"),Object.assign(this.hoverOverlay1.style,{position:"absolute",inset:"0",pointerEvents:"none",transition:"opacity 0.2s ease-out",opacity:"0",backgroundImage:L,mixBlendMode:n,borderRadius:`${this.config.radius}px`}),this.element.appendChild(this.hoverOverlay1)),this.hoverOverlay2?(this.hoverOverlay2.style.backgroundImage=v,this.hoverOverlay2.style.borderRadius=`${this.config.radius}px`,this.hoverOverlay2.style.mixBlendMode=n):(this.hoverOverlay2=document.createElement("div"),Object.assign(this.hoverOverlay2.style,{position:"absolute",inset:"0",pointerEvents:"none",transition:"opacity 0.2s ease-out",opacity:"0",backgroundImage:v,mixBlendMode:n,borderRadius:`${this.config.radius}px`}),this.element.appendChild(this.hoverOverlay2))}removeBorderLayers(){this.borderLayer1&&(this.borderLayer1.remove(),this.borderLayer1=null),this.borderLayer2&&(this.borderLayer2.remove(),this.borderLayer2=null)}removeExtraOverlay(){this.extraOverlay&&(this.extraOverlay.remove(),this.extraOverlay=null)}removeHoverOverlays(){this.hoverOverlay1&&(this.hoverOverlay1.remove(),this.hoverOverlay1=null),this.hoverOverlay2&&(this.hoverOverlay2.remove(),this.hoverOverlay2=null)}update(){this.updateScheduled||(this.updateScheduled=!0,requestAnimationFrame(()=>{this.measureContainer(),this.feImage.setAttribute("href",this.buildDisplacementMap()),this.updateFilterAttributes(),this.applyElementStyles(),this.setupHoverEffects(),this.updateStackedDistortionSVG(),this.updateScheduled=!1}))}setupResizeObserver(){let e;this.resizeObserver=new ResizeObserver(()=>{e||(e=setTimeout(()=>{this.update(),e=null},100))}),this.resizeObserver.observe(this.element)}init(){this.update(),this.setupInteractions()}setupInteractions(){let{interactions:e}=this.config;e?.enabled&&(this.onMouseMove=t=>{let i=this.element.getBoundingClientRect(),n=i.left+i.width/2,a=i.top+i.height/2,s=t.clientX-n,r=t.clientY-a,l=Math.max(0,i.width/2-Math.abs(s)),p=Math.max(0,i.height/2-Math.abs(r)),c=Math.min(l,p),O=e.activationZone??200,f=0;O>0?f=c>O?1:c/O:f=0;let $=s*(e.elasticity||.15)*.1*f,L=r*(e.elasticity||.15)*.1*f,C=Math.hypot(s,r)||1,m=s/C,x=r/C,g=Math.min(C/300,1)*(e.elasticity||.15)*f,d=Math.max(.8,1+Math.abs(m)*g*.3-Math.abs(x)*g*.15),o=Math.max(.8,1+Math.abs(x)*g*.3-Math.abs(m)*g*.15);if(this.element.style.transform=`translate(${$}px, ${L}px) scaleX(${d}) scaleY(${o})`,this.borderLayer1&&this.borderLayer2){let y=(t.clientX-n)/i.width*100,E=(t.clientY-a)/i.height*100,h=this.config.hover.borderGradient,v=Math.max(10,h.startBase+E*h.startOffsetMultiplier),b=Math.min(90,h.endBase+E*h.endOffsetMultiplier),D=h.opacityBase+Math.abs(y)*h.opacityMultiplier,S=h.peakOpacityBase+Math.abs(y)*h.peakOpacityMultiplier,w=h.angleBase+y*h.angleMultiplier,B=`linear-gradient(${w}deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${D}) ${v}%, rgba(255,255,255,${S}) ${b}%, rgba(255,255,255,0) 100%)`,F=`linear-gradient(${w}deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${D+h.secondaryBoost}) ${v}%, rgba(255,255,255,${S+h.secondaryBoost}) ${b}%, rgba(255,255,255,0) 100%)`;this.borderLayer1.style.background=B,this.borderLayer2.style.background=F}},this.onMouseLeave=()=>{this.element.style.transform="",this.borderLayer1&&this.borderLayer2&&(this.borderLayer1.style.background="",this.borderLayer2.style.background="")},this.element.addEventListener("mousemove",this.onMouseMove),this.element.addEventListener("mouseleave",this.onMouseLeave))}destroy(){this.resizeObserver&&this.resizeObserver.disconnect(),this.onMouseMove&&this.element.removeEventListener("mousemove",this.onMouseMove),this.onMouseLeave&&this.element.removeEventListener("mouseleave",this.onMouseLeave),this.removeBorderLayers&&this.removeBorderLayers(),this.removeExtraOverlay&&this.removeExtraOverlay(),this.removeHoverOverlays&&this.removeHoverOverlays(),this.svgElement&&this.svgElement.remove(),this.stackedDistortionClone&&(this.stackedDistortionClone.remove(),this.stackedDistortionClone=null),this.stackedDistortionSVG&&(this.stackedDistortionSVG.remove(),this.stackedDistortionSVG=null),this.stackedDistortionObserver&&(this.stackedDistortionObserver.disconnect(),this.stackedDistortionObserver=null),this.cachedDisplacementMap=null,this.cachedDimensions=null}};var W=()=>{document.querySelectorAll(u.GLASS_EFFECT).forEach(e=>{let t=P(e);new _(e,t)})};document.addEventListener("DOMContentLoaded",W);export{_ as GlassEffect,I as baseConfig};

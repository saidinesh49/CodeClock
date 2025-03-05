console.log("CodeClock: Content script loaded");let t=null,d=!1,g,y,v,T,n=null,l=null,c=null;const a={RUNNING:"running",PAUSED:"paused"},S=()=>window.location.hostname,k=()=>{const e=localStorage.getItem("codeclock_timer_state");if(e)try{return JSON.parse(e)}catch(o){console.error("Error getting timer state:",o)}return null},D=()=>{localStorage.removeItem("codeclock_timer_state")},i=e=>{!t||!e||localStorage.setItem("codeclock_timer_state",JSON.stringify({time:u(e),difficulty:e.difficulty,position:{x:parseInt(t.style.left),y:parseInt(t.style.top)},timestamp:Date.now()}))},u=e=>{if(!e)return 0;const o=Date.now();let r=0;return e.pausedSegments.forEach(s=>{s.end?r+=s.end-s.start:e.status===a.PAUSED&&(r+=o-s.start)}),Math.floor((o-e.startTime-r)/1e3)},h=()=>{if(!t||!n)return;const e=()=>{const o=u(n),r=Math.floor(o/60),s=o%60;c.textContent=`${r.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`,i(n)};l=setInterval(e,1e3),e()},N=()=>{if(document.readyState==="complete"){const e=E();e&&x(e.difficulty)}chrome.runtime.onMessage.addListener((e,o,r)=>(console.log("CodeClock: Message received:",e),e.type==="START_TIMER"?setTimeout(()=>{x(e.difficulty),r({status:"Timer started"})},100):e.type==="STOP_TIMER"&&(m(),r({status:"Timer stopped"})),!0))};N();const E=()=>{const e=localStorage.getItem("codeclock_timer_state");if(e)try{const o=JSON.parse(e);if(Date.now()-o.timestamp<24*60*60*1e3)return o}catch(o){console.error("Error loading saved state:",o)}return null},b=()=>{const e=document.createElement("div");e.style.display="flex",e.style.gap="8px",e.style.marginLeft="8px";const o=document.createElement("button");o.style.cssText=`
    background: none;
    border: none;
    color: #ffa116;
    cursor: pointer;
    padding: 0;
    font-size: 16px;
    display: flex;
    align-items: center;
  `;const r=()=>{o.textContent=n.status===a.PAUSED?"▶":"⏸"};o.onclick=()=>{n.status===a.PAUSED?A():U(),r()},r();const s=document.createElement("button");return s.textContent="⏹",s.style.cssText=`
    background: none;
    border: none;
    color: #ffa116;
    cursor: pointer;
    padding: 0;
    font-size: 16px;
    display: flex;
    align-items: center;
  `,s.onclick=P,e.appendChild(o),e.appendChild(s),e},x=e=>{console.log("CodeClock: Injecting timer for difficulty:",e),t&&m();const o=k();if(o&&o.platform===S()){if(!confirm("A timer is already running on this platform. Would you like to stop it and start a new one?"))return;D()}n={startTime:Date.now(),difficulty:e,platform:S(),status:a.RUNNING,pausedSegments:[]};const r=E();r?Date.now()-r.time*1e3:Date.now(),t=document.createElement("div"),t.id="codeclock-timer-container";const s=r?.position||{x:20,y:20};t.style.cssText=`
    position: fixed;
    top: ${s.y}px;
    left: ${s.x}px;
    z-index: 10000;
    background: ${window.codeclock_colors.background.paper};
    padding: 6px 12px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    max-width: 200px;
    white-space: nowrap;
    cursor: move;
  `;const p=document.createElement("div");p.style.cssText=`
    width: 8px;
    height: 8px;
    background: #ff375f;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  `;const f=document.createElement("style");f.textContent=`
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
    }
  `,document.head.appendChild(f),c=document.createElement("div"),c.style.cssText=`
    color: white;
    font-family: monospace;
    font-size: 14px;
  `;const I=b();t.appendChild(p),t.appendChild(c),t.appendChild(I),document.body.appendChild(t),h(),t.addEventListener("mousedown",_),document.addEventListener("mousemove",w),document.addEventListener("mouseup",C),i(n)},m=()=>{t&&(clearInterval(Number(t.dataset.interval)),l&&clearInterval(l),document.removeEventListener("mousemove",w),document.removeEventListener("mouseup",C),t.remove(),t=null,d=!1,n=null,localStorage.removeItem("codeclock_timer_state"))};function _(e){t&&(v=e.clientX-t.offsetLeft,T=e.clientY-t.offsetTop,d=!0)}function w(e){!d||!t||(e.preventDefault(),g=e.clientX-v,y=e.clientY-T,t.style.left=g+"px",t.style.top=y+"px",i())}function C(){d=!1}const P=()=>{if(n&&window.confirm("Are you sure you want to stop the timer?")){const e={type:"TIMER_STOPPED",data:{time:u(n),difficulty:n.difficulty}};chrome.runtime.sendMessage(e),m(),n=null}},U=()=>{!n||n.status!==a.RUNNING||(n.status=a.PAUSED,n.pausedSegments.push({start:Date.now()}),clearInterval(l),i(n))},A=()=>{if(!n||n.status!==a.PAUSED)return;const e=n.pausedSegments[n.pausedSegments.length-1];e.end=Date.now(),n.status=a.RUNNING,h(),i(n)};
//# sourceMappingURL=content.js.map

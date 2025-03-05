console.log("CodeClock: Content script loaded");let e=null,a=!1,p,u,g,v,f;const E=()=>{chrome.runtime.onMessage.addListener((t,o,n)=>(console.log("CodeClock: Message received:",t),t.type==="START_TIMER"?(k(t.difficulty),n({status:"Timer started"})):t.type==="STOP_TIMER"&&(l(),n({status:"Timer stopped"})),!0))};E();const C=()=>{const t=localStorage.getItem("codeclock_timer_state");if(t)try{const o=JSON.parse(t);if(Date.now()-o.timestamp<24*60*60*1e3)return o}catch(o){console.error("Error loading saved state:",o)}return null},k=t=>{console.log("CodeClock: Injecting timer for difficulty:",t),e&&l();const o=C();f=o?Date.now()-o.time*1e3:Date.now(),e=document.createElement("div"),e.id="codeclock-timer-container";const n=o?.position||{x:20,y:20};e.style.cssText=`
    position: fixed;
    top: ${n.y}px;
    left: ${n.x}px;
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
  `;let r=o?o.time:0;const T=()=>{r=Math.floor((Date.now()-f)/1e3);const c=Math.floor(r/60),w=r%60;s.textContent=`${c.toString().padStart(2,"0")}:${w.toString().padStart(2,"0")}`,h()},h=()=>{localStorage.setItem("codeclock_timer_state",JSON.stringify({time:r,difficulty:t,position:{x:parseInt(e.style.left),y:parseInt(e.style.top)},timestamp:Date.now()}))},d=document.createElement("div");d.style.cssText=`
    width: 8px;
    height: 8px;
    background: #ff375f;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  `;const m=document.createElement("style");m.textContent=`
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
    }
  `,document.head.appendChild(m);const s=document.createElement("div");s.style.cssText=`
    color: white;
    font-family: monospace;
    font-size: 14px;
  `;const i=document.createElement("button");i.innerHTML="⏹",i.style.cssText=`
    background: none;
    border: none;
    color: #ffa116;
    cursor: pointer;
    padding: 0;
    font-size: 16px;
  `,i.onclick=()=>{if(window.confirm("Are you sure you want to stop the timer?")){const c={type:"TIMER_STOPPED",data:{time:r,difficulty:t}};chrome.runtime.sendMessage(c),l()}},e.appendChild(d),e.appendChild(s),e.appendChild(i),document.body.appendChild(e);const S=setInterval(T,1e3);e.dataset.interval=S,e.addEventListener("mousedown",b),document.addEventListener("mousemove",x),document.addEventListener("mouseup",y)},l=()=>{e&&(clearInterval(Number(e.dataset.interval)),document.removeEventListener("mousemove",x),document.removeEventListener("mouseup",y),e.remove(),e=null,a=!1,localStorage.removeItem("codeclock_timer_state"))};function b(t){e&&(g=t.clientX-e.offsetLeft,v=t.clientY-e.offsetTop,a=!0)}function x(t){!a||!e||(t.preventDefault(),p=t.clientX-g,u=t.clientY-v,e.style.left=p+"px",e.style.top=u+"px",saveTimerState())}function y(){a=!1}
//# sourceMappingURL=content.js.map

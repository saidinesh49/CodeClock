console.log("CodeClock: Content script loaded");let e=null,r=!1,p,u,m,f;const h=()=>{chrome.runtime.onMessage.addListener((t,n,o)=>(console.log("CodeClock: Message received:",t),t.type==="START_TIMER"?(T(t.difficulty),o({status:"Timer started"})):t.type==="STOP_TIMER"&&(d(),o({status:"Timer stopped"})),!0))};h();const T=t=>{console.log("CodeClock: Injecting timer for difficulty:",t),e&&d(),e=document.createElement("div"),e.id="codeclock-timer-container",e.style.cssText=`
    position: fixed;
    top: 20px;
    right: 20px;
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
  `;let n=0;const o=()=>{const c=Math.floor(n/60),y=n%60;s.textContent=`${c.toString().padStart(2,"0")}:${y.toString().padStart(2,"0")}`,n++},a=document.createElement("div");a.style.cssText=`
    width: 8px;
    height: 8px;
    background: #ff375f;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  `;const l=document.createElement("style");l.textContent=`
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
    }
  `,document.head.appendChild(l);const s=document.createElement("div");s.style.cssText=`
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
  `,i.onclick=()=>{if(window.confirm("Are you sure you want to stop the timer?")){const c={type:"TIMER_STOPPED",data:{time:n,difficulty:t}};chrome.runtime.sendMessage(c),d()}},e.appendChild(a),e.appendChild(s),e.appendChild(i),document.body.appendChild(e);const v=setInterval(o,1e3);e.dataset.interval=v,e.addEventListener("mousedown",C),document.addEventListener("mousemove",x),document.addEventListener("mouseup",g)},d=()=>{e&&(clearInterval(Number(e.dataset.interval)),document.removeEventListener("mousemove",x),document.removeEventListener("mouseup",g),e.remove(),e=null,r=!1)};function C(t){e&&(m=t.clientX-e.offsetLeft,f=t.clientY-e.offsetTop,r=!0)}function x(t){!r||!e||(t.preventDefault(),p=t.clientX-m,u=t.clientY-f,e.style.left=p+"px",e.style.top=u+"px")}function g(){r=!1}
//# sourceMappingURL=content.js.map

let e=null,i=!1,p,u,m,f;const T=()=>{chrome.runtime.onMessage.addListener((t,n,d)=>{t.type==="START_TIMER"?h(t.difficulty):t.type==="STOP_TIMER"&&a()})};T();const h=t=>{e&&a(),e=document.createElement("div"),e.id="codeclock-timer-container",e.style.cssText=`
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
  `;let n=0;const d=()=>{const s=Math.floor(n/60),y=n%60;r.textContent=`${s.toString().padStart(2,"0")}:${y.toString().padStart(2,"0")}`,n++},c=document.createElement("div");c.style.cssText=`
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
  `,document.head.appendChild(l);const r=document.createElement("div");r.style.cssText=`
    color: white;
    font-family: monospace;
    font-size: 14px;
  `;const o=document.createElement("button");o.innerHTML="⏹",o.style.cssText=`
    background: none;
    border: none;
    color: #ffa116;
    cursor: pointer;
    padding: 0;
    font-size: 16px;
  `,o.onclick=()=>{if(window.confirm("Are you sure you want to stop the timer?")){const s={type:"TIMER_STOPPED",data:{time:n,difficulty:t}};chrome.runtime.sendMessage(s),a()}},e.appendChild(c),e.appendChild(r),e.appendChild(o),document.body.appendChild(e);const v=setInterval(d,1e3);e.dataset.interval=v,e.addEventListener("mousedown",E),document.addEventListener("mousemove",x),document.addEventListener("mouseup",g)},a=()=>{e&&(clearInterval(Number(e.dataset.interval)),document.removeEventListener("mousemove",x),document.removeEventListener("mouseup",g),e.remove(),e=null,i=!1)};function E(t){e&&(m=t.clientX-e.offsetLeft,f=t.clientY-e.offsetTop,i=!0)}function x(t){!i||!e||(t.preventDefault(),p=t.clientX-m,u=t.clientY-f,e.style.left=p+"px",e.style.top=u+"px")}function g(){i=!1}

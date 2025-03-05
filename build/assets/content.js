let e=null;chrome.runtime.onMessage.addListener((t,n,a)=>{t.type==="START_TIMER"?p(t.difficulty):t.type==="STOP_TIMER"&&r()});const p=t=>{e&&r(),e=document.createElement("div"),e.id="codeclock-timer-container",e.style.cssText=`
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: ${colors.background.paper};
    padding: 6px 12px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 8px;
  `;let n=0;const a=()=>{const d=Math.floor(n/60),l=n%60;o.textContent=`${d.toString().padStart(2,"0")}:${l.toString().padStart(2,"0")}`,n++},s=document.createElement("div");s.style.cssText=`
    width: 8px;
    height: 8px;
    background: #ff375f;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  `;const o=document.createElement("div");o.style.cssText=`
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
  `,i.onclick=()=>{window.confirm("Are you sure you want to stop the timer?")&&(chrome.runtime.sendMessage({type:"TIMER_STOPPED",data:{time:n,difficulty:t}}),r())},e.appendChild(s),e.appendChild(o),e.appendChild(i),document.body.appendChild(e);const c=setInterval(a,1e3);e.dataset.interval=c,e.onmousedown=u,document.onmousemove=m,document.onmouseup=f},r=()=>{e&&(clearInterval(Number(e.dataset.interval)),e.remove(),e=null)};function u(t){initialX=t.clientX-e.offsetLeft,initialY=t.clientY-e.offsetTop,isDragging=!0}function m(t){isDragging&&e&&(t.preventDefault(),currentX=t.clientX-initialX,currentY=t.clientY-initialY,e.style.left=currentX+"px",e.style.top=currentY+"px")}function f(){isDragging=!1}

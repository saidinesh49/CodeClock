let e=null;chrome.runtime.onMessage.addListener((t,n,o)=>{t.type==="START_TIMER"?i(t.difficulty):t.type==="STOP_TIMER"&&r()});const i=t=>{e=document.createElement("div"),e.id="codeclock-timer-container",e.style.cssText=`
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: transparent;
    border: none;
  `;const n=document.createElement("iframe");n.src=chrome.runtime.getURL("index.html#/timer"),n.style.cssText=`
    border: none;
    background: transparent;
    width: 150px;
    height: 40px;
  `,e.appendChild(n),document.body.appendChild(e)},r=()=>{e&&(e.remove(),e=null)};

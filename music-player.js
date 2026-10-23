// A compact mute button; the same audio element follows the active detail dialog.
const key='bainian-bgm-settings-v1';
let settings={enabled:true,volume:25};
try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&typeof saved.enabled==='boolean')settings.enabled=saved.enabled;if(saved&&Number.isFinite(saved.volume))settings.volume=Math.max(0,Math.min(100,saved.volume));}catch{}
const save=()=>{try{localStorage.setItem(key,JSON.stringify(settings));}catch{}};
let lastVolume=settings.volume>0?settings.volume:25;
const audio=document.createElement('audio');audio.id='backgroundMusic';audio.src=new URL('./bgm.mp3',import.meta.url).href;audio.loop=true;audio.preload='metadata';audio.volume=settings.volume/100;audio.muted=!settings.enabled;
document.body.append(audio);
const dock=document.createElement('aside');dock.className='music-dock';dock.setAttribute('aria-label','背景音乐控制');
dock.innerHTML=`<span class="music-volume-wrap"><input id="musicVolume" class="music-volume" type="range" min="0" max="100" step="1" aria-label="背景音乐音量"></span><button type="button" class="music-toggle" aria-label="静音背景音乐" aria-pressed="false"><svg class="music-note" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17V4c4 0 7 2 7 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="7" cy="17" rx="3.2" ry="2.4" fill="currentColor"/><path class="music-mute-mark" d="M4 3L21 21" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></button><span class="music-message visually-hidden" role="status"></span>`;
document.body.append(dock);
const toggle=dock.querySelector('button'),slider=dock.querySelector('input'),message=dock.querySelector('.music-message');
function update(){const silent=audio.muted||audio.volume===0;toggle.setAttribute('aria-pressed',String(silent));toggle.setAttribute('aria-label',silent?'取消背景音乐静音':'静音背景音乐');dock.classList.toggle('is-muted',silent);dock.classList.toggle('is-playing',!audio.paused&&!silent);slider.value=String(Math.round(audio.volume*100));slider.setAttribute('aria-valuetext',slider.value+'%');}
async function play(){try{await audio.play();message.textContent=audio.muted?'背景音乐已静音':'背景音乐已播放';}catch{message.textContent=audio.error?'音乐未能载入，请刷新后重试':'点击音符开始播放';}update();}
toggle.addEventListener('click',()=>{const silent=audio.muted||audio.volume===0;audio.muted=!silent;if(silent&&audio.volume===0){audio.volume=lastVolume/100;settings.volume=lastVolume;}settings.enabled=silent;save();if(silent&&audio.paused)play();message.textContent=silent?'已恢复背景音乐':'背景音乐已静音';update();});
slider.addEventListener('input',()=>{const v=Number(slider.value);audio.volume=v/100;settings.volume=v;if(v>0)lastVolume=v;audio.muted=v===0;settings.enabled=v>0;save();if(v>0&&audio.paused)play();update();});
for(const event of ['play','pause','volumechange'])audio.addEventListener(event,update);
audio.addEventListener('error',()=>{message.textContent='背景音乐加载失败，可刷新页面重试';update();});
document.querySelector('#enterScroll').addEventListener('click',()=>{if(settings.enabled&&audio.paused)play();});
function placeDock(){const parent=[...document.querySelectorAll('dialog[open]')].at(-1)||document.body;if(dock.parentElement!==parent)parent.append(dock);}
new MutationObserver(placeDock).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
update();

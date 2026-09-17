(function(){
  const localApi=new URLSearchParams(location.search).get('api');
  const API=['localhost','127.0.0.1'].includes(location.hostname)&&/^http:\/\/(localhost|127\.0\.0\.1):\d+\/api$/.test(localApi||'')?localApi:(['localhost','127.0.0.1'].includes(location.hostname)?(location.port==='5501'?'http://127.0.0.1:5050/api':'http://localhost:5000/api'):`${location.origin}/api`);
  const form=document.getElementById('identityVerifyForm'); const input=document.getElementById('identityToken'); const result=document.getElementById('identityResult');
  const params=new URLSearchParams(location.search); const initial=params.get('token')||params.get('id')||'';
  const esc=(v)=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  const date=(v)=>v?new Date(v).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'}):'-';
  let soundBlocked=false;
  const soundPreferenceKey='naisft_credential_sound';
  const soundEnabled=()=>localStorage.getItem(soundPreferenceKey)!=='off';

  async function playVerifiedSound(force){
    if(!force&&!soundEnabled())return false;
    try{
      const AudioCtx=window.AudioContext||window.webkitAudioContext; if(!AudioCtx) return false;
      const ctx=new AudioCtx(); await ctx.resume();
      const gain=ctx.createGain(); gain.connect(ctx.destination); gain.gain.setValueAtTime(.0001,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.16,ctx.currentTime+.02); gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.48);
      [659.25,783.99].forEach((freq,index)=>{const osc=ctx.createOscillator();osc.type='sine';osc.frequency.value=freq;osc.connect(gain);osc.start(ctx.currentTime+index*.14);osc.stop(ctx.currentTime+.5);});
      setTimeout(()=>ctx.close(),700); soundBlocked=false; return true;
    }catch(error){soundBlocked=true;return false;}
  }

  function renderState(kind,title,message){result.innerHTML=`<section class="idv-state ${kind}"><span class="idv-status">${esc(kind.toUpperCase())}</span><h2>${esc(title)}</h2><p>${esc(message)}</p></section>`;}
  function demoCard(token){return{cardNumber:'NAISFT-ID-2026-000001',verifyToken:token,status:'ACTIVE',issuedAt:'2026-07-18T00:00:00.000Z',expiresAt:'2027-07-18T00:00:00.000Z',qrCodeUrl:'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='+encodeURIComponent(location.href),student:{fullName:'Aarav Kumar',enrollmentNo:'NAISFT-2026-0007',photoUrl:'Assets/logo Institute.png'},course:{name:'Diploma in Industrial Safety',duration:'12 Months'}};}
  async function verify(token){
    if(!token)return renderState('invalid','Token required','Scan a student card QR code or enter its secure token.');
    result.innerHTML='<section class="idv-state"><div class="idv-spinner"></div><h2>Checking identity card…</h2></section>';
    try{
      let data;
      if(token==='NAISFT-ID-DEMO-000001'){data={success:true,identityCard:demoCard(token)};}
      else{const response=await fetch(API+'/identity-cards/verify/'+encodeURIComponent(token));data=await response.json();if(!response.ok||!data.success)throw new Error(data.message||'Identity card could not be verified.');}
      const card=data.identityCard; const status=String(card.status||'').toUpperCase();
      if(status!=='ACTIVE')return renderState(status.toLowerCase(),status==='EXPIRED'?'Identity card expired':'Identity card not active',card.revocationReason||'This credential is no longer active.');
      const student=card.student||{}; const course=card.course||{};
      result.innerHTML=`<section class="idv-state valid"><span class="idv-status">✓ VERIFIED ACTIVE CARD</span><div class="idv-card"><img class="idv-photo" src="${esc(student.photoUrl||'Assets/logo Institute.png')}" alt="Student photograph"><div class="idv-details"><small>Official NAISFT student identity</small><h2>${esc(student.fullName)}</h2><p><b>Enrollment:</b> ${esc(student.enrollmentNo||'-')}</p><p><b>Course:</b> ${esc(course.name||'-')}</p><p><b>Card number:</b> ${esc(card.cardNumber)}</p><p><b>Valid until:</b> ${esc(date(card.expiresAt))}</p></div><div class="idv-qr"><img src="${esc(card.qrCodeUrl)}" alt="Verification QR code"></div></div><div class="idv-actions"><a href="${API}/identity-cards/download/${encodeURIComponent(card.verifyToken)}" target="_blank" rel="noopener">View / Print Card</a><button class="sound" id="playVerifySound" type="button">🔊 Play verified sound</button><button id="toggleVerifySound" type="button">Auto sound: ${soundEnabled()?'On':'Off'}</button></div><p id="soundNotice">${soundBlocked?'Your browser blocked automatic sound. Tap the sound button to hear confirmation.':'Identity verified successfully.'}</p></section>`;
      const played=await playVerifiedSound(); if(!played){const notice=document.getElementById('soundNotice');if(notice)notice.textContent=soundEnabled()?'Your browser blocked automatic sound. Tap the sound button to hear confirmation.':'Identity verified successfully. Automatic sound is turned off.';}
      document.getElementById('playVerifySound')?.addEventListener('click',()=>playVerifiedSound(true));
      document.getElementById('toggleVerifySound')?.addEventListener('click',(event)=>{const enabled=!soundEnabled();localStorage.setItem(soundPreferenceKey,enabled?'on':'off');event.currentTarget.textContent='Auto sound: '+(enabled?'On':'Off');});
    }catch(error){renderState('invalid','Identity card not verified',error.message||'The token is invalid or unavailable.');}
  }
  form?.addEventListener('submit',(event)=>{event.preventDefault();const token=input.value.trim();history.replaceState({},'',token?'identity-card-verify.html?token='+encodeURIComponent(token):'identity-card-verify.html');verify(token);});
  if(initial){input.value=initial;verify(initial);}
})();

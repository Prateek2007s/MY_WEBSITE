<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Anti‑Chat</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body { margin:0; font-family:Arial,sans-serif; background:#111; color:#eee; }
    .popup {
      position:fixed;top:0;left:0;right:0;bottom:0;
      background:rgba(0,0,0,0.85);display:flex;
      justify-content:center;align-items:center;
    }
    .box {
      background:#222; padding:20px; border-radius:8px;
      width:320px; max-width:90%;
    }
    .tabs { display:flex; margin-bottom:10px; }
    .tabs button {
      flex:1; padding:10px; background:#444; color:#eee;
      border:none; cursor:pointer;
    }
    .tabs button.active { background:#00ffc8; color:#000; }
    .form { display:none; }
    .form.active { display:block; }
    input {
      width:100%;padding:10px;margin:8px 0;
      border:none;border-radius:4px;
    }
    button.submit {
      width:100%; padding:12px; background:#00ffc8;
      color:#000;border:none;border-radius:4px;
      cursor:pointer;font-size:1.1em;
    }
    .chat { display:none; max-width:600px;margin:20px auto;color:#eee; }
    #chat-box {
      border:1px solid #444; background:#222;
      max-height:400px; overflow-y:auto;
      padding:10px; margin-bottom:10px;
    }
    .msg {
      margin-bottom:8px; padding:4px;
      border-bottom:1px solid #333;
      display:flex; justify-content:space-between;
      align-items:center;
    }
    .msg button {
      background:red;color:#fff;border:none;
      padding:4px 8px; border-radius:4px;
      font-size:0.8em; cursor:pointer;
    }
    input#message {
      width:80%; padding:10px;
      border:none;border-radius:4px;
      margin-right:8px;
    }
    button.send {
      padding:10px 16px;
      border:none;border-radius:4px;
      background:#00ffc8;color:#000;
      cursor:pointer;
    }
    button.logout {
      background:red;color:#fff;border:none;
      padding:8px 16px;border-radius:4px;
      cursor:pointer; margin-bottom:10px;
    }
  </style>
</head>
<body>

<div class="popup" id="auth-popup">
  <div class="box">
    <div class="tabs">
      <button id="tab-signup" class="active" onclick="showTab('signup')">Sign Up</button>
      <button id="tab-login" onclick="showTab('login')">Login</button>
    </div>
    <div id="signup" class="form active">
      <input type="text" id="su-name" placeholder="Name" />
      <input type="email" id="su-email" placeholder="Email" />
      <input type="password" id="su-pass" placeholder="Password" />
      <input type="password" id="su-pass2" placeholder="Confirm Password" />
      <button class="submit" onclick="signup()">Sign Up</button>
    </div>
    <div id="login" class="form">
      <input type="email" id="li-email" placeholder="Email" />
      <input type="password" id="li-pass" placeholder="Password" />
      <button class="submit" onclick="login()">Login</button>
    </div>
  </div>
</div>

<div class="chat" id="chat-ui">
  <button class="logout" onclick="logout()">Logout</button>
  <div id="chat-box"></div>
  <div>
    <input type="text" id="message" placeholder="Type a message..." />
    <button class="send" onclick="sendMessage()">Send</button>
  </div>
</div>

<script>
let currentToken = '';
let myName = '';

function showTab(tab){
  document.getElementById('signup').classList.toggle('active', tab==='signup');
  document.getElementById('login').classList.toggle('active', tab==='login');
  document.getElementById('tab-signup').classList.toggle('active', tab==='signup');
  document.getElementById('tab-login').classList.toggle('active', tab==='login');
}

async function signup(){
  const name = suName = document.getElementById('su-name').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const pass = document.getElementById('su-pass').value;
  const pass2 = document.getElementById('su-pass2').value;

  if(!name||!email||!pass){ alert('Complete all fields'); return;}
  if(pass !== pass2){ alert('Passwords do not match'); return;}

  const res = await fetch('/signup', {
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name,email,password:pass})
  });
  const data = await res.json();
  if(data.success){
    currentToken = data.token;
    myName = data.name;
    startChat();
  } else alert(data.message);
}

async function login(){
  const email = document.getElementById('li-email').value.trim();
  const pass = document.getElementById('li-pass').value;
  if(!email||!pass){ alert('Fill both'); return;}

  const res = await fetch('/login', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({email, password: pass})
  });
  const data = await res.json();
  if(data.success){
    currentToken = data.token;
    myName = data.name;
    startChat();
  } else alert(data.message);
}

function logout(){
  currentToken = ''; myName = '';
  document.getElementById('chat-ui').style.display='none';
  document.getElementById('auth-popup').style.display='flex';
}

function startChat(){
  document.getElementById('auth-popup').style.display='none';
  document.getElementById('chat-ui').style.display='block';
  loadMessages();
}

async function loadMessages(){
  const res = await fetch('/messages',{
    headers:{Authorization:'Bearer '+currentToken}
  });
  const data = await res.json();
  const box = document.getElementById('chat-box');
  box.innerHTML = '';
  data.messages.forEach(msg=>{
    const el = document.createElement('div');el.className='msg';
    el.innerHTML = `<span><b>${msg.user}</b>: ${msg.text}</span>`;
    if(msg.user===myName && msg.text!=='[MESSAGE DELETED]'){
      const btn = document.createElement('button');
      btn.textContent='Delete';
      btn.onclick = ()=>deleteMessage(msg.id);
      el.appendChild(btn);
    }
    box.appendChild(el);
  });
  box.scrollTop = box.scrollHeight;
}

async function sendMessage(){
  const text = document.getElementById('message').value.trim();
  if(!text) return;
  await fetch('/messages',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      Authorization:'Bearer '+currentToken
    },
    body: JSON.stringify({text})
  });
  document.getElementById('message').value='';
  loadMessages();
}

async function deleteMessage(id){
  await fetch(`/messages/${id}`,{
    method:'DELETE',
    headers:{Authorization:'Bearer '+currentToken}
  });
  loadMessages();
}
</script>
</body>
</html>

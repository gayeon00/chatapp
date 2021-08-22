//여기는 이제 유저에게만 보여지는, frontend단으로 사용되는 js파일!
const messageList = document.querySelector('ul');
const messageForm = document.querySelector('#message');
const nickForm = document.querySelector('#nick');
//요기의 socket : server로 연결!!
const socket = new WebSocket(`ws://${window.location.host}`); //이놈으로 frontend에서 backend로 메세지 보내고, backend로부터 메세지 받을 수 있도록 함!

//JSON을 string으로 만들어서 socket.send()로 서버로 전송해줌!
function makeMessage(type,payload) {
    const msg = {type,payload};
    return JSON.stringify(msg);
}

//server와의 connection이 open됐을때
socket.addEventListener('open',()=>{
    console.log('Connected to Server ✔');
});

//server에서 메세지를 보낼때 마다!
socket.addEventListener('message',(message)=>{
    const li = document.createElement('li');
    li.innerText = message.data;
    messageList.append(li);
});

//server가 offline으로 됐을때!
socket.addEventListener('close',()=>{
    console.log('Disconnected from Server ');
});

function handleSubmit(event) {
    event.preventDefault();//submit의 기본기능을 못하도록 막아주는것! 대신에 이 아래 적힌 코드들 실행하도록!
    const input = messageForm.querySelector('input');
    socket.send(makeMessage('new_message',input.value)); //닉네임인지, message인지 구분하는 타입까지 넣은 JSON을 보내야 해서, JSON을 stringtify로 string으로 바꿔서 send해줌@
    
    const li = document.createElement('li');
    li.innerText = `You : ${input.value}`;
    messageList.append(li);
    
    input.value = "";
}

function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector('input');
    socket.send(makeMessage('nickname',input.value));
    input.value = "";
}

messageForm.addEventListener('submit',handleSubmit);
nickForm.addEventListener('submit',handleNickSubmit);
//socketio로 서버랑 연결해주는 코드!
const socket = io();

const welcome = document.getElementById("welcome");
const room = document.getElementById("room");

room.hidden = true;
let roomName;

function addMessage(message){
    const ul = room.querySelector('ul');
    const li = document.createElement('li');
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName,()=>{
        addMessage(`You : ${value}`);
    });
    input.value = "";
}

function handleNicknameSubmit(event){
    event.preventDefault();
    const input = welcome.querySelector("#name input");
    socket.emit("nickname",input.value);
    //input.value = "";
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;

    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;

    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit",handleMessageSubmit);
    
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = welcome.querySelector("#enterroom input");

    //room이라는 event를 emit해줌 + argument첨부 가능!(object도 OK! - payload로 input.value보내조!)
    //emit의 첫번째 : event name, 두번째 : 전송할 payload, 세번째 : 서버에서 호출하는 function(실행은 front에서 함!)
    socket.emit("enter_room",input.value,showRoom);
    roomName = input.value;
    input.value = "";
    
}
const nameForm = welcome.querySelector("#name");
const roomForm = welcome.querySelector("#enterroom");
nameForm.addEventListener("submit",handleNicknameSubmit);
roomForm.addEventListener("submit",handleRoomSubmit);

//socket이 welcome이란 이벤트를 서버로 부터 받으면,
socket.on("welcome",(nickname) => {
    addMessage(`${nickname} Joined!`);
});

socket.on("bye",(nickname)=>{
    addMessage(`${nickname} Left ㅠㅠ`);
});

socket.on("new_message",addMessage);
//socketio로 서버랑 연결해주는 코드!
const socket = io();

const welcome = document.getElementById("welcome");
const room = document.getElementById("room");

room.hidden = true;
let roomName;

const loc = document.getElementById("location");
let lat;
let long;
let prevPos;
let locHist = [];
let distHist = [];
let totDist = 0;

//이거 distance구하는 공식
function calculateDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = (lat2 - lat1).toRad();
    var dLon = (lon2 - lon1).toRad(); 
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    var d = R * c;
    return d;
  }

  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }


function success(position) {
    let dist = 0;

    lat = position.coords.latitude;
    long = position.coords.longitude;

    console.log(lat, long);

    //위치 로그 저장
    locHist.push(position);
    console.log(`locHist : ${locHist}`);
    //이 이후에 미리 선언해준 distance 변수(0으로 초기화)에 "+= locHist[locHist.length-2], locHist[locHist.length-1]두개 사이 거리" 해주기
    if(prevPos!=undefined){  //처음 찍힌 놈이라면 prevPos가 없으니까
        dist = calculateDistance(prevPos.coords.latitude, prevPos.coords.longitude, position.coords.latitude, position.coords.longitude);
    }
    console.log(`dist : ${dist}`);

    //총 거리 축적
    totDist+= dist;
    console.log(`totDist : ${totDist}`);

    //거리 로그 저장
    distHist.push(dist);
    console.log(`distHist(list) : ${distHist}`);

    socket.emit("new_message", roomName, lat, long,()=>{
        addMessage(`You : ${lat}, ${long}`);
    });

    prevPos = position;

    // let coordinateOne = {latitude: 41.3543, longitude: 71.9665};
    // let coordianteTwo = {latitude: 41.3890, longitude: 70.5134};
 
    // let distanceBetween = getDistanceBetween(coordinateOne, coordinateTwo);
 
    // console.log(distanceBetween);
}
  
function error() {
    alert('Sorry, no position available.');
}
  
const options = {
    enableHighAccuracy: true,
    //maximumAge: 30000,
    //timeout: 27000
};

function addMessage(msg){
    const ul = room.querySelector('ul');
    const li = document.createElement('li');
    li.innerText = msg;
    ul.appendChild(li);
}

function handleLocation(){
    if('geolocation' in navigator) {
        /* 위치정보 사용 가능 */
        
        const watchID = navigator.geolocation.watchPosition(success, error, options);
        //여기 success로 저 밑에 lat, long도 업뎃 되는지 봐야함
    } else {
        /* 위치정보 사용 불가능 */
        //loc.innerText('위치정보 사용 불가');
        console.log('위치정보 사용 불가');
    }

    //const input = room.querySelector("#msg input");
    //const value = input.value;

    //input.value = "";
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


    handleLocation();
    //여기에 위치정보 받아서 쏴주는 함수 필요

    /*const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit",handleMessageSubmit);*/
    
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




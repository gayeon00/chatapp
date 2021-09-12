import SocketIO from "socket.io"
import http from "http"
import express from "express"

//express : http
const app = express();

app.set('view engine','pug'); //app.set('view engine','pug'); : pug템플릿으로 view썼으니까 알아서 해석해줘!
app.set('views',__dirname+'/views'); //유저에게 보여줄 view파일들은 저기 views폴더 하위에 있으니까 찾아써~~!
//django할때 static설정해 줬던 것 처럼 여기서도 static 파일들에 대한 설정 해줘야함!
app.use('/public',express.static(__dirname+'/public')); //브라우저 창에서 /public이라고 치면 내 경로의 public폴더 안으로 들어가서 검색함

//html의 GET메소드임!! app.set으로 view폴더를 미리 설정해놨기 때문에, get메소드로 render(뿌려줄) view는 home이다~~ 라고 말해주는겨!!
app.get('/',(req, res)=>res.render('home'));
app.get('/*',(req,res)=>res.redirect('/')); //catchall : 주소창에 어떤 다른 이상한걸 갖다붙여도 home으로만 오게!

const handleListen = () => console.log('Listening on http://localhost:5000')

//////////////////////////////////////////////////////// 이까진 http 서버! 이제 여기다가 websocket서버를 합쳐줄거임!

//express앱으로 부터 '서버'만듦!(websocket하려면 꼭 필요함!) => 저 서버에 websocket만듦!
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection",(socket) =>{
    socket['nickname'] = "Anon";
    //socket.on, socket.~~등 모든 이벤트에 대해 작동하도록!   
    socket.onAny((event)=>{
        console.log(`Socket Event:${event}`);
   });
    //front에서 보낸 event가 도착하면(room이라는 이벤트가 도착하면 + 함께 온 argument) 뫄뫄 해줘라~~
    //emit의 세번째 argument로 받은 function을 done이라는 이름으로 받음!
    socket.on("enter_room",(roomName,done) => {
        //roomName을 가진 room에 join!!
        socket.join(roomName);
        //야! 프론트에 가서 이거 좀 실행하라고 해줘라!
        done();
        //입장한 room에 있는 "나를 제외한" 모든 사람들에게 welcome이란 이벤트를 emit함!
        socket.to(roomName).emit("welcome",socket.nickname);
    });

    //창을 닫았을때 but아직 완전히 연결이 끊기진 않았을때 마지막 작별인사 보낼수 있도록!
    socket.on("disconnecting",()=>{
        socket.rooms.forEach((room) => socket.to(room).emit("bye",socket.nickname));
    });

    socket.on("new_message",(roomName,lat, long, done) => {
        socket.to(roomName).emit("new_message",`${socket.nickname} : ${lat}, ${long}`);
        done();
    });

    socket.on("nickname",(nickname)=> (socket['nickname'] = nickname));
});


/* //새로운 websocket서버 만들깅(but 위에서 만든 server를 곁들여서 pass)
//이러면 http, websocket서버 둘다 돌릴수 있음! 뭐 http안돌리고 싶으면 안돌려도 ok!
const wss = new WebSocket.Server({server});

//여러 브라우저에서 접근하는 사람 여기에 넣어서 서로 통신할 수 있도록 만들기!!
const sockets = [];

//여기 socket이란 놈이 frontend랑 실시간 통신 가능하게 하는 놈임!!
//여기 socket : 연결된 브라우저!(firefox, chrome, ie)
wss.on("connection",(socket)=>{
    sockets.push(socket);
    //socket은 객체라 걍 내가 특성 넣어주면 댐(nickname초기화)
    socket['nickname'] = 'Anon';
    console.log('Connected to BrowserPage ✔');
    //브라우저가 꺼졌을때
    socket.on('close',()=> console.log('disconnected from BrowserPage'));
    //브라우저에서 메세지를 보내왔을때
    socket.on('message',(msg)=>{
        //browser에서 받아온 string은 JSON을 string으로 바꾼거라 다시 변환해주고 활용!!
        const message=JSON.parse(msg);

        switch(message.type){
            case "new_message":
                sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}:${message.payload}`));
            case "nickname":
                socket['nickname']=message.payload;
        }

        
        
    });
}); */

httpServer.listen(5000,handleListen);


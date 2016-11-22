//var app = require('./app_config.js');
var userController = require('./controller/userController.js');
var validator = require('validator');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

io.on('connection', function(socket){
	console.log("Chamou o IO");

	//Aqui o servidor coleta via query string a sala desejada
	var channelId = socket.handshake['query']['channel'];
	
	console.log("canal " + channelId);
	if(channelId !== undefined) {
		//Socket se "junta" a sala
		socket.join(channelId);

		var numQtd = io.sockets.adapter.rooms[channelId].length;
		console.log("Sala: " + channelId + " Qtd: " + numQtd);

		userController.listaAgencia(channelId,function(ret){
			
			sendUpdate(channelId,ret);
		 });
     
		socket.on('disconnect', function(){
			console.log("Desconectou...");
		});
	}
});

app.get('/servidor', function(req, res) {
	res.end('Servidor ON!');
});

app.get('/', function(req, res) {

	var tp_cd_uor = req.param('tp_cd_uor');

	if(tp_cd_uor !=undefined){

		validator.trim(validator.escape(tp_cd_uor));

		userController.listaAgencia(tp_cd_uor,function(resp) {
			res.json(resp);
		});
	}
});

app.post('/', function(req, res) {

	var tp_cd_uor = req.param('tp_cd_uor');
	var segmento = req.param('segmento');
	var total = req.param('total');

	if(tp_cd_uor !=undefined && segmento !=undefined && total !=undefined){ 

		validator.trim(validator.escape(tp_cd_uor));
		validator.trim(validator.escape(segmento));
		validator.trim(validator.escape(total));

		userController.save(tp_cd_uor, segmento, total, function(resp) {
			res.json(resp);

			userController.listaAgencia(tp_cd_uor,function(ret){
				sendUpdate(tp_cd_uor,ret);
			});
		});		

	}else{
		res.json("Esta faltando parameto");
	}
});

app.put('/', function(req, res) {

	var tp_cd_uor = req.param('tp_cd_uor');
	var segmento = req.param('segmento');
	var total = req.param('total');

	if(tp_cd_uor !=undefined && segmento !=undefined && total !=undefined){ 

		validator.trim(validator.escape(tp_cd_uor));
		validator.trim(validator.escape(segmento));
		validator.trim(validator.escape(total));

		userController.update(tp_cd_uor, segmento, total, function(resp) {
			res.json(resp);

			userController.listaAgencia(tp_cd_uor,function(ret){
				sendUpdate(tp_cd_uor,ret);
			});
		});
		
	}else{
		res.json("Esta faltando parameto");
	}
	
});

app.delete('/', function(req, res) {

	var tp_cd_uor = req.param('tp_cd_uor');
	var segmento = req.param('segmento');	

	if(tp_cd_uor !=undefined && segmento !=undefined){ 

		validator.trim(validator.escape(tp_cd_uor));
		validator.trim(validator.escape(segmento));
		
		userController.delete(tp_cd_uor,segmento, function(resp) {
			res.json(resp);

			userController.listaAgencia(tp_cd_uor,function(ret){
				sendUpdate(tp_cd_uor,ret);
			});
		});
		
	}else{
		res.json("Esta faltando parameto");
	}
	
});

app.delete('/users/', function(req, res) {
	console.log("DELETE TODOS");
	userController.deleteTodos(function(resp) {
		res.json(resp);
	});
});

http.listen(3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

//Dispara evento para os ouvidores da sala
function sendUpdate(channelId, data) {
	io.to(channelId).emit('receivedUpdate', data);
}

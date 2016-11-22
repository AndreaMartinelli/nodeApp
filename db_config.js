var db_string= 'mongodb://127.0.0.1/Portal';
var mongoose = require('mongoose').connect(db_string);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'Erro ao conectar no banco'));
db.once('open', function() {

	var userSchema = mongoose.Schema({
		tp_cd_uor: String,
		segmento: String,
		total: String,
		created_at: Date
	});

	exports.User = mongoose.model('User', userSchema);
});
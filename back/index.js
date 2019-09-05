const express = require("express");
const bodyParser = require('body-parser');
const https = require('https');
const mysql = require('mysql')
const util = require('util')
const app = express();



const options = {
    user: 'root',
    password: 'qwerty',
    database: 'magicbot'
}
const connection = mysql.createConnection(options)

const queryPromise = util.promisify(connection.query).bind(connection);;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'null');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

connection.connect(err => {
    if (err) {
        console.error('An error occurred while connecting to the DB')
        throw err
    }
});

let respuesta = {
    error: false,
    codigo: 200,
    mensaje: ''
};

let cartas;

var getCards = function () {
    console.log("conecto a mysql");

    connection.connect(err => {
        if (err) {
            console.error('An error occurred while connecting to the DB')
            throw err
        }
    })
    console.log("obtengo cartas");
    https.get('https://api.scryfall.com/cards/search?order=name&q=set%3Am20+%28rarity%3Ar+OR+rarity%3Am%29e', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            cartas = JSON.parse(data)

            console.log("inserto las cartas");
            cartas.data.forEach(function (dato) {
                let color = {
                    U: false,
                    W: false,
                    G: false,
                    B: false,
                    R: false,
                }
                dato.colors.forEach(function (c) {
                    if (c == "W") {
                        color.W = true;
                    }
                    if (c == "U") {
                        color.U = true;
                    }
                    if (c == "G") {
                        color.G = true;
                    }
                    if (c == "B") {
                        color.B = true;
                    }
                    if (c == "R") {
                        color.R = true;
                    }
                });

                let carta = {
                    name: dato.name,
                    mtgo_id: dato.mtgo_id,
                    arena_id: dato.arena_id,
                    uri: dato.uri,
                    simage_uris: dato.image_uris.small,
                    nimage_uris: dato.image_uris.normal,
                    limage_uris: dato.image_uris.large,
                    mana_cost: dato.mana_cost,
                    cmc: dato.cmc,
                    power: dato.power,
                    toughness: dato.toughness,
                    set: dato.set,
                    rarity: dato.rarity,
                    type_line: dato.type_line,
                    colorw: color.W,
                    coloru: color.U,
                    colorg: color.G,
                    colorb: color.B,
                    colorr: color.R,
                }

                connection.query('INSERT INTO cards SET ?', carta, (error, results, fields) => {
                    if (error) {
                        console.error('An error occurred while executing the query')
                        throw error
                    }
                })
            });
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
    console.log("Termino");

    connection.end()
}

async function pickBooster(numbers) {
    console.log("4");
    console.log(numbers);
    return await queryPromise('SELECT id, nimage_uris FROM magicbot.cards where id in (' + numbers.join() + ')');
}

function pickNumbers(total) {

    var arr = []
    while (arr.length < 3) {
        var r = Math.floor(Math.random() * total[0].total) + 1;
        if (arr.indexOf(r) === -1) arr.push(r);
    }
    console.log("3");
    return arr;
}
async function pickTotal() {
    console.log("2");
    return await queryPromise('SELECT count(*) as total FROM cards');
}

app.get('/', function (req, res) {
    respuesta = {
        error: true,
        codigo: 200,
        mensaje: 'Punto de inicio'
    };

    res.send(respuesta);
});

app.get('/sendBooster', async function (req, res) {
    response = {
        error: true,
        codigo: 200,
        data: 'armar booster'
    };

    console.log("1");
    const totals = await pickTotal();
    const numbers = await pickNumbers(totals);
    const boosters = await pickBooster(numbers);
    
    // boosters.forEach(function (booster){
    //     console.log(booster.nimage_uris);

    // });

    respuesta.mensaje = boosters;

    res.send(respuesta);
});

app.get('getCards', function (req, res) {
    respuesta = {
        error: true,
        codigo: 200,
        mensaje: 'Punto de inicio'
    };

    //getCards();   //Comento por las dudas para no volver a obtener las mismas cartas.

    res.send(respuesta);
});
app.use(function (req, res, next) {
    respuesta = {
        error: true,
        codigo: 404,
        mensaje: 'URL no encontrada'
    };
    res.status(404).send(respuesta);
});
app.listen(3000, () => {
    console.log("El servidor está inicializado en el puerto 3000");
});












/*
app.get('/usuario', function (req, res) {
 respuesta = {
  error: false,
  codigo: 200,
  mensaje: ''
 };
 if(usuario.nombre === '' || usuario.apellido === '') {
  respuesta = {
   error: true,
   codigo: 501,
   mensaje: 'El usuario no ha sido creado'
  };
 } else {
  respuesta = {
   error: false,
   codigo: 200,
   mensaje: 'respuesta del usuario',
   respuesta: usuario
  };
 }
 res.send(respuesta);
});
app.post('/usuario', function (req, res) {
 if(!req.body.nombre || !req.body.apellido) {
  respuesta = {
   error: true,
   codigo: 502,
   mensaje: 'El campo nombre y apellido son requeridos'
  };
 } else {
  if(usuario.nombre !== '' || usuario.apellido !== '') {
   respuesta = {
    error: true,
    codigo: 503,
    mensaje: 'El usuario ya fue creado previamente'
   };
  } else {
      console.log(req);
   usuario = {
    nombre: req.body.nombre,
    apellido: req.body.apellido
   };
   respuesta = {
    error: false,
    codigo: 200,
    mensaje: 'Usuario creado',
    respuesta: usuario
   };
  }
 }

 res.send(respuesta);
});
app.put('/usuario', function (req, res) {
 if(!req.body.nombre || !req.body.apellido) {
  respuesta = {
   error: true,
   codigo: 502,
   mensaje: 'El campo nombre y apellido son requeridos'
  };
 } else {
  if(usuario.nombre === '' || usuario.apellido === '') {
   respuesta = {
    error: true,
    codigo: 501,
    mensaje: 'El usuario no ha sido creado'
   };
  } else {
   usuario = {
    nombre: req.body.nombre,
    apellido: req.body.apellido
   };
   respuesta = {
    error: false,
    codigo: 200,
    mensaje: 'Usuario actualizado',
    respuesta: usuario
   };
  }
 }

 res.send(respuesta);
});
app.delete('/usuario', function (req, res) {
 if(usuario.nombre === '' || usuario.apellido === '') {
  respuesta = {
   error: true,
   codigo: 501,
   mensaje: 'El usuario no ha sido creado'
  };
 } else {
  respuesta = {
   error: false,
   codigo: 200,
   mensaje: 'Usuario eliminado'
  };
  usuario = {
   nombre: '',
   apellido: ''
  };
 }
 res.send(respuesta);
});
*/

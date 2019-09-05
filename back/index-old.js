const express = require("express");
const bodyParser = require('body-parser');
const https = require('https');
const mysql = require('mysql')
const app = express();

const options = {
    user: 'root',
    password: 'qwerty',
    database: 'magicbot'
}
const connection = mysql.createConnection(options)

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

// var sendBooster = async function () {
//     console.log("0");

//     var arr = []
//     var total = 0;
//     var total = connection.query('SELECT count(*) as total FROM cards', await function (error, tot, fields) {
//         if (error) {
//           console.error('An error occurred while executing the query')
//           throw error
//         }

//         // total = tot;
//         console.log("1");

//     })
//     await console.log("2");

//     // while(arr.length < 3){
//     //     var r = Math.floor(Math.random()* total[0].total) + 1;
//     //     if(arr.indexOf(r) === -1) arr.push(r);
//     // }


//     // console.log(arr);
//     //connection.end();
// }

function pickCards(total) {

    var arr = []
    while (arr.length < 3) {
        var r = Math.floor(Math.random() * total[0].total) + 1;
        if (arr.indexOf(r) === -1) arr.push(r);
    }
    console.log("2");
    console.log(arr);
}

async function pickTotal() {

    // var arr = []
    // var total = 0;
    // var total = connection.query('SELECT count(*) as total FROM cards', await function (error, tot, fields) {
    //     if (error) {
    //       console.error('An error occurred while executing the query')
    //       throw error
    //     }

    //     // total = tot;
    //     console.log("1");

    // })

    return new Promise(resolve => {
        connection.query('SELECT count(*) as total FROM cards', (error, tot, fields) => resolve(tot))
    })

    return new Promise(function (resolve) {
        connection.query('SELECT count(*) as total FROM cards', (error, tot, fields) => resolve(tot))
    })

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
    respuesta = {
        error: true,
        codigo: 200,
        mensaje: 'armar booster'
    };

    console.log("1");
    const totals = await pickTotal();
    console.log(totals);
    // const booster = await pickCards(totals); 
    console.log("3");

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

'use strict';

module.exports = function(Usuario) {
    var app = require('../../server/server.js');

    // Operaciones básicas.

    Usuario.crearFolder = function (nombre, padreId , options, cb)  {
       

        let usuarioId = options.accessToken.userId;
        let and = [{ usuarioId: usuarioId}, {nombre: nombre}, {padre: padreId}];
        let Folder = app.models.Folder;
        console.log(options.accessToken);

        Folder.findOne({where: {and: and}}, function(err, folder){
            if(folder)
                cb('El folder ya existe');
            else {
                let nuevoFolder = {
                    nombre: nombre,
                    usuarioId: usuarioId,
                    padre: padreId
                };

                Folder.create(nuevoFolder, function(err, folder) {
                    if(err)
                        cb(err);
                    else {
                        cb(null, folder);
                    }
                });
            }
        });
    } 

    Usuario.remoteMethod('crearFolder',{
        http: {verb: 'post', path: '/crear-folder'},
        accepts: [
            {arg: 'nombre', type: 'string', http: {source: 'form'}, required: false},
            {arg: 'padreId', type: 'string', http: {source: 'form'}, required: false},
            {arg: 'options', type: 'object', http: 'optionsFromRequest', required: true}
        ],
        returns: {arg: 'result', type: 'string'}
    });

    Usuario.crearFoto = function (nombre, folderId, options, cb) {
        let Foto = app.models.Foto;
        let Folder = app.models.Folder;
        let usuarioId = options.accessToken.userId;

        let and = [ {folderId: folderId}, {nombre: nombre} ];
        Folder.findById(folderId, {where: {userId: usuarioId}}, function(err, folder) {
            if(err || !folder)
                cb(err ? 'Error encontrando folder': 'Folder no encontrado');
            else {
                Foto.findOne({where: {and: and} }, function (err, foto) {
                    if(err || foto)
                        cb( err ? 'Error buscando foto' : 'Foto ya existente');
                    else {
                        var nuevaFoto = {
                            nombre: nombre,
                            folderId: folderId,
                            idUnico: new Date().getTime().toString(),
                            usuarioId: usuarioId
                        };
                        
                        Foto.create(nuevaFoto, function(err, foto) {
                            console.log("aqui andentro: ", nuevaFoto);
                            console.log("err: ", err);
                            if(err)
                                cb(err);
                            else {
                                cb(null, nuevaFoto.idUnico.toString() );
                            }
                        });
                    }
                });
            }
        });
        
    }

    Usuario.remoteMethod('crearFoto',{
        http: {verb: 'post', path: '/crear-foto'},
        accepts: [
            {arg: 'nombre', type: 'string', http: {source: 'form'}, required: true},
            {arg: 'folderId', type: 'string', http: {source: 'form'}, required: true},
            {arg: 'options', type: 'object', http: 'optionsFromRequest', required: true}
        ],
        returns: {arg: 'result', type: 'string'}
    });
};

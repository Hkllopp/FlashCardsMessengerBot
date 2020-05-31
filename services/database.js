/**
 * Copyright 2019-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger For Original Coast Clothing
 * https://developers.facebook.com/docs/messenger-platform/getting-started/sample-apps/original-coast-clothing
 */

"use strict";

const mysql = require('mysql'),
  promMysql = require('promise-mysql');

module.exports = class Database {
    constructor(host, user, password, database) {
        this.host = host;
        this.user = user;
        this.password = password;
        this.database = database;
      }


    testConnection() {
        var connection = mysql.createConnection({
            host     : this.host,
            user     : this.user,
            password : this.password,
            database : this.database
          });
           
          connection.connect();
           
          connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
            if (error) throw error;
            console.log('The solution is: ', results[0].solution);
          });
           
          connection.end();
    }
    
    async insertCardInDB(user)
    {
      let query = "INSERT INTO Card(Question,Answer,User) VALUES (\"" + 
      user.cardQuestion + "\",\""+
      user.cardAnswer + "\",(SELECT id FROM User WHERE FbId = "+
      user.psid + "));";

      console.log(query);
      let promise = await this.promisedQuery(query);
      console.log("Insertion de la carte réussie du user :",user.psid);
    }

    async getUsersTrainingSettings()
    {
      let query = "SELECT FbId,Frequency FROM User;";
      console.log(query);
      let promise = await this.promisedQuery(query);
      return promise;
    }

    async insertFrequencyInDB(user)
    {
      let query = "UPDATE User SET Frequency=\"" + 
      user.cardQuestion + "\" WHERE FbId ="+user.psid;

      console.log(query);
      let promise = await this.promisedQuery(query);
      console.log("Insertion de la carte réussie du user :",user.psid);
    }

    async promisedCheckUserInDB(userID){
      let query = "SELECT Id, FbId FROM User WHERE FbId LIKE \"" + userID + "\";";
      let promise = await this.promisedQuery(query);
      console.log(promise);
      if (promise.length > 0)
      {
        return true;
      }
      else{
        return false;
      }
    }

    async promisedMakeSureUserInDB(userID)
    {
      let inDB = await this.promisedCheckUserInDB(userID);
      console.log("l'utilisateur est il enregistré dans la database ?", inDB);
      if (!inDB)
      {
        // User non trouvé dans la BD, il faut donc en créer un !
        console.log("USER NON TROUVE DANS LA BD !");
        let query = "INSERT INTO User(FbId) VALUES (\"" + userID + "\");";
        console.log(query);
        let promise = await this.promisedQuery(query);
      }
      else
      {
        console.log("USER TROUVE DANS LA BD !");
      }
      return ("Done");
    }

    async promisedQuery(query){
      try {
        const connection = mysql.createConnection({  
          host     : this.host,
          user     : this.user,
          password : this.password,
          database : this.database
        });

        return new Promise(function(resolve, reject) {
            connection.connect(function(err) {
                if (err) reject(err);

                connection.query(query, function (err, result) {
                    if (err) reject(err);
                    connection.end();
                    resolve(JSON.parse(JSON.stringify(result)));
                });
            });
        });
    } catch {
        console.error("async err: " + err);
    }
    }   
  }
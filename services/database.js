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

const mysql = require('mysql');

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

    query(query)
    {
        var connection = mysql.createConnection({
            host     : this.host,
            user     : this.user,
            password : this.password,
            database : this.database
          });
           
          connection.connect();
           
          var results = connection.query(query, function (error, results, fields) {
            if (error) throw error;
            console.log('The query returns: ');
            console.log(results);
          }).results;
           
          connection.end();
          return results;
    }
    

    }
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

const config = require("./config"),
schedule = require("node-schedule"),
Receive = require("./receive"),
Database = require('./database'); 
  

module.exports = class Job {
    constructor(user) {
        this.user = user;
      }


      async createUsersJobs()
      {
        let db = new Database(config.dbHost,config.dbUser,config.dbPassword,config.dbName);
        let responsePromise  = db.getUsersTrainingSettings();
        let response  = await responsePromise;
        
        for (let userSetting of response)
        {
          let userId = userSetting.FbId;
          let jobName = "job" + userId; // Every jobs created from users settings in db will be called "job" + [userId] as it'll be unique
          let userFrequency = userSetting.Frequency;
          schedule.scheduleJob(
            jobName,
            userFrequency,
            function sendTrainingMessage()
              {
                let myResponse = new Receive(
                  {
                    psid:userId
                  },
                  {
                    sender: { id: userId },
                    recipient: { id: '105721614427415' },
                    message: {
                      quick_reply: { payload: 'ASK_TRAINING' }
                    }
                  }
                  );
                myResponse.handleMessage()
              });
        }
      }
    }
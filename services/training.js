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

// Imports dependencies
const Response = require("./response"),
  config = require("./config"),
  i18n = require("../i18n.config"),
  Database = require("./database");

module.exports = class Training {
  constructor(user, webhookEvent) {
    this.user = user;
    this.webhookEvent = webhookEvent;
  }

  handlePayload(payload) {
    let response;
    this.user.nextPayload = "";
    switch (payload) {
      case "ASK_TRAINING"://SCHEDULED_ASKING
        response = [
          Response.genText(
            i18n.__("training.welcome", {
              userFirstName: this.user.firstName
            })
          ),
          Response.genText(i18n.__("training.askingReady"))
        ].concat(trainingMenu);
        this.user.nextPayload = "";
        break;
      case "START_TRAINING":
        //Commencer l'entrainement
        this.user.nextPayload = "";
        break;
      case "TRAINING_SETTINGS":
        //Paramètres des entrainements
        response = [
          Response.genQuickReply(i18n.__("training.Asking"), [
            {
              title: i18n.__("training.frequencySettings"),
              payload: "TRAINING_FREQUENCY"
            },
            {
              title: i18n.__("training.StopOption"),
              payload: "TRAINING_STOP"
            },
            {
              title: i18n.__("training.trainingSetSizeOption"),
              payload: "TRAINING_SET_SIZE"
            },
            {
              title: i18n.__("training.BackToMenu"),
              payload: "TRAINING_BACK_MENU"
            }
          ])
        ];
        this.user.nextPayload = "";
        break;
      case "TRAINING_BACK_MENU":
        response = [
          Response.genText(i18n.__("training.back_menu_guidance"))
        ].concat(trainingMenu);
        this.user.nextPayload = "";
      break;
      case "TRAINING_FREQUENCY":
        response = [
          Response.genText(i18n.__("training.FrequencyAsking")),
          Response.genQuickReply(i18n.__("training.back_menu_proposition"), [
            {
              title: i18n.__("training.BackToMenu"),
              payload: "TRAINING_BACK_MENU"
            }
          ])
        ];
        this.user.nextPayload = "TRAINING_FREQUENCY_ACQUIRED";
        break;
      case "TRAINING_FREQUENCY_ACQUIRED":
        // Insertion de la fréquence
        this.user.cardQuestion = this.webhookEvent.message.text;
        try{
          let dbConnection = new Database(config.dbHost,config.dbUser,config.dbPassword,config.dbName);
          dbConnection.insertFrequencyInDB(this.user);
        } catch (err) {
          console.log("Insertion frequency failed:", err);
        }
        this.user.cardAnswer = this.webhookEvent.message.text;
        response = [
          Response.genText(i18n.__("training.FrequencyAcquired")),
          Response.genText(i18n.__("training.back_menu_guidance"))
        ].concat(trainingMenu);
        this.user.nextPayload = "";
        break;
      case "TRAINING_STOP":
        try{
          let dbConnection = new Database(config.dbHost,config.dbUser,config.dbPassword,config.dbName);
          let newUser = this.user;
          newUser.cardQuestion = "0 0 5 31 2 ?";
          dbConnection.insertFrequencyInDB(newUser);
        } catch (err) {
          console.log("Insertion frequency failed:", err);
        }
        response = [
          Response.genText(i18n.__("training.Stop")),
          Response.genText(i18n.__("training.back_menu_guidance"))
        ].concat(trainingMenu);
        this.user.nextPayload = "";
        break;
    }
    return {
      message : response,
      user : this.user
    };
  }
}

let trainingMenu = [
  Response.genQuickReply(i18n.__("training.guidance"), [
    {
      title: i18n.__("training.startTraining"),
      payload: "START_TRAINING"
    },
    {
      title: i18n.__("training.cardsManager"),
      payload: "CARDS_MANAGER"
    },
    {
      title: i18n.__("training.options"),
      payload: "TRAINING_SETTINGS"
    }
  ])];

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
  Receive = require("./receive"),
  config = require("./config"),
  i18n = require("../i18n.config"),
  Database = require("./database");

module.exports = class Cards {
    constructor(user, webhookEvent) {
        this.user = user;
        this.webhookEvent = webhookEvent;
      }

  handlePayload(payload) {
    console.log("type de receive : ");
    console.log(typeof Receive);
    let response;
    this.user.nextPayload = "";
    switch (payload) {
      case "CARDS_MANAGER":
        response = cardsManagerMenu;
        this.user.nextPayload = "";
          break;
      case "CARDS_ADD":
        response = [
          Response.genText(i18n.__("cards_manager.ask_question")),
          Response.genQuickReply(i18n.__("cards_manager.back_menu_proposition"), [
            {
              title: i18n.__("cards_manager.back_menu"),
              payload: "CARDS_MANAGER"
            }
          ])
        ];
        this.user.nextPayload = "CARDS_QUESTION";
        // Demander à l'utilisateur une question
        // Demander à l'utilisateur une réponse
        // Insérer la carte
        break;
      case "CARDS_REMOVE":
        // Afficher une liste des cartes (questions avec les id)
        // Demander l'ID
        // Supprimer la carte
        break;
      case "CARDS_EDIT":
        // Afficher une liste des cartes (questions avec les id)
        // Demander l'ID
        // Afficher la question et la réponse de la carte
        // Demander qu'est-ce qui est à modifier
        // Demander la réponse/la question
        // Edit la carte 
        break;
      case "CARDS_BACK":
        // Revenir au menu principal
        response = [
          Response.genText(i18n.__("training.back_menu")),
          Response.genQuickReply(i18n.__("training.choices"), [
            {
              title: i18n.__("training.trainingSession"),
              payload: "START_TRAINING"
            },
            {
              title: i18n.__("training.cardsManager"),
              payload: "CARDS_MANAGER"
            },
            {
              title: i18n.__("training.options"),
              payload: "TRAINING_SETTINGS"
            }]
          )];
          this.user.nextPayload = "";
        
        break;
      case "CARDS_QUESTION":
        this.user.cardQuestion = this.webhookEvent.message.text;
        response = [
          Response.genText(i18n.__("cards_manager.question_acquired")),
          Response.genText(i18n.__("cards_manager.ask_answer")),
          Response.genQuickReply(i18n.__("cards_manager.back_menu_proposition"), [
            {
              title: i18n.__("cards_manager.back_menu"),
              payload: "CARDS_MANAGER"
            }
          ])
        ];
        this.user.nextPayload = "CARDS_ANSWER";
        break;
      case "CARDS_ANSWER":
        this.user.cardAnswer = this.webhookEvent.message.text;
        response = [
          Response.genText(i18n.__("cards_manager.answer_acquired")),
          Response.genQuickReply(i18n.__("cards_manager.back_menu_forced"), [
            {
              title: i18n.__("cards_manager.confirm_card_back_menu"),
              payload: "CARDS_SUBMIT_CARD"
            },
            {
              title: i18n.__("cards_manager.discard_card_back_menu"),
              payload: "CARDS_DISCARD_CARD"
            },
          ])
        ];
        this.user.nextPayload = "";
        break;
      case "CARDS_SUBMIT_CARD":
        try{
          let dbConnection = new Database(config.dbHost,config.dbUser,config.dbPassword,config.dbName);
          dbConnection.insertCardInDB(this.user);
        } catch (err) {
          console.log("Insertion card failed:", err);
        }
        response = [
          Response.genText(i18n.__("cards_manager.confirm_submitted_card")),
          Response.genText(i18n.__("cards_manager.back_menu_guidance"))
        ].concat(cardsManagerMenu);
          console.log("reponse =");
          console.log(response);
          this.user.nextPayload = "";
          
          break;
      case "CARDS_DISCARD_CARD":
        this.user.cardAnswer = "";
        this.user.cardQuestion = "";
        response = [
          Response.genText(i18n.__("cards_manager.confirm_discard_card")),
          Response.genText(i18n.__("cards_manager.back_menu_guidance"))
        ].concat(cardsManagerMenu);
          this.user.nextPayload = "";
          break;
    }
    let retour ={
      message : response,
      user : this.user
    };
    //console.log("retourné par Cards :");
    //console.log(retour);
    return retour;
  }
}

let cardsManagerMenu = [
  Response.genText(i18n.__("cards_manager.welcome")),
  Response.genQuickReply(i18n.__("cards_manager.ask_user"), [
    {
      title: i18n.__("cards_manager.add_card"),
      payload: "CARDS_ADD"
    },
    {
      title: i18n.__("cards_manager.remove_card"),
      payload: "CARDS_REMOVE"
    },
    {
      title: i18n.__("cards_manager.edit_card"),
      payload: "CARDS_EDIT"
    },
    {
      title: i18n.__("cards_manager.back_menu"),
      payload: "CARDS_BACK"
    }
  ]
)];


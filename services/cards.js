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
  i18n = require("../i18n.config");

module.exports = class Cards {
    constructor(user, webhookEvent) {
        this.user = user;
        this.webhookEvent = webhookEvent;
      }

  handlePayload(payload) {
    let response;
    this.user.nextPayload = "";
    switch (payload) {
      case "CARDS_MANAGER":
        response = [
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
          ])
        ];
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
        response = [
          Response.genText(i18n.__("menu.back_menu")),
          Response.genQuickReply(i18n.__("menu.choices"), [
            {
              title: i18n.__("menu.trainingSession"),
              payload: "START_TRAINING"
            },
            {
              title: i18n.__("menu.skipTraining"),
              payload: "SKIP_TRAINING"
            },
            {
              title: i18n.__("menu.cardsManager"),
              payload: "CARDS_MANAGER"
            },
            {
              title: i18n.__("menu.options"),
              payload: "TRAINING_SETTINGS"
            }]
          )];
          this.user.nextPayload = "";
        // Revenir au menu principal
        break;
      case "CARDS_QUESTION":
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
        response = [
          Response.genText(i18n.__("cards_manager.answer_acquired")),
          Response.genQuickReply(i18n.__("cards_manager.back_menu_proposition"), [
            {
              title: i18n.__("cards_manager.confirm_card_back_menu"),
              payload: "CARDS_MANAGER"
              //Insérer la carte
            },
            {
              title: i18n.__("cards_manager.discard_card_back_menu"),
              payload: "CARDS_MANAGER"
            },
          ])
        ];
        this.user.nextPayload = "";
        break;
    }
    let retour ={
      message : response,
      user : this.user
    };
    console.log("retourné par Cards :");
    console.log(retour);
    return retour;
  }
};

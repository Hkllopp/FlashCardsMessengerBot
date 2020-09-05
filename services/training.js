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
const { response } = require("express");

module.exports = class Training {
  constructor(user, webhookEvent) {
    this.user = user;
    this.webhookEvent = webhookEvent;
    this.activeCard = {};
  }

  async generate(type)
  {
    let trainingSet = this.user.trainingSet;
    let number = this.user.trainingCard;
    let cardId = trainingSet[number].cardId;
    let dbConnection = new Database(config.dbHost,config.dbUser,config.dbPassword,config.dbName);
    let card = (await dbConnection.getCard(cardId))[0];
    let response;
    if (type == "question")
      {
        response = card.Question;
      }
    else if (type == "answer"){
      response = card.Answer;
    }
    else
    {
      console.log("Error generating in Training.generate");
    }
    return response;
  }

  async handlePayload(payload) {
    let card;
    let probability;
    let dbConnection = new Database(config.dbHost,config.dbUser,config.dbPassword,config.dbName);
    let response = [];
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
        response = [
          // Response.genText(i18n.__("training.training_generation"))
        ];
        break;
      case "TRAINING_USER_WAITING":        
        //Annoncer les règles
        let trainingSet = await dbConnection.buildUserTrainingSet(this.user);
        this.user.trainingCard = 0;
        this.user.trainingSet = trainingSet;

        this.user.nextPayload = "TRAINING_CANCEL";
        response = [
          Response.genQuickReply(i18n.__("training.rules"), [
            {
              title: i18n.__("training.start_training"),
              payload: "TRAINING_SHOW_QUESTION"
            },
            {
              title: i18n.__("training.cancel_training"),
              payload: "TRAINING_CANCEL"
            }
          ])
        ];
        break;
      case "TRAINING_SHOW_QUESTION":
        //Afficher une carte
        this.user.nextPayload = "TRAINING_CANCEL";
        let card_question = await this.generate("question");
          response = [
            Response.genQuickReply(card_question, [//Mettre ici la question de la carte
              {
                title: i18n.__("training.show_answer"),
                payload: "TRAINING_SHOW_ANSWER"
              },
              {
                title: i18n.__("training.cancel_training"),
                payload: "TRAINING_CANCEL"
              }
            ])
          ];
          break;
      case "TRAINING_SHOW_ANSWER":
        //Montrer la réponse
        this.user.nextPayload = "TRAINING_CANCEL";
        response = [
          Response.genText(await this.generate("answer")),
          Response.genQuickReply(i18n.__("training.ask_remembrance"), [
            {
              title: i18n.__("training.weak_remembrance"),
              payload: "TRAINING_WEAK_REMEMBRANCE"
            },
            {
              title: i18n.__("training.medium_remembrance"),
              payload: "TRAINING_MEDIUM_REMEMBRANCE"
            },
            {
              title: i18n.__("training.strong_remembrance"),
              payload: "TRAINING_STRONG_REMEMBRANCE"
            },
            {
              title: i18n.__("training.cancel_training"),
              payload: "TRAINING_CANCEL"
            }
          ])
        ];
        break;
        case "TRAINING_WEAK_REMEMBRANCE":
          // Update la carte pour augmenter sa probbailité
          card = dbConnection.getCard(this.user.trainingCard);
          probability = card.Probability + 0.5;
          dbConnection.updateCardProbability(card.ID, probability);
          // Passer à la carte suivante
          this.user.trainingCard += 1;
          // Vérifie si l'entrainement est fini (si c'est le cas, envoi entrainement fini + back menu)
          if (this.user.trainingCard >= this.user.trainingSet.length)
          {
            this.user.trainingCard = 0;
            this.handlePayload("TRAINING_FINISHED");
          }
          else
          {
            // Montrer la prochaine carte
            this.handlePayload("TRAINING_SHOW_QUESTION");
          }
          break;
        case "TRAINING_MEDIUM_REMEMBRANCE":
          this.user.trainingCard += 1;
          if (this.user.trainingCard >= this.user.trainingSet.length)
          {
            this.user.trainingCard = 0;
            this.handlePayload("TRAINING_FINISHED");
          }
          else
          {
            this.handlePayload("TRAINING_SHOW_QUESTION");
          }
          break;
        case "TRAINING_STRONG_REMEMBRANCE":
          card = dbConnection.getCard(this.user.trainingCard);
          probability = card.Probability - 0.5;
          if (probability < 0)
          {
            probability = 0;
          }
          dbConnection.updateCardProbability(card.ID, probability);
          this.user.trainingCard += 1;
          if (this.user.trainingCard >= this.user.trainingSet.length)
          {
            this.user.trainingCard = 0;
            this.handlePayload("TRAINING_FINISHED");
          }
          else
          {
            this.handlePayload("TRAINING_SHOW_QUESTION");
          }
          break; 
      case "TRAINING_FINISHED":
        this.user.nextPayload = "";
        response = [
          Response.genText(i18n.__("training.training_finished"))
        ].concat(trainingMenu);
        break;
      case "TRAINING_CANCEL":
        //Abandonner l'entrainement
        this.user.nextPayload = "";
        this.user.trainingCard = 0;
        response = trainingMenu;
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

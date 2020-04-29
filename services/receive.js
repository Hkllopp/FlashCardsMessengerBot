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

const Curation = require("./curation"),
  Training = require("./training"),
  Cards = require("./cards"),
  Order = require("./order"),
  Response = require("./response"),
  Care = require("./care"),
  Survey = require("./survey"),
  GraphAPi = require("./graph-api"),
  i18n = require("../i18n.config"),
  Database = require("./database");


module.exports = class Receive {
  constructor(user, webhookEvent) {
    this.user = user;
    this.webhookEvent = webhookEvent;
  }

  // Check if the event is a message or postback and
  // call the appropriate handler function
  handleMessage() {
    let event = this.webhookEvent;

    let responses;

    try {
      if (event.message) {
        let message = event.message;
        //console.log("message");
        //console.log(message);

        if (message.quick_reply) {
          // Automatic responses
          responses = this.handleQuickReply();
        } else if (message.attachments) {
          responses = this.handleAttachmentMessage();
        } else if (message.text) {
          responses = this.handleTextMessage();
        }
      } else if (event.postback) {
        responses = this.handlePostback();
        //Postbacks occur when a postback button, Get Started button, or persistent menu item is tapped.
      } else if (event.referral) {
        responses = this.handleReferral();
        /*This callback will occur when the user already has a thread with the bot and user comes to the thread from:
        Following an m.me link with a referral parameter
        Clicking on a Messenger Conversation Ad
        Scanning a parametric Messenger Code.
        Starting a conversation from the Discover tab.
        Starting or resuming a conversation from the customer chat plugin.*/
      }
    } catch (error) {
      console.error(error);
      messages = {
        text: `An error has occured: '${error}'. We have been notified and \
        will fix the issue shortly!`
      };
    }
    let messages = responses.message;
    console.log(messages);
    if (Array.isArray(messages)) {
      let delay = 0;
      for (let message of messages) {
        this.sendMessage(message, delay * 2000);
        delay++;
      }
    } else {
      this.sendMessage(messages);
    }
    return responses;
  }

  // Handles messages events with text
  handleTextMessage() {
    console.log(
      "Received text:",
      `${this.webhookEvent.message.text} for ${this.user.psid}`
    );
    /* Check if the reply was "expected" and if so, binds it a payload */
    if (this.user.nextPayload!=""){
      console.log("checkpoint");
      console.log("Received Payload:", `${this.user.nextPayload}`);
      let message = this.handlePayload(this.user.nextPayload);
      return message;
    }
      else{
      // check greeting is here and is confident
      let greeting = this.firstEntity(this.webhookEvent.message.nlp, "greetings");

      let message = this.webhookEvent.message.text.trim().toLowerCase();

      let response;

      if (
        (greeting && greeting.confidence > 0.8) ||
        message.includes("start over")
      ) {
        //Recommence la boucle de dialogue
        response = Response.genNuxMessage(this.user);
        /*} else if (Number(message)) {
        response = Order.handlePayload("ORDER_NUMBER");
      } else if (message.includes("#")) {
        response = Survey.handlePayload("CSAT_SUGGESTION");
      } else if (message.includes(i18n.__("care.help").toLowerCase())) {
        let care = new Care(this.user, this.webhookEvent);
        response = care.handlePayload("CARE_HELP");*/
      } else {
        response = [
          Response.genText(
            i18n.__("fallback.any", {
              message: this.webhookEvent.message.text
            })
          ),
          Response.genText(i18n.__("get_started.guidance")),
          Response.genQuickReply(i18n.__("get_started.help"), [
            {
              title: i18n.__("menu.trainingSession"),
              payload: "TRAINING_SESSION"
            },
            {
              title: i18n.__("menu.cardsManager"),
              payload: "CARDS_MANAGER" //Insérer ici le payload, menu que ca génère
            },
            {
              title: i18n.__("menu.options"),
              payload: "TRAINING_SETTINGS"
            }
          ])
        ];
      }
      return {
        message : response,
        nextPayload : ""
      };
    }
  }

  // Handles mesage events with attachments
  handleAttachmentMessage() {
    let response;

    // Get the attachment
    let attachment = this.webhookEvent.message.attachments[0];
    console.log("Received attachment:", `${attachment} for ${this.user.psid}`);

    response = Response.genQuickReply(i18n.__("fallback.attachment"), [
      {
        title: i18n.__("menu.help"),
        payload: "CARE_HELP"
      },
      {
        title: i18n.__("menu.start_over"),
        payload: "GET_STARTED"
      }
    ]);

    return {
        message: response,
        nextPayload: ""
      };
  }

  // Handles mesage events with quick replies
  handleQuickReply() {
    // Get the payload of the quick reply
    let payload = this.webhookEvent.message.quick_reply.payload;
    console.log("le payload est :");
    console.log(payload);
    return this.handlePayload(payload);
  }

  // Handles postbacks events
  handlePostback() {
    let postback = this.webhookEvent.postback;
    // Check for the special Get Starded with referral
    let payload;
    if (postback.referral && postback.referral.type == "OPEN_THREAD") {
      payload = postback.referral.ref;
    } else {
      // Get the payload of the postback
      payload = postback.payload;
    }
    return this.handlePayload(payload.toUpperCase());
  }

  // Handles referral events
  handleReferral() {
    // Get the payload of the postback
    let payload = this.webhookEvent.referral.ref.toUpperCase();

    return this.handlePayload(payload);
  }

  handlePayload(payload) {
    console.log("Received Payload:", `${payload} for ${this.user.psid}`);

    // Log CTA event in FBA
    GraphAPi.callFBAEventsAPI(this.user.psid, payload);

    let response;

    // Set the response based on the payload
    if (
      payload === "GET_STARTED" ||
      payload === "DEVDOCS" ||
      payload === "GITHUB"
    ) {
      response = Response.genNuxMessage(this.user);
    } else if (payload.includes("TRAINING")) {
      let training = new Training(this.user, this.webhookEvent);
      response = training.handlePayload(payload);
    } else if (payload.includes("CARDS")) {
      let cards = new Cards(this.user, this.webhookEvent);
      response = cards.handlePayload(payload);
    } else {
      /*else if (payload.includes("CURATION") || payload.includes("COUPON")) {
      let curation = new Curation(this.user, this.webhookEvent);
      response = curation.handlePayload(payload);
    } else if (payload.includes("CARE")) {
      let care = new Care(this.user, this.webhookEvent);
      response = care.handlePayload(payload);
    } else if (payload.includes("ORDER")) {
      response = Order.handlePayload(payload);
    } else if (payload.includes("CSAT")) {
      response = Survey.handlePayload(payload);
    } else if (payload.includes("CHAT-PLUGIN")) {
      response = [
        Response.genText(i18n.__("chat_plugin.prompt")),
        Response.genText(i18n.__("get_started.guidance")),
        Response.genQuickReply(i18n.__("get_started.help"), [
          {
            title: i18n.__("care.order"),
            payload: "CARE_ORDER"
          },
          {
            title: i18n.__("care.billing"),
            payload: "CARE_BILLING"
          },
          {
            title: i18n.__("care.other"),
            payload: "CARE_OTHER"
          }
        ])
      ];
    }*/
      response = {
        text: `This is a default postback message for payload: ${payload}!`
      };
    }
    return response;
  }

  handlePrivateReply(type, object_id) {
    let welcomeMessage =
      i18n.__("get_started.welcome") +
      " " +
      i18n.__("get_started.guidance") +
      ". " +
      i18n.__("get_started.help");

    let response = Response.genQuickReply(welcomeMessage, [
      {
        title: i18n.__("menu.suggestion"),
        payload: "CURATION"
      },
      {
        title: i18n.__("menu.help"),
        payload: "CARE_HELP"
      }
    ]);

    let requestBody = {
      recipient: {
        [type]: object_id
      },
      message: response
    };

    GraphAPi.callSendAPI(requestBody);
  }

  sendMessage(response, delay = 0) {
    // Check if there is delay in the response
    if ("delay" in response) {
      delay = response["delay"];
      delete response["delay"];
    }

    // Construct the message body
    let requestBody = {
      recipient: {
        id: this.user.psid
      },
      message: response
    };

    // Check if there is persona id in the response
    if ("persona_id" in response) {
      let persona_id = response["persona_id"];
      delete response["persona_id"];

      requestBody = {
        recipient: {
          id: this.user.psid
        },
        message: response,
        persona_id: persona_id
      };
    }

    setTimeout(() => GraphAPi.callSendAPI(requestBody), delay);
  }

  firstEntity(nlp, name) {
    return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
  }

  getReplyPayload(uid)
  {
    let db = new Database(config.dbHost,config.dbUser,config.dbPassword,config.dbName);
    let query = "SELECT NextPayload FROM User WHERE FbId LIKE" +  uid.toString;
    let response  = db.query(query);
    console.log(response);
  }
};

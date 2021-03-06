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

const Training = require("./training"),
  Cards = require("./cards"),
  Response = require("./response"),
  GraphAPi = require("./graph-api"),
  i18n = require("../i18n.config"),
  Database = require("./database");


 class Receive {
  constructor(user, webhookEvent) {
    this.user = user;
    this.webhookEvent = webhookEvent;
  }


  // Check if the event is a message or postback and
  // call the appropriate handler function
  async handleMessage() {
    console.log("received message");
    console.log(this.webhookEvent);
    let event = this.webhookEvent;

    let value, responses;

    try {
      if (event.message) {
        let message = event.message;
        //console.log("message");
        //console.log(message);

        if (message.quick_reply) {
          // Automatic responses
          value = await this.handleQuickReply();
          //console.log("recu par receive (handleMessage) de handleQuickReply");
          //console.log(value);
          responses = value.message;
          this.user = value.user;
        } else if (message.attachments) {
          value = await this.handleAttachmentMessage();
          //console.log("recu par receive (handleMessage) de handleAttachmentMessage");
          //console.log(value);
          responses = value.message;
          this.user = value.user;
        } else if (message.text) {
          value = await this.handleTextMessage();
          responses = value.message;
          this.user = value.user;
          //console.log("recu par receive (handleMessage) de handleTextMessage");
          //console.log(value);
        }
      } else if (event.postback) {
        responses = await this.handlePostback();
        //Postbacks occur when a postback button, Get Started button, or persistent menu item is tapped.
      } else if (event.referral) {
        responses = await this.handleReferral();
        /*This callback will occur when the user already has a thread with the bot and user comes to the thread from:
        Following an m.me link with a referral parameter
        Clicking on a Messenger Conversation Ad
        Scanning a parametric Messenger Code.
        Starting a conversation from the Discover tab.
        Starting or resuming a conversation from the customer chat plugin.*/
      }
    } catch (error) {
      console.error(error);
      responses = {
        text: `An error has occured: '${error}'. We have been notified and \
        will fix the issue shortly!`
      };
    }
    if (Array.isArray(responses)) {
      let delay = 0;
      for (let message of responses) {
        this.sendMessage(message, delay * 1000); // At the origin, it was *2000
        delay++;
      }
    } else {
      this.sendMessage(responses);
    }
    let retour ={
      message : responses,
      user : this.user
    };
    //console.log("retourné par Receive (handleMessage) :");
    //console.log(retour);
    return retour;
  }

  // Handles messages events with text
  async handleTextMessage() {
    console.log(
      "Received text:",
      `${this.webhookEvent.message.text} for ${this.user.psid}`
    );
    /* Check if the reply was "expected" and if so, binds it a payload */
    if (this.user.nextPayload!=""){
      console.log("checkpoint");
      console.log("Received Payload:", `${this.user.nextPayload}`);
      let message = await this.handlePayload(this.user.nextPayload);
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
              title: i18n.__("training.trainingSession"),
              payload: "START_TRAINING"
            },
            {
              title: i18n.__("training.cardsManager"),
              payload: "CARDS_MANAGER" //Insérer ici le payload, menu que ca génère
            },
            {
              title: i18n.__("training.options"),
              payload: "TRAINING_SETTINGS"
            }
          ])
        ];
      }
      let retour ={
        message : response,
        user : this.user
      };
      //console.log("retourné par Receive (handleTextMessage) :");
      //console.log(retour);
      return retour;
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

    let retour ={
      message : response,
      user : this.user
    };
    //console.log("retourné par Receive (handleAttachmentMessage) :");
    //console.log(retour);
    return retour;
  }

  // Handles mesage events with quick replies
  async handleQuickReply() {
    // Get the payload of the quick reply
    let payload = this.webhookEvent.message.quick_reply.payload;
    console.log("le payload est :");
    console.log(payload);
    return await this.handlePayload(payload);
  }

  // Handles postbacks events
  async handlePostback() {
    let postback = this.webhookEvent.postback;
    // Check for the special Get Starded with referral
    let payload;
    if (postback.referral && postback.referral.type == "OPEN_THREAD") {
      payload = postback.referral.ref;
    } else {
      // Get the payload of the postback
      payload = postback.payload;
    }
    return await this.handlePayload(payload.toUpperCase());
  }

  // Handles referral events
  async handleReferral() {
    // Get the payload of the postback
    let payload = this.webhookEvent.referral.ref.toUpperCase();

    return await this.handlePayload(payload);
  }

  async handlePayload(payload) {
    console.log("Received Payload:", `${payload} for ${this.user.psid}`);

    // Log CTA event in FBA
    GraphAPi.callFBAEventsAPI(this.user.psid, payload);

    let value,response;

    // Set the response based on the payload
    if (
      payload === "GET_STARTED" ||
      payload === "DEVDOCS" ||
      payload === "GITHUB"
    ) {
      response = Response.genNuxMessage(this.user);
    } else if (payload.includes("TRAINING")) {
      let training = new Training(this.user, this.webhookEvent);
      value = await training.handlePayload(payload);
      console.log("retourné :");
      console.log(value);
      this.user = value.user;
      response = value.message;
    } else if (payload.includes("CARDS")) {
      let cards = new Cards(this.user, this.webhookEvent);
      value = cards.handlePayload(payload);
      this.user = value.user;
      response = value.message;
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
    let retour ={
      message : response,
      user : this.user
    };
    //console.log("retourné par Receive (handlePayload) :");
    //console.log(retour);
    return retour;
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
module.exports = Receive;
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

module.exports = class Training {
  constructor(user, webhookEvent) {
    this.user = user;
    this.webhookEvent = webhookEvent;
  }

  handlePayload(payload) {
    let response;
    switch (payload) {
      case "ASK_TRAINING"://SCHEDULED_ASKING
        response = [
          Response.genText(
            i18n.__("training.welcome", {
              userFirstName: this.user.firstName
            })
          ),
          Response.genText(i18n.__("training.askingReady")),
          Response.genQuickReply(i18n.__("training.guidance"), [
            {
              title: i18n.__("menu.startTraining"),
              payload: "START_TRAINING"
            },
            {
              title: i18n.__("menu.skipTraining"),
              payload: "SKIP_TRAINING"
            },
            {
              title: i18n.__("menu.frequencySettings"),
              payload: "TRAINING_SETTINGS"
            }
          ])
        ];
        break;
      case "START_TRAINING":
        //Commencer l'entrainement
        break;
      case "SKIP_TRAINING":
        //Sauter l'entrainement
        break;
      case "TRAINING_SETTINGS":
        //Paramètres des entrainements
        break;
    }
    return response;
  }
};

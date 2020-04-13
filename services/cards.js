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
    switch (payload) {
      case "CARDS_MANAGER":
          break;
      case "CARDS_OPTIONS":
        break;
    }
    return response;
  }
};

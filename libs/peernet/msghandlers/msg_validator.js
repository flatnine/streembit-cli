﻿/*

This file is part of Streembit application.
Streembit is an open source project to create a real time communication system for humans and machines.

Streembit is a free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
as published by the Free Software Foundation, either version 3.0 of the License, or (at your option) any later version.

Streembit is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty
of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Streembit software.
If not, see http://www.gnu.org/licenses/.

-------------------------------------------------------------------------------------------------------------------------
Author: Tibor Zsolt Pardi
Copyright (C) 2017 The Streembit software development team
-------------------------------------------------------------------------------------------------------------------------

*/

'use strict';

const logger = require("libs/logger");
const async = require("async");
const peermsg = require("libs/message");
const bs58check = require('bs58check');
const createHash = require('create-hash');

function verify_signature(params, callback) {

    try {
        var payload = peermsg.getpayload(params.value);
        if (!payload || !payload.data || !payload.data.type) {
            return callback("validate() error invalid payload");
        }

        var is_update_key = false;
        if (payload.data.type == peermsg.MSGTYPE.PUBPK || payload.data.type == peermsg.MSGTYPE.UPDPK || payload.data.type == peermsg.MSGTYPE.DELPK) {
            if (!payload.iss || typeof payload.iss != "string" || !payload.iss.length) {
                return callback("validate() error invalid public key payload");
            }
            is_update_key = true;
        }

        var checkkey;
        if (is_update_key) {
            checkkey = params.key;
        }
        else {
            //  must be a forward slash separated key and the first
            //  item must be the bs58 hashed publich key
            var items = params.key.split("/");
            if (!items || items.lentgh == 1) {
                return callback("validate() invalid message key");
            }

            checkkey = items[0];
        }

        //  check if the bs58 key is correctly computed from the hex public key
        //  and then the JWT signature will validate the integrity of message
        var publickey;
        try {
            // payload.iss is a BS58check encoded key
            var bs58buffer = bs58check.decode(payload.iss);
            var publickey = bs58buffer.toString("hex");
            var buffer = new Buffer(publickey, 'hex');
            var rmd160buffer = createHash('rmd160').update(buffer).digest();
            var bs58pk = bs58check.encode(rmd160buffer);
            if (checkkey != bs58pk) {
                return callback("validate() error invalid key value or public key mismatch");
            }
        }
        catch (err) {
            return callback("validate() error: " + err.message);
        }

        if (!publickey) {
            return callback('invalid public key');
        }

        var decoded_msg = peermsg.decode(params.value, publickey);
        if (!decoded_msg) {
            return callback('VERIFYFAIL ' + checkkey);
        }

        //  passed the validation -> add to the network
        logger.debug('validation for msgtype: ' + payload.data.type + '  is OK');

        //node._log.debug('data: %j', params);
        callback(null, true);
    }
    catch (err) {
        return callback("validate() error: " + err.message);
    }

}

module.exports.validate = function (message, callback) {
    try {
        logger.debug('validate');

        if (!message || (!message.method && !message.type)){
            return callback(new Error('Invalid message detected at validate'));
        }

        var params;
        if (message.method) {
            if (message.method != "STORE" || !message.params || !message.params.item) {
                // only validate the STORE messages
                return callback();
            }

            params = message.params.item;
        }
        else if (message.type) {
            params = message;
        }

        if (!params.key || !params.value) {
            return callback(new Error('Invalid message detected at validate, key and value are expected'));
        }

        logger.debug('validate PUT key: ' + params.key);

        verify_signature(params, function (err, isvalid) {
            if (err) {
                return callback(new Error('Message dropped ' + ((typeof err === 'string') ? err : (err.message ? err.message : "validation failed"))));
            }
            if (!isvalid) {
                return callback(new Error('Message dropped, reason: validation failed'));
            }

            // valid message
            return callback();
        });
    }
    catch (err) {
        callback(err);
    }
}

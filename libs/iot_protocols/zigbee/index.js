﻿/*
 
This file is part of Streembit application. 
Streembit is an open source project to create a real time communication system for humans and machines. 

Streembit is a free software: you can redistribute it and/or modify it under the terms of the GNU General Public License 
as published by the Free Software Foundation, either version 3.0 of the License, or (at your option) any later version.

Streembit is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of 
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Streembit software.  
If not, see http://www.gnu.org/licenses/.
 
-------------------------------------------------------------------------------------------------------------------------
Author: Tibor Zsolt Pardi 
Copyright (C) 2017 The Streembit software development team
-------------------------------------------------------------------------------------------------------------------------

*/


'use strict';


const logger = require("libs/logger");
const events = require("libs/events");
const constants = require("libs/constants");
const async = require("async");
var util = require('util');
var SerialPort = require('serialport');
var xbeeapi = require('libs/iot_protocols/zigbee/xbee');


class Handler {

    constructor(mcu) {
        this.mcu = mcu;
    }

    init(callback) {
        try {
            logger.info("zigbee init mcu: " +  this.mcu);
            
            var mcuhandler = require('libs/iot_protocols/zigbee/' + this.mcu);
            mcuhandler();

            //// initialize the task event handler
            //events.on(events.TASK_INIT, (task, payload) => {
            //    switch (task) {
            //        case constants.TASK_PUBLISHACCOUNT:
            //            this.publish_account();
            //            break;
            //        case constants.TASK_INFORM_CONTACTS:
            //            this.inform_contacts(payload);
            //            break;
            //        default:
            //            break;
            //    }
            //});

            //events.on(events.APP_INIT, () => {
            //    this.on_application_init();
            //});

        }
        catch (err) {
            logger.error("zigbee handler init error: " + err.message);
        }
    }
}

module.exports = Handler;

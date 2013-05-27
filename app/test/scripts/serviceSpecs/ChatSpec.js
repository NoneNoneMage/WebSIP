/*
*Copyright (c) 2013 Thomas Falkenberg.
*All rights reserved. This program and the accompanying materials
*are made available under the terms of the GNU Public License v3.0
*which accompanies this distribution, and is available at
*http://www.gnu.org/licenses/gpl.html
*
*Contributors:
*    Thomas Falkenberg - initial API and implementation
*    Deutsche Telekom AG- Telekom Laboratories Darmstadt
*/

// Generated by CoffeeScript 1.3.3
/*global define, describe, beforeEach, module, it, inject, expect
*/

define(['libs/angularMocks', 'services/Chat'], function() {
  'use strict';
  return describe('Chat service', function() {
    beforeEach(module('services'));
    
    it('should push a Message', inject(['Chat', function(Chat) {
    	var uri= "sip:thomas@telekom.de";
    	var chat = new Chat(uri);
    	var msg= {};
    	expect(msg.date).not.toBeDefined();
    	expect(msg.state).not.toBeDefined();
    	chat.push(msg);
    	expect(msg.date).toBeDefined();
    	expect(msg.date).not.toBeNull();
    	expect(msg.state).toBeDefined();
    	expect(msg.state).toEqual("waiting");
    	expect(chat.messages[0]).toBe(msg);
    	
     }
   ]));
    it('should get a Message and push it if not found', inject(['Chat', function(Chat) {
    	var uri= "sip:thomas@telekom.de";
    	var chat = new Chat(uri);
    	var msg= {};
    	expect(msg.date).not.toBeDefined();
    	expect(msg.state).not.toBeDefined();
    	msg.compare= jasmine.createSpy('msg.compare Spy').andCallFake(function(message) {
			return message===msg;
		});
    	expect(chat.messages[0]).not.toBe(msg);

    	expect(chat.messages.length).toEqual(0);
    	var msg2=chat.getMessage(msg);
    	
    	
    	expect(msg.date).toBeDefined();
    	expect(msg.date).not.toBeNull();
    	expect(msg.state).toBeDefined();
    	expect(msg.state).toEqual("waiting");
    	expect(chat.messages[0]).toBe(msg);
    	expect(msg2).toBe(msg);
    	expect(chat.messages.length).toEqual(1);
    	
    	msg2=chat.getMessage(msg);
    	expect(chat.messages.length).toEqual(1);
     }
   ]));
    
    it('should be initialized', inject(['Chat', function(Chat) {
    	var uri= "sip:thomas@telekom.de";
    	var chat = new Chat(uri);
    	expect(chat.push).toBeDefined();
    	expect(chat.getMessage).toBeDefined();
    	
    	expect(chat.partner).toEqual(uri);
    	expect(chat.messages).toEqual(new Array());
     }
   ]));

   
    return it('Chat Service should be defined', inject([
      'Chat', function(Chat) {
        return expect(Chat).toBeDefined();
      }
    ]));
  });
});
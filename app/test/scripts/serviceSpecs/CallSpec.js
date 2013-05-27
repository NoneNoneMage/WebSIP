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

define(['libs/angularMocks', 'services/Call', 'services/Media'], function() {
  'use strict';
  return describe('Call service', function() {
    beforeEach(module('services'));
    beforeEach(inject(function(){
    	var transport = new sip.TransportInfo("192.168.133.128",null, "ws", "ws" == "tls", "ws" != "udp", "ws" != "udp");
		 this.stack= new sip.Stack(null,transport);
	 }));
    it('should have start method', inject(['Call', function(Call) {
    	var call = new Call(this.stack,"sip:thomas@192.168.133.129","sip:peter@192.168.133.129");
   	   return expect(call.start).toBeDefined();
     }
   ]));
    it('should have answer method', inject(['Call', function(Call) {
    	var call = new Call(this.stack,"sip:thomas@192.168.133.129","sip:peter@192.168.133.129");
   	   return expect(call.answer).toBeDefined();
     }
   ]));
    it('should have end method', inject(['Call', function(Call) {
    	var call = new Call(this.stack,"sip:thomas@192.168.133.129","sip:peter@192.168.133.129");
   	   return expect(call.end).toBeDefined();
     }
   ]));
    it('should have createPeerConnection method', inject(['Call', function(Call) {
    	var call = new Call(this.stack,"sip:thomas@192.168.133.129","sip:peter@192.168.133.129");
   	   return expect(call.createPeerConnection).toBeDefined();
     }
   ]));
    it('should create PeerConnection ', inject(['Call','Media', 'sharedScope', function(Call,Media,sharedScope) {
    	var call = new Call(this.stack,"sip:thomas@192.168.133.129","sip:peter@192.168.133.129");
    	var media= new Media();
    	media.stream=new webkitMediaStream(true,true);
    	sharedScope.medias.push(media);
   	   expect(call.peerConn).toBe(null);
   	   
   	   	   call.createPeerConnection();
   	   
   	   expect(call.peerConn.localStreams.length).toBe(1);
   	   expect(call.peerConn.localStreams.item(0)).toBe(media.stream);
   	   expect(call.localMedia).toBe(media);
    	return expect(call.peerConn).not.toBe(null);
     }
   ]));
    
   
    
    it('should start PeerConnection', inject(['Call','Media', 'sharedScope', function(Call,Media,sharedScope) {
    	var call = new Call(this.stack,"sip:thomas@192.168.133.129","sip:peter@192.168.133.129");
    	var media= new Media();
    	navigator.webkitGetUserMedia(media.getType(), media.setStream);
    	sharedScope.getLocalMedia=jasmine.createSpy('getLocalMedia Spy').andReturn(media);
    	waitsFor(function() {
			return media.stream!=null;
		}, "It took too long to get Mediastream.", 10000);
    	runs(function() {
    		 expect(call.peerConn).toBe(null);
    	   	   
     	   	   call.createPeerConnection();
     	   
     	   expect(call.peerConn.localStreams.length).toBe(1);
     	   expect(call.peerConn.localStreams.item(0)).toBe(media.stream);
     	   expect(call.peerConn).not.toBe(null);
     	   call.peerConn.onicecandidate =jasmine.createSpy('onIceMessage Spy');
     	   call.startPeerConnection();
     	  
      	
     	   expect(call.local_sdp).not.toBe(null);
		});
//    	waitsFor(function() {
//			return call.peerConn.onicecandidate.wasCalled;
//		}, "It took too long to Call onIceMessage.", 10000);
//    	runs(function() {
//    		expect(call.peerConn.onicecandidate).toHaveBeenCalled();
//    	});
     }
   ]));
    
    it('should Call createPeerConnection and startPeerConnection by sendInvite', inject(['Call', function(Call) {
    	var call = new Call(this.stack,"sip:thomas@192.168.133.129","sip:peter@192.168.133.129");
    	call.createPeerConnection=jasmine.createSpy('createPeerConnection Spy');
    	call.startPeerConnection=jasmine.createSpy('startPeerConnection Spy');
    	expect(call.createPeerConnection).not.toHaveBeenCalled();
    	expect(call.startPeerConnection).not.toHaveBeenCalled();
    	call.sendInvite();
    	expect(call.createPeerConnection).toHaveBeenCalled();
    	expect(call.startPeerConnection).toHaveBeenCalled();
    	
     }
   ]));
    it('should Call throw no UA Error by sendInvite', inject(['Call', function(Call) {
    	var call = new Call(this.stack,"sip:thomas@192.168.133.129","sip:peter@192.168.133.129");
    	call.ua=null;
    	expect(call.sendInvite).toThrow("no ua: error in Call");
    	
    	
     }
   ]));
    it('should catch createPeerConnection-Error by sendInvite', inject(['Call', 'sharedScope', function(Call,sharedScope) {
    	var call = new Call(this.stack,"sip:thomas@192.168.133.129","sip:peter@192.168.133.129");
    	var error="createPeerConnectionError";
    	expect(call.endTime).toBeNull();
    	call.createPeerConnection=jasmine.createSpy('createPeerConnection Spy').andThrow(error);
    	call.startPeerConnection=jasmine.createSpy('startPeerConnection Spy');
    	call.sendInvite();
    	expect(call.state).toEqual("failed");
    	expect(call.endTime).not.toBeNull();
		expect(sharedScope.error).toBe(error);
    	
     }
   ]));
    it('should catch startPeerConnection-Error by sendInvite', inject(['Call', 'sharedScope', function(Call,sharedScope) {
    	var call = new Call(this.stack,"sip:thomas@192.168.133.129","sip:peter@192.168.133.129");
    	var error="startPeerConnectionError";
    	expect(call.endTime).toBeNull();
    	call.createPeerConnection=jasmine.createSpy('createPeerConnection Spy');
    	call.startPeerConnection=jasmine.createSpy('startPeerConnection Spy').andThrow(error);
    	
    	call.sendInvite();
    	expect(call.state).toEqual("failed");

    	expect(call.endTime).not.toBeNull();
		expect(sharedScope.error).toBe(error);
    	
     }
   ]));
    return it('should be defined', inject([
      'Call', function(Call) {
        return expect(Call).toBeDefined();
      }
    ]));
  });
});
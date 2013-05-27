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
/*global define
*/

define(['services/services','services/sharedScope'], function(services) {
  'use strict';
  return services.factory('Call', [
    	'$rootScope','sharedScope',function($rootScope,sharedScope){
    		
    		function Call(stack,localUri,partner) {
    			var that=this;
    			this.state=sharedScope.IDLE;
    			this.localUri=localUri;
    			this.partner=partner;
    			this.peerConn=null;
    			 this.local_sdp=null;
    			 this.remoteMedia=null;
    			 this.time = 0;
    			 this.endTime=null;
    			 that.startTime=new Date();
    			this.ua = new sip.UserAgent(stack);
    			this.type=sharedScope.INCOMING;
    			
    			this.initUa = function() {
    				that.ua.remoteParty = new sip.Address(that.partner);
    				that.ua.localParty = new sip.Address(that.localUri);
    				 var proxy = sharedScope.registration.getRouteHeader();
			          proxy.value.uri.param['transport'] = "udp";
			          that.ua.routeSet = [proxy];
    				//that.ua.routeSet = [sharedScope.connection.getRouteHeader(that.ua.remoteParty.uri.user)];
    	    		   
				}; 
    			this.isNotEnded = function() {
        			return	that.state != sharedScope.FAILED 
    				&& that.state != sharedScope.CLOSED
    				&& that.state != sharedScope.CANCELED
    				&& that.state != sharedScope.DECLINED
    				&& that.state != sharedScope.MISSED;
    			};
				
				this.getCallTime = function() {
				//return CallTime in Milliseconds
					if(that.endTime){
						
						clearInterval(that.refreshIntervalId);
						return that.endTime;
					}
					else{
						var now = new Date;
						
						return now-that.startTime;
					}
				};
				this.getnewPeerConnection = function() {
					 var pc_config = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
					 if (navigator.mozGetUserMedia) {
						 return new mozRTCPeerConnection(pc_config);
					 }
					 else if (navigator.webkitGetUserMedia) {
						 return new webkitRTCPeerConnection(pc_config);
					 } else {
						 throw new Error("No WebRTC supported");
					 }
					
				};
				//create PeerConnection object and add local Media Stream
    			this.createPeerConnection= function() {
    				 that.localMedia=sharedScope.getLocalMedia();
    				 if(!that.localMedia)throw new Error("no local Media");
    				 if(!that.localMedia.stream)throw new Error("Allow use of Media");
    				 
//    					that.peerConn = new webkitPeerConnection00(sharedScope.connection.webrtc_stun, function(message,moreToFollow) {that.onIceMessage(message,moreToFollow); /*that.onWebRtcSendMessage(message);*/ });
    				
    				 that.peerConn = that.getnewPeerConnection();
    				 that.peerConn.onicecandidate = function(e) {
    			    	  that.onIceMessage(e.candidate,e.candidate);
					};
    				 	that.peerConn.onconnecting = function(message) { that.onWebRtcConnecting(message); };
    				    that.peerConn.onopen = function(message) { that.onWebRtcOpen(message); };
    				    that.peerConn.onaddstream = function(event) { that.onWebRtcAddStream(event); };
    				    that.peerConn.onremovestream = function(event) { that.onWebRtcRemoveStream(); };
    				    
    				    if (that.localMedia) {
          				 	
      				    	that.peerConn.addStream(that.localMedia.stream);
      				    	log("local Media added");
      				    };
      				    
    				   
    				};
    				
    				//add SDP Description to PeerConnection. and Start ICE 
    				//use Call.state to decide if is answer or offer 
    				//By Answer get RemoteDescription by ua.request.body
    			this.startPeerConnection = function() {
    				var offer= null;
 				    if (that.state == sharedScope.ACCEPTING && that.ua != null && that.ua.request != null) {
 				    	var sdp = that.ua.request.body;//{};
// 				    	 sdp.sdp=that.ua.request.body;
//	                        sdp.type="offer";
 				    	log(sdp);
	                        var sdpBody=new RTCSessionDescription({ type: "offer", sdp: sdp });
	                        that.peerConn.setRemoteDescription(sdpBody,function () { // success callback
	                            log("setRemoteDescription ok!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
	                        },
	                        function (error) { // error callback
	                            log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!setRemoteDescription nok");
	                            log(error);
	                        });
// 				    	that.peerConn.setRemoteDescription(that.peerConn.SDP_OFFER, new SessionDescription(that.ua.request.body));
			    	 	offer = that.peerConn.remoteDescription;
			    	 	
//			    	    var answer = that.peerConn.createAnswer(offer.toSdp(), that.localMedia.getPeerType());
//			    	    that.local_sdp=answer;
//			    	    that.peerConn.setLocalDescription(that.peerConn.SDP_ANSWER,  that.local_sdp);
			    	 	that.peerConn.createAnswer(that.setLocal, that.createError, that.localMedia.getPeerType());
			    	    
 				     };
 				    
 				   if (!offer){ 
 					  that.peerConn.createOffer(that.setLocal, that.createError, that.localMedia.getPeerType());
// 					   	offer = that.peerConn.createOffer(that.localMedia.getPeerType());
// 					   	that.local_sdp=offer;
//	 					that.peerConn.setLocalDescription(that.peerConn.SDP_OFFER, that.local_sdp);
 				   };
 				  
// 				   that.peerConn.startIce();
				};
				
				this.setLocal = function(sdp) {
					sdp.sdp=sdp.sdp.replace(/^.*m=video.*$/mg, "");
					sdp.sdp=sdp.sdp.replace(/ video/g, "");
					sdp.sdp=sdp.sdp.replace(/^.*101 red.*$/mg, "");
					sdp.sdp=sdp.sdp.replace(/^.*VP8.*$/mg, "");
					sdp.sdp=sdp.sdp.replace(/^.*102 ulpfec.*$/mg, "");
					sdp.sdp=sdp.sdp.replace(/^.*a=mid:video.*$/mg, "");
					sdp.sdp =sdp.sdp.replace("\r\n\r\n","\r\n");
					sdp.sdp =sdp.sdp.replace("\r\n\r\n","\r\n");
					sdp.sdp =sdp.sdp.replace("\r\n\r\n","\r\n");
					sdp.sdp =sdp.sdp.replace("\r\n\r\n","\r\n");
					that.local_sdp=sdp;
					that.peerConn.setLocalDescription(sdp);
					
				};
				this.createError= function(e) {
					alert(e);
				}
				this.onIceMessage = function(message,moreToFollow) {
					log("onIceMessage: last: "+!moreToFollow);
					if(moreToFollow){
							
						log(message.candidate);
//							that.local_sdp.addCandidate(message);
							that.peerConn.addIceCandidate(message);
						
					}else
					{
						
						if (that.state != sharedScope.ACCEPTING || that.ua == null || that.ua.request == null) {
//							that.peerConn.setLocalDescription(that.peerConn.SDP_OFFER, that.local_sdp);
					    }
					
						if (/*that.state!=sharedScope.ACCEPTED&&*/that.state!=sharedScope.ACTIVE) {
//							that.onWebRtcSendMessage(that.local_sdp);
							that.onWebRtcSendMessage(that.peerConn.localDescription);
						}
					}
					
				};
	    		this.receivedAck = function(ua, request) {
	    			log("received ACK");
				        if (that.peerConn) {
				        	//TODO: Do something?
				        	that.toTag=request.getItem("From").tag;
				        	
				        };
				};
				
				
				
				this.receivedInvite = function(ua, request) {
					log("receivedInvite in State: "+that.state);
					if(sharedScope.getCurrentCall()==that){
					    if (that.state == sharedScope.IDLE) {
					    	//received new INVITE. Answer with RINGING and Change to RINGING-State
					    	log("incoming Invite");
					    	that.ua = ua;
					    	 var proxy = sharedScope.registration.getRouteHeader();
					          proxy.value.uri.param['transport'] = "udp";
					          that.ua.routeSet = [proxy];
					    	that.state = sharedScope.INCOMING;
					        
		
					        ua.sendResponse(ua.createResponse(180, 'Ringing'));
					        that.playSound("ringing");
					    }
					    else if (that.state == sharedScope.ACTIVE && that.ua == ua) {
					        // received re-invite not IMPLEMENTED
					        log("received re-INVITE");
					        var m = that.ua.createResponse(200, 'OK');
//					        var c = new sip.Header((new sip.Address(that.localUri)).uri.toString(), 'Contact');
//					        m.setItem('Contact', c);

		    		        that.createContactHeader(m);
					        if (sharedScope.connection.user_agent)
		    		            m.setItem('User-Agent', new sip.Header(sharedScope.connection.user_agent, 'User-Agent'));
		    		       
					        that.ua.sendResponse(m);
					        
					        if (that.peerConn) {
					        	alert("todo");
					        	
					        	//change from here
					        	that.peerConn.setRemoteDescription(that.peerConn.SDP_OFFER, new SessionDescription(request.body));
					    	 	
					        	var offer = that.peerConn.remoteDescription;
					        	var answer = that.peerConn.createAnswer(offer.toSdp(), that.localMedia.getPeerType());
					    	   that.peerConn.setLocalDescription(that.peerConn.SDP_ANSWER, answer);
					        }
					    }
				    }
				    else {
				    	//IF Already in Call Answer with 486-Response and add MISSED Call.
				        that.state=sharedScope.MISSED;
				        that.time= new Date();
				        ua.sendResponse(ua.createResponse(486, 'Busy Here'));
				        
				        
				    }
				};
				
				this.receivedInviteResponse = function(ua, response) {
					if (response.isfinal()) {
						that.playSound("");
				        if (!response.is2xx()) {
				            if (that.state == sharedScope.INVITING || that.state == sharedScope.RINGBACK) {
				            	if(that.state == sharedScope.RINGBACK){
				            		that.endTime=new Date();
					        		//that.sendBye();
					        	}
				            	if(response.response == 486){
				            		that.state=sharedScope.DECLINED;
				            	}else{
				            		that.state= sharedScope.FAILED;
				            	}
					        	that.endTime=new Date();
				            }
				            if(that.state == sharedScope.CANCELING){
				            	that.state=sharedScope.CANCELED;
				            }
				        }
				        else {
			                 if (that.peerConn) {
			                    if (that.state == sharedScope.INVITING || that.state == sharedScope.RINGBACK) {
			                        that.state= sharedScope.ACCEPTED;
			                        ua.autoack = false; // don't send ACK automatically
			                        log("response BODY = "+response.body);
//			                        var sdpBody=new SessionDescription(response.body);
//			                        that.peerConn.setRemoteDescription(that.peerConn.SDP_ANSWER, sdpBody );
			                        var sdp={};
			                        sdp.sdp=response.body;  
			                        sdp.type="answer";
			                        var sdpBody=new RTCSessionDescription(sdp);
			                        that.peerConn.setRemoteDescription(sdpBody);
			                        that.toTag=response.getItem("To").tag;
		 				    	  that.onWebRtcSendMessage(null);
			                    }
			                    else {
			                        ua.autoack = true;
			                    }
			                }
			                else {
			                    // failed to get peer-connection
			                	that.state= sharedScope.FAILED;
			                	that.endTime=new Date();
			                    that.sendBye();
			                }
				        }
				    }
				    else if (response.is1xx()) {
				        if (response.response != 100) {
				          
				          if (response.response >= 180) {
				                that.state=sharedScope.RINGBACK;

								that.playSound("ringback");
				            }
				        }
				    }
				};
				
				
				this.receivedByeResponse = function(ua, response) {
						that.state=sharedScope.CLOSED;
					 //   log("ignoring BYE response: " + response.response + " " + response.responsetext);
					};
					
				this.receivedBye = function(ua, request) {
				    if (this.ua && this.state != sharedScope.IDLE) {
				        ua.sendResponse(ua.createResponse(200, 'OK'));
				        that.state=sharedScope.CLOSED;
			        	that.endTime=new Date();
				        that.end();
				    }
				};
				
				this.sendInvite = function() {
				    if (!that.ua) {
				       throw new Error("no ua: error in Call");
				    } 
				  //catch error
				    that.tryPeerConnection();
				};
				
				this.sendBye = function() {
					log("will send BYE");
		        	var m= that.ua.createRequest('BYE');
		        	 m.getItem("To").tag=that.toTag;
		        	
		        	that.ua.sendRequest(m);
				};
				this.tryPeerConnection = function() {
					try {
						that.createPeerConnection();
						that.startPeerConnection();
					} catch (e) {
						
						that.state=sharedScope.FAILED;
		        		that.endTime=new Date();
		        		that.playSound("");
						sharedScope.error=e;
						throw e;
						
					}
				}
				
				this.answer = function() {
					//that.initUa();
					that.playSound("alert");
					that.state=sharedScope.ACCEPTING;
					that.refreshTime();
					that.tryPeerConnection();
				};
				this.refreshTime = function() {
					that.refreshIntervalId =setInterval(function(){
				        $rootScope.$apply(function() {
				           that.time = that.getCallTime();
				        });
				    }, 1000);
				}
				
    			this.start = function(){
    				that.initUa();
    				log("start call in state: "+that.state);
    				if (that.state == "idle") {
    					that.state = sharedScope.PREPARING;
    					that.playSound("alert");
    					
    					that.refreshTime();
    		            that.sendInvite();
    		        }
    		        
    			};
    			
    		
    			this.end = function(){
    				log("end()");
    				that.playSound("");
    				that.endTime=new Date();
    					if (that.state == sharedScope.PREPARING){
    						that.state=sharedScope.CANCELED;
    					}
    					else if (that.state == sharedScope.INVITING|| that.state == sharedScope.RINGBACK) {
    			        	that.state=sharedScope.CANCELING;
    			            that.ua.sendCancel();
    			        }
    			        else if (that.state == sharedScope.INCOMING|| that.state == sharedScope.ACCEPTING) {
    			        	that.state=sharedScope.DECLINED;
    			            that.ua.sendResponse(that.ua.createResponse(603,'Decline'));
    			        }
    			        else if (that.state == sharedScope.ACTIVE || that.state == sharedScope.ACCEPTED ) {
    			        	that.state=sharedScope.CLOSING;
    			        	that.sendBye();
    			        }
    			        else {
    			            if (that.state != sharedScope.FAILED && that.state != sharedScope.CLOSED) {
//    			                log("ignoring end in " + that.state + " state");
//    			                return;
    			            }
    			        }
    			        //delete all
    			        if(that.peerConn){
    			        	that.peerConn.close();
    			        	that.peerConn=null;
    			        }
    			        if(that.remoteMedia){
    			        	sharedScope.removeMedia(that.remoteMedia);
    			        	that.remoteMedia=null;
    			        }
    	    			this.local_sdp=null;
    	    			this.ua =null;
    			    
    			};
    			
    			this.hold= function(){
    				
    			};
    			
    		this.createContactHeader = function(message) {
    			sharedScope.registration.createContactHeader(message);
    			
			}
    		
    		this.onWebRtcSendMessage = function(message) {
    			log("onWebRtcSendMessage");
    		    var m= null;
    		    if (that.state == sharedScope.PREPARING) {
    		    	that.state = sharedScope.INVITING;
    		    	
    		    	
    		        m = that.ua.createRequest('INVITE');
//    		        var c = new sip.Header((new sip.Address(that.localUri)).uri.toString(), 'Contact');
//    		        m.setItem('Contact', c);
    		        that.createContactHeader(m);
    		        if (sharedScope.connection.user_agent)
    		            m.setItem('User-Agent', new sip.Header(sharedScope.connection.user_agent, 'User-Agent'));
    		      
    		    }
    		    else if (that.state == sharedScope.ACCEPTED) {
    		        // send in ACK is possible, otherwise re-INVITE.
    		    	log("Call is going to active");
    		        that.state = sharedScope.ACTIVE;

					that.playSound("");
    		         m = that.ua.createRequest('ACK');
    		         
    		         
    		    }
    		    else if (that.state == sharedScope.ACCEPTING) {
    		    	log("Call Accepted going to send 200 OK");
    		    	 
    		        that.state= sharedScope.ACTIVE;

					that.playSound("");
					
    		         m = that.ua.createResponse(200, 'OK');
//    		         var sipAddr=new sip.Address(that.localUri).uri.toString();
//  					log("sipAddr "+sipAddr);
//    		        var c = new sip.Header((sipAddr), 'Contact');
//    		        m.setItem('Contact', c);

     		        that.createContactHeader(m);
    		        if (sharedScope.connection.user_agent)
    		            m.setItem('User-Agent', new sip.Header(sharedScope.connection.user_agent, 'User-Agent'));
    		           
    		        
    		        m.setItem('Content-Type', new sip.Header("application/sdp", 'Content-Type'));
//    		        m.setBody(message.toSdp());
    		        m.setBody(message.sdp);
    		        that.ua.sendResponse(m);
    		        $rootScope.$apply();
    		        return;
    		        
    		    }
    		    else if (that.state == sharedScope.ACTIVE) {
    		    	return;
    		        // need to send re-INVITE with new SDP
//    		        log("reINVITE");
//    		         m = this.ua.createRequest('INVITE');
//    		        //var c = new sip.Header(this._stack.uri.toString(), 'Contact');
//    		        //c.value.uri.user = this.username;
//    		        var c = new sip.Header((new sip.Address(that.localUri)).uri.toString(), 'Contact');
//    		        m.setItem('Contact', c);
//    		        if (sharedScope.connection.user_agent)
//    		            m.setItem('User-Agent', new sip.Header(sharedScope.connection.user_agent, 'User-Agent'));
//    		       
    		    } else  if(that.state == sharedScope.CANCELING){
	            	that.state=sharedScope.CANCELED;
	            	log("Call canceled");
	            	return;
	            }
    		    else {
    		        log('invalid call state in onWebRtcSendMessage: ' + that.state);
    		        return
    		    }
    		    
    		    
		        if(message){
		        	if (sharedScope.connection.user_agent)
    		            m.setItem('User-Agent', new sip.Header(sharedScope.connection.user_agent, 'User-Agent'));
	    		       
		        	m.setItem('Content-Type', new sip.Header("application/sdp", 'Content-Type'));
//		        	var sdp=message.toSdp().replace(/^.*SHA1_32.*$/mg, "");
		        	var sdp=message.sdp.replace(/^.*SHA1_32.*$/mg, "");
		        	sdp =sdp.replace("\r\n\r\n","\r\n");
		        	m.setBody(sdp);
		        }
		        that.ua.sendRequest(m);
    		};

    		this.onWebRtcConnecting = function(event) {
    		    log("webrtc - onconnecting()");
    		};

    		this.onWebRtcOpen = function(message) {
    		    log("webrtc - onopen()");
    		};

    		this.onWebRtcAddStream = function(event) {
    		    log("webrtc - onaddstream(...)");
    		    var mediaType= "";
    		    if(event.stream.getAudioTracks().length!=0){
    		    	mediaType="A";
    		    }
    		    if(event.stream.getVideoTracks().length!=0){
    		    	mediaType=mediaType+"V";
    		    }
    		   that.remoteMedia=sharedScope.createMedia(false,mediaType);
    		   that.remoteMedia.setStreamByEvent(event);
    		  
    		};
    		
    		this.onWebRtcRemoveStream = function() {
    		    log("webrtc - onremovestream()");
    		   delete that.remoteMedia;
    		};
    		
    		this.playSound = function(soundfile) {
    			if(soundfile==""){
    				sharedScope.audioSource=soundfile;
    			}else{
    		   sharedScope.audioSource="img/"+soundfile+".ogg";}
    		};
    		};
    		
    		
    		
    		return Call;
    	}
  ]);
});

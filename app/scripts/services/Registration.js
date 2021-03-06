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
  return services.factory('Registration', [
    	'$rootScope','sharedScope',function($rootScope,sharedScope){
    		
    		function Registration() {
    			
    			var that =this;
    				
    			
    				this.user="620";
    				this.password = "Password";
    				this.domain ="fritz.box";
    				this.displayname = 'Name';
    				this.domainPort= 5060;
    				this.transport="ws";
    			    this.register_interval = 180;
    			   
    			    this.local_aor = function() {
    					return '"' + that.displayname + '" <sip:' + that.user + '@' + that.domain /*+":"+that.domainPort*/+ '>';
    				};
    			 
    			    this.state = sharedScope.NOTREGISTERED;
    			 
    			    // SIP requirements for websocket
    			    this._instance_id = "";
    			   
    				
    				
    				this.reset=function(){
    					 that.state=sharedScope.NOTREGISTERED;
    					 that._reg=null;
    				};
    				
    				
    				this.authenticate= function(ua, header, stack) {
    				    log("authenticate() called");
    				    header.username = that.user;
    				    header.password = that.password;
    				    header.realm = that.domain;
    				    return true;
    				};
    				
    				
    				
    				this.checkRegistration= function(callBack) {
    					var testParty=new sip.Address(that.local_aor());
    				    if((!that._reg &&!callBack)||(that._reg!=null && that._reg.remoteParty.toString()!=testParty.toString())){
    				    	log("user changed");
    				    	if(that._reg!=null){
	    				    	that.sendUnregister();
	    				    	that._reg=null;
    				    	}
    				    	that.state=sharedScope.NOTREGISTERED;
    				    	that.register();
    				    	if(callBack){
    				    	setTimeout(callBack(),5000);
    				    	}
    				    	return false;
    				    }
    				    return true;
					};
					this.createContactHeader = function(message) {
						
							var string= "<sip:"+that.user+"@df7jal23ls0d.invalid;rtcweb-breaker=yes;transport=ws>"
							
							 var c = new sip.Header(string, 'Contact');
							if (message.method=="INVITE"){
    				            c.setItem('impi',that.user);
    				            var ha1 =  hex_md5(that.user+":"+that.domain+":"+that.password);
    				            c.setItem('ha1',ha1);
    				            c.setItem('+sip.ice');
    				          }
//	    				    c.value.uri.user = that.user;
//	    				    c.setItem('rtcweb-breaker','yes');
//    				        c.setItem('transport',that.transport);
//    				       
    				        message.setItem('Contact', c);
					};
    				this.createRegister = function() {
    				    var m = that._reg.createRequest('REGISTER');
    				    log(that.stack.uri.toString());
    				    that.createContactHeader(m);
    				    m.setItem('Supported', new sip.Header('path', 'Supported'));
    				   
    				    return m;
    				};
    				this.createInstanceId = function() {
    				    if (!that._instance_id && typeof localStorage != "undefined") {
    				        that._instance_id = localStorage.getItem("instance_id");
    				        if (!that._instance_id) {
    				            that._instance_id = "<urn:uuid:" + that.createUUID4() + ">";
    				            localStorage.setItem("instance_id", that._instance_id);
    				        }
    				    }
    				};
    				
    				this.receivedRegisterResponse = function(ua, response) {
    					
    				    if (response.isfinal()) {
    				        if (that.state == sharedScope.REGISTERING) {
    				            if (response.is2xx()) {
    				            	if(sharedScope.error.message=="UA is not registered")sharedScope.error=null;
    				            	that.state=sharedScope.REGISTERED;
    				            }
    				            else {
    				            	that.state=sharedScope.NOTREGISTERED;
    				            	that._reg = null;
    				            }
    				        }
    				        else if (this.state == sharedScope.UNREGISTERING) {
    				            that.state=sharedScope.NOTREGISTERED;
    				            that._reg = null;
    				        }
    				    }
    				};
    				
    				this.createUUID4 = function() {
    				    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    				        var r = Math.random()*16|0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    				        return v.toString(16);
    				    });
    				};
    				
    				this.sendRegister = function() {
    				    if (that._reg == null) {
    				    	log("create UserAgent");
    				        that._reg = new sip.UserAgent(that.stack);
    				        that._reg.remoteParty = new sip.Address(that.local_aor());
    				        that._reg.localParty = new sip.Address(that.local_aor());
    				        
    				        var outbound_proxy = that.getRouteHeader();
				            outbound_proxy.value.uri.param['transport'] = "udp";
				            that._reg.routeSet = [outbound_proxy];
				            that._reg.remoteTarget = new sip.URI("sip:" + that.user + "@" + that.domain/*+":"+that.domainPort*/);
    				    }   
    				    
    				    var m = that.createRegister();
    				    m.setItem('Expires', new sip.Header("" + that.register_interval, 'Expires'));
    				    that._reg.sendRequest(m);
    				    setTimeout(function() {that.reRegister();},that.register_interval*1000);
    				    
    				};
    				
    				this.reRegister=function(){
    					log("reRegister()");
    					that.checkRegistration(that.reRegister);
    					if(that.state==sharedScope.REGISTERED && that._reg){
    						 var m = that.createRegister();
    	    				 m.setItem('Expires', new sip.Header("" + that.register_interval, 'Expires'));
    	    				 that._reg.sendRequest(m);
    	    				 
    						 setTimeout(function() {that.reRegister();},that.register_interval*1000);
    					}
    				};
    				
    				this.sendUnregister = function() {
    				    var m = that.createRegister();
    				    m.setItem('Expires', new sip.Header("0", 'Expires'));
    				    that._reg.sendRequest(m);
    				};
    				
    				this.getRouteHeader = function() {
    				    return sharedScope.connection.getRouteHeader(that.user);//new sip.Header("<sip:" + (username ? username + "@" : "") + this.outbound_proxy_address + ";lr>", 'Route');
    				};
    				
    				
    				
    				this.register = function() {
    				    log("register() " + that.local_aor());
    				     
    				        if (that._reg && that.state != sharedScope.NOTREGISTERED) {
    				        	 that.state= sharedScope.UNREGISTERING;
    				        	sharedScope.endAllCalls();
    				            that.sendUnregister();
    				        }
    				        else if (that.state == sharedScope.NOTREGISTERED) {
    				        	that.state= sharedScope.REGISTERING;
    				        
    				            that.sendRegister();
    				        }
    				        else {
    				            log("ignoring register in state " + that.state + " " + that._reg);
    				        }
    				    
    				};
    			}
    			
    			return Registration;
    	}
  ]);
});


/**
 * author jonyyu
 * 328553173@qq.com
 */
 let interceptors_ajax = [];


 let newXMLHttpRequest = function(Request){
   let _XMLHttpRequest = Request;
   return function(){
     const reversedInterceptors = interceptors_ajax.reduce((array, interceptor) => [interceptor].concat(array), []);
     let xhr = new _XMLHttpRequest;
     reversedInterceptors.forEach(({
       requestAbout,
       requestError,
       requestLoad,
       requestLoadStart,
       requestLoadEnd,
       requestProgress,
       requestOnreadyStateChange,
       requestTimeout
     })=>{
       if(requestAbout){
         addEvent(xhr,'abount',requestAbout.bind(null,xhr));
       }
       if(requestError){
         addEvent(xhr,'error',requestError.bind(null,xhr));
       }
       if(requestLoad){
         addEvent(xhr,'load',requestLoad.bind(null,xhr));
       }
       if(requestLoadStart){
         addEvent(xhr,'loadstart',requestLoadStart.bind(null,xhr));
       }
       if(requestLoadEnd){
         addEvent(xhr,'loadend',requestLoadEnd.bind(null,xhr));
       }
       if(requestProgress){
         addEvent(xhr,'loadstart',requestProgress.bind(null,xhr));
       }
       if(requestOnreadyStateChange){
         addEvent(xhr,'readystatechange',requestOnreadyStateChange.bind(null,xhr));
       }
       if(requestTimeout){
         addEvent(xhr,'timeout',requestTimeout.bind(null,xhr));
       }
     });
     return xhr;
   };
 };
 
 //IE and DOM event
 function addEvent(node,type,handler){
   if (!node) return false;
   if (node.addEventListener) {
       node.addEventListener(type, handler, false);
       return true;
   }
   else if (node.attachEvent) {
       node['e' + type + handler] = handler;
       node[type + handler] = function() {
           node['e' + type + handler](window.event);
       };
       node.attachEvent('on' + type, node[type + handler]);
       return true;
   }
   return false;
 }
 
 const ajaxAttach = function (env) {
   env.XMLHttpRequest = newXMLHttpRequest(env.XMLHttpRequest);
   return {
     register: function (interceptor) {
       interceptors_ajax.push(interceptor);
       return () => {
         const index = interceptors_ajax.indexOf(interceptor);
         if (index >= 0) {
           interceptors_ajax.splice(index, 1);
         }
       };
     },
     clear: function () {
       interceptors_ajax = [];
     }
   }
 
 }



/**
 * Congiguration reference resources:https://github.com/werk85/fetch-intercept/blob/develop/src/attach.js
 * @providesModule whatwg-fetch
 * author jonyyu
 * 328553173@qq.com
 */
 let interceptors = [];

 function interceptor(fetch, ...args) {
   const reversedInterceptors = interceptors.reduce((array, interceptor) => [interceptor].concat(array), []);
   let promise = Promise.resolve(args);
 
   // Register request interceptors
   reversedInterceptors.forEach(({ request, requestError }) => {
     if (request || requestError) {
       promise = promise.then(args => request(...args), requestError);
     }
   });
 
   // Register fetch call
   promise = promise.then(args => fetch(...args));
 
   // Register response interceptors
   reversedInterceptors.forEach(({ response, responseError }) => {
     if (response || responseError) {
       promise = promise.then(response, responseError);
     }
   });
 
   return promise;
 }
 
 const fetchAttach = function (env) {
   // Make sure fetch is avaibale in the given environment
   if (!env.fetch) {
     try {
       require('whatwg-fetch');
     } catch (err) {
       throw Error('No fetch avaibale. Unable to register fetch-intercept');
     }
   }
   env.fetch = (function (fetch) {
     return function (...args) {
       return interceptor(fetch, ...args);
     };
   })(env.fetch);
 
   return {
     register: function (interceptor) {
       interceptors.push(interceptor);
       return () => {
         const index = interceptors.indexOf(interceptor);
         if (index >= 0) {
           interceptors.splice(index, 1);
         }
       };
     },
     clear: function () {
       interceptors = [];
     }
   };
 };
 


let ajaxIntercept;
let fetchIntercept;
if (typeof(window) === 'undefined') {
    fetchIntercept = fetchAttach(global);
    ajaxIntercept = ajaxAttach(global);
} else {
    fetchIntercept = fetchAttach(window);
    ajaxIntercept = ajaxAttach(window);
}





fetchIntercept.register({
    request: function (url, config) {
        // Modify the url or config here
        console.log("request")
        return [url, config];
    },

    requestError: function (error) {
        // Called when an error occured during another 'request' interceptor call
        console.log("requestError")
        return Promise.reject(error);
    },

    response: function (response) {
        // Modify the reponse object
        console.log("response")
        return response;
    },

    responseError: function (error) {
        // Handle an fetch error
        console.log("responseError")
        return Promise.reject(error);
    }
});



ajaxIntercept.register({
    requestAbout: function (xhr) {
        console.log("requestAbout")
    },
    requestError: function (xhr) {
        // xhr is real instance of a request
        console.log("requestError")
    },
    requestLoad: function (xhr) {
        // xhr is real instance of a request
        console.log("requestLoad")
    },
    requestLoadStart: function (xhr) {
        // xhr is real instance of a request
        console.log("requestLoadStart")
    },
    requestLoadEnd: function (xhr) {
        // xhr is real instance of a request
        console.log("requestLoadEnd")
    },
    requestProgress: function (xhr) {
        // xhr is real instance of a request
        console.log("requestProgress")
    },
    requestOnreadyStateChange: function (xhr) {
        // xhr is real instance of a request
        console.log("requestOnreadyStateChange")
    },
    requestTimeout: function (xhr) {
        // xhr is real instance of a request
        console.log("requestTimeout")
    }
});
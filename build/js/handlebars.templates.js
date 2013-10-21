this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};

this["Handlebars"]["templates"]["application"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"mce-container\" id=\"tinyvision\">\n  <div class=\"tv-toolbar mce-panel cf\">\n    <div class=\"tv-toolbar-left\">\n      <div class=\"tv-upload mce-widget mce-btn\">\n        <button type=\"button\" id=\"upload\"><span class=\"tv-icon tv-icon-upload\"></span> Upload</button>\n      </div>\n    </div>\n    <div class=\"tv-toolbar-right\">\n      <div class=\"tv-search mce-widget\">\n        <span class=\"tv-icon tv-icon-search\"></span>\n        <input class=\"mce-textbox\" id=\"search\" placeholder=\"Search\">\n      </div>\n      <div class=\"tv-refresh mce-widget mce-btn\">\n        <button type=\"button\" id=\"refresh\"><span class=\"tv-icon tv-icon-refresh\"></span></button>\n      </div>\n    </div>\n  </div>\n  <div class=\"tv-notice\" id=\"notice\"></div>\n  <ol class=\"tv-items cf\" id=\"items\"></ol>\n</div>\n";
  });

this["Handlebars"]["templates"]["item"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<li class=\"tv-item\">\n  <a href=\"#\" class=\"tv-item-link\" title=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n    <div class=\"tv-item-image\">\n      <img data-src=\"";
  if (stack1 = helpers.imageUrl) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.imageUrl; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n    </div>\n    <div class=\"tv-item-name\">";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n  </a>\n</li>\n";
  return buffer;
  });
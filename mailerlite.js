function ml_webform_success_27987994() {
  var $ = ml_jQuery || jQuery;
  $('.ml-subscribe-form-27987994 .row-success').show();
  $('.ml-subscribe-form-27987994 .row-form').hide();
}

// Load MailerLite webforms script
(function() {
  var script = document.createElement('script');
  script.src = 'https://groot.mailerlite.com/js/w/webforms.min.js?v176e10baa5e7ed80d35ae235be3d5024';
  script.type = 'text/javascript';
  document.head.appendChild(script);
})();

// Track form view
fetch("https://assets.mailerlite.com/jsonp/1566247/forms/158950571281220964/takel");

(function (window, document, tinymce, undefined) {
  'use strict';

  tinymce.PluginManager.add('tinyvision', function (editor, pluginUrl) {
    var self = {};

    self.win = null;

    self.WINDOW_HEIGHT = 537;
    self.WINDOW_URL = pluginUrl + '/tinyvision.html';
    self.WINDOW_WIDTH = 702;

    self.skinUrl = function () {
      var regex = /\/skins\/\w+\/skin(\.min)?\.css$/,
          styleSheets = document.styleSheets,
          styleSheetsLength = styleSheets.length,
          styleSheetHref,
          url;

      for (var i = 0; i < styleSheetsLength; i += 1) {
        styleSheetHref = styleSheets[i].href;

        if (styleSheetHref && styleSheetHref.match(regex)) {
          url = styleSheetHref;
          break;
        }
      }

      return url;
    };

    self.iframeWindow = function () {
      return self.win.getEl().getElementsByTagName('iframe')[0].contentWindow;
    };

    self.selected = function () {
      return self.iframeWindow().selected();
    };

    self.populateField = function (field) {
      var selected = self.selected();

      field.value = selected ? selected.value : '';

      return self;
    };

    self.openWindow = function (fieldId, fieldValue, type, parentWin) {
      self.win = editor.windowManager.open({
        title: 'Select ' + type,
        url: self.WINDOW_URL,
        buttons: [
          {
            text: 'Select',
            subtype: 'primary',
            onclick: function () {
              self.populateField(parentWin.document.getElementById(fieldId));
              self.win.close();
            }
          },
          {
            text: 'Cancel',
            onclick: 'close'
          }
        ],
        width: self.WINDOW_WIDTH,
        height: self.WINDOW_HEIGHT
      }, {
        fieldValue: fieldValue,
        options: editor.settings.tinyvision,
        skinUrl: self.skinUrl(),
        type: type
      });

      return self;
    };

    editor.addCommand('tinyvision', function (options) {
      self.openWindow(options.fieldId, options.fieldValue, options.type, options.win);
    });

    /* jshint -W106 */
    editor.settings.file_browser_callback = self.openWindow;
    /* jshint +W106 */
  });
})(window, document, tinymce);

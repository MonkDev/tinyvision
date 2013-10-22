/*!
 * TinyVision v1.0.0
 *
 * A visual file selector for TinyMCE v4.
 *
 * https://github.com/MonkDev/tinyvision
 *
 * Copyright 2013 by Monk Development, Inc.
 * Licensed MIT
 */
/**
 * TinyVision plugin for TinyMCE. Primarily handles launching the window with
 * the iframe, which is then where most of the action happens.
 *
 * @param {Window} window Current window object.
 * @param {Document} document Current document object.
 * @param {tinymce} tinymce TinyMCE dependency.
 * @param {undefined} undefined Undefined value for convenience.
 */
(function (window, document, tinymce, undefined) {
  'use strict';

  // Register the plugin with TinyMCE.
  tinymce.PluginManager.add('tinyvision', function (editor, pluginUrl) {
    /**
     * Object to encapsulate everything.
     *
     * @type {Object}
     */
    var self = {};

    /**
     * TinyVision window.
     *
     * @type {tinymce.ui.Window}
     * @see  {@link http://www.tinymce.com/wiki.php/api4:class.tinymce.ui.Window}
     */
    self.win = null;

    /**
     * Height of the TinyVision window.
     *
     * @constant {number}
     * @default 
     */
    self.WINDOW_HEIGHT = 537;

    /**
     * URL to open in the TinyVision window's iframe.
     *
     * @constant {string}
     * @default
     */
    self.WINDOW_URL = pluginUrl + '/tinyvision.html';

    /**
     * Width of the TinyVision window.
     *
     * @constant {number}
     * @default
     */
    self.WINDOW_WIDTH = 702;

    /**
     * Get the URL of the TinyMCE editor skin. TinyMCE doesn't provide an
     * accessor method, so the style sheets have to be manually parsed.
     *
     * @return {string} URL of the TinyMCE editor skin.
     */
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

    /**
     * Get the iframe's window object.
     *
     * @return {Window} iframe's window object.
     */
    self.iframeWindow = function () {
      return self.win.getEl().getElementsByTagName('iframe')[0].contentWindow;
    };

    /**
     * Get the currently selected item's data.
     *
     * @return {?Object} Item data.
     */
    self.selected = function () {
      return self.iframeWindow().selected();
    };

    /**
     * Populate the field that TinyVision was launched from with the selected
     * item's `value`. Empties the field value if nothing selected.
     *
     * @param  {Element} field Field that TinyVision was launched from.
     * @return {Object} self
     */
    self.populateField = function (field) {
      var selected = self.selected();

      field.value = selected ? selected.value : '';

      return self;
    };

    /**
     * Open the TinyMCE window for TinyVision. The window consists primarily of
     * an iframe with the toolbar and items list.
     *
     * @param  {string} fieldId ID of field to populate with the selected value.
     * @param  {string} fieldValue Current value of the field to populate.
     * @param  {string} type The type of files to display.
     * @param  {tinymce.ui.Window} parentWin Window launching TinyVision.
     * @return {Object} self
     */
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
        // Values passed to the iframe.
        fieldValue: fieldValue,
        options: editor.settings.tinyvision,
        skinUrl: self.skinUrl(),
        type: type
      });

      return self;
    };

    // Add a TinyMCE command that other plugins can call to launch TinyVision.
    editor.addCommand('tinyvision', function (options) {
      self.openWindow(options.fieldId, options.fieldValue, options.type, options.win);
    });

    // Modify the editor's config to register TinyVision as the file browser.
    /* jshint -W106 */
    editor.settings.file_browser_callback = self.openWindow;
    /* jshint +W106 */
  });
})(window, document, tinymce);

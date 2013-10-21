/**
 * TinyVision iframe (displayed within the TinyMCE plugin) that handles the
 * toolbar and items list.
 *
 * @param {Window} window Current window object.
 * @param {jQuery} $ jQuery library dependency.
 * @param {Handlebars} Handlebars Handlebars library dependency.
 * @param {undefined} undefined Undefined value for convenience.
 */
(function (window, $, Handlebars, undefined) {
  'use strict';

  /**
   * Object to encapsulate everything.
   *
   * @type {Object}
   */
  var self = {};

  /**
   * TinyMCE editor that launched TinyVision.
   *
   * @type {tinymce.Editor}
   * @see  {@link http://www.tinymce.com/wiki.php/api4:class.tinymce.Editor}
   */
  self.editor = window.top.tinymce.activeEditor;

  /**
   * TinyVision window that contains iframe.
   *
   * @type {tinymce.ui.Window}
   * @see  {@link http://www.tinymce.com/wiki.php/api4:class.tinymce.ui.Window}
   */
  self.win = null;

  /**
   * Params passed from the TinyMCE plugin.
   *
   * @type     {Object}
   * @property {string} fieldValue Value of the field that launched TinyVision.
   * @property {Object} options `tinyvision` config.
   * @property {string} skinUrl The URL of the TinyMCE editor skin.
   * @property {string} type The type of files to display.
   */
  self.params = self.editor.windowManager.getParams();

  /**
   * The current value of the field that TinyVision launched from.
   *
   * @type {string}
   */
  self.fieldValue = self.params.fieldValue;

  /**
   * The URL of the TinyMCE editor skin.
   *
   * @type {string}
   */
  self.skinUrl = self.params.skinUrl;

  /**
   * The type of files to display. This is an arbitrary value passed by TinyMCE.
   *
   * @type {string}
   */
  self.type = self.params.type;

  /**
   * Pre-compiled Handlebars templates.
   *
   * @type {Object}
   */
  self.templates = Handlebars.templates;

  /**
   * Upload button.
   *
   * @type {jQuery}
   */
  self.$upload = $();

  /**
   * Search field.
   *
   * @type {jQuery}
   */
  self.$search = $();

  /**
   * Refresh button.
   *
   * @type {jQuery}
   */
  self.$refresh = $();

  /**
   * Notice container.
   *
   * @type {jQuery}
   */
  self.$notice = $();

  /**
   * Items list.
   *
   * @type {jQuery}
   */
  self.$items = $();

  /**
   * Default `tinyvision` config values.
   *
   * @constant
   * @type     {Object}
   * @property {Object} messages Default text of messages.
   * @property {string} messages.empty Default text of no results message.
   * @property {string} messages.error Default text of error message.
   * @property {string} messages.loading Default text of loading message.
   * @property {boolean} search Whether to display the search field.
   * @property {string} source URL to request for items to display.
   * @property {?string} style URL of style sheet with custom styling.
   * @property {?(string|Function)} upload Upload button callback.
   */
  self.DEFAULTS = {
    messages: {
      empty: 'Sorry, there are no selections.',
      error: 'Sorry, there was a problem loading.',
      loading: 'Loading...'
    },
    search: true,
    source: null,
    style: null,
    upload: null
  };

  /**
   * Options after merge of custom `tinyvision` config and default values.
   *
   * @type {Object}
   */
  self.options = $.extend(true, {}, self.DEFAULTS, self.params.options);

  /**
   * Initialize.
   *
   * @return {Object} self
   */
  self.init = function () {
    self.win = self.topEditorWindow();

    self
      .initStyle()
      .initTemplate()
      .initUpload()
      .initSearch()
      .initRefresh()
      .initNotice()
      .initItems()
      .showNotice('loading')
      .request(function (response) {
        self.showItems(response);
        self.scrollToSelected();
      });

    return self;
  };

  /**
   * Initialize the style by loading the TinyMCE skin and configured style
   * sheet.
   *
   * @return {Object} self
   */
  self.initStyle = function () {
    self
      .loadStyleSheet(self.skinUrl)
      .loadStyleSheet(self.options.style);

    return self;
  };

  /**
   * Initialize and display the application template.
   *
   * @return {Object} self
   */
  self.initTemplate = function () {
    $('body').append(self.templates.application());

    return self;
  };

  /**
   * Initialize the upload button.
   *
   * @return {Object} self
   */
  self.initUpload = function () {
    self.$upload = $('#upload');

    if (self.options.upload) {
      self.$upload.on('click', self.triggerUpload);
    }
    else {
      self.$upload.parent().hide();
    }

    return self;
  };

  /**
   * Initialize the search field.
   *
   * @return {Object} self
   */
  self.initSearch = function () {
    self.$search = $('#search');

    if (self.options.search) {
      self.$search
        // Wait for a break in keystroke of 250ms before firing the request.
        // This prevents a request for every keystroke.
        .on('keyup', $.debounce(250, self.requestAndShowItems))
        .placeholder();
    }
    else {
      self.$search.parent().hide();
    }

    return self;
  };

  /**
   * Initialize the refresh button.
   *
   * @return {Object} self
   */
  self.initRefresh = function () {
    self.$refresh = $('#refresh')
      .on('click', self.requestAndShowItems);

    return self;
  };

  /**
   * Initialize the notice container.
   *
   * @return {Object} self
   */
  self.initNotice = function () {
    self.$notice = $('#notice');

    return self;
  };

  /**
   * Initialize the list of items.
   *
   * @return {Object} self
   */
  self.initItems = function () {
    self.$items = $('#items')
      .on('click', 'a', function (event) {
        event.preventDefault();

        self.toggleSelect($(this).parent());
      });

    return self;
  };

  /**
   * Load a style sheet by appending a <link> tag to the <head>.
   *
   * @param  {string} href URL of the style sheet.
   * @return {Object} self
   */
  self.loadStyleSheet = function (href) {
    if (!href) {
      return self;
    }

    var $styleSheet = $('<link rel="stylesheet">');

    $styleSheet
      .attr('href', href)
      .appendTo('head');

    return self;
  };

  /**
   * Get the foremost window being displayed by TinyMCE. Returns the TinyVision
   * window when TinyVision is in focus.
   *
   * @see    {@link http://www.tinymce.com/wiki.php/api4:class.tinymce.ui.Window}
   * @return {tinymce.ui.Window} Foremost window being displayed by TinyMCE.
   */
  self.topEditorWindow = function () {
    var windows = self.editor.windowManager.windows;

    return windows[windows.length - 1];
  };

  /**
   * Trigger the configured upload functionality, either a TinyMCE command or
   * standard callback function.
   *
   * @return {boolean} Whether the upload functionality was triggered.
   */
  self.triggerUpload = function () {
    var upload = self.options.upload,
        triggered = false,
        uploadWindow;

    if (!upload) {
      return triggered;
    }

    if (typeof upload === 'string') {
      triggered = self.editor.execCommand(upload);
    }
    else if ($.isFunction(upload)) {
      triggered = upload.call(self.editor);
    }

    uploadWindow = self.topEditorWindow();

    // If a new TinyMCE window was opened as a result, refresh the list of items
    // when it's closed.
    if (uploadWindow !== self.win) {
      uploadWindow.on('close', self.requestAndShowItems);
    }

    return triggered;
  };

  /**
   * Trigger UI changes that show a refresh is in progress.
   *
   * @return {Object} self
   */
  self.startRefresh = function () {
    self.$refresh.parent().addClass('tv-refresh-loading mce-disabled');

    return self;
  };

  /**
   * Trigger UI changes that show a refresh has completed.
   *
   * @return {Object} self
   */
  self.stopRefresh = function () {
    self.$refresh.parent().removeClass('tv-refresh-loading mce-disabled');

    return self;
  };

  /**
   * Get the currently selected item.
   *
   * @return {jQuery} jQuery item element.
   */
  self.selected = function () {
    return self.$items.children('.selected');
  };

  /**
   * Get the currently selected item's data.
   *
   * @return {?Object} Item data.
   */
  self.selectedData = function () {
    return self.selected().data('tv.data');
  };

  /**
   * Check whether an item is currently selected.
   *
   * @param  {jQuery} $item jQuery item element.
   * @return {boolean} Whether the item it currently selected.
   */
  self.isSelected = function ($item) {
    return $item.hasClass('selected');
  };

  /**
   * Select an item. Since only one item can be selected at once, the currently
   * selected item is also deselected.
   *
   * @param  {jQuery} $item jQuery item element.
   * @return {jQuery} jQuery item element.
   */
  self.select = function ($item) {
    self.deselect(self.selected());

    return $item.addClass('selected');
  };

  /**
   * Deselect an item.
   *
   * @param  {jQuery} $item jQuery item element.
   * @return {jQuery} jQuery item element.
   */
  self.deselect = function ($item) {
    return $item.removeClass('selected');
  };

  /**
   * Toggle the selected state of an item.
   *
   * @param  {jQuery} $item jQuery item element.
   * @return {jQuery} jQuery item element.
   */
  self.toggleSelect = function ($item) {
    return self.isSelected($item) ? self.deselect($item) : self.select($item);
  };

  /**
   * Scroll to the currently selected item.
   *
   * @return {jQuery} Currently selected item's jQuery element.
   */
  self.scrollToSelected = function () {
    var $selected = self.selected();

    if ($selected.length) {
      $.scrollTo($selected, 250, {
        margin: true,
        // Add an offset to account for the size of the fixed position toolbar.
        offset: { top: -self.$items.offset().top }
      });
    }
    
    return $selected;
  };

  /**
   * Show a notice by name.
   *
   * @param  {string} name Name of the notice.
   * @return {Object} self
   */
  self.showNotice = function (name) {
    var message = self.options.messages[name];

    if (message) {
      self.$notice
        .text(message)
        .show();
    }

    return self;
  };

  /**
   * Hide the currently displayed notice.
   *
   * @return {Object} self
   */
  self.hideNotice = function () {
    self.$notice
      .hide()
      .empty();

    return self;
  };

  /**
   * Build an element (and child elements) representing an item based on the
   * supplied data.
   *
   * @param  {Object} data Item's data.
   * @return {jQuery} New jQuery item element, unattached to the DOM.
   */
  self.buildItem = function (data) {
    var $item = $(self.templates.item(data));

    // Store the data on the element for easy access.
    $item.data('tv.data', data);

    // Select this item if its value matches the value of the TinyMCE field that
    // TinyVision was launched from.
    if (self.fieldValue === data.value) {
      self.select($item);
    }

    return $item;
  };

  /**
   * Build and show all items based on the supplied data.
   *
   * @param  {(Array|Object)} response Response containing items data.
   * @return {Object} self
   */
  self.showItems = function (response) {
    var data = self.responseData(response),
        items = [];

    if (data.length) {
      // Build each item and add the returned element to a holding array. This
      // way they can all be appended at once.
      $.each(data, function (index, datum) {
        items.push(self.buildItem(datum));
      });

      self.hideNotice();

      self.$items
        .empty()
        .append(items)
        .show()
        .find('img').unveil();
    }
    else {
      self
        .hideItems()
        .showNotice('empty');
    }

    return self;
  };

  /**
   * Hide the list of items.
   *
   * @return {Object} self
   */
  self.hideItems = function () {
    self.$items
      .hide()
      .empty();

    return self;
  };

  /**
   * Get the items data from the response. The array of objects can either be
   * returned directly or embedded within the `data` attribute of an object.
   *
   * @param  {(Array|Object)} response Response data.
   * @return {Object[]} Array of item data objects.
   */
  self.responseData = function (response) {
    if ($.isArray(response)) {
      return response;
    }
    else if ($.isPlainObject(response) && $.isArray(response.data)) {
      return response.data;
    }
    else {
      return [];
    }
  };

  /**
   * Make an ajax request for the items to display given the current search
   * query and type. Handles refresh UI changes and error message.
   *
   * @param  {Function} success Callback on successful response.
   * @return {jqXHR} jQuery ajax object that implements the Promise interface.
   */
  self.request = function (success) {
    return $.ajax({
      beforeSend: function () {
        self.startRefresh();
      },
      complete: function () {
        self.stopRefresh();
      },
      data: {
        q: self.$search.val(),
        type: self.type
      },
      dataType: 'json',
      error: function () {
        self
          .hideItems()
          .showNotice('error');
      },
      success: success,
      url: self.options.source
    });
  };

  /**
   * Make an ajax request and display the subsequent items. A convenience
   * method for a common sequence.
   *
   * @return {jqXHR} jQuery ajax object that implements the Promise interface.
   */
  self.requestAndShowItems = function () {
    return self.request(self.showItems);
  };

  // Expose a method for the TinyVision parent window to get the currently
  // selected item's data.
  window.selected = self.selectedData;

  // Kick things off.
  self.init();
})(window, jQuery, Handlebars);

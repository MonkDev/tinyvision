(function (window, $, undefined) {
  'use strict';

  var self = {};

  self.editor = window.top.tinymce.activeEditor;
  self.win = null;
  self.params = self.editor.windowManager.getParams();
  self.fieldValue = self.params.fieldValue;
  self.skinUrl = self.params.skinUrl;
  self.type = self.params.type;
  self.$upload = $('#upload');
  self.$search = $('#search');
  self.$refresh = $('#refresh');
  self.$notice = $('#notice');
  self.$items = $('#items');

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

  self.options = $.extend(true, {}, self.DEFAULTS, self.params.options);

  self.init = function () {
    self.win = self.topEditorWindow();

    self
      .initStyle()
      .initUpload()
      .initSearch()
      .initRefresh()
      .initItems()
      .showNotice('loading')
      .request(function (data) {
        self.showItems(data);
        self.scrollToSelected();
      });

    return self;
  };

  self.initStyle = function () {
    self
      .loadStyleSheet(self.skinUrl)
      .loadStyleSheet(self.options.style);

    return self;
  };

  self.initUpload = function () {
    if (self.options.upload) {
      self.$upload.on('click', self.triggerUpload);
    }
    else {
      self.$upload.parent().hide();
    }

    return self;
  };

  self.initSearch = function () {
    if (self.options.search) {
      self.$search
        .on('keyup', $.debounce(250, self.requestAndShowItems))
        .placeholder();
    }
    else {
      self.$search.parent().hide();
    }

    return self;
  };

  self.initRefresh = function () {
    self.$refresh.on('click', self.requestAndShowItems);

    return self;
  };

  self.initItems = function () {
    self.$items.on('click', 'a', function (event) {
      event.preventDefault();

      self.toggleSelect($(this).parent());
    });

    return self;
  };

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

  self.topEditorWindow = function () {
    var windows = self.editor.windowManager.windows;

    return windows[windows.length - 1];
  };

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

    if (uploadWindow !== self.win) {
      uploadWindow.on('close', self.requestAndShowItems);
    }

    return triggered;
  };

  self.startRefresh = function () {
    self.$refresh.parent().addClass('tv-refresh-loading mce-disabled');

    return self;
  };

  self.stopRefresh = function () {
    self.$refresh.parent().removeClass('tv-refresh-loading mce-disabled');

    return self;
  };

  self.selected = function () {
    return self.$items.children('.selected');
  };

  self.selectedData = function () {
    return self.selected().data('tv.data');
  };

  self.isSelected = function ($item) {
    return $item.hasClass('selected');
  };

  self.select = function ($item) {
    self.deselect(self.selected());

    return $item.addClass('selected');
  };

  self.deselect = function ($item) {
    return $item.removeClass('selected');
  };

  self.toggleSelect = function ($item) {
    return self.isSelected($item) ? self.deselect($item) : self.select($item);
  };

  self.scrollToSelected = function () {
    var $selected = self.selected();

    if ($selected.length) {
      $.scrollTo($selected, 250, {
        margin: true,
        offset: { top: -self.$items.offset().top }
      });
    }
    
    return $selected;
  };

  self.showNotice = function (name) {
    var message = self.options.messages[name];

    if (message) {
      self.$notice
        .text(message)
        .show();
    }

    return self;
  };

  self.hideNotice = function () {
    self.$notice
      .hide()
      .empty();

    return self;
  };

  self.buildItem = function (data) {
    var $item = $('<li class="tv-item">'),
        $link = $('<a href="#" class="tv-item-link">'),
        $imageWrap = $('<div class="tv-item-image">'),
        $image = $('<img>'),
        $name = $('<div class="tv-item-name">'),
        name = data.name || '(untitled)';

    $item.data('tv.data', data);

    $link
      .attr('title', name)
      .appendTo($item);

    $image
      .attr('data-src', data.imageUrl)
      .appendTo($imageWrap);

    $name.text(name);

    $link.append($imageWrap, $name);

    if (self.fieldValue === data.value) {
      self.select($item);
    }

    return $item;
  };

  self.showItems = function (data) {
    var items = [];

    if (data.length) {
      $.each(data, function (index, datum) {
        items.push(self.buildItem(datum));
      });

      self.hideNotice();

      self.$items
        .empty()
        .append(items)
        .show()
        .find('img').show().unveil();
    }
    else {
      self
        .hideItems()
        .showNotice('empty');
    }

    return self;
  };

  self.hideItems = function () {
    self.$items
      .hide()
      .empty();

    return self;
  };

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

  self.requestAndShowItems = function () {
    return self.request(self.showItems);
  };

  window.selected = self.selectedData;

  self.init();
})(window, jQuery);

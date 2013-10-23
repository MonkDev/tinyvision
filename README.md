TinyVision
==========

A visual file selector for TinyMCE v4.

Out of the box, selecting files in TinyMCE is a rudimentary experience. You
can either enter a URL into a free-form text field or select the name of a file
from a drop-down list. On the other end of the spectrum, plugins like
[MoxieManager](http://www.moxiemanager.com) provide everything and the kitchen
sink to be your one-and-only file manager, requiring access to a file system
and being server-side language-specific. TinyVision is different. It's
purposely crafted to provide the best experience selecting files visually. Not
uploading or editing, removing red eye or adding borders. Just selecting.
TinyVision works purely with JSON, and files can be stored anywhere that's URL
accessible. We think you'll find it delightful.

Developed by [Monk Development](http://monkdev.com) for the
[Ekklesia 360](http://ekklesia360.com) CMS.

*   [Example](http://monkdev.github.io/tinyvision)
*   [Release Notes](https://github.com/MonkDev/tinyvision/releases)

Download
--------

Head over to [releases](https://github.com/MonkDev/tinyvision/releases) and
download a production-ready `tinyvision.zip` package. Unzip to your TinyMCE
`plugins` directory (or wherever you store TinyMCE plugins).

### Bower

[Bower](http://bower.io) is a package manager for the web. Once installed, Bower
can install TinyVision with a single command:

    bower install tinyvision

Usage
-----

After downloading TinyVision, add it to your TinyMCE config and setup a `source`
endpoint that returns the files to display.

### TinyMCE config

Configuring TinyMCE to use TinyVision is simple: add `tinyvision` to the list of
`plugins` (or `external_plugins` if stored outside of the TinyMCE directory) and
a `tinyvision` object with TinyVision-specific options:

```javascript
tinymce.init({
  plugins: 'tinyvision',
  tinyvision: {
    source: '/path/to/your/source.php'
  }
});
```

See below for the complete list of options.

### `source` endpoint

The `source` option you see above points to an endpoint that TinyVision requests
for the list of files to display. You need to build out this endpoint to return
JSON in the following format:

```json
[
  {
    "imageUrl": "/assets/images/breaking_bad_thumb.png",
    "name": "Breaking Bad",
    "value": "/assets/images/breaking_bad.png"
  },
  {
    "imageUrl": "/assets/images/the_newsroom_thumb.png",
    "name": "The Newsroom",
    "value": "/assets/images/the_newsroom.png"
  },
  {
    "imageUrl": "http://external-cdn.com/a1b2c3/homeland_thumb.png",
    "name": "Homeland",
    "value": "http://external-cdn.com/a1b2c3/homeland.png"
  }
]
```

Alternatively, the array of objects can be embedded in a `data` field:

```json
{
  "data": [...]
}
```

Each object represents a file and should contain three values:

*   **imageUrl** is the URL to the thumbnail image that's displayed. This can be
    any valid URL (relative, full, etc.).
*   **name** is the text that's displayed beneath the thumbnail image. This is
    automatically truncated to fit, but displayed in full on hover.
*   **value** is what's placed in the input field that TinyVision is launched
    from after a file is selected. This is usually the URL to the file, but can
    be any arbitrary string of text.

Options
-------

*   **messages** _object_

    The text of messages that are displayed. There are a number of different
    messages that can be customized:

    *   **empty** is displayed when there are no files to select. Default is
        `Sorry, there are no selections.`.
    *   **error** is displayed when the `source` endpoint returns an error.
        Default is `Sorry, there was a problem loading.`.
    *   **loading** is displayed during initial load. Default is `Loading...`.

    ```javascript
    tinymce.init({
      tinyvision: {
        messages: {
          empty: 'No files to select!'
        }
      }
    });
    ```

    ----------------------------------------------------------------------------
*   **search** _boolean_

    Whether to display the search field. Default is `true`.

    ```javascript
    tinymce.init({
      tinyvision: {
        search: false
      }
    });
    ```

    ----------------------------------------------------------------------------
*   **source** _string_

    The endpoint URL that's requested for the list of files to display. Two
    query string parameters are included:

    *   **type** is a TinyMCE value that identifies the type of field TinyVision
        was launched from. Useful for limiting the type of files to display. For
        example, the image plugin uses `image`, the link plugin uses `file`, and
        the media/video plugin uses `media`.
    *   **q** is the search value, which is empty when there's no search.

    The response should be a JSON array of object as described in the "Usage"
    section above. The array can also be embedded in a `data` field if desired.

    ```javascript
    tinymce.init({
      tinyvision: {
        source: '/media/tinyvision.json'
      }
    });
    ```

    ----------------------------------------------------------------------------
*   **style** _string, null_

    An optional style sheet URL for custom styling. While TinyVision comes with
    an elegant default skin (that inherits from your TinyMCE skin), it's HTML
    markup is filled with classes to hook into for as much customization as you
    desire. Check out `tinyvision.css` as a baseline to start from. Default is
    `null`.

    ```javascript
    tinymce.init({
      tinyvision: {
        style: '/assets/stylesheets/tinyvision_custom.css'
      }
    });
    ```

    ----------------------------------------------------------------------------
*   **upload** _string, function, null_

    While TinyVision purposely doesn't provide upload functionality to keep
    things simple, this gives you the ability to hook in your own when the
    "Upload" button is pressed. A _string_ value is sent to
    `editor.execCommand`, which is used by many TinyMCE plugins to perform
    commands. A _function_ value is simply called, allowing you the flexibility
    to do whatever's necessary to open your custom uploader. Default is `null`,
    which hides the "Upload" button.

    Here at Monk, we built a custom TinyMCE plugin that wraps our drag-and-drop
    file uploader. It adds the command `monkmediauploader`, which is the value
    we specify for this option.

    ```javascript
    tinymce.init({
      tinyvision: {
        upload: function () {
          $('#uploader').show();
        }
      }
    });
    ```

Command
-------

While TinyVision registers itself as the default file browser through TinyMCE's
`file_browser_callback` option, it can also be opened programmatically. This is
particularly useful for custom TinyMCE plugins to use TinyVision. For example:

```javascript
editor.execCommand('tinyvision', {
  fieldId: 'imageUrl',
  fieldValue: document.getElementById('imageUrl').value,
  type: 'image',
  win: myPluginWindow
});
```

This opens TinyVision and configures it to populate the `imageUrl` field in
`myPluginWindow` with the selected value. There are four required config
options:

*   **fieldId** is the ID of the field to populate with the selected value.
*   **fieldValue** is the current value of the field when TinyVision is opened.
*   **type** is the type of files to display. This can be any arbitrary value.
*   **win** is the TinyMCE `Window` instance that opens TinyVision. This is
    usually another plugin window.

Development
-----------

TinyVision requires [Node.js](http://nodejs.org) and [npm](https://npmjs.org)
for development. [Grunt](http://gruntjs.com) is used for the build system, and
[Bower](http://bower.io) for front-end package management.

Install development dependencies using npm:

    npm install

To build, run Grunt:

    grunt

During development, keep Grunt watching to automatically build on changes:

    grunt watch

It's also helpful, during development, to symlink the `build` directory into
your project's TinyMCE `plugins` directory to see your work in real-time.

Feedback
--------

Please open an issue to request a feature, submit a bug report, or provide
feedback. We'd love to hear from you!

Contributing
------------

1.  Fork it.
2.  Create your feature branch (`git checkout -b my-new-feature`).
3.  Commit your changes (`git commit -am 'Added some feature'`).
4.  Push to the branch (`git push origin my-new-feature`).
5.  Create a new Pull Request.

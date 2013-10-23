tinymce.init({
  selector: 'textarea',
  plugins: 'image',
  external_plugins: {
    'tinyvision': 'http://monkdev.github.io/tinyvision/lib/tinyvision/build/plugin.min.js'
  },
  height: '300',
  toolbar: 'image',
  menubar: false,
  statusbar: false,
  tinyvision: {
    source: 'http://monkdev.github.io/tinyvision/source.json',
    upload: function () {
      var message = 'While TinyVision purposely doesn\'t provide upload functionality to keep things simple, it does ' +
                    'provide the ability to hook in your own when the "Upload" button is pressed. Or you can disable ' +
                    'it completely.';

      tinymce.activeEditor.windowManager.alert(message);
    }
  }
});

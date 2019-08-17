;(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // CJS
    module.exports = factory(
      require('./tool.js'),
      require('blueimp-md5')
    );
  } else {
    // browser or other
    root.MxWcAsset = factory(
      root.MxWcTool,
      root.md5
    );
  }
})(this, function(T, md5, undefined) {
  "use strict";

  // link http:, https: or data:
  function getFilename({link, extension, mimeType, prefix}) {
    const name = generateName(link, prefix);
    const ext  = getFileExtension(link, extension, mimeType);
    return ext ? [name, ext].join('.') : name;
  }

  function getFilenameByContent({content: content, extension, prefix}) {
    const name = generateName(content, prefix);
    const ext = extension;
    return ext ? [name, ext].join('.') : name;
  }

  function calcInfo(link, storageInfo, mimeType, prefix) {
    const {assetFolder, assetRelativePath} = storageInfo;
    const assetName = getFilename({
      link: link,
      prefix: prefix,
      mimeType: mimeType
    })
    const filename = T.joinPath(assetFolder, assetName);
    const assetUrl = T.joinPath(assetRelativePath, assetName);
    return {filename: filename, url: assetUrl};
  }


  /**
   * Generate asset name according to content
   *
   * @param {String} identifier
   *   Normally, it's a url
   *
   * @param {String} prefix - optional
   *   Use prefix to avoid asset name conflict.
   *   currently we use clipId as prefix.
   *
   * @return {String} the generated asset name
   *
   */
  function generateName(identifier, prefix) {
    const parts = [];
    parts.push(md5(identifier))
    if (prefix) { parts.unshift(prefix); }
    return parts.join('-');
  }

  function getFileExtension(link, extension, mimeType) {
    try{
      let url = new URL(link);
      if(url.protocol === 'data:') {
        //data:[<mediatype>][;base64],<data>
        const mimeType = url.pathname.split(';')[0];
        return mimeType2Extension(mimeType);
      } else {
        // http OR https
        if(extension) { return extension }
        let ext = T.getUrlExtension(url.href)
        if(ext) {
          return ext;
        } else {
          if(mimeType) {
            return mimeType2Extension(mimeType);
          } else {
            return null;
          }
        }
      }
    } catch(e) {
      // invalid link
      console.warn('mx-wc', e);
      return null;
    }
  }

  /*
   *
   * FIXME
   * The image formats supported by Firefox are:
   *
   * - JPEG
   * - GIF, including animated GIFs
   * - PNG
   * - APNG
   * - SVG
   * - BMP
   * BMP ICO
   * - PNG ICO
   * - WebP
   */
  function mimeType2Extension(mimeType) {
    const ext = {
      'text/plain'    : 'txt',
      'text/css'      : 'css',
      'image/gif'     : 'gif',
      'image/apng'    : 'apng',
      'image/png'     : 'png',
      'image/bmp'     : 'bmp',
      'image/x-ms-bmp': 'bmp',
      'image/jpeg'    : 'jpg',
      'image/svg+xml' : 'svg',
      'image/x-icon'  : 'ico',
      'image/webp'    : 'webp',
    }[mimeType]
    return ext;
  }

  return {
    getFilename: getFilename,
    getFilenameByContent: getFilenameByContent,
    calcInfo: calcInfo,
  }
});

export enum CookieKey {
  isDark = 'isdark',
  svtSort = 'sort_option',
  svtFollow = 'filter_follow',
  svtFilter = 'filter_opt'

}

const cookies = {
  getCookie: function (key: CookieKey): (string | undefined) {
    // console.debug('get cookie',key)
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + key.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  },

  setCookie: function (key: CookieKey, value: string, options: any = {}) {
    // console.debug('set cookie',key)
    options = {
      path: '/',
      // 如果需要，可以在这里添加其他默认值
      ...options
    };

    if (options.expires instanceof Date) {
      options.expires = options.expires.toUTCString();
    }

    let updatedCookie = encodeURIComponent(key) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
      updatedCookie += "; " + optionKey;
      let optionValue = options[optionKey];
      if (optionValue !== true) {
        updatedCookie += "=" + optionValue;
      }
    }
    document.cookie = updatedCookie;
  }
}

export default cookies;
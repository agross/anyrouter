module.exports = {
  chainWebpack: config => {
    config.module
      .rule('i18n')
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use('i18n')
      .loader('@intlify/vue-i18n-loader');

    config.plugin('copy')
      .tap(([options]) => {
        options[0].ignore.push('favicon/**/*');
        return [options];
      });
  }
}

const path = require("path");
const os = require("os");
const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,

  chainWebpack: (config) => {
    const projectCache = path.join(os.tmpdir(), "frontend_sgmpe-cache");

    config.module
      .rule("js")
      .use("babel-loader")
      .tap((options) => ({
        ...options,
        cacheDirectory: path.join(projectCache, "babel-loader"),
      }));

    config.plugin("eslint").tap((args) => {
      args[0] = {
        ...args[0],
        cacheLocation: path.join(projectCache, "eslint"),
      };
      return args;
    });
  },

  pluginOptions: {
    vuetify: {
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
    },
  },
});

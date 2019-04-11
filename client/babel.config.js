module.exports = {
  presets: [
    ["@babel/preset-env", {
      "modules": false
    }],
    // ["@babel/preset-stage-2", {
    //   decoratorsLegacy: true
    // }]
    // ["@babel/plugin-proposal-decorators", {
    //   "legacy": true
    // }],
    // "@babel/plugin-proposal-function-sent",
    // "@babel/plugin-proposal-export-namespace-from",
    // "@babel/plugin-proposal-numeric-separator",
    // "@babel/plugin-proposal-throw-expressions"
  ],
  plugins: [
    "transform-vue-jsx",
    "@babel/plugin-transform-runtime",
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk"
      }
    ]
  ]
}

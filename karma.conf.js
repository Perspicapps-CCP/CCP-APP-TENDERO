// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    coverageReporter: {
      reporters: [
        { type: 'html' },
        { type: 'lcov' }, // para herramientas de CI/CD
        { type: 'text-summary' }, // útil para ver resultados en la consola
      ],
      dir: require('path').join(__dirname, './coverage/ccp-web'),
      subdir: '.',
      check: {
        global: {
          statements: 70,
        },
      },
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    browsers: ['Chrome', 'ChromeHeadless'], // añadido ChromeHeadless para CI
    singleRun: true,
    restartOnFileChange: true,
  });
};

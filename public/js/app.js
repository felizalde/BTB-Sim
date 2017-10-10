requirejs.config({
    waitSeconds: 200,
    baseUrl: 'js/app',
    paths: {

        babel: '../libs/requirejs-babel/babel',
        polyfill: '../libs/requirejs-babel/polyfill.min',
        es6: '../libs/requirejs-babel/es6',
        libs: '../libs',
        react: '../libs/react/dist/react-with-addons.min',
        'react-dom': '../libs/react/dist/react-dom.min',
        classnames: '../libs/classnames/index'

    },
    pragmasOnSave: {
        'excludeBabel': true,
    },
    shim: {
      babel: {
          deps: ['polyfill']
      }
    },
    out: 'build.js'
});

// requirejs.config({
//     baseUrl: 'js/app',
//     paths: {
//         libs: '../libs'
//     },
//     waitSeconds : 15,
//     urlArgs: "bust=" + (new Date()).getTime()
// });

requirejs(['main']);

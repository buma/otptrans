/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Meta info, accessible in the global scope unless you use AMD option.
 */

require.loader = 'component';

/**
 * Internal helper object, contains a sorting function for semantiv versioning
 */
require.helper = {};
require.helper.semVerSort = function(a, b) {
  var aArray = a.version.split('.');
  var bArray = b.version.split('.');
  for (var i=0; i<aArray.length; ++i) {
    var aInt = parseInt(aArray[i], 10);
    var bInt = parseInt(bArray[i], 10);
    if (aInt === bInt) {
      var aLex = aArray[i].substr((""+aInt).length);
      var bLex = bArray[i].substr((""+bInt).length);
      if (aLex === '' && bLex !== '') return 1;
      if (aLex !== '' && bLex === '') return -1;
      if (aLex !== '' && bLex !== '') return aLex > bLex ? 1 : -1;
      continue;
    } else if (aInt > bInt) {
      return 1;
    } else {
      return -1;
    }
  }
  return 0;
}

/**
 * Find and require a module which name starts with the provided name.
 * If multiple modules exists, the highest semver is used. 
 * This function can only be used for remote dependencies.

 * @param {String} name - module name: `user~repo`
 * @param {Boolean} returnPath - returns the canonical require path if true, 
 *                               otherwise it returns the epxorted module
 */
require.latest = function (name, returnPath) {
  function showError(name) {
    throw new Error('failed to find latest module of "' + name + '"');
  }
  // only remotes with semvers, ignore local files conataining a '/'
  var versionRegexp = /(.*)~(.*)@v?(\d+\.\d+\.\d+[^\/]*)$/;
  var remoteRegexp = /(.*)~(.*)/;
  if (!remoteRegexp.test(name)) showError(name);
  var moduleNames = Object.keys(require.modules);
  var semVerCandidates = [];
  var otherCandidates = []; // for instance: name of the git branch
  for (var i=0; i<moduleNames.length; i++) {
    var moduleName = moduleNames[i];
    if (new RegExp(name + '@').test(moduleName)) {
        var version = moduleName.substr(name.length+1);
        var semVerMatch = versionRegexp.exec(moduleName);
        if (semVerMatch != null) {
          semVerCandidates.push({version: version, name: moduleName});
        } else {
          otherCandidates.push({version: version, name: moduleName});
        } 
    }
  }
  if (semVerCandidates.concat(otherCandidates).length === 0) {
    showError(name);
  }
  if (semVerCandidates.length > 0) {
    var module = semVerCandidates.sort(require.helper.semVerSort).pop().name;
    if (returnPath === true) {
      return module;
    }
    return require(module);
  }
  // if the build contains more than one branch of the same module
  // you should not use this funciton
  var module = otherCandidates.sort(function(a, b) {return a.name > b.name})[0].name;
  if (returnPath === true) {
    return module;
  }
  return require(module);
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("component~trim@0.0.1", Function("exports, module",
"\n\
exports = module.exports = trim;\n\
\n\
function trim(str){\n\
  if (str.trim) return str.trim();\n\
  return str.replace(/^\\s*|\\s*$/g, '');\n\
}\n\
\n\
exports.left = function(str){\n\
  if (str.trimLeft) return str.trimLeft();\n\
  return str.replace(/^\\s*/, '');\n\
};\n\
\n\
exports.right = function(str){\n\
  if (str.trimRight) return str.trimRight();\n\
  return str.replace(/\\s*$/, '');\n\
};\n\
\n\
//# sourceURL=components/component/trim/0.0.1/index.js"
));

require.modules["component-trim"] = require.modules["component~trim@0.0.1"];
require.modules["component~trim"] = require.modules["component~trim@0.0.1"];
require.modules["trim"] = require.modules["component~trim@0.0.1"];


require.register("component~type@1.1.0", Function("exports, module",
"/**\n\
 * toString ref.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Return the type of `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(val){\n\
  switch (toString.call(val)) {\n\
    case '[object Date]': return 'date';\n\
    case '[object RegExp]': return 'regexp';\n\
    case '[object Arguments]': return 'arguments';\n\
    case '[object Array]': return 'array';\n\
    case '[object Error]': return 'error';\n\
  }\n\
\n\
  if (val === null) return 'null';\n\
  if (val === undefined) return 'undefined';\n\
  if (val !== val) return 'nan';\n\
  if (val && val.nodeType === 1) return 'element';\n\
\n\
  val = val.valueOf\n\
    ? val.valueOf()\n\
    : Object.prototype.valueOf.apply(val)\n\
\n\
  return typeof val;\n\
};\n\
\n\
//# sourceURL=components/component/type/1.1.0/index.js"
));

require.modules["component-type"] = require.modules["component~type@1.1.0"];
require.modules["component~type"] = require.modules["component~type@1.1.0"];
require.modules["type"] = require.modules["component~type@1.1.0"];


require.register("component~querystring@1.3.3", Function("exports, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var encode = encodeURIComponent;\n\
var decode = decodeURIComponent;\n\
var trim = require('component~trim@0.0.1');\n\
var type = require('component~type@1.1.0');\n\
\n\
var pattern = /(\\w+)\\[(\\d+)\\]/\n\
\n\
/**\n\
 * Parse the given query `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Object}\n\
 * @api public\n\
 */\n\
\n\
exports.parse = function(str){\n\
  if ('string' != typeof str) return {};\n\
\n\
  str = trim(str);\n\
  if ('' == str) return {};\n\
  if ('?' == str.charAt(0)) str = str.slice(1);\n\
\n\
  var obj = {};\n\
  var pairs = str.split('&');\n\
  for (var i = 0; i < pairs.length; i++) {\n\
    var parts = pairs[i].split('=');\n\
    var key = decode(parts[0]);\n\
    var m;\n\
\n\
    if (m = pattern.exec(key)) {\n\
      obj[m[1]] = obj[m[1]] || [];\n\
      obj[m[1]][m[2]] = decode(parts[1]);\n\
      continue;\n\
    }\n\
\n\
    obj[parts[0]] = null == parts[1]\n\
      ? ''\n\
      : decode(parts[1]);\n\
  }\n\
\n\
  return obj;\n\
};\n\
\n\
/**\n\
 * Stringify the given `obj`.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
exports.stringify = function(obj){\n\
  if (!obj) return '';\n\
  var pairs = [];\n\
\n\
  for (var key in obj) {\n\
    var value = obj[key];\n\
\n\
    if ('array' == type(value)) {\n\
      for (var i = 0; i < value.length; ++i) {\n\
        pairs.push(encode(key + '[' + i + ']') + '=' + encode(value[i]));\n\
      }\n\
      continue;\n\
    }\n\
\n\
    pairs.push(encode(key) + '=' + encode(obj[key]));\n\
  }\n\
\n\
  return pairs.join('&');\n\
};\n\
\n\
//# sourceURL=components/component/querystring/1.3.3/index.js"
));

require.modules["component-querystring"] = require.modules["component~querystring@1.3.3"];
require.modules["component~querystring"] = require.modules["component~querystring@1.3.3"];
require.modules["querystring"] = require.modules["component~querystring@1.3.3"];


require.register("components~handlebars.js@v3.0.3", Function("exports, module",
"/*!\n\
\n\
 handlebars v3.0.3\n\
\n\
Copyright (C) 2011-2014 by Yehuda Katz\n\
\n\
Permission is hereby granted, free of charge, to any person obtaining a copy\n\
of this software and associated documentation files (the \"Software\"), to deal\n\
in the Software without restriction, including without limitation the rights\n\
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n\
copies of the Software, and to permit persons to whom the Software is\n\
furnished to do so, subject to the following conditions:\n\
\n\
The above copyright notice and this permission notice shall be included in\n\
all copies or substantial portions of the Software.\n\
\n\
THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n\
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n\
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n\
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n\
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n\
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n\
THE SOFTWARE.\n\
\n\
@license\n\
*/\n\
(function webpackUniversalModuleDefinition(root, factory) {\n\
\tif(typeof exports === 'object' && typeof module === 'object')\n\
\t\tmodule.exports = factory();\n\
\telse if(typeof define === 'function' && define.amd)\n\
\t\tdefine(factory);\n\
\telse if(typeof exports === 'object')\n\
\t\texports[\"Handlebars\"] = factory();\n\
\telse\n\
\t\troot[\"Handlebars\"] = factory();\n\
})(this, function() {\n\
return /******/ (function(modules) { // webpackBootstrap\n\
/******/ \t// The module cache\n\
/******/ \tvar installedModules = {};\n\
\n\
/******/ \t// The require function\n\
/******/ \tfunction __webpack_require__(moduleId) {\n\
\n\
/******/ \t\t// Check if module is in cache\n\
/******/ \t\tif(installedModules[moduleId])\n\
/******/ \t\t\treturn installedModules[moduleId].exports;\n\
\n\
/******/ \t\t// Create a new module (and put it into the cache)\n\
/******/ \t\tvar module = installedModules[moduleId] = {\n\
/******/ \t\t\texports: {},\n\
/******/ \t\t\tid: moduleId,\n\
/******/ \t\t\tloaded: false\n\
/******/ \t\t};\n\
\n\
/******/ \t\t// Execute the module function\n\
/******/ \t\tmodules[moduleId].call(module.exports, module, module.exports, __webpack_require__);\n\
\n\
/******/ \t\t// Flag the module as loaded\n\
/******/ \t\tmodule.loaded = true;\n\
\n\
/******/ \t\t// Return the exports of the module\n\
/******/ \t\treturn module.exports;\n\
/******/ \t}\n\
\n\
\n\
/******/ \t// expose the modules object (__webpack_modules__)\n\
/******/ \t__webpack_require__.m = modules;\n\
\n\
/******/ \t// expose the module cache\n\
/******/ \t__webpack_require__.c = installedModules;\n\
\n\
/******/ \t// __webpack_public_path__\n\
/******/ \t__webpack_require__.p = \"\";\n\
\n\
/******/ \t// Load entry module and return exports\n\
/******/ \treturn __webpack_require__(0);\n\
/******/ })\n\
/************************************************************************/\n\
/******/ ([\n\
/* 0 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t'use strict';\n\
\n\
\tvar _interopRequireWildcard = __webpack_require__(8)['default'];\n\
\n\
\texports.__esModule = true;\n\
\n\
\tvar _runtime = __webpack_require__(1);\n\
\n\
\tvar _runtime2 = _interopRequireWildcard(_runtime);\n\
\n\
\t// Compiler imports\n\
\n\
\tvar _AST = __webpack_require__(2);\n\
\n\
\tvar _AST2 = _interopRequireWildcard(_AST);\n\
\n\
\tvar _Parser$parse = __webpack_require__(3);\n\
\n\
\tvar _Compiler$compile$precompile = __webpack_require__(4);\n\
\n\
\tvar _JavaScriptCompiler = __webpack_require__(5);\n\
\n\
\tvar _JavaScriptCompiler2 = _interopRequireWildcard(_JavaScriptCompiler);\n\
\n\
\tvar _Visitor = __webpack_require__(6);\n\
\n\
\tvar _Visitor2 = _interopRequireWildcard(_Visitor);\n\
\n\
\tvar _noConflict = __webpack_require__(7);\n\
\n\
\tvar _noConflict2 = _interopRequireWildcard(_noConflict);\n\
\n\
\tvar _create = _runtime2['default'].create;\n\
\tfunction create() {\n\
\t  var hb = _create();\n\
\n\
\t  hb.compile = function (input, options) {\n\
\t    return _Compiler$compile$precompile.compile(input, options, hb);\n\
\t  };\n\
\t  hb.precompile = function (input, options) {\n\
\t    return _Compiler$compile$precompile.precompile(input, options, hb);\n\
\t  };\n\
\n\
\t  hb.AST = _AST2['default'];\n\
\t  hb.Compiler = _Compiler$compile$precompile.Compiler;\n\
\t  hb.JavaScriptCompiler = _JavaScriptCompiler2['default'];\n\
\t  hb.Parser = _Parser$parse.parser;\n\
\t  hb.parse = _Parser$parse.parse;\n\
\n\
\t  return hb;\n\
\t}\n\
\n\
\tvar inst = create();\n\
\tinst.create = create;\n\
\n\
\t_noConflict2['default'](inst);\n\
\n\
\tinst.Visitor = _Visitor2['default'];\n\
\n\
\tinst['default'] = inst;\n\
\n\
\texports['default'] = inst;\n\
\tmodule.exports = exports['default'];\n\
\n\
/***/ },\n\
/* 1 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t'use strict';\n\
\n\
\tvar _interopRequireWildcard = __webpack_require__(8)['default'];\n\
\n\
\texports.__esModule = true;\n\
\n\
\tvar _import = __webpack_require__(9);\n\
\n\
\tvar base = _interopRequireWildcard(_import);\n\
\n\
\t// Each of these augment the Handlebars object. No need to setup here.\n\
\t// (This is done to easily share code between commonjs and browse envs)\n\
\n\
\tvar _SafeString = __webpack_require__(10);\n\
\n\
\tvar _SafeString2 = _interopRequireWildcard(_SafeString);\n\
\n\
\tvar _Exception = __webpack_require__(11);\n\
\n\
\tvar _Exception2 = _interopRequireWildcard(_Exception);\n\
\n\
\tvar _import2 = __webpack_require__(12);\n\
\n\
\tvar Utils = _interopRequireWildcard(_import2);\n\
\n\
\tvar _import3 = __webpack_require__(13);\n\
\n\
\tvar runtime = _interopRequireWildcard(_import3);\n\
\n\
\tvar _noConflict = __webpack_require__(7);\n\
\n\
\tvar _noConflict2 = _interopRequireWildcard(_noConflict);\n\
\n\
\t// For compatibility and usage outside of module systems, make the Handlebars object a namespace\n\
\tfunction create() {\n\
\t  var hb = new base.HandlebarsEnvironment();\n\
\n\
\t  Utils.extend(hb, base);\n\
\t  hb.SafeString = _SafeString2['default'];\n\
\t  hb.Exception = _Exception2['default'];\n\
\t  hb.Utils = Utils;\n\
\t  hb.escapeExpression = Utils.escapeExpression;\n\
\n\
\t  hb.VM = runtime;\n\
\t  hb.template = function (spec) {\n\
\t    return runtime.template(spec, hb);\n\
\t  };\n\
\n\
\t  return hb;\n\
\t}\n\
\n\
\tvar inst = create();\n\
\tinst.create = create;\n\
\n\
\t_noConflict2['default'](inst);\n\
\n\
\tinst['default'] = inst;\n\
\n\
\texports['default'] = inst;\n\
\tmodule.exports = exports['default'];\n\
\n\
/***/ },\n\
/* 2 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t'use strict';\n\
\n\
\texports.__esModule = true;\n\
\tvar AST = {\n\
\t  Program: function Program(statements, blockParams, strip, locInfo) {\n\
\t    this.loc = locInfo;\n\
\t    this.type = 'Program';\n\
\t    this.body = statements;\n\
\n\
\t    this.blockParams = blockParams;\n\
\t    this.strip = strip;\n\
\t  },\n\
\n\
\t  MustacheStatement: function MustacheStatement(path, params, hash, escaped, strip, locInfo) {\n\
\t    this.loc = locInfo;\n\
\t    this.type = 'MustacheStatement';\n\
\n\
\t    this.path = path;\n\
\t    this.params = params || [];\n\
\t    this.hash = hash;\n\
\t    this.escaped = escaped;\n\
\n\
\t    this.strip = strip;\n\
\t  },\n\
\n\
\t  BlockStatement: function BlockStatement(path, params, hash, program, inverse, openStrip, inverseStrip, closeStrip, locInfo) {\n\
\t    this.loc = locInfo;\n\
\t    this.type = 'BlockStatement';\n\
\n\
\t    this.path = path;\n\
\t    this.params = params || [];\n\
\t    this.hash = hash;\n\
\t    this.program = program;\n\
\t    this.inverse = inverse;\n\
\n\
\t    this.openStrip = openStrip;\n\
\t    this.inverseStrip = inverseStrip;\n\
\t    this.closeStrip = closeStrip;\n\
\t  },\n\
\n\
\t  PartialStatement: function PartialStatement(name, params, hash, strip, locInfo) {\n\
\t    this.loc = locInfo;\n\
\t    this.type = 'PartialStatement';\n\
\n\
\t    this.name = name;\n\
\t    this.params = params || [];\n\
\t    this.hash = hash;\n\
\n\
\t    this.indent = '';\n\
\t    this.strip = strip;\n\
\t  },\n\
\n\
\t  ContentStatement: function ContentStatement(string, locInfo) {\n\
\t    this.loc = locInfo;\n\
\t    this.type = 'ContentStatement';\n\
\t    this.original = this.value = string;\n\
\t  },\n\
\n\
\t  CommentStatement: function CommentStatement(comment, strip, locInfo) {\n\
\t    this.loc = locInfo;\n\
\t    this.type = 'CommentStatement';\n\
\t    this.value = comment;\n\
\n\
\t    this.strip = strip;\n\
\t  },\n\
\n\
\t  SubExpression: function SubExpression(path, params, hash, locInfo) {\n\
\t    this.loc = locInfo;\n\
\n\
\t    this.type = 'SubExpression';\n\
\t    this.path = path;\n\
\t    this.params = params || [];\n\
\t    this.hash = hash;\n\
\t  },\n\
\n\
\t  PathExpression: function PathExpression(data, depth, parts, original, locInfo) {\n\
\t    this.loc = locInfo;\n\
\t    this.type = 'PathExpression';\n\
\n\
\t    this.data = data;\n\
\t    this.original = original;\n\
\t    this.parts = parts;\n\
\t    this.depth = depth;\n\
\t  },\n\
\n\
\t  StringLiteral: function StringLiteral(string, locInfo) {\n\
\t    this.loc = locInfo;\n\
\t    this.type = 'StringLiteral';\n\
\t    this.original = this.value = string;\n\
\t  },\n\
\n\
\t  NumberLiteral: function NumberLiteral(number, locInfo) {\n\
\t    this.loc = locInfo;\n\
\t    this.type = 'NumberLiteral';\n\
\t    this.original = this.value = Number(number);\n\
\t  },\n\
\n\
\t  BooleanLiteral: function BooleanLiteral(bool, locInfo) {\n\
\t    this.loc = locInfo;\n\
\t    this.type = 'BooleanLiteral';\n\
\t    this.original = this.value = bool === 'true';\n\
\t  },\n\
\n\
\t  UndefinedLiteral: function UndefinedLiteral(locInfo) {\n\
\t    this.loc = locInfo;\n\
\t    this.type = 'UndefinedLiteral';\n\
\t    this.original = this.value = undefined;\n\
\t  },\n\
\n\
\t  NullLiteral: function NullLiteral(locInfo) {\n\
\t    this.loc = locInfo;\n\
\t    this.type = 'NullLiteral';\n\
\t    this.original = this.value = null;\n\
\t  },\n\
\n\
\t  Hash: function Hash(pairs, locInfo) {\n\
\t    this.loc = locInfo;\n\
\t    this.type = 'Hash';\n\
\t    this.pairs = pairs;\n\
\t  },\n\
\t  HashPair: function HashPair(key, value, locInfo) {\n\
\t    this.loc = locInfo;\n\
\t    this.type = 'HashPair';\n\
\t    this.key = key;\n\
\t    this.value = value;\n\
\t  },\n\
\n\
\t  // Public API used to evaluate derived attributes regarding AST nodes\n\
\t  helpers: {\n\
\t    // a mustache is definitely a helper if:\n\
\t    // * it is an eligible helper, and\n\
\t    // * it has at least one parameter or hash segment\n\
\t    helperExpression: function helperExpression(node) {\n\
\t      return !!(node.type === 'SubExpression' || node.params.length || node.hash);\n\
\t    },\n\
\n\
\t    scopedId: function scopedId(path) {\n\
\t      return /^\\.|this\\b/.test(path.original);\n\
\t    },\n\
\n\
\t    // an ID is simple if it only has one part, and that part is not\n\
\t    // `..` or `this`.\n\
\t    simpleId: function simpleId(path) {\n\
\t      return path.parts.length === 1 && !AST.helpers.scopedId(path) && !path.depth;\n\
\t    }\n\
\t  }\n\
\t};\n\
\n\
\t// Must be exported as an object rather than the root of the module as the jison lexer\n\
\t// must modify the object to operate properly.\n\
\texports['default'] = AST;\n\
\tmodule.exports = exports['default'];\n\
\n\
/***/ },\n\
/* 3 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t'use strict';\n\
\n\
\tvar _interopRequireWildcard = __webpack_require__(8)['default'];\n\
\n\
\texports.__esModule = true;\n\
\texports.parse = parse;\n\
\n\
\tvar _parser = __webpack_require__(14);\n\
\n\
\tvar _parser2 = _interopRequireWildcard(_parser);\n\
\n\
\tvar _AST = __webpack_require__(2);\n\
\n\
\tvar _AST2 = _interopRequireWildcard(_AST);\n\
\n\
\tvar _WhitespaceControl = __webpack_require__(15);\n\
\n\
\tvar _WhitespaceControl2 = _interopRequireWildcard(_WhitespaceControl);\n\
\n\
\tvar _import = __webpack_require__(16);\n\
\n\
\tvar Helpers = _interopRequireWildcard(_import);\n\
\n\
\tvar _extend = __webpack_require__(12);\n\
\n\
\texports.parser = _parser2['default'];\n\
\n\
\tvar yy = {};\n\
\t_extend.extend(yy, Helpers, _AST2['default']);\n\
\n\
\tfunction parse(input, options) {\n\
\t  // Just return if an already-compiled AST was passed in.\n\
\t  if (input.type === 'Program') {\n\
\t    return input;\n\
\t  }\n\
\n\
\t  _parser2['default'].yy = yy;\n\
\n\
\t  // Altering the shared object here, but this is ok as parser is a sync operation\n\
\t  yy.locInfo = function (locInfo) {\n\
\t    return new yy.SourceLocation(options && options.srcName, locInfo);\n\
\t  };\n\
\n\
\t  var strip = new _WhitespaceControl2['default']();\n\
\t  return strip.accept(_parser2['default'].parse(input));\n\
\t}\n\
\n\
/***/ },\n\
/* 4 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t'use strict';\n\
\n\
\tvar _interopRequireWildcard = __webpack_require__(8)['default'];\n\
\n\
\texports.__esModule = true;\n\
\texports.Compiler = Compiler;\n\
\texports.precompile = precompile;\n\
\texports.compile = compile;\n\
\n\
\tvar _Exception = __webpack_require__(11);\n\
\n\
\tvar _Exception2 = _interopRequireWildcard(_Exception);\n\
\n\
\tvar _isArray$indexOf = __webpack_require__(12);\n\
\n\
\tvar _AST = __webpack_require__(2);\n\
\n\
\tvar _AST2 = _interopRequireWildcard(_AST);\n\
\n\
\tvar slice = [].slice;\n\
\n\
\tfunction Compiler() {}\n\
\n\
\t// the foundHelper register will disambiguate helper lookup from finding a\n\
\t// function in a context. This is necessary for mustache compatibility, which\n\
\t// requires that context functions in blocks are evaluated by blockHelperMissing,\n\
\t// and then proceed as if the resulting value was provided to blockHelperMissing.\n\
\n\
\tCompiler.prototype = {\n\
\t  compiler: Compiler,\n\
\n\
\t  equals: function equals(other) {\n\
\t    var len = this.opcodes.length;\n\
\t    if (other.opcodes.length !== len) {\n\
\t      return false;\n\
\t    }\n\
\n\
\t    for (var i = 0; i < len; i++) {\n\
\t      var opcode = this.opcodes[i],\n\
\t          otherOpcode = other.opcodes[i];\n\
\t      if (opcode.opcode !== otherOpcode.opcode || !argEquals(opcode.args, otherOpcode.args)) {\n\
\t        return false;\n\
\t      }\n\
\t    }\n\
\n\
\t    // We know that length is the same between the two arrays because they are directly tied\n\
\t    // to the opcode behavior above.\n\
\t    len = this.children.length;\n\
\t    for (var i = 0; i < len; i++) {\n\
\t      if (!this.children[i].equals(other.children[i])) {\n\
\t        return false;\n\
\t      }\n\
\t    }\n\
\n\
\t    return true;\n\
\t  },\n\
\n\
\t  guid: 0,\n\
\n\
\t  compile: function compile(program, options) {\n\
\t    this.sourceNode = [];\n\
\t    this.opcodes = [];\n\
\t    this.children = [];\n\
\t    this.options = options;\n\
\t    this.stringParams = options.stringParams;\n\
\t    this.trackIds = options.trackIds;\n\
\n\
\t    options.blockParams = options.blockParams || [];\n\
\n\
\t    // These changes will propagate to the other compiler components\n\
\t    var knownHelpers = options.knownHelpers;\n\
\t    options.knownHelpers = {\n\
\t      helperMissing: true,\n\
\t      blockHelperMissing: true,\n\
\t      each: true,\n\
\t      'if': true,\n\
\t      unless: true,\n\
\t      'with': true,\n\
\t      log: true,\n\
\t      lookup: true\n\
\t    };\n\
\t    if (knownHelpers) {\n\
\t      for (var _name in knownHelpers) {\n\
\t        if (_name in knownHelpers) {\n\
\t          options.knownHelpers[_name] = knownHelpers[_name];\n\
\t        }\n\
\t      }\n\
\t    }\n\
\n\
\t    return this.accept(program);\n\
\t  },\n\
\n\
\t  compileProgram: function compileProgram(program) {\n\
\t    var childCompiler = new this.compiler(),\n\
\t        // eslint-disable-line new-cap\n\
\t    result = childCompiler.compile(program, this.options),\n\
\t        guid = this.guid++;\n\
\n\
\t    this.usePartial = this.usePartial || result.usePartial;\n\
\n\
\t    this.children[guid] = result;\n\
\t    this.useDepths = this.useDepths || result.useDepths;\n\
\n\
\t    return guid;\n\
\t  },\n\
\n\
\t  accept: function accept(node) {\n\
\t    this.sourceNode.unshift(node);\n\
\t    var ret = this[node.type](node);\n\
\t    this.sourceNode.shift();\n\
\t    return ret;\n\
\t  },\n\
\n\
\t  Program: function Program(program) {\n\
\t    this.options.blockParams.unshift(program.blockParams);\n\
\n\
\t    var body = program.body,\n\
\t        bodyLength = body.length;\n\
\t    for (var i = 0; i < bodyLength; i++) {\n\
\t      this.accept(body[i]);\n\
\t    }\n\
\n\
\t    this.options.blockParams.shift();\n\
\n\
\t    this.isSimple = bodyLength === 1;\n\
\t    this.blockParams = program.blockParams ? program.blockParams.length : 0;\n\
\n\
\t    return this;\n\
\t  },\n\
\n\
\t  BlockStatement: function BlockStatement(block) {\n\
\t    transformLiteralToPath(block);\n\
\n\
\t    var program = block.program,\n\
\t        inverse = block.inverse;\n\
\n\
\t    program = program && this.compileProgram(program);\n\
\t    inverse = inverse && this.compileProgram(inverse);\n\
\n\
\t    var type = this.classifySexpr(block);\n\
\n\
\t    if (type === 'helper') {\n\
\t      this.helperSexpr(block, program, inverse);\n\
\t    } else if (type === 'simple') {\n\
\t      this.simpleSexpr(block);\n\
\n\
\t      // now that the simple mustache is resolved, we need to\n\
\t      // evaluate it by executing `blockHelperMissing`\n\
\t      this.opcode('pushProgram', program);\n\
\t      this.opcode('pushProgram', inverse);\n\
\t      this.opcode('emptyHash');\n\
\t      this.opcode('blockValue', block.path.original);\n\
\t    } else {\n\
\t      this.ambiguousSexpr(block, program, inverse);\n\
\n\
\t      // now that the simple mustache is resolved, we need to\n\
\t      // evaluate it by executing `blockHelperMissing`\n\
\t      this.opcode('pushProgram', program);\n\
\t      this.opcode('pushProgram', inverse);\n\
\t      this.opcode('emptyHash');\n\
\t      this.opcode('ambiguousBlockValue');\n\
\t    }\n\
\n\
\t    this.opcode('append');\n\
\t  },\n\
\n\
\t  PartialStatement: function PartialStatement(partial) {\n\
\t    this.usePartial = true;\n\
\n\
\t    var params = partial.params;\n\
\t    if (params.length > 1) {\n\
\t      throw new _Exception2['default']('Unsupported number of partial arguments: ' + params.length, partial);\n\
\t    } else if (!params.length) {\n\
\t      params.push({ type: 'PathExpression', parts: [], depth: 0 });\n\
\t    }\n\
\n\
\t    var partialName = partial.name.original,\n\
\t        isDynamic = partial.name.type === 'SubExpression';\n\
\t    if (isDynamic) {\n\
\t      this.accept(partial.name);\n\
\t    }\n\
\n\
\t    this.setupFullMustacheParams(partial, undefined, undefined, true);\n\
\n\
\t    var indent = partial.indent || '';\n\
\t    if (this.options.preventIndent && indent) {\n\
\t      this.opcode('appendContent', indent);\n\
\t      indent = '';\n\
\t    }\n\
\n\
\t    this.opcode('invokePartial', isDynamic, partialName, indent);\n\
\t    this.opcode('append');\n\
\t  },\n\
\n\
\t  MustacheStatement: function MustacheStatement(mustache) {\n\
\t    this.SubExpression(mustache); // eslint-disable-line new-cap\n\
\n\
\t    if (mustache.escaped && !this.options.noEscape) {\n\
\t      this.opcode('appendEscaped');\n\
\t    } else {\n\
\t      this.opcode('append');\n\
\t    }\n\
\t  },\n\
\n\
\t  ContentStatement: function ContentStatement(content) {\n\
\t    if (content.value) {\n\
\t      this.opcode('appendContent', content.value);\n\
\t    }\n\
\t  },\n\
\n\
\t  CommentStatement: function CommentStatement() {},\n\
\n\
\t  SubExpression: function SubExpression(sexpr) {\n\
\t    transformLiteralToPath(sexpr);\n\
\t    var type = this.classifySexpr(sexpr);\n\
\n\
\t    if (type === 'simple') {\n\
\t      this.simpleSexpr(sexpr);\n\
\t    } else if (type === 'helper') {\n\
\t      this.helperSexpr(sexpr);\n\
\t    } else {\n\
\t      this.ambiguousSexpr(sexpr);\n\
\t    }\n\
\t  },\n\
\t  ambiguousSexpr: function ambiguousSexpr(sexpr, program, inverse) {\n\
\t    var path = sexpr.path,\n\
\t        name = path.parts[0],\n\
\t        isBlock = program != null || inverse != null;\n\
\n\
\t    this.opcode('getContext', path.depth);\n\
\n\
\t    this.opcode('pushProgram', program);\n\
\t    this.opcode('pushProgram', inverse);\n\
\n\
\t    this.accept(path);\n\
\n\
\t    this.opcode('invokeAmbiguous', name, isBlock);\n\
\t  },\n\
\n\
\t  simpleSexpr: function simpleSexpr(sexpr) {\n\
\t    this.accept(sexpr.path);\n\
\t    this.opcode('resolvePossibleLambda');\n\
\t  },\n\
\n\
\t  helperSexpr: function helperSexpr(sexpr, program, inverse) {\n\
\t    var params = this.setupFullMustacheParams(sexpr, program, inverse),\n\
\t        path = sexpr.path,\n\
\t        name = path.parts[0];\n\
\n\
\t    if (this.options.knownHelpers[name]) {\n\
\t      this.opcode('invokeKnownHelper', params.length, name);\n\
\t    } else if (this.options.knownHelpersOnly) {\n\
\t      throw new _Exception2['default']('You specified knownHelpersOnly, but used the unknown helper ' + name, sexpr);\n\
\t    } else {\n\
\t      path.falsy = true;\n\
\n\
\t      this.accept(path);\n\
\t      this.opcode('invokeHelper', params.length, path.original, _AST2['default'].helpers.simpleId(path));\n\
\t    }\n\
\t  },\n\
\n\
\t  PathExpression: function PathExpression(path) {\n\
\t    this.addDepth(path.depth);\n\
\t    this.opcode('getContext', path.depth);\n\
\n\
\t    var name = path.parts[0],\n\
\t        scoped = _AST2['default'].helpers.scopedId(path),\n\
\t        blockParamId = !path.depth && !scoped && this.blockParamIndex(name);\n\
\n\
\t    if (blockParamId) {\n\
\t      this.opcode('lookupBlockParam', blockParamId, path.parts);\n\
\t    } else if (!name) {\n\
\t      // Context reference, i.e. `{{foo .}}` or `{{foo ..}}`\n\
\t      this.opcode('pushContext');\n\
\t    } else if (path.data) {\n\
\t      this.options.data = true;\n\
\t      this.opcode('lookupData', path.depth, path.parts);\n\
\t    } else {\n\
\t      this.opcode('lookupOnContext', path.parts, path.falsy, scoped);\n\
\t    }\n\
\t  },\n\
\n\
\t  StringLiteral: function StringLiteral(string) {\n\
\t    this.opcode('pushString', string.value);\n\
\t  },\n\
\n\
\t  NumberLiteral: function NumberLiteral(number) {\n\
\t    this.opcode('pushLiteral', number.value);\n\
\t  },\n\
\n\
\t  BooleanLiteral: function BooleanLiteral(bool) {\n\
\t    this.opcode('pushLiteral', bool.value);\n\
\t  },\n\
\n\
\t  UndefinedLiteral: function UndefinedLiteral() {\n\
\t    this.opcode('pushLiteral', 'undefined');\n\
\t  },\n\
\n\
\t  NullLiteral: function NullLiteral() {\n\
\t    this.opcode('pushLiteral', 'null');\n\
\t  },\n\
\n\
\t  Hash: function Hash(hash) {\n\
\t    var pairs = hash.pairs,\n\
\t        i = 0,\n\
\t        l = pairs.length;\n\
\n\
\t    this.opcode('pushHash');\n\
\n\
\t    for (; i < l; i++) {\n\
\t      this.pushParam(pairs[i].value);\n\
\t    }\n\
\t    while (i--) {\n\
\t      this.opcode('assignToHash', pairs[i].key);\n\
\t    }\n\
\t    this.opcode('popHash');\n\
\t  },\n\
\n\
\t  // HELPERS\n\
\t  opcode: function opcode(name) {\n\
\t    this.opcodes.push({ opcode: name, args: slice.call(arguments, 1), loc: this.sourceNode[0].loc });\n\
\t  },\n\
\n\
\t  addDepth: function addDepth(depth) {\n\
\t    if (!depth) {\n\
\t      return;\n\
\t    }\n\
\n\
\t    this.useDepths = true;\n\
\t  },\n\
\n\
\t  classifySexpr: function classifySexpr(sexpr) {\n\
\t    var isSimple = _AST2['default'].helpers.simpleId(sexpr.path);\n\
\n\
\t    var isBlockParam = isSimple && !!this.blockParamIndex(sexpr.path.parts[0]);\n\
\n\
\t    // a mustache is an eligible helper if:\n\
\t    // * its id is simple (a single part, not `this` or `..`)\n\
\t    var isHelper = !isBlockParam && _AST2['default'].helpers.helperExpression(sexpr);\n\
\n\
\t    // if a mustache is an eligible helper but not a definite\n\
\t    // helper, it is ambiguous, and will be resolved in a later\n\
\t    // pass or at runtime.\n\
\t    var isEligible = !isBlockParam && (isHelper || isSimple);\n\
\n\
\t    // if ambiguous, we can possibly resolve the ambiguity now\n\
\t    // An eligible helper is one that does not have a complex path, i.e. `this.foo`, `../foo` etc.\n\
\t    if (isEligible && !isHelper) {\n\
\t      var _name2 = sexpr.path.parts[0],\n\
\t          options = this.options;\n\
\n\
\t      if (options.knownHelpers[_name2]) {\n\
\t        isHelper = true;\n\
\t      } else if (options.knownHelpersOnly) {\n\
\t        isEligible = false;\n\
\t      }\n\
\t    }\n\
\n\
\t    if (isHelper) {\n\
\t      return 'helper';\n\
\t    } else if (isEligible) {\n\
\t      return 'ambiguous';\n\
\t    } else {\n\
\t      return 'simple';\n\
\t    }\n\
\t  },\n\
\n\
\t  pushParams: function pushParams(params) {\n\
\t    for (var i = 0, l = params.length; i < l; i++) {\n\
\t      this.pushParam(params[i]);\n\
\t    }\n\
\t  },\n\
\n\
\t  pushParam: function pushParam(val) {\n\
\t    var value = val.value != null ? val.value : val.original || '';\n\
\n\
\t    if (this.stringParams) {\n\
\t      if (value.replace) {\n\
\t        value = value.replace(/^(\\.?\\.\\/)*/g, '').replace(/\\//g, '.');\n\
\t      }\n\
\n\
\t      if (val.depth) {\n\
\t        this.addDepth(val.depth);\n\
\t      }\n\
\t      this.opcode('getContext', val.depth || 0);\n\
\t      this.opcode('pushStringParam', value, val.type);\n\
\n\
\t      if (val.type === 'SubExpression') {\n\
\t        // SubExpressions get evaluated and passed in\n\
\t        // in string params mode.\n\
\t        this.accept(val);\n\
\t      }\n\
\t    } else {\n\
\t      if (this.trackIds) {\n\
\t        var blockParamIndex = undefined;\n\
\t        if (val.parts && !_AST2['default'].helpers.scopedId(val) && !val.depth) {\n\
\t          blockParamIndex = this.blockParamIndex(val.parts[0]);\n\
\t        }\n\
\t        if (blockParamIndex) {\n\
\t          var blockParamChild = val.parts.slice(1).join('.');\n\
\t          this.opcode('pushId', 'BlockParam', blockParamIndex, blockParamChild);\n\
\t        } else {\n\
\t          value = val.original || value;\n\
\t          if (value.replace) {\n\
\t            value = value.replace(/^\\.\\//g, '').replace(/^\\.$/g, '');\n\
\t          }\n\
\n\
\t          this.opcode('pushId', val.type, value);\n\
\t        }\n\
\t      }\n\
\t      this.accept(val);\n\
\t    }\n\
\t  },\n\
\n\
\t  setupFullMustacheParams: function setupFullMustacheParams(sexpr, program, inverse, omitEmpty) {\n\
\t    var params = sexpr.params;\n\
\t    this.pushParams(params);\n\
\n\
\t    this.opcode('pushProgram', program);\n\
\t    this.opcode('pushProgram', inverse);\n\
\n\
\t    if (sexpr.hash) {\n\
\t      this.accept(sexpr.hash);\n\
\t    } else {\n\
\t      this.opcode('emptyHash', omitEmpty);\n\
\t    }\n\
\n\
\t    return params;\n\
\t  },\n\
\n\
\t  blockParamIndex: function blockParamIndex(name) {\n\
\t    for (var depth = 0, len = this.options.blockParams.length; depth < len; depth++) {\n\
\t      var blockParams = this.options.blockParams[depth],\n\
\t          param = blockParams && _isArray$indexOf.indexOf(blockParams, name);\n\
\t      if (blockParams && param >= 0) {\n\
\t        return [depth, param];\n\
\t      }\n\
\t    }\n\
\t  }\n\
\t};\n\
\n\
\tfunction precompile(input, options, env) {\n\
\t  if (input == null || typeof input !== 'string' && input.type !== 'Program') {\n\
\t    throw new _Exception2['default']('You must pass a string or Handlebars AST to Handlebars.precompile. You passed ' + input);\n\
\t  }\n\
\n\
\t  options = options || {};\n\
\t  if (!('data' in options)) {\n\
\t    options.data = true;\n\
\t  }\n\
\t  if (options.compat) {\n\
\t    options.useDepths = true;\n\
\t  }\n\
\n\
\t  var ast = env.parse(input, options),\n\
\t      environment = new env.Compiler().compile(ast, options);\n\
\t  return new env.JavaScriptCompiler().compile(environment, options);\n\
\t}\n\
\n\
\tfunction compile(input, _x, env) {\n\
\t  var options = arguments[1] === undefined ? {} : arguments[1];\n\
\n\
\t  if (input == null || typeof input !== 'string' && input.type !== 'Program') {\n\
\t    throw new _Exception2['default']('You must pass a string or Handlebars AST to Handlebars.compile. You passed ' + input);\n\
\t  }\n\
\n\
\t  if (!('data' in options)) {\n\
\t    options.data = true;\n\
\t  }\n\
\t  if (options.compat) {\n\
\t    options.useDepths = true;\n\
\t  }\n\
\n\
\t  var compiled = undefined;\n\
\n\
\t  function compileInput() {\n\
\t    var ast = env.parse(input, options),\n\
\t        environment = new env.Compiler().compile(ast, options),\n\
\t        templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);\n\
\t    return env.template(templateSpec);\n\
\t  }\n\
\n\
\t  // Template is only compiled on first use and cached after that point.\n\
\t  function ret(context, execOptions) {\n\
\t    if (!compiled) {\n\
\t      compiled = compileInput();\n\
\t    }\n\
\t    return compiled.call(this, context, execOptions);\n\
\t  }\n\
\t  ret._setup = function (setupOptions) {\n\
\t    if (!compiled) {\n\
\t      compiled = compileInput();\n\
\t    }\n\
\t    return compiled._setup(setupOptions);\n\
\t  };\n\
\t  ret._child = function (i, data, blockParams, depths) {\n\
\t    if (!compiled) {\n\
\t      compiled = compileInput();\n\
\t    }\n\
\t    return compiled._child(i, data, blockParams, depths);\n\
\t  };\n\
\t  return ret;\n\
\t}\n\
\n\
\tfunction argEquals(a, b) {\n\
\t  if (a === b) {\n\
\t    return true;\n\
\t  }\n\
\n\
\t  if (_isArray$indexOf.isArray(a) && _isArray$indexOf.isArray(b) && a.length === b.length) {\n\
\t    for (var i = 0; i < a.length; i++) {\n\
\t      if (!argEquals(a[i], b[i])) {\n\
\t        return false;\n\
\t      }\n\
\t    }\n\
\t    return true;\n\
\t  }\n\
\t}\n\
\n\
\tfunction transformLiteralToPath(sexpr) {\n\
\t  if (!sexpr.path.parts) {\n\
\t    var literal = sexpr.path;\n\
\t    // Casting to string here to make false and 0 literal values play nicely with the rest\n\
\t    // of the system.\n\
\t    sexpr.path = new _AST2['default'].PathExpression(false, 0, [literal.original + ''], literal.original + '', literal.loc);\n\
\t  }\n\
\t}\n\
\n\
/***/ },\n\
/* 5 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t'use strict';\n\
\n\
\tvar _interopRequireWildcard = __webpack_require__(8)['default'];\n\
\n\
\texports.__esModule = true;\n\
\n\
\tvar _COMPILER_REVISION$REVISION_CHANGES = __webpack_require__(9);\n\
\n\
\tvar _Exception = __webpack_require__(11);\n\
\n\
\tvar _Exception2 = _interopRequireWildcard(_Exception);\n\
\n\
\tvar _isArray = __webpack_require__(12);\n\
\n\
\tvar _CodeGen = __webpack_require__(17);\n\
\n\
\tvar _CodeGen2 = _interopRequireWildcard(_CodeGen);\n\
\n\
\tfunction Literal(value) {\n\
\t  this.value = value;\n\
\t}\n\
\n\
\tfunction JavaScriptCompiler() {}\n\
\n\
\tJavaScriptCompiler.prototype = {\n\
\t  // PUBLIC API: You can override these methods in a subclass to provide\n\
\t  // alternative compiled forms for name lookup and buffering semantics\n\
\t  nameLookup: function nameLookup(parent, name /* , type*/) {\n\
\t    if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {\n\
\t      return [parent, '.', name];\n\
\t    } else {\n\
\t      return [parent, '[\\'', name, '\\']'];\n\
\t    }\n\
\t  },\n\
\t  depthedLookup: function depthedLookup(name) {\n\
\t    return [this.aliasable('this.lookup'), '(depths, \"', name, '\")'];\n\
\t  },\n\
\n\
\t  compilerInfo: function compilerInfo() {\n\
\t    var revision = _COMPILER_REVISION$REVISION_CHANGES.COMPILER_REVISION,\n\
\t        versions = _COMPILER_REVISION$REVISION_CHANGES.REVISION_CHANGES[revision];\n\
\t    return [revision, versions];\n\
\t  },\n\
\n\
\t  appendToBuffer: function appendToBuffer(source, location, explicit) {\n\
\t    // Force a source as this simplifies the merge logic.\n\
\t    if (!_isArray.isArray(source)) {\n\
\t      source = [source];\n\
\t    }\n\
\t    source = this.source.wrap(source, location);\n\
\n\
\t    if (this.environment.isSimple) {\n\
\t      return ['return ', source, ';'];\n\
\t    } else if (explicit) {\n\
\t      // This is a case where the buffer operation occurs as a child of another\n\
\t      // construct, generally braces. We have to explicitly output these buffer\n\
\t      // operations to ensure that the emitted code goes in the correct location.\n\
\t      return ['buffer += ', source, ';'];\n\
\t    } else {\n\
\t      source.appendToBuffer = true;\n\
\t      return source;\n\
\t    }\n\
\t  },\n\
\n\
\t  initializeBuffer: function initializeBuffer() {\n\
\t    return this.quotedString('');\n\
\t  },\n\
\t  // END PUBLIC API\n\
\n\
\t  compile: function compile(environment, options, context, asObject) {\n\
\t    this.environment = environment;\n\
\t    this.options = options;\n\
\t    this.stringParams = this.options.stringParams;\n\
\t    this.trackIds = this.options.trackIds;\n\
\t    this.precompile = !asObject;\n\
\n\
\t    this.name = this.environment.name;\n\
\t    this.isChild = !!context;\n\
\t    this.context = context || {\n\
\t      programs: [],\n\
\t      environments: []\n\
\t    };\n\
\n\
\t    this.preamble();\n\
\n\
\t    this.stackSlot = 0;\n\
\t    this.stackVars = [];\n\
\t    this.aliases = {};\n\
\t    this.registers = { list: [] };\n\
\t    this.hashes = [];\n\
\t    this.compileStack = [];\n\
\t    this.inlineStack = [];\n\
\t    this.blockParams = [];\n\
\n\
\t    this.compileChildren(environment, options);\n\
\n\
\t    this.useDepths = this.useDepths || environment.useDepths || this.options.compat;\n\
\t    this.useBlockParams = this.useBlockParams || environment.useBlockParams;\n\
\n\
\t    var opcodes = environment.opcodes,\n\
\t        opcode = undefined,\n\
\t        firstLoc = undefined,\n\
\t        i = undefined,\n\
\t        l = undefined;\n\
\n\
\t    for (i = 0, l = opcodes.length; i < l; i++) {\n\
\t      opcode = opcodes[i];\n\
\n\
\t      this.source.currentLocation = opcode.loc;\n\
\t      firstLoc = firstLoc || opcode.loc;\n\
\t      this[opcode.opcode].apply(this, opcode.args);\n\
\t    }\n\
\n\
\t    // Flush any trailing content that might be pending.\n\
\t    this.source.currentLocation = firstLoc;\n\
\t    this.pushSource('');\n\
\n\
\t    /* istanbul ignore next */\n\
\t    if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {\n\
\t      throw new _Exception2['default']('Compile completed with content left on stack');\n\
\t    }\n\
\n\
\t    var fn = this.createFunctionContext(asObject);\n\
\t    if (!this.isChild) {\n\
\t      var ret = {\n\
\t        compiler: this.compilerInfo(),\n\
\t        main: fn\n\
\t      };\n\
\t      var programs = this.context.programs;\n\
\t      for (i = 0, l = programs.length; i < l; i++) {\n\
\t        if (programs[i]) {\n\
\t          ret[i] = programs[i];\n\
\t        }\n\
\t      }\n\
\n\
\t      if (this.environment.usePartial) {\n\
\t        ret.usePartial = true;\n\
\t      }\n\
\t      if (this.options.data) {\n\
\t        ret.useData = true;\n\
\t      }\n\
\t      if (this.useDepths) {\n\
\t        ret.useDepths = true;\n\
\t      }\n\
\t      if (this.useBlockParams) {\n\
\t        ret.useBlockParams = true;\n\
\t      }\n\
\t      if (this.options.compat) {\n\
\t        ret.compat = true;\n\
\t      }\n\
\n\
\t      if (!asObject) {\n\
\t        ret.compiler = JSON.stringify(ret.compiler);\n\
\n\
\t        this.source.currentLocation = { start: { line: 1, column: 0 } };\n\
\t        ret = this.objectLiteral(ret);\n\
\n\
\t        if (options.srcName) {\n\
\t          ret = ret.toStringWithSourceMap({ file: options.destName });\n\
\t          ret.map = ret.map && ret.map.toString();\n\
\t        } else {\n\
\t          ret = ret.toString();\n\
\t        }\n\
\t      } else {\n\
\t        ret.compilerOptions = this.options;\n\
\t      }\n\
\n\
\t      return ret;\n\
\t    } else {\n\
\t      return fn;\n\
\t    }\n\
\t  },\n\
\n\
\t  preamble: function preamble() {\n\
\t    // track the last context pushed into place to allow skipping the\n\
\t    // getContext opcode when it would be a noop\n\
\t    this.lastContext = 0;\n\
\t    this.source = new _CodeGen2['default'](this.options.srcName);\n\
\t  },\n\
\n\
\t  createFunctionContext: function createFunctionContext(asObject) {\n\
\t    var varDeclarations = '';\n\
\n\
\t    var locals = this.stackVars.concat(this.registers.list);\n\
\t    if (locals.length > 0) {\n\
\t      varDeclarations += ', ' + locals.join(', ');\n\
\t    }\n\
\n\
\t    // Generate minimizer alias mappings\n\
\t    //\n\
\t    // When using true SourceNodes, this will update all references to the given alias\n\
\t    // as the source nodes are reused in situ. For the non-source node compilation mode,\n\
\t    // aliases will not be used, but this case is already being run on the client and\n\
\t    // we aren't concern about minimizing the template size.\n\
\t    var aliasCount = 0;\n\
\t    for (var alias in this.aliases) {\n\
\t      // eslint-disable-line guard-for-in\n\
\t      var node = this.aliases[alias];\n\
\n\
\t      if (this.aliases.hasOwnProperty(alias) && node.children && node.referenceCount > 1) {\n\
\t        varDeclarations += ', alias' + ++aliasCount + '=' + alias;\n\
\t        node.children[0] = 'alias' + aliasCount;\n\
\t      }\n\
\t    }\n\
\n\
\t    var params = ['depth0', 'helpers', 'partials', 'data'];\n\
\n\
\t    if (this.useBlockParams || this.useDepths) {\n\
\t      params.push('blockParams');\n\
\t    }\n\
\t    if (this.useDepths) {\n\
\t      params.push('depths');\n\
\t    }\n\
\n\
\t    // Perform a second pass over the output to merge content when possible\n\
\t    var source = this.mergeSource(varDeclarations);\n\
\n\
\t    if (asObject) {\n\
\t      params.push(source);\n\
\n\
\t      return Function.apply(this, params);\n\
\t    } else {\n\
\t      return this.source.wrap(['function(', params.join(','), ') {\\n\
  ', source, '}']);\n\
\t    }\n\
\t  },\n\
\t  mergeSource: function mergeSource(varDeclarations) {\n\
\t    var isSimple = this.environment.isSimple,\n\
\t        appendOnly = !this.forceBuffer,\n\
\t        appendFirst = undefined,\n\
\t        sourceSeen = undefined,\n\
\t        bufferStart = undefined,\n\
\t        bufferEnd = undefined;\n\
\t    this.source.each(function (line) {\n\
\t      if (line.appendToBuffer) {\n\
\t        if (bufferStart) {\n\
\t          line.prepend('  + ');\n\
\t        } else {\n\
\t          bufferStart = line;\n\
\t        }\n\
\t        bufferEnd = line;\n\
\t      } else {\n\
\t        if (bufferStart) {\n\
\t          if (!sourceSeen) {\n\
\t            appendFirst = true;\n\
\t          } else {\n\
\t            bufferStart.prepend('buffer += ');\n\
\t          }\n\
\t          bufferEnd.add(';');\n\
\t          bufferStart = bufferEnd = undefined;\n\
\t        }\n\
\n\
\t        sourceSeen = true;\n\
\t        if (!isSimple) {\n\
\t          appendOnly = false;\n\
\t        }\n\
\t      }\n\
\t    });\n\
\n\
\t    if (appendOnly) {\n\
\t      if (bufferStart) {\n\
\t        bufferStart.prepend('return ');\n\
\t        bufferEnd.add(';');\n\
\t      } else if (!sourceSeen) {\n\
\t        this.source.push('return \"\";');\n\
\t      }\n\
\t    } else {\n\
\t      varDeclarations += ', buffer = ' + (appendFirst ? '' : this.initializeBuffer());\n\
\n\
\t      if (bufferStart) {\n\
\t        bufferStart.prepend('return buffer + ');\n\
\t        bufferEnd.add(';');\n\
\t      } else {\n\
\t        this.source.push('return buffer;');\n\
\t      }\n\
\t    }\n\
\n\
\t    if (varDeclarations) {\n\
\t      this.source.prepend('var ' + varDeclarations.substring(2) + (appendFirst ? '' : ';\\n\
'));\n\
\t    }\n\
\n\
\t    return this.source.merge();\n\
\t  },\n\
\n\
\t  // [blockValue]\n\
\t  //\n\
\t  // On stack, before: hash, inverse, program, value\n\
\t  // On stack, after: return value of blockHelperMissing\n\
\t  //\n\
\t  // The purpose of this opcode is to take a block of the form\n\
\t  // `{{#this.foo}}...{{/this.foo}}`, resolve the value of `foo`, and\n\
\t  // replace it on the stack with the result of properly\n\
\t  // invoking blockHelperMissing.\n\
\t  blockValue: function blockValue(name) {\n\
\t    var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'),\n\
\t        params = [this.contextName(0)];\n\
\t    this.setupHelperArgs(name, 0, params);\n\
\n\
\t    var blockName = this.popStack();\n\
\t    params.splice(1, 0, blockName);\n\
\n\
\t    this.push(this.source.functionCall(blockHelperMissing, 'call', params));\n\
\t  },\n\
\n\
\t  // [ambiguousBlockValue]\n\
\t  //\n\
\t  // On stack, before: hash, inverse, program, value\n\
\t  // Compiler value, before: lastHelper=value of last found helper, if any\n\
\t  // On stack, after, if no lastHelper: same as [blockValue]\n\
\t  // On stack, after, if lastHelper: value\n\
\t  ambiguousBlockValue: function ambiguousBlockValue() {\n\
\t    // We're being a bit cheeky and reusing the options value from the prior exec\n\
\t    var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'),\n\
\t        params = [this.contextName(0)];\n\
\t    this.setupHelperArgs('', 0, params, true);\n\
\n\
\t    this.flushInline();\n\
\n\
\t    var current = this.topStack();\n\
\t    params.splice(1, 0, current);\n\
\n\
\t    this.pushSource(['if (!', this.lastHelper, ') { ', current, ' = ', this.source.functionCall(blockHelperMissing, 'call', params), '}']);\n\
\t  },\n\
\n\
\t  // [appendContent]\n\
\t  //\n\
\t  // On stack, before: ...\n\
\t  // On stack, after: ...\n\
\t  //\n\
\t  // Appends the string value of `content` to the current buffer\n\
\t  appendContent: function appendContent(content) {\n\
\t    if (this.pendingContent) {\n\
\t      content = this.pendingContent + content;\n\
\t    } else {\n\
\t      this.pendingLocation = this.source.currentLocation;\n\
\t    }\n\
\n\
\t    this.pendingContent = content;\n\
\t  },\n\
\n\
\t  // [append]\n\
\t  //\n\
\t  // On stack, before: value, ...\n\
\t  // On stack, after: ...\n\
\t  //\n\
\t  // Coerces `value` to a String and appends it to the current buffer.\n\
\t  //\n\
\t  // If `value` is truthy, or 0, it is coerced into a string and appended\n\
\t  // Otherwise, the empty string is appended\n\
\t  append: function append() {\n\
\t    if (this.isInline()) {\n\
\t      this.replaceStack(function (current) {\n\
\t        return [' != null ? ', current, ' : \"\"'];\n\
\t      });\n\
\n\
\t      this.pushSource(this.appendToBuffer(this.popStack()));\n\
\t    } else {\n\
\t      var local = this.popStack();\n\
\t      this.pushSource(['if (', local, ' != null) { ', this.appendToBuffer(local, undefined, true), ' }']);\n\
\t      if (this.environment.isSimple) {\n\
\t        this.pushSource(['else { ', this.appendToBuffer('\\'\\'', undefined, true), ' }']);\n\
\t      }\n\
\t    }\n\
\t  },\n\
\n\
\t  // [appendEscaped]\n\
\t  //\n\
\t  // On stack, before: value, ...\n\
\t  // On stack, after: ...\n\
\t  //\n\
\t  // Escape `value` and append it to the buffer\n\
\t  appendEscaped: function appendEscaped() {\n\
\t    this.pushSource(this.appendToBuffer([this.aliasable('this.escapeExpression'), '(', this.popStack(), ')']));\n\
\t  },\n\
\n\
\t  // [getContext]\n\
\t  //\n\
\t  // On stack, before: ...\n\
\t  // On stack, after: ...\n\
\t  // Compiler value, after: lastContext=depth\n\
\t  //\n\
\t  // Set the value of the `lastContext` compiler value to the depth\n\
\t  getContext: function getContext(depth) {\n\
\t    this.lastContext = depth;\n\
\t  },\n\
\n\
\t  // [pushContext]\n\
\t  //\n\
\t  // On stack, before: ...\n\
\t  // On stack, after: currentContext, ...\n\
\t  //\n\
\t  // Pushes the value of the current context onto the stack.\n\
\t  pushContext: function pushContext() {\n\
\t    this.pushStackLiteral(this.contextName(this.lastContext));\n\
\t  },\n\
\n\
\t  // [lookupOnContext]\n\
\t  //\n\
\t  // On stack, before: ...\n\
\t  // On stack, after: currentContext[name], ...\n\
\t  //\n\
\t  // Looks up the value of `name` on the current context and pushes\n\
\t  // it onto the stack.\n\
\t  lookupOnContext: function lookupOnContext(parts, falsy, scoped) {\n\
\t    var i = 0;\n\
\n\
\t    if (!scoped && this.options.compat && !this.lastContext) {\n\
\t      // The depthed query is expected to handle the undefined logic for the root level that\n\
\t      // is implemented below, so we evaluate that directly in compat mode\n\
\t      this.push(this.depthedLookup(parts[i++]));\n\
\t    } else {\n\
\t      this.pushContext();\n\
\t    }\n\
\n\
\t    this.resolvePath('context', parts, i, falsy);\n\
\t  },\n\
\n\
\t  // [lookupBlockParam]\n\
\t  //\n\
\t  // On stack, before: ...\n\
\t  // On stack, after: blockParam[name], ...\n\
\t  //\n\
\t  // Looks up the value of `parts` on the given block param and pushes\n\
\t  // it onto the stack.\n\
\t  lookupBlockParam: function lookupBlockParam(blockParamId, parts) {\n\
\t    this.useBlockParams = true;\n\
\n\
\t    this.push(['blockParams[', blockParamId[0], '][', blockParamId[1], ']']);\n\
\t    this.resolvePath('context', parts, 1);\n\
\t  },\n\
\n\
\t  // [lookupData]\n\
\t  //\n\
\t  // On stack, before: ...\n\
\t  // On stack, after: data, ...\n\
\t  //\n\
\t  // Push the data lookup operator\n\
\t  lookupData: function lookupData(depth, parts) {\n\
\t    if (!depth) {\n\
\t      this.pushStackLiteral('data');\n\
\t    } else {\n\
\t      this.pushStackLiteral('this.data(data, ' + depth + ')');\n\
\t    }\n\
\n\
\t    this.resolvePath('data', parts, 0, true);\n\
\t  },\n\
\n\
\t  resolvePath: function resolvePath(type, parts, i, falsy) {\n\
\t    var _this = this;\n\
\n\
\t    if (this.options.strict || this.options.assumeObjects) {\n\
\t      this.push(strictLookup(this.options.strict, this, parts, type));\n\
\t      return;\n\
\t    }\n\
\n\
\t    var len = parts.length;\n\
\t    for (; i < len; i++) {\n\
\t      /*eslint-disable no-loop-func */\n\
\t      this.replaceStack(function (current) {\n\
\t        var lookup = _this.nameLookup(current, parts[i], type);\n\
\t        // We want to ensure that zero and false are handled properly if the context (falsy flag)\n\
\t        // needs to have the special handling for these values.\n\
\t        if (!falsy) {\n\
\t          return [' != null ? ', lookup, ' : ', current];\n\
\t        } else {\n\
\t          // Otherwise we can use generic falsy handling\n\
\t          return [' && ', lookup];\n\
\t        }\n\
\t      });\n\
\t      /*eslint-enable no-loop-func */\n\
\t    }\n\
\t  },\n\
\n\
\t  // [resolvePossibleLambda]\n\
\t  //\n\
\t  // On stack, before: value, ...\n\
\t  // On stack, after: resolved value, ...\n\
\t  //\n\
\t  // If the `value` is a lambda, replace it on the stack by\n\
\t  // the return value of the lambda\n\
\t  resolvePossibleLambda: function resolvePossibleLambda() {\n\
\t    this.push([this.aliasable('this.lambda'), '(', this.popStack(), ', ', this.contextName(0), ')']);\n\
\t  },\n\
\n\
\t  // [pushStringParam]\n\
\t  //\n\
\t  // On stack, before: ...\n\
\t  // On stack, after: string, currentContext, ...\n\
\t  //\n\
\t  // This opcode is designed for use in string mode, which\n\
\t  // provides the string value of a parameter along with its\n\
\t  // depth rather than resolving it immediately.\n\
\t  pushStringParam: function pushStringParam(string, type) {\n\
\t    this.pushContext();\n\
\t    this.pushString(type);\n\
\n\
\t    // If it's a subexpression, the string result\n\
\t    // will be pushed after this opcode.\n\
\t    if (type !== 'SubExpression') {\n\
\t      if (typeof string === 'string') {\n\
\t        this.pushString(string);\n\
\t      } else {\n\
\t        this.pushStackLiteral(string);\n\
\t      }\n\
\t    }\n\
\t  },\n\
\n\
\t  emptyHash: function emptyHash(omitEmpty) {\n\
\t    if (this.trackIds) {\n\
\t      this.push('{}'); // hashIds\n\
\t    }\n\
\t    if (this.stringParams) {\n\
\t      this.push('{}'); // hashContexts\n\
\t      this.push('{}'); // hashTypes\n\
\t    }\n\
\t    this.pushStackLiteral(omitEmpty ? 'undefined' : '{}');\n\
\t  },\n\
\t  pushHash: function pushHash() {\n\
\t    if (this.hash) {\n\
\t      this.hashes.push(this.hash);\n\
\t    }\n\
\t    this.hash = { values: [], types: [], contexts: [], ids: [] };\n\
\t  },\n\
\t  popHash: function popHash() {\n\
\t    var hash = this.hash;\n\
\t    this.hash = this.hashes.pop();\n\
\n\
\t    if (this.trackIds) {\n\
\t      this.push(this.objectLiteral(hash.ids));\n\
\t    }\n\
\t    if (this.stringParams) {\n\
\t      this.push(this.objectLiteral(hash.contexts));\n\
\t      this.push(this.objectLiteral(hash.types));\n\
\t    }\n\
\n\
\t    this.push(this.objectLiteral(hash.values));\n\
\t  },\n\
\n\
\t  // [pushString]\n\
\t  //\n\
\t  // On stack, before: ...\n\
\t  // On stack, after: quotedString(string), ...\n\
\t  //\n\
\t  // Push a quoted version of `string` onto the stack\n\
\t  pushString: function pushString(string) {\n\
\t    this.pushStackLiteral(this.quotedString(string));\n\
\t  },\n\
\n\
\t  // [pushLiteral]\n\
\t  //\n\
\t  // On stack, before: ...\n\
\t  // On stack, after: value, ...\n\
\t  //\n\
\t  // Pushes a value onto the stack. This operation prevents\n\
\t  // the compiler from creating a temporary variable to hold\n\
\t  // it.\n\
\t  pushLiteral: function pushLiteral(value) {\n\
\t    this.pushStackLiteral(value);\n\
\t  },\n\
\n\
\t  // [pushProgram]\n\
\t  //\n\
\t  // On stack, before: ...\n\
\t  // On stack, after: program(guid), ...\n\
\t  //\n\
\t  // Push a program expression onto the stack. This takes\n\
\t  // a compile-time guid and converts it into a runtime-accessible\n\
\t  // expression.\n\
\t  pushProgram: function pushProgram(guid) {\n\
\t    if (guid != null) {\n\
\t      this.pushStackLiteral(this.programExpression(guid));\n\
\t    } else {\n\
\t      this.pushStackLiteral(null);\n\
\t    }\n\
\t  },\n\
\n\
\t  // [invokeHelper]\n\
\t  //\n\
\t  // On stack, before: hash, inverse, program, params..., ...\n\
\t  // On stack, after: result of helper invocation\n\
\t  //\n\
\t  // Pops off the helper's parameters, invokes the helper,\n\
\t  // and pushes the helper's return value onto the stack.\n\
\t  //\n\
\t  // If the helper is not found, `helperMissing` is called.\n\
\t  invokeHelper: function invokeHelper(paramSize, name, isSimple) {\n\
\t    var nonHelper = this.popStack(),\n\
\t        helper = this.setupHelper(paramSize, name),\n\
\t        simple = isSimple ? [helper.name, ' || '] : '';\n\
\n\
\t    var lookup = ['('].concat(simple, nonHelper);\n\
\t    if (!this.options.strict) {\n\
\t      lookup.push(' || ', this.aliasable('helpers.helperMissing'));\n\
\t    }\n\
\t    lookup.push(')');\n\
\n\
\t    this.push(this.source.functionCall(lookup, 'call', helper.callParams));\n\
\t  },\n\
\n\
\t  // [invokeKnownHelper]\n\
\t  //\n\
\t  // On stack, before: hash, inverse, program, params..., ...\n\
\t  // On stack, after: result of helper invocation\n\
\t  //\n\
\t  // This operation is used when the helper is known to exist,\n\
\t  // so a `helperMissing` fallback is not required.\n\
\t  invokeKnownHelper: function invokeKnownHelper(paramSize, name) {\n\
\t    var helper = this.setupHelper(paramSize, name);\n\
\t    this.push(this.source.functionCall(helper.name, 'call', helper.callParams));\n\
\t  },\n\
\n\
\t  // [invokeAmbiguous]\n\
\t  //\n\
\t  // On stack, before: hash, inverse, program, params..., ...\n\
\t  // On stack, after: result of disambiguation\n\
\t  //\n\
\t  // This operation is used when an expression like `{{foo}}`\n\
\t  // is provided, but we don't know at compile-time whether it\n\
\t  // is a helper or a path.\n\
\t  //\n\
\t  // This operation emits more code than the other options,\n\
\t  // and can be avoided by passing the `knownHelpers` and\n\
\t  // `knownHelpersOnly` flags at compile-time.\n\
\t  invokeAmbiguous: function invokeAmbiguous(name, helperCall) {\n\
\t    this.useRegister('helper');\n\
\n\
\t    var nonHelper = this.popStack();\n\
\n\
\t    this.emptyHash();\n\
\t    var helper = this.setupHelper(0, name, helperCall);\n\
\n\
\t    var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');\n\
\n\
\t    var lookup = ['(', '(helper = ', helperName, ' || ', nonHelper, ')'];\n\
\t    if (!this.options.strict) {\n\
\t      lookup[0] = '(helper = ';\n\
\t      lookup.push(' != null ? helper : ', this.aliasable('helpers.helperMissing'));\n\
\t    }\n\
\n\
\t    this.push(['(', lookup, helper.paramsInit ? ['),(', helper.paramsInit] : [], '),', '(typeof helper === ', this.aliasable('\"function\"'), ' ? ', this.source.functionCall('helper', 'call', helper.callParams), ' : helper))']);\n\
\t  },\n\
\n\
\t  // [invokePartial]\n\
\t  //\n\
\t  // On stack, before: context, ...\n\
\t  // On stack after: result of partial invocation\n\
\t  //\n\
\t  // This operation pops off a context, invokes a partial with that context,\n\
\t  // and pushes the result of the invocation back.\n\
\t  invokePartial: function invokePartial(isDynamic, name, indent) {\n\
\t    var params = [],\n\
\t        options = this.setupParams(name, 1, params, false);\n\
\n\
\t    if (isDynamic) {\n\
\t      name = this.popStack();\n\
\t      delete options.name;\n\
\t    }\n\
\n\
\t    if (indent) {\n\
\t      options.indent = JSON.stringify(indent);\n\
\t    }\n\
\t    options.helpers = 'helpers';\n\
\t    options.partials = 'partials';\n\
\n\
\t    if (!isDynamic) {\n\
\t      params.unshift(this.nameLookup('partials', name, 'partial'));\n\
\t    } else {\n\
\t      params.unshift(name);\n\
\t    }\n\
\n\
\t    if (this.options.compat) {\n\
\t      options.depths = 'depths';\n\
\t    }\n\
\t    options = this.objectLiteral(options);\n\
\t    params.push(options);\n\
\n\
\t    this.push(this.source.functionCall('this.invokePartial', '', params));\n\
\t  },\n\
\n\
\t  // [assignToHash]\n\
\t  //\n\
\t  // On stack, before: value, ..., hash, ...\n\
\t  // On stack, after: ..., hash, ...\n\
\t  //\n\
\t  // Pops a value off the stack and assigns it to the current hash\n\
\t  assignToHash: function assignToHash(key) {\n\
\t    var value = this.popStack(),\n\
\t        context = undefined,\n\
\t        type = undefined,\n\
\t        id = undefined;\n\
\n\
\t    if (this.trackIds) {\n\
\t      id = this.popStack();\n\
\t    }\n\
\t    if (this.stringParams) {\n\
\t      type = this.popStack();\n\
\t      context = this.popStack();\n\
\t    }\n\
\n\
\t    var hash = this.hash;\n\
\t    if (context) {\n\
\t      hash.contexts[key] = context;\n\
\t    }\n\
\t    if (type) {\n\
\t      hash.types[key] = type;\n\
\t    }\n\
\t    if (id) {\n\
\t      hash.ids[key] = id;\n\
\t    }\n\
\t    hash.values[key] = value;\n\
\t  },\n\
\n\
\t  pushId: function pushId(type, name, child) {\n\
\t    if (type === 'BlockParam') {\n\
\t      this.pushStackLiteral('blockParams[' + name[0] + '].path[' + name[1] + ']' + (child ? ' + ' + JSON.stringify('.' + child) : ''));\n\
\t    } else if (type === 'PathExpression') {\n\
\t      this.pushString(name);\n\
\t    } else if (type === 'SubExpression') {\n\
\t      this.pushStackLiteral('true');\n\
\t    } else {\n\
\t      this.pushStackLiteral('null');\n\
\t    }\n\
\t  },\n\
\n\
\t  // HELPERS\n\
\n\
\t  compiler: JavaScriptCompiler,\n\
\n\
\t  compileChildren: function compileChildren(environment, options) {\n\
\t    var children = environment.children,\n\
\t        child = undefined,\n\
\t        compiler = undefined;\n\
\n\
\t    for (var i = 0, l = children.length; i < l; i++) {\n\
\t      child = children[i];\n\
\t      compiler = new this.compiler(); // eslint-disable-line new-cap\n\
\n\
\t      var index = this.matchExistingProgram(child);\n\
\n\
\t      if (index == null) {\n\
\t        this.context.programs.push(''); // Placeholder to prevent name conflicts for nested children\n\
\t        index = this.context.programs.length;\n\
\t        child.index = index;\n\
\t        child.name = 'program' + index;\n\
\t        this.context.programs[index] = compiler.compile(child, options, this.context, !this.precompile);\n\
\t        this.context.environments[index] = child;\n\
\n\
\t        this.useDepths = this.useDepths || compiler.useDepths;\n\
\t        this.useBlockParams = this.useBlockParams || compiler.useBlockParams;\n\
\t      } else {\n\
\t        child.index = index;\n\
\t        child.name = 'program' + index;\n\
\n\
\t        this.useDepths = this.useDepths || child.useDepths;\n\
\t        this.useBlockParams = this.useBlockParams || child.useBlockParams;\n\
\t      }\n\
\t    }\n\
\t  },\n\
\t  matchExistingProgram: function matchExistingProgram(child) {\n\
\t    for (var i = 0, len = this.context.environments.length; i < len; i++) {\n\
\t      var environment = this.context.environments[i];\n\
\t      if (environment && environment.equals(child)) {\n\
\t        return i;\n\
\t      }\n\
\t    }\n\
\t  },\n\
\n\
\t  programExpression: function programExpression(guid) {\n\
\t    var child = this.environment.children[guid],\n\
\t        programParams = [child.index, 'data', child.blockParams];\n\
\n\
\t    if (this.useBlockParams || this.useDepths) {\n\
\t      programParams.push('blockParams');\n\
\t    }\n\
\t    if (this.useDepths) {\n\
\t      programParams.push('depths');\n\
\t    }\n\
\n\
\t    return 'this.program(' + programParams.join(', ') + ')';\n\
\t  },\n\
\n\
\t  useRegister: function useRegister(name) {\n\
\t    if (!this.registers[name]) {\n\
\t      this.registers[name] = true;\n\
\t      this.registers.list.push(name);\n\
\t    }\n\
\t  },\n\
\n\
\t  push: function push(expr) {\n\
\t    if (!(expr instanceof Literal)) {\n\
\t      expr = this.source.wrap(expr);\n\
\t    }\n\
\n\
\t    this.inlineStack.push(expr);\n\
\t    return expr;\n\
\t  },\n\
\n\
\t  pushStackLiteral: function pushStackLiteral(item) {\n\
\t    this.push(new Literal(item));\n\
\t  },\n\
\n\
\t  pushSource: function pushSource(source) {\n\
\t    if (this.pendingContent) {\n\
\t      this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent), this.pendingLocation));\n\
\t      this.pendingContent = undefined;\n\
\t    }\n\
\n\
\t    if (source) {\n\
\t      this.source.push(source);\n\
\t    }\n\
\t  },\n\
\n\
\t  replaceStack: function replaceStack(callback) {\n\
\t    var prefix = ['('],\n\
\t        stack = undefined,\n\
\t        createdStack = undefined,\n\
\t        usedLiteral = undefined;\n\
\n\
\t    /* istanbul ignore next */\n\
\t    if (!this.isInline()) {\n\
\t      throw new _Exception2['default']('replaceStack on non-inline');\n\
\t    }\n\
\n\
\t    // We want to merge the inline statement into the replacement statement via ','\n\
\t    var top = this.popStack(true);\n\
\n\
\t    if (top instanceof Literal) {\n\
\t      // Literals do not need to be inlined\n\
\t      stack = [top.value];\n\
\t      prefix = ['(', stack];\n\
\t      usedLiteral = true;\n\
\t    } else {\n\
\t      // Get or create the current stack name for use by the inline\n\
\t      createdStack = true;\n\
\t      var _name = this.incrStack();\n\
\n\
\t      prefix = ['((', this.push(_name), ' = ', top, ')'];\n\
\t      stack = this.topStack();\n\
\t    }\n\
\n\
\t    var item = callback.call(this, stack);\n\
\n\
\t    if (!usedLiteral) {\n\
\t      this.popStack();\n\
\t    }\n\
\t    if (createdStack) {\n\
\t      this.stackSlot--;\n\
\t    }\n\
\t    this.push(prefix.concat(item, ')'));\n\
\t  },\n\
\n\
\t  incrStack: function incrStack() {\n\
\t    this.stackSlot++;\n\
\t    if (this.stackSlot > this.stackVars.length) {\n\
\t      this.stackVars.push('stack' + this.stackSlot);\n\
\t    }\n\
\t    return this.topStackName();\n\
\t  },\n\
\t  topStackName: function topStackName() {\n\
\t    return 'stack' + this.stackSlot;\n\
\t  },\n\
\t  flushInline: function flushInline() {\n\
\t    var inlineStack = this.inlineStack;\n\
\t    this.inlineStack = [];\n\
\t    for (var i = 0, len = inlineStack.length; i < len; i++) {\n\
\t      var entry = inlineStack[i];\n\
\t      /* istanbul ignore if */\n\
\t      if (entry instanceof Literal) {\n\
\t        this.compileStack.push(entry);\n\
\t      } else {\n\
\t        var stack = this.incrStack();\n\
\t        this.pushSource([stack, ' = ', entry, ';']);\n\
\t        this.compileStack.push(stack);\n\
\t      }\n\
\t    }\n\
\t  },\n\
\t  isInline: function isInline() {\n\
\t    return this.inlineStack.length;\n\
\t  },\n\
\n\
\t  popStack: function popStack(wrapped) {\n\
\t    var inline = this.isInline(),\n\
\t        item = (inline ? this.inlineStack : this.compileStack).pop();\n\
\n\
\t    if (!wrapped && item instanceof Literal) {\n\
\t      return item.value;\n\
\t    } else {\n\
\t      if (!inline) {\n\
\t        /* istanbul ignore next */\n\
\t        if (!this.stackSlot) {\n\
\t          throw new _Exception2['default']('Invalid stack pop');\n\
\t        }\n\
\t        this.stackSlot--;\n\
\t      }\n\
\t      return item;\n\
\t    }\n\
\t  },\n\
\n\
\t  topStack: function topStack() {\n\
\t    var stack = this.isInline() ? this.inlineStack : this.compileStack,\n\
\t        item = stack[stack.length - 1];\n\
\n\
\t    /* istanbul ignore if */\n\
\t    if (item instanceof Literal) {\n\
\t      return item.value;\n\
\t    } else {\n\
\t      return item;\n\
\t    }\n\
\t  },\n\
\n\
\t  contextName: function contextName(context) {\n\
\t    if (this.useDepths && context) {\n\
\t      return 'depths[' + context + ']';\n\
\t    } else {\n\
\t      return 'depth' + context;\n\
\t    }\n\
\t  },\n\
\n\
\t  quotedString: function quotedString(str) {\n\
\t    return this.source.quotedString(str);\n\
\t  },\n\
\n\
\t  objectLiteral: function objectLiteral(obj) {\n\
\t    return this.source.objectLiteral(obj);\n\
\t  },\n\
\n\
\t  aliasable: function aliasable(name) {\n\
\t    var ret = this.aliases[name];\n\
\t    if (ret) {\n\
\t      ret.referenceCount++;\n\
\t      return ret;\n\
\t    }\n\
\n\
\t    ret = this.aliases[name] = this.source.wrap(name);\n\
\t    ret.aliasable = true;\n\
\t    ret.referenceCount = 1;\n\
\n\
\t    return ret;\n\
\t  },\n\
\n\
\t  setupHelper: function setupHelper(paramSize, name, blockHelper) {\n\
\t    var params = [],\n\
\t        paramsInit = this.setupHelperArgs(name, paramSize, params, blockHelper);\n\
\t    var foundHelper = this.nameLookup('helpers', name, 'helper');\n\
\n\
\t    return {\n\
\t      params: params,\n\
\t      paramsInit: paramsInit,\n\
\t      name: foundHelper,\n\
\t      callParams: [this.contextName(0)].concat(params)\n\
\t    };\n\
\t  },\n\
\n\
\t  setupParams: function setupParams(helper, paramSize, params) {\n\
\t    var options = {},\n\
\t        contexts = [],\n\
\t        types = [],\n\
\t        ids = [],\n\
\t        param = undefined;\n\
\n\
\t    options.name = this.quotedString(helper);\n\
\t    options.hash = this.popStack();\n\
\n\
\t    if (this.trackIds) {\n\
\t      options.hashIds = this.popStack();\n\
\t    }\n\
\t    if (this.stringParams) {\n\
\t      options.hashTypes = this.popStack();\n\
\t      options.hashContexts = this.popStack();\n\
\t    }\n\
\n\
\t    var inverse = this.popStack(),\n\
\t        program = this.popStack();\n\
\n\
\t    // Avoid setting fn and inverse if neither are set. This allows\n\
\t    // helpers to do a check for `if (options.fn)`\n\
\t    if (program || inverse) {\n\
\t      options.fn = program || 'this.noop';\n\
\t      options.inverse = inverse || 'this.noop';\n\
\t    }\n\
\n\
\t    // The parameters go on to the stack in order (making sure that they are evaluated in order)\n\
\t    // so we need to pop them off the stack in reverse order\n\
\t    var i = paramSize;\n\
\t    while (i--) {\n\
\t      param = this.popStack();\n\
\t      params[i] = param;\n\
\n\
\t      if (this.trackIds) {\n\
\t        ids[i] = this.popStack();\n\
\t      }\n\
\t      if (this.stringParams) {\n\
\t        types[i] = this.popStack();\n\
\t        contexts[i] = this.popStack();\n\
\t      }\n\
\t    }\n\
\n\
\t    if (this.trackIds) {\n\
\t      options.ids = this.source.generateArray(ids);\n\
\t    }\n\
\t    if (this.stringParams) {\n\
\t      options.types = this.source.generateArray(types);\n\
\t      options.contexts = this.source.generateArray(contexts);\n\
\t    }\n\
\n\
\t    if (this.options.data) {\n\
\t      options.data = 'data';\n\
\t    }\n\
\t    if (this.useBlockParams) {\n\
\t      options.blockParams = 'blockParams';\n\
\t    }\n\
\t    return options;\n\
\t  },\n\
\n\
\t  setupHelperArgs: function setupHelperArgs(helper, paramSize, params, useRegister) {\n\
\t    var options = this.setupParams(helper, paramSize, params, true);\n\
\t    options = this.objectLiteral(options);\n\
\t    if (useRegister) {\n\
\t      this.useRegister('options');\n\
\t      params.push('options');\n\
\t      return ['options=', options];\n\
\t    } else {\n\
\t      params.push(options);\n\
\t      return '';\n\
\t    }\n\
\t  }\n\
\t};\n\
\n\
\t(function () {\n\
\t  var reservedWords = ('break else new var' + ' case finally return void' + ' catch for switch while' + ' continue function this with' + ' default if throw' + ' delete in try' + ' do instanceof typeof' + ' abstract enum int short' + ' boolean export interface static' + ' byte extends long super' + ' char final native synchronized' + ' class float package throws' + ' const goto private transient' + ' debugger implements protected volatile' + ' double import public let yield await' + ' null true false').split(' ');\n\
\n\
\t  var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};\n\
\n\
\t  for (var i = 0, l = reservedWords.length; i < l; i++) {\n\
\t    compilerWords[reservedWords[i]] = true;\n\
\t  }\n\
\t})();\n\
\n\
\tJavaScriptCompiler.isValidJavaScriptVariableName = function (name) {\n\
\t  return !JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);\n\
\t};\n\
\n\
\tfunction strictLookup(requireTerminal, compiler, parts, type) {\n\
\t  var stack = compiler.popStack(),\n\
\t      i = 0,\n\
\t      len = parts.length;\n\
\t  if (requireTerminal) {\n\
\t    len--;\n\
\t  }\n\
\n\
\t  for (; i < len; i++) {\n\
\t    stack = compiler.nameLookup(stack, parts[i], type);\n\
\t  }\n\
\n\
\t  if (requireTerminal) {\n\
\t    return [compiler.aliasable('this.strict'), '(', stack, ', ', compiler.quotedString(parts[i]), ')'];\n\
\t  } else {\n\
\t    return stack;\n\
\t  }\n\
\t}\n\
\n\
\texports['default'] = JavaScriptCompiler;\n\
\tmodule.exports = exports['default'];\n\
\n\
/***/ },\n\
/* 6 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t'use strict';\n\
\n\
\tvar _interopRequireWildcard = __webpack_require__(8)['default'];\n\
\n\
\texports.__esModule = true;\n\
\n\
\tvar _Exception = __webpack_require__(11);\n\
\n\
\tvar _Exception2 = _interopRequireWildcard(_Exception);\n\
\n\
\tvar _AST = __webpack_require__(2);\n\
\n\
\tvar _AST2 = _interopRequireWildcard(_AST);\n\
\n\
\tfunction Visitor() {\n\
\t  this.parents = [];\n\
\t}\n\
\n\
\tVisitor.prototype = {\n\
\t  constructor: Visitor,\n\
\t  mutating: false,\n\
\n\
\t  // Visits a given value. If mutating, will replace the value if necessary.\n\
\t  acceptKey: function acceptKey(node, name) {\n\
\t    var value = this.accept(node[name]);\n\
\t    if (this.mutating) {\n\
\t      // Hacky sanity check:\n\
\t      if (value && (!value.type || !_AST2['default'][value.type])) {\n\
\t        throw new _Exception2['default']('Unexpected node type \"' + value.type + '\" found when accepting ' + name + ' on ' + node.type);\n\
\t      }\n\
\t      node[name] = value;\n\
\t    }\n\
\t  },\n\
\n\
\t  // Performs an accept operation with added sanity check to ensure\n\
\t  // required keys are not removed.\n\
\t  acceptRequired: function acceptRequired(node, name) {\n\
\t    this.acceptKey(node, name);\n\
\n\
\t    if (!node[name]) {\n\
\t      throw new _Exception2['default'](node.type + ' requires ' + name);\n\
\t    }\n\
\t  },\n\
\n\
\t  // Traverses a given array. If mutating, empty respnses will be removed\n\
\t  // for child elements.\n\
\t  acceptArray: function acceptArray(array) {\n\
\t    for (var i = 0, l = array.length; i < l; i++) {\n\
\t      this.acceptKey(array, i);\n\
\n\
\t      if (!array[i]) {\n\
\t        array.splice(i, 1);\n\
\t        i--;\n\
\t        l--;\n\
\t      }\n\
\t    }\n\
\t  },\n\
\n\
\t  accept: function accept(object) {\n\
\t    if (!object) {\n\
\t      return;\n\
\t    }\n\
\n\
\t    if (this.current) {\n\
\t      this.parents.unshift(this.current);\n\
\t    }\n\
\t    this.current = object;\n\
\n\
\t    var ret = this[object.type](object);\n\
\n\
\t    this.current = this.parents.shift();\n\
\n\
\t    if (!this.mutating || ret) {\n\
\t      return ret;\n\
\t    } else if (ret !== false) {\n\
\t      return object;\n\
\t    }\n\
\t  },\n\
\n\
\t  Program: function Program(program) {\n\
\t    this.acceptArray(program.body);\n\
\t  },\n\
\n\
\t  MustacheStatement: function MustacheStatement(mustache) {\n\
\t    this.acceptRequired(mustache, 'path');\n\
\t    this.acceptArray(mustache.params);\n\
\t    this.acceptKey(mustache, 'hash');\n\
\t  },\n\
\n\
\t  BlockStatement: function BlockStatement(block) {\n\
\t    this.acceptRequired(block, 'path');\n\
\t    this.acceptArray(block.params);\n\
\t    this.acceptKey(block, 'hash');\n\
\n\
\t    this.acceptKey(block, 'program');\n\
\t    this.acceptKey(block, 'inverse');\n\
\t  },\n\
\n\
\t  PartialStatement: function PartialStatement(partial) {\n\
\t    this.acceptRequired(partial, 'name');\n\
\t    this.acceptArray(partial.params);\n\
\t    this.acceptKey(partial, 'hash');\n\
\t  },\n\
\n\
\t  ContentStatement: function ContentStatement() {},\n\
\t  CommentStatement: function CommentStatement() {},\n\
\n\
\t  SubExpression: function SubExpression(sexpr) {\n\
\t    this.acceptRequired(sexpr, 'path');\n\
\t    this.acceptArray(sexpr.params);\n\
\t    this.acceptKey(sexpr, 'hash');\n\
\t  },\n\
\n\
\t  PathExpression: function PathExpression() {},\n\
\n\
\t  StringLiteral: function StringLiteral() {},\n\
\t  NumberLiteral: function NumberLiteral() {},\n\
\t  BooleanLiteral: function BooleanLiteral() {},\n\
\t  UndefinedLiteral: function UndefinedLiteral() {},\n\
\t  NullLiteral: function NullLiteral() {},\n\
\n\
\t  Hash: function Hash(hash) {\n\
\t    this.acceptArray(hash.pairs);\n\
\t  },\n\
\t  HashPair: function HashPair(pair) {\n\
\t    this.acceptRequired(pair, 'value');\n\
\t  }\n\
\t};\n\
\n\
\texports['default'] = Visitor;\n\
\tmodule.exports = exports['default'];\n\
\t/* content */ /* comment */ /* path */ /* string */ /* number */ /* bool */ /* literal */ /* literal */\n\
\n\
/***/ },\n\
/* 7 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t/* WEBPACK VAR INJECTION */(function(global) {'use strict';\n\
\n\
\texports.__esModule = true;\n\
\t/*global window */\n\
\n\
\texports['default'] = function (Handlebars) {\n\
\t  /* istanbul ignore next */\n\
\t  var root = typeof global !== 'undefined' ? global : window,\n\
\t      $Handlebars = root.Handlebars;\n\
\t  /* istanbul ignore next */\n\
\t  Handlebars.noConflict = function () {\n\
\t    if (root.Handlebars === Handlebars) {\n\
\t      root.Handlebars = $Handlebars;\n\
\t    }\n\
\t  };\n\
\t};\n\
\n\
\tmodule.exports = exports['default'];\n\
\t/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))\n\
\n\
/***/ },\n\
/* 8 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t\"use strict\";\n\
\n\
\texports[\"default\"] = function (obj) {\n\
\t  return obj && obj.__esModule ? obj : {\n\
\t    \"default\": obj\n\
\t  };\n\
\t};\n\
\n\
\texports.__esModule = true;\n\
\n\
/***/ },\n\
/* 9 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t'use strict';\n\
\n\
\tvar _interopRequireWildcard = __webpack_require__(8)['default'];\n\
\n\
\texports.__esModule = true;\n\
\texports.HandlebarsEnvironment = HandlebarsEnvironment;\n\
\texports.createFrame = createFrame;\n\
\n\
\tvar _import = __webpack_require__(12);\n\
\n\
\tvar Utils = _interopRequireWildcard(_import);\n\
\n\
\tvar _Exception = __webpack_require__(11);\n\
\n\
\tvar _Exception2 = _interopRequireWildcard(_Exception);\n\
\n\
\tvar VERSION = '3.0.1';\n\
\texports.VERSION = VERSION;\n\
\tvar COMPILER_REVISION = 6;\n\
\n\
\texports.COMPILER_REVISION = COMPILER_REVISION;\n\
\tvar REVISION_CHANGES = {\n\
\t  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it\n\
\t  2: '== 1.0.0-rc.3',\n\
\t  3: '== 1.0.0-rc.4',\n\
\t  4: '== 1.x.x',\n\
\t  5: '== 2.0.0-alpha.x',\n\
\t  6: '>= 2.0.0-beta.1'\n\
\t};\n\
\n\
\texports.REVISION_CHANGES = REVISION_CHANGES;\n\
\tvar isArray = Utils.isArray,\n\
\t    isFunction = Utils.isFunction,\n\
\t    toString = Utils.toString,\n\
\t    objectType = '[object Object]';\n\
\n\
\tfunction HandlebarsEnvironment(helpers, partials) {\n\
\t  this.helpers = helpers || {};\n\
\t  this.partials = partials || {};\n\
\n\
\t  registerDefaultHelpers(this);\n\
\t}\n\
\n\
\tHandlebarsEnvironment.prototype = {\n\
\t  constructor: HandlebarsEnvironment,\n\
\n\
\t  logger: logger,\n\
\t  log: log,\n\
\n\
\t  registerHelper: function registerHelper(name, fn) {\n\
\t    if (toString.call(name) === objectType) {\n\
\t      if (fn) {\n\
\t        throw new _Exception2['default']('Arg not supported with multiple helpers');\n\
\t      }\n\
\t      Utils.extend(this.helpers, name);\n\
\t    } else {\n\
\t      this.helpers[name] = fn;\n\
\t    }\n\
\t  },\n\
\t  unregisterHelper: function unregisterHelper(name) {\n\
\t    delete this.helpers[name];\n\
\t  },\n\
\n\
\t  registerPartial: function registerPartial(name, partial) {\n\
\t    if (toString.call(name) === objectType) {\n\
\t      Utils.extend(this.partials, name);\n\
\t    } else {\n\
\t      if (typeof partial === 'undefined') {\n\
\t        throw new _Exception2['default']('Attempting to register a partial as undefined');\n\
\t      }\n\
\t      this.partials[name] = partial;\n\
\t    }\n\
\t  },\n\
\t  unregisterPartial: function unregisterPartial(name) {\n\
\t    delete this.partials[name];\n\
\t  }\n\
\t};\n\
\n\
\tfunction registerDefaultHelpers(instance) {\n\
\t  instance.registerHelper('helperMissing', function () {\n\
\t    if (arguments.length === 1) {\n\
\t      // A missing field in a {{foo}} constuct.\n\
\t      return undefined;\n\
\t    } else {\n\
\t      // Someone is actually trying to call something, blow up.\n\
\t      throw new _Exception2['default']('Missing helper: \"' + arguments[arguments.length - 1].name + '\"');\n\
\t    }\n\
\t  });\n\
\n\
\t  instance.registerHelper('blockHelperMissing', function (context, options) {\n\
\t    var inverse = options.inverse,\n\
\t        fn = options.fn;\n\
\n\
\t    if (context === true) {\n\
\t      return fn(this);\n\
\t    } else if (context === false || context == null) {\n\
\t      return inverse(this);\n\
\t    } else if (isArray(context)) {\n\
\t      if (context.length > 0) {\n\
\t        if (options.ids) {\n\
\t          options.ids = [options.name];\n\
\t        }\n\
\n\
\t        return instance.helpers.each(context, options);\n\
\t      } else {\n\
\t        return inverse(this);\n\
\t      }\n\
\t    } else {\n\
\t      if (options.data && options.ids) {\n\
\t        var data = createFrame(options.data);\n\
\t        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.name);\n\
\t        options = { data: data };\n\
\t      }\n\
\n\
\t      return fn(context, options);\n\
\t    }\n\
\t  });\n\
\n\
\t  instance.registerHelper('each', function (context, options) {\n\
\t    if (!options) {\n\
\t      throw new _Exception2['default']('Must pass iterator to #each');\n\
\t    }\n\
\n\
\t    var fn = options.fn,\n\
\t        inverse = options.inverse,\n\
\t        i = 0,\n\
\t        ret = '',\n\
\t        data = undefined,\n\
\t        contextPath = undefined;\n\
\n\
\t    if (options.data && options.ids) {\n\
\t      contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';\n\
\t    }\n\
\n\
\t    if (isFunction(context)) {\n\
\t      context = context.call(this);\n\
\t    }\n\
\n\
\t    if (options.data) {\n\
\t      data = createFrame(options.data);\n\
\t    }\n\
\n\
\t    function execIteration(field, index, last) {\n\
\t      if (data) {\n\
\t        data.key = field;\n\
\t        data.index = index;\n\
\t        data.first = index === 0;\n\
\t        data.last = !!last;\n\
\n\
\t        if (contextPath) {\n\
\t          data.contextPath = contextPath + field;\n\
\t        }\n\
\t      }\n\
\n\
\t      ret = ret + fn(context[field], {\n\
\t        data: data,\n\
\t        blockParams: Utils.blockParams([context[field], field], [contextPath + field, null])\n\
\t      });\n\
\t    }\n\
\n\
\t    if (context && typeof context === 'object') {\n\
\t      if (isArray(context)) {\n\
\t        for (var j = context.length; i < j; i++) {\n\
\t          execIteration(i, i, i === context.length - 1);\n\
\t        }\n\
\t      } else {\n\
\t        var priorKey = undefined;\n\
\n\
\t        for (var key in context) {\n\
\t          if (context.hasOwnProperty(key)) {\n\
\t            // We're running the iterations one step out of sync so we can detect\n\
\t            // the last iteration without have to scan the object twice and create\n\
\t            // an itermediate keys array.\n\
\t            if (priorKey) {\n\
\t              execIteration(priorKey, i - 1);\n\
\t            }\n\
\t            priorKey = key;\n\
\t            i++;\n\
\t          }\n\
\t        }\n\
\t        if (priorKey) {\n\
\t          execIteration(priorKey, i - 1, true);\n\
\t        }\n\
\t      }\n\
\t    }\n\
\n\
\t    if (i === 0) {\n\
\t      ret = inverse(this);\n\
\t    }\n\
\n\
\t    return ret;\n\
\t  });\n\
\n\
\t  instance.registerHelper('if', function (conditional, options) {\n\
\t    if (isFunction(conditional)) {\n\
\t      conditional = conditional.call(this);\n\
\t    }\n\
\n\
\t    // Default behavior is to render the positive path if the value is truthy and not empty.\n\
\t    // The `includeZero` option may be set to treat the condtional as purely not empty based on the\n\
\t    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.\n\
\t    if (!options.hash.includeZero && !conditional || Utils.isEmpty(conditional)) {\n\
\t      return options.inverse(this);\n\
\t    } else {\n\
\t      return options.fn(this);\n\
\t    }\n\
\t  });\n\
\n\
\t  instance.registerHelper('unless', function (conditional, options) {\n\
\t    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });\n\
\t  });\n\
\n\
\t  instance.registerHelper('with', function (context, options) {\n\
\t    if (isFunction(context)) {\n\
\t      context = context.call(this);\n\
\t    }\n\
\n\
\t    var fn = options.fn;\n\
\n\
\t    if (!Utils.isEmpty(context)) {\n\
\t      if (options.data && options.ids) {\n\
\t        var data = createFrame(options.data);\n\
\t        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]);\n\
\t        options = { data: data };\n\
\t      }\n\
\n\
\t      return fn(context, options);\n\
\t    } else {\n\
\t      return options.inverse(this);\n\
\t    }\n\
\t  });\n\
\n\
\t  instance.registerHelper('log', function (message, options) {\n\
\t    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;\n\
\t    instance.log(level, message);\n\
\t  });\n\
\n\
\t  instance.registerHelper('lookup', function (obj, field) {\n\
\t    return obj && obj[field];\n\
\t  });\n\
\t}\n\
\n\
\tvar logger = {\n\
\t  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },\n\
\n\
\t  // State enum\n\
\t  DEBUG: 0,\n\
\t  INFO: 1,\n\
\t  WARN: 2,\n\
\t  ERROR: 3,\n\
\t  level: 1,\n\
\n\
\t  // Can be overridden in the host environment\n\
\t  log: function log(level, message) {\n\
\t    if (typeof console !== 'undefined' && logger.level <= level) {\n\
\t      var method = logger.methodMap[level];\n\
\t      (console[method] || console.log).call(console, message); // eslint-disable-line no-console\n\
\t    }\n\
\t  }\n\
\t};\n\
\n\
\texports.logger = logger;\n\
\tvar log = logger.log;\n\
\n\
\texports.log = log;\n\
\n\
\tfunction createFrame(object) {\n\
\t  var frame = Utils.extend({}, object);\n\
\t  frame._parent = object;\n\
\t  return frame;\n\
\t}\n\
\n\
\t/* [args, ]options */\n\
\n\
/***/ },\n\
/* 10 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t'use strict';\n\
\n\
\texports.__esModule = true;\n\
\t// Build out our basic SafeString type\n\
\tfunction SafeString(string) {\n\
\t  this.string = string;\n\
\t}\n\
\n\
\tSafeString.prototype.toString = SafeString.prototype.toHTML = function () {\n\
\t  return '' + this.string;\n\
\t};\n\
\n\
\texports['default'] = SafeString;\n\
\tmodule.exports = exports['default'];\n\
\n\
/***/ },\n\
/* 11 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t'use strict';\n\
\n\
\texports.__esModule = true;\n\
\n\
\tvar errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];\n\
\n\
\tfunction Exception(message, node) {\n\
\t  var loc = node && node.loc,\n\
\t      line = undefined,\n\
\t      column = undefined;\n\
\t  if (loc) {\n\
\t    line = loc.start.line;\n\
\t    column = loc.start.column;\n\
\n\
\t    message += ' - ' + line + ':' + column;\n\
\t  }\n\
\n\
\t  var tmp = Error.prototype.constructor.call(this, message);\n\
\n\
\t  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.\n\
\t  for (var idx = 0; idx < errorProps.length; idx++) {\n\
\t    this[errorProps[idx]] = tmp[errorProps[idx]];\n\
\t  }\n\
\n\
\t  if (Error.captureStackTrace) {\n\
\t    Error.captureStackTrace(this, Exception);\n\
\t  }\n\
\n\
\t  if (loc) {\n\
\t    this.lineNumber = line;\n\
\t    this.column = column;\n\
\t  }\n\
\t}\n\
\n\
\tException.prototype = new Error();\n\
\n\
\texports['default'] = Exception;\n\
\tmodule.exports = exports['default'];\n\
\n\
/***/ },\n\
/* 12 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t'use strict';\n\
\n\
\texports.__esModule = true;\n\
\texports.extend = extend;\n\
\n\
\t// Older IE versions do not directly support indexOf so we must implement our own, sadly.\n\
\texports.indexOf = indexOf;\n\
\texports.escapeExpression = escapeExpression;\n\
\texports.isEmpty = isEmpty;\n\
\texports.blockParams = blockParams;\n\
\texports.appendContextPath = appendContextPath;\n\
\tvar escape = {\n\
\t  '&': '&amp;',\n\
\t  '<': '&lt;',\n\
\t  '>': '&gt;',\n\
\t  '\"': '&quot;',\n\
\t  '\\'': '&#x27;',\n\
\t  '`': '&#x60;'\n\
\t};\n\
\n\
\tvar badChars = /[&<>\"'`]/g,\n\
\t    possible = /[&<>\"'`]/;\n\
\n\
\tfunction escapeChar(chr) {\n\
\t  return escape[chr];\n\
\t}\n\
\n\
\tfunction extend(obj /* , ...source */) {\n\
\t  for (var i = 1; i < arguments.length; i++) {\n\
\t    for (var key in arguments[i]) {\n\
\t      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {\n\
\t        obj[key] = arguments[i][key];\n\
\t      }\n\
\t    }\n\
\t  }\n\
\n\
\t  return obj;\n\
\t}\n\
\n\
\tvar toString = Object.prototype.toString;\n\
\n\
\texports.toString = toString;\n\
\t// Sourced from lodash\n\
\t// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt\n\
\t/*eslint-disable func-style, no-var */\n\
\tvar isFunction = function isFunction(value) {\n\
\t  return typeof value === 'function';\n\
\t};\n\
\t// fallback for older versions of Chrome and Safari\n\
\t/* istanbul ignore next */\n\
\tif (isFunction(/x/)) {\n\
\t  exports.isFunction = isFunction = function (value) {\n\
\t    return typeof value === 'function' && toString.call(value) === '[object Function]';\n\
\t  };\n\
\t}\n\
\tvar isFunction;\n\
\texports.isFunction = isFunction;\n\
\t/*eslint-enable func-style, no-var */\n\
\n\
\t/* istanbul ignore next */\n\
\tvar isArray = Array.isArray || function (value) {\n\
\t  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;\n\
\t};exports.isArray = isArray;\n\
\n\
\tfunction indexOf(array, value) {\n\
\t  for (var i = 0, len = array.length; i < len; i++) {\n\
\t    if (array[i] === value) {\n\
\t      return i;\n\
\t    }\n\
\t  }\n\
\t  return -1;\n\
\t}\n\
\n\
\tfunction escapeExpression(string) {\n\
\t  if (typeof string !== 'string') {\n\
\t    // don't escape SafeStrings, since they're already safe\n\
\t    if (string && string.toHTML) {\n\
\t      return string.toHTML();\n\
\t    } else if (string == null) {\n\
\t      return '';\n\
\t    } else if (!string) {\n\
\t      return string + '';\n\
\t    }\n\
\n\
\t    // Force a string conversion as this will be done by the append regardless and\n\
\t    // the regex test will do this transparently behind the scenes, causing issues if\n\
\t    // an object's to string has escaped characters in it.\n\
\t    string = '' + string;\n\
\t  }\n\
\n\
\t  if (!possible.test(string)) {\n\
\t    return string;\n\
\t  }\n\
\t  return string.replace(badChars, escapeChar);\n\
\t}\n\
\n\
\tfunction isEmpty(value) {\n\
\t  if (!value && value !== 0) {\n\
\t    return true;\n\
\t  } else if (isArray(value) && value.length === 0) {\n\
\t    return true;\n\
\t  } else {\n\
\t    return false;\n\
\t  }\n\
\t}\n\
\n\
\tfunction blockParams(params, ids) {\n\
\t  params.path = ids;\n\
\t  return params;\n\
\t}\n\
\n\
\tfunction appendContextPath(contextPath, id) {\n\
\t  return (contextPath ? contextPath + '.' : '') + id;\n\
\t}\n\
\n\
/***/ },\n\
/* 13 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t'use strict';\n\
\n\
\tvar _interopRequireWildcard = __webpack_require__(8)['default'];\n\
\n\
\texports.__esModule = true;\n\
\texports.checkRevision = checkRevision;\n\
\n\
\t// TODO: Remove this line and break up compilePartial\n\
\n\
\texports.template = template;\n\
\texports.wrapProgram = wrapProgram;\n\
\texports.resolvePartial = resolvePartial;\n\
\texports.invokePartial = invokePartial;\n\
\texports.noop = noop;\n\
\n\
\tvar _import = __webpack_require__(12);\n\
\n\
\tvar Utils = _interopRequireWildcard(_import);\n\
\n\
\tvar _Exception = __webpack_require__(11);\n\
\n\
\tvar _Exception2 = _interopRequireWildcard(_Exception);\n\
\n\
\tvar _COMPILER_REVISION$REVISION_CHANGES$createFrame = __webpack_require__(9);\n\
\n\
\tfunction checkRevision(compilerInfo) {\n\
\t  var compilerRevision = compilerInfo && compilerInfo[0] || 1,\n\
\t      currentRevision = _COMPILER_REVISION$REVISION_CHANGES$createFrame.COMPILER_REVISION;\n\
\n\
\t  if (compilerRevision !== currentRevision) {\n\
\t    if (compilerRevision < currentRevision) {\n\
\t      var runtimeVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[currentRevision],\n\
\t          compilerVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[compilerRevision];\n\
\t      throw new _Exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');\n\
\t    } else {\n\
\t      // Use the embedded version info since the runtime doesn't know about this revision yet\n\
\t      throw new _Exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');\n\
\t    }\n\
\t  }\n\
\t}\n\
\n\
\tfunction template(templateSpec, env) {\n\
\t  /* istanbul ignore next */\n\
\t  if (!env) {\n\
\t    throw new _Exception2['default']('No environment passed to template');\n\
\t  }\n\
\t  if (!templateSpec || !templateSpec.main) {\n\
\t    throw new _Exception2['default']('Unknown template object: ' + typeof templateSpec);\n\
\t  }\n\
\n\
\t  // Note: Using env.VM references rather than local var references throughout this section to allow\n\
\t  // for external users to override these as psuedo-supported APIs.\n\
\t  env.VM.checkRevision(templateSpec.compiler);\n\
\n\
\t  function invokePartialWrapper(partial, context, options) {\n\
\t    if (options.hash) {\n\
\t      context = Utils.extend({}, context, options.hash);\n\
\t    }\n\
\n\
\t    partial = env.VM.resolvePartial.call(this, partial, context, options);\n\
\t    var result = env.VM.invokePartial.call(this, partial, context, options);\n\
\n\
\t    if (result == null && env.compile) {\n\
\t      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);\n\
\t      result = options.partials[options.name](context, options);\n\
\t    }\n\
\t    if (result != null) {\n\
\t      if (options.indent) {\n\
\t        var lines = result.split('\\n\
');\n\
\t        for (var i = 0, l = lines.length; i < l; i++) {\n\
\t          if (!lines[i] && i + 1 === l) {\n\
\t            break;\n\
\t          }\n\
\n\
\t          lines[i] = options.indent + lines[i];\n\
\t        }\n\
\t        result = lines.join('\\n\
');\n\
\t      }\n\
\t      return result;\n\
\t    } else {\n\
\t      throw new _Exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');\n\
\t    }\n\
\t  }\n\
\n\
\t  // Just add water\n\
\t  var container = {\n\
\t    strict: function strict(obj, name) {\n\
\t      if (!(name in obj)) {\n\
\t        throw new _Exception2['default']('\"' + name + '\" not defined in ' + obj);\n\
\t      }\n\
\t      return obj[name];\n\
\t    },\n\
\t    lookup: function lookup(depths, name) {\n\
\t      var len = depths.length;\n\
\t      for (var i = 0; i < len; i++) {\n\
\t        if (depths[i] && depths[i][name] != null) {\n\
\t          return depths[i][name];\n\
\t        }\n\
\t      }\n\
\t    },\n\
\t    lambda: function lambda(current, context) {\n\
\t      return typeof current === 'function' ? current.call(context) : current;\n\
\t    },\n\
\n\
\t    escapeExpression: Utils.escapeExpression,\n\
\t    invokePartial: invokePartialWrapper,\n\
\n\
\t    fn: function fn(i) {\n\
\t      return templateSpec[i];\n\
\t    },\n\
\n\
\t    programs: [],\n\
\t    program: function program(i, data, declaredBlockParams, blockParams, depths) {\n\
\t      var programWrapper = this.programs[i],\n\
\t          fn = this.fn(i);\n\
\t      if (data || depths || blockParams || declaredBlockParams) {\n\
\t        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);\n\
\t      } else if (!programWrapper) {\n\
\t        programWrapper = this.programs[i] = wrapProgram(this, i, fn);\n\
\t      }\n\
\t      return programWrapper;\n\
\t    },\n\
\n\
\t    data: function data(value, depth) {\n\
\t      while (value && depth--) {\n\
\t        value = value._parent;\n\
\t      }\n\
\t      return value;\n\
\t    },\n\
\t    merge: function merge(param, common) {\n\
\t      var obj = param || common;\n\
\n\
\t      if (param && common && param !== common) {\n\
\t        obj = Utils.extend({}, common, param);\n\
\t      }\n\
\n\
\t      return obj;\n\
\t    },\n\
\n\
\t    noop: env.VM.noop,\n\
\t    compilerInfo: templateSpec.compiler\n\
\t  };\n\
\n\
\t  function ret(context) {\n\
\t    var options = arguments[1] === undefined ? {} : arguments[1];\n\
\n\
\t    var data = options.data;\n\
\n\
\t    ret._setup(options);\n\
\t    if (!options.partial && templateSpec.useData) {\n\
\t      data = initData(context, data);\n\
\t    }\n\
\t    var depths = undefined,\n\
\t        blockParams = templateSpec.useBlockParams ? [] : undefined;\n\
\t    if (templateSpec.useDepths) {\n\
\t      depths = options.depths ? [context].concat(options.depths) : [context];\n\
\t    }\n\
\n\
\t    return templateSpec.main.call(container, context, container.helpers, container.partials, data, blockParams, depths);\n\
\t  }\n\
\t  ret.isTop = true;\n\
\n\
\t  ret._setup = function (options) {\n\
\t    if (!options.partial) {\n\
\t      container.helpers = container.merge(options.helpers, env.helpers);\n\
\n\
\t      if (templateSpec.usePartial) {\n\
\t        container.partials = container.merge(options.partials, env.partials);\n\
\t      }\n\
\t    } else {\n\
\t      container.helpers = options.helpers;\n\
\t      container.partials = options.partials;\n\
\t    }\n\
\t  };\n\
\n\
\t  ret._child = function (i, data, blockParams, depths) {\n\
\t    if (templateSpec.useBlockParams && !blockParams) {\n\
\t      throw new _Exception2['default']('must pass block params');\n\
\t    }\n\
\t    if (templateSpec.useDepths && !depths) {\n\
\t      throw new _Exception2['default']('must pass parent depths');\n\
\t    }\n\
\n\
\t    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);\n\
\t  };\n\
\t  return ret;\n\
\t}\n\
\n\
\tfunction wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {\n\
\t  function prog(context) {\n\
\t    var options = arguments[1] === undefined ? {} : arguments[1];\n\
\n\
\t    return fn.call(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), depths && [context].concat(depths));\n\
\t  }\n\
\t  prog.program = i;\n\
\t  prog.depth = depths ? depths.length : 0;\n\
\t  prog.blockParams = declaredBlockParams || 0;\n\
\t  return prog;\n\
\t}\n\
\n\
\tfunction resolvePartial(partial, context, options) {\n\
\t  if (!partial) {\n\
\t    partial = options.partials[options.name];\n\
\t  } else if (!partial.call && !options.name) {\n\
\t    // This is a dynamic partial that returned a string\n\
\t    options.name = partial;\n\
\t    partial = options.partials[partial];\n\
\t  }\n\
\t  return partial;\n\
\t}\n\
\n\
\tfunction invokePartial(partial, context, options) {\n\
\t  options.partial = true;\n\
\n\
\t  if (partial === undefined) {\n\
\t    throw new _Exception2['default']('The partial ' + options.name + ' could not be found');\n\
\t  } else if (partial instanceof Function) {\n\
\t    return partial(context, options);\n\
\t  }\n\
\t}\n\
\n\
\tfunction noop() {\n\
\t  return '';\n\
\t}\n\
\n\
\tfunction initData(context, data) {\n\
\t  if (!data || !('root' in data)) {\n\
\t    data = data ? _COMPILER_REVISION$REVISION_CHANGES$createFrame.createFrame(data) : {};\n\
\t    data.root = context;\n\
\t  }\n\
\t  return data;\n\
\t}\n\
\n\
/***/ },\n\
/* 14 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t\"use strict\";\n\
\n\
\texports.__esModule = true;\n\
\t/* istanbul ignore next */\n\
\t/* Jison generated parser */\n\
\tvar handlebars = (function () {\n\
\t    var parser = { trace: function trace() {},\n\
\t        yy: {},\n\
\t        symbols_: { error: 2, root: 3, program: 4, EOF: 5, program_repetition0: 6, statement: 7, mustache: 8, block: 9, rawBlock: 10, partial: 11, content: 12, COMMENT: 13, CONTENT: 14, openRawBlock: 15, END_RAW_BLOCK: 16, OPEN_RAW_BLOCK: 17, helperName: 18, openRawBlock_repetition0: 19, openRawBlock_option0: 20, CLOSE_RAW_BLOCK: 21, openBlock: 22, block_option0: 23, closeBlock: 24, openInverse: 25, block_option1: 26, OPEN_BLOCK: 27, openBlock_repetition0: 28, openBlock_option0: 29, openBlock_option1: 30, CLOSE: 31, OPEN_INVERSE: 32, openInverse_repetition0: 33, openInverse_option0: 34, openInverse_option1: 35, openInverseChain: 36, OPEN_INVERSE_CHAIN: 37, openInverseChain_repetition0: 38, openInverseChain_option0: 39, openInverseChain_option1: 40, inverseAndProgram: 41, INVERSE: 42, inverseChain: 43, inverseChain_option0: 44, OPEN_ENDBLOCK: 45, OPEN: 46, mustache_repetition0: 47, mustache_option0: 48, OPEN_UNESCAPED: 49, mustache_repetition1: 50, mustache_option1: 51, CLOSE_UNESCAPED: 52, OPEN_PARTIAL: 53, partialName: 54, partial_repetition0: 55, partial_option0: 56, param: 57, sexpr: 58, OPEN_SEXPR: 59, sexpr_repetition0: 60, sexpr_option0: 61, CLOSE_SEXPR: 62, hash: 63, hash_repetition_plus0: 64, hashSegment: 65, ID: 66, EQUALS: 67, blockParams: 68, OPEN_BLOCK_PARAMS: 69, blockParams_repetition_plus0: 70, CLOSE_BLOCK_PARAMS: 71, path: 72, dataName: 73, STRING: 74, NUMBER: 75, BOOLEAN: 76, UNDEFINED: 77, NULL: 78, DATA: 79, pathSegments: 80, SEP: 81, $accept: 0, $end: 1 },\n\
\t        terminals_: { 2: \"error\", 5: \"EOF\", 13: \"COMMENT\", 14: \"CONTENT\", 16: \"END_RAW_BLOCK\", 17: \"OPEN_RAW_BLOCK\", 21: \"CLOSE_RAW_BLOCK\", 27: \"OPEN_BLOCK\", 31: \"CLOSE\", 32: \"OPEN_INVERSE\", 37: \"OPEN_INVERSE_CHAIN\", 42: \"INVERSE\", 45: \"OPEN_ENDBLOCK\", 46: \"OPEN\", 49: \"OPEN_UNESCAPED\", 52: \"CLOSE_UNESCAPED\", 53: \"OPEN_PARTIAL\", 59: \"OPEN_SEXPR\", 62: \"CLOSE_SEXPR\", 66: \"ID\", 67: \"EQUALS\", 69: \"OPEN_BLOCK_PARAMS\", 71: \"CLOSE_BLOCK_PARAMS\", 74: \"STRING\", 75: \"NUMBER\", 76: \"BOOLEAN\", 77: \"UNDEFINED\", 78: \"NULL\", 79: \"DATA\", 81: \"SEP\" },\n\
\t        productions_: [0, [3, 2], [4, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [12, 1], [10, 3], [15, 5], [9, 4], [9, 4], [22, 6], [25, 6], [36, 6], [41, 2], [43, 3], [43, 1], [24, 3], [8, 5], [8, 5], [11, 5], [57, 1], [57, 1], [58, 5], [63, 1], [65, 3], [68, 3], [18, 1], [18, 1], [18, 1], [18, 1], [18, 1], [18, 1], [18, 1], [54, 1], [54, 1], [73, 2], [72, 1], [80, 3], [80, 1], [6, 0], [6, 2], [19, 0], [19, 2], [20, 0], [20, 1], [23, 0], [23, 1], [26, 0], [26, 1], [28, 0], [28, 2], [29, 0], [29, 1], [30, 0], [30, 1], [33, 0], [33, 2], [34, 0], [34, 1], [35, 0], [35, 1], [38, 0], [38, 2], [39, 0], [39, 1], [40, 0], [40, 1], [44, 0], [44, 1], [47, 0], [47, 2], [48, 0], [48, 1], [50, 0], [50, 2], [51, 0], [51, 1], [55, 0], [55, 2], [56, 0], [56, 1], [60, 0], [60, 2], [61, 0], [61, 1], [64, 1], [64, 2], [70, 1], [70, 2]],\n\
\t        performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {\n\
\n\
\t            var $0 = $$.length - 1;\n\
\t            switch (yystate) {\n\
\t                case 1:\n\
\t                    return $$[$0 - 1];\n\
\t                    break;\n\
\t                case 2:\n\
\t                    this.$ = new yy.Program($$[$0], null, {}, yy.locInfo(this._$));\n\
\t                    break;\n\
\t                case 3:\n\
\t                    this.$ = $$[$0];\n\
\t                    break;\n\
\t                case 4:\n\
\t                    this.$ = $$[$0];\n\
\t                    break;\n\
\t                case 5:\n\
\t                    this.$ = $$[$0];\n\
\t                    break;\n\
\t                case 6:\n\
\t                    this.$ = $$[$0];\n\
\t                    break;\n\
\t                case 7:\n\
\t                    this.$ = $$[$0];\n\
\t                    break;\n\
\t                case 8:\n\
\t                    this.$ = new yy.CommentStatement(yy.stripComment($$[$0]), yy.stripFlags($$[$0], $$[$0]), yy.locInfo(this._$));\n\
\t                    break;\n\
\t                case 9:\n\
\t                    this.$ = new yy.ContentStatement($$[$0], yy.locInfo(this._$));\n\
\t                    break;\n\
\t                case 10:\n\
\t                    this.$ = yy.prepareRawBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);\n\
\t                    break;\n\
\t                case 11:\n\
\t                    this.$ = { path: $$[$0 - 3], params: $$[$0 - 2], hash: $$[$0 - 1] };\n\
\t                    break;\n\
\t                case 12:\n\
\t                    this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], false, this._$);\n\
\t                    break;\n\
\t                case 13:\n\
\t                    this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], true, this._$);\n\
\t                    break;\n\
\t                case 14:\n\
\t                    this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };\n\
\t                    break;\n\
\t                case 15:\n\
\t                    this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };\n\
\t                    break;\n\
\t                case 16:\n\
\t                    this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };\n\
\t                    break;\n\
\t                case 17:\n\
\t                    this.$ = { strip: yy.stripFlags($$[$0 - 1], $$[$0 - 1]), program: $$[$0] };\n\
\t                    break;\n\
\t                case 18:\n\
\t                    var inverse = yy.prepareBlock($$[$0 - 2], $$[$0 - 1], $$[$0], $$[$0], false, this._$),\n\
\t                        program = new yy.Program([inverse], null, {}, yy.locInfo(this._$));\n\
\t                    program.chained = true;\n\
\n\
\t                    this.$ = { strip: $$[$0 - 2].strip, program: program, chain: true };\n\
\n\
\t                    break;\n\
\t                case 19:\n\
\t                    this.$ = $$[$0];\n\
\t                    break;\n\
\t                case 20:\n\
\t                    this.$ = { path: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 2], $$[$0]) };\n\
\t                    break;\n\
\t                case 21:\n\
\t                    this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);\n\
\t                    break;\n\
\t                case 22:\n\
\t                    this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);\n\
\t                    break;\n\
\t                case 23:\n\
\t                    this.$ = new yy.PartialStatement($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], yy.stripFlags($$[$0 - 4], $$[$0]), yy.locInfo(this._$));\n\
\t                    break;\n\
\t                case 24:\n\
\t                    this.$ = $$[$0];\n\
\t                    break;\n\
\t                case 25:\n\
\t                    this.$ = $$[$0];\n\
\t                    break;\n\
\t                case 26:\n\
\t                    this.$ = new yy.SubExpression($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], yy.locInfo(this._$));\n\
\t                    break;\n\
\t                case 27:\n\
\t                    this.$ = new yy.Hash($$[$0], yy.locInfo(this._$));\n\
\t                    break;\n\
\t                case 28:\n\
\t                    this.$ = new yy.HashPair(yy.id($$[$0 - 2]), $$[$0], yy.locInfo(this._$));\n\
\t                    break;\n\
\t                case 29:\n\
\t                    this.$ = yy.id($$[$0 - 1]);\n\
\t                    break;\n\
\t                case 30:\n\
\t                    this.$ = $$[$0];\n\
\t                    break;\n\
\t                case 31:\n\
\t                    this.$ = $$[$0];\n\
\t                    break;\n\
\t                case 32:\n\
\t                    this.$ = new yy.StringLiteral($$[$0], yy.locInfo(this._$));\n\
\t                    break;\n\
\t                case 33:\n\
\t                    this.$ = new yy.NumberLiteral($$[$0], yy.locInfo(this._$));\n\
\t                    break;\n\
\t                case 34:\n\
\t                    this.$ = new yy.BooleanLiteral($$[$0], yy.locInfo(this._$));\n\
\t                    break;\n\
\t                case 35:\n\
\t                    this.$ = new yy.UndefinedLiteral(yy.locInfo(this._$));\n\
\t                    break;\n\
\t                case 36:\n\
\t                    this.$ = new yy.NullLiteral(yy.locInfo(this._$));\n\
\t                    break;\n\
\t                case 37:\n\
\t                    this.$ = $$[$0];\n\
\t                    break;\n\
\t                case 38:\n\
\t                    this.$ = $$[$0];\n\
\t                    break;\n\
\t                case 39:\n\
\t                    this.$ = yy.preparePath(true, $$[$0], this._$);\n\
\t                    break;\n\
\t                case 40:\n\
\t                    this.$ = yy.preparePath(false, $$[$0], this._$);\n\
\t                    break;\n\
\t                case 41:\n\
\t                    $$[$0 - 2].push({ part: yy.id($$[$0]), original: $$[$0], separator: $$[$0 - 1] });this.$ = $$[$0 - 2];\n\
\t                    break;\n\
\t                case 42:\n\
\t                    this.$ = [{ part: yy.id($$[$0]), original: $$[$0] }];\n\
\t                    break;\n\
\t                case 43:\n\
\t                    this.$ = [];\n\
\t                    break;\n\
\t                case 44:\n\
\t                    $$[$0 - 1].push($$[$0]);\n\
\t                    break;\n\
\t                case 45:\n\
\t                    this.$ = [];\n\
\t                    break;\n\
\t                case 46:\n\
\t                    $$[$0 - 1].push($$[$0]);\n\
\t                    break;\n\
\t                case 53:\n\
\t                    this.$ = [];\n\
\t                    break;\n\
\t                case 54:\n\
\t                    $$[$0 - 1].push($$[$0]);\n\
\t                    break;\n\
\t                case 59:\n\
\t                    this.$ = [];\n\
\t                    break;\n\
\t                case 60:\n\
\t                    $$[$0 - 1].push($$[$0]);\n\
\t                    break;\n\
\t                case 65:\n\
\t                    this.$ = [];\n\
\t                    break;\n\
\t                case 66:\n\
\t                    $$[$0 - 1].push($$[$0]);\n\
\t                    break;\n\
\t                case 73:\n\
\t                    this.$ = [];\n\
\t                    break;\n\
\t                case 74:\n\
\t                    $$[$0 - 1].push($$[$0]);\n\
\t                    break;\n\
\t                case 77:\n\
\t                    this.$ = [];\n\
\t                    break;\n\
\t                case 78:\n\
\t                    $$[$0 - 1].push($$[$0]);\n\
\t                    break;\n\
\t                case 81:\n\
\t                    this.$ = [];\n\
\t                    break;\n\
\t                case 82:\n\
\t                    $$[$0 - 1].push($$[$0]);\n\
\t                    break;\n\
\t                case 85:\n\
\t                    this.$ = [];\n\
\t                    break;\n\
\t                case 86:\n\
\t                    $$[$0 - 1].push($$[$0]);\n\
\t                    break;\n\
\t                case 89:\n\
\t                    this.$ = [$$[$0]];\n\
\t                    break;\n\
\t                case 90:\n\
\t                    $$[$0 - 1].push($$[$0]);\n\
\t                    break;\n\
\t                case 91:\n\
\t                    this.$ = [$$[$0]];\n\
\t                    break;\n\
\t                case 92:\n\
\t                    $$[$0 - 1].push($$[$0]);\n\
\t                    break;\n\
\t            }\n\
\t        },\n\
\t        table: [{ 3: 1, 4: 2, 5: [2, 43], 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 1: [3] }, { 5: [1, 4] }, { 5: [2, 2], 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10, 13: [1, 11], 14: [1, 18], 15: 16, 17: [1, 21], 22: 14, 25: 15, 27: [1, 19], 32: [1, 20], 37: [2, 2], 42: [2, 2], 45: [2, 2], 46: [1, 12], 49: [1, 13], 53: [1, 17] }, { 1: [2, 1] }, { 5: [2, 44], 13: [2, 44], 14: [2, 44], 17: [2, 44], 27: [2, 44], 32: [2, 44], 37: [2, 44], 42: [2, 44], 45: [2, 44], 46: [2, 44], 49: [2, 44], 53: [2, 44] }, { 5: [2, 3], 13: [2, 3], 14: [2, 3], 17: [2, 3], 27: [2, 3], 32: [2, 3], 37: [2, 3], 42: [2, 3], 45: [2, 3], 46: [2, 3], 49: [2, 3], 53: [2, 3] }, { 5: [2, 4], 13: [2, 4], 14: [2, 4], 17: [2, 4], 27: [2, 4], 32: [2, 4], 37: [2, 4], 42: [2, 4], 45: [2, 4], 46: [2, 4], 49: [2, 4], 53: [2, 4] }, { 5: [2, 5], 13: [2, 5], 14: [2, 5], 17: [2, 5], 27: [2, 5], 32: [2, 5], 37: [2, 5], 42: [2, 5], 45: [2, 5], 46: [2, 5], 49: [2, 5], 53: [2, 5] }, { 5: [2, 6], 13: [2, 6], 14: [2, 6], 17: [2, 6], 27: [2, 6], 32: [2, 6], 37: [2, 6], 42: [2, 6], 45: [2, 6], 46: [2, 6], 49: [2, 6], 53: [2, 6] }, { 5: [2, 7], 13: [2, 7], 14: [2, 7], 17: [2, 7], 27: [2, 7], 32: [2, 7], 37: [2, 7], 42: [2, 7], 45: [2, 7], 46: [2, 7], 49: [2, 7], 53: [2, 7] }, { 5: [2, 8], 13: [2, 8], 14: [2, 8], 17: [2, 8], 27: [2, 8], 32: [2, 8], 37: [2, 8], 42: [2, 8], 45: [2, 8], 46: [2, 8], 49: [2, 8], 53: [2, 8] }, { 18: 22, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 33, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 4: 34, 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 37: [2, 43], 42: [2, 43], 45: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 4: 35, 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 42: [2, 43], 45: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 12: 36, 14: [1, 18] }, { 18: 38, 54: 37, 58: 39, 59: [1, 40], 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 5: [2, 9], 13: [2, 9], 14: [2, 9], 16: [2, 9], 17: [2, 9], 27: [2, 9], 32: [2, 9], 37: [2, 9], 42: [2, 9], 45: [2, 9], 46: [2, 9], 49: [2, 9], 53: [2, 9] }, { 18: 41, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 42, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 43, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 31: [2, 73], 47: 44, 59: [2, 73], 66: [2, 73], 74: [2, 73], 75: [2, 73], 76: [2, 73], 77: [2, 73], 78: [2, 73], 79: [2, 73] }, { 21: [2, 30], 31: [2, 30], 52: [2, 30], 59: [2, 30], 62: [2, 30], 66: [2, 30], 69: [2, 30], 74: [2, 30], 75: [2, 30], 76: [2, 30], 77: [2, 30], 78: [2, 30], 79: [2, 30] }, { 21: [2, 31], 31: [2, 31], 52: [2, 31], 59: [2, 31], 62: [2, 31], 66: [2, 31], 69: [2, 31], 74: [2, 31], 75: [2, 31], 76: [2, 31], 77: [2, 31], 78: [2, 31], 79: [2, 31] }, { 21: [2, 32], 31: [2, 32], 52: [2, 32], 59: [2, 32], 62: [2, 32], 66: [2, 32], 69: [2, 32], 74: [2, 32], 75: [2, 32], 76: [2, 32], 77: [2, 32], 78: [2, 32], 79: [2, 32] }, { 21: [2, 33], 31: [2, 33], 52: [2, 33], 59: [2, 33], 62: [2, 33], 66: [2, 33], 69: [2, 33], 74: [2, 33], 75: [2, 33], 76: [2, 33], 77: [2, 33], 78: [2, 33], 79: [2, 33] }, { 21: [2, 34], 31: [2, 34], 52: [2, 34], 59: [2, 34], 62: [2, 34], 66: [2, 34], 69: [2, 34], 74: [2, 34], 75: [2, 34], 76: [2, 34], 77: [2, 34], 78: [2, 34], 79: [2, 34] }, { 21: [2, 35], 31: [2, 35], 52: [2, 35], 59: [2, 35], 62: [2, 35], 66: [2, 35], 69: [2, 35], 74: [2, 35], 75: [2, 35], 76: [2, 35], 77: [2, 35], 78: [2, 35], 79: [2, 35] }, { 21: [2, 36], 31: [2, 36], 52: [2, 36], 59: [2, 36], 62: [2, 36], 66: [2, 36], 69: [2, 36], 74: [2, 36], 75: [2, 36], 76: [2, 36], 77: [2, 36], 78: [2, 36], 79: [2, 36] }, { 21: [2, 40], 31: [2, 40], 52: [2, 40], 59: [2, 40], 62: [2, 40], 66: [2, 40], 69: [2, 40], 74: [2, 40], 75: [2, 40], 76: [2, 40], 77: [2, 40], 78: [2, 40], 79: [2, 40], 81: [1, 45] }, { 66: [1, 32], 80: 46 }, { 21: [2, 42], 31: [2, 42], 52: [2, 42], 59: [2, 42], 62: [2, 42], 66: [2, 42], 69: [2, 42], 74: [2, 42], 75: [2, 42], 76: [2, 42], 77: [2, 42], 78: [2, 42], 79: [2, 42], 81: [2, 42] }, { 50: 47, 52: [2, 77], 59: [2, 77], 66: [2, 77], 74: [2, 77], 75: [2, 77], 76: [2, 77], 77: [2, 77], 78: [2, 77], 79: [2, 77] }, { 23: 48, 36: 50, 37: [1, 52], 41: 51, 42: [1, 53], 43: 49, 45: [2, 49] }, { 26: 54, 41: 55, 42: [1, 53], 45: [2, 51] }, { 16: [1, 56] }, { 31: [2, 81], 55: 57, 59: [2, 81], 66: [2, 81], 74: [2, 81], 75: [2, 81], 76: [2, 81], 77: [2, 81], 78: [2, 81], 79: [2, 81] }, { 31: [2, 37], 59: [2, 37], 66: [2, 37], 74: [2, 37], 75: [2, 37], 76: [2, 37], 77: [2, 37], 78: [2, 37], 79: [2, 37] }, { 31: [2, 38], 59: [2, 38], 66: [2, 38], 74: [2, 38], 75: [2, 38], 76: [2, 38], 77: [2, 38], 78: [2, 38], 79: [2, 38] }, { 18: 58, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 28: 59, 31: [2, 53], 59: [2, 53], 66: [2, 53], 69: [2, 53], 74: [2, 53], 75: [2, 53], 76: [2, 53], 77: [2, 53], 78: [2, 53], 79: [2, 53] }, { 31: [2, 59], 33: 60, 59: [2, 59], 66: [2, 59], 69: [2, 59], 74: [2, 59], 75: [2, 59], 76: [2, 59], 77: [2, 59], 78: [2, 59], 79: [2, 59] }, { 19: 61, 21: [2, 45], 59: [2, 45], 66: [2, 45], 74: [2, 45], 75: [2, 45], 76: [2, 45], 77: [2, 45], 78: [2, 45], 79: [2, 45] }, { 18: 65, 31: [2, 75], 48: 62, 57: 63, 58: 66, 59: [1, 40], 63: 64, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 66: [1, 70] }, { 21: [2, 39], 31: [2, 39], 52: [2, 39], 59: [2, 39], 62: [2, 39], 66: [2, 39], 69: [2, 39], 74: [2, 39], 75: [2, 39], 76: [2, 39], 77: [2, 39], 78: [2, 39], 79: [2, 39], 81: [1, 45] }, { 18: 65, 51: 71, 52: [2, 79], 57: 72, 58: 66, 59: [1, 40], 63: 73, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 24: 74, 45: [1, 75] }, { 45: [2, 50] }, { 4: 76, 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 37: [2, 43], 42: [2, 43], 45: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 45: [2, 19] }, { 18: 77, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 4: 78, 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 45: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 24: 79, 45: [1, 75] }, { 45: [2, 52] }, { 5: [2, 10], 13: [2, 10], 14: [2, 10], 17: [2, 10], 27: [2, 10], 32: [2, 10], 37: [2, 10], 42: [2, 10], 45: [2, 10], 46: [2, 10], 49: [2, 10], 53: [2, 10] }, { 18: 65, 31: [2, 83], 56: 80, 57: 81, 58: 66, 59: [1, 40], 63: 82, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 59: [2, 85], 60: 83, 62: [2, 85], 66: [2, 85], 74: [2, 85], 75: [2, 85], 76: [2, 85], 77: [2, 85], 78: [2, 85], 79: [2, 85] }, { 18: 65, 29: 84, 31: [2, 55], 57: 85, 58: 66, 59: [1, 40], 63: 86, 64: 67, 65: 68, 66: [1, 69], 69: [2, 55], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 65, 31: [2, 61], 34: 87, 57: 88, 58: 66, 59: [1, 40], 63: 89, 64: 67, 65: 68, 66: [1, 69], 69: [2, 61], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 65, 20: 90, 21: [2, 47], 57: 91, 58: 66, 59: [1, 40], 63: 92, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 31: [1, 93] }, { 31: [2, 74], 59: [2, 74], 66: [2, 74], 74: [2, 74], 75: [2, 74], 76: [2, 74], 77: [2, 74], 78: [2, 74], 79: [2, 74] }, { 31: [2, 76] }, { 21: [2, 24], 31: [2, 24], 52: [2, 24], 59: [2, 24], 62: [2, 24], 66: [2, 24], 69: [2, 24], 74: [2, 24], 75: [2, 24], 76: [2, 24], 77: [2, 24], 78: [2, 24], 79: [2, 24] }, { 21: [2, 25], 31: [2, 25], 52: [2, 25], 59: [2, 25], 62: [2, 25], 66: [2, 25], 69: [2, 25], 74: [2, 25], 75: [2, 25], 76: [2, 25], 77: [2, 25], 78: [2, 25], 79: [2, 25] }, { 21: [2, 27], 31: [2, 27], 52: [2, 27], 62: [2, 27], 65: 94, 66: [1, 95], 69: [2, 27] }, { 21: [2, 89], 31: [2, 89], 52: [2, 89], 62: [2, 89], 66: [2, 89], 69: [2, 89] }, { 21: [2, 42], 31: [2, 42], 52: [2, 42], 59: [2, 42], 62: [2, 42], 66: [2, 42], 67: [1, 96], 69: [2, 42], 74: [2, 42], 75: [2, 42], 76: [2, 42], 77: [2, 42], 78: [2, 42], 79: [2, 42], 81: [2, 42] }, { 21: [2, 41], 31: [2, 41], 52: [2, 41], 59: [2, 41], 62: [2, 41], 66: [2, 41], 69: [2, 41], 74: [2, 41], 75: [2, 41], 76: [2, 41], 77: [2, 41], 78: [2, 41], 79: [2, 41], 81: [2, 41] }, { 52: [1, 97] }, { 52: [2, 78], 59: [2, 78], 66: [2, 78], 74: [2, 78], 75: [2, 78], 76: [2, 78], 77: [2, 78], 78: [2, 78], 79: [2, 78] }, { 52: [2, 80] }, { 5: [2, 12], 13: [2, 12], 14: [2, 12], 17: [2, 12], 27: [2, 12], 32: [2, 12], 37: [2, 12], 42: [2, 12], 45: [2, 12], 46: [2, 12], 49: [2, 12], 53: [2, 12] }, { 18: 98, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 36: 50, 37: [1, 52], 41: 51, 42: [1, 53], 43: 100, 44: 99, 45: [2, 71] }, { 31: [2, 65], 38: 101, 59: [2, 65], 66: [2, 65], 69: [2, 65], 74: [2, 65], 75: [2, 65], 76: [2, 65], 77: [2, 65], 78: [2, 65], 79: [2, 65] }, { 45: [2, 17] }, { 5: [2, 13], 13: [2, 13], 14: [2, 13], 17: [2, 13], 27: [2, 13], 32: [2, 13], 37: [2, 13], 42: [2, 13], 45: [2, 13], 46: [2, 13], 49: [2, 13], 53: [2, 13] }, { 31: [1, 102] }, { 31: [2, 82], 59: [2, 82], 66: [2, 82], 74: [2, 82], 75: [2, 82], 76: [2, 82], 77: [2, 82], 78: [2, 82], 79: [2, 82] }, { 31: [2, 84] }, { 18: 65, 57: 104, 58: 66, 59: [1, 40], 61: 103, 62: [2, 87], 63: 105, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 30: 106, 31: [2, 57], 68: 107, 69: [1, 108] }, { 31: [2, 54], 59: [2, 54], 66: [2, 54], 69: [2, 54], 74: [2, 54], 75: [2, 54], 76: [2, 54], 77: [2, 54], 78: [2, 54], 79: [2, 54] }, { 31: [2, 56], 69: [2, 56] }, { 31: [2, 63], 35: 109, 68: 110, 69: [1, 108] }, { 31: [2, 60], 59: [2, 60], 66: [2, 60], 69: [2, 60], 74: [2, 60], 75: [2, 60], 76: [2, 60], 77: [2, 60], 78: [2, 60], 79: [2, 60] }, { 31: [2, 62], 69: [2, 62] }, { 21: [1, 111] }, { 21: [2, 46], 59: [2, 46], 66: [2, 46], 74: [2, 46], 75: [2, 46], 76: [2, 46], 77: [2, 46], 78: [2, 46], 79: [2, 46] }, { 21: [2, 48] }, { 5: [2, 21], 13: [2, 21], 14: [2, 21], 17: [2, 21], 27: [2, 21], 32: [2, 21], 37: [2, 21], 42: [2, 21], 45: [2, 21], 46: [2, 21], 49: [2, 21], 53: [2, 21] }, { 21: [2, 90], 31: [2, 90], 52: [2, 90], 62: [2, 90], 66: [2, 90], 69: [2, 90] }, { 67: [1, 96] }, { 18: 65, 57: 112, 58: 66, 59: [1, 40], 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 5: [2, 22], 13: [2, 22], 14: [2, 22], 17: [2, 22], 27: [2, 22], 32: [2, 22], 37: [2, 22], 42: [2, 22], 45: [2, 22], 46: [2, 22], 49: [2, 22], 53: [2, 22] }, { 31: [1, 113] }, { 45: [2, 18] }, { 45: [2, 72] }, { 18: 65, 31: [2, 67], 39: 114, 57: 115, 58: 66, 59: [1, 40], 63: 116, 64: 67, 65: 68, 66: [1, 69], 69: [2, 67], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 5: [2, 23], 13: [2, 23], 14: [2, 23], 17: [2, 23], 27: [2, 23], 32: [2, 23], 37: [2, 23], 42: [2, 23], 45: [2, 23], 46: [2, 23], 49: [2, 23], 53: [2, 23] }, { 62: [1, 117] }, { 59: [2, 86], 62: [2, 86], 66: [2, 86], 74: [2, 86], 75: [2, 86], 76: [2, 86], 77: [2, 86], 78: [2, 86], 79: [2, 86] }, { 62: [2, 88] }, { 31: [1, 118] }, { 31: [2, 58] }, { 66: [1, 120], 70: 119 }, { 31: [1, 121] }, { 31: [2, 64] }, { 14: [2, 11] }, { 21: [2, 28], 31: [2, 28], 52: [2, 28], 62: [2, 28], 66: [2, 28], 69: [2, 28] }, { 5: [2, 20], 13: [2, 20], 14: [2, 20], 17: [2, 20], 27: [2, 20], 32: [2, 20], 37: [2, 20], 42: [2, 20], 45: [2, 20], 46: [2, 20], 49: [2, 20], 53: [2, 20] }, { 31: [2, 69], 40: 122, 68: 123, 69: [1, 108] }, { 31: [2, 66], 59: [2, 66], 66: [2, 66], 69: [2, 66], 74: [2, 66], 75: [2, 66], 76: [2, 66], 77: [2, 66], 78: [2, 66], 79: [2, 66] }, { 31: [2, 68], 69: [2, 68] }, { 21: [2, 26], 31: [2, 26], 52: [2, 26], 59: [2, 26], 62: [2, 26], 66: [2, 26], 69: [2, 26], 74: [2, 26], 75: [2, 26], 76: [2, 26], 77: [2, 26], 78: [2, 26], 79: [2, 26] }, { 13: [2, 14], 14: [2, 14], 17: [2, 14], 27: [2, 14], 32: [2, 14], 37: [2, 14], 42: [2, 14], 45: [2, 14], 46: [2, 14], 49: [2, 14], 53: [2, 14] }, { 66: [1, 125], 71: [1, 124] }, { 66: [2, 91], 71: [2, 91] }, { 13: [2, 15], 14: [2, 15], 17: [2, 15], 27: [2, 15], 32: [2, 15], 42: [2, 15], 45: [2, 15], 46: [2, 15], 49: [2, 15], 53: [2, 15] }, { 31: [1, 126] }, { 31: [2, 70] }, { 31: [2, 29] }, { 66: [2, 92], 71: [2, 92] }, { 13: [2, 16], 14: [2, 16], 17: [2, 16], 27: [2, 16], 32: [2, 16], 37: [2, 16], 42: [2, 16], 45: [2, 16], 46: [2, 16], 49: [2, 16], 53: [2, 16] }],\n\
\t        defaultActions: { 4: [2, 1], 49: [2, 50], 51: [2, 19], 55: [2, 52], 64: [2, 76], 73: [2, 80], 78: [2, 17], 82: [2, 84], 92: [2, 48], 99: [2, 18], 100: [2, 72], 105: [2, 88], 107: [2, 58], 110: [2, 64], 111: [2, 11], 123: [2, 70], 124: [2, 29] },\n\
\t        parseError: function parseError(str, hash) {\n\
\t            throw new Error(str);\n\
\t        },\n\
\t        parse: function parse(input) {\n\
\t            var self = this,\n\
\t                stack = [0],\n\
\t                vstack = [null],\n\
\t                lstack = [],\n\
\t                table = this.table,\n\
\t                yytext = \"\",\n\
\t                yylineno = 0,\n\
\t                yyleng = 0,\n\
\t                recovering = 0,\n\
\t                TERROR = 2,\n\
\t                EOF = 1;\n\
\t            this.lexer.setInput(input);\n\
\t            this.lexer.yy = this.yy;\n\
\t            this.yy.lexer = this.lexer;\n\
\t            this.yy.parser = this;\n\
\t            if (typeof this.lexer.yylloc == \"undefined\") this.lexer.yylloc = {};\n\
\t            var yyloc = this.lexer.yylloc;\n\
\t            lstack.push(yyloc);\n\
\t            var ranges = this.lexer.options && this.lexer.options.ranges;\n\
\t            if (typeof this.yy.parseError === \"function\") this.parseError = this.yy.parseError;\n\
\t            function popStack(n) {\n\
\t                stack.length = stack.length - 2 * n;\n\
\t                vstack.length = vstack.length - n;\n\
\t                lstack.length = lstack.length - n;\n\
\t            }\n\
\t            function lex() {\n\
\t                var token;\n\
\t                token = self.lexer.lex() || 1;\n\
\t                if (typeof token !== \"number\") {\n\
\t                    token = self.symbols_[token] || token;\n\
\t                }\n\
\t                return token;\n\
\t            }\n\
\t            var symbol,\n\
\t                preErrorSymbol,\n\
\t                state,\n\
\t                action,\n\
\t                a,\n\
\t                r,\n\
\t                yyval = {},\n\
\t                p,\n\
\t                len,\n\
\t                newState,\n\
\t                expected;\n\
\t            while (true) {\n\
\t                state = stack[stack.length - 1];\n\
\t                if (this.defaultActions[state]) {\n\
\t                    action = this.defaultActions[state];\n\
\t                } else {\n\
\t                    if (symbol === null || typeof symbol == \"undefined\") {\n\
\t                        symbol = lex();\n\
\t                    }\n\
\t                    action = table[state] && table[state][symbol];\n\
\t                }\n\
\t                if (typeof action === \"undefined\" || !action.length || !action[0]) {\n\
\t                    var errStr = \"\";\n\
\t                    if (!recovering) {\n\
\t                        expected = [];\n\
\t                        for (p in table[state]) if (this.terminals_[p] && p > 2) {\n\
\t                            expected.push(\"'\" + this.terminals_[p] + \"'\");\n\
\t                        }\n\
\t                        if (this.lexer.showPosition) {\n\
\t                            errStr = \"Parse error on line \" + (yylineno + 1) + \":\\n\
\" + this.lexer.showPosition() + \"\\n\
Expecting \" + expected.join(\", \") + \", got '\" + (this.terminals_[symbol] || symbol) + \"'\";\n\
\t                        } else {\n\
\t                            errStr = \"Parse error on line \" + (yylineno + 1) + \": Unexpected \" + (symbol == 1 ? \"end of input\" : \"'\" + (this.terminals_[symbol] || symbol) + \"'\");\n\
\t                        }\n\
\t                        this.parseError(errStr, { text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected });\n\
\t                    }\n\
\t                }\n\
\t                if (action[0] instanceof Array && action.length > 1) {\n\
\t                    throw new Error(\"Parse Error: multiple actions possible at state: \" + state + \", token: \" + symbol);\n\
\t                }\n\
\t                switch (action[0]) {\n\
\t                    case 1:\n\
\t                        stack.push(symbol);\n\
\t                        vstack.push(this.lexer.yytext);\n\
\t                        lstack.push(this.lexer.yylloc);\n\
\t                        stack.push(action[1]);\n\
\t                        symbol = null;\n\
\t                        if (!preErrorSymbol) {\n\
\t                            yyleng = this.lexer.yyleng;\n\
\t                            yytext = this.lexer.yytext;\n\
\t                            yylineno = this.lexer.yylineno;\n\
\t                            yyloc = this.lexer.yylloc;\n\
\t                            if (recovering > 0) recovering--;\n\
\t                        } else {\n\
\t                            symbol = preErrorSymbol;\n\
\t                            preErrorSymbol = null;\n\
\t                        }\n\
\t                        break;\n\
\t                    case 2:\n\
\t                        len = this.productions_[action[1]][1];\n\
\t                        yyval.$ = vstack[vstack.length - len];\n\
\t                        yyval._$ = { first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column };\n\
\t                        if (ranges) {\n\
\t                            yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];\n\
\t                        }\n\
\t                        r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);\n\
\t                        if (typeof r !== \"undefined\") {\n\
\t                            return r;\n\
\t                        }\n\
\t                        if (len) {\n\
\t                            stack = stack.slice(0, -1 * len * 2);\n\
\t                            vstack = vstack.slice(0, -1 * len);\n\
\t                            lstack = lstack.slice(0, -1 * len);\n\
\t                        }\n\
\t                        stack.push(this.productions_[action[1]][0]);\n\
\t                        vstack.push(yyval.$);\n\
\t                        lstack.push(yyval._$);\n\
\t                        newState = table[stack[stack.length - 2]][stack[stack.length - 1]];\n\
\t                        stack.push(newState);\n\
\t                        break;\n\
\t                    case 3:\n\
\t                        return true;\n\
\t                }\n\
\t            }\n\
\t            return true;\n\
\t        }\n\
\t    };\n\
\t    /* Jison generated lexer */\n\
\t    var lexer = (function () {\n\
\t        var lexer = { EOF: 1,\n\
\t            parseError: function parseError(str, hash) {\n\
\t                if (this.yy.parser) {\n\
\t                    this.yy.parser.parseError(str, hash);\n\
\t                } else {\n\
\t                    throw new Error(str);\n\
\t                }\n\
\t            },\n\
\t            setInput: function setInput(input) {\n\
\t                this._input = input;\n\
\t                this._more = this._less = this.done = false;\n\
\t                this.yylineno = this.yyleng = 0;\n\
\t                this.yytext = this.matched = this.match = \"\";\n\
\t                this.conditionStack = [\"INITIAL\"];\n\
\t                this.yylloc = { first_line: 1, first_column: 0, last_line: 1, last_column: 0 };\n\
\t                if (this.options.ranges) this.yylloc.range = [0, 0];\n\
\t                this.offset = 0;\n\
\t                return this;\n\
\t            },\n\
\t            input: function input() {\n\
\t                var ch = this._input[0];\n\
\t                this.yytext += ch;\n\
\t                this.yyleng++;\n\
\t                this.offset++;\n\
\t                this.match += ch;\n\
\t                this.matched += ch;\n\
\t                var lines = ch.match(/(?:\\r\\n\
?|\\n\
).*/g);\n\
\t                if (lines) {\n\
\t                    this.yylineno++;\n\
\t                    this.yylloc.last_line++;\n\
\t                } else {\n\
\t                    this.yylloc.last_column++;\n\
\t                }\n\
\t                if (this.options.ranges) this.yylloc.range[1]++;\n\
\n\
\t                this._input = this._input.slice(1);\n\
\t                return ch;\n\
\t            },\n\
\t            unput: function unput(ch) {\n\
\t                var len = ch.length;\n\
\t                var lines = ch.split(/(?:\\r\\n\
?|\\n\
)/g);\n\
\n\
\t                this._input = ch + this._input;\n\
\t                this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);\n\
\t                //this.yyleng -= len;\n\
\t                this.offset -= len;\n\
\t                var oldLines = this.match.split(/(?:\\r\\n\
?|\\n\
)/g);\n\
\t                this.match = this.match.substr(0, this.match.length - 1);\n\
\t                this.matched = this.matched.substr(0, this.matched.length - 1);\n\
\n\
\t                if (lines.length - 1) this.yylineno -= lines.length - 1;\n\
\t                var r = this.yylloc.range;\n\
\n\
\t                this.yylloc = { first_line: this.yylloc.first_line,\n\
\t                    last_line: this.yylineno + 1,\n\
\t                    first_column: this.yylloc.first_column,\n\
\t                    last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len\n\
\t                };\n\
\n\
\t                if (this.options.ranges) {\n\
\t                    this.yylloc.range = [r[0], r[0] + this.yyleng - len];\n\
\t                }\n\
\t                return this;\n\
\t            },\n\
\t            more: function more() {\n\
\t                this._more = true;\n\
\t                return this;\n\
\t            },\n\
\t            less: function less(n) {\n\
\t                this.unput(this.match.slice(n));\n\
\t            },\n\
\t            pastInput: function pastInput() {\n\
\t                var past = this.matched.substr(0, this.matched.length - this.match.length);\n\
\t                return (past.length > 20 ? \"...\" : \"\") + past.substr(-20).replace(/\\n\
/g, \"\");\n\
\t            },\n\
\t            upcomingInput: function upcomingInput() {\n\
\t                var next = this.match;\n\
\t                if (next.length < 20) {\n\
\t                    next += this._input.substr(0, 20 - next.length);\n\
\t                }\n\
\t                return (next.substr(0, 20) + (next.length > 20 ? \"...\" : \"\")).replace(/\\n\
/g, \"\");\n\
\t            },\n\
\t            showPosition: function showPosition() {\n\
\t                var pre = this.pastInput();\n\
\t                var c = new Array(pre.length + 1).join(\"-\");\n\
\t                return pre + this.upcomingInput() + \"\\n\
\" + c + \"^\";\n\
\t            },\n\
\t            next: function next() {\n\
\t                if (this.done) {\n\
\t                    return this.EOF;\n\
\t                }\n\
\t                if (!this._input) this.done = true;\n\
\n\
\t                var token, match, tempMatch, index, col, lines;\n\
\t                if (!this._more) {\n\
\t                    this.yytext = \"\";\n\
\t                    this.match = \"\";\n\
\t                }\n\
\t                var rules = this._currentRules();\n\
\t                for (var i = 0; i < rules.length; i++) {\n\
\t                    tempMatch = this._input.match(this.rules[rules[i]]);\n\
\t                    if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {\n\
\t                        match = tempMatch;\n\
\t                        index = i;\n\
\t                        if (!this.options.flex) break;\n\
\t                    }\n\
\t                }\n\
\t                if (match) {\n\
\t                    lines = match[0].match(/(?:\\r\\n\
?|\\n\
).*/g);\n\
\t                    if (lines) this.yylineno += lines.length;\n\
\t                    this.yylloc = { first_line: this.yylloc.last_line,\n\
\t                        last_line: this.yylineno + 1,\n\
\t                        first_column: this.yylloc.last_column,\n\
\t                        last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\\r?\\n\
?/)[0].length : this.yylloc.last_column + match[0].length };\n\
\t                    this.yytext += match[0];\n\
\t                    this.match += match[0];\n\
\t                    this.matches = match;\n\
\t                    this.yyleng = this.yytext.length;\n\
\t                    if (this.options.ranges) {\n\
\t                        this.yylloc.range = [this.offset, this.offset += this.yyleng];\n\
\t                    }\n\
\t                    this._more = false;\n\
\t                    this._input = this._input.slice(match[0].length);\n\
\t                    this.matched += match[0];\n\
\t                    token = this.performAction.call(this, this.yy, this, rules[index], this.conditionStack[this.conditionStack.length - 1]);\n\
\t                    if (this.done && this._input) this.done = false;\n\
\t                    if (token) {\n\
\t                        return token;\n\
\t                    } else {\n\
\t                        return;\n\
\t                    }\n\
\t                }\n\
\t                if (this._input === \"\") {\n\
\t                    return this.EOF;\n\
\t                } else {\n\
\t                    return this.parseError(\"Lexical error on line \" + (this.yylineno + 1) + \". Unrecognized text.\\n\
\" + this.showPosition(), { text: \"\", token: null, line: this.yylineno });\n\
\t                }\n\
\t            },\n\
\t            lex: function lex() {\n\
\t                var r = this.next();\n\
\t                if (typeof r !== \"undefined\") {\n\
\t                    return r;\n\
\t                } else {\n\
\t                    return this.lex();\n\
\t                }\n\
\t            },\n\
\t            begin: function begin(condition) {\n\
\t                this.conditionStack.push(condition);\n\
\t            },\n\
\t            popState: function popState() {\n\
\t                return this.conditionStack.pop();\n\
\t            },\n\
\t            _currentRules: function _currentRules() {\n\
\t                return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;\n\
\t            },\n\
\t            topState: function topState() {\n\
\t                return this.conditionStack[this.conditionStack.length - 2];\n\
\t            },\n\
\t            pushState: function begin(condition) {\n\
\t                this.begin(condition);\n\
\t            } };\n\
\t        lexer.options = {};\n\
\t        lexer.performAction = function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {\n\
\n\
\t            function strip(start, end) {\n\
\t                return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng - end);\n\
\t            }\n\
\n\
\t            var YYSTATE = YY_START;\n\
\t            switch ($avoiding_name_collisions) {\n\
\t                case 0:\n\
\t                    if (yy_.yytext.slice(-2) === \"\\\\\\\\\") {\n\
\t                        strip(0, 1);\n\
\t                        this.begin(\"mu\");\n\
\t                    } else if (yy_.yytext.slice(-1) === \"\\\\\") {\n\
\t                        strip(0, 1);\n\
\t                        this.begin(\"emu\");\n\
\t                    } else {\n\
\t                        this.begin(\"mu\");\n\
\t                    }\n\
\t                    if (yy_.yytext) {\n\
\t                        return 14;\n\
\t                    }break;\n\
\t                case 1:\n\
\t                    return 14;\n\
\t                    break;\n\
\t                case 2:\n\
\t                    this.popState();\n\
\t                    return 14;\n\
\n\
\t                    break;\n\
\t                case 3:\n\
\t                    yy_.yytext = yy_.yytext.substr(5, yy_.yyleng - 9);\n\
\t                    this.popState();\n\
\t                    return 16;\n\
\n\
\t                    break;\n\
\t                case 4:\n\
\t                    return 14;\n\
\t                    break;\n\
\t                case 5:\n\
\t                    this.popState();\n\
\t                    return 13;\n\
\n\
\t                    break;\n\
\t                case 6:\n\
\t                    return 59;\n\
\t                    break;\n\
\t                case 7:\n\
\t                    return 62;\n\
\t                    break;\n\
\t                case 8:\n\
\t                    return 17;\n\
\t                    break;\n\
\t                case 9:\n\
\t                    this.popState();\n\
\t                    this.begin(\"raw\");\n\
\t                    return 21;\n\
\n\
\t                    break;\n\
\t                case 10:\n\
\t                    return 53;\n\
\t                    break;\n\
\t                case 11:\n\
\t                    return 27;\n\
\t                    break;\n\
\t                case 12:\n\
\t                    return 45;\n\
\t                    break;\n\
\t                case 13:\n\
\t                    this.popState();return 42;\n\
\t                    break;\n\
\t                case 14:\n\
\t                    this.popState();return 42;\n\
\t                    break;\n\
\t                case 15:\n\
\t                    return 32;\n\
\t                    break;\n\
\t                case 16:\n\
\t                    return 37;\n\
\t                    break;\n\
\t                case 17:\n\
\t                    return 49;\n\
\t                    break;\n\
\t                case 18:\n\
\t                    return 46;\n\
\t                    break;\n\
\t                case 19:\n\
\t                    this.unput(yy_.yytext);\n\
\t                    this.popState();\n\
\t                    this.begin(\"com\");\n\
\n\
\t                    break;\n\
\t                case 20:\n\
\t                    this.popState();\n\
\t                    return 13;\n\
\n\
\t                    break;\n\
\t                case 21:\n\
\t                    return 46;\n\
\t                    break;\n\
\t                case 22:\n\
\t                    return 67;\n\
\t                    break;\n\
\t                case 23:\n\
\t                    return 66;\n\
\t                    break;\n\
\t                case 24:\n\
\t                    return 66;\n\
\t                    break;\n\
\t                case 25:\n\
\t                    return 81;\n\
\t                    break;\n\
\t                case 26:\n\
\t                    // ignore whitespace\n\
\t                    break;\n\
\t                case 27:\n\
\t                    this.popState();return 52;\n\
\t                    break;\n\
\t                case 28:\n\
\t                    this.popState();return 31;\n\
\t                    break;\n\
\t                case 29:\n\
\t                    yy_.yytext = strip(1, 2).replace(/\\\\\"/g, \"\\\"\");return 74;\n\
\t                    break;\n\
\t                case 30:\n\
\t                    yy_.yytext = strip(1, 2).replace(/\\\\'/g, \"'\");return 74;\n\
\t                    break;\n\
\t                case 31:\n\
\t                    return 79;\n\
\t                    break;\n\
\t                case 32:\n\
\t                    return 76;\n\
\t                    break;\n\
\t                case 33:\n\
\t                    return 76;\n\
\t                    break;\n\
\t                case 34:\n\
\t                    return 77;\n\
\t                    break;\n\
\t                case 35:\n\
\t                    return 78;\n\
\t                    break;\n\
\t                case 36:\n\
\t                    return 75;\n\
\t                    break;\n\
\t                case 37:\n\
\t                    return 69;\n\
\t                    break;\n\
\t                case 38:\n\
\t                    return 71;\n\
\t                    break;\n\
\t                case 39:\n\
\t                    return 66;\n\
\t                    break;\n\
\t                case 40:\n\
\t                    return 66;\n\
\t                    break;\n\
\t                case 41:\n\
\t                    return \"INVALID\";\n\
\t                    break;\n\
\t                case 42:\n\
\t                    return 5;\n\
\t                    break;\n\
\t            }\n\
\t        };\n\
\t        lexer.rules = [/^(?:[^\\x00]*?(?=(\\{\\{)))/, /^(?:[^\\x00]+)/, /^(?:[^\\x00]{2,}?(?=(\\{\\{|\\\\\\{\\{|\\\\\\\\\\{\\{|$)))/, /^(?:\\{\\{\\{\\{\\/[^\\s!\"#%-,\\.\\/;->@\\[-\\^`\\{-~]+(?=[=}\\s\\/.])\\}\\}\\}\\})/, /^(?:[^\\x00]*?(?=(\\{\\{\\{\\{\\/)))/, /^(?:[\\s\\S]*?--(~)?\\}\\})/, /^(?:\\()/, /^(?:\\))/, /^(?:\\{\\{\\{\\{)/, /^(?:\\}\\}\\}\\})/, /^(?:\\{\\{(~)?>)/, /^(?:\\{\\{(~)?#)/, /^(?:\\{\\{(~)?\\/)/, /^(?:\\{\\{(~)?\\^\\s*(~)?\\}\\})/, /^(?:\\{\\{(~)?\\s*else\\s*(~)?\\}\\})/, /^(?:\\{\\{(~)?\\^)/, /^(?:\\{\\{(~)?\\s*else\\b)/, /^(?:\\{\\{(~)?\\{)/, /^(?:\\{\\{(~)?&)/, /^(?:\\{\\{(~)?!--)/, /^(?:\\{\\{(~)?![\\s\\S]*?\\}\\})/, /^(?:\\{\\{(~)?)/, /^(?:=)/, /^(?:\\.\\.)/, /^(?:\\.(?=([=~}\\s\\/.)|])))/, /^(?:[\\/.])/, /^(?:\\s+)/, /^(?:\\}(~)?\\}\\})/, /^(?:(~)?\\}\\})/, /^(?:\"(\\\\[\"]|[^\"])*\")/, /^(?:'(\\\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\\s)])))/, /^(?:false(?=([~}\\s)])))/, /^(?:undefined(?=([~}\\s)])))/, /^(?:null(?=([~}\\s)])))/, /^(?:-?[0-9]+(?:\\.[0-9]+)?(?=([~}\\s)])))/, /^(?:as\\s+\\|)/, /^(?:\\|)/, /^(?:([^\\s!\"#%-,\\.\\/;->@\\[-\\^`\\{-~]+(?=([=~}\\s\\/.)|]))))/, /^(?:\\[[^\\]]*\\])/, /^(?:.)/, /^(?:$)/];\n\
\t        lexer.conditions = { mu: { rules: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42], inclusive: false }, emu: { rules: [2], inclusive: false }, com: { rules: [5], inclusive: false }, raw: { rules: [3, 4], inclusive: false }, INITIAL: { rules: [0, 1, 42], inclusive: true } };\n\
\t        return lexer;\n\
\t    })();\n\
\t    parser.lexer = lexer;\n\
\t    function Parser() {\n\
\t        this.yy = {};\n\
\t    }Parser.prototype = parser;parser.Parser = Parser;\n\
\t    return new Parser();\n\
\t})();exports[\"default\"] = handlebars;\n\
\tmodule.exports = exports[\"default\"];\n\
\n\
/***/ },\n\
/* 15 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t'use strict';\n\
\n\
\tvar _interopRequireWildcard = __webpack_require__(8)['default'];\n\
\n\
\texports.__esModule = true;\n\
\n\
\tvar _Visitor = __webpack_require__(6);\n\
\n\
\tvar _Visitor2 = _interopRequireWildcard(_Visitor);\n\
\n\
\tfunction WhitespaceControl() {}\n\
\tWhitespaceControl.prototype = new _Visitor2['default']();\n\
\n\
\tWhitespaceControl.prototype.Program = function (program) {\n\
\t  var isRoot = !this.isRootSeen;\n\
\t  this.isRootSeen = true;\n\
\n\
\t  var body = program.body;\n\
\t  for (var i = 0, l = body.length; i < l; i++) {\n\
\t    var current = body[i],\n\
\t        strip = this.accept(current);\n\
\n\
\t    if (!strip) {\n\
\t      continue;\n\
\t    }\n\
\n\
\t    var _isPrevWhitespace = isPrevWhitespace(body, i, isRoot),\n\
\t        _isNextWhitespace = isNextWhitespace(body, i, isRoot),\n\
\t        openStandalone = strip.openStandalone && _isPrevWhitespace,\n\
\t        closeStandalone = strip.closeStandalone && _isNextWhitespace,\n\
\t        inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;\n\
\n\
\t    if (strip.close) {\n\
\t      omitRight(body, i, true);\n\
\t    }\n\
\t    if (strip.open) {\n\
\t      omitLeft(body, i, true);\n\
\t    }\n\
\n\
\t    if (inlineStandalone) {\n\
\t      omitRight(body, i);\n\
\n\
\t      if (omitLeft(body, i)) {\n\
\t        // If we are on a standalone node, save the indent info for partials\n\
\t        if (current.type === 'PartialStatement') {\n\
\t          // Pull out the whitespace from the final line\n\
\t          current.indent = /([ \\t]+$)/.exec(body[i - 1].original)[1];\n\
\t        }\n\
\t      }\n\
\t    }\n\
\t    if (openStandalone) {\n\
\t      omitRight((current.program || current.inverse).body);\n\
\n\
\t      // Strip out the previous content node if it's whitespace only\n\
\t      omitLeft(body, i);\n\
\t    }\n\
\t    if (closeStandalone) {\n\
\t      // Always strip the next node\n\
\t      omitRight(body, i);\n\
\n\
\t      omitLeft((current.inverse || current.program).body);\n\
\t    }\n\
\t  }\n\
\n\
\t  return program;\n\
\t};\n\
\tWhitespaceControl.prototype.BlockStatement = function (block) {\n\
\t  this.accept(block.program);\n\
\t  this.accept(block.inverse);\n\
\n\
\t  // Find the inverse program that is involed with whitespace stripping.\n\
\t  var program = block.program || block.inverse,\n\
\t      inverse = block.program && block.inverse,\n\
\t      firstInverse = inverse,\n\
\t      lastInverse = inverse;\n\
\n\
\t  if (inverse && inverse.chained) {\n\
\t    firstInverse = inverse.body[0].program;\n\
\n\
\t    // Walk the inverse chain to find the last inverse that is actually in the chain.\n\
\t    while (lastInverse.chained) {\n\
\t      lastInverse = lastInverse.body[lastInverse.body.length - 1].program;\n\
\t    }\n\
\t  }\n\
\n\
\t  var strip = {\n\
\t    open: block.openStrip.open,\n\
\t    close: block.closeStrip.close,\n\
\n\
\t    // Determine the standalone candiacy. Basically flag our content as being possibly standalone\n\
\t    // so our parent can determine if we actually are standalone\n\
\t    openStandalone: isNextWhitespace(program.body),\n\
\t    closeStandalone: isPrevWhitespace((firstInverse || program).body)\n\
\t  };\n\
\n\
\t  if (block.openStrip.close) {\n\
\t    omitRight(program.body, null, true);\n\
\t  }\n\
\n\
\t  if (inverse) {\n\
\t    var inverseStrip = block.inverseStrip;\n\
\n\
\t    if (inverseStrip.open) {\n\
\t      omitLeft(program.body, null, true);\n\
\t    }\n\
\n\
\t    if (inverseStrip.close) {\n\
\t      omitRight(firstInverse.body, null, true);\n\
\t    }\n\
\t    if (block.closeStrip.open) {\n\
\t      omitLeft(lastInverse.body, null, true);\n\
\t    }\n\
\n\
\t    // Find standalone else statments\n\
\t    if (isPrevWhitespace(program.body) && isNextWhitespace(firstInverse.body)) {\n\
\t      omitLeft(program.body);\n\
\t      omitRight(firstInverse.body);\n\
\t    }\n\
\t  } else if (block.closeStrip.open) {\n\
\t    omitLeft(program.body, null, true);\n\
\t  }\n\
\n\
\t  return strip;\n\
\t};\n\
\n\
\tWhitespaceControl.prototype.MustacheStatement = function (mustache) {\n\
\t  return mustache.strip;\n\
\t};\n\
\n\
\tWhitespaceControl.prototype.PartialStatement = WhitespaceControl.prototype.CommentStatement = function (node) {\n\
\t  /* istanbul ignore next */\n\
\t  var strip = node.strip || {};\n\
\t  return {\n\
\t    inlineStandalone: true,\n\
\t    open: strip.open,\n\
\t    close: strip.close\n\
\t  };\n\
\t};\n\
\n\
\tfunction isPrevWhitespace(body, i, isRoot) {\n\
\t  if (i === undefined) {\n\
\t    i = body.length;\n\
\t  }\n\
\n\
\t  // Nodes that end with newlines are considered whitespace (but are special\n\
\t  // cased for strip operations)\n\
\t  var prev = body[i - 1],\n\
\t      sibling = body[i - 2];\n\
\t  if (!prev) {\n\
\t    return isRoot;\n\
\t  }\n\
\n\
\t  if (prev.type === 'ContentStatement') {\n\
\t    return (sibling || !isRoot ? /\\r?\\n\
\\s*?$/ : /(^|\\r?\\n\
)\\s*?$/).test(prev.original);\n\
\t  }\n\
\t}\n\
\tfunction isNextWhitespace(body, i, isRoot) {\n\
\t  if (i === undefined) {\n\
\t    i = -1;\n\
\t  }\n\
\n\
\t  var next = body[i + 1],\n\
\t      sibling = body[i + 2];\n\
\t  if (!next) {\n\
\t    return isRoot;\n\
\t  }\n\
\n\
\t  if (next.type === 'ContentStatement') {\n\
\t    return (sibling || !isRoot ? /^\\s*?\\r?\\n\
/ : /^\\s*?(\\r?\\n\
|$)/).test(next.original);\n\
\t  }\n\
\t}\n\
\n\
\t// Marks the node to the right of the position as omitted.\n\
\t// I.e. {{foo}}' ' will mark the ' ' node as omitted.\n\
\t//\n\
\t// If i is undefined, then the first child will be marked as such.\n\
\t//\n\
\t// If mulitple is truthy then all whitespace will be stripped out until non-whitespace\n\
\t// content is met.\n\
\tfunction omitRight(body, i, multiple) {\n\
\t  var current = body[i == null ? 0 : i + 1];\n\
\t  if (!current || current.type !== 'ContentStatement' || !multiple && current.rightStripped) {\n\
\t    return;\n\
\t  }\n\
\n\
\t  var original = current.value;\n\
\t  current.value = current.value.replace(multiple ? /^\\s+/ : /^[ \\t]*\\r?\\n\
?/, '');\n\
\t  current.rightStripped = current.value !== original;\n\
\t}\n\
\n\
\t// Marks the node to the left of the position as omitted.\n\
\t// I.e. ' '{{foo}} will mark the ' ' node as omitted.\n\
\t//\n\
\t// If i is undefined then the last child will be marked as such.\n\
\t//\n\
\t// If mulitple is truthy then all whitespace will be stripped out until non-whitespace\n\
\t// content is met.\n\
\tfunction omitLeft(body, i, multiple) {\n\
\t  var current = body[i == null ? body.length - 1 : i - 1];\n\
\t  if (!current || current.type !== 'ContentStatement' || !multiple && current.leftStripped) {\n\
\t    return;\n\
\t  }\n\
\n\
\t  // We omit the last node if it's whitespace only and not preceeded by a non-content node.\n\
\t  var original = current.value;\n\
\t  current.value = current.value.replace(multiple ? /\\s+$/ : /[ \\t]+$/, '');\n\
\t  current.leftStripped = current.value !== original;\n\
\t  return current.leftStripped;\n\
\t}\n\
\n\
\texports['default'] = WhitespaceControl;\n\
\tmodule.exports = exports['default'];\n\
\n\
/***/ },\n\
/* 16 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t'use strict';\n\
\n\
\tvar _interopRequireWildcard = __webpack_require__(8)['default'];\n\
\n\
\texports.__esModule = true;\n\
\texports.SourceLocation = SourceLocation;\n\
\texports.id = id;\n\
\texports.stripFlags = stripFlags;\n\
\texports.stripComment = stripComment;\n\
\texports.preparePath = preparePath;\n\
\texports.prepareMustache = prepareMustache;\n\
\texports.prepareRawBlock = prepareRawBlock;\n\
\texports.prepareBlock = prepareBlock;\n\
\n\
\tvar _Exception = __webpack_require__(11);\n\
\n\
\tvar _Exception2 = _interopRequireWildcard(_Exception);\n\
\n\
\tfunction SourceLocation(source, locInfo) {\n\
\t  this.source = source;\n\
\t  this.start = {\n\
\t    line: locInfo.first_line,\n\
\t    column: locInfo.first_column\n\
\t  };\n\
\t  this.end = {\n\
\t    line: locInfo.last_line,\n\
\t    column: locInfo.last_column\n\
\t  };\n\
\t}\n\
\n\
\tfunction id(token) {\n\
\t  if (/^\\[.*\\]$/.test(token)) {\n\
\t    return token.substr(1, token.length - 2);\n\
\t  } else {\n\
\t    return token;\n\
\t  }\n\
\t}\n\
\n\
\tfunction stripFlags(open, close) {\n\
\t  return {\n\
\t    open: open.charAt(2) === '~',\n\
\t    close: close.charAt(close.length - 3) === '~'\n\
\t  };\n\
\t}\n\
\n\
\tfunction stripComment(comment) {\n\
\t  return comment.replace(/^\\{\\{~?\\!-?-?/, '').replace(/-?-?~?\\}\\}$/, '');\n\
\t}\n\
\n\
\tfunction preparePath(data, parts, locInfo) {\n\
\t  locInfo = this.locInfo(locInfo);\n\
\n\
\t  var original = data ? '@' : '',\n\
\t      dig = [],\n\
\t      depth = 0,\n\
\t      depthString = '';\n\
\n\
\t  for (var i = 0, l = parts.length; i < l; i++) {\n\
\t    var part = parts[i].part,\n\
\n\
\t    // If we have [] syntax then we do not treat path references as operators,\n\
\t    // i.e. foo.[this] resolves to approximately context.foo['this']\n\
\t    isLiteral = parts[i].original !== part;\n\
\t    original += (parts[i].separator || '') + part;\n\
\n\
\t    if (!isLiteral && (part === '..' || part === '.' || part === 'this')) {\n\
\t      if (dig.length > 0) {\n\
\t        throw new _Exception2['default']('Invalid path: ' + original, { loc: locInfo });\n\
\t      } else if (part === '..') {\n\
\t        depth++;\n\
\t        depthString += '../';\n\
\t      }\n\
\t    } else {\n\
\t      dig.push(part);\n\
\t    }\n\
\t  }\n\
\n\
\t  return new this.PathExpression(data, depth, dig, original, locInfo);\n\
\t}\n\
\n\
\tfunction prepareMustache(path, params, hash, open, strip, locInfo) {\n\
\t  // Must use charAt to support IE pre-10\n\
\t  var escapeFlag = open.charAt(3) || open.charAt(2),\n\
\t      escaped = escapeFlag !== '{' && escapeFlag !== '&';\n\
\n\
\t  return new this.MustacheStatement(path, params, hash, escaped, strip, this.locInfo(locInfo));\n\
\t}\n\
\n\
\tfunction prepareRawBlock(openRawBlock, content, close, locInfo) {\n\
\t  if (openRawBlock.path.original !== close) {\n\
\t    var errorNode = { loc: openRawBlock.path.loc };\n\
\n\
\t    throw new _Exception2['default'](openRawBlock.path.original + ' doesn\\'t match ' + close, errorNode);\n\
\t  }\n\
\n\
\t  locInfo = this.locInfo(locInfo);\n\
\t  var program = new this.Program([content], null, {}, locInfo);\n\
\n\
\t  return new this.BlockStatement(openRawBlock.path, openRawBlock.params, openRawBlock.hash, program, undefined, {}, {}, {}, locInfo);\n\
\t}\n\
\n\
\tfunction prepareBlock(openBlock, program, inverseAndProgram, close, inverted, locInfo) {\n\
\t  // When we are chaining inverse calls, we will not have a close path\n\
\t  if (close && close.path && openBlock.path.original !== close.path.original) {\n\
\t    var errorNode = { loc: openBlock.path.loc };\n\
\n\
\t    throw new _Exception2['default'](openBlock.path.original + ' doesn\\'t match ' + close.path.original, errorNode);\n\
\t  }\n\
\n\
\t  program.blockParams = openBlock.blockParams;\n\
\n\
\t  var inverse = undefined,\n\
\t      inverseStrip = undefined;\n\
\n\
\t  if (inverseAndProgram) {\n\
\t    if (inverseAndProgram.chain) {\n\
\t      inverseAndProgram.program.body[0].closeStrip = close.strip;\n\
\t    }\n\
\n\
\t    inverseStrip = inverseAndProgram.strip;\n\
\t    inverse = inverseAndProgram.program;\n\
\t  }\n\
\n\
\t  if (inverted) {\n\
\t    inverted = inverse;\n\
\t    inverse = program;\n\
\t    program = inverted;\n\
\t  }\n\
\n\
\t  return new this.BlockStatement(openBlock.path, openBlock.params, openBlock.hash, program, inverse, openBlock.strip, inverseStrip, close && close.strip, this.locInfo(locInfo));\n\
\t}\n\
\n\
/***/ },\n\
/* 17 */\n\
/***/ function(module, exports, __webpack_require__) {\n\
\n\
\t'use strict';\n\
\n\
\texports.__esModule = true;\n\
\t/*global define */\n\
\n\
\tvar _isArray = __webpack_require__(12);\n\
\n\
\tvar SourceNode = undefined;\n\
\n\
\ttry {\n\
\t  /* istanbul ignore next */\n\
\t  if (false) {\n\
\t    // We don't support this in AMD environments. For these environments, we asusme that\n\
\t    // they are running on the browser and thus have no need for the source-map library.\n\
\t    var SourceMap = require('source-map');\n\
\t    SourceNode = SourceMap.SourceNode;\n\
\t  }\n\
\t} catch (err) {}\n\
\n\
\t/* istanbul ignore if: tested but not covered in istanbul due to dist build  */\n\
\tif (!SourceNode) {\n\
\t  SourceNode = function (line, column, srcFile, chunks) {\n\
\t    this.src = '';\n\
\t    if (chunks) {\n\
\t      this.add(chunks);\n\
\t    }\n\
\t  };\n\
\t  /* istanbul ignore next */\n\
\t  SourceNode.prototype = {\n\
\t    add: function add(chunks) {\n\
\t      if (_isArray.isArray(chunks)) {\n\
\t        chunks = chunks.join('');\n\
\t      }\n\
\t      this.src += chunks;\n\
\t    },\n\
\t    prepend: function prepend(chunks) {\n\
\t      if (_isArray.isArray(chunks)) {\n\
\t        chunks = chunks.join('');\n\
\t      }\n\
\t      this.src = chunks + this.src;\n\
\t    },\n\
\t    toStringWithSourceMap: function toStringWithSourceMap() {\n\
\t      return { code: this.toString() };\n\
\t    },\n\
\t    toString: function toString() {\n\
\t      return this.src;\n\
\t    }\n\
\t  };\n\
\t}\n\
\n\
\tfunction castChunk(chunk, codeGen, loc) {\n\
\t  if (_isArray.isArray(chunk)) {\n\
\t    var ret = [];\n\
\n\
\t    for (var i = 0, len = chunk.length; i < len; i++) {\n\
\t      ret.push(codeGen.wrap(chunk[i], loc));\n\
\t    }\n\
\t    return ret;\n\
\t  } else if (typeof chunk === 'boolean' || typeof chunk === 'number') {\n\
\t    // Handle primitives that the SourceNode will throw up on\n\
\t    return chunk + '';\n\
\t  }\n\
\t  return chunk;\n\
\t}\n\
\n\
\tfunction CodeGen(srcFile) {\n\
\t  this.srcFile = srcFile;\n\
\t  this.source = [];\n\
\t}\n\
\n\
\tCodeGen.prototype = {\n\
\t  prepend: function prepend(source, loc) {\n\
\t    this.source.unshift(this.wrap(source, loc));\n\
\t  },\n\
\t  push: function push(source, loc) {\n\
\t    this.source.push(this.wrap(source, loc));\n\
\t  },\n\
\n\
\t  merge: function merge() {\n\
\t    var source = this.empty();\n\
\t    this.each(function (line) {\n\
\t      source.add(['  ', line, '\\n\
']);\n\
\t    });\n\
\t    return source;\n\
\t  },\n\
\n\
\t  each: function each(iter) {\n\
\t    for (var i = 0, len = this.source.length; i < len; i++) {\n\
\t      iter(this.source[i]);\n\
\t    }\n\
\t  },\n\
\n\
\t  empty: function empty() {\n\
\t    var loc = arguments[0] === undefined ? this.currentLocation || { start: {} } : arguments[0];\n\
\n\
\t    return new SourceNode(loc.start.line, loc.start.column, this.srcFile);\n\
\t  },\n\
\t  wrap: function wrap(chunk) {\n\
\t    var loc = arguments[1] === undefined ? this.currentLocation || { start: {} } : arguments[1];\n\
\n\
\t    if (chunk instanceof SourceNode) {\n\
\t      return chunk;\n\
\t    }\n\
\n\
\t    chunk = castChunk(chunk, this, loc);\n\
\n\
\t    return new SourceNode(loc.start.line, loc.start.column, this.srcFile, chunk);\n\
\t  },\n\
\n\
\t  functionCall: function functionCall(fn, type, params) {\n\
\t    params = this.generateList(params);\n\
\t    return this.wrap([fn, type ? '.' + type + '(' : '(', params, ')']);\n\
\t  },\n\
\n\
\t  quotedString: function quotedString(str) {\n\
\t    return '\"' + (str + '').replace(/\\\\/g, '\\\\\\\\').replace(/\"/g, '\\\\\"').replace(/\\n\
/g, '\\\\n\
').replace(/\\r/g, '\\\\r').replace(/\\u2028/g, '\\\\u2028') // Per Ecma-262 7.3 + 7.8.4\n\
\t    .replace(/\\u2029/g, '\\\\u2029') + '\"';\n\
\t  },\n\
\n\
\t  objectLiteral: function objectLiteral(obj) {\n\
\t    var pairs = [];\n\
\n\
\t    for (var key in obj) {\n\
\t      if (obj.hasOwnProperty(key)) {\n\
\t        var value = castChunk(obj[key], this);\n\
\t        if (value !== 'undefined') {\n\
\t          pairs.push([this.quotedString(key), ':', value]);\n\
\t        }\n\
\t      }\n\
\t    }\n\
\n\
\t    var ret = this.generateList(pairs);\n\
\t    ret.prepend('{');\n\
\t    ret.add('}');\n\
\t    return ret;\n\
\t  },\n\
\n\
\t  generateList: function generateList(entries, loc) {\n\
\t    var ret = this.empty(loc);\n\
\n\
\t    for (var i = 0, len = entries.length; i < len; i++) {\n\
\t      if (i) {\n\
\t        ret.add(',');\n\
\t      }\n\
\n\
\t      ret.add(castChunk(entries[i], this, loc));\n\
\t    }\n\
\n\
\t    return ret;\n\
\t  },\n\
\n\
\t  generateArray: function generateArray(entries, loc) {\n\
\t    var ret = this.generateList(entries, loc);\n\
\t    ret.prepend('[');\n\
\t    ret.add(']');\n\
\n\
\t    return ret;\n\
\t  }\n\
\t};\n\
\n\
\texports['default'] = CodeGen;\n\
\tmodule.exports = exports['default'];\n\
\n\
\t/* NOP */\n\
\n\
/***/ }\n\
/******/ ])\n\
});\n\
;\n\
//# sourceURL=components/components/handlebars.js/v3.0.3/handlebars.js"
));

require.modules["components-handlebars.js"] = require.modules["components~handlebars.js@v3.0.3"];
require.modules["components~handlebars.js"] = require.modules["components~handlebars.js@v3.0.3"];
require.modules["handlebars.js"] = require.modules["components~handlebars.js@v3.0.3"];


require.register("es-shims~es5-shim@v4.1.5", Function("exports, module",
"/*!\n\
 * https://github.com/es-shims/es5-shim\n\
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License\n\
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE\n\
 */\n\
\n\
// vim: ts=4 sts=4 sw=4 expandtab\n\
\n\
// Add semicolon to prevent IIFE from being passed as argument to concatenated code.\n\
;\n\
\n\
// UMD (Universal Module Definition)\n\
// see https://github.com/umdjs/umd/blob/master/returnExports.js\n\
(function (root, factory) {\n\
    'use strict';\n\
\n\
    /*global define, exports, module */\n\
    if (typeof define === 'function' && define.amd) {\n\
        // AMD. Register as an anonymous module.\n\
        define(factory);\n\
    } else if (typeof exports === 'object') {\n\
        // Node. Does not work with strict CommonJS, but\n\
        // only CommonJS-like enviroments that support module.exports,\n\
        // like Node.\n\
        module.exports = factory();\n\
    } else {\n\
        // Browser globals (root is window)\n\
        root.returnExports = factory();\n\
    }\n\
}(this, function () {\n\
\n\
/**\n\
 * Brings an environment as close to ECMAScript 5 compliance\n\
 * as is possible with the facilities of erstwhile engines.\n\
 *\n\
 * Annotated ES5: http://es5.github.com/ (specific links below)\n\
 * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf\n\
 * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/\n\
 */\n\
\n\
// Shortcut to an often accessed properties, in order to avoid multiple\n\
// dereference that costs universally.\n\
var ArrayPrototype = Array.prototype;\n\
var ObjectPrototype = Object.prototype;\n\
var FunctionPrototype = Function.prototype;\n\
var StringPrototype = String.prototype;\n\
var NumberPrototype = Number.prototype;\n\
var array_slice = ArrayPrototype.slice;\n\
var array_splice = ArrayPrototype.splice;\n\
var array_push = ArrayPrototype.push;\n\
var array_unshift = ArrayPrototype.unshift;\n\
var array_concat = ArrayPrototype.concat;\n\
var call = FunctionPrototype.call;\n\
\n\
// Having a toString local variable name breaks in Opera so use to_string.\n\
var to_string = ObjectPrototype.toString;\n\
\n\
var isArray = Array.isArray || function isArray(obj) {\n\
    return to_string.call(obj) === '[object Array]';\n\
};\n\
\n\
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';\n\
var isCallable; /* inlined from https://npmjs.com/is-callable */ var fnToStr = Function.prototype.toString, tryFunctionObject = function tryFunctionObject(value) { try { fnToStr.call(value); return true; } catch (e) { return false; } }, fnClass = '[object Function]', genClass = '[object GeneratorFunction]'; isCallable = function isCallable(value) { if (typeof value !== 'function') { return false; } if (hasToStringTag) { return tryFunctionObject(value); } var strClass = to_string.call(value); return strClass === fnClass || strClass === genClass; };\n\
var isRegex; /* inlined from https://npmjs.com/is-regex */ var regexExec = RegExp.prototype.exec, tryRegexExec = function tryRegexExec(value) { try { regexExec.call(value); return true; } catch (e) { return false; } }, regexClass = '[object RegExp]'; isRegex = function isRegex(value) { if (typeof value !== 'object') { return false; } return hasToStringTag ? tryRegexExec(value) : to_string.call(value) === regexClass; };\n\
var isString; /* inlined from https://npmjs.com/is-string */ var strValue = String.prototype.valueOf, tryStringObject = function tryStringObject(value) { try { strValue.call(value); return true; } catch (e) { return false; } }, stringClass = '[object String]'; isString = function isString(value) { if (typeof value === 'string') { return true; } if (typeof value !== 'object') { return false; } return hasToStringTag ? tryStringObject(value) : to_string.call(value) === stringClass; };\n\
\n\
var isArguments = function isArguments(value) {\n\
    var str = to_string.call(value);\n\
    var isArgs = str === '[object Arguments]';\n\
    if (!isArgs) {\n\
        isArgs = !isArray(value) &&\n\
          value !== null &&\n\
          typeof value === 'object' &&\n\
          typeof value.length === 'number' &&\n\
          value.length >= 0 &&\n\
          isCallable(value.callee);\n\
    }\n\
    return isArgs;\n\
};\n\
\n\
/* inlined from http://npmjs.com/define-properties */\n\
var defineProperties = (function (has) {\n\
  var supportsDescriptors = Object.defineProperty && (function () {\n\
      try {\n\
          var obj = {};\n\
          Object.defineProperty(obj, 'x', { enumerable: false, value: obj });\n\
          for (var _ in obj) { return false; }\n\
          return obj.x === obj;\n\
      } catch (e) { /* this is ES3 */\n\
          return false;\n\
      }\n\
  }());\n\
\n\
  // Define configurable, writable and non-enumerable props\n\
  // if they don't exist.\n\
  var defineProperty;\n\
  if (supportsDescriptors) {\n\
      defineProperty = function (object, name, method, forceAssign) {\n\
          if (!forceAssign && (name in object)) { return; }\n\
          Object.defineProperty(object, name, {\n\
              configurable: true,\n\
              enumerable: false,\n\
              writable: true,\n\
              value: method\n\
          });\n\
      };\n\
  } else {\n\
      defineProperty = function (object, name, method, forceAssign) {\n\
          if (!forceAssign && (name in object)) { return; }\n\
          object[name] = method;\n\
      };\n\
  }\n\
  return function defineProperties(object, map, forceAssign) {\n\
      for (var name in map) {\n\
          if (has.call(map, name)) {\n\
            defineProperty(object, name, map[name], forceAssign);\n\
          }\n\
      }\n\
  };\n\
}(ObjectPrototype.hasOwnProperty));\n\
\n\
//\n\
// Util\n\
// ======\n\
//\n\
\n\
/* replaceable with https://npmjs.com/package/es-abstract /helpers/isPrimitive */\n\
var isPrimitive = function isPrimitive(input) {\n\
    var type = typeof input;\n\
    return input === null || (type !== 'object' && type !== 'function');\n\
};\n\
\n\
var ES = {\n\
    // ES5 9.4\n\
    // http://es5.github.com/#x9.4\n\
    // http://jsperf.com/to-integer\n\
    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToInteger */\n\
    ToInteger: function ToInteger(num) {\n\
        var n = +num;\n\
        if (n !== n) { // isNaN\n\
            n = 0;\n\
        } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {\n\
            n = (n > 0 || -1) * Math.floor(Math.abs(n));\n\
        }\n\
        return n;\n\
    },\n\
\n\
    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToPrimitive */\n\
    ToPrimitive: function ToPrimitive(input) {\n\
        var val, valueOf, toStr;\n\
        if (isPrimitive(input)) {\n\
            return input;\n\
        }\n\
        valueOf = input.valueOf;\n\
        if (isCallable(valueOf)) {\n\
            val = valueOf.call(input);\n\
            if (isPrimitive(val)) {\n\
                return val;\n\
            }\n\
        }\n\
        toStr = input.toString;\n\
        if (isCallable(toStr)) {\n\
            val = toStr.call(input);\n\
            if (isPrimitive(val)) {\n\
                return val;\n\
            }\n\
        }\n\
        throw new TypeError();\n\
    },\n\
\n\
    // ES5 9.9\n\
    // http://es5.github.com/#x9.9\n\
    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToObject */\n\
    ToObject: function (o) {\n\
        /*jshint eqnull: true */\n\
        if (o == null) { // this matches both null and undefined\n\
            throw new TypeError(\"can't convert \" + o + ' to object');\n\
        }\n\
        return Object(o);\n\
    },\n\
\n\
    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToUint32 */\n\
    ToUint32: function ToUint32(x) {\n\
        return x >>> 0;\n\
    }\n\
};\n\
\n\
//\n\
// Function\n\
// ========\n\
//\n\
\n\
// ES-5 15.3.4.5\n\
// http://es5.github.com/#x15.3.4.5\n\
\n\
var Empty = function Empty() {};\n\
\n\
defineProperties(FunctionPrototype, {\n\
    bind: function bind(that) { // .length is 1\n\
        // 1. Let Target be the this value.\n\
        var target = this;\n\
        // 2. If IsCallable(Target) is false, throw a TypeError exception.\n\
        if (!isCallable(target)) {\n\
            throw new TypeError('Function.prototype.bind called on incompatible ' + target);\n\
        }\n\
        // 3. Let A be a new (possibly empty) internal list of all of the\n\
        //   argument values provided after thisArg (arg1, arg2 etc), in order.\n\
        // XXX slicedArgs will stand in for \"A\" if used\n\
        var args = array_slice.call(arguments, 1); // for normal call\n\
        // 4. Let F be a new native ECMAScript object.\n\
        // 11. Set the [[Prototype]] internal property of F to the standard\n\
        //   built-in Function prototype object as specified in 15.3.3.1.\n\
        // 12. Set the [[Call]] internal property of F as described in\n\
        //   15.3.4.5.1.\n\
        // 13. Set the [[Construct]] internal property of F as described in\n\
        //   15.3.4.5.2.\n\
        // 14. Set the [[HasInstance]] internal property of F as described in\n\
        //   15.3.4.5.3.\n\
        var bound;\n\
        var binder = function () {\n\
\n\
            if (this instanceof bound) {\n\
                // 15.3.4.5.2 [[Construct]]\n\
                // When the [[Construct]] internal method of a function object,\n\
                // F that was created using the bind function is called with a\n\
                // list of arguments ExtraArgs, the following steps are taken:\n\
                // 1. Let target be the value of F's [[TargetFunction]]\n\
                //   internal property.\n\
                // 2. If target has no [[Construct]] internal method, a\n\
                //   TypeError exception is thrown.\n\
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal\n\
                //   property.\n\
                // 4. Let args be a new list containing the same values as the\n\
                //   list boundArgs in the same order followed by the same\n\
                //   values as the list ExtraArgs in the same order.\n\
                // 5. Return the result of calling the [[Construct]] internal\n\
                //   method of target providing args as the arguments.\n\
\n\
                var result = target.apply(\n\
                    this,\n\
                    array_concat.call(args, array_slice.call(arguments))\n\
                );\n\
                if (Object(result) === result) {\n\
                    return result;\n\
                }\n\
                return this;\n\
\n\
            } else {\n\
                // 15.3.4.5.1 [[Call]]\n\
                // When the [[Call]] internal method of a function object, F,\n\
                // which was created using the bind function is called with a\n\
                // this value and a list of arguments ExtraArgs, the following\n\
                // steps are taken:\n\
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal\n\
                //   property.\n\
                // 2. Let boundThis be the value of F's [[BoundThis]] internal\n\
                //   property.\n\
                // 3. Let target be the value of F's [[TargetFunction]] internal\n\
                //   property.\n\
                // 4. Let args be a new list containing the same values as the\n\
                //   list boundArgs in the same order followed by the same\n\
                //   values as the list ExtraArgs in the same order.\n\
                // 5. Return the result of calling the [[Call]] internal method\n\
                //   of target providing boundThis as the this value and\n\
                //   providing args as the arguments.\n\
\n\
                // equiv: target.call(this, ...boundArgs, ...args)\n\
                return target.apply(\n\
                    that,\n\
                    array_concat.call(args, array_slice.call(arguments))\n\
                );\n\
\n\
            }\n\
\n\
        };\n\
\n\
        // 15. If the [[Class]] internal property of Target is \"Function\", then\n\
        //     a. Let L be the length property of Target minus the length of A.\n\
        //     b. Set the length own property of F to either 0 or L, whichever is\n\
        //       larger.\n\
        // 16. Else set the length own property of F to 0.\n\
\n\
        var boundLength = Math.max(0, target.length - args.length);\n\
\n\
        // 17. Set the attributes of the length own property of F to the values\n\
        //   specified in 15.3.5.1.\n\
        var boundArgs = [];\n\
        for (var i = 0; i < boundLength; i++) {\n\
            boundArgs.push('$' + i);\n\
        }\n\
\n\
        // XXX Build a dynamic function with desired amount of arguments is the only\n\
        // way to set the length property of a function.\n\
        // In environments where Content Security Policies enabled (Chrome extensions,\n\
        // for ex.) all use of eval or Function costructor throws an exception.\n\
        // However in all of these environments Function.prototype.bind exists\n\
        // and so this code will never be executed.\n\
        bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this, arguments); }')(binder);\n\
\n\
        if (target.prototype) {\n\
            Empty.prototype = target.prototype;\n\
            bound.prototype = new Empty();\n\
            // Clean up dangling references.\n\
            Empty.prototype = null;\n\
        }\n\
\n\
        // TODO\n\
        // 18. Set the [[Extensible]] internal property of F to true.\n\
\n\
        // TODO\n\
        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).\n\
        // 20. Call the [[DefineOwnProperty]] internal method of F with\n\
        //   arguments \"caller\", PropertyDescriptor {[[Get]]: thrower, [[Set]]:\n\
        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and\n\
        //   false.\n\
        // 21. Call the [[DefineOwnProperty]] internal method of F with\n\
        //   arguments \"arguments\", PropertyDescriptor {[[Get]]: thrower,\n\
        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},\n\
        //   and false.\n\
\n\
        // TODO\n\
        // NOTE Function objects created using Function.prototype.bind do not\n\
        // have a prototype property or the [[Code]], [[FormalParameters]], and\n\
        // [[Scope]] internal properties.\n\
        // XXX can't delete prototype in pure-js.\n\
\n\
        // 22. Return F.\n\
        return bound;\n\
    }\n\
});\n\
\n\
// _Please note: Shortcuts are defined after `Function.prototype.bind` as we\n\
// us it in defining shortcuts.\n\
var owns = call.bind(ObjectPrototype.hasOwnProperty);\n\
\n\
//\n\
// Array\n\
// =====\n\
//\n\
\n\
// ES5 15.4.4.12\n\
// http://es5.github.com/#x15.4.4.12\n\
var spliceNoopReturnsEmptyArray = (function () {\n\
    var a = [1, 2];\n\
    var result = a.splice();\n\
    return a.length === 2 && isArray(result) && result.length === 0;\n\
}());\n\
defineProperties(ArrayPrototype, {\n\
    // Safari 5.0 bug where .splice() returns undefined\n\
    splice: function splice(start, deleteCount) {\n\
        if (arguments.length === 0) {\n\
            return [];\n\
        } else {\n\
            return array_splice.apply(this, arguments);\n\
        }\n\
    }\n\
}, !spliceNoopReturnsEmptyArray);\n\
\n\
var spliceWorksWithEmptyObject = (function () {\n\
    var obj = {};\n\
    ArrayPrototype.splice.call(obj, 0, 0, 1);\n\
    return obj.length === 1;\n\
}());\n\
defineProperties(ArrayPrototype, {\n\
    splice: function splice(start, deleteCount) {\n\
        if (arguments.length === 0) { return []; }\n\
        var args = arguments;\n\
        this.length = Math.max(ES.ToInteger(this.length), 0);\n\
        if (arguments.length > 0 && typeof deleteCount !== 'number') {\n\
            args = array_slice.call(arguments);\n\
            if (args.length < 2) {\n\
                args.push(this.length - start);\n\
            } else {\n\
                args[1] = ES.ToInteger(deleteCount);\n\
            }\n\
        }\n\
        return array_splice.apply(this, args);\n\
    }\n\
}, !spliceWorksWithEmptyObject);\n\
\n\
// ES5 15.4.4.12\n\
// http://es5.github.com/#x15.4.4.13\n\
// Return len+argCount.\n\
// [bugfix, ielt8]\n\
// IE < 8 bug: [].unshift(0) === undefined but should be \"1\"\n\
var hasUnshiftReturnValueBug = [].unshift(0) !== 1;\n\
defineProperties(ArrayPrototype, {\n\
    unshift: function () {\n\
        array_unshift.apply(this, arguments);\n\
        return this.length;\n\
    }\n\
}, hasUnshiftReturnValueBug);\n\
\n\
// ES5 15.4.3.2\n\
// http://es5.github.com/#x15.4.3.2\n\
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray\n\
defineProperties(Array, { isArray: isArray });\n\
\n\
// The IsCallable() check in the Array functions\n\
// has been replaced with a strict check on the\n\
// internal class of the object to trap cases where\n\
// the provided function was actually a regular\n\
// expression literal, which in V8 and\n\
// JavaScriptCore is a typeof \"function\".  Only in\n\
// V8 are regular expression literals permitted as\n\
// reduce parameters, so it is desirable in the\n\
// general case for the shim to match the more\n\
// strict and common behavior of rejecting regular\n\
// expressions.\n\
\n\
// ES5 15.4.4.18\n\
// http://es5.github.com/#x15.4.4.18\n\
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach\n\
\n\
// Check failure of by-index access of string characters (IE < 9)\n\
// and failure of `0 in boxedString` (Rhino)\n\
var boxedString = Object('a');\n\
var splitString = boxedString[0] !== 'a' || !(0 in boxedString);\n\
\n\
var properlyBoxesContext = function properlyBoxed(method) {\n\
    // Check node 0.6.21 bug where third parameter is not boxed\n\
    var properlyBoxesNonStrict = true;\n\
    var properlyBoxesStrict = true;\n\
    if (method) {\n\
        method.call('foo', function (_, __, context) {\n\
            if (typeof context !== 'object') { properlyBoxesNonStrict = false; }\n\
        });\n\
\n\
        method.call([1], function () {\n\
            'use strict';\n\
\n\
            properlyBoxesStrict = typeof this === 'string';\n\
        }, 'x');\n\
    }\n\
    return !!method && properlyBoxesNonStrict && properlyBoxesStrict;\n\
};\n\
\n\
defineProperties(ArrayPrototype, {\n\
    forEach: function forEach(callbackfn /*, thisArg*/) {\n\
        var object = ES.ToObject(this);\n\
        var self = splitString && isString(this) ? this.split('') : object;\n\
        var i = -1;\n\
        var length = self.length >>> 0;\n\
        var T;\n\
        if (arguments.length > 1) {\n\
          T = arguments[1];\n\
        }\n\
\n\
        // If no callback function or if callback is not a callable function\n\
        if (!isCallable(callbackfn)) {\n\
            throw new TypeError('Array.prototype.forEach callback must be a function');\n\
        }\n\
\n\
        while (++i < length) {\n\
            if (i in self) {\n\
                // Invoke the callback function with call, passing arguments:\n\
                // context, property value, property key, thisArg object\n\
                if (typeof T !== 'undefined') {\n\
                    callbackfn.call(T, self[i], i, object);\n\
                } else {\n\
                    callbackfn(self[i], i, object);\n\
                }\n\
            }\n\
        }\n\
    }\n\
}, !properlyBoxesContext(ArrayPrototype.forEach));\n\
\n\
// ES5 15.4.4.19\n\
// http://es5.github.com/#x15.4.4.19\n\
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map\n\
defineProperties(ArrayPrototype, {\n\
    map: function map(callbackfn/*, thisArg*/) {\n\
        var object = ES.ToObject(this);\n\
        var self = splitString && isString(this) ? this.split('') : object;\n\
        var length = self.length >>> 0;\n\
        var result = Array(length);\n\
        var T;\n\
        if (arguments.length > 1) {\n\
            T = arguments[1];\n\
        }\n\
\n\
        // If no callback function or if callback is not a callable function\n\
        if (!isCallable(callbackfn)) {\n\
            throw new TypeError('Array.prototype.map callback must be a function');\n\
        }\n\
\n\
        for (var i = 0; i < length; i++) {\n\
            if (i in self) {\n\
                if (typeof T !== 'undefined') {\n\
                    result[i] = callbackfn.call(T, self[i], i, object);\n\
                } else {\n\
                    result[i] = callbackfn(self[i], i, object);\n\
                }\n\
            }\n\
        }\n\
        return result;\n\
    }\n\
}, !properlyBoxesContext(ArrayPrototype.map));\n\
\n\
// ES5 15.4.4.20\n\
// http://es5.github.com/#x15.4.4.20\n\
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter\n\
defineProperties(ArrayPrototype, {\n\
    filter: function filter(callbackfn /*, thisArg*/) {\n\
        var object = ES.ToObject(this);\n\
        var self = splitString && isString(this) ? this.split('') : object;\n\
        var length = self.length >>> 0;\n\
        var result = [];\n\
        var value;\n\
        var T;\n\
        if (arguments.length > 1) {\n\
            T = arguments[1];\n\
        }\n\
\n\
        // If no callback function or if callback is not a callable function\n\
        if (!isCallable(callbackfn)) {\n\
            throw new TypeError('Array.prototype.filter callback must be a function');\n\
        }\n\
\n\
        for (var i = 0; i < length; i++) {\n\
            if (i in self) {\n\
                value = self[i];\n\
                if (typeof T === 'undefined' ? callbackfn(value, i, object) : callbackfn.call(T, value, i, object)) {\n\
                    result.push(value);\n\
                }\n\
            }\n\
        }\n\
        return result;\n\
    }\n\
}, !properlyBoxesContext(ArrayPrototype.filter));\n\
\n\
// ES5 15.4.4.16\n\
// http://es5.github.com/#x15.4.4.16\n\
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every\n\
defineProperties(ArrayPrototype, {\n\
    every: function every(callbackfn /*, thisArg*/) {\n\
        var object = ES.ToObject(this);\n\
        var self = splitString && isString(this) ? this.split('') : object;\n\
        var length = self.length >>> 0;\n\
        var T;\n\
        if (arguments.length > 1) {\n\
            T = arguments[1];\n\
        }\n\
\n\
        // If no callback function or if callback is not a callable function\n\
        if (!isCallable(callbackfn)) {\n\
            throw new TypeError('Array.prototype.every callback must be a function');\n\
        }\n\
\n\
        for (var i = 0; i < length; i++) {\n\
            if (i in self && !(typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {\n\
                return false;\n\
            }\n\
        }\n\
        return true;\n\
    }\n\
}, !properlyBoxesContext(ArrayPrototype.every));\n\
\n\
// ES5 15.4.4.17\n\
// http://es5.github.com/#x15.4.4.17\n\
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some\n\
defineProperties(ArrayPrototype, {\n\
    some: function some(callbackfn/*, thisArg */) {\n\
        var object = ES.ToObject(this);\n\
        var self = splitString && isString(this) ? this.split('') : object;\n\
        var length = self.length >>> 0;\n\
        var T;\n\
        if (arguments.length > 1) {\n\
            T = arguments[1];\n\
        }\n\
\n\
        // If no callback function or if callback is not a callable function\n\
        if (!isCallable(callbackfn)) {\n\
            throw new TypeError('Array.prototype.some callback must be a function');\n\
        }\n\
\n\
        for (var i = 0; i < length; i++) {\n\
            if (i in self && (typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {\n\
                return true;\n\
            }\n\
        }\n\
        return false;\n\
    }\n\
}, !properlyBoxesContext(ArrayPrototype.some));\n\
\n\
// ES5 15.4.4.21\n\
// http://es5.github.com/#x15.4.4.21\n\
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce\n\
var reduceCoercesToObject = false;\n\
if (ArrayPrototype.reduce) {\n\
    reduceCoercesToObject = typeof ArrayPrototype.reduce.call('es5', function (_, __, ___, list) { return list; }) === 'object';\n\
}\n\
defineProperties(ArrayPrototype, {\n\
    reduce: function reduce(callbackfn /*, initialValue*/) {\n\
        var object = ES.ToObject(this);\n\
        var self = splitString && isString(this) ? this.split('') : object;\n\
        var length = self.length >>> 0;\n\
\n\
        // If no callback function or if callback is not a callable function\n\
        if (!isCallable(callbackfn)) {\n\
            throw new TypeError('Array.prototype.reduce callback must be a function');\n\
        }\n\
\n\
        // no value to return if no initial value and an empty array\n\
        if (length === 0 && arguments.length === 1) {\n\
            throw new TypeError('reduce of empty array with no initial value');\n\
        }\n\
\n\
        var i = 0;\n\
        var result;\n\
        if (arguments.length >= 2) {\n\
            result = arguments[1];\n\
        } else {\n\
            do {\n\
                if (i in self) {\n\
                    result = self[i++];\n\
                    break;\n\
                }\n\
\n\
                // if array contains no values, no initial value to return\n\
                if (++i >= length) {\n\
                    throw new TypeError('reduce of empty array with no initial value');\n\
                }\n\
            } while (true);\n\
        }\n\
\n\
        for (; i < length; i++) {\n\
            if (i in self) {\n\
                result = callbackfn(result, self[i], i, object);\n\
            }\n\
        }\n\
\n\
        return result;\n\
    }\n\
}, !reduceCoercesToObject);\n\
\n\
// ES5 15.4.4.22\n\
// http://es5.github.com/#x15.4.4.22\n\
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight\n\
var reduceRightCoercesToObject = false;\n\
if (ArrayPrototype.reduceRight) {\n\
    reduceRightCoercesToObject = typeof ArrayPrototype.reduceRight.call('es5', function (_, __, ___, list) { return list; }) === 'object';\n\
}\n\
defineProperties(ArrayPrototype, {\n\
    reduceRight: function reduceRight(callbackfn/*, initial*/) {\n\
        var object = ES.ToObject(this);\n\
        var self = splitString && isString(this) ? this.split('') : object;\n\
        var length = self.length >>> 0;\n\
\n\
        // If no callback function or if callback is not a callable function\n\
        if (!isCallable(callbackfn)) {\n\
            throw new TypeError('Array.prototype.reduceRight callback must be a function');\n\
        }\n\
\n\
        // no value to return if no initial value, empty array\n\
        if (length === 0 && arguments.length === 1) {\n\
            throw new TypeError('reduceRight of empty array with no initial value');\n\
        }\n\
\n\
        var result;\n\
        var i = length - 1;\n\
        if (arguments.length >= 2) {\n\
            result = arguments[1];\n\
        } else {\n\
            do {\n\
                if (i in self) {\n\
                    result = self[i--];\n\
                    break;\n\
                }\n\
\n\
                // if array contains no values, no initial value to return\n\
                if (--i < 0) {\n\
                    throw new TypeError('reduceRight of empty array with no initial value');\n\
                }\n\
            } while (true);\n\
        }\n\
\n\
        if (i < 0) {\n\
            return result;\n\
        }\n\
\n\
        do {\n\
            if (i in self) {\n\
                result = callbackfn(result, self[i], i, object);\n\
            }\n\
        } while (i--);\n\
\n\
        return result;\n\
    }\n\
}, !reduceRightCoercesToObject);\n\
\n\
// ES5 15.4.4.14\n\
// http://es5.github.com/#x15.4.4.14\n\
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf\n\
var hasFirefox2IndexOfBug = Array.prototype.indexOf && [0, 1].indexOf(1, 2) !== -1;\n\
defineProperties(ArrayPrototype, {\n\
    indexOf: function indexOf(searchElement /*, fromIndex */) {\n\
        var self = splitString && isString(this) ? this.split('') : ES.ToObject(this);\n\
        var length = self.length >>> 0;\n\
\n\
        if (length === 0) {\n\
            return -1;\n\
        }\n\
\n\
        var i = 0;\n\
        if (arguments.length > 1) {\n\
            i = ES.ToInteger(arguments[1]);\n\
        }\n\
\n\
        // handle negative indices\n\
        i = i >= 0 ? i : Math.max(0, length + i);\n\
        for (; i < length; i++) {\n\
            if (i in self && self[i] === searchElement) {\n\
                return i;\n\
            }\n\
        }\n\
        return -1;\n\
    }\n\
}, hasFirefox2IndexOfBug);\n\
\n\
// ES5 15.4.4.15\n\
// http://es5.github.com/#x15.4.4.15\n\
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf\n\
var hasFirefox2LastIndexOfBug = Array.prototype.lastIndexOf && [0, 1].lastIndexOf(0, -3) !== -1;\n\
defineProperties(ArrayPrototype, {\n\
    lastIndexOf: function lastIndexOf(searchElement /*, fromIndex */) {\n\
        var self = splitString && isString(this) ? this.split('') : ES.ToObject(this);\n\
        var length = self.length >>> 0;\n\
\n\
        if (length === 0) {\n\
            return -1;\n\
        }\n\
        var i = length - 1;\n\
        if (arguments.length > 1) {\n\
            i = Math.min(i, ES.ToInteger(arguments[1]));\n\
        }\n\
        // handle negative indices\n\
        i = i >= 0 ? i : length - Math.abs(i);\n\
        for (; i >= 0; i--) {\n\
            if (i in self && searchElement === self[i]) {\n\
                return i;\n\
            }\n\
        }\n\
        return -1;\n\
    }\n\
}, hasFirefox2LastIndexOfBug);\n\
\n\
//\n\
// Object\n\
// ======\n\
//\n\
\n\
// ES5 15.2.3.14\n\
// http://es5.github.com/#x15.2.3.14\n\
\n\
// http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation\n\
var hasDontEnumBug = !({ 'toString': null }).propertyIsEnumerable('toString'),\n\
    hasProtoEnumBug = function () {}.propertyIsEnumerable('prototype'),\n\
    hasStringEnumBug = !owns('x', '0'),\n\
    dontEnums = [\n\
        'toString',\n\
        'toLocaleString',\n\
        'valueOf',\n\
        'hasOwnProperty',\n\
        'isPrototypeOf',\n\
        'propertyIsEnumerable',\n\
        'constructor'\n\
    ],\n\
    dontEnumsLength = dontEnums.length;\n\
\n\
defineProperties(Object, {\n\
    keys: function keys(object) {\n\
        var isFn = isCallable(object),\n\
            isArgs = isArguments(object),\n\
            isObject = object !== null && typeof object === 'object',\n\
            isStr = isObject && isString(object);\n\
\n\
        if (!isObject && !isFn && !isArgs) {\n\
            throw new TypeError('Object.keys called on a non-object');\n\
        }\n\
\n\
        var theKeys = [];\n\
        var skipProto = hasProtoEnumBug && isFn;\n\
        if ((isStr && hasStringEnumBug) || isArgs) {\n\
            for (var i = 0; i < object.length; ++i) {\n\
                theKeys.push(String(i));\n\
            }\n\
        }\n\
\n\
        if (!isArgs) {\n\
            for (var name in object) {\n\
                if (!(skipProto && name === 'prototype') && owns(object, name)) {\n\
                    theKeys.push(String(name));\n\
                }\n\
            }\n\
        }\n\
\n\
        if (hasDontEnumBug) {\n\
            var ctor = object.constructor,\n\
                skipConstructor = ctor && ctor.prototype === object;\n\
            for (var j = 0; j < dontEnumsLength; j++) {\n\
                var dontEnum = dontEnums[j];\n\
                if (!(skipConstructor && dontEnum === 'constructor') && owns(object, dontEnum)) {\n\
                    theKeys.push(dontEnum);\n\
                }\n\
            }\n\
        }\n\
        return theKeys;\n\
    }\n\
});\n\
\n\
var keysWorksWithArguments = Object.keys && (function () {\n\
    // Safari 5.0 bug\n\
    return Object.keys(arguments).length === 2;\n\
}(1, 2));\n\
var originalKeys = Object.keys;\n\
defineProperties(Object, {\n\
    keys: function keys(object) {\n\
        if (isArguments(object)) {\n\
            return originalKeys(ArrayPrototype.slice.call(object));\n\
        } else {\n\
            return originalKeys(object);\n\
        }\n\
    }\n\
}, !keysWorksWithArguments);\n\
\n\
//\n\
// Date\n\
// ====\n\
//\n\
\n\
// ES5 15.9.5.43\n\
// http://es5.github.com/#x15.9.5.43\n\
// This function returns a String value represent the instance in time\n\
// represented by this Date object. The format of the String is the Date Time\n\
// string format defined in 15.9.1.15. All fields are present in the String.\n\
// The time zone is always UTC, denoted by the suffix Z. If the time value of\n\
// this object is not a finite Number a RangeError exception is thrown.\n\
var negativeDate = -62198755200000;\n\
var negativeYearString = '-000001';\n\
var hasNegativeDateBug = Date.prototype.toISOString && new Date(negativeDate).toISOString().indexOf(negativeYearString) === -1;\n\
\n\
defineProperties(Date.prototype, {\n\
    toISOString: function toISOString() {\n\
        var result, length, value, year, month;\n\
        if (!isFinite(this)) {\n\
            throw new RangeError('Date.prototype.toISOString called on non-finite value.');\n\
        }\n\
\n\
        year = this.getUTCFullYear();\n\
\n\
        month = this.getUTCMonth();\n\
        // see https://github.com/es-shims/es5-shim/issues/111\n\
        year += Math.floor(month / 12);\n\
        month = (month % 12 + 12) % 12;\n\
\n\
        // the date time string format is specified in 15.9.1.15.\n\
        result = [month + 1, this.getUTCDate(), this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()];\n\
        year = (\n\
            (year < 0 ? '-' : (year > 9999 ? '+' : '')) +\n\
            ('00000' + Math.abs(year)).slice((0 <= year && year <= 9999) ? -4 : -6)\n\
        );\n\
\n\
        length = result.length;\n\
        while (length--) {\n\
            value = result[length];\n\
            // pad months, days, hours, minutes, and seconds to have two\n\
            // digits.\n\
            if (value < 10) {\n\
                result[length] = '0' + value;\n\
            }\n\
        }\n\
        // pad milliseconds to have three digits.\n\
        return (\n\
            year + '-' + result.slice(0, 2).join('-') +\n\
            'T' + result.slice(2).join(':') + '.' +\n\
            ('000' + this.getUTCMilliseconds()).slice(-3) + 'Z'\n\
        );\n\
    }\n\
}, hasNegativeDateBug);\n\
\n\
// ES5 15.9.5.44\n\
// http://es5.github.com/#x15.9.5.44\n\
// This function provides a String representation of a Date object for use by\n\
// JSON.stringify (15.12.3).\n\
var dateToJSONIsSupported = (function () {\n\
    try {\n\
        return Date.prototype.toJSON &&\n\
            new Date(NaN).toJSON() === null &&\n\
            new Date(negativeDate).toJSON().indexOf(negativeYearString) !== -1 &&\n\
            Date.prototype.toJSON.call({ // generic\n\
                toISOString: function () { return true; }\n\
            });\n\
    } catch (e) {\n\
        return false;\n\
    }\n\
}());\n\
if (!dateToJSONIsSupported) {\n\
    Date.prototype.toJSON = function toJSON(key) {\n\
        // When the toJSON method is called with argument key, the following\n\
        // steps are taken:\n\
\n\
        // 1.  Let O be the result of calling ToObject, giving it the this\n\
        // value as its argument.\n\
        // 2. Let tv be ES.ToPrimitive(O, hint Number).\n\
        var O = Object(this);\n\
        var tv = ES.ToPrimitive(O);\n\
        // 3. If tv is a Number and is not finite, return null.\n\
        if (typeof tv === 'number' && !isFinite(tv)) {\n\
            return null;\n\
        }\n\
        // 4. Let toISO be the result of calling the [[Get]] internal method of\n\
        // O with argument \"toISOString\".\n\
        var toISO = O.toISOString;\n\
        // 5. If IsCallable(toISO) is false, throw a TypeError exception.\n\
        if (!isCallable(toISO)) {\n\
            throw new TypeError('toISOString property is not callable');\n\
        }\n\
        // 6. Return the result of calling the [[Call]] internal method of\n\
        //  toISO with O as the this value and an empty argument list.\n\
        return toISO.call(O);\n\
\n\
        // NOTE 1 The argument is ignored.\n\
\n\
        // NOTE 2 The toJSON function is intentionally generic; it does not\n\
        // require that its this value be a Date object. Therefore, it can be\n\
        // transferred to other kinds of objects for use as a method. However,\n\
        // it does require that any such object have a toISOString method. An\n\
        // object is free to use the argument key to filter its\n\
        // stringification.\n\
    };\n\
}\n\
\n\
// ES5 15.9.4.2\n\
// http://es5.github.com/#x15.9.4.2\n\
// based on work shared by Daniel Friesen (dantman)\n\
// http://gist.github.com/303249\n\
var supportsExtendedYears = Date.parse('+033658-09-27T01:46:40.000Z') === 1e15;\n\
var acceptsInvalidDates = !isNaN(Date.parse('2012-04-04T24:00:00.500Z')) || !isNaN(Date.parse('2012-11-31T23:59:59.000Z')) || !isNaN(Date.parse('2012-12-31T23:59:60.000Z'));\n\
var doesNotParseY2KNewYear = isNaN(Date.parse('2000-01-01T00:00:00.000Z'));\n\
if (!Date.parse || doesNotParseY2KNewYear || acceptsInvalidDates || !supportsExtendedYears) {\n\
    // XXX global assignment won't work in embeddings that use\n\
    // an alternate object for the context.\n\
    /*global Date: true */\n\
    /*eslint-disable no-undef*/\n\
    Date = (function (NativeDate) {\n\
    /*eslint-enable no-undef*/\n\
        // Date.length === 7\n\
        var DateShim = function Date(Y, M, D, h, m, s, ms) {\n\
            var length = arguments.length;\n\
            var date;\n\
            if (this instanceof NativeDate) {\n\
                date = length === 1 && String(Y) === Y ? // isString(Y)\n\
                    // We explicitly pass it through parse:\n\
                    new NativeDate(DateShim.parse(Y)) :\n\
                    // We have to manually make calls depending on argument\n\
                    // length here\n\
                    length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :\n\
                    length >= 6 ? new NativeDate(Y, M, D, h, m, s) :\n\
                    length >= 5 ? new NativeDate(Y, M, D, h, m) :\n\
                    length >= 4 ? new NativeDate(Y, M, D, h) :\n\
                    length >= 3 ? new NativeDate(Y, M, D) :\n\
                    length >= 2 ? new NativeDate(Y, M) :\n\
                    length >= 1 ? new NativeDate(Y) :\n\
                                  new NativeDate();\n\
            } else {\n\
                date = NativeDate.apply(this, arguments);\n\
            }\n\
            // Prevent mixups with unfixed Date object\n\
            defineProperties(date, { constructor: DateShim }, true);\n\
            return date;\n\
        };\n\
\n\
        // 15.9.1.15 Date Time String Format.\n\
        var isoDateExpression = new RegExp('^' +\n\
            '(\\\\d{4}|[+-]\\\\d{6})' + // four-digit year capture or sign +\n\
                                      // 6-digit extended year\n\
            '(?:-(\\\\d{2})' + // optional month capture\n\
            '(?:-(\\\\d{2})' + // optional day capture\n\
            '(?:' + // capture hours:minutes:seconds.milliseconds\n\
                'T(\\\\d{2})' + // hours capture\n\
                ':(\\\\d{2})' + // minutes capture\n\
                '(?:' + // optional :seconds.milliseconds\n\
                    ':(\\\\d{2})' + // seconds capture\n\
                    '(?:(\\\\.\\\\d{1,}))?' + // milliseconds capture\n\
                ')?' +\n\
            '(' + // capture UTC offset component\n\
                'Z|' + // UTC capture\n\
                '(?:' + // offset specifier +/-hours:minutes\n\
                    '([-+])' + // sign capture\n\
                    '(\\\\d{2})' + // hours offset capture\n\
                    ':(\\\\d{2})' + // minutes offset capture\n\
                ')' +\n\
            ')?)?)?)?' +\n\
        '$');\n\
\n\
        var months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];\n\
\n\
        var dayFromMonth = function dayFromMonth(year, month) {\n\
            var t = month > 1 ? 1 : 0;\n\
            return (\n\
                months[month] +\n\
                Math.floor((year - 1969 + t) / 4) -\n\
                Math.floor((year - 1901 + t) / 100) +\n\
                Math.floor((year - 1601 + t) / 400) +\n\
                365 * (year - 1970)\n\
            );\n\
        };\n\
\n\
        var toUTC = function toUTC(t) {\n\
            return Number(new NativeDate(1970, 0, 1, 0, 0, 0, t));\n\
        };\n\
\n\
        // Copy any custom methods a 3rd party library may have added\n\
        for (var key in NativeDate) {\n\
            if (owns(NativeDate, key)) {\n\
                DateShim[key] = NativeDate[key];\n\
            }\n\
        }\n\
\n\
        // Copy \"native\" methods explicitly; they may be non-enumerable\n\
        defineProperties(DateShim, {\n\
            now: NativeDate.now,\n\
            UTC: NativeDate.UTC\n\
        }, true);\n\
        DateShim.prototype = NativeDate.prototype;\n\
        defineProperties(DateShim.prototype, {\n\
            constructor: DateShim\n\
        }, true);\n\
\n\
        // Upgrade Date.parse to handle simplified ISO 8601 strings\n\
        DateShim.parse = function parse(string) {\n\
            var match = isoDateExpression.exec(string);\n\
            if (match) {\n\
                // parse months, days, hours, minutes, seconds, and milliseconds\n\
                // provide default values if necessary\n\
                // parse the UTC offset component\n\
                var year = Number(match[1]),\n\
                    month = Number(match[2] || 1) - 1,\n\
                    day = Number(match[3] || 1) - 1,\n\
                    hour = Number(match[4] || 0),\n\
                    minute = Number(match[5] || 0),\n\
                    second = Number(match[6] || 0),\n\
                    millisecond = Math.floor(Number(match[7] || 0) * 1000),\n\
                    // When time zone is missed, local offset should be used\n\
                    // (ES 5.1 bug)\n\
                    // see https://bugs.ecmascript.org/show_bug.cgi?id=112\n\
                    isLocalTime = Boolean(match[4] && !match[8]),\n\
                    signOffset = match[9] === '-' ? 1 : -1,\n\
                    hourOffset = Number(match[10] || 0),\n\
                    minuteOffset = Number(match[11] || 0),\n\
                    result;\n\
                if (\n\
                    hour < (\n\
                        minute > 0 || second > 0 || millisecond > 0 ?\n\
                        24 : 25\n\
                    ) &&\n\
                    minute < 60 && second < 60 && millisecond < 1000 &&\n\
                    month > -1 && month < 12 && hourOffset < 24 &&\n\
                    minuteOffset < 60 && // detect invalid offsets\n\
                    day > -1 &&\n\
                    day < (\n\
                        dayFromMonth(year, month + 1) -\n\
                        dayFromMonth(year, month)\n\
                    )\n\
                ) {\n\
                    result = (\n\
                        (dayFromMonth(year, month) + day) * 24 +\n\
                        hour +\n\
                        hourOffset * signOffset\n\
                    ) * 60;\n\
                    result = (\n\
                        (result + minute + minuteOffset * signOffset) * 60 +\n\
                        second\n\
                    ) * 1000 + millisecond;\n\
                    if (isLocalTime) {\n\
                        result = toUTC(result);\n\
                    }\n\
                    if (-8.64e15 <= result && result <= 8.64e15) {\n\
                        return result;\n\
                    }\n\
                }\n\
                return NaN;\n\
            }\n\
            return NativeDate.parse.apply(this, arguments);\n\
        };\n\
\n\
        return DateShim;\n\
    }(Date));\n\
    /*global Date: false */\n\
}\n\
\n\
// ES5 15.9.4.4\n\
// http://es5.github.com/#x15.9.4.4\n\
if (!Date.now) {\n\
    Date.now = function now() {\n\
        return new Date().getTime();\n\
    };\n\
}\n\
\n\
//\n\
// Number\n\
// ======\n\
//\n\
\n\
// ES5.1 15.7.4.5\n\
// http://es5.github.com/#x15.7.4.5\n\
var hasToFixedBugs = NumberPrototype.toFixed && (\n\
  (0.00008).toFixed(3) !== '0.000' ||\n\
  (0.9).toFixed(0) !== '1' ||\n\
  (1.255).toFixed(2) !== '1.25' ||\n\
  (1000000000000000128).toFixed(0) !== '1000000000000000128'\n\
);\n\
\n\
var toFixedHelpers = {\n\
  base: 1e7,\n\
  size: 6,\n\
  data: [0, 0, 0, 0, 0, 0],\n\
  multiply: function multiply(n, c) {\n\
      var i = -1;\n\
      var c2 = c;\n\
      while (++i < toFixedHelpers.size) {\n\
          c2 += n * toFixedHelpers.data[i];\n\
          toFixedHelpers.data[i] = c2 % toFixedHelpers.base;\n\
          c2 = Math.floor(c2 / toFixedHelpers.base);\n\
      }\n\
  },\n\
  divide: function divide(n) {\n\
      var i = toFixedHelpers.size, c = 0;\n\
      while (--i >= 0) {\n\
          c += toFixedHelpers.data[i];\n\
          toFixedHelpers.data[i] = Math.floor(c / n);\n\
          c = (c % n) * toFixedHelpers.base;\n\
      }\n\
  },\n\
  numToString: function numToString() {\n\
      var i = toFixedHelpers.size;\n\
      var s = '';\n\
      while (--i >= 0) {\n\
          if (s !== '' || i === 0 || toFixedHelpers.data[i] !== 0) {\n\
              var t = String(toFixedHelpers.data[i]);\n\
              if (s === '') {\n\
                  s = t;\n\
              } else {\n\
                  s += '0000000'.slice(0, 7 - t.length) + t;\n\
              }\n\
          }\n\
      }\n\
      return s;\n\
  },\n\
  pow: function pow(x, n, acc) {\n\
      return (n === 0 ? acc : (n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc)));\n\
  },\n\
  log: function log(x) {\n\
      var n = 0;\n\
      var x2 = x;\n\
      while (x2 >= 4096) {\n\
          n += 12;\n\
          x2 /= 4096;\n\
      }\n\
      while (x2 >= 2) {\n\
          n += 1;\n\
          x2 /= 2;\n\
      }\n\
      return n;\n\
  }\n\
};\n\
\n\
defineProperties(NumberPrototype, {\n\
    toFixed: function toFixed(fractionDigits) {\n\
        var f, x, s, m, e, z, j, k;\n\
\n\
        // Test for NaN and round fractionDigits down\n\
        f = Number(fractionDigits);\n\
        f = f !== f ? 0 : Math.floor(f);\n\
\n\
        if (f < 0 || f > 20) {\n\
            throw new RangeError('Number.toFixed called with invalid number of decimals');\n\
        }\n\
\n\
        x = Number(this);\n\
\n\
        // Test for NaN\n\
        if (x !== x) {\n\
            return 'NaN';\n\
        }\n\
\n\
        // If it is too big or small, return the string value of the number\n\
        if (x <= -1e21 || x >= 1e21) {\n\
            return String(x);\n\
        }\n\
\n\
        s = '';\n\
\n\
        if (x < 0) {\n\
            s = '-';\n\
            x = -x;\n\
        }\n\
\n\
        m = '0';\n\
\n\
        if (x > 1e-21) {\n\
            // 1e-21 < x < 1e21\n\
            // -70 < log2(x) < 70\n\
            e = toFixedHelpers.log(x * toFixedHelpers.pow(2, 69, 1)) - 69;\n\
            z = (e < 0 ? x * toFixedHelpers.pow(2, -e, 1) : x / toFixedHelpers.pow(2, e, 1));\n\
            z *= 0x10000000000000; // Math.pow(2, 52);\n\
            e = 52 - e;\n\
\n\
            // -18 < e < 122\n\
            // x = z / 2 ^ e\n\
            if (e > 0) {\n\
                toFixedHelpers.multiply(0, z);\n\
                j = f;\n\
\n\
                while (j >= 7) {\n\
                    toFixedHelpers.multiply(1e7, 0);\n\
                    j -= 7;\n\
                }\n\
\n\
                toFixedHelpers.multiply(toFixedHelpers.pow(10, j, 1), 0);\n\
                j = e - 1;\n\
\n\
                while (j >= 23) {\n\
                    toFixedHelpers.divide(1 << 23);\n\
                    j -= 23;\n\
                }\n\
\n\
                toFixedHelpers.divide(1 << j);\n\
                toFixedHelpers.multiply(1, 1);\n\
                toFixedHelpers.divide(2);\n\
                m = toFixedHelpers.numToString();\n\
            } else {\n\
                toFixedHelpers.multiply(0, z);\n\
                toFixedHelpers.multiply(1 << (-e), 0);\n\
                m = toFixedHelpers.numToString() + '0.00000000000000000000'.slice(2, 2 + f);\n\
            }\n\
        }\n\
\n\
        if (f > 0) {\n\
            k = m.length;\n\
\n\
            if (k <= f) {\n\
                m = s + '0.0000000000000000000'.slice(0, f - k + 2) + m;\n\
            } else {\n\
                m = s + m.slice(0, k - f) + '.' + m.slice(k - f);\n\
            }\n\
        } else {\n\
            m = s + m;\n\
        }\n\
\n\
        return m;\n\
    }\n\
}, hasToFixedBugs);\n\
\n\
//\n\
// String\n\
// ======\n\
//\n\
\n\
// ES5 15.5.4.14\n\
// http://es5.github.com/#x15.5.4.14\n\
\n\
// [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]\n\
// Many browsers do not split properly with regular expressions or they\n\
// do not perform the split correctly under obscure conditions.\n\
// See http://blog.stevenlevithan.com/archives/cross-browser-split\n\
// I've tested in many browsers and this seems to cover the deviant ones:\n\
//    'ab'.split(/(?:ab)*/) should be [\"\", \"\"], not [\"\"]\n\
//    '.'.split(/(.?)(.?)/) should be [\"\", \".\", \"\", \"\"], not [\"\", \"\"]\n\
//    'tesst'.split(/(s)*/) should be [\"t\", undefined, \"e\", \"s\", \"t\"], not\n\
//       [undefined, \"t\", undefined, \"e\", ...]\n\
//    ''.split(/.?/) should be [], not [\"\"]\n\
//    '.'.split(/()()/) should be [\".\"], not [\"\", \"\", \".\"]\n\
\n\
var string_split = StringPrototype.split;\n\
if (\n\
    'ab'.split(/(?:ab)*/).length !== 2 ||\n\
    '.'.split(/(.?)(.?)/).length !== 4 ||\n\
    'tesst'.split(/(s)*/)[1] === 't' ||\n\
    'test'.split(/(?:)/, -1).length !== 4 ||\n\
    ''.split(/.?/).length ||\n\
    '.'.split(/()()/).length > 1\n\
) {\n\
    (function () {\n\
        var compliantExecNpcg = typeof (/()??/).exec('')[1] === 'undefined'; // NPCG: nonparticipating capturing group\n\
\n\
        StringPrototype.split = function (separator, limit) {\n\
            var string = this;\n\
            if (typeof separator === 'undefined' && limit === 0) {\n\
                return [];\n\
            }\n\
\n\
            // If `separator` is not a regex, use native split\n\
            if (!isRegex(separator)) {\n\
                return string_split.call(this, separator, limit);\n\
            }\n\
\n\
            var output = [];\n\
            var flags = (separator.ignoreCase ? 'i' : '') +\n\
                        (separator.multiline ? 'm' : '') +\n\
                        (separator.extended ? 'x' : '') + // Proposed for ES6\n\
                        (separator.sticky ? 'y' : ''), // Firefox 3+\n\
                lastLastIndex = 0,\n\
                // Make `global` and avoid `lastIndex` issues by working with a copy\n\
                separator2, match, lastIndex, lastLength;\n\
            var separatorCopy = new RegExp(separator.source, flags + 'g');\n\
            string += ''; // Type-convert\n\
            if (!compliantExecNpcg) {\n\
                // Doesn't need flags gy, but they don't hurt\n\
                separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\\\s)', flags);\n\
            }\n\
            /* Values for `limit`, per the spec:\n\
             * If undefined: 4294967295 // Math.pow(2, 32) - 1\n\
             * If 0, Infinity, or NaN: 0\n\
             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;\n\
             * If negative number: 4294967296 - Math.floor(Math.abs(limit))\n\
             * If other: Type-convert, then use the above rules\n\
             */\n\
            var splitLimit = typeof limit === 'undefined' ?\n\
                -1 >>> 0 : // Math.pow(2, 32) - 1\n\
                ES.ToUint32(limit);\n\
            match = separatorCopy.exec(string);\n\
            while (match) {\n\
                // `separatorCopy.lastIndex` is not reliable cross-browser\n\
                lastIndex = match.index + match[0].length;\n\
                if (lastIndex > lastLastIndex) {\n\
                    output.push(string.slice(lastLastIndex, match.index));\n\
                    // Fix browsers whose `exec` methods don't consistently return `undefined` for\n\
                    // nonparticipating capturing groups\n\
                    if (!compliantExecNpcg && match.length > 1) {\n\
                        /*eslint-disable no-loop-func */\n\
                        match[0].replace(separator2, function () {\n\
                            for (var i = 1; i < arguments.length - 2; i++) {\n\
                                if (typeof arguments[i] === 'undefined') {\n\
                                    match[i] = void 0;\n\
                                }\n\
                            }\n\
                        });\n\
                        /*eslint-enable no-loop-func */\n\
                    }\n\
                    if (match.length > 1 && match.index < string.length) {\n\
                        array_push.apply(output, match.slice(1));\n\
                    }\n\
                    lastLength = match[0].length;\n\
                    lastLastIndex = lastIndex;\n\
                    if (output.length >= splitLimit) {\n\
                        break;\n\
                    }\n\
                }\n\
                if (separatorCopy.lastIndex === match.index) {\n\
                    separatorCopy.lastIndex++; // Avoid an infinite loop\n\
                }\n\
                match = separatorCopy.exec(string);\n\
            }\n\
            if (lastLastIndex === string.length) {\n\
                if (lastLength || !separatorCopy.test('')) {\n\
                    output.push('');\n\
                }\n\
            } else {\n\
                output.push(string.slice(lastLastIndex));\n\
            }\n\
            return output.length > splitLimit ? output.slice(0, splitLimit) : output;\n\
        };\n\
    }());\n\
\n\
// [bugfix, chrome]\n\
// If separator is undefined, then the result array contains just one String,\n\
// which is the this value (converted to a String). If limit is not undefined,\n\
// then the output array is truncated so that it contains no more than limit\n\
// elements.\n\
// \"0\".split(undefined, 0) -> []\n\
} else if ('0'.split(void 0, 0).length) {\n\
    StringPrototype.split = function split(separator, limit) {\n\
        if (typeof separator === 'undefined' && limit === 0) { return []; }\n\
        return string_split.call(this, separator, limit);\n\
    };\n\
}\n\
\n\
var str_replace = StringPrototype.replace;\n\
var replaceReportsGroupsCorrectly = (function () {\n\
    var groups = [];\n\
    'x'.replace(/x(.)?/g, function (match, group) {\n\
        groups.push(group);\n\
    });\n\
    return groups.length === 1 && typeof groups[0] === 'undefined';\n\
}());\n\
\n\
if (!replaceReportsGroupsCorrectly) {\n\
    StringPrototype.replace = function replace(searchValue, replaceValue) {\n\
        var isFn = isCallable(replaceValue);\n\
        var hasCapturingGroups = isRegex(searchValue) && (/\\)[*?]/).test(searchValue.source);\n\
        if (!isFn || !hasCapturingGroups) {\n\
            return str_replace.call(this, searchValue, replaceValue);\n\
        } else {\n\
            var wrappedReplaceValue = function (match) {\n\
                var length = arguments.length;\n\
                var originalLastIndex = searchValue.lastIndex;\n\
                searchValue.lastIndex = 0;\n\
                var args = searchValue.exec(match) || [];\n\
                searchValue.lastIndex = originalLastIndex;\n\
                args.push(arguments[length - 2], arguments[length - 1]);\n\
                return replaceValue.apply(this, args);\n\
            };\n\
            return str_replace.call(this, searchValue, wrappedReplaceValue);\n\
        }\n\
    };\n\
}\n\
\n\
// ECMA-262, 3rd B.2.3\n\
// Not an ECMAScript standard, although ECMAScript 3rd Edition has a\n\
// non-normative section suggesting uniform semantics and it should be\n\
// normalized across all browsers\n\
// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE\n\
var string_substr = StringPrototype.substr;\n\
var hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';\n\
defineProperties(StringPrototype, {\n\
    substr: function substr(start, length) {\n\
        var normalizedStart = start;\n\
        if (start < 0) {\n\
            normalizedStart = Math.max(this.length + start, 0);\n\
        }\n\
        return string_substr.call(this, normalizedStart, length);\n\
    }\n\
}, hasNegativeSubstrBug);\n\
\n\
// ES5 15.5.4.20\n\
// whitespace from: http://es5.github.io/#x15.5.4.20\n\
var ws = '\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003' +\n\
    '\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028' +\n\
    '\\u2029\\uFEFF';\n\
var zeroWidth = '\\u200b';\n\
var wsRegexChars = '[' + ws + ']';\n\
var trimBeginRegexp = new RegExp('^' + wsRegexChars + wsRegexChars + '*');\n\
var trimEndRegexp = new RegExp(wsRegexChars + wsRegexChars + '*$');\n\
var hasTrimWhitespaceBug = StringPrototype.trim && (ws.trim() || !zeroWidth.trim());\n\
defineProperties(StringPrototype, {\n\
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript\n\
    // http://perfectionkills.com/whitespace-deviations/\n\
    trim: function trim() {\n\
        if (typeof this === 'undefined' || this === null) {\n\
            throw new TypeError(\"can't convert \" + this + ' to object');\n\
        }\n\
        return String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');\n\
    }\n\
}, hasTrimWhitespaceBug);\n\
\n\
// ES-5 15.1.2.2\n\
if (parseInt(ws + '08') !== 8 || parseInt(ws + '0x16') !== 22) {\n\
    /*global parseInt: true */\n\
    parseInt = (function (origParseInt) {\n\
        var hexRegex = /^0[xX]/;\n\
        return function parseInt(str, radix) {\n\
            var string = String(str).trim();\n\
            var defaultedRadix = Number(radix) || (hexRegex.test(string) ? 16 : 10);\n\
            return origParseInt(string, defaultedRadix);\n\
        };\n\
    }(parseInt));\n\
}\n\
\n\
}));\n\
\n\
//# sourceURL=components/es-shims/es5-shim/v4.1.5/es5-shim.js"
));

require.modules["es-shims-es5-shim"] = require.modules["es-shims~es5-shim@v4.1.5"];
require.modules["es-shims~es5-shim"] = require.modules["es-shims~es5-shim@v4.1.5"];
require.modules["es5-shim"] = require.modules["es-shims~es5-shim@v4.1.5"];


require.register("es-shims~es6-shim@0.31.3", Function("exports, module",
" /*!\n\
  * https://github.com/paulmillr/es6-shim\n\
  * @license es6-shim Copyright 2013-2015 by Paul Miller (http://paulmillr.com)\n\
  *   and contributors,  MIT License\n\
  * es6-shim: v0.27.1\n\
  * see https://github.com/paulmillr/es6-shim/blob/0.27.1/LICENSE\n\
  * Details and documentation:\n\
  * https://github.com/paulmillr/es6-shim/\n\
  */\n\
\n\
// UMD (Universal Module Definition)\n\
// see https://github.com/umdjs/umd/blob/master/returnExports.js\n\
(function (root, factory) {\n\
  /*global define, module, exports */\n\
  if (typeof define === 'function' && define.amd) {\n\
    // AMD. Register as an anonymous module.\n\
    define(factory);\n\
  } else if (typeof exports === 'object') {\n\
    // Node. Does not work with strict CommonJS, but\n\
    // only CommonJS-like enviroments that support module.exports,\n\
    // like Node.\n\
    module.exports = factory();\n\
  } else {\n\
    // Browser globals (root is window)\n\
    root.returnExports = factory();\n\
  }\n\
}(this, function () {\n\
  'use strict';\n\
\n\
  var _apply = Function.call.bind(Function.apply);\n\
  var _call = Function.call.bind(Function.call);\n\
\n\
  var not = function notThunker(func) {\n\
    return function notThunk() { return !_apply(func, this, arguments); };\n\
  };\n\
  var throwsError = function (func) {\n\
    try {\n\
      func();\n\
      return false;\n\
    } catch (e) {\n\
      return true;\n\
    }\n\
  };\n\
  var valueOrFalseIfThrows = function valueOrFalseIfThrows(func) {\n\
    try {\n\
      return func();\n\
    } catch (e) {\n\
      return false;\n\
    }\n\
  };\n\
\n\
  var isCallableWithoutNew = not(throwsError);\n\
  var arePropertyDescriptorsSupported = function () {\n\
    // if Object.defineProperty exists but throws, it's IE 8\n\
    return !throwsError(function () { Object.defineProperty({}, 'x', {}); });\n\
  };\n\
  var supportsDescriptors = !!Object.defineProperty && arePropertyDescriptorsSupported();\n\
\n\
  var _forEach = Function.call.bind(Array.prototype.forEach);\n\
  var _map = Function.call.bind(Array.prototype.map);\n\
  var _reduce = Function.call.bind(Array.prototype.reduce);\n\
  var _filter = Function.call.bind(Array.prototype.filter);\n\
  var _every = Function.call.bind(Array.prototype.every);\n\
\n\
  var defineProperty = function (object, name, value, force) {\n\
    if (!force && name in object) { return; }\n\
    if (supportsDescriptors) {\n\
      Object.defineProperty(object, name, {\n\
        configurable: true,\n\
        enumerable: false,\n\
        writable: true,\n\
        value: value\n\
      });\n\
    } else {\n\
      object[name] = value;\n\
    }\n\
  };\n\
\n\
  // Define configurable, writable and non-enumerable props\n\
  // if they don’t exist.\n\
  var defineProperties = function (object, map) {\n\
    _forEach(Object.keys(map), function (name) {\n\
      var method = map[name];\n\
      defineProperty(object, name, method, false);\n\
    });\n\
  };\n\
\n\
  // Simple shim for Object.create on ES3 browsers\n\
  // (unlike real shim, no attempt to support `prototype === null`)\n\
  var create = Object.create || function (prototype, properties) {\n\
    var Prototype = function Prototype() {};\n\
    Prototype.prototype = prototype;\n\
    var object = new Prototype();\n\
    if (typeof properties !== 'undefined') {\n\
      defineProperties(object, properties);\n\
    }\n\
    return object;\n\
  };\n\
\n\
  var supportsSubclassing = function (C, f) {\n\
    if (!Object.setPrototypeOf) { return false; /* skip test on IE < 11 */ }\n\
    return valueOrFalseIfThrows(function () {\n\
      var Sub = function Subclass(arg) {\n\
        var o = new C(arg);\n\
        Object.setPrototypeOf(o, Subclass.prototype);\n\
        return o;\n\
      };\n\
      Sub.prototype = create(C.prototype, {\n\
        constructor: { value: C }\n\
      });\n\
      return f(Sub);\n\
    });\n\
  };\n\
\n\
  var startsWithRejectsRegex = function () {\n\
    return String.prototype.startsWith && throwsError(function () {\n\
      /* throws if spec-compliant */\n\
      '/a/'.startsWith(/a/);\n\
    });\n\
  };\n\
  var startsWithHandlesInfinity = (function () {\n\
    return String.prototype.startsWith && 'abc'.startsWith('a', Infinity) === false;\n\
  }());\n\
\n\
  /*jshint evil: true */\n\
  var getGlobal = new Function('return this;');\n\
  /*jshint evil: false */\n\
\n\
  var globals = getGlobal();\n\
  var globalIsFinite = globals.isFinite;\n\
  var hasStrictMode = (function () { return this === null; }.call(null));\n\
  var startsWithIsCompliant = startsWithRejectsRegex() && startsWithHandlesInfinity;\n\
  var _indexOf = Function.call.bind(String.prototype.indexOf);\n\
  var _toString = Function.call.bind(Object.prototype.toString);\n\
  var _concat = Function.call.bind(Array.prototype.concat);\n\
  var _strSlice = Function.call.bind(String.prototype.slice);\n\
  var _push = Function.call.bind(Array.prototype.push);\n\
  var _pushApply = Function.apply.bind(Array.prototype.push);\n\
  var _shift = Function.call.bind(Array.prototype.shift);\n\
  var _max = Math.max;\n\
  var _min = Math.min;\n\
  var _floor = Math.floor;\n\
  var _abs = Math.abs;\n\
  var _log = Math.log;\n\
  var _hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);\n\
  var ArrayIterator; // make our implementation private\n\
  var noop = function () {};\n\
\n\
  var Symbol = globals.Symbol || {};\n\
  var symbolSpecies = Symbol.species || '@@species';\n\
  var Type = {\n\
    object: function (x) { return x !== null && typeof x === 'object'; },\n\
    string: function (x) { return _toString(x) === '[object String]'; },\n\
    regex: function (x) { return _toString(x) === '[object RegExp]'; },\n\
    symbol: function (x) {\n\
      return typeof globals.Symbol === 'function' && typeof x === 'symbol';\n\
    }\n\
  };\n\
\n\
  var numberIsNaN = Number.isNaN || function isNaN(value) {\n\
    // NaN !== NaN, but they are identical.\n\
    // NaNs are the only non-reflexive value, i.e., if x !== x,\n\
    // then x is NaN.\n\
    // isNaN is broken: it converts its argument to number, so\n\
    // isNaN('foo') => true\n\
    return value !== value;\n\
  };\n\
  var numberIsFinite = Number.isFinite || function isFinite(value) {\n\
    return typeof value === 'number' && globalIsFinite(value);\n\
  };\n\
\n\
  var Value = {\n\
    getter: function (object, name, getter) {\n\
      if (!supportsDescriptors) {\n\
        throw new TypeError('getters require true ES5 support');\n\
      }\n\
      Object.defineProperty(object, name, {\n\
        configurable: true,\n\
        enumerable: false,\n\
        get: getter\n\
      });\n\
    },\n\
    proxy: function (originalObject, key, targetObject) {\n\
      if (!supportsDescriptors) {\n\
        throw new TypeError('getters require true ES5 support');\n\
      }\n\
      var originalDescriptor = Object.getOwnPropertyDescriptor(originalObject, key);\n\
      Object.defineProperty(targetObject, key, {\n\
        configurable: originalDescriptor.configurable,\n\
        enumerable: originalDescriptor.enumerable,\n\
        get: function getKey() { return originalObject[key]; },\n\
        set: function setKey(value) { originalObject[key] = value; }\n\
      });\n\
    },\n\
    redefine: function (object, property, newValue) {\n\
      if (supportsDescriptors) {\n\
        var descriptor = Object.getOwnPropertyDescriptor(object, property);\n\
        descriptor.value = newValue;\n\
        Object.defineProperty(object, property, descriptor);\n\
      } else {\n\
        object[property] = newValue;\n\
      }\n\
    },\n\
    preserveToString: function (target, source) {\n\
      defineProperty(target, 'toString', source.toString.bind(source), true);\n\
    }\n\
  };\n\
\n\
  var overrideNative = function overrideNative(object, property, replacement) {\n\
    var original = object[property];\n\
    defineProperty(object, property, replacement, true);\n\
    Value.preserveToString(object[property], original);\n\
  };\n\
\n\
  // This is a private name in the es6 spec, equal to '[Symbol.iterator]'\n\
  // we're going to use an arbitrary _-prefixed name to make our shims\n\
  // work properly with each other, even though we don't have full Iterator\n\
  // support.  That is, `Array.from(map.keys())` will work, but we don't\n\
  // pretend to export a \"real\" Iterator interface.\n\
  var $iterator$ = Type.symbol(Symbol.iterator) ? Symbol.iterator : '_es6-shim iterator_';\n\
  // Firefox ships a partial implementation using the name @@iterator.\n\
  // https://bugzilla.mozilla.org/show_bug.cgi?id=907077#c14\n\
  // So use that name if we detect it.\n\
  if (globals.Set && typeof new globals.Set()['@@iterator'] === 'function') {\n\
    $iterator$ = '@@iterator';\n\
  }\n\
  var addIterator = function (prototype, impl) {\n\
    var implementation = impl || function iterator() { return this; };\n\
    var o = {};\n\
    o[$iterator$] = implementation;\n\
    defineProperties(prototype, o);\n\
    if (!prototype[$iterator$] && Type.symbol($iterator$)) {\n\
      // implementations are buggy when $iterator$ is a Symbol\n\
      prototype[$iterator$] = implementation;\n\
    }\n\
  };\n\
\n\
  // taken directly from https://github.com/ljharb/is-arguments/blob/master/index.js\n\
  // can be replaced with require('is-arguments') if we ever use a build process instead\n\
  var isArguments = function isArguments(value) {\n\
    var str = _toString(value);\n\
    var result = str === '[object Arguments]';\n\
    if (!result) {\n\
      result = str !== '[object Array]' &&\n\
        value !== null &&\n\
        typeof value === 'object' &&\n\
        typeof value.length === 'number' &&\n\
        value.length >= 0 &&\n\
        _toString(value.callee) === '[object Function]';\n\
    }\n\
    return result;\n\
  };\n\
\n\
  var ES = {\n\
    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-call-f-v-args\n\
    Call: function Call(F, V) {\n\
      var args = arguments.length > 2 ? arguments[2] : [];\n\
      if (!ES.IsCallable(F)) {\n\
        throw new TypeError(F + ' is not a function');\n\
      }\n\
      return _apply(F, V, args);\n\
    },\n\
\n\
    RequireObjectCoercible: function (x, optMessage) {\n\
      /* jshint eqnull:true */\n\
      if (x == null) {\n\
        throw new TypeError(optMessage || 'Cannot call method on ' + x);\n\
      }\n\
    },\n\
\n\
    TypeIsObject: function (x) {\n\
      /* jshint eqnull:true */\n\
      // this is expensive when it returns false; use this function\n\
      // when you expect it to return true in the common case.\n\
      return x != null && Object(x) === x;\n\
    },\n\
\n\
    ToObject: function (o, optMessage) {\n\
      ES.RequireObjectCoercible(o, optMessage);\n\
      return Object(o);\n\
    },\n\
\n\
    IsCallable: function (x) {\n\
      // some versions of IE say that typeof /abc/ === 'function'\n\
      return typeof x === 'function' && _toString(x) === '[object Function]';\n\
    },\n\
\n\
    ToInt32: function (x) {\n\
      return ES.ToNumber(x) >> 0;\n\
    },\n\
\n\
    ToUint32: function (x) {\n\
      return ES.ToNumber(x) >>> 0;\n\
    },\n\
\n\
    ToNumber: function (value) {\n\
      if (_toString(value) === '[object Symbol]') {\n\
        throw new TypeError('Cannot convert a Symbol value to a number');\n\
      }\n\
      return +value;\n\
    },\n\
\n\
    ToInteger: function (value) {\n\
      var number = ES.ToNumber(value);\n\
      if (numberIsNaN(number)) { return 0; }\n\
      if (number === 0 || !numberIsFinite(number)) { return number; }\n\
      return (number > 0 ? 1 : -1) * _floor(_abs(number));\n\
    },\n\
\n\
    ToLength: function (value) {\n\
      var len = ES.ToInteger(value);\n\
      if (len <= 0) { return 0; } // includes converting -0 to +0\n\
      if (len > Number.MAX_SAFE_INTEGER) { return Number.MAX_SAFE_INTEGER; }\n\
      return len;\n\
    },\n\
\n\
    SameValue: function (a, b) {\n\
      if (a === b) {\n\
        // 0 === -0, but they are not identical.\n\
        if (a === 0) { return 1 / a === 1 / b; }\n\
        return true;\n\
      }\n\
      return numberIsNaN(a) && numberIsNaN(b);\n\
    },\n\
\n\
    SameValueZero: function (a, b) {\n\
      // same as SameValue except for SameValueZero(+0, -0) == true\n\
      return (a === b) || (numberIsNaN(a) && numberIsNaN(b));\n\
    },\n\
\n\
    IsIterable: function (o) {\n\
      return ES.TypeIsObject(o) && (typeof o[$iterator$] !== 'undefined' || isArguments(o));\n\
    },\n\
\n\
    GetIterator: function (o) {\n\
      if (isArguments(o)) {\n\
        // special case support for `arguments`\n\
        return new ArrayIterator(o, 'value');\n\
      }\n\
      var itFn = o[$iterator$];\n\
      if (!ES.IsCallable(itFn)) {\n\
        throw new TypeError('value is not an iterable');\n\
      }\n\
      var it = _call(itFn, o);\n\
      if (!ES.TypeIsObject(it)) {\n\
        throw new TypeError('bad iterator');\n\
      }\n\
      return it;\n\
    },\n\
\n\
    IteratorNext: function (it) {\n\
      var result = arguments.length > 1 ? it.next(arguments[1]) : it.next();\n\
      if (!ES.TypeIsObject(result)) {\n\
        throw new TypeError('bad iterator');\n\
      }\n\
      return result;\n\
    },\n\
\n\
    Construct: function (C, args) {\n\
      // CreateFromConstructor\n\
      var obj;\n\
      if (ES.IsCallable(C[symbolSpecies])) {\n\
        obj = C[symbolSpecies]();\n\
      } else {\n\
        // OrdinaryCreateFromConstructor\n\
        obj = create(C.prototype || null);\n\
      }\n\
      // Mark that we've used the es6 construct path\n\
      // (see emulateES6construct)\n\
      defineProperties(obj, { _es6construct: true });\n\
      // Call the constructor.\n\
      var result = ES.Call(C, obj, args);\n\
      return ES.TypeIsObject(result) ? result : obj;\n\
    },\n\
\n\
    CreateHTML: function (string, tag, attribute, value) {\n\
      var S = String(string);\n\
      var p1 = '<' + tag;\n\
      if (attribute !== '') {\n\
        var V = String(value);\n\
        var escapedV = V.replace(/\"/g, '&quot;');\n\
        p1 += ' ' + attribute + '=\"' + escapedV + '\"';\n\
      }\n\
      var p2 = p1 + '>';\n\
      var p3 = p2 + S;\n\
      return p3 + '</' + tag + '>';\n\
    }\n\
  };\n\
\n\
  var emulateES6construct = function (o) {\n\
    if (!ES.TypeIsObject(o)) { throw new TypeError('bad object'); }\n\
    var object = o;\n\
    // es5 approximation to es6 subclass semantics: in es6, 'new Foo'\n\
    // would invoke Foo.@@species to allocation/initialize the new object.\n\
    // In es5 we just get the plain object.  So if we detect an\n\
    // uninitialized object, invoke o.constructor.@@species\n\
    if (!object._es6construct) {\n\
      if (object.constructor && ES.IsCallable(object.constructor[symbolSpecies])) {\n\
        object = object.constructor[symbolSpecies](object);\n\
      }\n\
      defineProperties(object, { _es6construct: true });\n\
    }\n\
    return object;\n\
  };\n\
\n\
  // Firefox 31 reports this function's length as 0\n\
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1062484\n\
  if (String.fromCodePoint && String.fromCodePoint.length !== 1) {\n\
    var originalFromCodePoint = String.fromCodePoint;\n\
    overrideNative(String, 'fromCodePoint', function fromCodePoint(codePoints) { return _apply(originalFromCodePoint, this, arguments); });\n\
  }\n\
\n\
  var StringShims = {\n\
    fromCodePoint: function fromCodePoint(codePoints) {\n\
      var result = [];\n\
      var next;\n\
      for (var i = 0, length = arguments.length; i < length; i++) {\n\
        next = Number(arguments[i]);\n\
        if (!ES.SameValue(next, ES.ToInteger(next)) || next < 0 || next > 0x10FFFF) {\n\
          throw new RangeError('Invalid code point ' + next);\n\
        }\n\
\n\
        if (next < 0x10000) {\n\
          _push(result, String.fromCharCode(next));\n\
        } else {\n\
          next -= 0x10000;\n\
          _push(result, String.fromCharCode((next >> 10) + 0xD800));\n\
          _push(result, String.fromCharCode((next % 0x400) + 0xDC00));\n\
        }\n\
      }\n\
      return result.join('');\n\
    },\n\
\n\
    raw: function raw(callSite) {\n\
      var cooked = ES.ToObject(callSite, 'bad callSite');\n\
      var rawString = ES.ToObject(cooked.raw, 'bad raw value');\n\
      var len = rawString.length;\n\
      var literalsegments = ES.ToLength(len);\n\
      if (literalsegments <= 0) {\n\
        return '';\n\
      }\n\
\n\
      var stringElements = [];\n\
      var nextIndex = 0;\n\
      var nextKey, next, nextSeg, nextSub;\n\
      while (nextIndex < literalsegments) {\n\
        nextKey = String(nextIndex);\n\
        nextSeg = String(rawString[nextKey]);\n\
        _push(stringElements, nextSeg);\n\
        if (nextIndex + 1 >= literalsegments) {\n\
          break;\n\
        }\n\
        next = nextIndex + 1 < arguments.length ? arguments[nextIndex + 1] : '';\n\
        nextSub = String(next);\n\
        _push(stringElements, nextSub);\n\
        nextIndex++;\n\
      }\n\
      return stringElements.join('');\n\
    }\n\
  };\n\
  defineProperties(String, StringShims);\n\
  if (String.raw({ raw: { 0: 'x', 1: 'y', length: 2 } }) !== 'xy') {\n\
    // IE 11 TP has a broken String.raw implementation\n\
    overrideNative(String, 'raw', StringShims.raw);\n\
  }\n\
\n\
  // Fast repeat, uses the `Exponentiation by squaring` algorithm.\n\
  // Perf: http://jsperf.com/string-repeat2/2\n\
  var stringRepeat = function repeat(s, times) {\n\
    if (times < 1) { return ''; }\n\
    if (times % 2) { return repeat(s, times - 1) + s; }\n\
    var half = repeat(s, times / 2);\n\
    return half + half;\n\
  };\n\
  var stringMaxLength = Infinity;\n\
\n\
  var StringPrototypeShims = {\n\
    repeat: function repeat(times) {\n\
      ES.RequireObjectCoercible(this);\n\
      var thisStr = String(this);\n\
      var numTimes = ES.ToInteger(times);\n\
      if (numTimes < 0 || numTimes >= stringMaxLength) {\n\
        throw new RangeError('repeat count must be less than infinity and not overflow maximum string size');\n\
      }\n\
      return stringRepeat(thisStr, numTimes);\n\
    },\n\
\n\
    startsWith: function startsWith(searchString) {\n\
      ES.RequireObjectCoercible(this);\n\
      var thisStr = String(this);\n\
      if (Type.regex(searchString)) {\n\
        throw new TypeError('Cannot call method \"startsWith\" with a regex');\n\
      }\n\
      var searchStr = String(searchString);\n\
      var startArg = arguments.length > 1 ? arguments[1] : void 0;\n\
      var start = _max(ES.ToInteger(startArg), 0);\n\
      return _strSlice(thisStr, start, start + searchStr.length) === searchStr;\n\
    },\n\
\n\
    endsWith: function endsWith(searchString) {\n\
      ES.RequireObjectCoercible(this);\n\
      var thisStr = String(this);\n\
      if (Type.regex(searchString)) {\n\
        throw new TypeError('Cannot call method \"endsWith\" with a regex');\n\
      }\n\
      var searchStr = String(searchString);\n\
      var thisLen = thisStr.length;\n\
      var posArg = arguments.length > 1 ? arguments[1] : void 0;\n\
      var pos = typeof posArg === 'undefined' ? thisLen : ES.ToInteger(posArg);\n\
      var end = _min(_max(pos, 0), thisLen);\n\
      return _strSlice(thisStr, end - searchStr.length, end) === searchStr;\n\
    },\n\
\n\
    includes: function includes(searchString) {\n\
      var position = arguments.length > 1 ? arguments[1] : void 0;\n\
      // Somehow this trick makes method 100% compat with the spec.\n\
      return _indexOf(this, searchString, position) !== -1;\n\
    },\n\
\n\
    codePointAt: function codePointAt(pos) {\n\
      ES.RequireObjectCoercible(this);\n\
      var thisStr = String(this);\n\
      var position = ES.ToInteger(pos);\n\
      var length = thisStr.length;\n\
      if (position >= 0 && position < length) {\n\
        var first = thisStr.charCodeAt(position);\n\
        var isEnd = (position + 1 === length);\n\
        if (first < 0xD800 || first > 0xDBFF || isEnd) { return first; }\n\
        var second = thisStr.charCodeAt(position + 1);\n\
        if (second < 0xDC00 || second > 0xDFFF) { return first; }\n\
        return ((first - 0xD800) * 1024) + (second - 0xDC00) + 0x10000;\n\
      }\n\
    }\n\
  };\n\
  defineProperties(String.prototype, StringPrototypeShims);\n\
\n\
  if ('a'.includes('a', Infinity) !== false) {\n\
    overrideNative(String.prototype, 'includes', StringPrototypeShims.includes);\n\
  }\n\
\n\
  var hasStringTrimBug = '\\u0085'.trim().length !== 1;\n\
  if (hasStringTrimBug) {\n\
    delete String.prototype.trim;\n\
    // whitespace from: http://es5.github.io/#x15.5.4.20\n\
    // implementation from https://github.com/es-shims/es5-shim/blob/v3.4.0/es5-shim.js#L1304-L1324\n\
    var ws = [\n\
      '\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003',\n\
      '\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028',\n\
      '\\u2029\\uFEFF'\n\
    ].join('');\n\
    var trimRegexp = new RegExp('(^[' + ws + ']+)|([' + ws + ']+$)', 'g');\n\
    defineProperties(String.prototype, {\n\
      trim: function trim() {\n\
        if (typeof this === 'undefined' || this === null) {\n\
          throw new TypeError(\"can't convert \" + this + ' to object');\n\
        }\n\
        return String(this).replace(trimRegexp, '');\n\
      }\n\
    });\n\
  }\n\
\n\
  // see https://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype-@@iterator\n\
  var StringIterator = function (s) {\n\
    ES.RequireObjectCoercible(s);\n\
    this._s = String(s);\n\
    this._i = 0;\n\
  };\n\
  StringIterator.prototype.next = function () {\n\
    var s = this._s, i = this._i;\n\
    if (typeof s === 'undefined' || i >= s.length) {\n\
      this._s = void 0;\n\
      return { value: void 0, done: true };\n\
    }\n\
    var first = s.charCodeAt(i), second, len;\n\
    if (first < 0xD800 || first > 0xDBFF || (i + 1) === s.length) {\n\
      len = 1;\n\
    } else {\n\
      second = s.charCodeAt(i + 1);\n\
      len = (second < 0xDC00 || second > 0xDFFF) ? 1 : 2;\n\
    }\n\
    this._i = i + len;\n\
    return { value: s.substr(i, len), done: false };\n\
  };\n\
  addIterator(StringIterator.prototype);\n\
  addIterator(String.prototype, function () {\n\
    return new StringIterator(this);\n\
  });\n\
\n\
  if (!startsWithIsCompliant) {\n\
    // Firefox (< 37?) and IE 11 TP have a noncompliant startsWith implementation\n\
    overrideNative(String.prototype, 'startsWith', StringPrototypeShims.startsWith);\n\
    overrideNative(String.prototype, 'endsWith', StringPrototypeShims.endsWith);\n\
  }\n\
\n\
  var ArrayShims = {\n\
    from: function from(iterable) {\n\
      var mapFn = arguments.length > 1 ? arguments[1] : void 0;\n\
\n\
      var list = ES.ToObject(iterable, 'bad iterable');\n\
      if (typeof mapFn !== 'undefined' && !ES.IsCallable(mapFn)) {\n\
        throw new TypeError('Array.from: when provided, the second argument must be a function');\n\
      }\n\
\n\
      var hasThisArg = arguments.length > 2;\n\
      var thisArg = hasThisArg ? arguments[2] : void 0;\n\
\n\
      var usingIterator = ES.IsIterable(list);\n\
      // does the spec really mean that Arrays should use ArrayIterator?\n\
      // https://bugs.ecmascript.org/show_bug.cgi?id=2416\n\
      //if (Array.isArray(list)) { usingIterator=false; }\n\
\n\
      var length;\n\
      var result, i, value;\n\
      if (usingIterator) {\n\
        i = 0;\n\
        result = ES.IsCallable(this) ? Object(new this()) : [];\n\
        var it = usingIterator ? ES.GetIterator(list) : null;\n\
        var iterationValue;\n\
\n\
        do {\n\
          iterationValue = ES.IteratorNext(it);\n\
          if (!iterationValue.done) {\n\
            value = iterationValue.value;\n\
            if (mapFn) {\n\
              result[i] = hasThisArg ? _call(mapFn, thisArg, value, i) : mapFn(value, i);\n\
            } else {\n\
              result[i] = value;\n\
            }\n\
            i += 1;\n\
          }\n\
        } while (!iterationValue.done);\n\
        length = i;\n\
      } else {\n\
        length = ES.ToLength(list.length);\n\
        result = ES.IsCallable(this) ? Object(new this(length)) : new Array(length);\n\
        for (i = 0; i < length; ++i) {\n\
          value = list[i];\n\
          if (mapFn) {\n\
            result[i] = hasThisArg ? _call(mapFn, thisArg, value, i) : mapFn(value, i);\n\
          } else {\n\
            result[i] = value;\n\
          }\n\
        }\n\
      }\n\
\n\
      result.length = length;\n\
      return result;\n\
    },\n\
\n\
    of: function of() {\n\
      return _call(Array.from, this, arguments);\n\
    }\n\
  };\n\
  defineProperties(Array, ArrayShims);\n\
\n\
  // Given an argument x, it will return an IteratorResult object,\n\
  // with value set to x and done to false.\n\
  // Given no arguments, it will return an iterator completion object.\n\
  var iteratorResult = function (x) {\n\
    return { value: x, done: arguments.length === 0 };\n\
  };\n\
\n\
  // Our ArrayIterator is private; see\n\
  // https://github.com/paulmillr/es6-shim/issues/252\n\
  ArrayIterator = function (array, kind) {\n\
      this.i = 0;\n\
      this.array = array;\n\
      this.kind = kind;\n\
  };\n\
\n\
  defineProperties(ArrayIterator.prototype, {\n\
    next: function () {\n\
      var i = this.i, array = this.array;\n\
      if (!(this instanceof ArrayIterator)) {\n\
        throw new TypeError('Not an ArrayIterator');\n\
      }\n\
      if (typeof array !== 'undefined') {\n\
        var len = ES.ToLength(array.length);\n\
        for (; i < len; i++) {\n\
          var kind = this.kind;\n\
          var retval;\n\
          if (kind === 'key') {\n\
            retval = i;\n\
          } else if (kind === 'value') {\n\
            retval = array[i];\n\
          } else if (kind === 'entry') {\n\
            retval = [i, array[i]];\n\
          }\n\
          this.i = i + 1;\n\
          return { value: retval, done: false };\n\
        }\n\
      }\n\
      this.array = void 0;\n\
      return { value: void 0, done: true };\n\
    }\n\
  });\n\
  addIterator(ArrayIterator.prototype);\n\
\n\
  var ObjectIterator = function (object, kind) {\n\
    this.object = object;\n\
    // Don't generate keys yet.\n\
    this.array = null;\n\
    this.kind = kind;\n\
  };\n\
\n\
  var getAllKeys = function getAllKeys(object) {\n\
    var keys = [];\n\
\n\
    for (var key in object) {\n\
      _push(keys, key);\n\
    }\n\
\n\
    return keys;\n\
  };\n\
\n\
  defineProperties(ObjectIterator.prototype, {\n\
    next: function () {\n\
      var key, array = this.array;\n\
\n\
      if (!(this instanceof ObjectIterator)) {\n\
        throw new TypeError('Not an ObjectIterator');\n\
      }\n\
\n\
      // Keys not generated\n\
      if (array === null) {\n\
        array = this.array = getAllKeys(this.object);\n\
      }\n\
\n\
      // Find next key in the object\n\
      while (ES.ToLength(array.length) > 0) {\n\
        key = _shift(array);\n\
\n\
        // The candidate key isn't defined on object.\n\
        // Must have been deleted, or object[[Prototype]]\n\
        // has been modified.\n\
        if (!(key in this.object)) {\n\
          continue;\n\
        }\n\
\n\
        if (this.kind === 'key') {\n\
          return iteratorResult(key);\n\
        } else if (this.kind === 'value') {\n\
          return iteratorResult(this.object[key]);\n\
        } else {\n\
          return iteratorResult([key, this.object[key]]);\n\
        }\n\
      }\n\
\n\
      return iteratorResult();\n\
    }\n\
  });\n\
  addIterator(ObjectIterator.prototype);\n\
\n\
  // note: this is positioned here because it depends on ArrayIterator\n\
  var arrayOfSupportsSubclassing = (function () {\n\
    // Detects a bug in Webkit nightly r181886\n\
    var Foo = function Foo(len) { this.length = len; };\n\
    Foo.prototype = [];\n\
    var fooArr = Array.of.apply(Foo, [1, 2]);\n\
    return fooArr instanceof Foo && fooArr.length === 2;\n\
  }());\n\
  if (!arrayOfSupportsSubclassing) {\n\
    overrideNative(Array, 'of', ArrayShims.of);\n\
  }\n\
\n\
  var ArrayPrototypeShims = {\n\
    copyWithin: function copyWithin(target, start) {\n\
      var end = arguments[2]; // copyWithin.length must be 2\n\
      var o = ES.ToObject(this);\n\
      var len = ES.ToLength(o.length);\n\
      var relativeTarget = ES.ToInteger(target);\n\
      var relativeStart = ES.ToInteger(start);\n\
      var to = relativeTarget < 0 ? _max(len + relativeTarget, 0) : _min(relativeTarget, len);\n\
      var from = relativeStart < 0 ? _max(len + relativeStart, 0) : _min(relativeStart, len);\n\
      end = typeof end === 'undefined' ? len : ES.ToInteger(end);\n\
      var fin = end < 0 ? _max(len + end, 0) : _min(end, len);\n\
      var count = _min(fin - from, len - to);\n\
      var direction = 1;\n\
      if (from < to && to < (from + count)) {\n\
        direction = -1;\n\
        from += count - 1;\n\
        to += count - 1;\n\
      }\n\
      while (count > 0) {\n\
        if (_hasOwnProperty(o, from)) {\n\
          o[to] = o[from];\n\
        } else {\n\
          delete o[from];\n\
        }\n\
        from += direction;\n\
        to += direction;\n\
        count -= 1;\n\
      }\n\
      return o;\n\
    },\n\
\n\
    fill: function fill(value) {\n\
      var start = arguments.length > 1 ? arguments[1] : void 0;\n\
      var end = arguments.length > 2 ? arguments[2] : void 0;\n\
      var O = ES.ToObject(this);\n\
      var len = ES.ToLength(O.length);\n\
      start = ES.ToInteger(typeof start === 'undefined' ? 0 : start);\n\
      end = ES.ToInteger(typeof end === 'undefined' ? len : end);\n\
\n\
      var relativeStart = start < 0 ? _max(len + start, 0) : _min(start, len);\n\
      var relativeEnd = end < 0 ? len + end : end;\n\
\n\
      for (var i = relativeStart; i < len && i < relativeEnd; ++i) {\n\
        O[i] = value;\n\
      }\n\
      return O;\n\
    },\n\
\n\
    find: function find(predicate) {\n\
      var list = ES.ToObject(this);\n\
      var length = ES.ToLength(list.length);\n\
      if (!ES.IsCallable(predicate)) {\n\
        throw new TypeError('Array#find: predicate must be a function');\n\
      }\n\
      var thisArg = arguments.length > 1 ? arguments[1] : null;\n\
      for (var i = 0, value; i < length; i++) {\n\
        value = list[i];\n\
        if (thisArg) {\n\
          if (_call(predicate, thisArg, value, i, list)) { return value; }\n\
        } else if (predicate(value, i, list)) {\n\
          return value;\n\
        }\n\
      }\n\
    },\n\
\n\
    findIndex: function findIndex(predicate) {\n\
      var list = ES.ToObject(this);\n\
      var length = ES.ToLength(list.length);\n\
      if (!ES.IsCallable(predicate)) {\n\
        throw new TypeError('Array#findIndex: predicate must be a function');\n\
      }\n\
      var thisArg = arguments.length > 1 ? arguments[1] : null;\n\
      for (var i = 0; i < length; i++) {\n\
        if (thisArg) {\n\
          if (_call(predicate, thisArg, list[i], i, list)) { return i; }\n\
        } else if (predicate(list[i], i, list)) {\n\
          return i;\n\
        }\n\
      }\n\
      return -1;\n\
    },\n\
\n\
    keys: function keys() {\n\
      return new ArrayIterator(this, 'key');\n\
    },\n\
\n\
    values: function values() {\n\
      return new ArrayIterator(this, 'value');\n\
    },\n\
\n\
    entries: function entries() {\n\
      return new ArrayIterator(this, 'entry');\n\
    }\n\
  };\n\
  // Safari 7.1 defines Array#keys and Array#entries natively,\n\
  // but the resulting ArrayIterator objects don't have a \"next\" method.\n\
  if (Array.prototype.keys && !ES.IsCallable([1].keys().next)) {\n\
    delete Array.prototype.keys;\n\
  }\n\
  if (Array.prototype.entries && !ES.IsCallable([1].entries().next)) {\n\
    delete Array.prototype.entries;\n\
  }\n\
\n\
  // Chrome 38 defines Array#keys and Array#entries, and Array#@@iterator, but not Array#values\n\
  if (Array.prototype.keys && Array.prototype.entries && !Array.prototype.values && Array.prototype[$iterator$]) {\n\
    defineProperties(Array.prototype, {\n\
      values: Array.prototype[$iterator$]\n\
    });\n\
    if (Type.symbol(Symbol.unscopables)) {\n\
      Array.prototype[Symbol.unscopables].values = true;\n\
    }\n\
  }\n\
  // Chrome 40 defines Array#values with the incorrect name, although Array#{keys,entries} have the correct name\n\
  if (Array.prototype.values && Array.prototype.values.name !== 'values') {\n\
    var originalArrayPrototypeValues = Array.prototype.values;\n\
    overrideNative(Array.prototype, 'values', function values() { return _call(originalArrayPrototypeValues, this); });\n\
    defineProperty(Array.prototype, $iterator$, Array.prototype.values, true);\n\
  }\n\
  defineProperties(Array.prototype, ArrayPrototypeShims);\n\
\n\
  addIterator(Array.prototype, function () { return this.values(); });\n\
  // Chrome defines keys/values/entries on Array, but doesn't give us\n\
  // any way to identify its iterator.  So add our own shimmed field.\n\
  if (Object.getPrototypeOf) {\n\
    addIterator(Object.getPrototypeOf([].values()));\n\
  }\n\
\n\
  // note: this is positioned here because it relies on Array#entries\n\
  var arrayFromSwallowsNegativeLengths = (function () {\n\
    // Detects a Firefox bug in v32\n\
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1063993\n\
    return valueOrFalseIfThrows(function () { return Array.from({ length: -1 }).length === 0; });\n\
  }());\n\
  var arrayFromHandlesIterables = (function () {\n\
    // Detects a bug in Webkit nightly r181886\n\
    var arr = Array.from([0].entries());\n\
    return arr.length === 1 && arr[0][0] === 0 && arr[0][1] === 1;\n\
  }());\n\
  if (!arrayFromSwallowsNegativeLengths || !arrayFromHandlesIterables) {\n\
    overrideNative(Array, 'from', ArrayShims.from);\n\
  }\n\
\n\
  var toLengthsCorrectly = function (method, reversed) {\n\
    var obj = { length: -1 };\n\
    obj[reversed ? ((-1 >>> 0) - 1) : 0] = true;\n\
    return valueOrFalseIfThrows(function () {\n\
      _call(method, obj, function () {\n\
        // note: in nonconforming browsers, this will be called\n\
        // -1 >>> 0 times, which is 4294967295, so the throw matters.\n\
        throw new RangeError('should not reach here');\n\
      }, []);\n\
    });\n\
  };\n\
  if (!toLengthsCorrectly(Array.prototype.forEach)) {\n\
    var originalForEach = Array.prototype.forEach;\n\
    overrideNative(Array.prototype, 'forEach', function forEach(callbackFn) {\n\
      return _apply(originalForEach, this.length >= 0 ? this : [], arguments);\n\
    }, true);\n\
  }\n\
  if (!toLengthsCorrectly(Array.prototype.map)) {\n\
    var originalMap = Array.prototype.map;\n\
    overrideNative(Array.prototype, 'map', function map(callbackFn) {\n\
      return _apply(originalMap, this.length >= 0 ? this : [], arguments);\n\
    }, true);\n\
  }\n\
  if (!toLengthsCorrectly(Array.prototype.filter)) {\n\
    var originalFilter = Array.prototype.filter;\n\
    overrideNative(Array.prototype, 'filter', function filter(callbackFn) {\n\
      return _apply(originalFilter, this.length >= 0 ? this : [], arguments);\n\
    }, true);\n\
  }\n\
  if (!toLengthsCorrectly(Array.prototype.some)) {\n\
    var originalSome = Array.prototype.some;\n\
    overrideNative(Array.prototype, 'some', function some(callbackFn) {\n\
      return _apply(originalSome, this.length >= 0 ? this : [], arguments);\n\
    }, true);\n\
  }\n\
  if (!toLengthsCorrectly(Array.prototype.every)) {\n\
    var originalEvery = Array.prototype.every;\n\
    overrideNative(Array.prototype, 'every', function every(callbackFn) {\n\
      return _apply(originalEvery, this.length >= 0 ? this : [], arguments);\n\
    }, true);\n\
  }\n\
  if (!toLengthsCorrectly(Array.prototype.reduce)) {\n\
    var originalReduce = Array.prototype.reduce;\n\
    overrideNative(Array.prototype, 'reduce', function reduce(callbackFn) {\n\
      return _apply(originalReduce, this.length >= 0 ? this : [], arguments);\n\
    }, true);\n\
  }\n\
  if (!toLengthsCorrectly(Array.prototype.reduceRight, true)) {\n\
    var originalReduceRight = Array.prototype.reduceRight;\n\
    overrideNative(Array.prototype, 'reduceRight', function reduceRight(callbackFn) {\n\
      return _apply(originalReduceRight, this.length >= 0 ? this : [], arguments);\n\
    }, true);\n\
  }\n\
\n\
  var maxSafeInteger = Math.pow(2, 53) - 1;\n\
  defineProperties(Number, {\n\
    MAX_SAFE_INTEGER: maxSafeInteger,\n\
    MIN_SAFE_INTEGER: -maxSafeInteger,\n\
    EPSILON: 2.220446049250313e-16,\n\
\n\
    parseInt: globals.parseInt,\n\
    parseFloat: globals.parseFloat,\n\
\n\
    isFinite: numberIsFinite,\n\
\n\
    isInteger: function isInteger(value) {\n\
      return numberIsFinite(value) && ES.ToInteger(value) === value;\n\
    },\n\
\n\
    isSafeInteger: function isSafeInteger(value) {\n\
      return Number.isInteger(value) && _abs(value) <= Number.MAX_SAFE_INTEGER;\n\
    },\n\
\n\
    isNaN: numberIsNaN\n\
  });\n\
  // Firefox 37 has a conforming Number.parseInt, but it's not === to the global parseInt (fixed in v40)\n\
  defineProperty(Number, 'parseInt', globals.parseInt, Number.parseInt !== globals.parseInt);\n\
\n\
  // Work around bugs in Array#find and Array#findIndex -- early\n\
  // implementations skipped holes in sparse arrays. (Note that the\n\
  // implementations of find/findIndex indirectly use shimmed\n\
  // methods of Number, so this test has to happen down here.)\n\
  /*jshint elision: true */\n\
  if (![, 1].find(function (item, idx) { return idx === 0; })) {\n\
    overrideNative(Array.prototype, 'find', ArrayPrototypeShims.find);\n\
  }\n\
  if ([, 1].findIndex(function (item, idx) { return idx === 0; }) !== 0) {\n\
    overrideNative(Array.prototype, 'findIndex', ArrayPrototypeShims.findIndex);\n\
  }\n\
  /*jshint elision: false */\n\
\n\
  var isEnumerableOn = Function.bind.call(Function.bind, Object.prototype.propertyIsEnumerable);\n\
  var sliceArgs = function sliceArgs() {\n\
    // per https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments\n\
    // and https://gist.github.com/WebReflection/4327762cb87a8c634a29\n\
    var initial = Number(this);\n\
    var len = arguments.length;\n\
    var desiredArgCount = len - initial;\n\
    var args = new Array(desiredArgCount < 0 ? 0 : desiredArgCount);\n\
    for (var i = initial; i < len; ++i) {\n\
      args[i - initial] = arguments[i];\n\
    }\n\
    return args;\n\
  };\n\
  var assignTo = function assignTo(source) {\n\
    return function assignToSource(target, key) {\n\
      target[key] = source[key];\n\
      return target;\n\
    };\n\
  };\n\
  var assignReducer = function (target, source) {\n\
    var keys = Object.keys(Object(source));\n\
    var symbols;\n\
    if (ES.IsCallable(Object.getOwnPropertySymbols)) {\n\
      symbols = _filter(Object.getOwnPropertySymbols(Object(source)), isEnumerableOn(source));\n\
    }\n\
    return _reduce(_concat(keys, symbols || []), assignTo(source), target);\n\
  };\n\
\n\
  var ObjectShims = {\n\
    // 19.1.3.1\n\
    assign: function (target, source) {\n\
      if (!ES.TypeIsObject(target)) {\n\
        throw new TypeError('target must be an object');\n\
      }\n\
      return _reduce(_apply(sliceArgs, 0, arguments), assignReducer);\n\
    },\n\
\n\
    // Added in WebKit in https://bugs.webkit.org/show_bug.cgi?id=143865\n\
    is: function is(a, b) {\n\
      return ES.SameValue(a, b);\n\
    }\n\
  };\n\
  var assignHasPendingExceptions = Object.assign && Object.preventExtensions && (function () {\n\
    // Firefox 37 still has \"pending exception\" logic in its Object.assign implementation,\n\
    // which is 72% slower than our shim, and Firefox 40's native implementation.\n\
    var thrower = Object.preventExtensions({ 1: 2 });\n\
    try {\n\
      Object.assign(thrower, 'xy');\n\
    } catch (e) {\n\
      return thrower[1] === 'y';\n\
    }\n\
  }());\n\
  if (assignHasPendingExceptions) {\n\
    overrideNative(Object, 'assign', ObjectShims.assign);\n\
  }\n\
  defineProperties(Object, ObjectShims);\n\
\n\
  if (supportsDescriptors) {\n\
    var ES5ObjectShims = {\n\
      // 19.1.3.9\n\
      // shim from https://gist.github.com/WebReflection/5593554\n\
      setPrototypeOf: (function (Object, magic) {\n\
        var set;\n\
\n\
        var checkArgs = function (O, proto) {\n\
          if (!ES.TypeIsObject(O)) {\n\
            throw new TypeError('cannot set prototype on a non-object');\n\
          }\n\
          if (!(proto === null || ES.TypeIsObject(proto))) {\n\
            throw new TypeError('can only set prototype to an object or null' + proto);\n\
          }\n\
        };\n\
\n\
        var setPrototypeOf = function (O, proto) {\n\
          checkArgs(O, proto);\n\
          _call(set, O, proto);\n\
          return O;\n\
        };\n\
\n\
        try {\n\
          // this works already in Firefox and Safari\n\
          set = Object.getOwnPropertyDescriptor(Object.prototype, magic).set;\n\
          _call(set, {}, null);\n\
        } catch (e) {\n\
          if (Object.prototype !== {}[magic]) {\n\
            // IE < 11 cannot be shimmed\n\
            return;\n\
          }\n\
          // probably Chrome or some old Mobile stock browser\n\
          set = function (proto) {\n\
            this[magic] = proto;\n\
          };\n\
          // please note that this will **not** work\n\
          // in those browsers that do not inherit\n\
          // __proto__ by mistake from Object.prototype\n\
          // in these cases we should probably throw an error\n\
          // or at least be informed about the issue\n\
          setPrototypeOf.polyfill = setPrototypeOf(\n\
            setPrototypeOf({}, null),\n\
            Object.prototype\n\
          ) instanceof Object;\n\
          // setPrototypeOf.polyfill === true means it works as meant\n\
          // setPrototypeOf.polyfill === false means it's not 100% reliable\n\
          // setPrototypeOf.polyfill === undefined\n\
          // or\n\
          // setPrototypeOf.polyfill ==  null means it's not a polyfill\n\
          // which means it works as expected\n\
          // we can even delete Object.prototype.__proto__;\n\
        }\n\
        return setPrototypeOf;\n\
      }(Object, '__proto__'))\n\
    };\n\
\n\
    defineProperties(Object, ES5ObjectShims);\n\
  }\n\
\n\
  // Workaround bug in Opera 12 where setPrototypeOf(x, null) doesn't work,\n\
  // but Object.create(null) does.\n\
  if (Object.setPrototypeOf && Object.getPrototypeOf &&\n\
      Object.getPrototypeOf(Object.setPrototypeOf({}, null)) !== null &&\n\
      Object.getPrototypeOf(Object.create(null)) === null) {\n\
    (function () {\n\
      var FAKENULL = Object.create(null);\n\
      var gpo = Object.getPrototypeOf, spo = Object.setPrototypeOf;\n\
      Object.getPrototypeOf = function (o) {\n\
        var result = gpo(o);\n\
        return result === FAKENULL ? null : result;\n\
      };\n\
      Object.setPrototypeOf = function (o, p) {\n\
        var proto = p === null ? FAKENULL : p;\n\
        return spo(o, proto);\n\
      };\n\
      Object.setPrototypeOf.polyfill = false;\n\
    }());\n\
  }\n\
\n\
  var objectKeysAcceptsPrimitives = !throwsError(function () { Object.keys('foo'); });\n\
  if (!objectKeysAcceptsPrimitives) {\n\
    var originalObjectKeys = Object.keys;\n\
    overrideNative(Object, 'keys', function keys(value) {\n\
      return originalObjectKeys(ES.ToObject(value));\n\
    });\n\
  }\n\
\n\
  if (Object.getOwnPropertyNames) {\n\
    var objectGOPNAcceptsPrimitives = !throwsError(function () { Object.getOwnPropertyNames('foo'); });\n\
    if (!objectGOPNAcceptsPrimitives) {\n\
      var cachedWindowNames = typeof window === 'object' ? Object.getOwnPropertyNames(window) : [];\n\
      var originalObjectGetOwnPropertyNames = Object.getOwnPropertyNames;\n\
      overrideNative(Object, 'getOwnPropertyNames', function getOwnPropertyNames(value) {\n\
        var val = ES.ToObject(value);\n\
        if (_toString(val) === '[object Window]') {\n\
          try {\n\
            return originalObjectGetOwnPropertyNames(val);\n\
          } catch (e) {\n\
            // IE bug where layout engine calls userland gOPN for cross-domain `window` objects\n\
            return _concat([], cachedWindowNames);\n\
          }\n\
        }\n\
        return originalObjectGetOwnPropertyNames(val);\n\
      });\n\
    }\n\
  }\n\
  if (Object.getOwnPropertyDescriptor) {\n\
    var objectGOPDAcceptsPrimitives = !throwsError(function () { Object.getOwnPropertyDescriptor('foo', 'bar'); });\n\
    if (!objectGOPDAcceptsPrimitives) {\n\
      var originalObjectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;\n\
      overrideNative(Object, 'getOwnPropertyDescriptor', function getOwnPropertyDescriptor(value, property) {\n\
        return originalObjectGetOwnPropertyDescriptor(ES.ToObject(value), property);\n\
      });\n\
    }\n\
  }\n\
  if (Object.seal) {\n\
    var objectSealAcceptsPrimitives = !throwsError(function () { Object.seal('foo'); });\n\
    if (!objectSealAcceptsPrimitives) {\n\
      var originalObjectSeal = Object.seal;\n\
      overrideNative(Object, 'seal', function seal(value) {\n\
        if (!Type.object(value)) { return value; }\n\
        return originalObjectSeal(value);\n\
      });\n\
    }\n\
  }\n\
  if (Object.isSealed) {\n\
    var objectIsSealedAcceptsPrimitives = !throwsError(function () { Object.isSealed('foo'); });\n\
    if (!objectIsSealedAcceptsPrimitives) {\n\
      var originalObjectIsSealed = Object.isSealed;\n\
      overrideNative(Object, 'isSealed', function isSealed(value) {\n\
        if (!Type.object(value)) { return true; }\n\
        return originalObjectIsSealed(value);\n\
      });\n\
    }\n\
  }\n\
  if (Object.freeze) {\n\
    var objectFreezeAcceptsPrimitives = !throwsError(function () { Object.freeze('foo'); });\n\
    if (!objectFreezeAcceptsPrimitives) {\n\
      var originalObjectFreeze = Object.freeze;\n\
      overrideNative(Object, 'freeze', function freeze(value) {\n\
        if (!Type.object(value)) { return value; }\n\
        return originalObjectFreeze(value);\n\
      });\n\
    }\n\
  }\n\
  if (Object.isFrozen) {\n\
    var objectIsFrozenAcceptsPrimitives = !throwsError(function () { Object.isFrozen('foo'); });\n\
    if (!objectIsFrozenAcceptsPrimitives) {\n\
      var originalObjectIsFrozen = Object.isFrozen;\n\
      overrideNative(Object, 'isFrozen', function isFrozen(value) {\n\
        if (!Type.object(value)) { return true; }\n\
        return originalObjectIsFrozen(value);\n\
      });\n\
    }\n\
  }\n\
  if (Object.preventExtensions) {\n\
    var objectPreventExtensionsAcceptsPrimitives = !throwsError(function () { Object.preventExtensions('foo'); });\n\
    if (!objectPreventExtensionsAcceptsPrimitives) {\n\
      var originalObjectPreventExtensions = Object.preventExtensions;\n\
      overrideNative(Object, 'preventExtensions', function preventExtensions(value) {\n\
        if (!Type.object(value)) { return value; }\n\
        return originalObjectPreventExtensions(value);\n\
      });\n\
    }\n\
  }\n\
  if (Object.isExtensible) {\n\
    var objectIsExtensibleAcceptsPrimitives = !throwsError(function () { Object.isExtensible('foo'); });\n\
    if (!objectIsExtensibleAcceptsPrimitives) {\n\
      var originalObjectIsExtensible = Object.isExtensible;\n\
      overrideNative(Object, 'isExtensible', function isExtensible(value) {\n\
        if (!Type.object(value)) { return false; }\n\
        return originalObjectIsExtensible(value);\n\
      });\n\
    }\n\
  }\n\
  if (Object.getPrototypeOf) {\n\
    var objectGetProtoAcceptsPrimitives = !throwsError(function () { Object.getPrototypeOf('foo'); });\n\
    if (!objectGetProtoAcceptsPrimitives) {\n\
      var originalGetProto = Object.getPrototypeOf;\n\
      overrideNative(Object, 'getPrototypeOf', function getPrototypeOf(value) {\n\
        return originalGetProto(ES.ToObject(value));\n\
      });\n\
    }\n\
  }\n\
\n\
  if (!RegExp.prototype.flags && supportsDescriptors) {\n\
    var regExpFlagsGetter = function flags() {\n\
      if (!ES.TypeIsObject(this)) {\n\
        throw new TypeError('Method called on incompatible type: must be an object.');\n\
      }\n\
      var result = '';\n\
      if (this.global) {\n\
        result += 'g';\n\
      }\n\
      if (this.ignoreCase) {\n\
        result += 'i';\n\
      }\n\
      if (this.multiline) {\n\
        result += 'm';\n\
      }\n\
      if (this.unicode) {\n\
        result += 'u';\n\
      }\n\
      if (this.sticky) {\n\
        result += 'y';\n\
      }\n\
      return result;\n\
    };\n\
\n\
    Value.getter(RegExp.prototype, 'flags', regExpFlagsGetter);\n\
  }\n\
\n\
  var regExpSupportsFlagsWithRegex = valueOrFalseIfThrows(function () {\n\
    return String(new RegExp(/a/g, 'i')) === '/a/i';\n\
  });\n\
\n\
  if (!regExpSupportsFlagsWithRegex && supportsDescriptors) {\n\
    var OrigRegExp = RegExp;\n\
    var RegExpShim = function RegExp(pattern, flags) {\n\
      var calledWithNew = this instanceof RegExp;\n\
      if (!calledWithNew && (Type.regex(pattern) || pattern.constructor === RegExp)) {\n\
        return pattern;\n\
      }\n\
      if (Type.regex(pattern) && Type.string(flags)) {\n\
        return new RegExp(pattern.source, flags);\n\
      }\n\
      return new OrigRegExp(pattern, flags);\n\
    };\n\
    Value.preserveToString(RegExpShim, OrigRegExp);\n\
    if (Object.setPrototypeOf) {\n\
      // sets up proper prototype chain where possible\n\
      Object.setPrototypeOf(OrigRegExp, RegExpShim);\n\
    }\n\
    _forEach(Object.getOwnPropertyNames(OrigRegExp), function (key) {\n\
      if (key === '$input') { return; } // Chrome < v39 & Opera < 26 have a nonstandard \"$input\" property\n\
      if (key in noop) { return; }\n\
      Value.proxy(OrigRegExp, key, RegExpShim);\n\
    });\n\
    RegExpShim.prototype = OrigRegExp.prototype;\n\
    Value.redefine(OrigRegExp.prototype, 'constructor', RegExpShim);\n\
    /*globals RegExp: true */\n\
    RegExp = RegExpShim;\n\
    Value.redefine(globals, 'RegExp', RegExpShim);\n\
    /*globals RegExp: false */\n\
  }\n\
\n\
  if (supportsDescriptors) {\n\
    var regexGlobals = {\n\
      input: '$_',\n\
      lastMatch: '$&',\n\
      lastParen: '$+',\n\
      leftContext: '$`',\n\
      rightContext: '$\\''\n\
    };\n\
    _forEach(Object.keys(regexGlobals), function (prop) {\n\
      if (prop in RegExp && !(regexGlobals[prop] in RegExp)) {\n\
        Value.getter(RegExp, regexGlobals[prop], function get() {\n\
          return RegExp[prop];\n\
        });\n\
      }\n\
    });\n\
  }\n\
\n\
  var square = function (n) { return n * n; };\n\
  var add = function (a, b) { return a + b; };\n\
  var inverseEpsilon = 1 / Number.EPSILON;\n\
  var roundTiesToEven = function roundTiesToEven(n) {\n\
    // Even though this reduces down to `return n`, it takes advantage of built-in rounding.\n\
    return (n + inverseEpsilon) - inverseEpsilon;\n\
  };\n\
  var BINARY_32_EPSILON = Math.pow(2, -23);\n\
  var BINARY_32_MAX_VALUE = Math.pow(2, 127) * (2 - BINARY_32_EPSILON);\n\
  var BINARY_32_MIN_VALUE = Math.pow(2, -126);\n\
  var numberCLZ = Number.prototype.clz;\n\
  delete Number.prototype.clz; // Safari 8 has Number#clz\n\
\n\
  var MathShims = {\n\
    acosh: function acosh(value) {\n\
      var x = Number(value);\n\
      if (Number.isNaN(x) || value < 1) { return NaN; }\n\
      if (x === 1) { return 0; }\n\
      if (x === Infinity) { return x; }\n\
      return _log(x / Math.E + Math.sqrt(x + 1) * Math.sqrt(x - 1) / Math.E) + 1;\n\
    },\n\
\n\
    asinh: function asinh(value) {\n\
      var x = Number(value);\n\
      if (x === 0 || !globalIsFinite(x)) {\n\
        return x;\n\
      }\n\
      return x < 0 ? -Math.asinh(-x) : _log(x + Math.sqrt(x * x + 1));\n\
    },\n\
\n\
    atanh: function atanh(value) {\n\
      var x = Number(value);\n\
      if (Number.isNaN(x) || x < -1 || x > 1) {\n\
        return NaN;\n\
      }\n\
      if (x === -1) { return -Infinity; }\n\
      if (x === 1) { return Infinity; }\n\
      if (x === 0) { return x; }\n\
      return 0.5 * _log((1 + x) / (1 - x));\n\
    },\n\
\n\
    cbrt: function cbrt(value) {\n\
      var x = Number(value);\n\
      if (x === 0) { return x; }\n\
      var negate = x < 0, result;\n\
      if (negate) { x = -x; }\n\
      if (x === Infinity) {\n\
        result = Infinity;\n\
      } else {\n\
        result = Math.exp(_log(x) / 3);\n\
        // from http://en.wikipedia.org/wiki/Cube_root#Numerical_methods\n\
        result = (x / (result * result) + (2 * result)) / 3;\n\
      }\n\
      return negate ? -result : result;\n\
    },\n\
\n\
    clz32: function clz32(value) {\n\
      // See https://bugs.ecmascript.org/show_bug.cgi?id=2465\n\
      var x = Number(value);\n\
      var number = ES.ToUint32(x);\n\
      if (number === 0) {\n\
        return 32;\n\
      }\n\
      return numberCLZ ? _call(numberCLZ, number) : 31 - _floor(_log(number + 0.5) * Math.LOG2E);\n\
    },\n\
\n\
    cosh: function cosh(value) {\n\
      var x = Number(value);\n\
      if (x === 0) { return 1; } // +0 or -0\n\
      if (Number.isNaN(x)) { return NaN; }\n\
      if (!globalIsFinite(x)) { return Infinity; }\n\
      if (x < 0) { x = -x; }\n\
      if (x > 21) { return Math.exp(x) / 2; }\n\
      return (Math.exp(x) + Math.exp(-x)) / 2;\n\
    },\n\
\n\
    expm1: function expm1(value) {\n\
      var x = Number(value);\n\
      if (x === -Infinity) { return -1; }\n\
      if (!globalIsFinite(x) || x === 0) { return x; }\n\
      if (_abs(x) > 0.5) {\n\
        return Math.exp(x) - 1;\n\
      }\n\
      // A more precise approximation using Taylor series expansion\n\
      // from https://github.com/paulmillr/es6-shim/issues/314#issuecomment-70293986\n\
      var t = x;\n\
      var sum = 0;\n\
      var n = 1;\n\
      while (sum + t !== sum) {\n\
        sum += t;\n\
        n += 1;\n\
        t *= x / n;\n\
      }\n\
      return sum;\n\
    },\n\
\n\
    hypot: function hypot(x, y) {\n\
      var anyNaN = false;\n\
      var allZero = true;\n\
      var anyInfinity = false;\n\
      var numbers = [];\n\
      _every(arguments, function (arg) {\n\
        var num = Number(arg);\n\
        if (Number.isNaN(num)) {\n\
          anyNaN = true;\n\
        } else if (num === Infinity || num === -Infinity) {\n\
          anyInfinity = true;\n\
        } else if (num !== 0) {\n\
          allZero = false;\n\
        }\n\
        if (anyInfinity) {\n\
          return false;\n\
        } else if (!anyNaN) {\n\
          _push(numbers, _abs(num));\n\
        }\n\
        return true;\n\
      });\n\
      if (anyInfinity) { return Infinity; }\n\
      if (anyNaN) { return NaN; }\n\
      if (allZero) { return 0; }\n\
\n\
      var largest = _apply(_max, Math, numbers);\n\
      var divided = _map(numbers, function (number) { return number / largest; });\n\
      var sum = _reduce(_map(divided, square), add);\n\
      return largest * Math.sqrt(sum);\n\
    },\n\
\n\
    log2: function log2(value) {\n\
      return _log(value) * Math.LOG2E;\n\
    },\n\
\n\
    log10: function log10(value) {\n\
      return _log(value) * Math.LOG10E;\n\
    },\n\
\n\
    log1p: function log1p(value) {\n\
      var x = Number(value);\n\
      if (x < -1 || Number.isNaN(x)) { return NaN; }\n\
      if (x === 0 || x === Infinity) { return x; }\n\
      if (x === -1) { return -Infinity; }\n\
\n\
      return (1 + x) - 1 === 0 ? x : x * (_log(1 + x) / ((1 + x) - 1));\n\
    },\n\
\n\
    sign: function sign(value) {\n\
      var number = Number(value);\n\
      if (number === 0) { return number; }\n\
      if (Number.isNaN(number)) { return number; }\n\
      return number < 0 ? -1 : 1;\n\
    },\n\
\n\
    sinh: function sinh(value) {\n\
      var x = Number(value);\n\
      if (!globalIsFinite(x) || x === 0) { return x; }\n\
\n\
      if (_abs(x) < 1) {\n\
        return (Math.expm1(x) - Math.expm1(-x)) / 2;\n\
      }\n\
      return (Math.exp(x - 1) - Math.exp(-x - 1)) * Math.E / 2;\n\
    },\n\
\n\
    tanh: function tanh(value) {\n\
      var x = Number(value);\n\
      if (Number.isNaN(x) || x === 0) { return x; }\n\
      if (x === Infinity) { return 1; }\n\
      if (x === -Infinity) { return -1; }\n\
      var a = Math.expm1(x);\n\
      var b = Math.expm1(-x);\n\
      if (a === Infinity) { return 1; }\n\
      if (b === Infinity) { return -1; }\n\
      return (a - b) / (Math.exp(x) + Math.exp(-x));\n\
    },\n\
\n\
    trunc: function trunc(value) {\n\
      var x = Number(value);\n\
      return x < 0 ? -_floor(-x) : _floor(x);\n\
    },\n\
\n\
    imul: function imul(x, y) {\n\
      // taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul\n\
      var a = ES.ToUint32(x);\n\
      var b = ES.ToUint32(y);\n\
      var ah = (a >>> 16) & 0xffff;\n\
      var al = a & 0xffff;\n\
      var bh = (b >>> 16) & 0xffff;\n\
      var bl = b & 0xffff;\n\
      // the shift by 0 fixes the sign on the high part\n\
      // the final |0 converts the unsigned value into a signed value\n\
      return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);\n\
    },\n\
\n\
    fround: function fround(x) {\n\
      var v = Number(x);\n\
      if (v === 0 || v === Infinity || v === -Infinity || numberIsNaN(v)) {\n\
        return v;\n\
      }\n\
      var sign = Math.sign(v);\n\
      var abs = _abs(v);\n\
      if (abs < BINARY_32_MIN_VALUE) {\n\
        return sign * roundTiesToEven(abs / BINARY_32_MIN_VALUE / BINARY_32_EPSILON) * BINARY_32_MIN_VALUE * BINARY_32_EPSILON;\n\
      }\n\
      // Veltkamp's splitting (?)\n\
      var a = (1 + BINARY_32_EPSILON / Number.EPSILON) * abs;\n\
      var result = a - (a - abs);\n\
      if (result > BINARY_32_MAX_VALUE || numberIsNaN(result)) {\n\
        return sign * Infinity;\n\
      }\n\
      return sign * result;\n\
    }\n\
  };\n\
  defineProperties(Math, MathShims);\n\
  // IE 11 TP has an imprecise log1p: reports Math.log1p(-1e-17) as 0\n\
  defineProperty(Math, 'log1p', MathShims.log1p, Math.log1p(-1e-17) !== -1e-17);\n\
  // IE 11 TP has an imprecise asinh: reports Math.asinh(-1e7) as not exactly equal to -Math.asinh(1e7)\n\
  defineProperty(Math, 'asinh', MathShims.asinh, Math.asinh(-1e7) !== -Math.asinh(1e7));\n\
  // Chrome 40 has an imprecise Math.tanh with very small numbers\n\
  defineProperty(Math, 'tanh', MathShims.tanh, Math.tanh(-2e-17) !== -2e-17);\n\
  // Chrome 40 loses Math.acosh precision with high numbers\n\
  defineProperty(Math, 'acosh', MathShims.acosh, Math.acosh(Number.MAX_VALUE) === Infinity);\n\
  // Firefox 38 on Windows\n\
  defineProperty(Math, 'cbrt', MathShims.cbrt, Math.abs(1 - Math.cbrt(1e-300) / 1e-100) / Number.EPSILON > 8);\n\
  // node 0.11 has an imprecise Math.sinh with very small numbers\n\
  defineProperty(Math, 'sinh', MathShims.sinh, Math.sinh(-2e-17) !== -2e-17);\n\
  // FF 35 on Linux reports 22025.465794806725 for Math.expm1(10)\n\
  var expm1OfTen = Math.expm1(10);\n\
  defineProperty(Math, 'expm1', MathShims.expm1, expm1OfTen > 22025.465794806719 || expm1OfTen < 22025.4657948067165168);\n\
\n\
  var origMathRound = Math.round;\n\
  // breaks in e.g. Safari 8, Internet Explorer 11, Opera 12\n\
  var roundHandlesBoundaryConditions = Math.round(0.5 - Number.EPSILON / 4) === 0 && Math.round(-0.5 + Number.EPSILON / 3.99) === 1;\n\
\n\
  // When engines use Math.floor(x + 0.5) internally, Math.round can be buggy for large integers.\n\
  // This behavior should be governed by \"round to nearest, ties to even mode\"\n\
  // see https://people.mozilla.org/~jorendorff/es6-draft.html#sec-ecmascript-language-types-number-type\n\
  // These are the boundary cases where it breaks.\n\
  var smallestPositiveNumberWhereRoundBreaks = inverseEpsilon + 1;\n\
  var largestPositiveNumberWhereRoundBreaks = 2 * inverseEpsilon - 1;\n\
  var roundDoesNotIncreaseIntegers = [smallestPositiveNumberWhereRoundBreaks, largestPositiveNumberWhereRoundBreaks].every(function (num) {\n\
    return Math.round(num) === num;\n\
  });\n\
  defineProperty(Math, 'round', function round(x) {\n\
    var floor = _floor(x);\n\
    var ceil = floor === -1 ? -0 : floor + 1;\n\
    return x - floor < 0.5 ? floor : ceil;\n\
  }, !roundHandlesBoundaryConditions || !roundDoesNotIncreaseIntegers);\n\
  Value.preserveToString(Math.round, origMathRound);\n\
\n\
  var origImul = Math.imul;\n\
  if (Math.imul(0xffffffff, 5) !== -5) {\n\
    // Safari 6.1, at least, reports \"0\" for this value\n\
    Math.imul = MathShims.imul;\n\
    Value.preserveToString(Math.imul, origImul);\n\
  }\n\
  if (Math.imul.length !== 2) {\n\
    // Safari 8.0.4 has a length of 1\n\
    // fixed in https://bugs.webkit.org/show_bug.cgi?id=143658\n\
    overrideNative(Math, 'imul', function imul(x, y) {\n\
      return _apply(origImul, Math, arguments);\n\
    });\n\
  }\n\
\n\
  // Promises\n\
  // Simplest possible implementation; use a 3rd-party library if you\n\
  // want the best possible speed and/or long stack traces.\n\
  var PromiseShim = (function () {\n\
\n\
    ES.IsPromise = function (promise) {\n\
      if (!ES.TypeIsObject(promise)) {\n\
        return false;\n\
      }\n\
      if (!promise._promiseConstructor) {\n\
        // _promiseConstructor is a bit more unique than _status, so we'll\n\
        // check that instead of the [[PromiseStatus]] internal field.\n\
        return false;\n\
      }\n\
      if (typeof promise._status === 'undefined') {\n\
        return false; // uninitialized\n\
      }\n\
      return true;\n\
    };\n\
\n\
    // \"PromiseCapability\" in the spec is what most promise implementations\n\
    // call a \"deferred\".\n\
    var PromiseCapability = function (C) {\n\
      if (!ES.IsCallable(C)) {\n\
        throw new TypeError('bad promise constructor');\n\
      }\n\
      var capability = this;\n\
      var resolver = function (resolve, reject) {\n\
        capability.resolve = resolve;\n\
        capability.reject = reject;\n\
      };\n\
      capability.promise = ES.Construct(C, [resolver]);\n\
      // see https://bugs.ecmascript.org/show_bug.cgi?id=2478\n\
      if (!capability.promise._es6construct) {\n\
        throw new TypeError('bad promise constructor');\n\
      }\n\
      if (!(ES.IsCallable(capability.resolve) && ES.IsCallable(capability.reject))) {\n\
        throw new TypeError('bad promise constructor');\n\
      }\n\
    };\n\
\n\
    // find an appropriate setImmediate-alike\n\
    var setTimeout = globals.setTimeout;\n\
    var makeZeroTimeout;\n\
    /*global window */\n\
    if (typeof window !== 'undefined' && ES.IsCallable(window.postMessage)) {\n\
      makeZeroTimeout = function () {\n\
        // from http://dbaron.org/log/20100309-faster-timeouts\n\
        var timeouts = [];\n\
        var messageName = 'zero-timeout-message';\n\
        var setZeroTimeout = function (fn) {\n\
          _push(timeouts, fn);\n\
          window.postMessage(messageName, '*');\n\
        };\n\
        var handleMessage = function (event) {\n\
          if (event.source === window && event.data === messageName) {\n\
            event.stopPropagation();\n\
            if (timeouts.length === 0) { return; }\n\
            var fn = _shift(timeouts);\n\
            fn();\n\
          }\n\
        };\n\
        window.addEventListener('message', handleMessage, true);\n\
        return setZeroTimeout;\n\
      };\n\
    }\n\
    var makePromiseAsap = function () {\n\
      // An efficient task-scheduler based on a pre-existing Promise\n\
      // implementation, which we can use even if we override the\n\
      // global Promise below (in order to workaround bugs)\n\
      // https://github.com/Raynos/observ-hash/issues/2#issuecomment-35857671\n\
      var P = globals.Promise;\n\
      return P && P.resolve && function (task) {\n\
        return P.resolve().then(task);\n\
      };\n\
    };\n\
    /*global process */\n\
    var enqueue = ES.IsCallable(globals.setImmediate) ?\n\
      globals.setImmediate.bind(globals) :\n\
      typeof process === 'object' && process.nextTick ? process.nextTick :\n\
      makePromiseAsap() ||\n\
      (ES.IsCallable(makeZeroTimeout) ? makeZeroTimeout() :\n\
      function (task) { setTimeout(task, 0); }); // fallback\n\
\n\
    var updatePromiseFromPotentialThenable = function (x, capability) {\n\
      if (!ES.TypeIsObject(x)) {\n\
        return false;\n\
      }\n\
      var resolve = capability.resolve;\n\
      var reject = capability.reject;\n\
      try {\n\
        var then = x.then; // only one invocation of accessor\n\
        if (!ES.IsCallable(then)) { return false; }\n\
        _call(then, x, resolve, reject);\n\
      } catch (e) {\n\
        reject(e);\n\
      }\n\
      return true;\n\
    };\n\
\n\
    var triggerPromiseReactions = function (reactions, x) {\n\
      _forEach(reactions, function (reaction) {\n\
        enqueue(function () {\n\
          // PromiseReactionTask\n\
          var handler = reaction.handler;\n\
          var capability = reaction.capability;\n\
          var resolve = capability.resolve;\n\
          var reject = capability.reject;\n\
          try {\n\
            var result = handler(x);\n\
            if (result === capability.promise) {\n\
              throw new TypeError('self resolution');\n\
            }\n\
            var updateResult =\n\
              updatePromiseFromPotentialThenable(result, capability);\n\
            if (!updateResult) {\n\
              resolve(result);\n\
            }\n\
          } catch (e) {\n\
            reject(e);\n\
          }\n\
        });\n\
      });\n\
    };\n\
\n\
    var promiseResolutionHandler = function (promise, onFulfilled, onRejected) {\n\
      return function (x) {\n\
        if (x === promise) {\n\
          return onRejected(new TypeError('self resolution'));\n\
        }\n\
        var C = promise._promiseConstructor;\n\
        var capability = new PromiseCapability(C);\n\
        var updateResult = updatePromiseFromPotentialThenable(x, capability);\n\
        if (updateResult) {\n\
          return capability.promise.then(onFulfilled, onRejected);\n\
        } else {\n\
          return onFulfilled(x);\n\
        }\n\
      };\n\
    };\n\
\n\
    var Promise = function Promise(resolver) {\n\
      var promise = this;\n\
      promise = emulateES6construct(promise);\n\
      if (!promise._promiseConstructor) {\n\
        // we use _promiseConstructor as a stand-in for the internal\n\
        // [[PromiseStatus]] field; it's a little more unique.\n\
        throw new TypeError('bad promise');\n\
      }\n\
      if (typeof promise._status !== 'undefined') {\n\
        throw new TypeError('promise already initialized');\n\
      }\n\
      // see https://bugs.ecmascript.org/show_bug.cgi?id=2482\n\
      if (!ES.IsCallable(resolver)) {\n\
        throw new TypeError('not a valid resolver');\n\
      }\n\
      promise._status = 'unresolved';\n\
      promise._resolveReactions = [];\n\
      promise._rejectReactions = [];\n\
\n\
      var resolve = function (resolution) {\n\
        if (promise._status !== 'unresolved') { return; }\n\
        var reactions = promise._resolveReactions;\n\
        promise._result = resolution;\n\
        promise._resolveReactions = void 0;\n\
        promise._rejectReactions = void 0;\n\
        promise._status = 'has-resolution';\n\
        triggerPromiseReactions(reactions, resolution);\n\
      };\n\
      var reject = function (reason) {\n\
        if (promise._status !== 'unresolved') { return; }\n\
        var reactions = promise._rejectReactions;\n\
        promise._result = reason;\n\
        promise._resolveReactions = void 0;\n\
        promise._rejectReactions = void 0;\n\
        promise._status = 'has-rejection';\n\
        triggerPromiseReactions(reactions, reason);\n\
      };\n\
      try {\n\
        resolver(resolve, reject);\n\
      } catch (e) {\n\
        reject(e);\n\
      }\n\
      return promise;\n\
    };\n\
    var Promise$prototype = Promise.prototype;\n\
    var _promiseAllResolver = function (index, values, capability, remaining) {\n\
      var done = false;\n\
      return function (x) {\n\
        if (done) { return; } // protect against being called multiple times\n\
        done = true;\n\
        values[index] = x;\n\
        if ((--remaining.count) === 0) {\n\
          var resolve = capability.resolve;\n\
          resolve(values); // call w/ this===undefined\n\
        }\n\
      };\n\
    };\n\
\n\
    defineProperty(Promise, symbolSpecies, function (obj) {\n\
      var constructor = this;\n\
      // AllocatePromise\n\
      // The `obj` parameter is a hack we use for es5\n\
      // compatibility.\n\
      var prototype = constructor.prototype || Promise$prototype;\n\
      var object = obj || create(prototype);\n\
      defineProperties(object, {\n\
        _status: void 0,\n\
        _result: void 0,\n\
        _resolveReactions: void 0,\n\
        _rejectReactions: void 0,\n\
        _promiseConstructor: void 0\n\
      });\n\
      object._promiseConstructor = constructor;\n\
      return object;\n\
    });\n\
    defineProperties(Promise, {\n\
      all: function all(iterable) {\n\
        var C = this;\n\
        var capability = new PromiseCapability(C);\n\
        var resolve = capability.resolve;\n\
        var reject = capability.reject;\n\
        try {\n\
          if (!ES.IsIterable(iterable)) {\n\
            throw new TypeError('bad iterable');\n\
          }\n\
          var it = ES.GetIterator(iterable);\n\
          var values = [], remaining = { count: 1 };\n\
          for (var index = 0; ; index++) {\n\
            var next = ES.IteratorNext(it);\n\
            if (next.done) {\n\
              break;\n\
            }\n\
            var nextPromise = C.resolve(next.value);\n\
            var resolveElement = _promiseAllResolver(\n\
              index, values, capability, remaining\n\
            );\n\
            remaining.count++;\n\
            nextPromise.then(resolveElement, capability.reject);\n\
          }\n\
          if ((--remaining.count) === 0) {\n\
            resolve(values); // call w/ this===undefined\n\
          }\n\
        } catch (e) {\n\
          reject(e);\n\
        }\n\
        return capability.promise;\n\
      },\n\
\n\
      race: function race(iterable) {\n\
        var C = this;\n\
        var capability = new PromiseCapability(C);\n\
        var resolve = capability.resolve;\n\
        var reject = capability.reject;\n\
        try {\n\
          if (!ES.IsIterable(iterable)) {\n\
            throw new TypeError('bad iterable');\n\
          }\n\
          var it = ES.GetIterator(iterable);\n\
          while (true) {\n\
            var next = ES.IteratorNext(it);\n\
            if (next.done) {\n\
              // If iterable has no items, resulting promise will never\n\
              // resolve; see:\n\
              // https://github.com/domenic/promises-unwrapping/issues/75\n\
              // https://bugs.ecmascript.org/show_bug.cgi?id=2515\n\
              break;\n\
            }\n\
            var nextPromise = C.resolve(next.value);\n\
            nextPromise.then(resolve, reject);\n\
          }\n\
        } catch (e) {\n\
          reject(e);\n\
        }\n\
        return capability.promise;\n\
      },\n\
\n\
      reject: function reject(reason) {\n\
        var C = this;\n\
        var capability = new PromiseCapability(C);\n\
        var rejectPromise = capability.reject;\n\
        rejectPromise(reason); // call with this===undefined\n\
        return capability.promise;\n\
      },\n\
\n\
      resolve: function resolve(v) {\n\
        var C = this;\n\
        if (ES.IsPromise(v)) {\n\
          var constructor = v._promiseConstructor;\n\
          if (constructor === C) { return v; }\n\
        }\n\
        var capability = new PromiseCapability(C);\n\
        var resolvePromise = capability.resolve;\n\
        resolvePromise(v); // call with this===undefined\n\
        return capability.promise;\n\
      }\n\
    });\n\
\n\
    var Identity = function (x) { return x; };\n\
    var Thrower = function (e) { throw e; };\n\
\n\
    defineProperties(Promise$prototype, {\n\
      'catch': function (onRejected) {\n\
        return this.then(void 0, onRejected);\n\
      },\n\
\n\
      then: function then(onFulfilled, onRejected) {\n\
        var promise = this;\n\
        if (!ES.IsPromise(promise)) { throw new TypeError('not a promise'); }\n\
        // this.constructor not this._promiseConstructor; see\n\
        // https://bugs.ecmascript.org/show_bug.cgi?id=2513\n\
        var C = this.constructor;\n\
        var capability = new PromiseCapability(C);\n\
        var rejectHandler = ES.IsCallable(onRejected) ? onRejected : Thrower;\n\
        var fulfillHandler = ES.IsCallable(onFulfilled) ? onFulfilled : Identity;\n\
        var resolutionHandler = promiseResolutionHandler(promise, fulfillHandler, rejectHandler);\n\
        var resolveReaction = { capability: capability, handler: resolutionHandler };\n\
        var rejectReaction = { capability: capability, handler: rejectHandler };\n\
        if (promise._status === 'unresolved') {\n\
          _push(promise._resolveReactions, resolveReaction);\n\
          _push(promise._rejectReactions, rejectReaction);\n\
        } else if (promise._status === 'has-resolution') {\n\
          triggerPromiseReactions([resolveReaction], promise._result);\n\
        } else if (promise._status === 'has-rejection') {\n\
          triggerPromiseReactions([rejectReaction], promise._result);\n\
        } else {\n\
          throw new TypeError('unexpected status');\n\
        }\n\
        return capability.promise;\n\
      }\n\
    });\n\
\n\
    return Promise;\n\
  }());\n\
\n\
  // Chrome's native Promise has extra methods that it shouldn't have. Let's remove them.\n\
  if (globals.Promise) {\n\
    delete globals.Promise.accept;\n\
    delete globals.Promise.defer;\n\
    delete globals.Promise.prototype.chain;\n\
  }\n\
\n\
  // export the Promise constructor.\n\
  defineProperties(globals, { Promise: PromiseShim });\n\
  // In Chrome 33 (and thereabouts) Promise is defined, but the\n\
  // implementation is buggy in a number of ways.  Let's check subclassing\n\
  // support to see if we have a buggy implementation.\n\
  var promiseSupportsSubclassing = supportsSubclassing(globals.Promise, function (S) {\n\
    return S.resolve(42) instanceof S;\n\
  });\n\
  var promiseIgnoresNonFunctionThenCallbacks = !throwsError(function () { globals.Promise.reject(42).then(null, 5).then(null, noop); });\n\
  var promiseRequiresObjectContext = throwsError(function () { globals.Promise.call(3, noop); });\n\
  if (!promiseSupportsSubclassing || !promiseIgnoresNonFunctionThenCallbacks || !promiseRequiresObjectContext) {\n\
    /*globals Promise: true */\n\
    Promise = PromiseShim;\n\
    /*globals Promise: false */\n\
    overrideNative(globals, 'Promise', PromiseShim);\n\
  }\n\
\n\
  // Map and Set require a true ES5 environment\n\
  // Their fast path also requires that the environment preserve\n\
  // property insertion order, which is not guaranteed by the spec.\n\
  var testOrder = function (a) {\n\
    var b = Object.keys(_reduce(a, function (o, k) {\n\
      o[k] = true;\n\
      return o;\n\
    }, {}));\n\
    return a.join(':') === b.join(':');\n\
  };\n\
  var preservesInsertionOrder = testOrder(['z', 'a', 'bb']);\n\
  // some engines (eg, Chrome) only preserve insertion order for string keys\n\
  var preservesNumericInsertionOrder = testOrder(['z', 1, 'a', '3', 2]);\n\
\n\
  if (supportsDescriptors) {\n\
\n\
    var fastkey = function fastkey(key) {\n\
      if (!preservesInsertionOrder) {\n\
        return null;\n\
      }\n\
      var type = typeof key;\n\
      if (type === 'undefined' || key === null) {\n\
        return '^' + String(key);\n\
      } else if (type === 'string') {\n\
        return '$' + key;\n\
      } else if (type === 'number') {\n\
        // note that -0 will get coerced to \"0\" when used as a property key\n\
        if (!preservesNumericInsertionOrder) {\n\
          return 'n' + key;\n\
        }\n\
        return key;\n\
      } else if (type === 'boolean') {\n\
        return 'b' + key;\n\
      }\n\
      return null;\n\
    };\n\
\n\
    var emptyObject = function emptyObject() {\n\
      // accomodate some older not-quite-ES5 browsers\n\
      return Object.create ? Object.create(null) : {};\n\
    };\n\
\n\
    var collectionShims = {\n\
      Map: (function () {\n\
\n\
        var empty = {};\n\
\n\
        var MapEntry = function MapEntry(key, value) {\n\
          this.key = key;\n\
          this.value = value;\n\
          this.next = null;\n\
          this.prev = null;\n\
        };\n\
\n\
        MapEntry.prototype.isRemoved = function isRemoved() {\n\
          return this.key === empty;\n\
        };\n\
\n\
        var isMap = function isMap(map) {\n\
          return !!map._es6map;\n\
        };\n\
\n\
        var requireMapSlot = function requireMapSlot(map, method) {\n\
          if (!ES.TypeIsObject(map) || !isMap(map)) {\n\
            throw new TypeError('Method Map.prototype.' + method + ' called on incompatible receiver ' + String(map));\n\
          }\n\
        };\n\
\n\
        var MapIterator = function MapIterator(map, kind) {\n\
          requireMapSlot(map, '[[MapIterator]]');\n\
          this.head = map._head;\n\
          this.i = this.head;\n\
          this.kind = kind;\n\
        };\n\
\n\
        MapIterator.prototype = {\n\
          next: function next() {\n\
            var i = this.i, kind = this.kind, head = this.head, result;\n\
            if (typeof this.i === 'undefined') {\n\
              return { value: void 0, done: true };\n\
            }\n\
            while (i.isRemoved() && i !== head) {\n\
              // back up off of removed entries\n\
              i = i.prev;\n\
            }\n\
            // advance to next unreturned element.\n\
            while (i.next !== head) {\n\
              i = i.next;\n\
              if (!i.isRemoved()) {\n\
                if (kind === 'key') {\n\
                  result = i.key;\n\
                } else if (kind === 'value') {\n\
                  result = i.value;\n\
                } else {\n\
                  result = [i.key, i.value];\n\
                }\n\
                this.i = i;\n\
                return { value: result, done: false };\n\
              }\n\
            }\n\
            // once the iterator is done, it is done forever.\n\
            this.i = void 0;\n\
            return { value: void 0, done: true };\n\
          }\n\
        };\n\
        addIterator(MapIterator.prototype);\n\
\n\
        var MapShim = function Map() {\n\
          var map = this;\n\
          if (!ES.TypeIsObject(map)) {\n\
            throw new TypeError(\"Constructor Map requires 'new'\");\n\
          }\n\
          map = emulateES6construct(map);\n\
          if (!map._es6map) {\n\
            throw new TypeError('bad map');\n\
          }\n\
\n\
          var head = new MapEntry(null, null);\n\
          // circular doubly-linked list.\n\
          head.next = head.prev = head;\n\
\n\
          defineProperties(map, {\n\
            _head: head,\n\
            _storage: emptyObject(),\n\
            _size: 0\n\
          });\n\
\n\
          // Optionally initialize map from iterable\n\
          if (arguments.length > 0 && typeof arguments[0] !== 'undefined' && arguments[0] !== null) {\n\
            var it = ES.GetIterator(arguments[0]);\n\
            var adder = map.set;\n\
            if (!ES.IsCallable(adder)) { throw new TypeError('bad map'); }\n\
            while (true) {\n\
              var next = ES.IteratorNext(it);\n\
              if (next.done) { break; }\n\
              var nextItem = next.value;\n\
              if (!ES.TypeIsObject(nextItem)) {\n\
                throw new TypeError('expected iterable of pairs');\n\
              }\n\
              _call(adder, map, nextItem[0], nextItem[1]);\n\
            }\n\
          }\n\
          return map;\n\
        };\n\
        var Map$prototype = MapShim.prototype;\n\
        defineProperty(MapShim, symbolSpecies, function (obj) {\n\
          var constructor = this;\n\
          var prototype = constructor.prototype || Map$prototype;\n\
          var object = obj || create(prototype);\n\
          defineProperties(object, { _es6map: true });\n\
          return object;\n\
        });\n\
\n\
        Value.getter(Map$prototype, 'size', function () {\n\
          if (typeof this._size === 'undefined') {\n\
            throw new TypeError('size method called on incompatible Map');\n\
          }\n\
          return this._size;\n\
        });\n\
\n\
        defineProperties(Map$prototype, {\n\
          get: function get(key) {\n\
            requireMapSlot(this, 'get');\n\
            var fkey = fastkey(key);\n\
            if (fkey !== null) {\n\
              // fast O(1) path\n\
              var entry = this._storage[fkey];\n\
              if (entry) {\n\
                return entry.value;\n\
              } else {\n\
                return;\n\
              }\n\
            }\n\
            var head = this._head, i = head;\n\
            while ((i = i.next) !== head) {\n\
              if (ES.SameValueZero(i.key, key)) {\n\
                return i.value;\n\
              }\n\
            }\n\
          },\n\
\n\
          has: function has(key) {\n\
            requireMapSlot(this, 'has');\n\
            var fkey = fastkey(key);\n\
            if (fkey !== null) {\n\
              // fast O(1) path\n\
              return typeof this._storage[fkey] !== 'undefined';\n\
            }\n\
            var head = this._head, i = head;\n\
            while ((i = i.next) !== head) {\n\
              if (ES.SameValueZero(i.key, key)) {\n\
                return true;\n\
              }\n\
            }\n\
            return false;\n\
          },\n\
\n\
          set: function set(key, value) {\n\
            requireMapSlot(this, 'set');\n\
            var head = this._head, i = head, entry;\n\
            var fkey = fastkey(key);\n\
            if (fkey !== null) {\n\
              // fast O(1) path\n\
              if (typeof this._storage[fkey] !== 'undefined') {\n\
                this._storage[fkey].value = value;\n\
                return this;\n\
              } else {\n\
                entry = this._storage[fkey] = new MapEntry(key, value);\n\
                i = head.prev;\n\
                // fall through\n\
              }\n\
            }\n\
            while ((i = i.next) !== head) {\n\
              if (ES.SameValueZero(i.key, key)) {\n\
                i.value = value;\n\
                return this;\n\
              }\n\
            }\n\
            entry = entry || new MapEntry(key, value);\n\
            if (ES.SameValue(-0, key)) {\n\
              entry.key = +0; // coerce -0 to +0 in entry\n\
            }\n\
            entry.next = this._head;\n\
            entry.prev = this._head.prev;\n\
            entry.prev.next = entry;\n\
            entry.next.prev = entry;\n\
            this._size += 1;\n\
            return this;\n\
          },\n\
\n\
          'delete': function (key) {\n\
            requireMapSlot(this, 'delete');\n\
            var head = this._head, i = head;\n\
            var fkey = fastkey(key);\n\
            if (fkey !== null) {\n\
              // fast O(1) path\n\
              if (typeof this._storage[fkey] === 'undefined') {\n\
                return false;\n\
              }\n\
              i = this._storage[fkey].prev;\n\
              delete this._storage[fkey];\n\
              // fall through\n\
            }\n\
            while ((i = i.next) !== head) {\n\
              if (ES.SameValueZero(i.key, key)) {\n\
                i.key = i.value = empty;\n\
                i.prev.next = i.next;\n\
                i.next.prev = i.prev;\n\
                this._size -= 1;\n\
                return true;\n\
              }\n\
            }\n\
            return false;\n\
          },\n\
\n\
          clear: function clear() {\n\
            requireMapSlot(this, 'clear');\n\
            this._size = 0;\n\
            this._storage = emptyObject();\n\
            var head = this._head, i = head, p = i.next;\n\
            while ((i = p) !== head) {\n\
              i.key = i.value = empty;\n\
              p = i.next;\n\
              i.next = i.prev = head;\n\
            }\n\
            head.next = head.prev = head;\n\
          },\n\
\n\
          keys: function keys() {\n\
            requireMapSlot(this, 'keys');\n\
            return new MapIterator(this, 'key');\n\
          },\n\
\n\
          values: function values() {\n\
            requireMapSlot(this, 'values');\n\
            return new MapIterator(this, 'value');\n\
          },\n\
\n\
          entries: function entries() {\n\
            requireMapSlot(this, 'entries');\n\
            return new MapIterator(this, 'key+value');\n\
          },\n\
\n\
          forEach: function forEach(callback) {\n\
            requireMapSlot(this, 'forEach');\n\
            var context = arguments.length > 1 ? arguments[1] : null;\n\
            var it = this.entries();\n\
            for (var entry = it.next(); !entry.done; entry = it.next()) {\n\
              if (context) {\n\
                _call(callback, context, entry.value[1], entry.value[0], this);\n\
              } else {\n\
                callback(entry.value[1], entry.value[0], this);\n\
              }\n\
            }\n\
          }\n\
        });\n\
        addIterator(Map$prototype, Map$prototype.entries);\n\
\n\
        return MapShim;\n\
      }()),\n\
\n\
      Set: (function () {\n\
        var isSet = function isSet(set) {\n\
          return set._es6set && typeof set._storage !== 'undefined';\n\
        };\n\
        var requireSetSlot = function requireSetSlot(set, method) {\n\
          if (!ES.TypeIsObject(set) || !isSet(set)) {\n\
            // https://github.com/paulmillr/es6-shim/issues/176\n\
            throw new TypeError('Set.prototype.' + method + ' called on incompatible receiver ' + String(set));\n\
          }\n\
        };\n\
\n\
        // Creating a Map is expensive.  To speed up the common case of\n\
        // Sets containing only string or numeric keys, we use an object\n\
        // as backing storage and lazily create a full Map only when\n\
        // required.\n\
        var SetShim = function Set() {\n\
          var set = this;\n\
          if (!ES.TypeIsObject(set)) {\n\
            throw new TypeError(\"Constructor Set requires 'new'\");\n\
          }\n\
          set = emulateES6construct(set);\n\
          if (!set._es6set) {\n\
            throw new TypeError('bad set');\n\
          }\n\
\n\
          defineProperties(set, {\n\
            '[[SetData]]': null,\n\
            _storage: emptyObject()\n\
          });\n\
\n\
          // Optionally initialize Set from iterable\n\
          if (arguments.length > 0 && typeof arguments[0] !== 'undefined' && arguments[0] !== null) {\n\
            var iterable = arguments[0];\n\
            var it = ES.GetIterator(iterable);\n\
            var adder = set.add;\n\
            if (!ES.IsCallable(adder)) { throw new TypeError('bad set'); }\n\
            while (true) {\n\
              var next = ES.IteratorNext(it);\n\
              if (next.done) { break; }\n\
              var nextItem = next.value;\n\
              _call(adder, set, nextItem);\n\
            }\n\
          }\n\
          return set;\n\
        };\n\
        var Set$prototype = SetShim.prototype;\n\
        defineProperty(SetShim, symbolSpecies, function (obj) {\n\
          var constructor = this;\n\
          var prototype = constructor.prototype || Set$prototype;\n\
          var object = obj || create(prototype);\n\
          defineProperties(object, { _es6set: true });\n\
          return object;\n\
        });\n\
\n\
        // Switch from the object backing storage to a full Map.\n\
        var ensureMap = function ensureMap(set) {\n\
          if (!set['[[SetData]]']) {\n\
            var m = set['[[SetData]]'] = new collectionShims.Map();\n\
            _forEach(Object.keys(set._storage), function (k) {\n\
              if (k === '^null') {\n\
                k = null;\n\
              } else if (k === '^undefined') {\n\
                k = void 0;\n\
              } else {\n\
                var first = k.charAt(0);\n\
                if (first === '$') {\n\
                  k = _strSlice(k, 1);\n\
                } else if (first === 'n') {\n\
                  k = +_strSlice(k, 1);\n\
                } else if (first === 'b') {\n\
                  k = k === 'btrue';\n\
                } else {\n\
                  k = +k;\n\
                }\n\
              }\n\
              m.set(k, k);\n\
            });\n\
            set._storage = null; // free old backing storage\n\
          }\n\
        };\n\
\n\
        Value.getter(SetShim.prototype, 'size', function () {\n\
          requireSetSlot(this, 'size');\n\
          ensureMap(this);\n\
          return this['[[SetData]]'].size;\n\
        });\n\
\n\
        defineProperties(SetShim.prototype, {\n\
          has: function has(key) {\n\
            requireSetSlot(this, 'has');\n\
            var fkey;\n\
            if (this._storage && (fkey = fastkey(key)) !== null) {\n\
              return !!this._storage[fkey];\n\
            }\n\
            ensureMap(this);\n\
            return this['[[SetData]]'].has(key);\n\
          },\n\
\n\
          add: function add(key) {\n\
            requireSetSlot(this, 'add');\n\
            var fkey;\n\
            if (this._storage && (fkey = fastkey(key)) !== null) {\n\
              this._storage[fkey] = true;\n\
              return this;\n\
            }\n\
            ensureMap(this);\n\
            this['[[SetData]]'].set(key, key);\n\
            return this;\n\
          },\n\
\n\
          'delete': function (key) {\n\
            requireSetSlot(this, 'delete');\n\
            var fkey;\n\
            if (this._storage && (fkey = fastkey(key)) !== null) {\n\
              var hasFKey = _hasOwnProperty(this._storage, fkey);\n\
              return (delete this._storage[fkey]) && hasFKey;\n\
            }\n\
            ensureMap(this);\n\
            return this['[[SetData]]']['delete'](key);\n\
          },\n\
\n\
          clear: function clear() {\n\
            requireSetSlot(this, 'clear');\n\
            if (this._storage) {\n\
              this._storage = emptyObject();\n\
            } else {\n\
              this['[[SetData]]'].clear();\n\
            }\n\
          },\n\
\n\
          values: function values() {\n\
            requireSetSlot(this, 'values');\n\
            ensureMap(this);\n\
            return this['[[SetData]]'].values();\n\
          },\n\
\n\
          entries: function entries() {\n\
            requireSetSlot(this, 'entries');\n\
            ensureMap(this);\n\
            return this['[[SetData]]'].entries();\n\
          },\n\
\n\
          forEach: function forEach(callback) {\n\
            requireSetSlot(this, 'forEach');\n\
            var context = arguments.length > 1 ? arguments[1] : null;\n\
            var entireSet = this;\n\
            ensureMap(entireSet);\n\
            this['[[SetData]]'].forEach(function (value, key) {\n\
              if (context) {\n\
                _call(callback, context, key, key, entireSet);\n\
              } else {\n\
                callback(key, key, entireSet);\n\
              }\n\
            });\n\
          }\n\
        });\n\
        defineProperty(SetShim.prototype, 'keys', SetShim.prototype.values, true);\n\
        addIterator(SetShim.prototype, SetShim.prototype.values);\n\
\n\
        return SetShim;\n\
      }())\n\
    };\n\
    defineProperties(globals, collectionShims);\n\
\n\
    if (globals.Map || globals.Set) {\n\
      // Safari 8, for example, doesn't accept an iterable.\n\
      var mapAcceptsArguments = valueOrFalseIfThrows(function () { return new Map([[1, 2]]).get(1) === 2; });\n\
      if (!mapAcceptsArguments) {\n\
        var OrigMapNoArgs = globals.Map;\n\
        globals.Map = function Map() {\n\
          if (!(this instanceof Map)) {\n\
            throw new TypeError('Constructor Map requires \"new\"');\n\
          }\n\
          var m = new OrigMapNoArgs();\n\
          var iterable;\n\
          if (arguments.length > 0) {\n\
            iterable = arguments[0];\n\
          }\n\
          if (Array.isArray(iterable) || Type.string(iterable)) {\n\
            _forEach(iterable, function (entry) {\n\
              m.set(entry[0], entry[1]);\n\
            });\n\
          } else if (iterable instanceof Map) {\n\
            _call(Map.prototype.forEach, iterable, function (value, key) {\n\
              m.set(key, value);\n\
            });\n\
          }\n\
          Object.setPrototypeOf(m, globals.Map.prototype);\n\
          defineProperty(m, 'constructor', Map, true);\n\
          return m;\n\
        };\n\
        globals.Map.prototype = create(OrigMapNoArgs.prototype);\n\
        Value.preserveToString(globals.Map, OrigMapNoArgs);\n\
      }\n\
      var testMap = new Map();\n\
      var mapUsesSameValueZero = (function (m) {\n\
        m['delete'](0);\n\
        m['delete'](-0);\n\
        m.set(0, 3);\n\
        m.get(-0, 4);\n\
        return m.get(0) === 3 && m.get(-0) === 4;\n\
      }(testMap));\n\
      var mapSupportsChaining = testMap.set(1, 2) === testMap;\n\
      if (!mapUsesSameValueZero || !mapSupportsChaining) {\n\
        var origMapSet = Map.prototype.set;\n\
        overrideNative(Map.prototype, 'set', function set(k, v) {\n\
          _call(origMapSet, this, k === 0 ? 0 : k, v);\n\
          return this;\n\
        });\n\
      }\n\
      if (!mapUsesSameValueZero) {\n\
        var origMapGet = Map.prototype.get;\n\
        var origMapHas = Map.prototype.has;\n\
        defineProperties(Map.prototype, {\n\
          get: function get(k) {\n\
            return _call(origMapGet, this, k === 0 ? 0 : k);\n\
          },\n\
          has: function has(k) {\n\
            return _call(origMapHas, this, k === 0 ? 0 : k);\n\
          }\n\
        }, true);\n\
        Value.preserveToString(Map.prototype.get, origMapGet);\n\
        Value.preserveToString(Map.prototype.has, origMapHas);\n\
      }\n\
      var testSet = new Set();\n\
      var setUsesSameValueZero = (function (s) {\n\
        s['delete'](0);\n\
        s.add(-0);\n\
        return !s.has(0);\n\
      }(testSet));\n\
      var setSupportsChaining = testSet.add(1) === testSet;\n\
      if (!setUsesSameValueZero || !setSupportsChaining) {\n\
        var origSetAdd = Set.prototype.add;\n\
        Set.prototype.add = function add(v) {\n\
          _call(origSetAdd, this, v === 0 ? 0 : v);\n\
          return this;\n\
        };\n\
        Value.preserveToString(Set.prototype.add, origSetAdd);\n\
      }\n\
      if (!setUsesSameValueZero) {\n\
        var origSetHas = Set.prototype.has;\n\
        Set.prototype.has = function has(v) {\n\
          return _call(origSetHas, this, v === 0 ? 0 : v);\n\
        };\n\
        Value.preserveToString(Set.prototype.has, origSetHas);\n\
        var origSetDel = Set.prototype['delete'];\n\
        Set.prototype['delete'] = function SetDelete(v) {\n\
          return _call(origSetDel, this, v === 0 ? 0 : v);\n\
        };\n\
        Value.preserveToString(Set.prototype['delete'], origSetDel);\n\
      }\n\
      var mapSupportsSubclassing = supportsSubclassing(globals.Map, function (M) {\n\
        var m = new M([]);\n\
        // Firefox 32 is ok with the instantiating the subclass but will\n\
        // throw when the map is used.\n\
        m.set(42, 42);\n\
        return m instanceof M;\n\
      });\n\
      var mapFailsToSupportSubclassing = Object.setPrototypeOf && !mapSupportsSubclassing; // without Object.setPrototypeOf, subclassing is not possible\n\
      var mapRequiresNew = (function () {\n\
        try {\n\
          return !(globals.Map() instanceof globals.Map);\n\
        } catch (e) {\n\
          return e instanceof TypeError;\n\
        }\n\
      }());\n\
      if (globals.Map.length !== 0 || mapFailsToSupportSubclassing || !mapRequiresNew) {\n\
        var OrigMap = globals.Map;\n\
        globals.Map = function Map() {\n\
          if (!(this instanceof Map)) {\n\
            throw new TypeError('Constructor Map requires \"new\"');\n\
          }\n\
          var m = arguments.length > 0 ? new OrigMap(arguments[0]) : new OrigMap();\n\
          Object.setPrototypeOf(m, Map.prototype);\n\
          defineProperty(m, 'constructor', Map, true);\n\
          return m;\n\
        };\n\
        globals.Map.prototype = OrigMap.prototype;\n\
        Value.preserveToString(globals.Map, OrigMap);\n\
      }\n\
      var setSupportsSubclassing = supportsSubclassing(globals.Set, function (S) {\n\
        var s = new S([]);\n\
        s.add(42, 42);\n\
        return s instanceof S;\n\
      });\n\
      var setFailsToSupportSubclassing = Object.setPrototypeOf && !setSupportsSubclassing; // without Object.setPrototypeOf, subclassing is not possible\n\
      var setRequiresNew = (function () {\n\
        try {\n\
          return !(globals.Set() instanceof globals.Set);\n\
        } catch (e) {\n\
          return e instanceof TypeError;\n\
        }\n\
      }());\n\
      if (globals.Set.length !== 0 || setFailsToSupportSubclassing || !setRequiresNew) {\n\
        var OrigSet = globals.Set;\n\
        globals.Set = function Set() {\n\
          if (!(this instanceof Set)) {\n\
            throw new TypeError('Constructor Set requires \"new\"');\n\
          }\n\
          var s = arguments.length > 0 ? new OrigSet(arguments[0]) : new OrigSet();\n\
          Object.setPrototypeOf(s, Set.prototype);\n\
          defineProperty(s, 'constructor', Set, true);\n\
          return s;\n\
        };\n\
        globals.Set.prototype = OrigSet.prototype;\n\
        Value.preserveToString(globals.Set, OrigSet);\n\
      }\n\
      var mapIterationThrowsStopIterator = !valueOrFalseIfThrows(function () {\n\
        return (new Map()).keys().next().done;\n\
      });\n\
      /*\n\
        - In Firefox < 23, Map#size is a function.\n\
        - In all current Firefox, Set#entries/keys/values & Map#clear do not exist\n\
        - https://bugzilla.mozilla.org/show_bug.cgi?id=869996\n\
        - In Firefox 24, Map and Set do not implement forEach\n\
        - In Firefox 25 at least, Map and Set are callable without \"new\"\n\
      */\n\
      if (\n\
        typeof globals.Map.prototype.clear !== 'function' ||\n\
        new globals.Set().size !== 0 ||\n\
        new globals.Map().size !== 0 ||\n\
        typeof globals.Map.prototype.keys !== 'function' ||\n\
        typeof globals.Set.prototype.keys !== 'function' ||\n\
        typeof globals.Map.prototype.forEach !== 'function' ||\n\
        typeof globals.Set.prototype.forEach !== 'function' ||\n\
        isCallableWithoutNew(globals.Map) ||\n\
        isCallableWithoutNew(globals.Set) ||\n\
        typeof (new globals.Map().keys().next) !== 'function' || // Safari 8\n\
        mapIterationThrowsStopIterator || // Firefox 25\n\
        !mapSupportsSubclassing\n\
      ) {\n\
        delete globals.Map; // necessary to overwrite in Safari 8\n\
        delete globals.Set; // necessary to overwrite in Safari 8\n\
        defineProperties(globals, {\n\
          Map: collectionShims.Map,\n\
          Set: collectionShims.Set\n\
        }, true);\n\
      }\n\
    }\n\
    if (globals.Set.prototype.keys !== globals.Set.prototype.values) {\n\
      // Fixed in WebKit with https://bugs.webkit.org/show_bug.cgi?id=144190\n\
      defineProperty(globals.Set.prototype, 'keys', globals.Set.prototype.values, true);\n\
    }\n\
    // Shim incomplete iterator implementations.\n\
    addIterator(Object.getPrototypeOf((new globals.Map()).keys()));\n\
    addIterator(Object.getPrototypeOf((new globals.Set()).keys()));\n\
  }\n\
\n\
  // Reflect\n\
  if (!globals.Reflect) {\n\
    defineProperty(globals, 'Reflect', {});\n\
  }\n\
  var Reflect = globals.Reflect;\n\
\n\
  var throwUnlessTargetIsObject = function throwUnlessTargetIsObject(target) {\n\
    if (!ES.TypeIsObject(target)) {\n\
      throw new TypeError('target must be an object');\n\
    }\n\
  };\n\
\n\
  // Some Reflect methods are basically the same as\n\
  // those on the Object global, except that a TypeError is thrown if\n\
  // target isn't an object. As well as returning a boolean indicating\n\
  // the success of the operation.\n\
  defineProperties(globals.Reflect, {\n\
    // Apply method in a functional form.\n\
    apply: function apply() {\n\
      return _apply(ES.Call, null, arguments);\n\
    },\n\
\n\
    // New operator in a functional form.\n\
    construct: function construct(constructor, args) {\n\
      if (!ES.IsCallable(constructor)) {\n\
        throw new TypeError('First argument must be callable.');\n\
      }\n\
\n\
      return ES.Construct(constructor, args);\n\
    },\n\
\n\
    // When deleting a non-existent or configurable property,\n\
    // true is returned.\n\
    // When attempting to delete a non-configurable property,\n\
    // it will return false.\n\
    deleteProperty: function deleteProperty(target, key) {\n\
      throwUnlessTargetIsObject(target);\n\
      if (supportsDescriptors) {\n\
        var desc = Object.getOwnPropertyDescriptor(target, key);\n\
\n\
        if (desc && !desc.configurable) {\n\
          return false;\n\
        }\n\
      }\n\
\n\
      // Will return true.\n\
      return delete target[key];\n\
    },\n\
\n\
    enumerate: function enumerate(target) {\n\
      throwUnlessTargetIsObject(target);\n\
      return new ObjectIterator(target, 'key');\n\
    },\n\
\n\
    has: function has(target, key) {\n\
      throwUnlessTargetIsObject(target);\n\
      return key in target;\n\
    }\n\
  });\n\
\n\
  if (Object.getOwnPropertyNames) {\n\
    defineProperties(globals.Reflect, {\n\
      // Basically the result of calling the internal [[OwnPropertyKeys]].\n\
      // Concatenating propertyNames and propertySymbols should do the trick.\n\
      // This should continue to work together with a Symbol shim\n\
      // which overrides Object.getOwnPropertyNames and implements\n\
      // Object.getOwnPropertySymbols.\n\
      ownKeys: function ownKeys(target) {\n\
        throwUnlessTargetIsObject(target);\n\
        var keys = Object.getOwnPropertyNames(target);\n\
\n\
        if (ES.IsCallable(Object.getOwnPropertySymbols)) {\n\
          _pushApply(keys, Object.getOwnPropertySymbols(target));\n\
        }\n\
\n\
        return keys;\n\
      }\n\
    });\n\
  }\n\
\n\
  var callAndCatchException = function ConvertExceptionToBoolean(func) {\n\
    return !throwsError(func);\n\
  };\n\
\n\
  if (Object.preventExtensions) {\n\
    defineProperties(globals.Reflect, {\n\
      isExtensible: function isExtensible(target) {\n\
        throwUnlessTargetIsObject(target);\n\
        return Object.isExtensible(target);\n\
      },\n\
      preventExtensions: function preventExtensions(target) {\n\
        throwUnlessTargetIsObject(target);\n\
        return callAndCatchException(function () {\n\
          Object.preventExtensions(target);\n\
        });\n\
      }\n\
    });\n\
  }\n\
\n\
  if (supportsDescriptors) {\n\
    var internalGet = function get(target, key, receiver) {\n\
      var desc = Object.getOwnPropertyDescriptor(target, key);\n\
\n\
      if (!desc) {\n\
        var parent = Object.getPrototypeOf(target);\n\
\n\
        if (parent === null) {\n\
          return undefined;\n\
        }\n\
\n\
        return internalGet(parent, key, receiver);\n\
      }\n\
\n\
      if ('value' in desc) {\n\
        return desc.value;\n\
      }\n\
\n\
      if (desc.get) {\n\
        return _call(desc.get, receiver);\n\
      }\n\
\n\
      return undefined;\n\
    };\n\
\n\
    var internalSet = function set(target, key, value, receiver) {\n\
      var desc = Object.getOwnPropertyDescriptor(target, key);\n\
\n\
      if (!desc) {\n\
        var parent = Object.getPrototypeOf(target);\n\
\n\
        if (parent !== null) {\n\
          return internalSet(parent, key, value, receiver);\n\
        }\n\
\n\
        desc = {\n\
          value: void 0,\n\
          writable: true,\n\
          enumerable: true,\n\
          configurable: true\n\
        };\n\
      }\n\
\n\
      if ('value' in desc) {\n\
        if (!desc.writable) {\n\
          return false;\n\
        }\n\
\n\
        if (!ES.TypeIsObject(receiver)) {\n\
          return false;\n\
        }\n\
\n\
        var existingDesc = Object.getOwnPropertyDescriptor(receiver, key);\n\
\n\
        if (existingDesc) {\n\
          return Reflect.defineProperty(receiver, key, {\n\
            value: value\n\
          });\n\
        } else {\n\
          return Reflect.defineProperty(receiver, key, {\n\
            value: value,\n\
            writable: true,\n\
            enumerable: true,\n\
            configurable: true\n\
          });\n\
        }\n\
      }\n\
\n\
      if (desc.set) {\n\
        _call(desc.set, receiver, value);\n\
        return true;\n\
      }\n\
\n\
      return false;\n\
    };\n\
\n\
    defineProperties(globals.Reflect, {\n\
      defineProperty: function defineProperty(target, propertyKey, attributes) {\n\
        throwUnlessTargetIsObject(target);\n\
        return callAndCatchException(function () {\n\
          Object.defineProperty(target, propertyKey, attributes);\n\
        });\n\
      },\n\
\n\
      getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {\n\
        throwUnlessTargetIsObject(target);\n\
        return Object.getOwnPropertyDescriptor(target, propertyKey);\n\
      },\n\
\n\
      // Syntax in a functional form.\n\
      get: function get(target, key) {\n\
        throwUnlessTargetIsObject(target);\n\
        var receiver = arguments.length > 2 ? arguments[2] : target;\n\
\n\
        return internalGet(target, key, receiver);\n\
      },\n\
\n\
      set: function set(target, key, value) {\n\
        throwUnlessTargetIsObject(target);\n\
        var receiver = arguments.length > 3 ? arguments[3] : target;\n\
\n\
        return internalSet(target, key, value, receiver);\n\
      }\n\
    });\n\
  }\n\
\n\
  if (Object.getPrototypeOf) {\n\
    var objectDotGetPrototypeOf = Object.getPrototypeOf;\n\
    defineProperties(globals.Reflect, {\n\
      getPrototypeOf: function getPrototypeOf(target) {\n\
        throwUnlessTargetIsObject(target);\n\
        return objectDotGetPrototypeOf(target);\n\
      }\n\
    });\n\
  }\n\
\n\
  if (Object.setPrototypeOf) {\n\
    var willCreateCircularPrototype = function (object, proto) {\n\
      while (proto) {\n\
        if (object === proto) {\n\
          return true;\n\
        }\n\
        proto = Reflect.getPrototypeOf(proto);\n\
      }\n\
      return false;\n\
    };\n\
\n\
    defineProperties(globals.Reflect, {\n\
      // Sets the prototype of the given object.\n\
      // Returns true on success, otherwise false.\n\
      setPrototypeOf: function setPrototypeOf(object, proto) {\n\
        throwUnlessTargetIsObject(object);\n\
        if (proto !== null && !ES.TypeIsObject(proto)) {\n\
          throw new TypeError('proto must be an object or null');\n\
        }\n\
\n\
        // If they already are the same, we're done.\n\
        if (proto === Reflect.getPrototypeOf(object)) {\n\
          return true;\n\
        }\n\
\n\
        // Cannot alter prototype if object not extensible.\n\
        if (Reflect.isExtensible && !Reflect.isExtensible(object)) {\n\
          return false;\n\
        }\n\
\n\
        // Ensure that we do not create a circular prototype chain.\n\
        if (willCreateCircularPrototype(object, proto)) {\n\
          return false;\n\
        }\n\
\n\
        Object.setPrototypeOf(object, proto);\n\
\n\
        return true;\n\
      }\n\
    });\n\
  }\n\
\n\
  if (String(new Date(NaN)) !== 'Invalid Date') {\n\
    var dateToString = Date.prototype.toString;\n\
    var shimmedDateToString = function toString() {\n\
      var valueOf = +this;\n\
      if (valueOf !== valueOf) {\n\
        return 'Invalid Date';\n\
      }\n\
      return _call(dateToString, this);\n\
    };\n\
    overrideNative(Date.prototype, 'toString', shimmedDateToString);\n\
  }\n\
\n\
  // Annex B HTML methods\n\
  // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-additional-properties-of-the-string.prototype-object\n\
  var stringHTMLshims = {\n\
    anchor: function anchor(name) { return ES.CreateHTML(this, 'a', 'name', name); },\n\
    big: function big() { return ES.CreateHTML(this, 'big', '', ''); },\n\
    blink: function blink() { return ES.CreateHTML(this, 'blink', '', ''); },\n\
    bold: function bold() { return ES.CreateHTML(this, 'b', '', ''); },\n\
    fixed: function fixed() { return ES.CreateHTML(this, 'tt', '', ''); },\n\
    fontcolor: function fontcolor(color) { return ES.CreateHTML(this, 'font', 'color', color); },\n\
    fontsize: function fontsize(size) { return ES.CreateHTML(this, 'font', 'size', size); },\n\
    italics: function italics() { return ES.CreateHTML(this, 'i', '', ''); },\n\
    link: function link(url) { return ES.CreateHTML(this, 'a', 'href', url); },\n\
    small: function small() { return ES.CreateHTML(this, 'small', '', ''); },\n\
    strike: function strike() { return ES.CreateHTML(this, 'strike', '', ''); },\n\
    sub: function sub() { return ES.CreateHTML(this, 'sub', '', ''); },\n\
    sup: function sub() { return ES.CreateHTML(this, 'sup', '', ''); }\n\
  };\n\
  defineProperties(String.prototype, stringHTMLshims);\n\
  _forEach(Object.keys(stringHTMLshims), function (key) {\n\
    var method = String.prototype[key];\n\
    var shouldOverwrite = false;\n\
    if (ES.IsCallable(method)) {\n\
      var output = _call(method, '', ' \" ');\n\
      var quotesCount = _concat([], output.match(/\"/g)).length;\n\
      shouldOverwrite = output !== output.toLowerCase() || quotesCount > 2;\n\
    } else {\n\
      shouldOverwrite = true;\n\
    }\n\
    if (shouldOverwrite) {\n\
      defineProperty(String.prototype, key, stringHTMLshims[key], true);\n\
    }\n\
  });\n\
\n\
  return globals;\n\
}));\n\
\n\
//# sourceURL=components/es-shims/es6-shim/0.31.3/es6-shim.js"
));

require.modules["es-shims-es6-shim"] = require.modules["es-shims~es6-shim@0.31.3"];
require.modules["es-shims~es6-shim"] = require.modules["es-shims~es6-shim@0.31.3"];
require.modules["es6-shim"] = require.modules["es-shims~es6-shim@0.31.3"];


require.register("kpwebb~select2@3.4.8", Function("exports, module",
"/*\n\
Copyright 2012 Igor Vaynberg\n\
\n\
Version: 3.4.8 Timestamp: Thu May  1 09:50:32 EDT 2014\n\
\n\
This software is licensed under the Apache License, Version 2.0 (the \"Apache License\") or the GNU\n\
General Public License version 2 (the \"GPL License\"). You may choose either license to govern your\n\
use of this software only upon the condition that you accept all of the terms of either the Apache\n\
License or the GPL License.\n\
\n\
You may obtain a copy of the Apache License and the GPL License at:\n\
\n\
    http://www.apache.org/licenses/LICENSE-2.0\n\
    http://www.gnu.org/licenses/gpl-2.0.html\n\
\n\
Unless required by applicable law or agreed to in writing, software distributed under the\n\
Apache License or the GPL License is distributed on an \"AS IS\" BASIS, WITHOUT WARRANTIES OR\n\
CONDITIONS OF ANY KIND, either express or implied. See the Apache License and the GPL License for\n\
the specific language governing permissions and limitations under the Apache License and the GPL License.\n\
*/\n\
(function ($) {\n\
    if(typeof $.fn.each2 == \"undefined\") {\n\
        $.extend($.fn, {\n\
            /*\n\
            * 4-10 times faster .each replacement\n\
            * use it carefully, as it overrides jQuery context of element on each iteration\n\
            */\n\
            each2 : function (c) {\n\
                var j = $([0]), i = -1, l = this.length;\n\
                while (\n\
                    ++i < l\n\
                    && (j.context = j[0] = this[i])\n\
                    && c.call(j[0], i, j) !== false //\"this\"=DOM, i=index, j=jQuery object\n\
                );\n\
                return this;\n\
            }\n\
        });\n\
    }\n\
})(jQuery);\n\
\n\
(function ($, undefined) {\n\
    \"use strict\";\n\
    /*global document, window, jQuery, console */\n\
\n\
    if (window.Select2 !== undefined) {\n\
        return;\n\
    }\n\
\n\
    var KEY, AbstractSelect2, SingleSelect2, MultiSelect2, nextUid, sizer,\n\
        lastMousePosition={x:0,y:0}, $document, scrollBarDimensions,\n\
\n\
    KEY = {\n\
        TAB: 9,\n\
        ENTER: 13,\n\
        ESC: 27,\n\
        SPACE: 32,\n\
        LEFT: 37,\n\
        UP: 38,\n\
        RIGHT: 39,\n\
        DOWN: 40,\n\
        SHIFT: 16,\n\
        CTRL: 17,\n\
        ALT: 18,\n\
        PAGE_UP: 33,\n\
        PAGE_DOWN: 34,\n\
        HOME: 36,\n\
        END: 35,\n\
        BACKSPACE: 8,\n\
        DELETE: 46,\n\
        isArrow: function (k) {\n\
            k = k.which ? k.which : k;\n\
            switch (k) {\n\
            case KEY.LEFT:\n\
            case KEY.RIGHT:\n\
            case KEY.UP:\n\
            case KEY.DOWN:\n\
                return true;\n\
            }\n\
            return false;\n\
        },\n\
        isControl: function (e) {\n\
            var k = e.which;\n\
            switch (k) {\n\
            case KEY.SHIFT:\n\
            case KEY.CTRL:\n\
            case KEY.ALT:\n\
                return true;\n\
            }\n\
\n\
            if (e.metaKey) return true;\n\
\n\
            return false;\n\
        },\n\
        isFunctionKey: function (k) {\n\
            k = k.which ? k.which : k;\n\
            return k >= 112 && k <= 123;\n\
        }\n\
    },\n\
    MEASURE_SCROLLBAR_TEMPLATE = \"<div class='select2-measure-scrollbar'></div>\",\n\
\n\
    DIACRITICS = {\"\\u24B6\":\"A\",\"\\uFF21\":\"A\",\"\\u00C0\":\"A\",\"\\u00C1\":\"A\",\"\\u00C2\":\"A\",\"\\u1EA6\":\"A\",\"\\u1EA4\":\"A\",\"\\u1EAA\":\"A\",\"\\u1EA8\":\"A\",\"\\u00C3\":\"A\",\"\\u0100\":\"A\",\"\\u0102\":\"A\",\"\\u1EB0\":\"A\",\"\\u1EAE\":\"A\",\"\\u1EB4\":\"A\",\"\\u1EB2\":\"A\",\"\\u0226\":\"A\",\"\\u01E0\":\"A\",\"\\u00C4\":\"A\",\"\\u01DE\":\"A\",\"\\u1EA2\":\"A\",\"\\u00C5\":\"A\",\"\\u01FA\":\"A\",\"\\u01CD\":\"A\",\"\\u0200\":\"A\",\"\\u0202\":\"A\",\"\\u1EA0\":\"A\",\"\\u1EAC\":\"A\",\"\\u1EB6\":\"A\",\"\\u1E00\":\"A\",\"\\u0104\":\"A\",\"\\u023A\":\"A\",\"\\u2C6F\":\"A\",\"\\uA732\":\"AA\",\"\\u00C6\":\"AE\",\"\\u01FC\":\"AE\",\"\\u01E2\":\"AE\",\"\\uA734\":\"AO\",\"\\uA736\":\"AU\",\"\\uA738\":\"AV\",\"\\uA73A\":\"AV\",\"\\uA73C\":\"AY\",\"\\u24B7\":\"B\",\"\\uFF22\":\"B\",\"\\u1E02\":\"B\",\"\\u1E04\":\"B\",\"\\u1E06\":\"B\",\"\\u0243\":\"B\",\"\\u0182\":\"B\",\"\\u0181\":\"B\",\"\\u24B8\":\"C\",\"\\uFF23\":\"C\",\"\\u0106\":\"C\",\"\\u0108\":\"C\",\"\\u010A\":\"C\",\"\\u010C\":\"C\",\"\\u00C7\":\"C\",\"\\u1E08\":\"C\",\"\\u0187\":\"C\",\"\\u023B\":\"C\",\"\\uA73E\":\"C\",\"\\u24B9\":\"D\",\"\\uFF24\":\"D\",\"\\u1E0A\":\"D\",\"\\u010E\":\"D\",\"\\u1E0C\":\"D\",\"\\u1E10\":\"D\",\"\\u1E12\":\"D\",\"\\u1E0E\":\"D\",\"\\u0110\":\"D\",\"\\u018B\":\"D\",\"\\u018A\":\"D\",\"\\u0189\":\"D\",\"\\uA779\":\"D\",\"\\u01F1\":\"DZ\",\"\\u01C4\":\"DZ\",\"\\u01F2\":\"Dz\",\"\\u01C5\":\"Dz\",\"\\u24BA\":\"E\",\"\\uFF25\":\"E\",\"\\u00C8\":\"E\",\"\\u00C9\":\"E\",\"\\u00CA\":\"E\",\"\\u1EC0\":\"E\",\"\\u1EBE\":\"E\",\"\\u1EC4\":\"E\",\"\\u1EC2\":\"E\",\"\\u1EBC\":\"E\",\"\\u0112\":\"E\",\"\\u1E14\":\"E\",\"\\u1E16\":\"E\",\"\\u0114\":\"E\",\"\\u0116\":\"E\",\"\\u00CB\":\"E\",\"\\u1EBA\":\"E\",\"\\u011A\":\"E\",\"\\u0204\":\"E\",\"\\u0206\":\"E\",\"\\u1EB8\":\"E\",\"\\u1EC6\":\"E\",\"\\u0228\":\"E\",\"\\u1E1C\":\"E\",\"\\u0118\":\"E\",\"\\u1E18\":\"E\",\"\\u1E1A\":\"E\",\"\\u0190\":\"E\",\"\\u018E\":\"E\",\"\\u24BB\":\"F\",\"\\uFF26\":\"F\",\"\\u1E1E\":\"F\",\"\\u0191\":\"F\",\"\\uA77B\":\"F\",\"\\u24BC\":\"G\",\"\\uFF27\":\"G\",\"\\u01F4\":\"G\",\"\\u011C\":\"G\",\"\\u1E20\":\"G\",\"\\u011E\":\"G\",\"\\u0120\":\"G\",\"\\u01E6\":\"G\",\"\\u0122\":\"G\",\"\\u01E4\":\"G\",\"\\u0193\":\"G\",\"\\uA7A0\":\"G\",\"\\uA77D\":\"G\",\"\\uA77E\":\"G\",\"\\u24BD\":\"H\",\"\\uFF28\":\"H\",\"\\u0124\":\"H\",\"\\u1E22\":\"H\",\"\\u1E26\":\"H\",\"\\u021E\":\"H\",\"\\u1E24\":\"H\",\"\\u1E28\":\"H\",\"\\u1E2A\":\"H\",\"\\u0126\":\"H\",\"\\u2C67\":\"H\",\"\\u2C75\":\"H\",\"\\uA78D\":\"H\",\"\\u24BE\":\"I\",\"\\uFF29\":\"I\",\"\\u00CC\":\"I\",\"\\u00CD\":\"I\",\"\\u00CE\":\"I\",\"\\u0128\":\"I\",\"\\u012A\":\"I\",\"\\u012C\":\"I\",\"\\u0130\":\"I\",\"\\u00CF\":\"I\",\"\\u1E2E\":\"I\",\"\\u1EC8\":\"I\",\"\\u01CF\":\"I\",\"\\u0208\":\"I\",\"\\u020A\":\"I\",\"\\u1ECA\":\"I\",\"\\u012E\":\"I\",\"\\u1E2C\":\"I\",\"\\u0197\":\"I\",\"\\u24BF\":\"J\",\"\\uFF2A\":\"J\",\"\\u0134\":\"J\",\"\\u0248\":\"J\",\"\\u24C0\":\"K\",\"\\uFF2B\":\"K\",\"\\u1E30\":\"K\",\"\\u01E8\":\"K\",\"\\u1E32\":\"K\",\"\\u0136\":\"K\",\"\\u1E34\":\"K\",\"\\u0198\":\"K\",\"\\u2C69\":\"K\",\"\\uA740\":\"K\",\"\\uA742\":\"K\",\"\\uA744\":\"K\",\"\\uA7A2\":\"K\",\"\\u24C1\":\"L\",\"\\uFF2C\":\"L\",\"\\u013F\":\"L\",\"\\u0139\":\"L\",\"\\u013D\":\"L\",\"\\u1E36\":\"L\",\"\\u1E38\":\"L\",\"\\u013B\":\"L\",\"\\u1E3C\":\"L\",\"\\u1E3A\":\"L\",\"\\u0141\":\"L\",\"\\u023D\":\"L\",\"\\u2C62\":\"L\",\"\\u2C60\":\"L\",\"\\uA748\":\"L\",\"\\uA746\":\"L\",\"\\uA780\":\"L\",\"\\u01C7\":\"LJ\",\"\\u01C8\":\"Lj\",\"\\u24C2\":\"M\",\"\\uFF2D\":\"M\",\"\\u1E3E\":\"M\",\"\\u1E40\":\"M\",\"\\u1E42\":\"M\",\"\\u2C6E\":\"M\",\"\\u019C\":\"M\",\"\\u24C3\":\"N\",\"\\uFF2E\":\"N\",\"\\u01F8\":\"N\",\"\\u0143\":\"N\",\"\\u00D1\":\"N\",\"\\u1E44\":\"N\",\"\\u0147\":\"N\",\"\\u1E46\":\"N\",\"\\u0145\":\"N\",\"\\u1E4A\":\"N\",\"\\u1E48\":\"N\",\"\\u0220\":\"N\",\"\\u019D\":\"N\",\"\\uA790\":\"N\",\"\\uA7A4\":\"N\",\"\\u01CA\":\"NJ\",\"\\u01CB\":\"Nj\",\"\\u24C4\":\"O\",\"\\uFF2F\":\"O\",\"\\u00D2\":\"O\",\"\\u00D3\":\"O\",\"\\u00D4\":\"O\",\"\\u1ED2\":\"O\",\"\\u1ED0\":\"O\",\"\\u1ED6\":\"O\",\"\\u1ED4\":\"O\",\"\\u00D5\":\"O\",\"\\u1E4C\":\"O\",\"\\u022C\":\"O\",\"\\u1E4E\":\"O\",\"\\u014C\":\"O\",\"\\u1E50\":\"O\",\"\\u1E52\":\"O\",\"\\u014E\":\"O\",\"\\u022E\":\"O\",\"\\u0230\":\"O\",\"\\u00D6\":\"O\",\"\\u022A\":\"O\",\"\\u1ECE\":\"O\",\"\\u0150\":\"O\",\"\\u01D1\":\"O\",\"\\u020C\":\"O\",\"\\u020E\":\"O\",\"\\u01A0\":\"O\",\"\\u1EDC\":\"O\",\"\\u1EDA\":\"O\",\"\\u1EE0\":\"O\",\"\\u1EDE\":\"O\",\"\\u1EE2\":\"O\",\"\\u1ECC\":\"O\",\"\\u1ED8\":\"O\",\"\\u01EA\":\"O\",\"\\u01EC\":\"O\",\"\\u00D8\":\"O\",\"\\u01FE\":\"O\",\"\\u0186\":\"O\",\"\\u019F\":\"O\",\"\\uA74A\":\"O\",\"\\uA74C\":\"O\",\"\\u01A2\":\"OI\",\"\\uA74E\":\"OO\",\"\\u0222\":\"OU\",\"\\u24C5\":\"P\",\"\\uFF30\":\"P\",\"\\u1E54\":\"P\",\"\\u1E56\":\"P\",\"\\u01A4\":\"P\",\"\\u2C63\":\"P\",\"\\uA750\":\"P\",\"\\uA752\":\"P\",\"\\uA754\":\"P\",\"\\u24C6\":\"Q\",\"\\uFF31\":\"Q\",\"\\uA756\":\"Q\",\"\\uA758\":\"Q\",\"\\u024A\":\"Q\",\"\\u24C7\":\"R\",\"\\uFF32\":\"R\",\"\\u0154\":\"R\",\"\\u1E58\":\"R\",\"\\u0158\":\"R\",\"\\u0210\":\"R\",\"\\u0212\":\"R\",\"\\u1E5A\":\"R\",\"\\u1E5C\":\"R\",\"\\u0156\":\"R\",\"\\u1E5E\":\"R\",\"\\u024C\":\"R\",\"\\u2C64\":\"R\",\"\\uA75A\":\"R\",\"\\uA7A6\":\"R\",\"\\uA782\":\"R\",\"\\u24C8\":\"S\",\"\\uFF33\":\"S\",\"\\u1E9E\":\"S\",\"\\u015A\":\"S\",\"\\u1E64\":\"S\",\"\\u015C\":\"S\",\"\\u1E60\":\"S\",\"\\u0160\":\"S\",\"\\u1E66\":\"S\",\"\\u1E62\":\"S\",\"\\u1E68\":\"S\",\"\\u0218\":\"S\",\"\\u015E\":\"S\",\"\\u2C7E\":\"S\",\"\\uA7A8\":\"S\",\"\\uA784\":\"S\",\"\\u24C9\":\"T\",\"\\uFF34\":\"T\",\"\\u1E6A\":\"T\",\"\\u0164\":\"T\",\"\\u1E6C\":\"T\",\"\\u021A\":\"T\",\"\\u0162\":\"T\",\"\\u1E70\":\"T\",\"\\u1E6E\":\"T\",\"\\u0166\":\"T\",\"\\u01AC\":\"T\",\"\\u01AE\":\"T\",\"\\u023E\":\"T\",\"\\uA786\":\"T\",\"\\uA728\":\"TZ\",\"\\u24CA\":\"U\",\"\\uFF35\":\"U\",\"\\u00D9\":\"U\",\"\\u00DA\":\"U\",\"\\u00DB\":\"U\",\"\\u0168\":\"U\",\"\\u1E78\":\"U\",\"\\u016A\":\"U\",\"\\u1E7A\":\"U\",\"\\u016C\":\"U\",\"\\u00DC\":\"U\",\"\\u01DB\":\"U\",\"\\u01D7\":\"U\",\"\\u01D5\":\"U\",\"\\u01D9\":\"U\",\"\\u1EE6\":\"U\",\"\\u016E\":\"U\",\"\\u0170\":\"U\",\"\\u01D3\":\"U\",\"\\u0214\":\"U\",\"\\u0216\":\"U\",\"\\u01AF\":\"U\",\"\\u1EEA\":\"U\",\"\\u1EE8\":\"U\",\"\\u1EEE\":\"U\",\"\\u1EEC\":\"U\",\"\\u1EF0\":\"U\",\"\\u1EE4\":\"U\",\"\\u1E72\":\"U\",\"\\u0172\":\"U\",\"\\u1E76\":\"U\",\"\\u1E74\":\"U\",\"\\u0244\":\"U\",\"\\u24CB\":\"V\",\"\\uFF36\":\"V\",\"\\u1E7C\":\"V\",\"\\u1E7E\":\"V\",\"\\u01B2\":\"V\",\"\\uA75E\":\"V\",\"\\u0245\":\"V\",\"\\uA760\":\"VY\",\"\\u24CC\":\"W\",\"\\uFF37\":\"W\",\"\\u1E80\":\"W\",\"\\u1E82\":\"W\",\"\\u0174\":\"W\",\"\\u1E86\":\"W\",\"\\u1E84\":\"W\",\"\\u1E88\":\"W\",\"\\u2C72\":\"W\",\"\\u24CD\":\"X\",\"\\uFF38\":\"X\",\"\\u1E8A\":\"X\",\"\\u1E8C\":\"X\",\"\\u24CE\":\"Y\",\"\\uFF39\":\"Y\",\"\\u1EF2\":\"Y\",\"\\u00DD\":\"Y\",\"\\u0176\":\"Y\",\"\\u1EF8\":\"Y\",\"\\u0232\":\"Y\",\"\\u1E8E\":\"Y\",\"\\u0178\":\"Y\",\"\\u1EF6\":\"Y\",\"\\u1EF4\":\"Y\",\"\\u01B3\":\"Y\",\"\\u024E\":\"Y\",\"\\u1EFE\":\"Y\",\"\\u24CF\":\"Z\",\"\\uFF3A\":\"Z\",\"\\u0179\":\"Z\",\"\\u1E90\":\"Z\",\"\\u017B\":\"Z\",\"\\u017D\":\"Z\",\"\\u1E92\":\"Z\",\"\\u1E94\":\"Z\",\"\\u01B5\":\"Z\",\"\\u0224\":\"Z\",\"\\u2C7F\":\"Z\",\"\\u2C6B\":\"Z\",\"\\uA762\":\"Z\",\"\\u24D0\":\"a\",\"\\uFF41\":\"a\",\"\\u1E9A\":\"a\",\"\\u00E0\":\"a\",\"\\u00E1\":\"a\",\"\\u00E2\":\"a\",\"\\u1EA7\":\"a\",\"\\u1EA5\":\"a\",\"\\u1EAB\":\"a\",\"\\u1EA9\":\"a\",\"\\u00E3\":\"a\",\"\\u0101\":\"a\",\"\\u0103\":\"a\",\"\\u1EB1\":\"a\",\"\\u1EAF\":\"a\",\"\\u1EB5\":\"a\",\"\\u1EB3\":\"a\",\"\\u0227\":\"a\",\"\\u01E1\":\"a\",\"\\u00E4\":\"a\",\"\\u01DF\":\"a\",\"\\u1EA3\":\"a\",\"\\u00E5\":\"a\",\"\\u01FB\":\"a\",\"\\u01CE\":\"a\",\"\\u0201\":\"a\",\"\\u0203\":\"a\",\"\\u1EA1\":\"a\",\"\\u1EAD\":\"a\",\"\\u1EB7\":\"a\",\"\\u1E01\":\"a\",\"\\u0105\":\"a\",\"\\u2C65\":\"a\",\"\\u0250\":\"a\",\"\\uA733\":\"aa\",\"\\u00E6\":\"ae\",\"\\u01FD\":\"ae\",\"\\u01E3\":\"ae\",\"\\uA735\":\"ao\",\"\\uA737\":\"au\",\"\\uA739\":\"av\",\"\\uA73B\":\"av\",\"\\uA73D\":\"ay\",\"\\u24D1\":\"b\",\"\\uFF42\":\"b\",\"\\u1E03\":\"b\",\"\\u1E05\":\"b\",\"\\u1E07\":\"b\",\"\\u0180\":\"b\",\"\\u0183\":\"b\",\"\\u0253\":\"b\",\"\\u24D2\":\"c\",\"\\uFF43\":\"c\",\"\\u0107\":\"c\",\"\\u0109\":\"c\",\"\\u010B\":\"c\",\"\\u010D\":\"c\",\"\\u00E7\":\"c\",\"\\u1E09\":\"c\",\"\\u0188\":\"c\",\"\\u023C\":\"c\",\"\\uA73F\":\"c\",\"\\u2184\":\"c\",\"\\u24D3\":\"d\",\"\\uFF44\":\"d\",\"\\u1E0B\":\"d\",\"\\u010F\":\"d\",\"\\u1E0D\":\"d\",\"\\u1E11\":\"d\",\"\\u1E13\":\"d\",\"\\u1E0F\":\"d\",\"\\u0111\":\"d\",\"\\u018C\":\"d\",\"\\u0256\":\"d\",\"\\u0257\":\"d\",\"\\uA77A\":\"d\",\"\\u01F3\":\"dz\",\"\\u01C6\":\"dz\",\"\\u24D4\":\"e\",\"\\uFF45\":\"e\",\"\\u00E8\":\"e\",\"\\u00E9\":\"e\",\"\\u00EA\":\"e\",\"\\u1EC1\":\"e\",\"\\u1EBF\":\"e\",\"\\u1EC5\":\"e\",\"\\u1EC3\":\"e\",\"\\u1EBD\":\"e\",\"\\u0113\":\"e\",\"\\u1E15\":\"e\",\"\\u1E17\":\"e\",\"\\u0115\":\"e\",\"\\u0117\":\"e\",\"\\u00EB\":\"e\",\"\\u1EBB\":\"e\",\"\\u011B\":\"e\",\"\\u0205\":\"e\",\"\\u0207\":\"e\",\"\\u1EB9\":\"e\",\"\\u1EC7\":\"e\",\"\\u0229\":\"e\",\"\\u1E1D\":\"e\",\"\\u0119\":\"e\",\"\\u1E19\":\"e\",\"\\u1E1B\":\"e\",\"\\u0247\":\"e\",\"\\u025B\":\"e\",\"\\u01DD\":\"e\",\"\\u24D5\":\"f\",\"\\uFF46\":\"f\",\"\\u1E1F\":\"f\",\"\\u0192\":\"f\",\"\\uA77C\":\"f\",\"\\u24D6\":\"g\",\"\\uFF47\":\"g\",\"\\u01F5\":\"g\",\"\\u011D\":\"g\",\"\\u1E21\":\"g\",\"\\u011F\":\"g\",\"\\u0121\":\"g\",\"\\u01E7\":\"g\",\"\\u0123\":\"g\",\"\\u01E5\":\"g\",\"\\u0260\":\"g\",\"\\uA7A1\":\"g\",\"\\u1D79\":\"g\",\"\\uA77F\":\"g\",\"\\u24D7\":\"h\",\"\\uFF48\":\"h\",\"\\u0125\":\"h\",\"\\u1E23\":\"h\",\"\\u1E27\":\"h\",\"\\u021F\":\"h\",\"\\u1E25\":\"h\",\"\\u1E29\":\"h\",\"\\u1E2B\":\"h\",\"\\u1E96\":\"h\",\"\\u0127\":\"h\",\"\\u2C68\":\"h\",\"\\u2C76\":\"h\",\"\\u0265\":\"h\",\"\\u0195\":\"hv\",\"\\u24D8\":\"i\",\"\\uFF49\":\"i\",\"\\u00EC\":\"i\",\"\\u00ED\":\"i\",\"\\u00EE\":\"i\",\"\\u0129\":\"i\",\"\\u012B\":\"i\",\"\\u012D\":\"i\",\"\\u00EF\":\"i\",\"\\u1E2F\":\"i\",\"\\u1EC9\":\"i\",\"\\u01D0\":\"i\",\"\\u0209\":\"i\",\"\\u020B\":\"i\",\"\\u1ECB\":\"i\",\"\\u012F\":\"i\",\"\\u1E2D\":\"i\",\"\\u0268\":\"i\",\"\\u0131\":\"i\",\"\\u24D9\":\"j\",\"\\uFF4A\":\"j\",\"\\u0135\":\"j\",\"\\u01F0\":\"j\",\"\\u0249\":\"j\",\"\\u24DA\":\"k\",\"\\uFF4B\":\"k\",\"\\u1E31\":\"k\",\"\\u01E9\":\"k\",\"\\u1E33\":\"k\",\"\\u0137\":\"k\",\"\\u1E35\":\"k\",\"\\u0199\":\"k\",\"\\u2C6A\":\"k\",\"\\uA741\":\"k\",\"\\uA743\":\"k\",\"\\uA745\":\"k\",\"\\uA7A3\":\"k\",\"\\u24DB\":\"l\",\"\\uFF4C\":\"l\",\"\\u0140\":\"l\",\"\\u013A\":\"l\",\"\\u013E\":\"l\",\"\\u1E37\":\"l\",\"\\u1E39\":\"l\",\"\\u013C\":\"l\",\"\\u1E3D\":\"l\",\"\\u1E3B\":\"l\",\"\\u017F\":\"l\",\"\\u0142\":\"l\",\"\\u019A\":\"l\",\"\\u026B\":\"l\",\"\\u2C61\":\"l\",\"\\uA749\":\"l\",\"\\uA781\":\"l\",\"\\uA747\":\"l\",\"\\u01C9\":\"lj\",\"\\u24DC\":\"m\",\"\\uFF4D\":\"m\",\"\\u1E3F\":\"m\",\"\\u1E41\":\"m\",\"\\u1E43\":\"m\",\"\\u0271\":\"m\",\"\\u026F\":\"m\",\"\\u24DD\":\"n\",\"\\uFF4E\":\"n\",\"\\u01F9\":\"n\",\"\\u0144\":\"n\",\"\\u00F1\":\"n\",\"\\u1E45\":\"n\",\"\\u0148\":\"n\",\"\\u1E47\":\"n\",\"\\u0146\":\"n\",\"\\u1E4B\":\"n\",\"\\u1E49\":\"n\",\"\\u019E\":\"n\",\"\\u0272\":\"n\",\"\\u0149\":\"n\",\"\\uA791\":\"n\",\"\\uA7A5\":\"n\",\"\\u01CC\":\"nj\",\"\\u24DE\":\"o\",\"\\uFF4F\":\"o\",\"\\u00F2\":\"o\",\"\\u00F3\":\"o\",\"\\u00F4\":\"o\",\"\\u1ED3\":\"o\",\"\\u1ED1\":\"o\",\"\\u1ED7\":\"o\",\"\\u1ED5\":\"o\",\"\\u00F5\":\"o\",\"\\u1E4D\":\"o\",\"\\u022D\":\"o\",\"\\u1E4F\":\"o\",\"\\u014D\":\"o\",\"\\u1E51\":\"o\",\"\\u1E53\":\"o\",\"\\u014F\":\"o\",\"\\u022F\":\"o\",\"\\u0231\":\"o\",\"\\u00F6\":\"o\",\"\\u022B\":\"o\",\"\\u1ECF\":\"o\",\"\\u0151\":\"o\",\"\\u01D2\":\"o\",\"\\u020D\":\"o\",\"\\u020F\":\"o\",\"\\u01A1\":\"o\",\"\\u1EDD\":\"o\",\"\\u1EDB\":\"o\",\"\\u1EE1\":\"o\",\"\\u1EDF\":\"o\",\"\\u1EE3\":\"o\",\"\\u1ECD\":\"o\",\"\\u1ED9\":\"o\",\"\\u01EB\":\"o\",\"\\u01ED\":\"o\",\"\\u00F8\":\"o\",\"\\u01FF\":\"o\",\"\\u0254\":\"o\",\"\\uA74B\":\"o\",\"\\uA74D\":\"o\",\"\\u0275\":\"o\",\"\\u01A3\":\"oi\",\"\\u0223\":\"ou\",\"\\uA74F\":\"oo\",\"\\u24DF\":\"p\",\"\\uFF50\":\"p\",\"\\u1E55\":\"p\",\"\\u1E57\":\"p\",\"\\u01A5\":\"p\",\"\\u1D7D\":\"p\",\"\\uA751\":\"p\",\"\\uA753\":\"p\",\"\\uA755\":\"p\",\"\\u24E0\":\"q\",\"\\uFF51\":\"q\",\"\\u024B\":\"q\",\"\\uA757\":\"q\",\"\\uA759\":\"q\",\"\\u24E1\":\"r\",\"\\uFF52\":\"r\",\"\\u0155\":\"r\",\"\\u1E59\":\"r\",\"\\u0159\":\"r\",\"\\u0211\":\"r\",\"\\u0213\":\"r\",\"\\u1E5B\":\"r\",\"\\u1E5D\":\"r\",\"\\u0157\":\"r\",\"\\u1E5F\":\"r\",\"\\u024D\":\"r\",\"\\u027D\":\"r\",\"\\uA75B\":\"r\",\"\\uA7A7\":\"r\",\"\\uA783\":\"r\",\"\\u24E2\":\"s\",\"\\uFF53\":\"s\",\"\\u00DF\":\"s\",\"\\u015B\":\"s\",\"\\u1E65\":\"s\",\"\\u015D\":\"s\",\"\\u1E61\":\"s\",\"\\u0161\":\"s\",\"\\u1E67\":\"s\",\"\\u1E63\":\"s\",\"\\u1E69\":\"s\",\"\\u0219\":\"s\",\"\\u015F\":\"s\",\"\\u023F\":\"s\",\"\\uA7A9\":\"s\",\"\\uA785\":\"s\",\"\\u1E9B\":\"s\",\"\\u24E3\":\"t\",\"\\uFF54\":\"t\",\"\\u1E6B\":\"t\",\"\\u1E97\":\"t\",\"\\u0165\":\"t\",\"\\u1E6D\":\"t\",\"\\u021B\":\"t\",\"\\u0163\":\"t\",\"\\u1E71\":\"t\",\"\\u1E6F\":\"t\",\"\\u0167\":\"t\",\"\\u01AD\":\"t\",\"\\u0288\":\"t\",\"\\u2C66\":\"t\",\"\\uA787\":\"t\",\"\\uA729\":\"tz\",\"\\u24E4\":\"u\",\"\\uFF55\":\"u\",\"\\u00F9\":\"u\",\"\\u00FA\":\"u\",\"\\u00FB\":\"u\",\"\\u0169\":\"u\",\"\\u1E79\":\"u\",\"\\u016B\":\"u\",\"\\u1E7B\":\"u\",\"\\u016D\":\"u\",\"\\u00FC\":\"u\",\"\\u01DC\":\"u\",\"\\u01D8\":\"u\",\"\\u01D6\":\"u\",\"\\u01DA\":\"u\",\"\\u1EE7\":\"u\",\"\\u016F\":\"u\",\"\\u0171\":\"u\",\"\\u01D4\":\"u\",\"\\u0215\":\"u\",\"\\u0217\":\"u\",\"\\u01B0\":\"u\",\"\\u1EEB\":\"u\",\"\\u1EE9\":\"u\",\"\\u1EEF\":\"u\",\"\\u1EED\":\"u\",\"\\u1EF1\":\"u\",\"\\u1EE5\":\"u\",\"\\u1E73\":\"u\",\"\\u0173\":\"u\",\"\\u1E77\":\"u\",\"\\u1E75\":\"u\",\"\\u0289\":\"u\",\"\\u24E5\":\"v\",\"\\uFF56\":\"v\",\"\\u1E7D\":\"v\",\"\\u1E7F\":\"v\",\"\\u028B\":\"v\",\"\\uA75F\":\"v\",\"\\u028C\":\"v\",\"\\uA761\":\"vy\",\"\\u24E6\":\"w\",\"\\uFF57\":\"w\",\"\\u1E81\":\"w\",\"\\u1E83\":\"w\",\"\\u0175\":\"w\",\"\\u1E87\":\"w\",\"\\u1E85\":\"w\",\"\\u1E98\":\"w\",\"\\u1E89\":\"w\",\"\\u2C73\":\"w\",\"\\u24E7\":\"x\",\"\\uFF58\":\"x\",\"\\u1E8B\":\"x\",\"\\u1E8D\":\"x\",\"\\u24E8\":\"y\",\"\\uFF59\":\"y\",\"\\u1EF3\":\"y\",\"\\u00FD\":\"y\",\"\\u0177\":\"y\",\"\\u1EF9\":\"y\",\"\\u0233\":\"y\",\"\\u1E8F\":\"y\",\"\\u00FF\":\"y\",\"\\u1EF7\":\"y\",\"\\u1E99\":\"y\",\"\\u1EF5\":\"y\",\"\\u01B4\":\"y\",\"\\u024F\":\"y\",\"\\u1EFF\":\"y\",\"\\u24E9\":\"z\",\"\\uFF5A\":\"z\",\"\\u017A\":\"z\",\"\\u1E91\":\"z\",\"\\u017C\":\"z\",\"\\u017E\":\"z\",\"\\u1E93\":\"z\",\"\\u1E95\":\"z\",\"\\u01B6\":\"z\",\"\\u0225\":\"z\",\"\\u0240\":\"z\",\"\\u2C6C\":\"z\",\"\\uA763\":\"z\"};\n\
\n\
    $document = $(document);\n\
\n\
    nextUid=(function() { var counter=1; return function() { return counter++; }; }());\n\
\n\
\n\
    function reinsertElement(element) {\n\
        var placeholder = $(document.createTextNode(''));\n\
\n\
        element.before(placeholder);\n\
        placeholder.before(element);\n\
        placeholder.remove();\n\
    }\n\
\n\
    function stripDiacritics(str) {\n\
        // Used 'uni range + named function' from http://jsperf.com/diacritics/18\n\
        function match(a) {\n\
            return DIACRITICS[a] || a;\n\
        }\n\
\n\
        return str.replace(/[^\\u0000-\\u007E]/g, match);\n\
    }\n\
\n\
    function indexOf(value, array) {\n\
        var i = 0, l = array.length;\n\
        for (; i < l; i = i + 1) {\n\
            if (equal(value, array[i])) return i;\n\
        }\n\
        return -1;\n\
    }\n\
\n\
    function measureScrollbar () {\n\
        var $template = $( MEASURE_SCROLLBAR_TEMPLATE );\n\
        $template.appendTo('body');\n\
\n\
        var dim = {\n\
            width: $template.width() - $template[0].clientWidth,\n\
            height: $template.height() - $template[0].clientHeight\n\
        };\n\
        $template.remove();\n\
\n\
        return dim;\n\
    }\n\
\n\
    /**\n\
     * Compares equality of a and b\n\
     * @param a\n\
     * @param b\n\
     */\n\
    function equal(a, b) {\n\
        if (a === b) return true;\n\
        if (a === undefined || b === undefined) return false;\n\
        if (a === null || b === null) return false;\n\
        // Check whether 'a' or 'b' is a string (primitive or object).\n\
        // The concatenation of an empty string (+'') converts its argument to a string's primitive.\n\
        if (a.constructor === String) return a+'' === b+''; // a+'' - in case 'a' is a String object\n\
        if (b.constructor === String) return b+'' === a+''; // b+'' - in case 'b' is a String object\n\
        return false;\n\
    }\n\
\n\
    /**\n\
     * Splits the string into an array of values, trimming each value. An empty array is returned for nulls or empty\n\
     * strings\n\
     * @param string\n\
     * @param separator\n\
     */\n\
    function splitVal(string, separator) {\n\
        var val, i, l;\n\
        if (string === null || string.length < 1) return [];\n\
        val = string.split(separator);\n\
        for (i = 0, l = val.length; i < l; i = i + 1) val[i] = $.trim(val[i]);\n\
        return val;\n\
    }\n\
\n\
    function getSideBorderPadding(element) {\n\
        return element.outerWidth(false) - element.width();\n\
    }\n\
\n\
    function installKeyUpChangeEvent(element) {\n\
        var key=\"keyup-change-value\";\n\
        element.on(\"keydown\", function () {\n\
            if ($.data(element, key) === undefined) {\n\
                $.data(element, key, element.val());\n\
            }\n\
        });\n\
        element.on(\"keyup\", function () {\n\
            var val= $.data(element, key);\n\
            if (val !== undefined && element.val() !== val) {\n\
                $.removeData(element, key);\n\
                element.trigger(\"keyup-change\");\n\
            }\n\
        });\n\
    }\n\
\n\
    $document.on(\"mousemove\", function (e) {\n\
        lastMousePosition.x = e.pageX;\n\
        lastMousePosition.y = e.pageY;\n\
    });\n\
\n\
    /**\n\
     * filters mouse events so an event is fired only if the mouse moved.\n\
     *\n\
     * filters out mouse events that occur when mouse is stationary but\n\
     * the elements under the pointer are scrolled.\n\
     */\n\
    function installFilteredMouseMove(element) {\n\
        element.on(\"mousemove\", function (e) {\n\
            var lastpos = lastMousePosition;\n\
            if (lastpos === undefined || lastpos.x !== e.pageX || lastpos.y !== e.pageY) {\n\
                $(e.target).trigger(\"mousemove-filtered\", e);\n\
            }\n\
        });\n\
    }\n\
\n\
    /**\n\
     * Debounces a function. Returns a function that calls the original fn function only if no invocations have been made\n\
     * within the last quietMillis milliseconds.\n\
     *\n\
     * @param quietMillis number of milliseconds to wait before invoking fn\n\
     * @param fn function to be debounced\n\
     * @param ctx object to be used as this reference within fn\n\
     * @return debounced version of fn\n\
     */\n\
    function debounce(quietMillis, fn, ctx) {\n\
        ctx = ctx || undefined;\n\
        var timeout;\n\
        return function () {\n\
            var args = arguments;\n\
            window.clearTimeout(timeout);\n\
            timeout = window.setTimeout(function() {\n\
                fn.apply(ctx, args);\n\
            }, quietMillis);\n\
        };\n\
    }\n\
\n\
    function installDebouncedScroll(threshold, element) {\n\
        var notify = debounce(threshold, function (e) { element.trigger(\"scroll-debounced\", e);});\n\
        element.on(\"scroll\", function (e) {\n\
            if (indexOf(e.target, element.get()) >= 0) notify(e);\n\
        });\n\
    }\n\
\n\
    function focus($el) {\n\
        if ($el[0] === document.activeElement) return;\n\
\n\
        /* set the focus in a 0 timeout - that way the focus is set after the processing\n\
            of the current event has finished - which seems like the only reliable way\n\
            to set focus */\n\
        window.setTimeout(function() {\n\
            var el=$el[0], pos=$el.val().length, range;\n\
\n\
            $el.focus();\n\
\n\
            /* make sure el received focus so we do not error out when trying to manipulate the caret.\n\
                sometimes modals or others listeners may steal it after its set */\n\
            var isVisible = (el.offsetWidth > 0 || el.offsetHeight > 0);\n\
            if (isVisible && el === document.activeElement) {\n\
\n\
                /* after the focus is set move the caret to the end, necessary when we val()\n\
                    just before setting focus */\n\
                if(el.setSelectionRange)\n\
                {\n\
                    el.setSelectionRange(pos, pos);\n\
                }\n\
                else if (el.createTextRange) {\n\
                    range = el.createTextRange();\n\
                    range.collapse(false);\n\
                    range.select();\n\
                }\n\
            }\n\
        }, 0);\n\
    }\n\
\n\
    function getCursorInfo(el) {\n\
        el = $(el)[0];\n\
        var offset = 0;\n\
        var length = 0;\n\
        if ('selectionStart' in el) {\n\
            offset = el.selectionStart;\n\
            length = el.selectionEnd - offset;\n\
        } else if ('selection' in document) {\n\
            el.focus();\n\
            var sel = document.selection.createRange();\n\
            length = document.selection.createRange().text.length;\n\
            sel.moveStart('character', -el.value.length);\n\
            offset = sel.text.length - length;\n\
        }\n\
        return { offset: offset, length: length };\n\
    }\n\
\n\
    function killEvent(event) {\n\
        event.preventDefault();\n\
        event.stopPropagation();\n\
    }\n\
    function killEventImmediately(event) {\n\
        event.preventDefault();\n\
        event.stopImmediatePropagation();\n\
    }\n\
\n\
    function measureTextWidth(e) {\n\
        if (!sizer){\n\
            var style = e[0].currentStyle || window.getComputedStyle(e[0], null);\n\
            sizer = $(document.createElement(\"div\")).css({\n\
                position: \"absolute\",\n\
                left: \"-10000px\",\n\
                top: \"-10000px\",\n\
                display: \"none\",\n\
                fontSize: style.fontSize,\n\
                fontFamily: style.fontFamily,\n\
                fontStyle: style.fontStyle,\n\
                fontWeight: style.fontWeight,\n\
                letterSpacing: style.letterSpacing,\n\
                textTransform: style.textTransform,\n\
                whiteSpace: \"nowrap\"\n\
            });\n\
            sizer.attr(\"class\",\"select2-sizer\");\n\
            $(\"body\").append(sizer);\n\
        }\n\
        sizer.text(e.val());\n\
        return sizer.width();\n\
    }\n\
\n\
    function syncCssClasses(dest, src, adapter) {\n\
        var classes, replacements = [], adapted;\n\
\n\
        classes = dest.attr(\"class\");\n\
        if (classes) {\n\
            classes = '' + classes; // for IE which returns object\n\
            $(classes.split(\" \")).each2(function() {\n\
                if (this.indexOf(\"select2-\") === 0) {\n\
                    replacements.push(this);\n\
                }\n\
            });\n\
        }\n\
        classes = src.attr(\"class\");\n\
        if (classes) {\n\
            classes = '' + classes; // for IE which returns object\n\
            $(classes.split(\" \")).each2(function() {\n\
                if (this.indexOf(\"select2-\") !== 0) {\n\
                    adapted = adapter(this);\n\
                    if (adapted) {\n\
                        replacements.push(adapted);\n\
                    }\n\
                }\n\
            });\n\
        }\n\
        dest.attr(\"class\", replacements.join(\" \"));\n\
    }\n\
\n\
\n\
    function markMatch(text, term, markup, escapeMarkup) {\n\
        var match=stripDiacritics(text.toUpperCase()).indexOf(stripDiacritics(term.toUpperCase())),\n\
            tl=term.length;\n\
\n\
        if (match<0) {\n\
            markup.push(escapeMarkup(text));\n\
            return;\n\
        }\n\
\n\
        markup.push(escapeMarkup(text.substring(0, match)));\n\
        markup.push(\"<span class='select2-match'>\");\n\
        markup.push(escapeMarkup(text.substring(match, match + tl)));\n\
        markup.push(\"</span>\");\n\
        markup.push(escapeMarkup(text.substring(match + tl, text.length)));\n\
    }\n\
\n\
    function defaultEscapeMarkup(markup) {\n\
        var replace_map = {\n\
            '\\\\': '&#92;',\n\
            '&': '&amp;',\n\
            '<': '&lt;',\n\
            '>': '&gt;',\n\
            '\"': '&quot;',\n\
            \"'\": '&#39;',\n\
            \"/\": '&#47;'\n\
        };\n\
\n\
        return String(markup).replace(/[&<>\"'\\/\\\\]/g, function (match) {\n\
            return replace_map[match];\n\
        });\n\
    }\n\
\n\
    /**\n\
     * Produces an ajax-based query function\n\
     *\n\
     * @param options object containing configuration parameters\n\
     * @param options.params parameter map for the transport ajax call, can contain such options as cache, jsonpCallback, etc. see $.ajax\n\
     * @param options.transport function that will be used to execute the ajax request. must be compatible with parameters supported by $.ajax\n\
     * @param options.url url for the data\n\
     * @param options.data a function(searchTerm, pageNumber, context) that should return an object containing query string parameters for the above url.\n\
     * @param options.dataType request data type: ajax, jsonp, other datatypes supported by jQuery's $.ajax function or the transport function if specified\n\
     * @param options.quietMillis (optional) milliseconds to wait before making the ajaxRequest, helps debounce the ajax function if invoked too often\n\
     * @param options.results a function(remoteData, pageNumber) that converts data returned form the remote request to the format expected by Select2.\n\
     *      The expected format is an object containing the following keys:\n\
     *      results array of objects that will be used as choices\n\
     *      more (optional) boolean indicating whether there are more results available\n\
     *      Example: {results:[{id:1, text:'Red'},{id:2, text:'Blue'}], more:true}\n\
     */\n\
    function ajax(options) {\n\
        var timeout, // current scheduled but not yet executed request\n\
            handler = null,\n\
            quietMillis = options.quietMillis || 100,\n\
            ajaxUrl = options.url,\n\
            self = this;\n\
\n\
        return function (query) {\n\
            window.clearTimeout(timeout);\n\
            timeout = window.setTimeout(function () {\n\
                var data = options.data, // ajax data function\n\
                    url = ajaxUrl, // ajax url string or function\n\
                    transport = options.transport || $.fn.select2.ajaxDefaults.transport,\n\
                    // deprecated - to be removed in 4.0  - use params instead\n\
                    deprecated = {\n\
                        type: options.type || 'GET', // set type of request (GET or POST)\n\
                        cache: options.cache || false,\n\
                        jsonpCallback: options.jsonpCallback||undefined,\n\
                        dataType: options.dataType||\"json\"\n\
                    },\n\
                    params = $.extend({}, $.fn.select2.ajaxDefaults.params, deprecated);\n\
\n\
                data = data ? data.call(self, query.term, query.page, query.context) : null;\n\
                url = (typeof url === 'function') ? url.call(self, query.term, query.page, query.context) : url;\n\
\n\
                if (handler && typeof handler.abort === \"function\") { handler.abort(); }\n\
\n\
                if (options.params) {\n\
                    if ($.isFunction(options.params)) {\n\
                        $.extend(params, options.params.call(self));\n\
                    } else {\n\
                        $.extend(params, options.params);\n\
                    }\n\
                }\n\
\n\
                $.extend(params, {\n\
                    url: url,\n\
                    dataType: options.dataType,\n\
                    data: data,\n\
                    success: function (data) {\n\
                        // TODO - replace query.page with query so users have access to term, page, etc.\n\
                        var results = options.results(data, query.page);\n\
                        query.callback(results);\n\
                    }\n\
                });\n\
                handler = transport.call(self, params);\n\
            }, quietMillis);\n\
        };\n\
    }\n\
\n\
    /**\n\
     * Produces a query function that works with a local array\n\
     *\n\
     * @param options object containing configuration parameters. The options parameter can either be an array or an\n\
     * object.\n\
     *\n\
     * If the array form is used it is assumed that it contains objects with 'id' and 'text' keys.\n\
     *\n\
     * If the object form is used it is assumed that it contains 'data' and 'text' keys. The 'data' key should contain\n\
     * an array of objects that will be used as choices. These objects must contain at least an 'id' key. The 'text'\n\
     * key can either be a String in which case it is expected that each element in the 'data' array has a key with the\n\
     * value of 'text' which will be used to match choices. Alternatively, text can be a function(item) that can extract\n\
     * the text.\n\
     */\n\
    function local(options) {\n\
        var data = options, // data elements\n\
            dataText,\n\
            tmp,\n\
            text = function (item) { return \"\"+item.text; }; // function used to retrieve the text portion of a data item that is matched against the search\n\
\n\
         if ($.isArray(data)) {\n\
            tmp = data;\n\
            data = { results: tmp };\n\
        }\n\
\n\
         if ($.isFunction(data) === false) {\n\
            tmp = data;\n\
            data = function() { return tmp; };\n\
        }\n\
\n\
        var dataItem = data();\n\
        if (dataItem.text) {\n\
            text = dataItem.text;\n\
            // if text is not a function we assume it to be a key name\n\
            if (!$.isFunction(text)) {\n\
                dataText = dataItem.text; // we need to store this in a separate variable because in the next step data gets reset and data.text is no longer available\n\
                text = function (item) { return item[dataText]; };\n\
            }\n\
        }\n\
\n\
        return function (query) {\n\
            var t = query.term, filtered = { results: [] }, process;\n\
            if (t === \"\") {\n\
                query.callback(data());\n\
                return;\n\
            }\n\
\n\
            process = function(datum, collection) {\n\
                var group, attr;\n\
                datum = datum[0];\n\
                if (datum.children) {\n\
                    group = {};\n\
                    for (attr in datum) {\n\
                        if (datum.hasOwnProperty(attr)) group[attr]=datum[attr];\n\
                    }\n\
                    group.children=[];\n\
                    $(datum.children).each2(function(i, childDatum) { process(childDatum, group.children); });\n\
                    if (group.children.length || query.matcher(t, text(group), datum)) {\n\
                        collection.push(group);\n\
                    }\n\
                } else {\n\
                    if (query.matcher(t, text(datum), datum)) {\n\
                        collection.push(datum);\n\
                    }\n\
                }\n\
            };\n\
\n\
            $(data().results).each2(function(i, datum) { process(datum, filtered.results); });\n\
            query.callback(filtered);\n\
        };\n\
    }\n\
\n\
    // TODO javadoc\n\
    function tags(data) {\n\
        var isFunc = $.isFunction(data);\n\
        return function (query) {\n\
            var t = query.term, filtered = {results: []};\n\
            var result = isFunc ? data(query) : data;\n\
            if ($.isArray(result)) {\n\
                $(result).each(function () {\n\
                    var isObject = this.text !== undefined,\n\
                        text = isObject ? this.text : this;\n\
                    if (t === \"\" || query.matcher(t, text)) {\n\
                        filtered.results.push(isObject ? this : {id: this, text: this});\n\
                    }\n\
                });\n\
                query.callback(filtered);\n\
            }\n\
        };\n\
    }\n\
\n\
    /**\n\
     * Checks if the formatter function should be used.\n\
     *\n\
     * Throws an error if it is not a function. Returns true if it should be used,\n\
     * false if no formatting should be performed.\n\
     *\n\
     * @param formatter\n\
     */\n\
    function checkFormatter(formatter, formatterName) {\n\
        if ($.isFunction(formatter)) return true;\n\
        if (!formatter) return false;\n\
        if (typeof(formatter) === 'string') return true;\n\
        throw new Error(formatterName +\" must be a string, function, or falsy value\");\n\
    }\n\
\n\
    function evaluate(val) {\n\
        if ($.isFunction(val)) {\n\
            var args = Array.prototype.slice.call(arguments, 1);\n\
            return val.apply(null, args);\n\
        }\n\
        return val;\n\
    }\n\
\n\
    function countResults(results) {\n\
        var count = 0;\n\
        $.each(results, function(i, item) {\n\
            if (item.children) {\n\
                count += countResults(item.children);\n\
            } else {\n\
                count++;\n\
            }\n\
        });\n\
        return count;\n\
    }\n\
\n\
    /**\n\
     * Default tokenizer. This function uses breaks the input on substring match of any string from the\n\
     * opts.tokenSeparators array and uses opts.createSearchChoice to create the choice object. Both of those\n\
     * two options have to be defined in order for the tokenizer to work.\n\
     *\n\
     * @param input text user has typed so far or pasted into the search field\n\
     * @param selection currently selected choices\n\
     * @param selectCallback function(choice) callback tho add the choice to selection\n\
     * @param opts select2's opts\n\
     * @return undefined/null to leave the current input unchanged, or a string to change the input to the returned value\n\
     */\n\
    function defaultTokenizer(input, selection, selectCallback, opts) {\n\
        var original = input, // store the original so we can compare and know if we need to tell the search to update its text\n\
            dupe = false, // check for whether a token we extracted represents a duplicate selected choice\n\
            token, // token\n\
            index, // position at which the separator was found\n\
            i, l, // looping variables\n\
            separator; // the matched separator\n\
\n\
        if (!opts.createSearchChoice || !opts.tokenSeparators || opts.tokenSeparators.length < 1) return undefined;\n\
\n\
        while (true) {\n\
            index = -1;\n\
\n\
            for (i = 0, l = opts.tokenSeparators.length; i < l; i++) {\n\
                separator = opts.tokenSeparators[i];\n\
                index = input.indexOf(separator);\n\
                if (index >= 0) break;\n\
            }\n\
\n\
            if (index < 0) break; // did not find any token separator in the input string, bail\n\
\n\
            token = input.substring(0, index);\n\
            input = input.substring(index + separator.length);\n\
\n\
            if (token.length > 0) {\n\
                token = opts.createSearchChoice.call(this, token, selection);\n\
                if (token !== undefined && token !== null && opts.id(token) !== undefined && opts.id(token) !== null) {\n\
                    dupe = false;\n\
                    for (i = 0, l = selection.length; i < l; i++) {\n\
                        if (equal(opts.id(token), opts.id(selection[i]))) {\n\
                            dupe = true; break;\n\
                        }\n\
                    }\n\
\n\
                    if (!dupe) selectCallback(token);\n\
                }\n\
            }\n\
        }\n\
\n\
        if (original!==input) return input;\n\
    }\n\
\n\
    function cleanupJQueryElements() {\n\
        var self = this;\n\
\n\
        Array.prototype.forEach.call(arguments, function (element) {\n\
            self[element].remove();\n\
            self[element] = null;\n\
        });\n\
    }\n\
\n\
    /**\n\
     * Creates a new class\n\
     *\n\
     * @param superClass\n\
     * @param methods\n\
     */\n\
    function clazz(SuperClass, methods) {\n\
        var constructor = function () {};\n\
        constructor.prototype = new SuperClass;\n\
        constructor.prototype.constructor = constructor;\n\
        constructor.prototype.parent = SuperClass.prototype;\n\
        constructor.prototype = $.extend(constructor.prototype, methods);\n\
        return constructor;\n\
    }\n\
\n\
    AbstractSelect2 = clazz(Object, {\n\
\n\
        // abstract\n\
        bind: function (func) {\n\
            var self = this;\n\
            return function () {\n\
                func.apply(self, arguments);\n\
            };\n\
        },\n\
\n\
        // abstract\n\
        init: function (opts) {\n\
            var results, search, resultsSelector = \".select2-results\";\n\
\n\
            // prepare options\n\
            this.opts = opts = this.prepareOpts(opts);\n\
\n\
            this.id=opts.id;\n\
\n\
            // destroy if called on an existing component\n\
            if (opts.element.data(\"select2\") !== undefined &&\n\
                opts.element.data(\"select2\") !== null) {\n\
                opts.element.data(\"select2\").destroy();\n\
            }\n\
\n\
            this.container = this.createContainer();\n\
\n\
            this.liveRegion = $(\"<span>\", {\n\
                    role: \"status\",\n\
                    \"aria-live\": \"polite\"\n\
                })\n\
                .addClass(\"select2-hidden-accessible\")\n\
                .appendTo(document.body);\n\
\n\
            this.containerId=\"s2id_\"+(opts.element.attr(\"id\") || \"autogen\"+nextUid());\n\
            this.containerEventName= this.containerId\n\
                .replace(/([.])/g, '_')\n\
                .replace(/([;&,\\-\\.\\+\\*\\~':\"\\!\\^#$%@\\[\\]\\(\\)=>\\|])/g, '\\\\$1');\n\
            this.container.attr(\"id\", this.containerId);\n\
\n\
            this.container.attr(\"title\", opts.element.attr(\"title\"));\n\
\n\
            this.body = $(\"body\");\n\
\n\
            syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);\n\
\n\
            this.container.attr(\"style\", opts.element.attr(\"style\"));\n\
            this.container.css(evaluate(opts.containerCss));\n\
            this.container.addClass(evaluate(opts.containerCssClass));\n\
\n\
            this.elementTabIndex = this.opts.element.attr(\"tabindex\");\n\
\n\
            // swap container for the element\n\
            this.opts.element\n\
                .data(\"select2\", this)\n\
                .attr(\"tabindex\", \"-1\")\n\
                .before(this.container)\n\
                .on(\"click.select2\", killEvent); // do not leak click events\n\
\n\
            this.container.data(\"select2\", this);\n\
\n\
            this.dropdown = this.container.find(\".select2-drop\");\n\
\n\
            syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);\n\
\n\
            this.dropdown.addClass(evaluate(opts.dropdownCssClass));\n\
            this.dropdown.data(\"select2\", this);\n\
            this.dropdown.on(\"click\", killEvent);\n\
\n\
            this.results = results = this.container.find(resultsSelector);\n\
            this.search = search = this.container.find(\"input.select2-input\");\n\
\n\
            this.queryCount = 0;\n\
            this.resultsPage = 0;\n\
            this.context = null;\n\
\n\
            // initialize the container\n\
            this.initContainer();\n\
\n\
            this.container.on(\"click\", killEvent);\n\
\n\
            installFilteredMouseMove(this.results);\n\
\n\
            this.dropdown.on(\"mousemove-filtered\", resultsSelector, this.bind(this.highlightUnderEvent));\n\
            this.dropdown.on(\"touchstart touchmove touchend\", resultsSelector, this.bind(function (event) {\n\
                this._touchEvent = true;\n\
                this.highlightUnderEvent(event);\n\
            }));\n\
            this.dropdown.on(\"touchmove\", resultsSelector, this.bind(this.touchMoved));\n\
            this.dropdown.on(\"touchstart touchend\", resultsSelector, this.bind(this.clearTouchMoved));\n\
\n\
            // Waiting for a click event on touch devices to select option and hide dropdown\n\
            // otherwise click will be triggered on an underlying element\n\
            this.dropdown.on('click', this.bind(function (event) {\n\
                if (this._touchEvent) {\n\
                    this._touchEvent = false;\n\
                    this.selectHighlighted();\n\
                }\n\
            }));\n\
\n\
            installDebouncedScroll(80, this.results);\n\
            this.dropdown.on(\"scroll-debounced\", resultsSelector, this.bind(this.loadMoreIfNeeded));\n\
\n\
            // do not propagate change event from the search field out of the component\n\
            $(this.container).on(\"change\", \".select2-input\", function(e) {e.stopPropagation();});\n\
            $(this.dropdown).on(\"change\", \".select2-input\", function(e) {e.stopPropagation();});\n\
\n\
            // if jquery.mousewheel plugin is installed we can prevent out-of-bounds scrolling of results via mousewheel\n\
            if ($.fn.mousewheel) {\n\
                results.mousewheel(function (e, delta, deltaX, deltaY) {\n\
                    var top = results.scrollTop();\n\
                    if (deltaY > 0 && top - deltaY <= 0) {\n\
                        results.scrollTop(0);\n\
                        killEvent(e);\n\
                    } else if (deltaY < 0 && results.get(0).scrollHeight - results.scrollTop() + deltaY <= results.height()) {\n\
                        results.scrollTop(results.get(0).scrollHeight - results.height());\n\
                        killEvent(e);\n\
                    }\n\
                });\n\
            }\n\
\n\
            installKeyUpChangeEvent(search);\n\
            search.on(\"keyup-change input paste\", this.bind(this.updateResults));\n\
            search.on(\"focus\", function () { search.addClass(\"select2-focused\"); });\n\
            search.on(\"blur\", function () { search.removeClass(\"select2-focused\");});\n\
\n\
            this.dropdown.on(\"mouseup\", resultsSelector, this.bind(function (e) {\n\
                if ($(e.target).closest(\".select2-result-selectable\").length > 0) {\n\
                    this.highlightUnderEvent(e);\n\
                    this.selectHighlighted(e);\n\
                }\n\
            }));\n\
\n\
            // trap all mouse events from leaving the dropdown. sometimes there may be a modal that is listening\n\
            // for mouse events outside of itself so it can close itself. since the dropdown is now outside the select2's\n\
            // dom it will trigger the popup close, which is not what we want\n\
            // focusin can cause focus wars between modals and select2 since the dropdown is outside the modal.\n\
            this.dropdown.on(\"click mouseup mousedown touchstart touchend focusin\", function (e) { e.stopPropagation(); });\n\
\n\
            this.nextSearchTerm = undefined;\n\
\n\
            if ($.isFunction(this.opts.initSelection)) {\n\
                // initialize selection based on the current value of the source element\n\
                this.initSelection();\n\
\n\
                // if the user has provided a function that can set selection based on the value of the source element\n\
                // we monitor the change event on the element and trigger it, allowing for two way synchronization\n\
                this.monitorSource();\n\
            }\n\
\n\
            if (opts.maximumInputLength !== null) {\n\
                this.search.attr(\"maxlength\", opts.maximumInputLength);\n\
            }\n\
\n\
            var disabled = opts.element.prop(\"disabled\");\n\
            if (disabled === undefined) disabled = false;\n\
            this.enable(!disabled);\n\
\n\
            var readonly = opts.element.prop(\"readonly\");\n\
            if (readonly === undefined) readonly = false;\n\
            this.readonly(readonly);\n\
\n\
            // Calculate size of scrollbar\n\
            scrollBarDimensions = scrollBarDimensions || measureScrollbar();\n\
\n\
            this.autofocus = opts.element.prop(\"autofocus\");\n\
            opts.element.prop(\"autofocus\", false);\n\
            if (this.autofocus) this.focus();\n\
\n\
            this.search.attr(\"placeholder\", opts.searchInputPlaceholder);\n\
        },\n\
\n\
        // abstract\n\
        destroy: function () {\n\
            var element=this.opts.element, select2 = element.data(\"select2\");\n\
\n\
            this.close();\n\
\n\
            if (this.propertyObserver) {\n\
                this.propertyObserver.disconnect();\n\
                this.propertyObserver = null;\n\
            }\n\
\n\
            if (select2 !== undefined) {\n\
                select2.container.remove();\n\
                select2.liveRegion.remove();\n\
                select2.dropdown.remove();\n\
                element\n\
                    .removeClass(\"select2-offscreen\")\n\
                    .removeData(\"select2\")\n\
                    .off(\".select2\")\n\
                    .prop(\"autofocus\", this.autofocus || false);\n\
                if (this.elementTabIndex) {\n\
                    element.attr({tabindex: this.elementTabIndex});\n\
                } else {\n\
                    element.removeAttr(\"tabindex\");\n\
                }\n\
                element.show();\n\
            }\n\
\n\
            cleanupJQueryElements.call(this,\n\
                \"container\",\n\
                \"liveRegion\",\n\
                \"dropdown\",\n\
                \"results\",\n\
                \"search\"\n\
            );\n\
        },\n\
\n\
        // abstract\n\
        optionToData: function(element) {\n\
            if (element.is(\"option\")) {\n\
                return {\n\
                    id:element.prop(\"value\"),\n\
                    text:element.text(),\n\
                    element: element.get(),\n\
                    css: element.attr(\"class\"),\n\
                    disabled: element.prop(\"disabled\"),\n\
                    locked: equal(element.attr(\"locked\"), \"locked\") || equal(element.data(\"locked\"), true)\n\
                };\n\
            } else if (element.is(\"optgroup\")) {\n\
                return {\n\
                    text:element.attr(\"label\"),\n\
                    children:[],\n\
                    element: element.get(),\n\
                    css: element.attr(\"class\")\n\
                };\n\
            }\n\
        },\n\
\n\
        // abstract\n\
        prepareOpts: function (opts) {\n\
            var element, select, idKey, ajaxUrl, self = this;\n\
\n\
            element = opts.element;\n\
\n\
            if (element.get(0).tagName.toLowerCase() === \"select\") {\n\
                this.select = select = opts.element;\n\
            }\n\
\n\
            if (select) {\n\
                // these options are not allowed when attached to a select because they are picked up off the element itself\n\
                $.each([\"id\", \"multiple\", \"ajax\", \"query\", \"createSearchChoice\", \"initSelection\", \"data\", \"tags\"], function () {\n\
                    if (this in opts) {\n\
                        throw new Error(\"Option '\" + this + \"' is not allowed for Select2 when attached to a <select> element.\");\n\
                    }\n\
                });\n\
            }\n\
\n\
            opts = $.extend({}, {\n\
                populateResults: function(container, results, query) {\n\
                    var populate, id=this.opts.id, liveRegion=this.liveRegion;\n\
\n\
                    populate=function(results, container, depth) {\n\
\n\
                        var i, l, result, selectable, disabled, compound, node, label, innerContainer, formatted;\n\
\n\
                        results = opts.sortResults(results, container, query);\n\
\n\
                        for (i = 0, l = results.length; i < l; i = i + 1) {\n\
\n\
                            result=results[i];\n\
\n\
                            disabled = (result.disabled === true);\n\
                            selectable = (!disabled) && (id(result) !== undefined);\n\
\n\
                            compound=result.children && result.children.length > 0;\n\
\n\
                            node=$(\"<li></li>\");\n\
                            node.addClass(\"select2-results-dept-\"+depth);\n\
                            node.addClass(\"select2-result\");\n\
                            node.addClass(selectable ? \"select2-result-selectable\" : \"select2-result-unselectable\");\n\
                            if (disabled) { node.addClass(\"select2-disabled\"); }\n\
                            if (compound) { node.addClass(\"select2-result-with-children\"); }\n\
                            node.addClass(self.opts.formatResultCssClass(result));\n\
                            node.attr(\"role\", \"presentation\");\n\
\n\
                            label=$(document.createElement(\"div\"));\n\
                            label.addClass(\"select2-result-label\");\n\
                            label.attr(\"id\", \"select2-result-label-\" + nextUid());\n\
                            label.attr(\"role\", \"option\");\n\
\n\
                            formatted=opts.formatResult(result, label, query, self.opts.escapeMarkup);\n\
                            if (formatted!==undefined) {\n\
                                label.html(formatted);\n\
                                node.append(label);\n\
                            }\n\
\n\
\n\
                            if (compound) {\n\
\n\
                                innerContainer=$(\"<ul></ul>\");\n\
                                innerContainer.addClass(\"select2-result-sub\");\n\
                                populate(result.children, innerContainer, depth+1);\n\
                                node.append(innerContainer);\n\
                            }\n\
\n\
                            node.data(\"select2-data\", result);\n\
                            container.append(node);\n\
                        }\n\
\n\
                        liveRegion.text(opts.formatMatches(results.length));\n\
                    };\n\
\n\
                    populate(results, container, 0);\n\
                }\n\
            }, $.fn.select2.defaults, opts);\n\
\n\
            if (typeof(opts.id) !== \"function\") {\n\
                idKey = opts.id;\n\
                opts.id = function (e) { return e[idKey]; };\n\
            }\n\
\n\
            if ($.isArray(opts.element.data(\"select2Tags\"))) {\n\
                if (\"tags\" in opts) {\n\
                    throw \"tags specified as both an attribute 'data-select2-tags' and in options of Select2 \" + opts.element.attr(\"id\");\n\
                }\n\
                opts.tags=opts.element.data(\"select2Tags\");\n\
            }\n\
\n\
            if (select) {\n\
                opts.query = this.bind(function (query) {\n\
                    var data = { results: [], more: false },\n\
                        term = query.term,\n\
                        children, placeholderOption, process;\n\
\n\
                    process=function(element, collection) {\n\
                        var group;\n\
                        if (element.is(\"option\")) {\n\
                            if (query.matcher(term, element.text(), element)) {\n\
                                collection.push(self.optionToData(element));\n\
                            }\n\
                        } else if (element.is(\"optgroup\")) {\n\
                            group=self.optionToData(element);\n\
                            element.children().each2(function(i, elm) { process(elm, group.children); });\n\
                            if (group.children.length>0) {\n\
                                collection.push(group);\n\
                            }\n\
                        }\n\
                    };\n\
\n\
                    children=element.children();\n\
\n\
                    // ignore the placeholder option if there is one\n\
                    if (this.getPlaceholder() !== undefined && children.length > 0) {\n\
                        placeholderOption = this.getPlaceholderOption();\n\
                        if (placeholderOption) {\n\
                            children=children.not(placeholderOption);\n\
                        }\n\
                    }\n\
\n\
                    children.each2(function(i, elm) { process(elm, data.results); });\n\
\n\
                    query.callback(data);\n\
                });\n\
                // this is needed because inside val() we construct choices from options and there id is hardcoded\n\
                opts.id=function(e) { return e.id; };\n\
            } else {\n\
                if (!(\"query\" in opts)) {\n\
\n\
                    if (\"ajax\" in opts) {\n\
                        ajaxUrl = opts.element.data(\"ajax-url\");\n\
                        if (ajaxUrl && ajaxUrl.length > 0) {\n\
                            opts.ajax.url = ajaxUrl;\n\
                        }\n\
                        opts.query = ajax.call(opts.element, opts.ajax);\n\
                    } else if (\"data\" in opts) {\n\
                        opts.query = local(opts.data);\n\
                    } else if (\"tags\" in opts) {\n\
                        opts.query = tags(opts.tags);\n\
                        if (opts.createSearchChoice === undefined) {\n\
                            opts.createSearchChoice = function (term) { return {id: $.trim(term), text: $.trim(term)}; };\n\
                        }\n\
                        if (opts.initSelection === undefined) {\n\
                            opts.initSelection = function (element, callback) {\n\
                                var data = [];\n\
                                $(splitVal(element.val(), opts.separator)).each(function () {\n\
                                    var obj = { id: this, text: this },\n\
                                        tags = opts.tags;\n\
                                    if ($.isFunction(tags)) tags=tags();\n\
                                    $(tags).each(function() { if (equal(this.id, obj.id)) { obj = this; return false; } });\n\
                                    data.push(obj);\n\
                                });\n\
\n\
                                callback(data);\n\
                            };\n\
                        }\n\
                    }\n\
                }\n\
            }\n\
            if (typeof(opts.query) !== \"function\") {\n\
                throw \"query function not defined for Select2 \" + opts.element.attr(\"id\");\n\
            }\n\
\n\
            if (opts.createSearchChoicePosition === 'top') {\n\
                opts.createSearchChoicePosition = function(list, item) { list.unshift(item); };\n\
            }\n\
            else if (opts.createSearchChoicePosition === 'bottom') {\n\
                opts.createSearchChoicePosition = function(list, item) { list.push(item); };\n\
            }\n\
            else if (typeof(opts.createSearchChoicePosition) !== \"function\")  {\n\
                throw \"invalid createSearchChoicePosition option must be 'top', 'bottom' or a custom function\";\n\
            }\n\
\n\
            return opts;\n\
        },\n\
\n\
        /**\n\
         * Monitor the original element for changes and update select2 accordingly\n\
         */\n\
        // abstract\n\
        monitorSource: function () {\n\
            var el = this.opts.element, sync, observer;\n\
\n\
            el.on(\"change.select2\", this.bind(function (e) {\n\
                if (this.opts.element.data(\"select2-change-triggered\") !== true) {\n\
                    this.initSelection();\n\
                }\n\
            }));\n\
\n\
            sync = this.bind(function () {\n\
\n\
                // sync enabled state\n\
                var disabled = el.prop(\"disabled\");\n\
                if (disabled === undefined) disabled = false;\n\
                this.enable(!disabled);\n\
\n\
                var readonly = el.prop(\"readonly\");\n\
                if (readonly === undefined) readonly = false;\n\
                this.readonly(readonly);\n\
\n\
                syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);\n\
                this.container.addClass(evaluate(this.opts.containerCssClass));\n\
\n\
                syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);\n\
                this.dropdown.addClass(evaluate(this.opts.dropdownCssClass));\n\
\n\
            });\n\
\n\
            // IE8-10 (IE9/10 won't fire propertyChange via attachEventListener)\n\
            if (el.length && el[0].attachEvent) {\n\
                el.each(function() {\n\
                    this.attachEvent(\"onpropertychange\", sync);\n\
                });\n\
            }\n\
            \n\
            // safari, chrome, firefox, IE11\n\
            observer = window.MutationObserver || window.WebKitMutationObserver|| window.MozMutationObserver;\n\
            if (observer !== undefined) {\n\
                if (this.propertyObserver) { delete this.propertyObserver; this.propertyObserver = null; }\n\
                this.propertyObserver = new observer(function (mutations) {\n\
                    mutations.forEach(sync);\n\
                });\n\
                this.propertyObserver.observe(el.get(0), { attributes:true, subtree:false });\n\
            }\n\
        },\n\
\n\
        // abstract\n\
        triggerSelect: function(data) {\n\
            var evt = $.Event(\"select2-selecting\", { val: this.id(data), object: data });\n\
            this.opts.element.trigger(evt);\n\
            return !evt.isDefaultPrevented();\n\
        },\n\
\n\
        /**\n\
         * Triggers the change event on the source element\n\
         */\n\
        // abstract\n\
        triggerChange: function (details) {\n\
\n\
            details = details || {};\n\
            details= $.extend({}, details, { type: \"change\", val: this.val() });\n\
            // prevents recursive triggering\n\
            this.opts.element.data(\"select2-change-triggered\", true);\n\
            this.opts.element.trigger(details);\n\
            this.opts.element.data(\"select2-change-triggered\", false);\n\
\n\
            // some validation frameworks ignore the change event and listen instead to keyup, click for selects\n\
            // so here we trigger the click event manually\n\
            this.opts.element.click();\n\
\n\
            // ValidationEngine ignores the change event and listens instead to blur\n\
            // so here we trigger the blur event manually if so desired\n\
            if (this.opts.blurOnChange)\n\
                this.opts.element.blur();\n\
        },\n\
\n\
        //abstract\n\
        isInterfaceEnabled: function()\n\
        {\n\
            return this.enabledInterface === true;\n\
        },\n\
\n\
        // abstract\n\
        enableInterface: function() {\n\
            var enabled = this._enabled && !this._readonly,\n\
                disabled = !enabled;\n\
\n\
            if (enabled === this.enabledInterface) return false;\n\
\n\
            this.container.toggleClass(\"select2-container-disabled\", disabled);\n\
            this.close();\n\
            this.enabledInterface = enabled;\n\
\n\
            return true;\n\
        },\n\
\n\
        // abstract\n\
        enable: function(enabled) {\n\
            if (enabled === undefined) enabled = true;\n\
            if (this._enabled === enabled) return;\n\
            this._enabled = enabled;\n\
\n\
            this.opts.element.prop(\"disabled\", !enabled);\n\
            this.enableInterface();\n\
        },\n\
\n\
        // abstract\n\
        disable: function() {\n\
            this.enable(false);\n\
        },\n\
\n\
        // abstract\n\
        readonly: function(enabled) {\n\
            if (enabled === undefined) enabled = false;\n\
            if (this._readonly === enabled) return;\n\
            this._readonly = enabled;\n\
\n\
            this.opts.element.prop(\"readonly\", enabled);\n\
            this.enableInterface();\n\
        },\n\
\n\
        // abstract\n\
        opened: function () {\n\
            return this.container.hasClass(\"select2-dropdown-open\");\n\
        },\n\
\n\
        // abstract\n\
        positionDropdown: function() {\n\
            var $dropdown = this.dropdown,\n\
                offset = this.container.offset(),\n\
                height = this.container.outerHeight(false),\n\
                width = this.container.outerWidth(false),\n\
                dropHeight = $dropdown.outerHeight(false),\n\
                $window = $(window),\n\
                windowWidth = $window.width(),\n\
                windowHeight = $window.height(),\n\
                viewPortRight = $window.scrollLeft() + windowWidth,\n\
                viewportBottom = $window.scrollTop() + windowHeight,\n\
                dropTop = offset.top + height,\n\
                dropLeft = offset.left,\n\
                enoughRoomBelow = dropTop + dropHeight <= viewportBottom,\n\
                enoughRoomAbove = (offset.top - dropHeight) >= $window.scrollTop(),\n\
                dropWidth = $dropdown.outerWidth(false),\n\
                enoughRoomOnRight = dropLeft + dropWidth <= viewPortRight,\n\
                aboveNow = $dropdown.hasClass(\"select2-drop-above\"),\n\
                bodyOffset,\n\
                above,\n\
                changeDirection,\n\
                css,\n\
                resultsListNode;\n\
\n\
            // always prefer the current above/below alignment, unless there is not enough room\n\
            if (aboveNow) {\n\
                above = true;\n\
                if (!enoughRoomAbove && enoughRoomBelow) {\n\
                    changeDirection = true;\n\
                    above = false;\n\
                }\n\
            } else {\n\
                above = false;\n\
                if (!enoughRoomBelow && enoughRoomAbove) {\n\
                    changeDirection = true;\n\
                    above = true;\n\
                }\n\
            }\n\
\n\
            //if we are changing direction we need to get positions when dropdown is hidden;\n\
            if (changeDirection) {\n\
                $dropdown.hide();\n\
                offset = this.container.offset();\n\
                height = this.container.outerHeight(false);\n\
                width = this.container.outerWidth(false);\n\
                dropHeight = $dropdown.outerHeight(false);\n\
                viewPortRight = $window.scrollLeft() + windowWidth;\n\
                viewportBottom = $window.scrollTop() + windowHeight;\n\
                dropTop = offset.top + height;\n\
                dropLeft = offset.left;\n\
                dropWidth = $dropdown.outerWidth(false);\n\
                enoughRoomOnRight = dropLeft + dropWidth <= viewPortRight;\n\
                $dropdown.show();\n\
\n\
                // fix so the cursor does not move to the left within the search-textbox in IE\n\
                this.focusSearch();\n\
            }\n\
\n\
            if (this.opts.dropdownAutoWidth) {\n\
                resultsListNode = $('.select2-results', $dropdown)[0];\n\
                $dropdown.addClass('select2-drop-auto-width');\n\
                $dropdown.css('width', '');\n\
                // Add scrollbar width to dropdown if vertical scrollbar is present\n\
                dropWidth = $dropdown.outerWidth(false) + (resultsListNode.scrollHeight === resultsListNode.clientHeight ? 0 : scrollBarDimensions.width);\n\
                dropWidth > width ? width = dropWidth : dropWidth = width;\n\
                dropHeight = $dropdown.outerHeight(false);\n\
                enoughRoomOnRight = dropLeft + dropWidth <= viewPortRight;\n\
            }\n\
            else {\n\
                this.container.removeClass('select2-drop-auto-width');\n\
            }\n\
\n\
            //console.log(\"below/ droptop:\", dropTop, \"dropHeight\", dropHeight, \"sum\", (dropTop+dropHeight)+\" viewport bottom\", viewportBottom, \"enough?\", enoughRoomBelow);\n\
            //console.log(\"above/ offset.top\", offset.top, \"dropHeight\", dropHeight, \"top\", (offset.top-dropHeight), \"scrollTop\", this.body.scrollTop(), \"enough?\", enoughRoomAbove);\n\
\n\
            // fix positioning when body has an offset and is not position: static\n\
            if (this.body.css('position') !== 'static') {\n\
                bodyOffset = this.body.offset();\n\
                dropTop -= bodyOffset.top;\n\
                dropLeft -= bodyOffset.left;\n\
            }\n\
\n\
            if (!enoughRoomOnRight) {\n\
                dropLeft = offset.left + this.container.outerWidth(false) - dropWidth;\n\
            }\n\
\n\
            css =  {\n\
                left: dropLeft,\n\
                width: width\n\
            };\n\
\n\
            if (above) {\n\
                css.top = offset.top - dropHeight;\n\
                css.bottom = 'auto';\n\
                this.container.addClass(\"select2-drop-above\");\n\
                $dropdown.addClass(\"select2-drop-above\");\n\
            }\n\
            else {\n\
                css.top = dropTop;\n\
                css.bottom = 'auto';\n\
                this.container.removeClass(\"select2-drop-above\");\n\
                $dropdown.removeClass(\"select2-drop-above\");\n\
            }\n\
            css = $.extend(css, evaluate(this.opts.dropdownCss));\n\
\n\
            $dropdown.css(css);\n\
        },\n\
\n\
        // abstract\n\
        shouldOpen: function() {\n\
            var event;\n\
\n\
            if (this.opened()) return false;\n\
\n\
            if (this._enabled === false || this._readonly === true) return false;\n\
\n\
            event = $.Event(\"select2-opening\");\n\
            this.opts.element.trigger(event);\n\
            return !event.isDefaultPrevented();\n\
        },\n\
\n\
        // abstract\n\
        clearDropdownAlignmentPreference: function() {\n\
            // clear the classes used to figure out the preference of where the dropdown should be opened\n\
            this.container.removeClass(\"select2-drop-above\");\n\
            this.dropdown.removeClass(\"select2-drop-above\");\n\
        },\n\
\n\
        /**\n\
         * Opens the dropdown\n\
         *\n\
         * @return {Boolean} whether or not dropdown was opened. This method will return false if, for example,\n\
         * the dropdown is already open, or if the 'open' event listener on the element called preventDefault().\n\
         */\n\
        // abstract\n\
        open: function () {\n\
\n\
            if (!this.shouldOpen()) return false;\n\
\n\
            this.opening();\n\
\n\
            return true;\n\
        },\n\
\n\
        /**\n\
         * Performs the opening of the dropdown\n\
         */\n\
        // abstract\n\
        opening: function() {\n\
            var cid = this.containerEventName,\n\
                scroll = \"scroll.\" + cid,\n\
                resize = \"resize.\"+cid,\n\
                orient = \"orientationchange.\"+cid,\n\
                mask;\n\
\n\
            this.container.addClass(\"select2-dropdown-open\").addClass(\"select2-container-active\");\n\
\n\
            this.clearDropdownAlignmentPreference();\n\
\n\
            if(this.dropdown[0] !== this.body.children().last()[0]) {\n\
                this.dropdown.detach().appendTo(this.body);\n\
            }\n\
\n\
            // create the dropdown mask if doesn't already exist\n\
            mask = $(\"#select2-drop-mask\");\n\
            if (mask.length == 0) {\n\
                mask = $(document.createElement(\"div\"));\n\
                mask.attr(\"id\",\"select2-drop-mask\").attr(\"class\",\"select2-drop-mask\");\n\
                mask.hide();\n\
                mask.appendTo(this.body);\n\
                mask.on(\"mousedown touchstart click\", function (e) {\n\
                    // Prevent IE from generating a click event on the body\n\
                    reinsertElement(mask);\n\
\n\
                    var dropdown = $(\"#select2-drop\"), self;\n\
                    if (dropdown.length > 0) {\n\
                        self=dropdown.data(\"select2\");\n\
                        if (self.opts.selectOnBlur) {\n\
                            self.selectHighlighted({noFocus: true});\n\
                        }\n\
                        self.close();\n\
                        e.preventDefault();\n\
                        e.stopPropagation();\n\
                    }\n\
                });\n\
            }\n\
\n\
            // ensure the mask is always right before the dropdown\n\
            if (this.dropdown.prev()[0] !== mask[0]) {\n\
                this.dropdown.before(mask);\n\
            }\n\
\n\
            // move the global id to the correct dropdown\n\
            $(\"#select2-drop\").removeAttr(\"id\");\n\
            this.dropdown.attr(\"id\", \"select2-drop\");\n\
\n\
            // show the elements\n\
            mask.show();\n\
\n\
            this.positionDropdown();\n\
            this.dropdown.show();\n\
            this.positionDropdown();\n\
\n\
            this.dropdown.addClass(\"select2-drop-active\");\n\
\n\
            // attach listeners to events that can change the position of the container and thus require\n\
            // the position of the dropdown to be updated as well so it does not come unglued from the container\n\
            var that = this;\n\
            this.container.parents().add(window).each(function () {\n\
                $(this).on(resize+\" \"+scroll+\" \"+orient, function (e) {\n\
                    if (that.opened()) that.positionDropdown();\n\
                });\n\
            });\n\
\n\
\n\
        },\n\
\n\
        // abstract\n\
        close: function () {\n\
            if (!this.opened()) return;\n\
\n\
            var cid = this.containerEventName,\n\
                scroll = \"scroll.\" + cid,\n\
                resize = \"resize.\"+cid,\n\
                orient = \"orientationchange.\"+cid;\n\
\n\
            // unbind event listeners\n\
            this.container.parents().add(window).each(function () { $(this).off(scroll).off(resize).off(orient); });\n\
\n\
            this.clearDropdownAlignmentPreference();\n\
\n\
            $(\"#select2-drop-mask\").hide();\n\
            this.dropdown.removeAttr(\"id\"); // only the active dropdown has the select2-drop id\n\
            this.dropdown.hide();\n\
            this.container.removeClass(\"select2-dropdown-open\").removeClass(\"select2-container-active\");\n\
            this.results.empty();\n\
\n\
\n\
            this.clearSearch();\n\
            this.search.removeClass(\"select2-active\");\n\
            this.opts.element.trigger($.Event(\"select2-close\"));\n\
        },\n\
\n\
        /**\n\
         * Opens control, sets input value, and updates results.\n\
         */\n\
        // abstract\n\
        externalSearch: function (term) {\n\
            this.open();\n\
            this.search.val(term);\n\
            this.updateResults(false);\n\
        },\n\
\n\
        // abstract\n\
        clearSearch: function () {\n\
\n\
        },\n\
\n\
        //abstract\n\
        getMaximumSelectionSize: function() {\n\
            return evaluate(this.opts.maximumSelectionSize);\n\
        },\n\
\n\
        // abstract\n\
        ensureHighlightVisible: function () {\n\
            var results = this.results, children, index, child, hb, rb, y, more;\n\
\n\
            index = this.highlight();\n\
\n\
            if (index < 0) return;\n\
\n\
            if (index == 0) {\n\
\n\
                // if the first element is highlighted scroll all the way to the top,\n\
                // that way any unselectable headers above it will also be scrolled\n\
                // into view\n\
\n\
                results.scrollTop(0);\n\
                return;\n\
            }\n\
\n\
            children = this.findHighlightableChoices().find('.select2-result-label');\n\
\n\
            child = $(children[index]);\n\
\n\
            hb = child.offset().top + child.outerHeight(true);\n\
\n\
            // if this is the last child lets also make sure select2-more-results is visible\n\
            if (index === children.length - 1) {\n\
                more = results.find(\"li.select2-more-results\");\n\
                if (more.length > 0) {\n\
                    hb = more.offset().top + more.outerHeight(true);\n\
                }\n\
            }\n\
\n\
            rb = results.offset().top + results.outerHeight(true);\n\
            if (hb > rb) {\n\
                results.scrollTop(results.scrollTop() + (hb - rb));\n\
            }\n\
            y = child.offset().top - results.offset().top;\n\
\n\
            // make sure the top of the element is visible\n\
            if (y < 0 && child.css('display') != 'none' ) {\n\
                results.scrollTop(results.scrollTop() + y); // y is negative\n\
            }\n\
        },\n\
\n\
        // abstract\n\
        findHighlightableChoices: function() {\n\
            return this.results.find(\".select2-result-selectable:not(.select2-disabled):not(.select2-selected)\");\n\
        },\n\
\n\
        // abstract\n\
        moveHighlight: function (delta) {\n\
            var choices = this.findHighlightableChoices(),\n\
                index = this.highlight();\n\
\n\
            while (index > -1 && index < choices.length) {\n\
                index += delta;\n\
                var choice = $(choices[index]);\n\
                if (choice.hasClass(\"select2-result-selectable\") && !choice.hasClass(\"select2-disabled\") && !choice.hasClass(\"select2-selected\")) {\n\
                    this.highlight(index);\n\
                    break;\n\
                }\n\
            }\n\
        },\n\
\n\
        // abstract\n\
        highlight: function (index) {\n\
            var choices = this.findHighlightableChoices(),\n\
                choice,\n\
                data;\n\
\n\
            if (arguments.length === 0) {\n\
                return indexOf(choices.filter(\".select2-highlighted\")[0], choices.get());\n\
            }\n\
\n\
            if (index >= choices.length) index = choices.length - 1;\n\
            if (index < 0) index = 0;\n\
\n\
            this.removeHighlight();\n\
\n\
            choice = $(choices[index]);\n\
            choice.addClass(\"select2-highlighted\");\n\
\n\
            // ensure assistive technology can determine the active choice\n\
            this.search.attr(\"aria-activedescendant\", choice.find(\".select2-result-label\").attr(\"id\"));\n\
\n\
            this.ensureHighlightVisible();\n\
\n\
            this.liveRegion.text(choice.text());\n\
\n\
            data = choice.data(\"select2-data\");\n\
            if (data) {\n\
                this.opts.element.trigger({ type: \"select2-highlight\", val: this.id(data), choice: data });\n\
            }\n\
        },\n\
\n\
        removeHighlight: function() {\n\
            this.results.find(\".select2-highlighted\").removeClass(\"select2-highlighted\");\n\
        },\n\
\n\
        touchMoved: function() {\n\
            this._touchMoved = true;\n\
        },\n\
\n\
        clearTouchMoved: function() {\n\
          this._touchMoved = false;\n\
        },\n\
\n\
        // abstract\n\
        countSelectableResults: function() {\n\
            return this.findHighlightableChoices().length;\n\
        },\n\
\n\
        // abstract\n\
        highlightUnderEvent: function (event) {\n\
            var el = $(event.target).closest(\".select2-result-selectable\");\n\
            if (el.length > 0 && !el.is(\".select2-highlighted\")) {\n\
                var choices = this.findHighlightableChoices();\n\
                this.highlight(choices.index(el));\n\
            } else if (el.length == 0) {\n\
                // if we are over an unselectable item remove all highlights\n\
                this.removeHighlight();\n\
            }\n\
        },\n\
\n\
        // abstract\n\
        loadMoreIfNeeded: function () {\n\
            var results = this.results,\n\
                more = results.find(\"li.select2-more-results\"),\n\
                below, // pixels the element is below the scroll fold, below==0 is when the element is starting to be visible\n\
                page = this.resultsPage + 1,\n\
                self=this,\n\
                term=this.search.val(),\n\
                context=this.context;\n\
\n\
            if (more.length === 0) return;\n\
            below = more.offset().top - results.offset().top - results.height();\n\
\n\
            if (below <= this.opts.loadMorePadding) {\n\
                more.addClass(\"select2-active\");\n\
                this.opts.query({\n\
                        element: this.opts.element,\n\
                        term: term,\n\
                        page: page,\n\
                        context: context,\n\
                        matcher: this.opts.matcher,\n\
                        callback: this.bind(function (data) {\n\
\n\
                    // ignore a response if the select2 has been closed before it was received\n\
                    if (!self.opened()) return;\n\
\n\
\n\
                    self.opts.populateResults.call(this, results, data.results, {term: term, page: page, context:context});\n\
                    self.postprocessResults(data, false, false);\n\
\n\
                    if (data.more===true) {\n\
                        more.detach().appendTo(results).text(evaluate(self.opts.formatLoadMore, page+1));\n\
                        window.setTimeout(function() { self.loadMoreIfNeeded(); }, 10);\n\
                    } else {\n\
                        more.remove();\n\
                    }\n\
                    self.positionDropdown();\n\
                    self.resultsPage = page;\n\
                    self.context = data.context;\n\
                    this.opts.element.trigger({ type: \"select2-loaded\", items: data });\n\
                })});\n\
            }\n\
        },\n\
\n\
        /**\n\
         * Default tokenizer function which does nothing\n\
         */\n\
        tokenize: function() {\n\
\n\
        },\n\
\n\
        /**\n\
         * @param initial whether or not this is the call to this method right after the dropdown has been opened\n\
         */\n\
        // abstract\n\
        updateResults: function (initial) {\n\
            var search = this.search,\n\
                results = this.results,\n\
                opts = this.opts,\n\
                data,\n\
                self = this,\n\
                input,\n\
                term = search.val(),\n\
                lastTerm = $.data(this.container, \"select2-last-term\"),\n\
                // sequence number used to drop out-of-order responses\n\
                queryNumber;\n\
\n\
            // prevent duplicate queries against the same term\n\
            if (initial !== true && lastTerm && equal(term, lastTerm)) return;\n\
\n\
            $.data(this.container, \"select2-last-term\", term);\n\
\n\
            // if the search is currently hidden we do not alter the results\n\
            if (initial !== true && (this.showSearchInput === false || !this.opened())) {\n\
                return;\n\
            }\n\
\n\
            function postRender() {\n\
                search.removeClass(\"select2-active\");\n\
                self.positionDropdown();\n\
                if (results.find('.select2-no-results,.select2-selection-limit,.select2-searching').length) {\n\
                    self.liveRegion.text(results.text());\n\
                }\n\
                else {\n\
                    self.liveRegion.text(self.opts.formatMatches(results.find('.select2-result-selectable').length));\n\
                }\n\
            }\n\
\n\
            function render(html) {\n\
                results.html(html);\n\
                postRender();\n\
            }\n\
\n\
            queryNumber = ++this.queryCount;\n\
\n\
            var maxSelSize = this.getMaximumSelectionSize();\n\
            if (maxSelSize >=1) {\n\
                data = this.data();\n\
                if ($.isArray(data) && data.length >= maxSelSize && checkFormatter(opts.formatSelectionTooBig, \"formatSelectionTooBig\")) {\n\
                    render(\"<li class='select2-selection-limit'>\" + evaluate(opts.formatSelectionTooBig, maxSelSize) + \"</li>\");\n\
                    return;\n\
                }\n\
            }\n\
\n\
            if (search.val().length < opts.minimumInputLength) {\n\
                if (checkFormatter(opts.formatInputTooShort, \"formatInputTooShort\")) {\n\
                    render(\"<li class='select2-no-results'>\" + evaluate(opts.formatInputTooShort, search.val(), opts.minimumInputLength) + \"</li>\");\n\
                } else {\n\
                    render(\"\");\n\
                }\n\
                if (initial && this.showSearch) this.showSearch(true);\n\
                return;\n\
            }\n\
\n\
            if (opts.maximumInputLength && search.val().length > opts.maximumInputLength) {\n\
                if (checkFormatter(opts.formatInputTooLong, \"formatInputTooLong\")) {\n\
                    render(\"<li class='select2-no-results'>\" + evaluate(opts.formatInputTooLong, search.val(), opts.maximumInputLength) + \"</li>\");\n\
                } else {\n\
                    render(\"\");\n\
                }\n\
                return;\n\
            }\n\
\n\
            if (opts.formatSearching && this.findHighlightableChoices().length === 0) {\n\
                render(\"<li class='select2-searching'>\" + evaluate(opts.formatSearching) + \"</li>\");\n\
            }\n\
\n\
            search.addClass(\"select2-active\");\n\
\n\
            this.removeHighlight();\n\
\n\
            // give the tokenizer a chance to pre-process the input\n\
            input = this.tokenize();\n\
            if (input != undefined && input != null) {\n\
                search.val(input);\n\
            }\n\
\n\
            this.resultsPage = 1;\n\
\n\
            opts.query({\n\
                element: opts.element,\n\
                    term: search.val(),\n\
                    page: this.resultsPage,\n\
                    context: null,\n\
                    matcher: opts.matcher,\n\
                    callback: this.bind(function (data) {\n\
                var def; // default choice\n\
\n\
                // ignore old responses\n\
                if (queryNumber != this.queryCount) {\n\
                  return;\n\
                }\n\
\n\
                // ignore a response if the select2 has been closed before it was received\n\
                if (!this.opened()) {\n\
                    this.search.removeClass(\"select2-active\");\n\
                    return;\n\
                }\n\
\n\
                // save context, if any\n\
                this.context = (data.context===undefined) ? null : data.context;\n\
                // create a default choice and prepend it to the list\n\
                if (this.opts.createSearchChoice && search.val() !== \"\") {\n\
                    def = this.opts.createSearchChoice.call(self, search.val(), data.results);\n\
                    if (def !== undefined && def !== null && self.id(def) !== undefined && self.id(def) !== null) {\n\
                        if ($(data.results).filter(\n\
                            function () {\n\
                                return equal(self.id(this), self.id(def));\n\
                            }).length === 0) {\n\
                            this.opts.createSearchChoicePosition(data.results, def);\n\
                        }\n\
                    }\n\
                }\n\
\n\
                if (data.results.length === 0 && checkFormatter(opts.formatNoMatches, \"formatNoMatches\")) {\n\
                    render(\"<li class='select2-no-results'>\" + evaluate(opts.formatNoMatches, search.val()) + \"</li>\");\n\
                    return;\n\
                }\n\
\n\
                results.empty();\n\
                self.opts.populateResults.call(this, results, data.results, {term: search.val(), page: this.resultsPage, context:null});\n\
\n\
                if (data.more === true && checkFormatter(opts.formatLoadMore, \"formatLoadMore\")) {\n\
                    results.append(\"<li class='select2-more-results'>\" + self.opts.escapeMarkup(evaluate(opts.formatLoadMore, this.resultsPage)) + \"</li>\");\n\
                    window.setTimeout(function() { self.loadMoreIfNeeded(); }, 10);\n\
                }\n\
\n\
                this.postprocessResults(data, initial);\n\
\n\
                postRender();\n\
\n\
                this.opts.element.trigger({ type: \"select2-loaded\", items: data });\n\
            })});\n\
        },\n\
\n\
        // abstract\n\
        cancel: function () {\n\
            this.close();\n\
        },\n\
\n\
        // abstract\n\
        blur: function () {\n\
            // if selectOnBlur == true, select the currently highlighted option\n\
            if (this.opts.selectOnBlur)\n\
                this.selectHighlighted({noFocus: true});\n\
\n\
            this.close();\n\
            this.container.removeClass(\"select2-container-active\");\n\
            // synonymous to .is(':focus'), which is available in jquery >= 1.6\n\
            if (this.search[0] === document.activeElement) { this.search.blur(); }\n\
            this.clearSearch();\n\
            this.selection.find(\".select2-search-choice-focus\").removeClass(\"select2-search-choice-focus\");\n\
        },\n\
\n\
        // abstract\n\
        focusSearch: function () {\n\
            focus(this.search);\n\
        },\n\
\n\
        // abstract\n\
        selectHighlighted: function (options) {\n\
            if (this._touchMoved) {\n\
              this.clearTouchMoved();\n\
              return;\n\
            }\n\
            var index=this.highlight(),\n\
                highlighted=this.results.find(\".select2-highlighted\"),\n\
                data = highlighted.closest('.select2-result').data(\"select2-data\");\n\
\n\
            if (data) {\n\
                this.highlight(index);\n\
                this.onSelect(data, options);\n\
            } else if (options && options.noFocus) {\n\
                this.close();\n\
            }\n\
        },\n\
\n\
        // abstract\n\
        getPlaceholder: function () {\n\
            var placeholderOption;\n\
            return this.opts.element.attr(\"placeholder\") ||\n\
                this.opts.element.attr(\"data-placeholder\") || // jquery 1.4 compat\n\
                this.opts.element.data(\"placeholder\") ||\n\
                this.opts.placeholder ||\n\
                ((placeholderOption = this.getPlaceholderOption()) !== undefined ? placeholderOption.text() : undefined);\n\
        },\n\
\n\
        // abstract\n\
        getPlaceholderOption: function() {\n\
            if (this.select) {\n\
                var firstOption = this.select.children('option').first();\n\
                if (this.opts.placeholderOption !== undefined ) {\n\
                    //Determine the placeholder option based on the specified placeholderOption setting\n\
                    return (this.opts.placeholderOption === \"first\" && firstOption) ||\n\
                           (typeof this.opts.placeholderOption === \"function\" && this.opts.placeholderOption(this.select));\n\
                } else if ($.trim(firstOption.text()) === \"\" && firstOption.val() === \"\") {\n\
                    //No explicit placeholder option specified, use the first if it's blank\n\
                    return firstOption;\n\
                }\n\
            }\n\
        },\n\
\n\
        /**\n\
         * Get the desired width for the container element.  This is\n\
         * derived first from option `width` passed to select2, then\n\
         * the inline 'style' on the original element, and finally\n\
         * falls back to the jQuery calculated element width.\n\
         */\n\
        // abstract\n\
        initContainerWidth: function () {\n\
            function resolveContainerWidth() {\n\
                var style, attrs, matches, i, l, attr;\n\
\n\
                if (this.opts.width === \"off\") {\n\
                    return null;\n\
                } else if (this.opts.width === \"element\"){\n\
                    return this.opts.element.outerWidth(false) === 0 ? 'auto' : this.opts.element.outerWidth(false) + 'px';\n\
                } else if (this.opts.width === \"copy\" || this.opts.width === \"resolve\") {\n\
                    // check if there is inline style on the element that contains width\n\
                    style = this.opts.element.attr('style');\n\
                    if (style !== undefined) {\n\
                        attrs = style.split(';');\n\
                        for (i = 0, l = attrs.length; i < l; i = i + 1) {\n\
                            attr = attrs[i].replace(/\\s/g, '');\n\
                            matches = attr.match(/^width:(([-+]?([0-9]*\\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i);\n\
                            if (matches !== null && matches.length >= 1)\n\
                                return matches[1];\n\
                        }\n\
                    }\n\
\n\
                    if (this.opts.width === \"resolve\") {\n\
                        // next check if css('width') can resolve a width that is percent based, this is sometimes possible\n\
                        // when attached to input type=hidden or elements hidden via css\n\
                        style = this.opts.element.css('width');\n\
                        if (style.indexOf(\"%\") > 0) return style;\n\
\n\
                        // finally, fallback on the calculated width of the element\n\
                        return (this.opts.element.outerWidth(false) === 0 ? 'auto' : this.opts.element.outerWidth(false) + 'px');\n\
                    }\n\
\n\
                    return null;\n\
                } else if ($.isFunction(this.opts.width)) {\n\
                    return this.opts.width();\n\
                } else {\n\
                    return this.opts.width;\n\
               }\n\
            };\n\
\n\
            var width = resolveContainerWidth.call(this);\n\
            if (width !== null) {\n\
                this.container.css(\"width\", width);\n\
            }\n\
        }\n\
    });\n\
\n\
    SingleSelect2 = clazz(AbstractSelect2, {\n\
\n\
        // single\n\
\n\
        createContainer: function () {\n\
            var container = $(document.createElement(\"div\")).attr({\n\
                \"class\": \"select2-container\"\n\
            }).html([\n\
                \"<a href='javascript:void(0)' class='select2-choice' tabindex='-1'>\",\n\
                \"   <span class='select2-chosen'>&#160;</span><abbr class='select2-search-choice-close'></abbr>\",\n\
                \"   <span class='select2-arrow' role='presentation'><b role='presentation'></b></span>\",\n\
                \"</a>\",\n\
                \"<label for='' class='select2-offscreen'></label>\",\n\
                \"<input class='select2-focusser select2-offscreen' type='text' aria-haspopup='true' role='button' />\",\n\
                \"<div class='select2-drop select2-display-none'>\",\n\
                \"   <div class='select2-search'>\",\n\
                \"       <label for='' class='select2-offscreen'></label>\",\n\
                \"       <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input' role='combobox' aria-expanded='true'\",\n\
                \"       aria-autocomplete='list' />\",\n\
                \"   </div>\",\n\
                \"   <ul class='select2-results' role='listbox'>\",\n\
                \"   </ul>\",\n\
                \"</div>\"].join(\"\"));\n\
            return container;\n\
        },\n\
\n\
        // single\n\
        enableInterface: function() {\n\
            if (this.parent.enableInterface.apply(this, arguments)) {\n\
                this.focusser.prop(\"disabled\", !this.isInterfaceEnabled());\n\
            }\n\
        },\n\
\n\
        // single\n\
        opening: function () {\n\
            var el, range, len;\n\
\n\
            if (this.opts.minimumResultsForSearch >= 0) {\n\
                this.showSearch(true);\n\
            }\n\
\n\
            this.parent.opening.apply(this, arguments);\n\
\n\
            if (this.showSearchInput !== false) {\n\
                // IE appends focusser.val() at the end of field :/ so we manually insert it at the beginning using a range\n\
                // all other browsers handle this just fine\n\
\n\
                this.search.val(this.focusser.val());\n\
            }\n\
            if (this.opts.shouldFocusInput(this)) {\n\
                this.search.focus();\n\
                // move the cursor to the end after focussing, otherwise it will be at the beginning and\n\
                // new text will appear *before* focusser.val()\n\
                el = this.search.get(0);\n\
                if (el.createTextRange) {\n\
                    range = el.createTextRange();\n\
                    range.collapse(false);\n\
                    range.select();\n\
                } else if (el.setSelectionRange) {\n\
                    len = this.search.val().length;\n\
                    el.setSelectionRange(len, len);\n\
                }\n\
            }\n\
\n\
            // initializes search's value with nextSearchTerm (if defined by user)\n\
            // ignore nextSearchTerm if the dropdown is opened by the user pressing a letter\n\
            if(this.search.val() === \"\") {\n\
                if(this.nextSearchTerm != undefined){\n\
                    this.search.val(this.nextSearchTerm);\n\
                    this.search.select();\n\
                }\n\
            }\n\
\n\
            this.focusser.prop(\"disabled\", true).val(\"\");\n\
            this.updateResults(true);\n\
            this.opts.element.trigger($.Event(\"select2-open\"));\n\
        },\n\
\n\
        // single\n\
        close: function () {\n\
            if (!this.opened()) return;\n\
            this.parent.close.apply(this, arguments);\n\
\n\
            this.focusser.prop(\"disabled\", false);\n\
\n\
            if (this.opts.shouldFocusInput(this)) {\n\
                this.focusser.focus();\n\
            }\n\
        },\n\
\n\
        // single\n\
        focus: function () {\n\
            if (this.opened()) {\n\
                this.close();\n\
            } else {\n\
                this.focusser.prop(\"disabled\", false);\n\
                if (this.opts.shouldFocusInput(this)) {\n\
                    this.focusser.focus();\n\
                }\n\
            }\n\
        },\n\
\n\
        // single\n\
        isFocused: function () {\n\
            return this.container.hasClass(\"select2-container-active\");\n\
        },\n\
\n\
        // single\n\
        cancel: function () {\n\
            this.parent.cancel.apply(this, arguments);\n\
            this.focusser.prop(\"disabled\", false);\n\
\n\
            if (this.opts.shouldFocusInput(this)) {\n\
                this.focusser.focus();\n\
            }\n\
        },\n\
\n\
        // single\n\
        destroy: function() {\n\
            $(\"label[for='\" + this.focusser.attr('id') + \"']\")\n\
                .attr('for', this.opts.element.attr(\"id\"));\n\
            this.parent.destroy.apply(this, arguments);\n\
\n\
            cleanupJQueryElements.call(this,\n\
                \"selection\",\n\
                \"focusser\"\n\
            );\n\
        },\n\
\n\
        // single\n\
        initContainer: function () {\n\
\n\
            var selection,\n\
                container = this.container,\n\
                dropdown = this.dropdown,\n\
                idSuffix = nextUid(),\n\
                elementLabel;\n\
\n\
            if (this.opts.minimumResultsForSearch < 0) {\n\
                this.showSearch(false);\n\
            } else {\n\
                this.showSearch(true);\n\
            }\n\
\n\
            this.selection = selection = container.find(\".select2-choice\");\n\
\n\
            this.focusser = container.find(\".select2-focusser\");\n\
\n\
            // add aria associations\n\
            selection.find(\".select2-chosen\").attr(\"id\", \"select2-chosen-\"+idSuffix);\n\
            this.focusser.attr(\"aria-labelledby\", \"select2-chosen-\"+idSuffix);\n\
            this.results.attr(\"id\", \"select2-results-\"+idSuffix);\n\
            this.search.attr(\"aria-owns\", \"select2-results-\"+idSuffix);\n\
\n\
            // rewrite labels from original element to focusser\n\
            this.focusser.attr(\"id\", \"s2id_autogen\"+idSuffix);\n\
\n\
            elementLabel = $(\"label[for='\" + this.opts.element.attr(\"id\") + \"']\");\n\
\n\
            this.focusser.prev()\n\
                .text(elementLabel.text())\n\
                .attr('for', this.focusser.attr('id'));\n\
\n\
            // Ensure the original element retains an accessible name\n\
            var originalTitle = this.opts.element.attr(\"title\");\n\
            this.opts.element.attr(\"title\", (originalTitle || elementLabel.text()));\n\
\n\
            this.focusser.attr(\"tabindex\", this.elementTabIndex);\n\
\n\
            // write label for search field using the label from the focusser element\n\
            this.search.attr(\"id\", this.focusser.attr('id') + '_search');\n\
\n\
            this.search.prev()\n\
                .text($(\"label[for='\" + this.focusser.attr('id') + \"']\").text())\n\
                .attr('for', this.search.attr('id'));\n\
\n\
            this.search.on(\"keydown\", this.bind(function (e) {\n\
                if (!this.isInterfaceEnabled()) return;\n\
\n\
                if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN) {\n\
                    // prevent the page from scrolling\n\
                    killEvent(e);\n\
                    return;\n\
                }\n\
\n\
                switch (e.which) {\n\
                    case KEY.UP:\n\
                    case KEY.DOWN:\n\
                        this.moveHighlight((e.which === KEY.UP) ? -1 : 1);\n\
                        killEvent(e);\n\
                        return;\n\
                    case KEY.ENTER:\n\
                        this.selectHighlighted();\n\
                        killEvent(e);\n\
                        return;\n\
                    case KEY.TAB:\n\
                        this.selectHighlighted({noFocus: true});\n\
                        return;\n\
                    case KEY.ESC:\n\
                        this.cancel(e);\n\
                        killEvent(e);\n\
                        return;\n\
                }\n\
            }));\n\
\n\
            this.search.on(\"blur\", this.bind(function(e) {\n\
                // a workaround for chrome to keep the search field focussed when the scroll bar is used to scroll the dropdown.\n\
                // without this the search field loses focus which is annoying\n\
                if (document.activeElement === this.body.get(0)) {\n\
                    window.setTimeout(this.bind(function() {\n\
                        if (this.opened()) {\n\
                            this.search.focus();\n\
                        }\n\
                    }), 0);\n\
                }\n\
            }));\n\
\n\
            this.focusser.on(\"keydown\", this.bind(function (e) {\n\
                if (!this.isInterfaceEnabled()) return;\n\
\n\
                if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.ESC) {\n\
                    return;\n\
                }\n\
\n\
                if (this.opts.openOnEnter === false && e.which === KEY.ENTER) {\n\
                    killEvent(e);\n\
                    return;\n\
                }\n\
\n\
                if (e.which == KEY.DOWN || e.which == KEY.UP\n\
                    || (e.which == KEY.ENTER && this.opts.openOnEnter)) {\n\
\n\
                    if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) return;\n\
\n\
                    this.open();\n\
                    killEvent(e);\n\
                    return;\n\
                }\n\
\n\
                if (e.which == KEY.DELETE || e.which == KEY.BACKSPACE) {\n\
                    if (this.opts.allowClear) {\n\
                        this.clear();\n\
                    }\n\
                    killEvent(e);\n\
                    return;\n\
                }\n\
            }));\n\
\n\
\n\
            installKeyUpChangeEvent(this.focusser);\n\
            this.focusser.on(\"keyup-change input\", this.bind(function(e) {\n\
                if (this.opts.minimumResultsForSearch >= 0) {\n\
                    e.stopPropagation();\n\
                    if (this.opened()) return;\n\
                    this.open();\n\
                }\n\
            }));\n\
\n\
            selection.on(\"mousedown touchstart\", \"abbr\", this.bind(function (e) {\n\
                if (!this.isInterfaceEnabled()) return;\n\
                this.clear();\n\
                killEventImmediately(e);\n\
                this.close();\n\
                this.selection.focus();\n\
            }));\n\
\n\
            selection.on(\"mousedown touchstart\", this.bind(function (e) {\n\
                // Prevent IE from generating a click event on the body\n\
                reinsertElement(selection);\n\
\n\
                if (!this.container.hasClass(\"select2-container-active\")) {\n\
                    this.opts.element.trigger($.Event(\"select2-focus\"));\n\
                }\n\
\n\
                if (this.opened()) {\n\
                    this.close();\n\
                } else if (this.isInterfaceEnabled()) {\n\
                    this.open();\n\
                }\n\
\n\
                killEvent(e);\n\
            }));\n\
\n\
            dropdown.on(\"mousedown touchstart\", this.bind(function() {\n\
                if (this.opts.shouldFocusInput(this)) {\n\
                    this.search.focus();\n\
                }\n\
            }));\n\
\n\
            selection.on(\"focus\", this.bind(function(e) {\n\
                killEvent(e);\n\
            }));\n\
\n\
            this.focusser.on(\"focus\", this.bind(function(){\n\
                if (!this.container.hasClass(\"select2-container-active\")) {\n\
                    this.opts.element.trigger($.Event(\"select2-focus\"));\n\
                }\n\
                this.container.addClass(\"select2-container-active\");\n\
            })).on(\"blur\", this.bind(function() {\n\
                if (!this.opened()) {\n\
                    this.container.removeClass(\"select2-container-active\");\n\
                    this.opts.element.trigger($.Event(\"select2-blur\"));\n\
                }\n\
            }));\n\
            this.search.on(\"focus\", this.bind(function(){\n\
                if (!this.container.hasClass(\"select2-container-active\")) {\n\
                    this.opts.element.trigger($.Event(\"select2-focus\"));\n\
                }\n\
                this.container.addClass(\"select2-container-active\");\n\
            }));\n\
\n\
            this.initContainerWidth();\n\
            this.opts.element.addClass(\"select2-offscreen\");\n\
            this.setPlaceholder();\n\
\n\
        },\n\
\n\
        // single\n\
        clear: function(triggerChange) {\n\
            var data=this.selection.data(\"select2-data\");\n\
            if (data) { // guard against queued quick consecutive clicks\n\
                var evt = $.Event(\"select2-clearing\");\n\
                this.opts.element.trigger(evt);\n\
                if (evt.isDefaultPrevented()) {\n\
                    return;\n\
                }\n\
                var placeholderOption = this.getPlaceholderOption();\n\
                this.opts.element.val(placeholderOption ? placeholderOption.val() : \"\");\n\
                this.selection.find(\".select2-chosen\").empty();\n\
                this.selection.removeData(\"select2-data\");\n\
                this.setPlaceholder();\n\
\n\
                if (triggerChange !== false){\n\
                    this.opts.element.trigger({ type: \"select2-removed\", val: this.id(data), choice: data });\n\
                    this.triggerChange({removed:data});\n\
                }\n\
            }\n\
        },\n\
\n\
        /**\n\
         * Sets selection based on source element's value\n\
         */\n\
        // single\n\
        initSelection: function () {\n\
            var selected;\n\
            if (this.isPlaceholderOptionSelected()) {\n\
                this.updateSelection(null);\n\
                this.close();\n\
                this.setPlaceholder();\n\
            } else {\n\
                var self = this;\n\
                this.opts.initSelection.call(null, this.opts.element, function(selected){\n\
                    if (selected !== undefined && selected !== null) {\n\
                        self.updateSelection(selected);\n\
                        self.close();\n\
                        self.setPlaceholder();\n\
                        self.nextSearchTerm = self.opts.nextSearchTerm(selected, self.search.val());\n\
                    }\n\
                });\n\
            }\n\
        },\n\
\n\
        isPlaceholderOptionSelected: function() {\n\
            var placeholderOption;\n\
            if (this.getPlaceholder() === undefined) return false; // no placeholder specified so no option should be considered\n\
            return ((placeholderOption = this.getPlaceholderOption()) !== undefined && placeholderOption.prop(\"selected\"))\n\
                || (this.opts.element.val() === \"\")\n\
                || (this.opts.element.val() === undefined)\n\
                || (this.opts.element.val() === null);\n\
        },\n\
\n\
        // single\n\
        prepareOpts: function () {\n\
            var opts = this.parent.prepareOpts.apply(this, arguments),\n\
                self=this;\n\
\n\
            if (opts.element.get(0).tagName.toLowerCase() === \"select\") {\n\
                // install the selection initializer\n\
                opts.initSelection = function (element, callback) {\n\
                    var selected = element.find(\"option\").filter(function() { return this.selected && !this.disabled });\n\
                    // a single select box always has a value, no need to null check 'selected'\n\
                    callback(self.optionToData(selected));\n\
                };\n\
            } else if (\"data\" in opts) {\n\
                // install default initSelection when applied to hidden input and data is local\n\
                opts.initSelection = opts.initSelection || function (element, callback) {\n\
                    var id = element.val();\n\
                    //search in data by id, storing the actual matching item\n\
                    var match = null;\n\
                    opts.query({\n\
                        matcher: function(term, text, el){\n\
                            var is_match = equal(id, opts.id(el));\n\
                            if (is_match) {\n\
                                match = el;\n\
                            }\n\
                            return is_match;\n\
                        },\n\
                        callback: !$.isFunction(callback) ? $.noop : function() {\n\
                            callback(match);\n\
                        }\n\
                    });\n\
                };\n\
            }\n\
\n\
            return opts;\n\
        },\n\
\n\
        // single\n\
        getPlaceholder: function() {\n\
            // if a placeholder is specified on a single select without a valid placeholder option ignore it\n\
            if (this.select) {\n\
                if (this.getPlaceholderOption() === undefined) {\n\
                    return undefined;\n\
                }\n\
            }\n\
\n\
            return this.parent.getPlaceholder.apply(this, arguments);\n\
        },\n\
\n\
        // single\n\
        setPlaceholder: function () {\n\
            var placeholder = this.getPlaceholder();\n\
\n\
            if (this.isPlaceholderOptionSelected() && placeholder !== undefined) {\n\
\n\
                // check for a placeholder option if attached to a select\n\
                if (this.select && this.getPlaceholderOption() === undefined) return;\n\
\n\
                this.selection.find(\".select2-chosen\").html(this.opts.escapeMarkup(placeholder));\n\
\n\
                this.selection.addClass(\"select2-default\");\n\
\n\
                this.container.removeClass(\"select2-allowclear\");\n\
            }\n\
        },\n\
\n\
        // single\n\
        postprocessResults: function (data, initial, noHighlightUpdate) {\n\
            var selected = 0, self = this, showSearchInput = true;\n\
\n\
            // find the selected element in the result list\n\
\n\
            this.findHighlightableChoices().each2(function (i, elm) {\n\
                if (equal(self.id(elm.data(\"select2-data\")), self.opts.element.val())) {\n\
                    selected = i;\n\
                    return false;\n\
                }\n\
            });\n\
\n\
            // and highlight it\n\
            if (noHighlightUpdate !== false) {\n\
                if (initial === true && selected >= 0) {\n\
                    this.highlight(selected);\n\
                } else {\n\
                    this.highlight(0);\n\
                }\n\
            }\n\
\n\
            // hide the search box if this is the first we got the results and there are enough of them for search\n\
\n\
            if (initial === true) {\n\
                var min = this.opts.minimumResultsForSearch;\n\
                if (min >= 0) {\n\
                    this.showSearch(countResults(data.results) >= min);\n\
                }\n\
            }\n\
        },\n\
\n\
        // single\n\
        showSearch: function(showSearchInput) {\n\
            if (this.showSearchInput === showSearchInput) return;\n\
\n\
            this.showSearchInput = showSearchInput;\n\
\n\
            this.dropdown.find(\".select2-search\").toggleClass(\"select2-search-hidden\", !showSearchInput);\n\
            this.dropdown.find(\".select2-search\").toggleClass(\"select2-offscreen\", !showSearchInput);\n\
            //add \"select2-with-searchbox\" to the container if search box is shown\n\
            $(this.dropdown, this.container).toggleClass(\"select2-with-searchbox\", showSearchInput);\n\
        },\n\
\n\
        // single\n\
        onSelect: function (data, options) {\n\
\n\
            if (!this.triggerSelect(data)) { return; }\n\
\n\
            var old = this.opts.element.val(),\n\
                oldData = this.data();\n\
\n\
            this.opts.element.val(this.id(data));\n\
            this.updateSelection(data);\n\
\n\
            this.opts.element.trigger({ type: \"select2-selected\", val: this.id(data), choice: data });\n\
\n\
            this.nextSearchTerm = this.opts.nextSearchTerm(data, this.search.val());\n\
            this.close();\n\
\n\
            if ((!options || !options.noFocus) && this.opts.shouldFocusInput(this)) {\n\
                this.focusser.focus();\n\
            }\n\
\n\
            if (!equal(old, this.id(data))) {\n\
                this.triggerChange({ added: data, removed: oldData });\n\
            }\n\
        },\n\
\n\
        // single\n\
        updateSelection: function (data) {\n\
\n\
            var container=this.selection.find(\".select2-chosen\"), formatted, cssClass;\n\
\n\
            this.selection.data(\"select2-data\", data);\n\
\n\
            container.empty();\n\
            if (data !== null) {\n\
                formatted=this.opts.formatSelection(data, container, this.opts.escapeMarkup);\n\
            }\n\
            if (formatted !== undefined) {\n\
                container.append(formatted);\n\
            }\n\
            cssClass=this.opts.formatSelectionCssClass(data, container);\n\
            if (cssClass !== undefined) {\n\
                container.addClass(cssClass);\n\
            }\n\
\n\
            this.selection.removeClass(\"select2-default\");\n\
\n\
            if (this.opts.allowClear && this.getPlaceholder() !== undefined) {\n\
                this.container.addClass(\"select2-allowclear\");\n\
            }\n\
        },\n\
\n\
        // single\n\
        val: function () {\n\
            var val,\n\
                triggerChange = false,\n\
                data = null,\n\
                self = this,\n\
                oldData = this.data();\n\
\n\
            if (arguments.length === 0) {\n\
                return this.opts.element.val();\n\
            }\n\
\n\
            val = arguments[0];\n\
\n\
            if (arguments.length > 1) {\n\
                triggerChange = arguments[1];\n\
            }\n\
\n\
            if (this.select) {\n\
                this.select\n\
                    .val(val)\n\
                    .find(\"option\").filter(function() { return this.selected }).each2(function (i, elm) {\n\
                        data = self.optionToData(elm);\n\
                        return false;\n\
                    });\n\
                this.updateSelection(data);\n\
                this.setPlaceholder();\n\
                if (triggerChange) {\n\
                    this.triggerChange({added: data, removed:oldData});\n\
                }\n\
            } else {\n\
                // val is an id. !val is true for [undefined,null,'',0] - 0 is legal\n\
                if (!val && val !== 0) {\n\
                    this.clear(triggerChange);\n\
                    return;\n\
                }\n\
                if (this.opts.initSelection === undefined) {\n\
                    throw new Error(\"cannot call val() if initSelection() is not defined\");\n\
                }\n\
                this.opts.element.val(val);\n\
                this.opts.initSelection(this.opts.element, function(data){\n\
                    self.opts.element.val(!data ? \"\" : self.id(data));\n\
                    self.updateSelection(data);\n\
                    self.setPlaceholder();\n\
                    if (triggerChange) {\n\
                        self.triggerChange({added: data, removed:oldData});\n\
                    }\n\
                });\n\
            }\n\
        },\n\
\n\
        // single\n\
        clearSearch: function () {\n\
            this.search.val(\"\");\n\
            this.focusser.val(\"\");\n\
        },\n\
\n\
        // single\n\
        data: function(value) {\n\
            var data,\n\
                triggerChange = false;\n\
\n\
            if (arguments.length === 0) {\n\
                data = this.selection.data(\"select2-data\");\n\
                if (data == undefined) data = null;\n\
                return data;\n\
            } else {\n\
                if (arguments.length > 1) {\n\
                    triggerChange = arguments[1];\n\
                }\n\
                if (!value) {\n\
                    this.clear(triggerChange);\n\
                } else {\n\
                    data = this.data();\n\
                    this.opts.element.val(!value ? \"\" : this.id(value));\n\
                    this.updateSelection(value);\n\
                    if (triggerChange) {\n\
                        this.triggerChange({added: value, removed:data});\n\
                    }\n\
                }\n\
            }\n\
        }\n\
    });\n\
\n\
    MultiSelect2 = clazz(AbstractSelect2, {\n\
\n\
        // multi\n\
        createContainer: function () {\n\
            var container = $(document.createElement(\"div\")).attr({\n\
                \"class\": \"select2-container select2-container-multi\"\n\
            }).html([\n\
                \"<ul class='select2-choices'>\",\n\
                \"  <li class='select2-search-field'>\",\n\
                \"    <label for='' class='select2-offscreen'></label>\",\n\
                \"    <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input'>\",\n\
                \"  </li>\",\n\
                \"</ul>\",\n\
                \"<div class='select2-drop select2-drop-multi select2-display-none'>\",\n\
                \"   <ul class='select2-results'>\",\n\
                \"   </ul>\",\n\
                \"</div>\"].join(\"\"));\n\
            return container;\n\
        },\n\
\n\
        // multi\n\
        prepareOpts: function () {\n\
            var opts = this.parent.prepareOpts.apply(this, arguments),\n\
                self=this;\n\
\n\
            // TODO validate placeholder is a string if specified\n\
\n\
            if (opts.element.get(0).tagName.toLowerCase() === \"select\") {\n\
                // install the selection initializer\n\
                opts.initSelection = function (element, callback) {\n\
\n\
                    var data = [];\n\
\n\
                    element.find(\"option\").filter(function() { return this.selected && !this.disabled }).each2(function (i, elm) {\n\
                        data.push(self.optionToData(elm));\n\
                    });\n\
                    callback(data);\n\
                };\n\
            } else if (\"data\" in opts) {\n\
                // install default initSelection when applied to hidden input and data is local\n\
                opts.initSelection = opts.initSelection || function (element, callback) {\n\
                    var ids = splitVal(element.val(), opts.separator);\n\
                    //search in data by array of ids, storing matching items in a list\n\
                    var matches = [];\n\
                    opts.query({\n\
                        matcher: function(term, text, el){\n\
                            var is_match = $.grep(ids, function(id) {\n\
                                return equal(id, opts.id(el));\n\
                            }).length;\n\
                            if (is_match) {\n\
                                matches.push(el);\n\
                            }\n\
                            return is_match;\n\
                        },\n\
                        callback: !$.isFunction(callback) ? $.noop : function() {\n\
                            // reorder matches based on the order they appear in the ids array because right now\n\
                            // they are in the order in which they appear in data array\n\
                            var ordered = [];\n\
                            for (var i = 0; i < ids.length; i++) {\n\
                                var id = ids[i];\n\
                                for (var j = 0; j < matches.length; j++) {\n\
                                    var match = matches[j];\n\
                                    if (equal(id, opts.id(match))) {\n\
                                        ordered.push(match);\n\
                                        matches.splice(j, 1);\n\
                                        break;\n\
                                    }\n\
                                }\n\
                            }\n\
                            callback(ordered);\n\
                        }\n\
                    });\n\
                };\n\
            }\n\
\n\
            return opts;\n\
        },\n\
\n\
        // multi\n\
        selectChoice: function (choice) {\n\
\n\
            var selected = this.container.find(\".select2-search-choice-focus\");\n\
            if (selected.length && choice && choice[0] == selected[0]) {\n\
\n\
            } else {\n\
                if (selected.length) {\n\
                    this.opts.element.trigger(\"choice-deselected\", selected);\n\
                }\n\
                selected.removeClass(\"select2-search-choice-focus\");\n\
                if (choice && choice.length) {\n\
                    this.close();\n\
                    choice.addClass(\"select2-search-choice-focus\");\n\
                    this.opts.element.trigger(\"choice-selected\", choice);\n\
                }\n\
            }\n\
        },\n\
\n\
        // multi\n\
        destroy: function() {\n\
            $(\"label[for='\" + this.search.attr('id') + \"']\")\n\
                .attr('for', this.opts.element.attr(\"id\"));\n\
            this.parent.destroy.apply(this, arguments);\n\
\n\
            cleanupJQueryElements.call(this,\n\
                \"searchContainer\",\n\
                \"selection\"\n\
            );\n\
        },\n\
\n\
        // multi\n\
        initContainer: function () {\n\
\n\
            var selector = \".select2-choices\", selection;\n\
\n\
            this.searchContainer = this.container.find(\".select2-search-field\");\n\
            this.selection = selection = this.container.find(selector);\n\
\n\
            var _this = this;\n\
            this.selection.on(\"click\", \".select2-search-choice:not(.select2-locked)\", function (e) {\n\
                //killEvent(e);\n\
                _this.search[0].focus();\n\
                _this.selectChoice($(this));\n\
            });\n\
\n\
            // rewrite labels from original element to focusser\n\
            this.search.attr(\"id\", \"s2id_autogen\"+nextUid());\n\
\n\
            this.search.prev()\n\
                .text($(\"label[for='\" + this.opts.element.attr(\"id\") + \"']\").text())\n\
                .attr('for', this.search.attr('id'));\n\
\n\
            this.search.on(\"input paste\", this.bind(function() {\n\
                if (!this.isInterfaceEnabled()) return;\n\
                if (!this.opened()) {\n\
                    this.open();\n\
                }\n\
            }));\n\
\n\
            this.search.attr(\"tabindex\", this.elementTabIndex);\n\
\n\
            this.keydowns = 0;\n\
            this.search.on(\"keydown\", this.bind(function (e) {\n\
                if (!this.isInterfaceEnabled()) return;\n\
\n\
                ++this.keydowns;\n\
                var selected = selection.find(\".select2-search-choice-focus\");\n\
                var prev = selected.prev(\".select2-search-choice:not(.select2-locked)\");\n\
                var next = selected.next(\".select2-search-choice:not(.select2-locked)\");\n\
                var pos = getCursorInfo(this.search);\n\
\n\
                if (selected.length &&\n\
                    (e.which == KEY.LEFT || e.which == KEY.RIGHT || e.which == KEY.BACKSPACE || e.which == KEY.DELETE || e.which == KEY.ENTER)) {\n\
                    var selectedChoice = selected;\n\
                    if (e.which == KEY.LEFT && prev.length) {\n\
                        selectedChoice = prev;\n\
                    }\n\
                    else if (e.which == KEY.RIGHT) {\n\
                        selectedChoice = next.length ? next : null;\n\
                    }\n\
                    else if (e.which === KEY.BACKSPACE) {\n\
                        if (this.unselect(selected.first())) {\n\
                            this.search.width(10);\n\
                            selectedChoice = prev.length ? prev : next;\n\
                        }\n\
                    } else if (e.which == KEY.DELETE) {\n\
                        if (this.unselect(selected.first())) {\n\
                            this.search.width(10);\n\
                            selectedChoice = next.length ? next : null;\n\
                        }\n\
                    } else if (e.which == KEY.ENTER) {\n\
                        selectedChoice = null;\n\
                    }\n\
\n\
                    this.selectChoice(selectedChoice);\n\
                    killEvent(e);\n\
                    if (!selectedChoice || !selectedChoice.length) {\n\
                        this.open();\n\
                    }\n\
                    return;\n\
                } else if (((e.which === KEY.BACKSPACE && this.keydowns == 1)\n\
                    || e.which == KEY.LEFT) && (pos.offset == 0 && !pos.length)) {\n\
\n\
                    this.selectChoice(selection.find(\".select2-search-choice:not(.select2-locked)\").last());\n\
                    killEvent(e);\n\
                    return;\n\
                } else {\n\
                    this.selectChoice(null);\n\
                }\n\
\n\
                if (this.opened()) {\n\
                    switch (e.which) {\n\
                    case KEY.UP:\n\
                    case KEY.DOWN:\n\
                        this.moveHighlight((e.which === KEY.UP) ? -1 : 1);\n\
                        killEvent(e);\n\
                        return;\n\
                    case KEY.ENTER:\n\
                        this.selectHighlighted();\n\
                        killEvent(e);\n\
                        return;\n\
                    case KEY.TAB:\n\
                        this.selectHighlighted({noFocus:true});\n\
                        this.close();\n\
                        return;\n\
                    case KEY.ESC:\n\
                        this.cancel(e);\n\
                        killEvent(e);\n\
                        return;\n\
                    }\n\
                }\n\
\n\
                if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e)\n\
                 || e.which === KEY.BACKSPACE || e.which === KEY.ESC) {\n\
                    return;\n\
                }\n\
\n\
                if (e.which === KEY.ENTER) {\n\
                    if (this.opts.openOnEnter === false) {\n\
                        return;\n\
                    } else if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {\n\
                        return;\n\
                    }\n\
                }\n\
\n\
                this.open();\n\
\n\
                if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN) {\n\
                    // prevent the page from scrolling\n\
                    killEvent(e);\n\
                }\n\
\n\
                if (e.which === KEY.ENTER) {\n\
                    // prevent form from being submitted\n\
                    killEvent(e);\n\
                }\n\
\n\
            }));\n\
\n\
            this.search.on(\"keyup\", this.bind(function (e) {\n\
                this.keydowns = 0;\n\
                this.resizeSearch();\n\
            })\n\
            );\n\
\n\
            this.search.on(\"blur\", this.bind(function(e) {\n\
                this.container.removeClass(\"select2-container-active\");\n\
                this.search.removeClass(\"select2-focused\");\n\
                this.selectChoice(null);\n\
                if (!this.opened()) this.clearSearch();\n\
                e.stopImmediatePropagation();\n\
                this.opts.element.trigger($.Event(\"select2-blur\"));\n\
            }));\n\
\n\
            this.container.on(\"click\", selector, this.bind(function (e) {\n\
                if (!this.isInterfaceEnabled()) return;\n\
                if ($(e.target).closest(\".select2-search-choice\").length > 0) {\n\
                    // clicked inside a select2 search choice, do not open\n\
                    return;\n\
                }\n\
                this.selectChoice(null);\n\
                this.clearPlaceholder();\n\
                if (!this.container.hasClass(\"select2-container-active\")) {\n\
                    this.opts.element.trigger($.Event(\"select2-focus\"));\n\
                }\n\
                this.open();\n\
                this.focusSearch();\n\
                e.preventDefault();\n\
            }));\n\
\n\
            this.container.on(\"focus\", selector, this.bind(function () {\n\
                if (!this.isInterfaceEnabled()) return;\n\
                if (!this.container.hasClass(\"select2-container-active\")) {\n\
                    this.opts.element.trigger($.Event(\"select2-focus\"));\n\
                }\n\
                this.container.addClass(\"select2-container-active\");\n\
                this.dropdown.addClass(\"select2-drop-active\");\n\
                this.clearPlaceholder();\n\
            }));\n\
\n\
            this.initContainerWidth();\n\
            this.opts.element.addClass(\"select2-offscreen\");\n\
\n\
            // set the placeholder if necessary\n\
            this.clearSearch();\n\
        },\n\
\n\
        // multi\n\
        enableInterface: function() {\n\
            if (this.parent.enableInterface.apply(this, arguments)) {\n\
                this.search.prop(\"disabled\", !this.isInterfaceEnabled());\n\
            }\n\
        },\n\
\n\
        // multi\n\
        initSelection: function () {\n\
            var data;\n\
            if (this.opts.element.val() === \"\" && this.opts.element.text() === \"\") {\n\
                this.updateSelection([]);\n\
                this.close();\n\
                // set the placeholder if necessary\n\
                this.clearSearch();\n\
            }\n\
            if (this.select || this.opts.element.val() !== \"\") {\n\
                var self = this;\n\
                this.opts.initSelection.call(null, this.opts.element, function(data){\n\
                    if (data !== undefined && data !== null) {\n\
                        self.updateSelection(data);\n\
                        self.close();\n\
                        // set the placeholder if necessary\n\
                        self.clearSearch();\n\
                    }\n\
                });\n\
            }\n\
        },\n\
\n\
        // multi\n\
        clearSearch: function () {\n\
            var placeholder = this.getPlaceholder(),\n\
                maxWidth = this.getMaxSearchWidth();\n\
\n\
            if (placeholder !== undefined  && this.getVal().length === 0 && this.search.hasClass(\"select2-focused\") === false) {\n\
                this.search.val(placeholder).addClass(\"select2-default\");\n\
                // stretch the search box to full width of the container so as much of the placeholder is visible as possible\n\
                // we could call this.resizeSearch(), but we do not because that requires a sizer and we do not want to create one so early because of a firefox bug, see #944\n\
                this.search.width(maxWidth > 0 ? maxWidth : this.container.css(\"width\"));\n\
            } else {\n\
                this.search.val(\"\").width(10);\n\
            }\n\
        },\n\
\n\
        // multi\n\
        clearPlaceholder: function () {\n\
            if (this.search.hasClass(\"select2-default\")) {\n\
                this.search.val(\"\").removeClass(\"select2-default\");\n\
            }\n\
        },\n\
\n\
        // multi\n\
        opening: function () {\n\
            this.clearPlaceholder(); // should be done before super so placeholder is not used to search\n\
            this.resizeSearch();\n\
\n\
            this.parent.opening.apply(this, arguments);\n\
\n\
            this.focusSearch();\n\
\n\
            // initializes search's value with nextSearchTerm (if defined by user)\n\
            // ignore nextSearchTerm if the dropdown is opened by the user pressing a letter\n\
            if(this.search.val() === \"\") {\n\
                if(this.nextSearchTerm != undefined){\n\
                    this.search.val(this.nextSearchTerm);\n\
                    this.search.select();\n\
                }\n\
            }\n\
\n\
            this.updateResults(true);\n\
            if (this.opts.shouldFocusInput(this)) {\n\
                this.search.focus();\n\
            }\n\
            this.opts.element.trigger($.Event(\"select2-open\"));\n\
        },\n\
\n\
        // multi\n\
        close: function () {\n\
            if (!this.opened()) return;\n\
            this.parent.close.apply(this, arguments);\n\
        },\n\
\n\
        // multi\n\
        focus: function () {\n\
            this.close();\n\
            this.search.focus();\n\
        },\n\
\n\
        // multi\n\
        isFocused: function () {\n\
            return this.search.hasClass(\"select2-focused\");\n\
        },\n\
\n\
        // multi\n\
        updateSelection: function (data) {\n\
            var ids = [], filtered = [], self = this;\n\
\n\
            // filter out duplicates\n\
            $(data).each(function () {\n\
                if (indexOf(self.id(this), ids) < 0) {\n\
                    ids.push(self.id(this));\n\
                    filtered.push(this);\n\
                }\n\
            });\n\
            data = filtered;\n\
\n\
            this.selection.find(\".select2-search-choice\").remove();\n\
            $(data).each(function () {\n\
                self.addSelectedChoice(this);\n\
            });\n\
            self.postprocessResults();\n\
        },\n\
\n\
        // multi\n\
        tokenize: function() {\n\
            var input = this.search.val();\n\
            input = this.opts.tokenizer.call(this, input, this.data(), this.bind(this.onSelect), this.opts);\n\
            if (input != null && input != undefined) {\n\
                this.search.val(input);\n\
                if (input.length > 0) {\n\
                    this.open();\n\
                }\n\
            }\n\
\n\
        },\n\
\n\
        // multi\n\
        onSelect: function (data, options) {\n\
\n\
            if (!this.triggerSelect(data)) { return; }\n\
\n\
            this.addSelectedChoice(data);\n\
\n\
            this.opts.element.trigger({ type: \"selected\", val: this.id(data), choice: data });\n\
\n\
            // keep track of the search's value before it gets cleared\n\
            this.nextSearchTerm = this.opts.nextSearchTerm(data, this.search.val());\n\
\n\
            this.clearSearch();\n\
            this.updateResults();\n\
\n\
            if (this.select || !this.opts.closeOnSelect) this.postprocessResults(data, false, this.opts.closeOnSelect===true);\n\
\n\
            if (this.opts.closeOnSelect) {\n\
                this.close();\n\
                this.search.width(10);\n\
            } else {\n\
                if (this.countSelectableResults()>0) {\n\
                    this.search.width(10);\n\
                    this.resizeSearch();\n\
                    if (this.getMaximumSelectionSize() > 0 && this.val().length >= this.getMaximumSelectionSize()) {\n\
                        // if we reached max selection size repaint the results so choices\n\
                        // are replaced with the max selection reached message\n\
                        this.updateResults(true);\n\
                    } else {\n\
                        // initializes search's value with nextSearchTerm and update search result\n\
                        if(this.nextSearchTerm != undefined){\n\
                            this.search.val(this.nextSearchTerm);\n\
                            this.updateResults();\n\
                            this.search.select();\n\
                        }\n\
                    }\n\
                    this.positionDropdown();\n\
                } else {\n\
                    // if nothing left to select close\n\
                    this.close();\n\
                    this.search.width(10);\n\
                }\n\
            }\n\
\n\
            // since its not possible to select an element that has already been\n\
            // added we do not need to check if this is a new element before firing change\n\
            this.triggerChange({ added: data });\n\
\n\
            if (!options || !options.noFocus)\n\
                this.focusSearch();\n\
        },\n\
\n\
        // multi\n\
        cancel: function () {\n\
            this.close();\n\
            this.focusSearch();\n\
        },\n\
\n\
        addSelectedChoice: function (data) {\n\
            var enableChoice = !data.locked,\n\
                enabledItem = $(\n\
                    \"<li class='select2-search-choice'>\" +\n\
                    \"    <div></div>\" +\n\
                    \"    <a href='#' class='select2-search-choice-close' tabindex='-1'></a>\" +\n\
                    \"</li>\"),\n\
                disabledItem = $(\n\
                    \"<li class='select2-search-choice select2-locked'>\" +\n\
                    \"<div></div>\" +\n\
                    \"</li>\");\n\
            var choice = enableChoice ? enabledItem : disabledItem,\n\
                id = this.id(data),\n\
                val = this.getVal(),\n\
                formatted,\n\
                cssClass;\n\
\n\
            formatted=this.opts.formatSelection(data, choice.find(\"div\"), this.opts.escapeMarkup);\n\
            if (formatted != undefined) {\n\
                choice.find(\"div\").replaceWith(\"<div>\"+formatted+\"</div>\");\n\
            }\n\
            cssClass=this.opts.formatSelectionCssClass(data, choice.find(\"div\"));\n\
            if (cssClass != undefined) {\n\
                choice.addClass(cssClass);\n\
            }\n\
\n\
            if(enableChoice){\n\
              choice.find(\".select2-search-choice-close\")\n\
                  .on(\"mousedown\", killEvent)\n\
                  .on(\"click dblclick\", this.bind(function (e) {\n\
                  if (!this.isInterfaceEnabled()) return;\n\
\n\
                  this.unselect($(e.target));\n\
                  this.selection.find(\".select2-search-choice-focus\").removeClass(\"select2-search-choice-focus\");\n\
                  killEvent(e);\n\
                  this.close();\n\
                  this.focusSearch();\n\
              })).on(\"focus\", this.bind(function () {\n\
                  if (!this.isInterfaceEnabled()) return;\n\
                  this.container.addClass(\"select2-container-active\");\n\
                  this.dropdown.addClass(\"select2-drop-active\");\n\
              }));\n\
            }\n\
\n\
            choice.data(\"select2-data\", data);\n\
            choice.insertBefore(this.searchContainer);\n\
\n\
            val.push(id);\n\
            this.setVal(val);\n\
        },\n\
\n\
        // multi\n\
        unselect: function (selected) {\n\
            var val = this.getVal(),\n\
                data,\n\
                index;\n\
            selected = selected.closest(\".select2-search-choice\");\n\
\n\
            if (selected.length === 0) {\n\
                throw \"Invalid argument: \" + selected + \". Must be .select2-search-choice\";\n\
            }\n\
\n\
            data = selected.data(\"select2-data\");\n\
\n\
            if (!data) {\n\
                // prevent a race condition when the 'x' is clicked really fast repeatedly the event can be queued\n\
                // and invoked on an element already removed\n\
                return;\n\
            }\n\
\n\
            var evt = $.Event(\"select2-removing\");\n\
            evt.val = this.id(data);\n\
            evt.choice = data;\n\
            this.opts.element.trigger(evt);\n\
\n\
            if (evt.isDefaultPrevented()) {\n\
                return false;\n\
            }\n\
\n\
            while((index = indexOf(this.id(data), val)) >= 0) {\n\
                val.splice(index, 1);\n\
                this.setVal(val);\n\
                if (this.select) this.postprocessResults();\n\
            }\n\
\n\
            selected.remove();\n\
\n\
            this.opts.element.trigger({ type: \"select2-removed\", val: this.id(data), choice: data });\n\
            this.triggerChange({ removed: data });\n\
\n\
            return true;\n\
        },\n\
\n\
        // multi\n\
        postprocessResults: function (data, initial, noHighlightUpdate) {\n\
            var val = this.getVal(),\n\
                choices = this.results.find(\".select2-result\"),\n\
                compound = this.results.find(\".select2-result-with-children\"),\n\
                self = this;\n\
\n\
            choices.each2(function (i, choice) {\n\
                var id = self.id(choice.data(\"select2-data\"));\n\
                if (indexOf(id, val) >= 0) {\n\
                    choice.addClass(\"select2-selected\");\n\
                    // mark all children of the selected parent as selected\n\
                    choice.find(\".select2-result-selectable\").addClass(\"select2-selected\");\n\
                }\n\
            });\n\
\n\
            compound.each2(function(i, choice) {\n\
                // hide an optgroup if it doesn't have any selectable children\n\
                if (!choice.is('.select2-result-selectable')\n\
                    && choice.find(\".select2-result-selectable:not(.select2-selected)\").length === 0) {\n\
                    choice.addClass(\"select2-selected\");\n\
                }\n\
            });\n\
\n\
            if (this.highlight() == -1 && noHighlightUpdate !== false){\n\
                self.highlight(0);\n\
            }\n\
\n\
            //If all results are chosen render formatNoMatches\n\
            if(!this.opts.createSearchChoice && !choices.filter('.select2-result:not(.select2-selected)').length > 0){\n\
                if(!data || data && !data.more && this.results.find(\".select2-no-results\").length === 0) {\n\
                    if (checkFormatter(self.opts.formatNoMatches, \"formatNoMatches\")) {\n\
                        this.results.append(\"<li class='select2-no-results'>\" + evaluate(self.opts.formatNoMatches, self.search.val()) + \"</li>\");\n\
                    }\n\
                }\n\
            }\n\
\n\
        },\n\
\n\
        // multi\n\
        getMaxSearchWidth: function() {\n\
            return this.selection.width() - getSideBorderPadding(this.search);\n\
        },\n\
\n\
        // multi\n\
        resizeSearch: function () {\n\
            var minimumWidth, left, maxWidth, containerLeft, searchWidth,\n\
                sideBorderPadding = getSideBorderPadding(this.search);\n\
\n\
            minimumWidth = measureTextWidth(this.search) + 10;\n\
\n\
            left = this.search.offset().left;\n\
\n\
            maxWidth = this.selection.width();\n\
            containerLeft = this.selection.offset().left;\n\
\n\
            searchWidth = maxWidth - (left - containerLeft) - sideBorderPadding;\n\
\n\
            if (searchWidth < minimumWidth) {\n\
                searchWidth = maxWidth - sideBorderPadding;\n\
            }\n\
\n\
            if (searchWidth < 40) {\n\
                searchWidth = maxWidth - sideBorderPadding;\n\
            }\n\
\n\
            if (searchWidth <= 0) {\n\
              searchWidth = minimumWidth;\n\
            }\n\
\n\
            this.search.width(Math.floor(searchWidth));\n\
        },\n\
\n\
        // multi\n\
        getVal: function () {\n\
            var val;\n\
            if (this.select) {\n\
                val = this.select.val();\n\
                return val === null ? [] : val;\n\
            } else {\n\
                val = this.opts.element.val();\n\
                return splitVal(val, this.opts.separator);\n\
            }\n\
        },\n\
\n\
        // multi\n\
        setVal: function (val) {\n\
            var unique;\n\
            if (this.select) {\n\
                this.select.val(val);\n\
            } else {\n\
                unique = [];\n\
                // filter out duplicates\n\
                $(val).each(function () {\n\
                    if (indexOf(this, unique) < 0) unique.push(this);\n\
                });\n\
                this.opts.element.val(unique.length === 0 ? \"\" : unique.join(this.opts.separator));\n\
            }\n\
        },\n\
\n\
        // multi\n\
        buildChangeDetails: function (old, current) {\n\
            var current = current.slice(0),\n\
                old = old.slice(0);\n\
\n\
            // remove intersection from each array\n\
            for (var i = 0; i < current.length; i++) {\n\
                for (var j = 0; j < old.length; j++) {\n\
                    if (equal(this.opts.id(current[i]), this.opts.id(old[j]))) {\n\
                        current.splice(i, 1);\n\
                        if(i>0){\n\
                        \ti--;\n\
                        }\n\
                        old.splice(j, 1);\n\
                        j--;\n\
                    }\n\
                }\n\
            }\n\
\n\
            return {added: current, removed: old};\n\
        },\n\
\n\
\n\
        // multi\n\
        val: function (val, triggerChange) {\n\
            var oldData, self=this;\n\
\n\
            if (arguments.length === 0) {\n\
                return this.getVal();\n\
            }\n\
\n\
            oldData=this.data();\n\
            if (!oldData.length) oldData=[];\n\
\n\
            // val is an id. !val is true for [undefined,null,'',0] - 0 is legal\n\
            if (!val && val !== 0) {\n\
                this.opts.element.val(\"\");\n\
                this.updateSelection([]);\n\
                this.clearSearch();\n\
                if (triggerChange) {\n\
                    this.triggerChange({added: this.data(), removed: oldData});\n\
                }\n\
                return;\n\
            }\n\
\n\
            // val is a list of ids\n\
            this.setVal(val);\n\
\n\
            if (this.select) {\n\
                this.opts.initSelection(this.select, this.bind(this.updateSelection));\n\
                if (triggerChange) {\n\
                    this.triggerChange(this.buildChangeDetails(oldData, this.data()));\n\
                }\n\
            } else {\n\
                if (this.opts.initSelection === undefined) {\n\
                    throw new Error(\"val() cannot be called if initSelection() is not defined\");\n\
                }\n\
\n\
                this.opts.initSelection(this.opts.element, function(data){\n\
                    var ids=$.map(data, self.id);\n\
                    self.setVal(ids);\n\
                    self.updateSelection(data);\n\
                    self.clearSearch();\n\
                    if (triggerChange) {\n\
                        self.triggerChange(self.buildChangeDetails(oldData, self.data()));\n\
                    }\n\
                });\n\
            }\n\
            this.clearSearch();\n\
        },\n\
\n\
        // multi\n\
        onSortStart: function() {\n\
            if (this.select) {\n\
                throw new Error(\"Sorting of elements is not supported when attached to <select>. Attach to <input type='hidden'/> instead.\");\n\
            }\n\
\n\
            // collapse search field into 0 width so its container can be collapsed as well\n\
            this.search.width(0);\n\
            // hide the container\n\
            this.searchContainer.hide();\n\
        },\n\
\n\
        // multi\n\
        onSortEnd:function() {\n\
\n\
            var val=[], self=this;\n\
\n\
            // show search and move it to the end of the list\n\
            this.searchContainer.show();\n\
            // make sure the search container is the last item in the list\n\
            this.searchContainer.appendTo(this.searchContainer.parent());\n\
            // since we collapsed the width in dragStarted, we resize it here\n\
            this.resizeSearch();\n\
\n\
            // update selection\n\
            this.selection.find(\".select2-search-choice\").each(function() {\n\
                val.push(self.opts.id($(this).data(\"select2-data\")));\n\
            });\n\
            this.setVal(val);\n\
            this.triggerChange();\n\
        },\n\
\n\
        // multi\n\
        data: function(values, triggerChange) {\n\
            var self=this, ids, old;\n\
            if (arguments.length === 0) {\n\
                 return this.selection\n\
                     .children(\".select2-search-choice\")\n\
                     .map(function() { return $(this).data(\"select2-data\"); })\n\
                     .get();\n\
            } else {\n\
                old = this.data();\n\
                if (!values) { values = []; }\n\
                ids = $.map(values, function(e) { return self.opts.id(e); });\n\
                this.setVal(ids);\n\
                this.updateSelection(values);\n\
                this.clearSearch();\n\
                if (triggerChange) {\n\
                    this.triggerChange(this.buildChangeDetails(old, this.data()));\n\
                }\n\
            }\n\
        }\n\
    });\n\
\n\
    $.fn.select2 = function () {\n\
\n\
        var args = Array.prototype.slice.call(arguments, 0),\n\
            opts,\n\
            select2,\n\
            method, value, multiple,\n\
            allowedMethods = [\"val\", \"destroy\", \"opened\", \"open\", \"close\", \"focus\", \"isFocused\", \"container\", \"dropdown\", \"onSortStart\", \"onSortEnd\", \"enable\", \"disable\", \"readonly\", \"positionDropdown\", \"data\", \"search\"],\n\
            valueMethods = [\"opened\", \"isFocused\", \"container\", \"dropdown\"],\n\
            propertyMethods = [\"val\", \"data\"],\n\
            methodsMap = { search: \"externalSearch\" };\n\
\n\
        this.each(function () {\n\
            if (args.length === 0 || typeof(args[0]) === \"object\") {\n\
                opts = args.length === 0 ? {} : $.extend({}, args[0]);\n\
                opts.element = $(this);\n\
\n\
                if (opts.element.get(0).tagName.toLowerCase() === \"select\") {\n\
                    multiple = opts.element.prop(\"multiple\");\n\
                } else {\n\
                    multiple = opts.multiple || false;\n\
                    if (\"tags\" in opts) {opts.multiple = multiple = true;}\n\
                }\n\
\n\
                select2 = multiple ? new window.Select2[\"class\"].multi() : new window.Select2[\"class\"].single();\n\
                select2.init(opts);\n\
            } else if (typeof(args[0]) === \"string\") {\n\
\n\
                if (indexOf(args[0], allowedMethods) < 0) {\n\
                    throw \"Unknown method: \" + args[0];\n\
                }\n\
\n\
                value = undefined;\n\
                select2 = $(this).data(\"select2\");\n\
                if (select2 === undefined) return;\n\
\n\
                method=args[0];\n\
\n\
                if (method === \"container\") {\n\
                    value = select2.container;\n\
                } else if (method === \"dropdown\") {\n\
                    value = select2.dropdown;\n\
                } else {\n\
                    if (methodsMap[method]) method = methodsMap[method];\n\
\n\
                    value = select2[method].apply(select2, args.slice(1));\n\
                }\n\
                if (indexOf(args[0], valueMethods) >= 0\n\
                    || (indexOf(args[0], propertyMethods) >= 0 && args.length == 1)) {\n\
                    return false; // abort the iteration, ready to return first matched value\n\
                }\n\
            } else {\n\
                throw \"Invalid arguments to select2 plugin: \" + args;\n\
            }\n\
        });\n\
        return (value === undefined) ? this : value;\n\
    };\n\
\n\
    // plugin defaults, accessible to users\n\
    $.fn.select2.defaults = {\n\
        width: \"copy\",\n\
        loadMorePadding: 0,\n\
        closeOnSelect: true,\n\
        openOnEnter: true,\n\
        containerCss: {},\n\
        dropdownCss: {},\n\
        containerCssClass: \"\",\n\
        dropdownCssClass: \"\",\n\
        formatResult: function(result, container, query, escapeMarkup) {\n\
            var markup=[];\n\
            markMatch(result.text, query.term, markup, escapeMarkup);\n\
            return markup.join(\"\");\n\
        },\n\
        formatSelection: function (data, container, escapeMarkup) {\n\
            return data ? escapeMarkup(data.text) : undefined;\n\
        },\n\
        sortResults: function (results, container, query) {\n\
            return results;\n\
        },\n\
        formatResultCssClass: function(data) {return data.css;},\n\
        formatSelectionCssClass: function(data, container) {return undefined;},\n\
        formatMatches: function (matches) { return matches + \" results are available, use up and down arrow keys to navigate.\"; },\n\
        formatNoMatches: function () { return \"No matches found\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Please enter \" + n + \" or more character\" + (n == 1? \"\" : \"s\"); },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Please delete \" + n + \" character\" + (n == 1? \"\" : \"s\"); },\n\
        formatSelectionTooBig: function (limit) { return \"You can only select \" + limit + \" item\" + (limit == 1 ? \"\" : \"s\"); },\n\
        formatLoadMore: function (pageNumber) { return \"Loading more results…\"; },\n\
        formatSearching: function () { return \"Searching…\"; },\n\
        minimumResultsForSearch: 0,\n\
        minimumInputLength: 0,\n\
        maximumInputLength: null,\n\
        maximumSelectionSize: 0,\n\
        id: function (e) { return e == undefined ? null : e.id; },\n\
        matcher: function(term, text) {\n\
            return stripDiacritics(''+text).toUpperCase().indexOf(stripDiacritics(''+term).toUpperCase()) >= 0;\n\
        },\n\
        separator: \",\",\n\
        tokenSeparators: [],\n\
        tokenizer: defaultTokenizer,\n\
        escapeMarkup: defaultEscapeMarkup,\n\
        blurOnChange: false,\n\
        selectOnBlur: false,\n\
        adaptContainerCssClass: function(c) { return c; },\n\
        adaptDropdownCssClass: function(c) { return null; },\n\
        nextSearchTerm: function(selectedObject, currentSearchTerm) { return undefined; },\n\
        searchInputPlaceholder: '',\n\
        createSearchChoicePosition: 'top',\n\
        shouldFocusInput: function (instance) {\n\
            // Attempt to detect touch devices\n\
            var supportsTouchEvents = (('ontouchstart' in window) ||\n\
                                       (navigator.msMaxTouchPoints > 0));\n\
\n\
            // Only devices which support touch events should be special cased\n\
            if (!supportsTouchEvents) {\n\
                return true;\n\
            }\n\
\n\
            // Never focus the input if search is disabled\n\
            if (instance.opts.minimumResultsForSearch < 0) {\n\
                return false;\n\
            }\n\
\n\
            return true;\n\
        }\n\
    };\n\
\n\
    $.fn.select2.ajaxDefaults = {\n\
        transport: $.ajax,\n\
        params: {\n\
            type: \"GET\",\n\
            cache: false,\n\
            dataType: \"json\"\n\
        }\n\
    };\n\
\n\
    // exports\n\
    window.Select2 = {\n\
        query: {\n\
            ajax: ajax,\n\
            local: local,\n\
            tags: tags\n\
        }, util: {\n\
            debounce: debounce,\n\
            markMatch: markMatch,\n\
            escapeMarkup: defaultEscapeMarkup,\n\
            stripDiacritics: stripDiacritics\n\
        }, \"class\": {\n\
            \"abstract\": AbstractSelect2,\n\
            \"single\": SingleSelect2,\n\
            \"multi\": MultiSelect2\n\
        }\n\
    };\n\
\n\
}(jQuery));\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_ar.js", Function("exports, module",
"﻿/**\n\
 * Select2 Arabic translation.\n\
 *\n\
 * Author: Adel KEDJOUR <adel@kedjour.com>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"لم يتم العثور على مطابقات\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; if (n == 1){ return \"الرجاء إدخال حرف واحد على الأكثر\"; } return n == 2 ? \"الرجاء إدخال حرفين على الأكثر\" : \"الرجاء إدخال \" + n + \" على الأكثر\"; },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; if (n == 1){ return \"الرجاء إدخال حرف واحد على الأقل\"; } return n == 2 ? \"الرجاء إدخال حرفين على الأقل\" : \"الرجاء إدخال \" + n + \" على الأقل \"; },\n\
        formatSelectionTooBig: function (limit) { if (n == 1){ return \"يمكنك أن تختار إختيار واحد فقط\"; } return n == 2 ? \"يمكنك أن تختار إختيارين فقط\" : \"يمكنك أن تختار \" + n + \" إختيارات فقط\"; },\n\
        formatLoadMore: function (pageNumber) { return \"تحميل المزيد من النتائج…\"; },\n\
        formatSearching: function () { return \"البحث…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_ar.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_bg.js", Function("exports, module",
"/**\n\
 * Select2 Bulgarian translation.\n\
 * \n\
 * @author  Lubomir Vikev <lubomirvikev@gmail.com>\n\
 * @author  Uriy Efremochkin <efremochkin@uriy.me>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Няма намерени съвпадения\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Моля въведете още \" + n + \" символ\" + (n > 1 ? \"а\" : \"\"); },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Моля въведете с \" + n + \" по-малко символ\" + (n > 1 ? \"а\" : \"\"); },\n\
        formatSelectionTooBig: function (limit) { return \"Можете да направите до \" + limit + (limit > 1 ? \" избора\" : \" избор\"); },\n\
        formatLoadMore: function (pageNumber) { return \"Зареждат се още…\"; },\n\
        formatSearching: function () { return \"Търсене…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_bg.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_ca.js", Function("exports, module",
"/**\n\
 * Select2 Catalan translation.\n\
 * \n\
 * Author: David Planella <david.planella@gmail.com>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"No s'ha trobat cap coincidència\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Introduïu \" + n + \" caràcter\" + (n == 1 ? \"\" : \"s\") + \" més\"; },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Introduïu \" + n + \" caràcter\" + (n == 1? \"\" : \"s\") + \"menys\"; },\n\
        formatSelectionTooBig: function (limit) { return \"Només podeu seleccionar \" + limit + \" element\" + (limit == 1 ? \"\" : \"s\"); },\n\
        formatLoadMore: function (pageNumber) { return \"S'estan carregant més resultats…\"; },\n\
        formatSearching: function () { return \"S'està cercant…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_ca.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_cs.js", Function("exports, module",
"/**\n\
 * Select2 Czech translation.\n\
 * \n\
 * Author: Michal Marek <ahoj@michal-marek.cz>\n\
 * Author - sklonovani: David Vallner <david@vallner.net>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
    // use text for the numbers 2 through 4\n\
    var smallNumbers = {\n\
        2: function(masc) { return (masc ? \"dva\" : \"dvě\"); },\n\
        3: function() { return \"tři\"; },\n\
        4: function() { return \"čtyři\"; }\n\
    }\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Nenalezeny žádné položky\"; },\n\
        formatInputTooShort: function (input, min) {\n\
            var n = min - input.length;\n\
            if (n == 1) {\n\
                return \"Prosím zadejte ještě jeden znak\";\n\
            } else if (n <= 4) {\n\
                return \"Prosím zadejte ještě další \"+smallNumbers[n](true)+\" znaky\";\n\
            } else {\n\
                return \"Prosím zadejte ještě dalších \"+n+\" znaků\";\n\
            }\n\
        },\n\
        formatInputTooLong: function (input, max) {\n\
            var n = input.length - max;\n\
            if (n == 1) {\n\
                return \"Prosím zadejte o jeden znak méně\";\n\
            } else if (n <= 4) {\n\
                return \"Prosím zadejte o \"+smallNumbers[n](true)+\" znaky méně\";\n\
            } else {\n\
                return \"Prosím zadejte o \"+n+\" znaků méně\";\n\
            }\n\
        },\n\
        formatSelectionTooBig: function (limit) {\n\
            if (limit == 1) {\n\
                return \"Můžete zvolit jen jednu položku\";\n\
            } else if (limit <= 4) {\n\
                return \"Můžete zvolit maximálně \"+smallNumbers[limit](false)+\" položky\";\n\
            } else {\n\
                return \"Můžete zvolit maximálně \"+limit+\" položek\";\n\
            }\n\
        },\n\
        formatLoadMore: function (pageNumber) { return \"Načítají se další výsledky…\"; },\n\
        formatSearching: function () { return \"Vyhledávání…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_cs.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_da.js", Function("exports, module",
"/**\n\
 * Select2 Danish translation.\n\
 *\n\
 * Author: Anders Jenbo <anders@jenbo.dk>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Ingen resultater fundet\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Angiv venligst \" + n + \" tegn mere\"; },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Angiv venligst \" + n + \" tegn mindre\"; },\n\
        formatSelectionTooBig: function (limit) { return \"Du kan kun vælge \" + limit + \" emne\" + (limit === 1 ? \"\" : \"r\"); },\n\
        formatLoadMore: function (pageNumber) { return \"Indlæser flere resultater…\"; },\n\
        formatSearching: function () { return \"Søger…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_da.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_de.js", Function("exports, module",
"/**\n\
 * Select2 German translation\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Keine Übereinstimmungen gefunden\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Bitte \" + n + \" Zeichen mehr eingeben\"; },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Bitte \" + n + \" Zeichen weniger eingeben\"; },\n\
        formatSelectionTooBig: function (limit) { return \"Sie können nur \" + limit + \" Eintr\" + (limit === 1 ? \"ag\" : \"äge\") + \" auswählen\"; },\n\
        formatLoadMore: function (pageNumber) { return \"Lade mehr Ergebnisse…\"; },\n\
        formatSearching: function () { return \"Suche…\"; }\n\
    });\n\
})(jQuery);\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_de.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_el.js", Function("exports, module",
"/**\n\
 * Select2 Greek translation.\n\
 * \n\
 * @author  Uriy Efremochkin <efremochkin@uriy.me>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Δεν βρέθηκαν αποτελέσματα\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Παρακαλούμε εισάγετε \" + n + \" περισσότερο\" + (n > 1 ? \"υς\" : \"\") + \" χαρακτήρ\" + (n > 1 ? \"ες\" : \"α\"); },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Παρακαλούμε διαγράψτε \" + n + \" χαρακτήρ\" + (n > 1 ? \"ες\" : \"α\"); },\n\
        formatSelectionTooBig: function (limit) { return \"Μπορείτε να επιλέξετε μόνο \" + limit + \" αντικείμεν\" + (limit > 1 ? \"α\" : \"ο\"); },\n\
        formatLoadMore: function (pageNumber) { return \"Φόρτωση περισσότερων…\"; },\n\
        formatSearching: function () { return \"Αναζήτηση…\"; }\n\
    });\n\
})(jQuery);\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_el.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_es.js", Function("exports, module",
"/**\n\
 * Select2 Spanish translation\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"No se encontraron resultados\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Por favor, introduzca \" + n + \" car\" + (n == 1? \"ácter\" : \"acteres\"); },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Por favor, elimine \" + n + \" car\" + (n == 1? \"ácter\" : \"acteres\"); },\n\
        formatSelectionTooBig: function (limit) { return \"Sólo puede seleccionar \" + limit + \" elemento\" + (limit == 1 ? \"\" : \"s\"); },\n\
        formatLoadMore: function (pageNumber) { return \"Cargando más resultados…\"; },\n\
        formatSearching: function () { return \"Buscando…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_es.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_et.js", Function("exports, module",
"/**\n\
 * Select2 Estonian translation.\n\
 *\n\
 * Author: Kuldar Kalvik <kuldar@kalvik.ee>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Tulemused puuduvad\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Sisesta \" + n + \" täht\" + (n == 1 ? \"\" : \"e\") + \" rohkem\"; },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Sisesta \" + n + \" täht\" + (n == 1? \"\" : \"e\") + \" vähem\"; },\n\
        formatSelectionTooBig: function (limit) { return \"Saad vaid \" + limit + \" tulemus\" + (limit == 1 ? \"e\" : \"t\") + \" valida\"; },\n\
        formatLoadMore: function (pageNumber) { return \"Laen tulemusi..\"; },\n\
        formatSearching: function () { return \"Otsin..\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_et.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_eu.js", Function("exports, module",
"/**\n\
 * Select2 Basque translation.\n\
 *\n\
 * Author: Julen Ruiz Aizpuru <julenx at gmail dot com>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () {\n\
          return \"Ez da bat datorrenik aurkitu\";\n\
        },\n\
        formatInputTooShort: function (input, min) {\n\
          var n = min - input.length;\n\
          if (n === 1) {\n\
            return \"Idatzi karaktere bat gehiago\";\n\
          } else {\n\
            return \"Idatzi \" + n + \" karaktere gehiago\";\n\
          }\n\
        },\n\
        formatInputTooLong: function (input, max) {\n\
          var n = input.length - max;\n\
          if (n === 1) {\n\
            return \"Idatzi karaktere bat gutxiago\";\n\
          } else {\n\
            return \"Idatzi \" + n + \" karaktere gutxiago\";\n\
          }\n\
        },\n\
        formatSelectionTooBig: function (limit) {\n\
          if (limit === 1 ) {\n\
            return \"Elementu bakarra hauta dezakezu\";\n\
          } else {\n\
            return limit + \" elementu hauta ditzakezu soilik\";\n\
          }\n\
        },\n\
        formatLoadMore: function (pageNumber) {\n\
          return \"Emaitza gehiago kargatzen…\";\n\
        },\n\
        formatSearching: function () {\n\
          return \"Bilatzen…\";\n\
        }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_eu.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_fa.js", Function("exports, module",
"/**\n\
 * Select2 Persian translation.\n\
 * \n\
 * Author: Ali Choopan <choopan@arsh.co>\n\
 * Author: Ebrahim Byagowi <ebrahim@gnu.org>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatMatches: function (matches) { return matches + \" نتیجه موجود است، کلیدهای جهت بالا و پایین را برای گشتن استفاده کنید.\"; },\n\
        formatNoMatches: function () { return \"نتیجه‌ای یافت نشد.\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"لطفاً \" + n + \" نویسه بیشتر وارد نمایید\"; },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"لطفاً \" + n + \" نویسه را حذف کنید.\"; },\n\
        formatSelectionTooBig: function (limit) { return \"شما فقط می‌توانید \" + limit + \" مورد را انتخاب کنید\"; },\n\
        formatLoadMore: function (pageNumber) { return \"در حال بارگیری موارد بیشتر…\"; },\n\
        formatSearching: function () { return \"در حال جستجو…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_fa.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_fi.js", Function("exports, module",
"/**\n\
 * Select2 Finnish translation\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () {\n\
            return \"Ei tuloksia\";\n\
        },\n\
        formatInputTooShort: function (input, min) {\n\
            var n = min - input.length;\n\
            return \"Ole hyvä ja anna \" + n + \" merkkiä lisää\";\n\
        },\n\
        formatInputTooLong: function (input, max) {\n\
            var n = input.length - max;\n\
            return \"Ole hyvä ja anna \" + n + \" merkkiä vähemmän\";\n\
        },\n\
        formatSelectionTooBig: function (limit) {\n\
            return \"Voit valita ainoastaan \" + limit + \" kpl\";\n\
        },\n\
        formatLoadMore: function (pageNumber) {\n\
            return \"Ladataan lisää tuloksia…\";\n\
        },\n\
        formatSearching: function () {\n\
            return \"Etsitään…\";\n\
        }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_fi.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_fr.js", Function("exports, module",
"/**\n\
 * Select2 French translation\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatMatches: function (matches) { return matches + \" résultats sont disponibles, utilisez les flèches haut et bas pour naviguer.\"; },\n\
        formatNoMatches: function () { return \"Aucun résultat trouvé\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Merci de saisir \" + n + \" caractère\" + (n == 1 ? \"\" : \"s\") + \" de plus\"; },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Merci de supprimer \" + n + \" caractère\" + (n == 1 ? \"\" : \"s\"); },\n\
        formatSelectionTooBig: function (limit) { return \"Vous pouvez seulement sélectionner \" + limit + \" élément\" + (limit == 1 ? \"\" : \"s\"); },\n\
        formatLoadMore: function (pageNumber) { return \"Chargement de résultats supplémentaires…\"; },\n\
        formatSearching: function () { return \"Recherche en cours…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_fr.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_gl.js", Function("exports, module",
"/**\n\
 * Select2 Galician translation\n\
 * \n\
 * Author: Leandro Regueiro <leandro.regueiro@gmail.com>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () {\n\
            return \"Non se atoparon resultados\";\n\
        },\n\
        formatInputTooShort: function (input, min) {\n\
            var n = min - input.length;\n\
            if (n === 1) {\n\
                return \"Engada un carácter\";\n\
            } else {\n\
                return \"Engada \" + n + \" caracteres\";\n\
            }\n\
        },\n\
        formatInputTooLong: function (input, max) {\n\
            var n = input.length - max;\n\
            if (n === 1) {\n\
                return \"Elimine un carácter\";\n\
            } else {\n\
                return \"Elimine \" + n + \" caracteres\";\n\
            }\n\
        },\n\
        formatSelectionTooBig: function (limit) {\n\
            if (limit === 1 ) {\n\
                return \"Só pode seleccionar un elemento\";\n\
            } else {\n\
                return \"Só pode seleccionar \" + limit + \" elementos\";\n\
            }\n\
        },\n\
        formatLoadMore: function (pageNumber) {\n\
            return \"Cargando máis resultados…\";\n\
        },\n\
        formatSearching: function () {\n\
            return \"Buscando…\";\n\
        }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_gl.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_he.js", Function("exports, module",
"/**\n\
* Select2 Hebrew translation.\n\
*\n\
* Author: Yakir Sitbon <http://www.yakirs.net/>\n\
*/\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"לא נמצאו התאמות\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"נא להזין עוד \" + n + \" תווים נוספים\"; },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"נא להזין פחות \" + n + \" תווים\"; },\n\
        formatSelectionTooBig: function (limit) { return \"ניתן לבחור \" + limit + \" פריטים\"; },\n\
        formatLoadMore: function (pageNumber) { return \"טוען תוצאות נוספות…\"; },\n\
        formatSearching: function () { return \"מחפש…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_he.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_hr.js", Function("exports, module",
"/**\n\
 * Select2 Croatian translation.\n\
 *\n\
 * @author  Edi Modrić <edi.modric@gmail.com>\n\
 * @author  Uriy Efremochkin <efremochkin@uriy.me>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Nema rezultata\"; },\n\
        formatInputTooShort: function (input, min) { return \"Unesite još\" + character(min - input.length); },\n\
        formatInputTooLong: function (input, max) { return \"Unesite\" + character(input.length - max) + \" manje\"; },\n\
        formatSelectionTooBig: function (limit) { return \"Maksimalan broj odabranih stavki je \" + limit; },\n\
        formatLoadMore: function (pageNumber) { return \"Učitavanje rezultata…\"; },\n\
        formatSearching: function () { return \"Pretraga…\"; }\n\
    });\n\
\n\
    function character (n) {\n\
        return \" \" + n + \" znak\" + (n%10 < 5 && n%10 > 0 && (n%100 < 5 || n%100 > 19) ? n%10 > 1 ? \"a\" : \"\" : \"ova\");\n\
    }\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_hr.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_hu.js", Function("exports, module",
"/**\n\
 * Select2 Hungarian translation\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Nincs találat.\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Túl rövid. Még \" + n + \" karakter hiányzik.\"; },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Túl hosszú. \" + n + \" karakterrel több, mint kellene.\"; },\n\
        formatSelectionTooBig: function (limit) { return \"Csak \" + limit + \" elemet lehet kiválasztani.\"; },\n\
        formatLoadMore: function (pageNumber) { return \"Töltés…\"; },\n\
        formatSearching: function () { return \"Keresés…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_hu.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_id.js", Function("exports, module",
"/**\n\
 * Select2 Indonesian translation.\n\
 * \n\
 * Author: Ibrahim Yusuf <ibrahim7usuf@gmail.com>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Tidak ada data yang sesuai\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Masukkan \" + n + \" huruf lagi\" + (n == 1 ? \"\" : \"s\"); },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Hapus \" + n + \" huruf\" + (n == 1 ? \"\" : \"s\"); },\n\
        formatSelectionTooBig: function (limit) { return \"Anda hanya dapat memilih \" + limit + \" pilihan\" + (limit == 1 ? \"\" : \"s\"); },\n\
        formatLoadMore: function (pageNumber) { return \"Mengambil data…\"; },\n\
        formatSearching: function () { return \"Mencari…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_id.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_is.js", Function("exports, module",
"/**\n\
 * Select2 Icelandic translation.\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Ekkert fannst\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Vinsamlegast skrifið \" + n + \" staf\" + (n > 1 ? \"i\" : \"\") + \" í viðbót\"; },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Vinsamlegast styttið texta um \" + n + \" staf\" + (n > 1 ? \"i\" : \"\"); },\n\
        formatSelectionTooBig: function (limit) { return \"Þú getur aðeins valið \" + limit + \" atriði\"; },\n\
        formatLoadMore: function (pageNumber) { return \"Sæki fleiri niðurstöður…\"; },\n\
        formatSearching: function () { return \"Leita…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_is.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_it.js", Function("exports, module",
"/**\n\
 * Select2 Italian translation\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Nessuna corrispondenza trovata\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Inserisci ancora \" + n + \" caratter\" + (n == 1? \"e\" : \"i\"); },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Inserisci \" + n + \" caratter\" + (n == 1? \"e\" : \"i\") + \" in meno\"; },\n\
        formatSelectionTooBig: function (limit) { return \"Puoi selezionare solo \" + limit + \" element\" + (limit == 1 ? \"o\" : \"i\"); },\n\
        formatLoadMore: function (pageNumber) { return \"Caricamento in corso…\"; },\n\
        formatSearching: function () { return \"Ricerca…\"; }\n\
    });\n\
})(jQuery);\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_it.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_ja.js", Function("exports, module",
"/**\n\
 * Select2 Japanese translation.\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"該当なし\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"後\" + n + \"文字入れてください\"; },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"検索文字列が\" + n + \"文字長すぎます\"; },\n\
        formatSelectionTooBig: function (limit) { return \"最多で\" + limit + \"項目までしか選択できません\"; },\n\
        formatLoadMore: function (pageNumber) { return \"読込中･･･\"; },\n\
        formatSearching: function () { return \"検索中･･･\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_ja.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_ka.js", Function("exports, module",
"/**\n\
 * Select2 Georgian (Kartuli) translation.\n\
 * \n\
 * Author: Dimitri Kurashvili dimakura@gmail.com\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"ვერ მოიძებნა\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"გთხოვთ შეიყვანოთ კიდევ \" + n + \" სიმბოლო\"; },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"გთხოვთ წაშალოთ \" + n + \" სიმბოლო\"; },\n\
        formatSelectionTooBig: function (limit) { return \"თქვენ შეგიძლიათ მხოლოდ \" + limit + \" ჩანაწერის მონიშვნა\"; },\n\
        formatLoadMore: function (pageNumber) { return \"შედეგის ჩატვირთვა…\"; },\n\
        formatSearching: function () { return \"ძებნა…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_ka.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_ko.js", Function("exports, module",
"/**\n\
 * Select2 Korean translation.\n\
 * \n\
 * @author  Swen Mun <longfinfunnel@gmail.com>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"결과 없음\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"너무 짧습니다. \"+n+\"글자 더 입력해주세요.\"; },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"너무 깁니다. \"+n+\"글자 지워주세요.\"; },\n\
        formatSelectionTooBig: function (limit) { return \"최대 \"+limit+\"개까지만 선택하실 수 있습니다.\"; },\n\
        formatLoadMore: function (pageNumber) { return \"불러오는 중…\"; },\n\
        formatSearching: function () { return \"검색 중…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_ko.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_lt.js", Function("exports, module",
"/**\n\
 * Select2 Lithuanian translation.\n\
 * \n\
 * @author  CRONUS Karmalakas <cronus dot karmalakas at gmail dot com>\n\
 * @author  Uriy Efremochkin <efremochkin@uriy.me>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Atitikmenų nerasta\"; },\n\
        formatInputTooShort: function (input, min) { return \"Įrašykite dar\" + character(min - input.length); },\n\
        formatInputTooLong: function (input, max) { return \"Pašalinkite\" + character(input.length - max); },\n\
        formatSelectionTooBig: function (limit) {\n\
        \treturn \"Jūs galite pasirinkti tik \" + limit + \" element\" + ((limit%100 > 9 && limit%100 < 21) || limit%10 == 0 ? \"ų\" : limit%10 > 1 ? \"us\" : \"ą\");\n\
        },\n\
        formatLoadMore: function (pageNumber) { return \"Kraunama daugiau rezultatų…\"; },\n\
        formatSearching: function () { return \"Ieškoma…\"; }\n\
    });\n\
\n\
    function character (n) {\n\
        return \" \" + n + \" simbol\" + ((n%100 > 9 && n%100 < 21) || n%10 == 0 ? \"ių\" : n%10 > 1 ? \"ius\" : \"į\");\n\
    }\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_lt.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_lv.js", Function("exports, module",
"/**\n\
 * Select2 Latvian translation.\n\
 *\n\
 * @author  Uriy Efremochkin <efremochkin@uriy.me>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Sakritību nav\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Lūdzu ievadiet vēl \" + n + \" simbol\" + (n == 11 ? \"us\" : n%10 == 1 ? \"u\" : \"us\"); },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Lūdzu ievadiet par \" + n + \" simbol\" + (n == 11 ? \"iem\" : n%10 == 1 ? \"u\" : \"iem\") + \" mazāk\"; },\n\
        formatSelectionTooBig: function (limit) { return \"Jūs varat izvēlēties ne vairāk kā \" + limit + \" element\" + (limit == 11 ? \"us\" : limit%10 == 1 ? \"u\" : \"us\"); },\n\
        formatLoadMore: function (pageNumber) { return \"Datu ielāde…\"; },\n\
        formatSearching: function () { return \"Meklēšana…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_lv.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_mk.js", Function("exports, module",
"/**\n\
 * Select2 Macedonian translation.\n\
 * \n\
 * Author: Marko Aleksic <psybaron@gmail.com>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Нема пронајдено совпаѓања\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Ве молиме внесете уште \" + n + \" карактер\" + (n == 1 ? \"\" : \"и\"); },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Ве молиме внесете \" + n + \" помалку карактер\" + (n == 1? \"\" : \"и\"); },\n\
        formatSelectionTooBig: function (limit) { return \"Можете да изберете само \" + limit + \" ставк\" + (limit == 1 ? \"а\" : \"и\"); },\n\
        formatLoadMore: function (pageNumber) { return \"Вчитување резултати…\"; },\n\
        formatSearching: function () { return \"Пребарување…\"; }\n\
    });\n\
})(jQuery);\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_mk.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_ms.js", Function("exports, module",
"/**\n\
 * Select2 Malay translation.\n\
 * \n\
 * Author: Kepoweran <kepoweran@gmail.com>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Tiada padanan yang ditemui\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Sila masukkan \" + n + \" aksara lagi\"; },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Sila hapuskan \" + n + \" aksara\"; },\n\
        formatSelectionTooBig: function (limit) { return \"Anda hanya boleh memilih \" + limit + \" pilihan\"; },\n\
        formatLoadMore: function (pageNumber) { return \"Sedang memuatkan keputusan…\"; },\n\
        formatSearching: function () { return \"Mencari…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_ms.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_nl.js", Function("exports, module",
"/**\n\
 * Select2 Dutch translation\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Geen resultaten gevonden\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Vul \" + n + \" karakter\" + (n == 1? \"\" : \"s\") + \" meer in\"; },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Vul \" + n + \" karakter\" + (n == 1? \"\" : \"s\") + \" minder in\"; },\n\
        formatSelectionTooBig: function (limit) { return \"Maximaal \" + limit + \" item\" + (limit == 1 ? \"\" : \"s\") + \" toegestaan\"; },\n\
        formatLoadMore: function (pageNumber) { return \"Meer resultaten laden…\"; },\n\
        formatSearching: function () { return \"Zoeken…\"; }\n\
    });\n\
})(jQuery);\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_nl.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_no.js", Function("exports, module",
"/**\n\
 * Select2 Norwegian translation.\n\
 *\n\
 * Author: Torgeir Veimo <torgeir.veimo@gmail.com>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Ingen treff\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Vennligst skriv inn \" + n + (n>1 ? \" flere tegn\" : \" tegn til\"); },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Vennligst fjern \" + n + \" tegn\"; },\n\
        formatSelectionTooBig: function (limit) { return \"Du kan velge maks \" + limit + \" elementer\"; },\n\
        formatLoadMore: function (pageNumber) { return \"Laster flere resultater…\"; },\n\
        formatSearching: function () { return \"Søker…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_no.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_pl.js", Function("exports, module",
"/**\n\
 * Select2 Polish translation.\n\
 * \n\
 * @author  Jan Kondratowicz <jan@kondratowicz.pl>\n\
 * @author  Uriy Efremochkin <efremochkin@uriy.me>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Brak wyników\"; },\n\
        formatInputTooShort: function (input, min) { return \"Wpisz jeszcze\" + character(min - input.length, \"znak\", \"i\"); },\n\
        formatInputTooLong: function (input, max) { return \"Wpisana fraza jest za długa o\" + character(input.length - max, \"znak\", \"i\"); },\n\
        formatSelectionTooBig: function (limit) { return \"Możesz zaznaczyć najwyżej\" + character(limit, \"element\", \"y\"); },\n\
        formatLoadMore: function (pageNumber) { return \"Ładowanie wyników…\"; },\n\
        formatSearching: function () { return \"Szukanie…\"; }\n\
    });\n\
\n\
    function character (n, word, pluralSuffix) {\n\
        return \" \" + n + \" \" + word + (n == 1 ? \"\" : n%10 < 5 && n%10 > 1 && (n%100 < 5 || n%100 > 20) ? pluralSuffix : \"ów\");\n\
    }\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_pl.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_pt-BR.js", Function("exports, module",
"/**\n\
 * Select2 Brazilian Portuguese translation\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Nenhum resultado encontrado\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Digite mais \" + n + \" caracter\" + (n == 1? \"\" : \"es\"); },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Apague \" + n + \" caracter\" + (n == 1? \"\" : \"es\"); },\n\
        formatSelectionTooBig: function (limit) { return \"Só é possível selecionar \" + limit + \" elemento\" + (limit == 1 ? \"\" : \"s\"); },\n\
        formatLoadMore: function (pageNumber) { return \"Carregando mais resultados…\"; },\n\
        formatSearching: function () { return \"Buscando…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_pt-BR.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_pt-PT.js", Function("exports, module",
"/**\n\
 * Select2 Portuguese (Portugal) translation\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Nenhum resultado encontrado\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Introduza \" + n + \" car\" + (n == 1 ? \"ácter\" : \"acteres\"); },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Apague \" + n + \" car\" + (n == 1 ? \"ácter\" : \"acteres\"); },\n\
        formatSelectionTooBig: function (limit) { return \"Só é possível selecionar \" + limit + \" elemento\" + (limit == 1 ? \"\" : \"s\"); },\n\
        formatLoadMore: function (pageNumber) { return \"A carregar mais resultados…\"; },\n\
        formatSearching: function () { return \"A pesquisar…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_pt-PT.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_ro.js", Function("exports, module",
"/**\n\
 * Select2 Romanian translation.\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Nu a fost găsit nimic\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Vă rugăm să introduceți incă \" + n + \" caracter\" + (n == 1 ? \"\" : \"e\"); },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Vă rugăm să introduceți mai puțin de \" + n + \" caracter\" + (n == 1? \"\" : \"e\"); },\n\
        formatSelectionTooBig: function (limit) { return \"Aveți voie să selectați cel mult \" + limit + \" element\" + (limit == 1 ? \"\" : \"e\"); },\n\
        formatLoadMore: function (pageNumber) { return \"Se încarcă…\"; },\n\
        formatSearching: function () { return \"Căutare…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_ro.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_ru.js", Function("exports, module",
"/**\n\
 * Select2 Russian translation.\n\
 *\n\
 * @author  Uriy Efremochkin <efremochkin@uriy.me>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Совпадений не найдено\"; },\n\
        formatInputTooShort: function (input, min) { return \"Пожалуйста, введите еще\" + character(min - input.length); },\n\
        formatInputTooLong: function (input, max) { return \"Пожалуйста, введите на\" + character(input.length - max) + \" меньше\"; },\n\
        formatSelectionTooBig: function (limit) { return \"Вы можете выбрать не более \" + limit + \" элемент\" + (limit%10 == 1 && limit%100 != 11 ? \"а\" : \"ов\"); },\n\
        formatLoadMore: function (pageNumber) { return \"Загрузка данных…\"; },\n\
        formatSearching: function () { return \"Поиск…\"; }\n\
    });\n\
\n\
    function character (n) {\n\
        return \" \" + n + \" символ\" + (n%10 < 5 && n%10 > 0 && (n%100 < 5 || n%100 > 20) ? n%10 > 1 ? \"a\" : \"\" : \"ов\");\n\
    }\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_ru.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_sk.js", Function("exports, module",
"/**\n\
 * Select2 Slovak translation.\n\
 *\n\
 * Author: David Vallner <david@vallner.net>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
    // use text for the numbers 2 through 4\n\
    var smallNumbers = {\n\
        2: function(masc) { return (masc ? \"dva\" : \"dve\"); },\n\
        3: function() { return \"tri\"; },\n\
        4: function() { return \"štyri\"; }\n\
    }\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Nenašli sa žiadne položky\"; },\n\
        formatInputTooShort: function (input, min) {\n\
            var n = min - input.length;\n\
            if (n == 1) {\n\
                return \"Prosím zadajte ešte jeden znak\";\n\
            } else if (n <= 4) {\n\
                return \"Prosím zadajte ešte ďalšie \"+smallNumbers[n](true)+\" znaky\";\n\
            } else {\n\
                return \"Prosím zadajte ešte ďalších \"+n+\" znakov\";\n\
            }\n\
        },\n\
        formatInputTooLong: function (input, max) {\n\
            var n = input.length - max;\n\
            if (n == 1) {\n\
                return \"Prosím zadajte o jeden znak menej\";\n\
            } else if (n <= 4) {\n\
                return \"Prosím zadajte o \"+smallNumbers[n](true)+\" znaky menej\";\n\
            } else {\n\
                return \"Prosím zadajte o \"+n+\" znakov menej\";\n\
            }\n\
        },\n\
        formatSelectionTooBig: function (limit) {\n\
            if (limit == 1) {\n\
                return \"Môžete zvoliť len jednu položku\";\n\
            } else if (limit <= 4) {\n\
                return \"Môžete zvoliť najviac \"+smallNumbers[limit](false)+\" položky\";\n\
            } else {\n\
                return \"Môžete zvoliť najviac \"+limit+\" položiek\";\n\
            }\n\
        },\n\
        formatLoadMore: function (pageNumber) { return \"Načítavajú sa ďalšie výsledky…\"; },\n\
        formatSearching: function () { return \"Vyhľadávanie…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_sk.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_sv.js", Function("exports, module",
"/**\n\
 * Select2 Swedish translation.\n\
 *\n\
 * Author: Jens Rantil <jens.rantil@telavox.com>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Inga träffar\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Var god skriv in \" + n + (n>1 ? \" till tecken\" : \" tecken till\"); },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Var god sudda ut \" + n + \" tecken\"; },\n\
        formatSelectionTooBig: function (limit) { return \"Du kan max välja \" + limit + \" element\"; },\n\
        formatLoadMore: function (pageNumber) { return \"Laddar fler resultat…\"; },\n\
        formatSearching: function () { return \"Söker…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_sv.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_th.js", Function("exports, module",
"/**\n\
 * Select2 Thai translation.\n\
 *\n\
 * Author: Atsawin Chaowanakritsanakul <joke@nakhon.net>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"ไม่พบข้อมูล\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"โปรดพิมพ์เพิ่มอีก \" + n + \" ตัวอักษร\"; },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"โปรดลบออก \" + n + \" ตัวอักษร\"; },\n\
        formatSelectionTooBig: function (limit) { return \"คุณสามารถเลือกได้ไม่เกิน \" + limit + \" รายการ\"; },\n\
        formatLoadMore: function (pageNumber) { return \"กำลังค้นข้อมูลเพิ่ม…\"; },\n\
        formatSearching: function () { return \"กำลังค้นข้อมูล…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_th.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_tr.js", Function("exports, module",
"/**\n\
 * Select2 Turkish translation.\n\
 * \n\
 * Author: Salim KAYABAŞI <salim.kayabasi@gmail.com>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Sonuç bulunamadı\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"En az \" + n + \" karakter daha girmelisiniz\"; },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return n + \" karakter azaltmalısınız\"; },\n\
        formatSelectionTooBig: function (limit) { return \"Sadece \" + limit + \" seçim yapabilirsiniz\"; },\n\
        formatLoadMore: function (pageNumber) { return \"Daha fazla…\"; },\n\
        formatSearching: function () { return \"Aranıyor…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_tr.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_uk.js", Function("exports, module",
"/**\n\
 * Select2 Ukrainian translation.\n\
 * \n\
 * @author  bigmihail <bigmihail@bigmir.net>\n\
 * @author  Uriy Efremochkin <efremochkin@uriy.me>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatMatches: function (matches) { return character(matches, \"результат\") + \" знайдено, використовуйте клавіші зі стрілками вверх та вниз для навігації.\"; },\n\
        formatNoMatches: function () { return \"Нічого не знайдено\"; },\n\
        formatInputTooShort: function (input, min) { return \"Введіть буль ласка ще \" + character(min - input.length, \"символ\"); },\n\
        formatInputTooLong: function (input, max) { return \"Введіть буль ласка на \" + character(input.length - max, \"символ\") + \" менше\"; },\n\
        formatSelectionTooBig: function (limit) { return \"Ви можете вибрати лише \" + character(limit, \"елемент\"); },\n\
        formatLoadMore: function (pageNumber) { return \"Завантаження даних…\"; },\n\
        formatSearching: function () { return \"Пошук…\"; }\n\
    });\n\
\n\
    function character (n, word) {\n\
        return n + \" \" + word + (n%10 < 5 && n%10 > 0 && (n%100 < 5 || n%100 > 19) ? n%10 > 1 ? \"и\" : \"\" : \"ів\");\n\
    }\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_uk.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_vi.js", Function("exports, module",
"/**\n\
 * Select2 Vietnamese translation.\n\
 * \n\
 * Author: Long Nguyen <olragon@gmail.com>\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"Không tìm thấy kết quả\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"Vui lòng nhập nhiều hơn \" + n + \" ký tự\" + (n == 1 ? \"\" : \"s\"); },\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"Vui lòng nhập ít hơn \" + n + \" ký tự\" + (n == 1? \"\" : \"s\"); },\n\
        formatSelectionTooBig: function (limit) { return \"Chỉ có thể chọn được \" + limit + \" tùy chọn\" + (limit == 1 ? \"\" : \"s\"); },\n\
        formatLoadMore: function (pageNumber) { return \"Đang lấy thêm kết quả…\"; },\n\
        formatSearching: function () { return \"Đang tìm…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_vi.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_zh-CN.js", Function("exports, module",
"/**\n\
 * Select2 Chinese translation\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"没有找到匹配项\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"请再输入\" + n + \"个字符\";},\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"请删掉\" + n + \"个字符\";},\n\
        formatSelectionTooBig: function (limit) { return \"你只能选择最多\" + limit + \"项\"; },\n\
        formatLoadMore: function (pageNumber) { return \"加载结果中…\"; },\n\
        formatSearching: function () { return \"搜索中…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_zh-CN.js"
));

require.register("kpwebb~select2@3.4.8/select2_locale_zh-TW.js", Function("exports, module",
"/**\n\
 * Select2 Traditional Chinese translation\n\
 */\n\
(function ($) {\n\
    \"use strict\";\n\
    $.extend($.fn.select2.defaults, {\n\
        formatNoMatches: function () { return \"沒有找到相符的項目\"; },\n\
        formatInputTooShort: function (input, min) { var n = min - input.length; return \"請再輸入\" + n + \"個字元\";},\n\
        formatInputTooLong: function (input, max) { var n = input.length - max; return \"請刪掉\" + n + \"個字元\";},\n\
        formatSelectionTooBig: function (limit) { return \"你只能選擇最多\" + limit + \"項\"; },\n\
        formatLoadMore: function (pageNumber) { return \"載入中…\"; },\n\
        formatSearching: function () { return \"搜尋中…\"; }\n\
    });\n\
})(jQuery);\n\
\n\
//# sourceURL=components/kpwebb/select2/3.4.8/select2_locale_zh-TW.js"
));

require.modules["kpwebb-select2"] = require.modules["kpwebb~select2@3.4.8"];
require.modules["kpwebb~select2"] = require.modules["kpwebb~select2@3.4.8"];
require.modules["select2"] = require.modules["kpwebb~select2@3.4.8"];


require.register("trevorgerhardt~haversine@master", Function("exports, module",
"/**\n\
 * Get the haversine distance between two points\n\
 *\n\
 * @param {Number} starting latitude\n\
 * @param {Number} starting longitude\n\
 * @param {Number} ending latitude\n\
 * @param {Number} ending longitude\n\
 * @param {Boolean} return the distance in miles instead of kilometers\n\
 * @returns {Number} distance between the points\n\
 */\n\
\n\
module.exports = function haversine(lat1, lon1, lat2, lon2, miles) {\n\
  var R = miles ? 3960 : 6371;\n\
\n\
  var dLat = rad(lat2 - lat1);\n\
  var dLon = rad(lon2 - lon1);\n\
\n\
  lat1 = rad(lat1);\n\
  lat2 = rad(lat2);\n\
\n\
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +\n\
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);\n\
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));\n\
\n\
  return R * c;\n\
};\n\
\n\
/**\n\
 * Convert a lat/lon point to radians\n\
 *\n\
 * @param {Number} n\n\
 * @returns {Number} r\n\
 */\n\
\n\
function rad(n) {\n\
  return n * Math.PI / 180;\n\
}\n\
\n\
//# sourceURL=components/trevorgerhardt/haversine/master/index.js"
));

require.modules["trevorgerhardt-haversine"] = require.modules["trevorgerhardt~haversine@master"];
require.modules["trevorgerhardt~haversine"] = require.modules["trevorgerhardt~haversine@master"];
require.modules["haversine"] = require.modules["trevorgerhardt~haversine@master"];


require.register("rauchg~ms.js@0.7.1", Function("exports, module",
"/**\n\
 * Helpers.\n\
 */\n\
\n\
var s = 1000;\n\
var m = s * 60;\n\
var h = m * 60;\n\
var d = h * 24;\n\
var y = d * 365.25;\n\
\n\
/**\n\
 * Parse or format the given `val`.\n\
 *\n\
 * Options:\n\
 *\n\
 *  - `long` verbose formatting [false]\n\
 *\n\
 * @param {String|Number} val\n\
 * @param {Object} options\n\
 * @return {String|Number}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(val, options){\n\
  options = options || {};\n\
  if ('string' == typeof val) return parse(val);\n\
  return options.long\n\
    ? long(val)\n\
    : short(val);\n\
};\n\
\n\
/**\n\
 * Parse the given `str` and return milliseconds.\n\
 *\n\
 * @param {String} str\n\
 * @return {Number}\n\
 * @api private\n\
 */\n\
\n\
function parse(str) {\n\
  str = '' + str;\n\
  if (str.length > 10000) return;\n\
  var match = /^((?:\\d+)?\\.?\\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);\n\
  if (!match) return;\n\
  var n = parseFloat(match[1]);\n\
  var type = (match[2] || 'ms').toLowerCase();\n\
  switch (type) {\n\
    case 'years':\n\
    case 'year':\n\
    case 'yrs':\n\
    case 'yr':\n\
    case 'y':\n\
      return n * y;\n\
    case 'days':\n\
    case 'day':\n\
    case 'd':\n\
      return n * d;\n\
    case 'hours':\n\
    case 'hour':\n\
    case 'hrs':\n\
    case 'hr':\n\
    case 'h':\n\
      return n * h;\n\
    case 'minutes':\n\
    case 'minute':\n\
    case 'mins':\n\
    case 'min':\n\
    case 'm':\n\
      return n * m;\n\
    case 'seconds':\n\
    case 'second':\n\
    case 'secs':\n\
    case 'sec':\n\
    case 's':\n\
      return n * s;\n\
    case 'milliseconds':\n\
    case 'millisecond':\n\
    case 'msecs':\n\
    case 'msec':\n\
    case 'ms':\n\
      return n;\n\
  }\n\
}\n\
\n\
/**\n\
 * Short format for `ms`.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function short(ms) {\n\
  if (ms >= d) return Math.round(ms / d) + 'd';\n\
  if (ms >= h) return Math.round(ms / h) + 'h';\n\
  if (ms >= m) return Math.round(ms / m) + 'm';\n\
  if (ms >= s) return Math.round(ms / s) + 's';\n\
  return ms + 'ms';\n\
}\n\
\n\
/**\n\
 * Long format for `ms`.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function long(ms) {\n\
  return plural(ms, d, 'day')\n\
    || plural(ms, h, 'hour')\n\
    || plural(ms, m, 'minute')\n\
    || plural(ms, s, 'second')\n\
    || ms + ' ms';\n\
}\n\
\n\
/**\n\
 * Pluralization helper.\n\
 */\n\
\n\
function plural(ms, n, name) {\n\
  if (ms < n) return;\n\
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;\n\
  return Math.ceil(ms / n) + ' ' + name + 's';\n\
}\n\
\n\
//# sourceURL=components/rauchg/ms.js/0.7.1/index.js"
));

require.modules["rauchg-ms.js"] = require.modules["rauchg~ms.js@0.7.1"];
require.modules["rauchg~ms.js"] = require.modules["rauchg~ms.js@0.7.1"];
require.modules["ms.js"] = require.modules["rauchg~ms.js@0.7.1"];


require.register("visionmedia~debug@2.2.0", Function("exports, module",
"\n\
/**\n\
 * This is the web browser implementation of `debug()`.\n\
 *\n\
 * Expose `debug()` as the module.\n\
 */\n\
\n\
exports = module.exports = require('visionmedia~debug@2.2.0/debug.js');\n\
exports.log = log;\n\
exports.formatArgs = formatArgs;\n\
exports.save = save;\n\
exports.load = load;\n\
exports.useColors = useColors;\n\
exports.storage = 'undefined' != typeof chrome\n\
               && 'undefined' != typeof chrome.storage\n\
                  ? chrome.storage.local\n\
                  : localstorage();\n\
\n\
/**\n\
 * Colors.\n\
 */\n\
\n\
exports.colors = [\n\
  'lightseagreen',\n\
  'forestgreen',\n\
  'goldenrod',\n\
  'dodgerblue',\n\
  'darkorchid',\n\
  'crimson'\n\
];\n\
\n\
/**\n\
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,\n\
 * and the Firebug extension (any Firefox version) are known\n\
 * to support \"%c\" CSS customizations.\n\
 *\n\
 * TODO: add a `localStorage` variable to explicitly enable/disable colors\n\
 */\n\
\n\
function useColors() {\n\
  // is webkit? http://stackoverflow.com/a/16459606/376773\n\
  return ('WebkitAppearance' in document.documentElement.style) ||\n\
    // is firebug? http://stackoverflow.com/a/398120/376773\n\
    (window.console && (console.firebug || (console.exception && console.table))) ||\n\
    // is firefox >= v31?\n\
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages\n\
    (navigator.userAgent.toLowerCase().match(/firefox\\/(\\d+)/) && parseInt(RegExp.$1, 10) >= 31);\n\
}\n\
\n\
/**\n\
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.\n\
 */\n\
\n\
exports.formatters.j = function(v) {\n\
  return JSON.stringify(v);\n\
};\n\
\n\
\n\
/**\n\
 * Colorize log arguments if enabled.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function formatArgs() {\n\
  var args = arguments;\n\
  var useColors = this.useColors;\n\
\n\
  args[0] = (useColors ? '%c' : '')\n\
    + this.namespace\n\
    + (useColors ? ' %c' : ' ')\n\
    + args[0]\n\
    + (useColors ? '%c ' : ' ')\n\
    + '+' + exports.humanize(this.diff);\n\
\n\
  if (!useColors) return args;\n\
\n\
  var c = 'color: ' + this.color;\n\
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));\n\
\n\
  // the final \"%c\" is somewhat tricky, because there could be other\n\
  // arguments passed either before or after the %c, so we need to\n\
  // figure out the correct index to insert the CSS into\n\
  var index = 0;\n\
  var lastC = 0;\n\
  args[0].replace(/%[a-z%]/g, function(match) {\n\
    if ('%%' === match) return;\n\
    index++;\n\
    if ('%c' === match) {\n\
      // we only are interested in the *last* %c\n\
      // (the user may have provided their own)\n\
      lastC = index;\n\
    }\n\
  });\n\
\n\
  args.splice(lastC, 0, c);\n\
  return args;\n\
}\n\
\n\
/**\n\
 * Invokes `console.log()` when available.\n\
 * No-op when `console.log` is not a \"function\".\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function log() {\n\
  // this hackery is required for IE8/9, where\n\
  // the `console.log` function doesn't have 'apply'\n\
  return 'object' === typeof console\n\
    && console.log\n\
    && Function.prototype.apply.call(console.log, console, arguments);\n\
}\n\
\n\
/**\n\
 * Save `namespaces`.\n\
 *\n\
 * @param {String} namespaces\n\
 * @api private\n\
 */\n\
\n\
function save(namespaces) {\n\
  try {\n\
    if (null == namespaces) {\n\
      exports.storage.removeItem('debug');\n\
    } else {\n\
      exports.storage.debug = namespaces;\n\
    }\n\
  } catch(e) {}\n\
}\n\
\n\
/**\n\
 * Load `namespaces`.\n\
 *\n\
 * @return {String} returns the previously persisted debug modes\n\
 * @api private\n\
 */\n\
\n\
function load() {\n\
  var r;\n\
  try {\n\
    r = exports.storage.debug;\n\
  } catch(e) {}\n\
  return r;\n\
}\n\
\n\
/**\n\
 * Enable namespaces listed in `localStorage.debug` initially.\n\
 */\n\
\n\
exports.enable(load());\n\
\n\
/**\n\
 * Localstorage attempts to return the localstorage.\n\
 *\n\
 * This is necessary because safari throws\n\
 * when a user disables cookies/localstorage\n\
 * and you attempt to access it.\n\
 *\n\
 * @return {LocalStorage}\n\
 * @api private\n\
 */\n\
\n\
function localstorage(){\n\
  try {\n\
    return window.localStorage;\n\
  } catch (e) {}\n\
}\n\
\n\
//# sourceURL=components/visionmedia/debug/2.2.0/browser.js"
));

require.register("visionmedia~debug@2.2.0/debug.js", Function("exports, module",
"\n\
/**\n\
 * This is the common logic for both the Node.js and web browser\n\
 * implementations of `debug()`.\n\
 *\n\
 * Expose `debug()` as the module.\n\
 */\n\
\n\
exports = module.exports = debug;\n\
exports.coerce = coerce;\n\
exports.disable = disable;\n\
exports.enable = enable;\n\
exports.enabled = enabled;\n\
exports.humanize = require('rauchg~ms.js@0.7.1');\n\
\n\
/**\n\
 * The currently active debug mode names, and names to skip.\n\
 */\n\
\n\
exports.names = [];\n\
exports.skips = [];\n\
\n\
/**\n\
 * Map of special \"%n\" handling functions, for the debug \"format\" argument.\n\
 *\n\
 * Valid key names are a single, lowercased letter, i.e. \"n\".\n\
 */\n\
\n\
exports.formatters = {};\n\
\n\
/**\n\
 * Previously assigned color.\n\
 */\n\
\n\
var prevColor = 0;\n\
\n\
/**\n\
 * Previous log timestamp.\n\
 */\n\
\n\
var prevTime;\n\
\n\
/**\n\
 * Select a color.\n\
 *\n\
 * @return {Number}\n\
 * @api private\n\
 */\n\
\n\
function selectColor() {\n\
  return exports.colors[prevColor++ % exports.colors.length];\n\
}\n\
\n\
/**\n\
 * Create a debugger with the given `namespace`.\n\
 *\n\
 * @param {String} namespace\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
function debug(namespace) {\n\
\n\
  // define the `disabled` version\n\
  function disabled() {\n\
  }\n\
  disabled.enabled = false;\n\
\n\
  // define the `enabled` version\n\
  function enabled() {\n\
\n\
    var self = enabled;\n\
\n\
    // set `diff` timestamp\n\
    var curr = +new Date();\n\
    var ms = curr - (prevTime || curr);\n\
    self.diff = ms;\n\
    self.prev = prevTime;\n\
    self.curr = curr;\n\
    prevTime = curr;\n\
\n\
    // add the `color` if not set\n\
    if (null == self.useColors) self.useColors = exports.useColors();\n\
    if (null == self.color && self.useColors) self.color = selectColor();\n\
\n\
    var args = Array.prototype.slice.call(arguments);\n\
\n\
    args[0] = exports.coerce(args[0]);\n\
\n\
    if ('string' !== typeof args[0]) {\n\
      // anything else let's inspect with %o\n\
      args = ['%o'].concat(args);\n\
    }\n\
\n\
    // apply any `formatters` transformations\n\
    var index = 0;\n\
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {\n\
      // if we encounter an escaped % then don't increase the array index\n\
      if (match === '%%') return match;\n\
      index++;\n\
      var formatter = exports.formatters[format];\n\
      if ('function' === typeof formatter) {\n\
        var val = args[index];\n\
        match = formatter.call(self, val);\n\
\n\
        // now we need to remove `args[index]` since it's inlined in the `format`\n\
        args.splice(index, 1);\n\
        index--;\n\
      }\n\
      return match;\n\
    });\n\
\n\
    if ('function' === typeof exports.formatArgs) {\n\
      args = exports.formatArgs.apply(self, args);\n\
    }\n\
    var logFn = enabled.log || exports.log || console.log.bind(console);\n\
    logFn.apply(self, args);\n\
  }\n\
  enabled.enabled = true;\n\
\n\
  var fn = exports.enabled(namespace) ? enabled : disabled;\n\
\n\
  fn.namespace = namespace;\n\
\n\
  return fn;\n\
}\n\
\n\
/**\n\
 * Enables a debug mode by namespaces. This can include modes\n\
 * separated by a colon and wildcards.\n\
 *\n\
 * @param {String} namespaces\n\
 * @api public\n\
 */\n\
\n\
function enable(namespaces) {\n\
  exports.save(namespaces);\n\
\n\
  var split = (namespaces || '').split(/[\\s,]+/);\n\
  var len = split.length;\n\
\n\
  for (var i = 0; i < len; i++) {\n\
    if (!split[i]) continue; // ignore empty strings\n\
    namespaces = split[i].replace(/\\*/g, '.*?');\n\
    if (namespaces[0] === '-') {\n\
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));\n\
    } else {\n\
      exports.names.push(new RegExp('^' + namespaces + '$'));\n\
    }\n\
  }\n\
}\n\
\n\
/**\n\
 * Disable debug output.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function disable() {\n\
  exports.enable('');\n\
}\n\
\n\
/**\n\
 * Returns true if the given mode name is enabled, false otherwise.\n\
 *\n\
 * @param {String} name\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
function enabled(name) {\n\
  var i, len;\n\
  for (i = 0, len = exports.skips.length; i < len; i++) {\n\
    if (exports.skips[i].test(name)) {\n\
      return false;\n\
    }\n\
  }\n\
  for (i = 0, len = exports.names.length; i < len; i++) {\n\
    if (exports.names[i].test(name)) {\n\
      return true;\n\
    }\n\
  }\n\
  return false;\n\
}\n\
\n\
/**\n\
 * Coerce `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Mixed}\n\
 * @api private\n\
 */\n\
\n\
function coerce(val) {\n\
  if (val instanceof Error) return val.stack || val.message;\n\
  return val;\n\
}\n\
\n\
//# sourceURL=components/visionmedia/debug/2.2.0/debug.js"
));

require.modules["visionmedia-debug"] = require.modules["visionmedia~debug@2.2.0"];
require.modules["visionmedia~debug"] = require.modules["visionmedia~debug@2.2.0"];
require.modules["debug"] = require.modules["visionmedia~debug@2.2.0"];


require.register("./local/leaflet.label", Function("exports, module",
"/*\n\
\tLeaflet.label, a plugin that adds labels to markers and vectors for Leaflet powered maps.\n\
\t(c) 2012-2013, Jacob Toye, Smartrak\n\
\n\
\thttps://github.com/Leaflet/Leaflet.label\n\
\thttp://leafletjs.com\n\
\thttps://github.com/jacobtoye\n\
*/\n\
(function (window, document, undefined) {\n\
/*\n\
 * Leaflet.label assumes that you have already included the Leaflet library.\n\
 */\n\
\n\
L.labelVersion = '0.2.1';\n\
\n\
L.Label = L.Class.extend({\n\
\n\
\tincludes: L.Mixin.Events,\n\
\n\
\toptions: {\n\
\t\tclassName: '',\n\
\t\tclickable: false,\n\
\t\tdirection: 'right',\n\
\t\tnoHide: false,\n\
\t\toffset: [12, -15], // 6 (width of the label triangle) + 6 (padding)\n\
\t\topacity: 1,\n\
\t\tzoomAnimation: true\n\
\t},\n\
\n\
\tinitialize: function (options, source) {\n\
\t\tL.setOptions(this, options);\n\
\n\
\t\tthis._source = source;\n\
\t\tthis._animated = L.Browser.any3d && this.options.zoomAnimation;\n\
\t\tthis._isOpen = false;\n\
\t},\n\
\n\
\tonAdd: function (map) {\n\
\t\tthis._map = map;\n\
\n\
\t\tthis._pane = this._source instanceof L.Marker ? map._panes.markerPane : map._panes.popupPane;\n\
\n\
\t\tif (!this._container) {\n\
\t\t\tthis._initLayout();\n\
\t\t}\n\
\n\
\t\tthis._pane.appendChild(this._container);\n\
\n\
\t\tthis._initInteraction();\n\
\n\
\t\tthis._update();\n\
\n\
\t\tthis.setOpacity(this.options.opacity);\n\
\n\
\t\tmap\n\
\t\t\t.on('moveend', this._onMoveEnd, this)\n\
\t\t\t.on('viewreset', this._onViewReset, this);\n\
\n\
\t\tif (this._animated) {\n\
\t\t\tmap.on('zoomanim', this._zoomAnimation, this);\n\
\t\t}\n\
\n\
\t\tif (L.Browser.touch && !this.options.noHide) {\n\
\t\t\tL.DomEvent.on(this._container, 'click', this.close, this);\n\
\t\t}\n\
\t},\n\
\n\
\tonRemove: function (map) {\n\
\t\tthis._pane.removeChild(this._container);\n\
\n\
\t\tmap.off({\n\
\t\t\tzoomanim: this._zoomAnimation,\n\
\t\t\tmoveend: this._onMoveEnd,\n\
\t\t\tviewreset: this._onViewReset\n\
\t\t}, this);\n\
\n\
\t\tthis._removeInteraction();\n\
\n\
\t\tthis._map = null;\n\
\t},\n\
\n\
\tsetLatLng: function (latlng) {\n\
\t\tthis._latlng = L.latLng(latlng);\n\
\t\tif (this._map) {\n\
\t\t\tthis._updatePosition();\n\
\t\t}\n\
\t\treturn this;\n\
\t},\n\
\n\
\tsetContent: function (content) {\n\
\t\t// Backup previous content and store new content\n\
\t\tthis._previousContent = this._content;\n\
\t\tthis._content = content;\n\
\n\
\t\tthis._updateContent();\n\
\n\
\t\treturn this;\n\
\t},\n\
\n\
\tclose: function () {\n\
\t\tvar map = this._map;\n\
\n\
\t\tif (map) {\n\
\t\t\tif (L.Browser.touch && !this.options.noHide) {\n\
\t\t\t\tL.DomEvent.off(this._container, 'click', this.close);\n\
\t\t\t}\n\
\n\
\t\t\tmap.removeLayer(this);\n\
\t\t}\n\
\t},\n\
\n\
\tupdateZIndex: function (zIndex) {\n\
\t\tthis._zIndex = zIndex;\n\
\n\
\t\tif (this._container && this._zIndex) {\n\
\t\t\tthis._container.style.zIndex = zIndex;\n\
\t\t}\n\
\t},\n\
\n\
\tsetOpacity: function (opacity) {\n\
\t\tthis.options.opacity = opacity;\n\
\n\
\t\tif (this._container) {\n\
\t\t\tL.DomUtil.setOpacity(this._container, opacity);\n\
\t\t}\n\
\t},\n\
\n\
\t_initLayout: function () {\n\
\t\tthis._container = L.DomUtil.create('div', 'leaflet-label ' + this.options.className + ' leaflet-zoom-animated');\n\
\t\tthis.updateZIndex(this._zIndex);\n\
\t},\n\
\n\
\t_update: function () {\n\
\t\tif (!this._map) { return; }\n\
\n\
\t\tthis._container.style.visibility = 'hidden';\n\
\n\
\t\tthis._updateContent();\n\
\t\tthis._updatePosition();\n\
\n\
\t\tthis._container.style.visibility = '';\n\
\t},\n\
\n\
\t_updateContent: function () {\n\
\t\tif (!this._content || !this._map || this._prevContent === this._content) {\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\tif (typeof this._content === 'string') {\n\
\t\t\tthis._container.innerHTML = this._content;\n\
\n\
\t\t\tthis._prevContent = this._content;\n\
\n\
\t\t\tthis._labelWidth = this._container.offsetWidth;\n\
\t\t}\n\
\t},\n\
\n\
\t_updatePosition: function () {\n\
\t\tvar pos = this._map.latLngToLayerPoint(this._latlng);\n\
\n\
\t\tthis._setPosition(pos);\n\
\t},\n\
\n\
\t_setPosition: function (pos) {\n\
\t\tvar map = this._map,\n\
\t\t\tcontainer = this._container,\n\
\t\t\tcenterPoint = map.latLngToContainerPoint(map.getCenter()),\n\
\t\t\tlabelPoint = map.layerPointToContainerPoint(pos),\n\
\t\t\tdirection = this.options.direction,\n\
\t\t\tlabelWidth = this._labelWidth,\n\
\t\t\toffset = L.point(this.options.offset);\n\
\n\
\t\t// position to the right (right or auto & needs to)\n\
\t\tif (direction === 'right' || direction === 'auto' && labelPoint.x < centerPoint.x) {\n\
\t\t\tL.DomUtil.addClass(container, 'leaflet-label-right');\n\
\t\t\tL.DomUtil.removeClass(container, 'leaflet-label-left');\n\
\n\
\t\t\tpos = pos.add(offset);\n\
\t\t} else { // position to the left\n\
\t\t\tL.DomUtil.addClass(container, 'leaflet-label-left');\n\
\t\t\tL.DomUtil.removeClass(container, 'leaflet-label-right');\n\
\n\
\t\t\tpos = pos.add(L.point(-offset.x - labelWidth, offset.y));\n\
\t\t}\n\
\n\
\t\tL.DomUtil.setPosition(container, pos);\n\
\t},\n\
\n\
\t_zoomAnimation: function (opt) {\n\
\t\tvar pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();\n\
\n\
\t\tthis._setPosition(pos);\n\
\t},\n\
\n\
\t_onMoveEnd: function () {\n\
\t\tif (!this._animated || this.options.direction === 'auto') {\n\
\t\t\tthis._updatePosition();\n\
\t\t}\n\
\t},\n\
\n\
\t_onViewReset: function (e) {\n\
\t\t/* if map resets hard, we must update the label */\n\
\t\tif (e && e.hard) {\n\
\t\t\tthis._update();\n\
\t\t}\n\
\t},\n\
\n\
\t_initInteraction: function () {\n\
\t\tif (!this.options.clickable) { return; }\n\
\n\
\t\tvar container = this._container,\n\
\t\t\tevents = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];\n\
\n\
\t\tL.DomUtil.addClass(container, 'leaflet-clickable');\n\
\t\tL.DomEvent.on(container, 'click', this._onMouseClick, this);\n\
\n\
\t\tfor (var i = 0; i < events.length; i++) {\n\
\t\t\tL.DomEvent.on(container, events[i], this._fireMouseEvent, this);\n\
\t\t}\n\
\t},\n\
\n\
\t_removeInteraction: function () {\n\
\t\tif (!this.options.clickable) { return; }\n\
\n\
\t\tvar container = this._container,\n\
\t\t\tevents = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];\n\
\n\
\t\tL.DomUtil.removeClass(container, 'leaflet-clickable');\n\
\t\tL.DomEvent.off(container, 'click', this._onMouseClick, this);\n\
\n\
\t\tfor (var i = 0; i < events.length; i++) {\n\
\t\t\tL.DomEvent.off(container, events[i], this._fireMouseEvent, this);\n\
\t\t}\n\
\t},\n\
\n\
\t_onMouseClick: function (e) {\n\
\t\tif (this.hasEventListeners(e.type)) {\n\
\t\t\tL.DomEvent.stopPropagation(e);\n\
\t\t}\n\
\n\
\t\tthis.fire(e.type, {\n\
\t\t\toriginalEvent: e\n\
\t\t});\n\
\t},\n\
\n\
\t_fireMouseEvent: function (e) {\n\
\t\tthis.fire(e.type, {\n\
\t\t\toriginalEvent: e\n\
\t\t});\n\
\n\
\t\t// TODO proper custom event propagation\n\
\t\t// this line will always be called if marker is in a FeatureGroup\n\
\t\tif (e.type === 'contextmenu' && this.hasEventListeners(e.type)) {\n\
\t\t\tL.DomEvent.preventDefault(e);\n\
\t\t}\n\
\t\tif (e.type !== 'mousedown') {\n\
\t\t\tL.DomEvent.stopPropagation(e);\n\
\t\t} else {\n\
\t\t\tL.DomEvent.preventDefault(e);\n\
\t\t}\n\
\t}\n\
});\n\
\n\
\n\
// This object is a mixin for L.Marker and L.CircleMarker. We declare it here as both need to include the contents.\n\
L.BaseMarkerMethods = {\n\
\tshowLabel: function () {\n\
\t\tif (this.label && this._map) {\n\
\t\t\tthis.label.setLatLng(this._latlng);\n\
\t\t\tthis._map.showLabel(this.label);\n\
\t\t}\n\
\n\
\t\treturn this;\n\
\t},\n\
\n\
\thideLabel: function () {\n\
\t\tif (this.label) {\n\
\t\t\tthis.label.close();\n\
\t\t}\n\
\t\treturn this;\n\
\t},\n\
\n\
\tsetLabelNoHide: function (noHide) {\n\
\t\tif (this._labelNoHide === noHide) {\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\tthis._labelNoHide = noHide;\n\
\n\
\t\tif (noHide) {\n\
\t\t\tthis._removeLabelRevealHandlers();\n\
\t\t\tthis.showLabel();\n\
\t\t} else {\n\
\t\t\tthis._addLabelRevealHandlers();\n\
\t\t\tthis.hideLabel();\n\
\t\t}\n\
\t},\n\
\n\
\tbindLabel: function (content, options) {\n\
\t\tvar labelAnchor = this.options.icon ? this.options.icon.options.labelAnchor : this.options.labelAnchor,\n\
\t\t\tanchor = L.point(labelAnchor) || L.point(0, 0);\n\
\n\
\t\tanchor = anchor.add(L.Label.prototype.options.offset);\n\
\n\
\t\tif (options && options.offset) {\n\
\t\t\tanchor = anchor.add(options.offset);\n\
\t\t}\n\
\n\
\t\toptions = L.Util.extend({offset: anchor}, options);\n\
\n\
\t\tthis._labelNoHide = options.noHide;\n\
\n\
\t\tif (!this.label) {\n\
\t\t\tif (!this._labelNoHide) {\n\
\t\t\t\tthis._addLabelRevealHandlers();\n\
\t\t\t}\n\
\n\
\t\t\tthis\n\
\t\t\t\t.on('remove', this.hideLabel, this)\n\
\t\t\t\t.on('move', this._moveLabel, this)\n\
\t\t\t\t.on('add', this._onMarkerAdd, this);\n\
\n\
\t\t\tthis._hasLabelHandlers = true;\n\
\t\t}\n\
\n\
\t\tthis.label = new L.Label(options, this)\n\
\t\t\t.setContent(content);\n\
\n\
\t\treturn this;\n\
\t},\n\
\n\
\tunbindLabel: function () {\n\
\t\tif (this.label) {\n\
\t\t\tthis.hideLabel();\n\
\n\
\t\t\tthis.label = null;\n\
\n\
\t\t\tif (this._hasLabelHandlers) {\n\
\t\t\t\tif (!this._labelNoHide) {\n\
\t\t\t\t\tthis._removeLabelRevealHandlers();\n\
\t\t\t\t}\n\
\n\
\t\t\t\tthis\n\
\t\t\t\t\t.off('remove', this.hideLabel, this)\n\
\t\t\t\t\t.off('move', this._moveLabel, this)\n\
\t\t\t\t\t.off('add', this._onMarkerAdd, this);\n\
\t\t\t}\n\
\n\
\t\t\tthis._hasLabelHandlers = false;\n\
\t\t}\n\
\t\treturn this;\n\
\t},\n\
\n\
\tupdateLabelContent: function (content) {\n\
\t\tif (this.label) {\n\
\t\t\tthis.label.setContent(content);\n\
\t\t}\n\
\t},\n\
\n\
\tgetLabel: function () {\n\
\t\treturn this.label;\n\
\t},\n\
\n\
\t_onMarkerAdd: function () {\n\
\t\tif (this._labelNoHide) {\n\
\t\t\tthis.showLabel();\n\
\t\t}\n\
\t},\n\
\n\
\t_addLabelRevealHandlers: function () {\n\
\t\tthis\n\
\t\t\t.on('mouseover', this.showLabel, this)\n\
\t\t\t.on('mouseout', this.hideLabel, this);\n\
\n\
\t\tif (L.Browser.touch) {\n\
\t\t\tthis.on('click', this.showLabel, this);\n\
\t\t}\n\
\t},\n\
\n\
\t_removeLabelRevealHandlers: function () {\n\
\t\tthis\n\
\t\t\t.off('mouseover', this.showLabel, this)\n\
\t\t\t.off('mouseout', this.hideLabel, this);\n\
\n\
\t\tif (L.Browser.touch) {\n\
\t\t\tthis.off('click', this.showLabel, this);\n\
\t\t}\n\
\t},\n\
\n\
\t_moveLabel: function (e) {\n\
\t\tthis.label.setLatLng(e.latlng);\n\
\t}\n\
};\n\
\n\
// Add in an option to icon that is used to set where the label anchor is\n\
L.Icon.Default.mergeOptions({\n\
\tlabelAnchor: new L.Point(9, -20)\n\
});\n\
\n\
// Have to do this since Leaflet is loaded before this plugin and initializes\n\
// L.Marker.options.icon therefore missing our mixin above.\n\
L.Marker.mergeOptions({\n\
\ticon: new L.Icon.Default()\n\
});\n\
\n\
L.Marker.include(L.BaseMarkerMethods);\n\
L.Marker.include({\n\
\t_originalUpdateZIndex: L.Marker.prototype._updateZIndex,\n\
\n\
\t_updateZIndex: function (offset) {\n\
\t\tvar zIndex = this._zIndex + offset;\n\
\n\
\t\tthis._originalUpdateZIndex(offset);\n\
\n\
\t\tif (this.label) {\n\
\t\t\tthis.label.updateZIndex(zIndex);\n\
\t\t}\n\
\t},\n\
\n\
\t_originalSetOpacity: L.Marker.prototype.setOpacity,\n\
\n\
\tsetOpacity: function (opacity, labelHasSemiTransparency) {\n\
\t\tthis.options.labelHasSemiTransparency = labelHasSemiTransparency;\n\
\n\
\t\tthis._originalSetOpacity(opacity);\n\
\t},\n\
\n\
\t_originalUpdateOpacity: L.Marker.prototype._updateOpacity,\n\
\n\
\t_updateOpacity: function () {\n\
\t\tvar absoluteOpacity = this.options.opacity === 0 ? 0 : 1;\n\
\n\
\t\tthis._originalUpdateOpacity();\n\
\n\
\t\tif (this.label) {\n\
\t\t\tthis.label.setOpacity(this.options.labelHasSemiTransparency ? this.options.opacity : absoluteOpacity);\n\
\t\t}\n\
\t},\n\
\n\
\t_originalSetLatLng: L.Marker.prototype.setLatLng,\n\
\n\
\tsetLatLng: function (latlng) {\n\
\t\tif (this.label && !this._labelNoHide) {\n\
\t\t\tthis.hideLabel();\n\
\t\t}\n\
\n\
\t\treturn this._originalSetLatLng(latlng);\n\
\t}\n\
});\n\
\n\
// Add in an option to icon that is used to set where the label anchor is\n\
L.CircleMarker.mergeOptions({\n\
\tlabelAnchor: new L.Point(0, 0)\n\
});\n\
\n\
\n\
L.CircleMarker.include(L.BaseMarkerMethods);\n\
\n\
L.Path.include({\n\
\tbindLabel: function (content, options) {\n\
\t\tif (!this.label || this.label.options !== options) {\n\
\t\t\tthis.label = new L.Label(options, this);\n\
\t\t}\n\
\n\
\t\tthis.label.setContent(content);\n\
\n\
\t\tif (!this._showLabelAdded) {\n\
\t\t\tthis\n\
\t\t\t\t.on('mouseover', this._showLabel, this)\n\
\t\t\t\t.on('mousemove', this._moveLabel, this)\n\
\t\t\t\t.on('mouseout remove', this._hideLabel, this);\n\
\n\
\t\t\tif (L.Browser.touch) {\n\
\t\t\t\tthis.on('click', this._showLabel, this);\n\
\t\t\t}\n\
\t\t\tthis._showLabelAdded = true;\n\
\t\t}\n\
\n\
\t\treturn this;\n\
\t},\n\
\n\
\tunbindLabel: function () {\n\
\t\tif (this.label) {\n\
\t\t\tthis._hideLabel();\n\
\t\t\tthis.label = null;\n\
\t\t\tthis._showLabelAdded = false;\n\
\t\t\tthis\n\
\t\t\t\t.off('mouseover', this._showLabel, this)\n\
\t\t\t\t.off('mousemove', this._moveLabel, this)\n\
\t\t\t\t.off('mouseout remove', this._hideLabel, this);\n\
\t\t}\n\
\t\treturn this;\n\
\t},\n\
\n\
\tupdateLabelContent: function (content) {\n\
\t\tif (this.label) {\n\
\t\t\tthis.label.setContent(content);\n\
\t\t}\n\
\t},\n\
\n\
\t_showLabel: function (e) {\n\
\t\tthis.label.setLatLng(e.latlng);\n\
\t\tthis._map.showLabel(this.label);\n\
\t},\n\
\n\
\t_moveLabel: function (e) {\n\
\t\tthis.label.setLatLng(e.latlng);\n\
\t},\n\
\n\
\t_hideLabel: function () {\n\
\t\tthis.label.close();\n\
\t}\n\
});\n\
\n\
L.Map.include({\n\
\tshowLabel: function (label) {\n\
\t\treturn this.addLayer(label);\n\
\t}\n\
});\n\
\n\
L.FeatureGroup.include({\n\
\t// TODO: remove this when AOP is supported in Leaflet, need this as we cannot put code in removeLayer()\n\
\tclearLayers: function () {\n\
\t\tthis.unbindLabel();\n\
\t\tthis.eachLayer(this.removeLayer, this);\n\
\t\treturn this;\n\
\t},\n\
\n\
\tbindLabel: function (content, options) {\n\
\t\treturn this.invoke('bindLabel', content, options);\n\
\t},\n\
\n\
\tunbindLabel: function () {\n\
\t\treturn this.invoke('unbindLabel');\n\
\t},\n\
\n\
\tupdateLabelContent: function (content) {\n\
\t\tthis.invoke('updateLabelContent', content);\n\
\t}\n\
});\n\
\n\
}(this, document));\n\
//# sourceURL=local/leaflet.label/leaflet.label-src.js"
));

require.modules["leaflet.label"] = require.modules["./local/leaflet.label"];


require.register("./local/jed", Function("exports, module",
"/**\n\
 * @preserve jed.js https://github.com/SlexAxton/Jed\n\
 */\n\
/*\n\
-----------\n\
A gettext compatible i18n library for modern JavaScript Applications\n\
\n\
by Alex Sexton - AlexSexton [at] gmail - @SlexAxton\n\
WTFPL license for use\n\
Dojo CLA for contributions\n\
\n\
Jed offers the entire applicable GNU gettext spec'd set of\n\
functions, but also offers some nicer wrappers around them.\n\
The api for gettext was written for a language with no function\n\
overloading, so Jed allows a little more of that.\n\
\n\
Many thanks to Joshua I. Miller - unrtst@cpan.org - who wrote\n\
gettext.js back in 2008. I was able to vet a lot of my ideas\n\
against his. I also made sure Jed passed against his tests\n\
in order to offer easy upgrades -- jsgettext.berlios.de\n\
*/\n\
(function (root, undef) {\n\
\n\
  // Set up some underscore-style functions, if you already have\n\
  // underscore, feel free to delete this section, and use it\n\
  // directly, however, the amount of functions used doesn't\n\
  // warrant having underscore as a full dependency.\n\
  // Underscore 1.3.0 was used to port and is licensed\n\
  // under the MIT License by Jeremy Ashkenas.\n\
  var ArrayProto    = Array.prototype,\n\
      ObjProto      = Object.prototype,\n\
      slice         = ArrayProto.slice,\n\
      hasOwnProp    = ObjProto.hasOwnProperty,\n\
      nativeForEach = ArrayProto.forEach,\n\
      breaker       = {};\n\
\n\
  // We're not using the OOP style _ so we don't need the\n\
  // extra level of indirection. This still means that you\n\
  // sub out for real `_` though.\n\
  var _ = {\n\
    forEach : function( obj, iterator, context ) {\n\
      var i, l, key;\n\
      if ( obj === null ) {\n\
        return;\n\
      }\n\
\n\
      if ( nativeForEach && obj.forEach === nativeForEach ) {\n\
        obj.forEach( iterator, context );\n\
      }\n\
      else if ( obj.length === +obj.length ) {\n\
        for ( i = 0, l = obj.length; i < l; i++ ) {\n\
          if ( i in obj && iterator.call( context, obj[i], i, obj ) === breaker ) {\n\
            return;\n\
          }\n\
        }\n\
      }\n\
      else {\n\
        for ( key in obj) {\n\
          if ( hasOwnProp.call( obj, key ) ) {\n\
            if ( iterator.call (context, obj[key], key, obj ) === breaker ) {\n\
              return;\n\
            }\n\
          }\n\
        }\n\
      }\n\
    },\n\
    extend : function( obj ) {\n\
      this.forEach( slice.call( arguments, 1 ), function ( source ) {\n\
        for ( var prop in source ) {\n\
          obj[prop] = source[prop];\n\
        }\n\
      });\n\
      return obj;\n\
    }\n\
  };\n\
  // END Miniature underscore impl\n\
\n\
  // Jed is a constructor function\n\
  var Jed = function ( options ) {\n\
    // Some minimal defaults\n\
    this.defaults = {\n\
      \"locale_data\" : {\n\
        \"messages\" : {\n\
          \"\" : {\n\
            \"domain\"       : \"messages\",\n\
            \"lang\"         : \"en\",\n\
            \"plural_forms\" : \"nplurals=2; plural=(n != 1);\"\n\
          }\n\
          // There are no default keys, though\n\
        }\n\
      },\n\
      // The default domain if one is missing\n\
      \"domain\" : \"messages\",\n\
      // enable debug mode to log untranslated strings to the console\n\
      \"debug\" : false\n\
    };\n\
\n\
    // Mix in the sent options with the default options\n\
    this.options = _.extend( {}, this.defaults, options );\n\
    this.textdomain( this.options.domain );\n\
\n\
    if ( options.domain && ! this.options.locale_data[ this.options.domain ] ) {\n\
      throw new Error('Text domain set to non-existent domain: `' + options.domain + '`');\n\
    }\n\
  };\n\
\n\
  // The gettext spec sets this character as the default\n\
  // delimiter for context lookups.\n\
  // e.g.: context\\u0004key\n\
  // If your translation company uses something different,\n\
  // just change this at any time and it will use that instead.\n\
  Jed.context_delimiter = String.fromCharCode( 4 );\n\
\n\
  function getPluralFormFunc ( plural_form_string ) {\n\
    return Jed.PF.compile( plural_form_string || \"nplurals=2; plural=(n != 1);\");\n\
  }\n\
\n\
  function Chain( key, i18n ){\n\
    this._key = key;\n\
    this._i18n = i18n;\n\
  }\n\
\n\
  // Create a chainable api for adding args prettily\n\
  _.extend( Chain.prototype, {\n\
    onDomain : function ( domain ) {\n\
      this._domain = domain;\n\
      return this;\n\
    },\n\
    withContext : function ( context ) {\n\
      this._context = context;\n\
      return this;\n\
    },\n\
    ifPlural : function ( num, pkey ) {\n\
      this._val = num;\n\
      this._pkey = pkey;\n\
      return this;\n\
    },\n\
    fetch : function ( sArr ) {\n\
      if ( {}.toString.call( sArr ) != '[object Array]' ) {\n\
        sArr = [].slice.call(arguments, 0);\n\
      }\n\
      return ( sArr && sArr.length ? Jed.sprintf : function(x){ return x; } )(\n\
        this._i18n.dcnpgettext(this._domain, this._context, this._key, this._pkey, this._val),\n\
        sArr\n\
      );\n\
    }\n\
  });\n\
\n\
  // Add functions to the Jed prototype.\n\
  // These will be the functions on the object that's returned\n\
  // from creating a `new Jed()`\n\
  // These seem redundant, but they gzip pretty well.\n\
  _.extend( Jed.prototype, {\n\
    // The sexier api start point\n\
    translate : function ( key ) {\n\
      return new Chain( key, this );\n\
    },\n\
\n\
    textdomain : function ( domain ) {\n\
      if ( ! domain ) {\n\
        return this._textdomain;\n\
      }\n\
      this._textdomain = domain;\n\
    },\n\
\n\
    gettext : function ( key ) {\n\
      return this.dcnpgettext.call( this, undef, undef, key );\n\
    },\n\
\n\
    dgettext : function ( domain, key ) {\n\
     return this.dcnpgettext.call( this, domain, undef, key );\n\
    },\n\
\n\
    dcgettext : function ( domain , key /*, category */ ) {\n\
      // Ignores the category anyways\n\
      return this.dcnpgettext.call( this, domain, undef, key );\n\
    },\n\
\n\
    ngettext : function ( skey, pkey, val ) {\n\
      return this.dcnpgettext.call( this, undef, undef, skey, pkey, val );\n\
    },\n\
\n\
    dngettext : function ( domain, skey, pkey, val ) {\n\
      return this.dcnpgettext.call( this, domain, undef, skey, pkey, val );\n\
    },\n\
\n\
    dcngettext : function ( domain, skey, pkey, val/*, category */) {\n\
      return this.dcnpgettext.call( this, domain, undef, skey, pkey, val );\n\
    },\n\
\n\
    pgettext : function ( context, key ) {\n\
      return this.dcnpgettext.call( this, undef, context, key );\n\
    },\n\
\n\
    dpgettext : function ( domain, context, key ) {\n\
      return this.dcnpgettext.call( this, domain, context, key );\n\
    },\n\
\n\
    dcpgettext : function ( domain, context, key/*, category */) {\n\
      return this.dcnpgettext.call( this, domain, context, key );\n\
    },\n\
\n\
    npgettext : function ( context, skey, pkey, val ) {\n\
      return this.dcnpgettext.call( this, undef, context, skey, pkey, val );\n\
    },\n\
\n\
    dnpgettext : function ( domain, context, skey, pkey, val ) {\n\
      return this.dcnpgettext.call( this, domain, context, skey, pkey, val );\n\
    },\n\
\n\
    // The most fully qualified gettext function. It has every option.\n\
    // Since it has every option, we can use it from every other method.\n\
    // This is the bread and butter.\n\
    // Technically there should be one more argument in this function for 'Category',\n\
    // but since we never use it, we might as well not waste the bytes to define it.\n\
    dcnpgettext : function ( domain, context, singular_key, plural_key, val ) {\n\
      // Set some defaults\n\
\n\
      plural_key = plural_key || singular_key;\n\
\n\
      // Use the global domain default if one\n\
      // isn't explicitly passed in\n\
      domain = domain || this._textdomain;\n\
\n\
      var fallback;\n\
\n\
      // Handle special cases\n\
\n\
      // No options found\n\
      if ( ! this.options ) {\n\
        // There's likely something wrong, but we'll return the correct key for english\n\
        // We do this by instantiating a brand new Jed instance with the default set\n\
        // for everything that could be broken.\n\
        fallback = new Jed();\n\
        return fallback.dcnpgettext.call( fallback, undefined, undefined, singular_key, plural_key, val );\n\
      }\n\
\n\
      // No translation data provided\n\
      if ( ! this.options.locale_data ) {\n\
        throw new Error('No locale data provided.');\n\
      }\n\
\n\
      if ( ! this.options.locale_data[ domain ] ) {\n\
        throw new Error('Domain `' + domain + '` was not found.');\n\
      }\n\
\n\
      if ( ! this.options.locale_data[ domain ][ \"\" ] ) {\n\
        throw new Error('No locale meta information provided.');\n\
      }\n\
\n\
      // Make sure we have a truthy key. Otherwise we might start looking\n\
      // into the empty string key, which is the options for the locale\n\
      // data.\n\
      if ( ! singular_key ) {\n\
        throw new Error('No translation key found.');\n\
      }\n\
\n\
      var key  = context ? context + Jed.context_delimiter + singular_key : singular_key,\n\
          locale_data = this.options.locale_data,\n\
          dict = locale_data[ domain ],\n\
          defaultConf = (locale_data.messages || this.defaults.locale_data.messages)[\"\"],\n\
          pluralForms = dict[\"\"].plural_forms || dict[\"\"][\"Plural-Forms\"] || dict[\"\"][\"plural-forms\"] || defaultConf.plural_forms || defaultConf[\"Plural-Forms\"] || defaultConf[\"plural-forms\"],\n\
          val_list,\n\
          res;\n\
\n\
      var val_idx;\n\
      if (val === undefined) {\n\
        // No value passed in; assume singular key lookup.\n\
        val_idx = 0;\n\
\n\
      } else {\n\
        // Value has been passed in; use plural-forms calculations.\n\
\n\
        // Handle invalid numbers, but try casting strings for good measure\n\
        if ( typeof val != 'number' ) {\n\
          val = parseInt( val, 10 );\n\
\n\
          if ( isNaN( val ) ) {\n\
            throw new Error('The number that was passed in is not a number.');\n\
          }\n\
        }\n\
\n\
        val_idx = getPluralFormFunc(pluralForms)(val);\n\
      }\n\
\n\
      // Throw an error if a domain isn't found\n\
      if ( ! dict ) {\n\
        throw new Error('No domain named `' + domain + '` could be found.');\n\
      }\n\
\n\
      val_list = dict[ key ];\n\
\n\
      // If there is no match, then revert back to\n\
      // english style singular/plural with the keys passed in.\n\
      if ( ! val_list || val_idx > val_list.length ) {\n\
        if (this.options.missing_key_callback) {\n\
          this.options.missing_key_callback(key, domain);\n\
        }\n\
        res = [ singular_key, plural_key ];\n\
\n\
        // collect untranslated strings\n\
        if (this.options.debug===true) {\n\
          console.error(\"Missing translation for key: \", res[ getPluralFormFunc(pluralForms)( val ) ]);\n\
        }\n\
        return res[ getPluralFormFunc()( val ) ];\n\
      }\n\
\n\
      res = val_list[ val_idx ];\n\
\n\
      // This includes empty strings on purpose\n\
      if ( ! res  ) {\n\
        res = [ singular_key, plural_key ];\n\
        return res[ getPluralFormFunc()( val ) ];\n\
      }\n\
      return res;\n\
    }\n\
  });\n\
\n\
\n\
  // We add in sprintf capabilities for post translation value interolation\n\
  // This is not internally used, so you can remove it if you have this\n\
  // available somewhere else, or want to use a different system.\n\
\n\
  // We _slightly_ modify the normal sprintf behavior to more gracefully handle\n\
  // undefined values.\n\
\n\
  /**\n\
   sprintf() for JavaScript 0.7-beta1\n\
   http://www.diveintojavascript.com/projects/javascript-sprintf\n\
\n\
   Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>\n\
   All rights reserved.\n\
\n\
   Redistribution and use in source and binary forms, with or without\n\
   modification, are permitted provided that the following conditions are met:\n\
       * Redistributions of source code must retain the above copyright\n\
         notice, this list of conditions and the following disclaimer.\n\
       * Redistributions in binary form must reproduce the above copyright\n\
         notice, this list of conditions and the following disclaimer in the\n\
         documentation and/or other materials provided with the distribution.\n\
       * Neither the name of sprintf() for JavaScript nor the\n\
         names of its contributors may be used to endorse or promote products\n\
         derived from this software without specific prior written permission.\n\
\n\
   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND\n\
   ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED\n\
   WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE\n\
   DISCLAIMED. IN NO EVENT SHALL Alexandru Marasteanu BE LIABLE FOR ANY\n\
   DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES\n\
   (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;\n\
   LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND\n\
   ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n\
   (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS\n\
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n\
  */\n\
  var sprintf = (function() {\n\
    function get_type(variable) {\n\
      return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();\n\
    }\n\
    function str_repeat(input, multiplier) {\n\
      for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}\n\
      return output.join('');\n\
    }\n\
\n\
    var str_format = function() {\n\
      if (!str_format.cache.hasOwnProperty(arguments[0])) {\n\
        str_format.cache[arguments[0]] = str_format.parse(arguments[0]);\n\
      }\n\
      return str_format.format.call(null, str_format.cache[arguments[0]], arguments);\n\
    };\n\
\n\
    str_format.format = function(parse_tree, argv) {\n\
      var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;\n\
      for (i = 0; i < tree_length; i++) {\n\
        node_type = get_type(parse_tree[i]);\n\
        if (node_type === 'string') {\n\
          output.push(parse_tree[i]);\n\
        }\n\
        else if (node_type === 'array') {\n\
          match = parse_tree[i]; // convenience purposes only\n\
          if (match[2]) { // keyword argument\n\
            arg = argv[cursor];\n\
            for (k = 0; k < match[2].length; k++) {\n\
              if (!arg.hasOwnProperty(match[2][k])) {\n\
                throw(sprintf('[sprintf] property \"%s\" does not exist', match[2][k]));\n\
              }\n\
              arg = arg[match[2][k]];\n\
            }\n\
          }\n\
          else if (match[1]) { // positional argument (explicit)\n\
            arg = argv[match[1]];\n\
          }\n\
          else { // positional argument (implicit)\n\
            arg = argv[cursor++];\n\
          }\n\
\n\
          if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {\n\
            throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));\n\
          }\n\
\n\
          // Jed EDIT\n\
          if ( typeof arg == 'undefined' || arg === null ) {\n\
            arg = '';\n\
          }\n\
          // Jed EDIT\n\
\n\
          switch (match[8]) {\n\
            case 'b': arg = arg.toString(2); break;\n\
            case 'c': arg = String.fromCharCode(arg); break;\n\
            case 'd': arg = parseInt(arg, 10); break;\n\
            case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;\n\
            case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;\n\
            case 'o': arg = arg.toString(8); break;\n\
            case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;\n\
            case 'u': arg = Math.abs(arg); break;\n\
            case 'x': arg = arg.toString(16); break;\n\
            case 'X': arg = arg.toString(16).toUpperCase(); break;\n\
          }\n\
          arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);\n\
          pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';\n\
          pad_length = match[6] - String(arg).length;\n\
          pad = match[6] ? str_repeat(pad_character, pad_length) : '';\n\
          output.push(match[5] ? arg + pad : pad + arg);\n\
        }\n\
      }\n\
      return output.join('');\n\
    };\n\
\n\
    str_format.cache = {};\n\
\n\
    str_format.parse = function(fmt) {\n\
      var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;\n\
      while (_fmt) {\n\
        if ((match = /^[^\\x25]+/.exec(_fmt)) !== null) {\n\
          parse_tree.push(match[0]);\n\
        }\n\
        else if ((match = /^\\x25{2}/.exec(_fmt)) !== null) {\n\
          parse_tree.push('%');\n\
        }\n\
        else if ((match = /^\\x25(?:([1-9]\\d*)\\$|\\(([^\\)]+)\\))?(\\+)?(0|'[^$])?(-)?(\\d+)?(?:\\.(\\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {\n\
          if (match[2]) {\n\
            arg_names |= 1;\n\
            var field_list = [], replacement_field = match[2], field_match = [];\n\
            if ((field_match = /^([a-z_][a-z_\\d]*)/i.exec(replacement_field)) !== null) {\n\
              field_list.push(field_match[1]);\n\
              while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {\n\
                if ((field_match = /^\\.([a-z_][a-z_\\d]*)/i.exec(replacement_field)) !== null) {\n\
                  field_list.push(field_match[1]);\n\
                }\n\
                else if ((field_match = /^\\[(\\d+)\\]/.exec(replacement_field)) !== null) {\n\
                  field_list.push(field_match[1]);\n\
                }\n\
                else {\n\
                  throw('[sprintf] huh?');\n\
                }\n\
              }\n\
            }\n\
            else {\n\
              throw('[sprintf] huh?');\n\
            }\n\
            match[2] = field_list;\n\
          }\n\
          else {\n\
            arg_names |= 2;\n\
          }\n\
          if (arg_names === 3) {\n\
            throw('[sprintf] mixing positional and named placeholders is not (yet) supported');\n\
          }\n\
          parse_tree.push(match);\n\
        }\n\
        else {\n\
          throw('[sprintf] huh?');\n\
        }\n\
        _fmt = _fmt.substring(match[0].length);\n\
      }\n\
      return parse_tree;\n\
    };\n\
\n\
    return str_format;\n\
  })();\n\
\n\
  var vsprintf = function(fmt, argv) {\n\
    argv.unshift(fmt);\n\
    return sprintf.apply(null, argv);\n\
  };\n\
\n\
  Jed.parse_plural = function ( plural_forms, n ) {\n\
    plural_forms = plural_forms.replace(/n/g, n);\n\
    return Jed.parse_expression(plural_forms);\n\
  };\n\
\n\
  Jed.sprintf = function ( fmt, args ) {\n\
    if ( {}.toString.call( args ) == '[object Array]' ) {\n\
      return vsprintf( fmt, [].slice.call(args) );\n\
    }\n\
    return sprintf.apply(this, [].slice.call(arguments) );\n\
  };\n\
\n\
  Jed.prototype.sprintf = function () {\n\
    return Jed.sprintf.apply(this, arguments);\n\
  };\n\
  // END sprintf Implementation\n\
\n\
  // Start the Plural forms section\n\
  // This is a full plural form expression parser. It is used to avoid\n\
  // running 'eval' or 'new Function' directly against the plural\n\
  // forms.\n\
  //\n\
  // This can be important if you get translations done through a 3rd\n\
  // party vendor. I encourage you to use this instead, however, I\n\
  // also will provide a 'precompiler' that you can use at build time\n\
  // to output valid/safe function representations of the plural form\n\
  // expressions. This means you can build this code out for the most\n\
  // part.\n\
  Jed.PF = {};\n\
\n\
  Jed.PF.parse = function ( p ) {\n\
    var plural_str = Jed.PF.extractPluralExpr( p );\n\
    return Jed.PF.parser.parse.call(Jed.PF.parser, plural_str);\n\
  };\n\
\n\
  Jed.PF.compile = function ( p ) {\n\
    // Handle trues and falses as 0 and 1\n\
    function imply( val ) {\n\
      return (val === true ? 1 : val ? val : 0);\n\
    }\n\
\n\
    var ast = Jed.PF.parse( p );\n\
    return function ( n ) {\n\
      return imply( Jed.PF.interpreter( ast )( n ) );\n\
    };\n\
  };\n\
\n\
  Jed.PF.interpreter = function ( ast ) {\n\
    return function ( n ) {\n\
      var res;\n\
      switch ( ast.type ) {\n\
        case 'GROUP':\n\
          return Jed.PF.interpreter( ast.expr )( n );\n\
        case 'TERNARY':\n\
          if ( Jed.PF.interpreter( ast.expr )( n ) ) {\n\
            return Jed.PF.interpreter( ast.truthy )( n );\n\
          }\n\
          return Jed.PF.interpreter( ast.falsey )( n );\n\
        case 'OR':\n\
          return Jed.PF.interpreter( ast.left )( n ) || Jed.PF.interpreter( ast.right )( n );\n\
        case 'AND':\n\
          return Jed.PF.interpreter( ast.left )( n ) && Jed.PF.interpreter( ast.right )( n );\n\
        case 'LT':\n\
          return Jed.PF.interpreter( ast.left )( n ) < Jed.PF.interpreter( ast.right )( n );\n\
        case 'GT':\n\
          return Jed.PF.interpreter( ast.left )( n ) > Jed.PF.interpreter( ast.right )( n );\n\
        case 'LTE':\n\
          return Jed.PF.interpreter( ast.left )( n ) <= Jed.PF.interpreter( ast.right )( n );\n\
        case 'GTE':\n\
          return Jed.PF.interpreter( ast.left )( n ) >= Jed.PF.interpreter( ast.right )( n );\n\
        case 'EQ':\n\
          return Jed.PF.interpreter( ast.left )( n ) == Jed.PF.interpreter( ast.right )( n );\n\
        case 'NEQ':\n\
          return Jed.PF.interpreter( ast.left )( n ) != Jed.PF.interpreter( ast.right )( n );\n\
        case 'MOD':\n\
          return Jed.PF.interpreter( ast.left )( n ) % Jed.PF.interpreter( ast.right )( n );\n\
        case 'VAR':\n\
          return n;\n\
        case 'NUM':\n\
          return ast.val;\n\
        default:\n\
          throw new Error(\"Invalid Token found.\");\n\
      }\n\
    };\n\
  };\n\
\n\
  Jed.PF.extractPluralExpr = function ( p ) {\n\
    // trim first\n\
    p = p.replace(/^\\s\\s*/, '').replace(/\\s\\s*$/, '');\n\
\n\
    if (! /;\\s*$/.test(p)) {\n\
      p = p.concat(';');\n\
    }\n\
\n\
    var nplurals_re = /nplurals\\=(\\d+);/,\n\
        plural_re = /plural\\=(.*);/,\n\
        nplurals_matches = p.match( nplurals_re ),\n\
        res = {},\n\
        plural_matches;\n\
\n\
    // Find the nplurals number\n\
    if ( nplurals_matches.length > 1 ) {\n\
      res.nplurals = nplurals_matches[1];\n\
    }\n\
    else {\n\
      throw new Error('nplurals not found in plural_forms string: ' + p );\n\
    }\n\
\n\
    // remove that data to get to the formula\n\
    p = p.replace( nplurals_re, \"\" );\n\
    plural_matches = p.match( plural_re );\n\
\n\
    if (!( plural_matches && plural_matches.length > 1 ) ) {\n\
      throw new Error('`plural` expression not found: ' + p);\n\
    }\n\
    return plural_matches[ 1 ];\n\
  };\n\
\n\
  /* Jison generated parser */\n\
  Jed.PF.parser = (function(){\n\
\n\
var parser = {trace: function trace() { },\n\
yy: {},\n\
symbols_: {\"error\":2,\"expressions\":3,\"e\":4,\"EOF\":5,\"?\":6,\":\":7,\"||\":8,\"&&\":9,\"<\":10,\"<=\":11,\">\":12,\">=\":13,\"!=\":14,\"==\":15,\"%\":16,\"(\":17,\")\":18,\"n\":19,\"NUMBER\":20,\"$accept\":0,\"$end\":1},\n\
terminals_: {2:\"error\",5:\"EOF\",6:\"?\",7:\":\",8:\"||\",9:\"&&\",10:\"<\",11:\"<=\",12:\">\",13:\">=\",14:\"!=\",15:\"==\",16:\"%\",17:\"(\",18:\")\",19:\"n\",20:\"NUMBER\"},\n\
productions_: [0,[3,2],[4,5],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,1],[4,1]],\n\
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {\n\
\n\
var $0 = $$.length - 1;\n\
switch (yystate) {\n\
case 1: return { type : 'GROUP', expr: $$[$0-1] };\n\
break;\n\
case 2:this.$ = { type: 'TERNARY', expr: $$[$0-4], truthy : $$[$0-2], falsey: $$[$0] };\n\
break;\n\
case 3:this.$ = { type: \"OR\", left: $$[$0-2], right: $$[$0] };\n\
break;\n\
case 4:this.$ = { type: \"AND\", left: $$[$0-2], right: $$[$0] };\n\
break;\n\
case 5:this.$ = { type: 'LT', left: $$[$0-2], right: $$[$0] };\n\
break;\n\
case 6:this.$ = { type: 'LTE', left: $$[$0-2], right: $$[$0] };\n\
break;\n\
case 7:this.$ = { type: 'GT', left: $$[$0-2], right: $$[$0] };\n\
break;\n\
case 8:this.$ = { type: 'GTE', left: $$[$0-2], right: $$[$0] };\n\
break;\n\
case 9:this.$ = { type: 'NEQ', left: $$[$0-2], right: $$[$0] };\n\
break;\n\
case 10:this.$ = { type: 'EQ', left: $$[$0-2], right: $$[$0] };\n\
break;\n\
case 11:this.$ = { type: 'MOD', left: $$[$0-2], right: $$[$0] };\n\
break;\n\
case 12:this.$ = { type: 'GROUP', expr: $$[$0-1] };\n\
break;\n\
case 13:this.$ = { type: 'VAR' };\n\
break;\n\
case 14:this.$ = { type: 'NUM', val: Number(yytext) };\n\
break;\n\
}\n\
},\n\
table: [{3:1,4:2,17:[1,3],19:[1,4],20:[1,5]},{1:[3]},{5:[1,6],6:[1,7],8:[1,8],9:[1,9],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16]},{4:17,17:[1,3],19:[1,4],20:[1,5]},{5:[2,13],6:[2,13],7:[2,13],8:[2,13],9:[2,13],10:[2,13],11:[2,13],12:[2,13],13:[2,13],14:[2,13],15:[2,13],16:[2,13],18:[2,13]},{5:[2,14],6:[2,14],7:[2,14],8:[2,14],9:[2,14],10:[2,14],11:[2,14],12:[2,14],13:[2,14],14:[2,14],15:[2,14],16:[2,14],18:[2,14]},{1:[2,1]},{4:18,17:[1,3],19:[1,4],20:[1,5]},{4:19,17:[1,3],19:[1,4],20:[1,5]},{4:20,17:[1,3],19:[1,4],20:[1,5]},{4:21,17:[1,3],19:[1,4],20:[1,5]},{4:22,17:[1,3],19:[1,4],20:[1,5]},{4:23,17:[1,3],19:[1,4],20:[1,5]},{4:24,17:[1,3],19:[1,4],20:[1,5]},{4:25,17:[1,3],19:[1,4],20:[1,5]},{4:26,17:[1,3],19:[1,4],20:[1,5]},{4:27,17:[1,3],19:[1,4],20:[1,5]},{6:[1,7],8:[1,8],9:[1,9],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16],18:[1,28]},{6:[1,7],7:[1,29],8:[1,8],9:[1,9],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16]},{5:[2,3],6:[2,3],7:[2,3],8:[2,3],9:[1,9],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16],18:[2,3]},{5:[2,4],6:[2,4],7:[2,4],8:[2,4],9:[2,4],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16],18:[2,4]},{5:[2,5],6:[2,5],7:[2,5],8:[2,5],9:[2,5],10:[2,5],11:[2,5],12:[2,5],13:[2,5],14:[2,5],15:[2,5],16:[1,16],18:[2,5]},{5:[2,6],6:[2,6],7:[2,6],8:[2,6],9:[2,6],10:[2,6],11:[2,6],12:[2,6],13:[2,6],14:[2,6],15:[2,6],16:[1,16],18:[2,6]},{5:[2,7],6:[2,7],7:[2,7],8:[2,7],9:[2,7],10:[2,7],11:[2,7],12:[2,7],13:[2,7],14:[2,7],15:[2,7],16:[1,16],18:[2,7]},{5:[2,8],6:[2,8],7:[2,8],8:[2,8],9:[2,8],10:[2,8],11:[2,8],12:[2,8],13:[2,8],14:[2,8],15:[2,8],16:[1,16],18:[2,8]},{5:[2,9],6:[2,9],7:[2,9],8:[2,9],9:[2,9],10:[2,9],11:[2,9],12:[2,9],13:[2,9],14:[2,9],15:[2,9],16:[1,16],18:[2,9]},{5:[2,10],6:[2,10],7:[2,10],8:[2,10],9:[2,10],10:[2,10],11:[2,10],12:[2,10],13:[2,10],14:[2,10],15:[2,10],16:[1,16],18:[2,10]},{5:[2,11],6:[2,11],7:[2,11],8:[2,11],9:[2,11],10:[2,11],11:[2,11],12:[2,11],13:[2,11],14:[2,11],15:[2,11],16:[2,11],18:[2,11]},{5:[2,12],6:[2,12],7:[2,12],8:[2,12],9:[2,12],10:[2,12],11:[2,12],12:[2,12],13:[2,12],14:[2,12],15:[2,12],16:[2,12],18:[2,12]},{4:30,17:[1,3],19:[1,4],20:[1,5]},{5:[2,2],6:[1,7],7:[2,2],8:[1,8],9:[1,9],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16],18:[2,2]}],\n\
defaultActions: {6:[2,1]},\n\
parseError: function parseError(str, hash) {\n\
    throw new Error(str);\n\
},\n\
parse: function parse(input) {\n\
    var self = this,\n\
        stack = [0],\n\
        vstack = [null], // semantic value stack\n\
        lstack = [], // location stack\n\
        table = this.table,\n\
        yytext = '',\n\
        yylineno = 0,\n\
        yyleng = 0,\n\
        recovering = 0,\n\
        TERROR = 2,\n\
        EOF = 1;\n\
\n\
    //this.reductionCount = this.shiftCount = 0;\n\
\n\
    this.lexer.setInput(input);\n\
    this.lexer.yy = this.yy;\n\
    this.yy.lexer = this.lexer;\n\
    if (typeof this.lexer.yylloc == 'undefined')\n\
        this.lexer.yylloc = {};\n\
    var yyloc = this.lexer.yylloc;\n\
    lstack.push(yyloc);\n\
\n\
    if (typeof this.yy.parseError === 'function')\n\
        this.parseError = this.yy.parseError;\n\
\n\
    function popStack (n) {\n\
        stack.length = stack.length - 2*n;\n\
        vstack.length = vstack.length - n;\n\
        lstack.length = lstack.length - n;\n\
    }\n\
\n\
    function lex() {\n\
        var token;\n\
        token = self.lexer.lex() || 1; // $end = 1\n\
        // if token isn't its numeric value, convert\n\
        if (typeof token !== 'number') {\n\
            token = self.symbols_[token] || token;\n\
        }\n\
        return token;\n\
    }\n\
\n\
    var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected;\n\
    while (true) {\n\
        // retreive state number from top of stack\n\
        state = stack[stack.length-1];\n\
\n\
        // use default actions if available\n\
        if (this.defaultActions[state]) {\n\
            action = this.defaultActions[state];\n\
        } else {\n\
            if (symbol == null)\n\
                symbol = lex();\n\
            // read action for current state and first input\n\
            action = table[state] && table[state][symbol];\n\
        }\n\
\n\
        // handle parse error\n\
        _handle_error:\n\
        if (typeof action === 'undefined' || !action.length || !action[0]) {\n\
\n\
            if (!recovering) {\n\
                // Report error\n\
                expected = [];\n\
                for (p in table[state]) if (this.terminals_[p] && p > 2) {\n\
                    expected.push(\"'\"+this.terminals_[p]+\"'\");\n\
                }\n\
                var errStr = '';\n\
                if (this.lexer.showPosition) {\n\
                    errStr = 'Parse error on line '+(yylineno+1)+\":\\n\
\"+this.lexer.showPosition()+\"\\n\
Expecting \"+expected.join(', ') + \", got '\" + this.terminals_[symbol]+ \"'\";\n\
                } else {\n\
                    errStr = 'Parse error on line '+(yylineno+1)+\": Unexpected \" +\n\
                                  (symbol == 1 /*EOF*/ ? \"end of input\" :\n\
                                              (\"'\"+(this.terminals_[symbol] || symbol)+\"'\"));\n\
                }\n\
                this.parseError(errStr,\n\
                    {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});\n\
            }\n\
\n\
            // just recovered from another error\n\
            if (recovering == 3) {\n\
                if (symbol == EOF) {\n\
                    throw new Error(errStr || 'Parsing halted.');\n\
                }\n\
\n\
                // discard current lookahead and grab another\n\
                yyleng = this.lexer.yyleng;\n\
                yytext = this.lexer.yytext;\n\
                yylineno = this.lexer.yylineno;\n\
                yyloc = this.lexer.yylloc;\n\
                symbol = lex();\n\
            }\n\
\n\
            // try to recover from error\n\
            while (1) {\n\
                // check for error recovery rule in this state\n\
                if ((TERROR.toString()) in table[state]) {\n\
                    break;\n\
                }\n\
                if (state == 0) {\n\
                    throw new Error(errStr || 'Parsing halted.');\n\
                }\n\
                popStack(1);\n\
                state = stack[stack.length-1];\n\
            }\n\
\n\
            preErrorSymbol = symbol; // save the lookahead token\n\
            symbol = TERROR;         // insert generic error symbol as new lookahead\n\
            state = stack[stack.length-1];\n\
            action = table[state] && table[state][TERROR];\n\
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error\n\
        }\n\
\n\
        // this shouldn't happen, unless resolve defaults are off\n\
        if (action[0] instanceof Array && action.length > 1) {\n\
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);\n\
        }\n\
\n\
        switch (action[0]) {\n\
\n\
            case 1: // shift\n\
                //this.shiftCount++;\n\
\n\
                stack.push(symbol);\n\
                vstack.push(this.lexer.yytext);\n\
                lstack.push(this.lexer.yylloc);\n\
                stack.push(action[1]); // push state\n\
                symbol = null;\n\
                if (!preErrorSymbol) { // normal execution/no error\n\
                    yyleng = this.lexer.yyleng;\n\
                    yytext = this.lexer.yytext;\n\
                    yylineno = this.lexer.yylineno;\n\
                    yyloc = this.lexer.yylloc;\n\
                    if (recovering > 0)\n\
                        recovering--;\n\
                } else { // error just occurred, resume old lookahead f/ before error\n\
                    symbol = preErrorSymbol;\n\
                    preErrorSymbol = null;\n\
                }\n\
                break;\n\
\n\
            case 2: // reduce\n\
                //this.reductionCount++;\n\
\n\
                len = this.productions_[action[1]][1];\n\
\n\
                // perform semantic action\n\
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1\n\
                // default location, uses first token for firsts, last for lasts\n\
                yyval._$ = {\n\
                    first_line: lstack[lstack.length-(len||1)].first_line,\n\
                    last_line: lstack[lstack.length-1].last_line,\n\
                    first_column: lstack[lstack.length-(len||1)].first_column,\n\
                    last_column: lstack[lstack.length-1].last_column\n\
                };\n\
                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);\n\
\n\
                if (typeof r !== 'undefined') {\n\
                    return r;\n\
                }\n\
\n\
                // pop off stack\n\
                if (len) {\n\
                    stack = stack.slice(0,-1*len*2);\n\
                    vstack = vstack.slice(0, -1*len);\n\
                    lstack = lstack.slice(0, -1*len);\n\
                }\n\
\n\
                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)\n\
                vstack.push(yyval.$);\n\
                lstack.push(yyval._$);\n\
                // goto new state = table[STATE][NONTERMINAL]\n\
                newState = table[stack[stack.length-2]][stack[stack.length-1]];\n\
                stack.push(newState);\n\
                break;\n\
\n\
            case 3: // accept\n\
                return true;\n\
        }\n\
\n\
    }\n\
\n\
    return true;\n\
}};/* Jison generated lexer */\n\
var lexer = (function(){\n\
\n\
var lexer = ({EOF:1,\n\
parseError:function parseError(str, hash) {\n\
        if (this.yy.parseError) {\n\
            this.yy.parseError(str, hash);\n\
        } else {\n\
            throw new Error(str);\n\
        }\n\
    },\n\
setInput:function (input) {\n\
        this._input = input;\n\
        this._more = this._less = this.done = false;\n\
        this.yylineno = this.yyleng = 0;\n\
        this.yytext = this.matched = this.match = '';\n\
        this.conditionStack = ['INITIAL'];\n\
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};\n\
        return this;\n\
    },\n\
input:function () {\n\
        var ch = this._input[0];\n\
        this.yytext+=ch;\n\
        this.yyleng++;\n\
        this.match+=ch;\n\
        this.matched+=ch;\n\
        var lines = ch.match(/\\n\
/);\n\
        if (lines) this.yylineno++;\n\
        this._input = this._input.slice(1);\n\
        return ch;\n\
    },\n\
unput:function (ch) {\n\
        this._input = ch + this._input;\n\
        return this;\n\
    },\n\
more:function () {\n\
        this._more = true;\n\
        return this;\n\
    },\n\
pastInput:function () {\n\
        var past = this.matched.substr(0, this.matched.length - this.match.length);\n\
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\\n\
/g, \"\");\n\
    },\n\
upcomingInput:function () {\n\
        var next = this.match;\n\
        if (next.length < 20) {\n\
            next += this._input.substr(0, 20-next.length);\n\
        }\n\
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\\n\
/g, \"\");\n\
    },\n\
showPosition:function () {\n\
        var pre = this.pastInput();\n\
        var c = new Array(pre.length + 1).join(\"-\");\n\
        return pre + this.upcomingInput() + \"\\n\
\" + c+\"^\";\n\
    },\n\
next:function () {\n\
        if (this.done) {\n\
            return this.EOF;\n\
        }\n\
        if (!this._input) this.done = true;\n\
\n\
        var token,\n\
            match,\n\
            col,\n\
            lines;\n\
        if (!this._more) {\n\
            this.yytext = '';\n\
            this.match = '';\n\
        }\n\
        var rules = this._currentRules();\n\
        for (var i=0;i < rules.length; i++) {\n\
            match = this._input.match(this.rules[rules[i]]);\n\
            if (match) {\n\
                lines = match[0].match(/\\n\
.*/g);\n\
                if (lines) this.yylineno += lines.length;\n\
                this.yylloc = {first_line: this.yylloc.last_line,\n\
                               last_line: this.yylineno+1,\n\
                               first_column: this.yylloc.last_column,\n\
                               last_column: lines ? lines[lines.length-1].length-1 : this.yylloc.last_column + match[0].length}\n\
                this.yytext += match[0];\n\
                this.match += match[0];\n\
                this.matches = match;\n\
                this.yyleng = this.yytext.length;\n\
                this._more = false;\n\
                this._input = this._input.slice(match[0].length);\n\
                this.matched += match[0];\n\
                token = this.performAction.call(this, this.yy, this, rules[i],this.conditionStack[this.conditionStack.length-1]);\n\
                if (token) return token;\n\
                else return;\n\
            }\n\
        }\n\
        if (this._input === \"\") {\n\
            return this.EOF;\n\
        } else {\n\
            this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\\n\
'+this.showPosition(),\n\
                    {text: \"\", token: null, line: this.yylineno});\n\
        }\n\
    },\n\
lex:function lex() {\n\
        var r = this.next();\n\
        if (typeof r !== 'undefined') {\n\
            return r;\n\
        } else {\n\
            return this.lex();\n\
        }\n\
    },\n\
begin:function begin(condition) {\n\
        this.conditionStack.push(condition);\n\
    },\n\
popState:function popState() {\n\
        return this.conditionStack.pop();\n\
    },\n\
_currentRules:function _currentRules() {\n\
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;\n\
    },\n\
topState:function () {\n\
        return this.conditionStack[this.conditionStack.length-2];\n\
    },\n\
pushState:function begin(condition) {\n\
        this.begin(condition);\n\
    }});\n\
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {\n\
\n\
var YYSTATE=YY_START;\n\
switch($avoiding_name_collisions) {\n\
case 0:/* skip whitespace */\n\
break;\n\
case 1:return 20\n\
break;\n\
case 2:return 19\n\
break;\n\
case 3:return 8\n\
break;\n\
case 4:return 9\n\
break;\n\
case 5:return 6\n\
break;\n\
case 6:return 7\n\
break;\n\
case 7:return 11\n\
break;\n\
case 8:return 13\n\
break;\n\
case 9:return 10\n\
break;\n\
case 10:return 12\n\
break;\n\
case 11:return 14\n\
break;\n\
case 12:return 15\n\
break;\n\
case 13:return 16\n\
break;\n\
case 14:return 17\n\
break;\n\
case 15:return 18\n\
break;\n\
case 16:return 5\n\
break;\n\
case 17:return 'INVALID'\n\
break;\n\
}\n\
};\n\
lexer.rules = [/^\\s+/,/^[0-9]+(\\.[0-9]+)?\\b/,/^n\\b/,/^\\|\\|/,/^&&/,/^\\?/,/^:/,/^<=/,/^>=/,/^</,/^>/,/^!=/,/^==/,/^%/,/^\\(/,/^\\)/,/^$/,/^./];\n\
lexer.conditions = {\"INITIAL\":{\"rules\":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],\"inclusive\":true}};return lexer;})()\n\
parser.lexer = lexer;\n\
return parser;\n\
})();\n\
// End parser\n\
\n\
  // Handle node, amd, and global systems\n\
  if (typeof exports !== 'undefined') {\n\
    if (typeof module !== 'undefined' && module.exports) {\n\
      exports = module.exports = Jed;\n\
    }\n\
    exports.Jed = Jed;\n\
  }\n\
  else {\n\
    if (typeof define === 'function' && define.amd) {\n\
      define('jed', function() {\n\
        return Jed;\n\
      });\n\
    }\n\
    // Leak a global regardless of module system\n\
    root['Jed'] = Jed;\n\
  }\n\
\n\
})(this);\n\
\n\
//# sourceURL=local/jed/jed-1.1.0.js"
));

require.modules["jed"] = require.modules["./local/jed"];


require.register("otpjs/lib/bike-triangle-control.js", Function("exports, module",
"var Backbone = window.Backbone\n\
var Raphael = window.Raphael\n\
\n\
var locale = require('otpjs/lib/localization.js')\n\
\n\
var BikeTriangleControl = Backbone.View.extend({\n\
  cursor_size: 19,\n\
  barWidth: 0,\n\
  tri_size: 0,\n\
\n\
  trianglequickFactor: null,\n\
  triangleflatFactor: null,\n\
  trianglesafeFactor: null,\n\
\n\
  // default is even mixture\n\
  quickFactor: 0.333,\n\
  flatFactor: 0.333,\n\
  safeFactor: 0.334,\n\
\n\
  onChanged: null,\n\
\n\
  quickBar: null,\n\
  flatBar: null,\n\
  safeBar: null,\n\
\n\
  quickLabel: null,\n\
  flatLabel: null,\n\
  safeLabel: null,\n\
\n\
  cursorVert: null,\n\
  cursorHoriz: null,\n\
  cursor: null,\n\
\n\
  // TRANSLATORS: Optimization for bicycle shown in bike triangle. Optimized for speed\n\
  quickName: locale.gettext('Quick'),\n\
  // TRANSLATORS: Optimization for bicycle shown in bike triangle. Optimized for flat terrain\n\
  flatName: locale.gettext('Flat'),\n\
  // TRANSLATORS: Optimization for bicycle shown in bike triangle. Optimized for bike friendly infrastructure. Cycle roads etc...\n\
  safeName: locale.gettext('Bike Friendly'),\n\
\n\
  initialize: function (options) {\n\
    this.options = options || {}\n\
  },\n\
\n\
  render: function () {\n\
    var self = this\n\
\n\
    var width = this.$el.width()\n\
    var height = this.$el.height()\n\
    var tri_side = 2 * (height - this.cursor_size) * 1 / Math.sqrt(3)\n\
    this.tri_side = tri_side\n\
    var margin = this.cursor_size / 2\n\
\n\
    // console.log()\n\
    var canvas = Raphael(this.$el.attr('id'), width, height)\n\
\n\
    canvas.rect(0, 0, width, height).attr({\n\
      stroke: 'none',\n\
      fill: 'none'\n\
    })\n\
\n\
    var triangle = canvas.path(['M', margin + tri_side / 2, margin, 'L',\n\
      margin + tri_side, height - margin, 'L', margin, height - margin,\n\
      'z'\n\
    ])\n\
\n\
    triangle.attr({\n\
      fill: '#fff',\n\
      stroke: '#aaa'\n\
    })\n\
\n\
    var labelSize = '18px'\n\
\n\
    var safeFill = '#bbe070'\n\
    var safeFill2 = '#77b300'\n\
    // TRANSLATORS: first letter of Bike Friendly\n\
    var safeSym = locale.gettext('B')\n\
\n\
    var flatFill = '#8cc4ff'\n\
    var flatFill2 = '#61a7f2'\n\
    // TRANSLATORS: first letter of Flat\n\
    var flatSym = locale.gettext('F')\n\
\n\
    var quickFill = '#ffb2b2'\n\
    var quickFill2 = '#f27979'\n\
    // TRANSLATORS: first letter of Quick\n\
    var quickSym = locale.gettext('Q')\n\
\n\
    var labelT = canvas.text(margin + tri_side / 2, margin + 24, quickSym)\n\
    labelT.attr({\n\
      fill: quickFill2,\n\
      'font-size': labelSize,\n\
      'font-weight': 'bold'\n\
    })\n\
\n\
    var labelH = canvas.text(margin + 22, height - margin - 14, flatSym)\n\
    labelH.attr({\n\
      fill: flatFill2,\n\
      'font-size': labelSize,\n\
      'font-weight': 'bold'\n\
    })\n\
\n\
    var labelS = canvas.text(margin + tri_side - 22, height - margin - 14,\n\
      safeSym)\n\
    labelS.attr({\n\
      fill: safeFill2,\n\
      'font-size': labelSize,\n\
      'font-weight': 'bold'\n\
    })\n\
\n\
    var barLeft = margin * 2 + tri_side\n\
    this.barWidth = width - margin * 3 - tri_side\n\
    var barWidth = this.barWidth\n\
    var barHeight = (height - margin * 4) / 3\n\
\n\
    this.quickBar = canvas.rect(barLeft, margin, barWidth * 0.333, barHeight)\n\
    this.quickBar.attr({\n\
      fill: quickFill,\n\
      stroke: 'none'\n\
    })\n\
\n\
    this.flatBar = canvas.rect(barLeft, margin * 2 + barHeight, barWidth * 0.333, barHeight)\n\
    this.flatBar.attr({\n\
      fill: flatFill,\n\
      stroke: 'none'\n\
    })\n\
\n\
    this.safeBar = canvas.rect(barLeft, margin * 3 + barHeight * 2, barWidth * 0.333, barHeight)\n\
    this.safeBar.attr({\n\
      fill: safeFill,\n\
      stroke: 'none'\n\
    })\n\
\n\
    this.quickLabel = canvas.text(barLeft + margin, margin + barHeight / 2, this.quickName + ': 33%')\n\
    this.quickLabel.attr({\n\
      'font-size': '13px',\n\
      'text-anchor': 'start',\n\
      opacity: 1\n\
    })\n\
\n\
    this.flatLabel = canvas.text(barLeft + margin, margin * 2 + barHeight + barHeight / 2, this.flatName + ': 33%')\n\
    this.flatLabel.attr({\n\
      'font-size': '13px',\n\
      'text-anchor': 'start',\n\
      opacity: 1\n\
    })\n\
\n\
    this.safeLabel = canvas.text(barLeft + margin, margin * 3 + barHeight * 2 + barHeight / 2, this.safeName + ': 33%')\n\
    this.safeLabel.attr({\n\
      'font-size': '13px',\n\
      'text-anchor': 'start',\n\
      opacity: 1\n\
    })\n\
\n\
    var cx = margin + tri_side / 2\n\
    var cy = height - margin - (1 / Math.sqrt(3)) * (tri_side / 2)\n\
    this.cursorVert = canvas.rect(cx - 0.5, cy - this.cursor_size / 2 - 2, 1, this.cursor_size + 4).attr({\n\
      fill: 'rgb(0,0,0)',\n\
      stroke: 'none'\n\
    })\n\
    this.cursorHoriz = canvas.rect(cx - this.cursor_size / 2 - 2, cy - 0.5, this.cursor_size + 4, 1).attr({\n\
      fill: 'rgb(0,0,0)',\n\
      stroke: 'none'\n\
    })\n\
    this.cursor = canvas.circle(cx, cy, this.cursor_size / 2).attr({\n\
      fill: 'rgb(128,128,128)',\n\
      stroke: 'none',\n\
      opacity: 0.25\n\
    })\n\
\n\
    var time, topo, safety\n\
\n\
    var animTime = 250\n\
    var start = function () {\n\
      // storing original coordinates\n\
      this.ox = this.attr('cx')\n\
      this.oy = this.attr('cy')\n\
      self.quickBar.animate({\n\
        opacity: 0.25\n\
      }, animTime)\n\
      self.flatBar.animateWith(self.quickBar, {\n\
        opacity: 0.25\n\
      }, animTime)\n\
      self.safeBar.animateWith(self.quickBar, {\n\
        opacity: 0.25\n\
      }, animTime)\n\
    }\n\
\n\
    var move = function (dx, dy) {\n\
      // move will be called with dx and dy\n\
      var nx = this.ox + dx\n\
      var ny = this.oy + dy\n\
      if (ny > height - margin) ny = height - margin\n\
      if (ny < margin) ny = margin\n\
      var offset = (ny - margin) / (height - margin * 2) * tri_side / 2\n\
      if (nx < margin + (tri_side / 2) - offset) {\n\
        nx = margin + (tri_side / 2) - offset\n\
      }\n\
      if (nx > margin + (tri_side / 2) + offset) {\n\
        nx = margin + (tri_side / 2) + offset\n\
      }\n\
\n\
      time = ((height - 2 * margin) - (ny - margin)) / (height - 2 * margin)\n\
      topo = self.distToSegment(nx, ny, margin + tri_side / 2, margin, margin + tri_side, height - margin) / (height - 2 * margin)\n\
      safety = 1 - time - topo\n\
\n\
      self.quickBar.attr({\n\
        width: barWidth * time\n\
      })\n\
      self.flatBar.attr({\n\
        width: barWidth * topo\n\
      })\n\
      self.safeBar.attr({\n\
        width: barWidth * safety\n\
      })\n\
      self.quickLabel.attr('text', self.quickName + ': ' + Math.round(time * 100) + '%')\n\
      self.flatLabel.attr('text', self.flatName + ': ' + Math.round(topo * 100) + '%')\n\
      self.safeLabel.attr('text', self.safeName + ': ' + Math.round(safety * 100) + '%')\n\
\n\
      self.moveCursor(nx, ny)\n\
    }\n\
    var up = function () {\n\
      // restoring state\n\
      self.quickBar.animate({\n\
        opacity: 1\n\
      }, animTime)\n\
      self.flatBar.animateWith(self.quickBar, {\n\
        opacity: 1\n\
      }, animTime)\n\
      self.safeBar.animateWith(self.quickBar, {\n\
        opacity: 1\n\
      }, animTime)\n\
\n\
      // was seeing really odd small numbers in scientific notation when topo neared zero so added this\n\
      if (topo < 0.005) {\n\
        topo = 0.0\n\
      }\n\
\n\
      self.quickFactor = time\n\
      self.flatFactor = topo\n\
      self.safeFactor = safety\n\
\n\
      self.updateModel()\n\
\n\
      if (self.onChanged && typeof self.onChanged === 'function') {\n\
        self.onChanged()\n\
      }\n\
    }\n\
\n\
    this.cursor.drag(move, start, up)\n\
    this.cursor.mouseover(function () {\n\
      this.animate({\n\
        opacity: 0.5\n\
      }, animTime)\n\
    })\n\
    this.cursor.mouseout(function () {\n\
      this.animate({\n\
        opacity: 0.25\n\
      }, animTime)\n\
    })\n\
    this.rendered = true\n\
  },\n\
\n\
  updateModel: function () {\n\
    this.model.set({\n\
      'triangleSafetyFactor': this.safeFactor,\n\
      'triangleSlopeFactor': this.quickFactor,\n\
      'triangleTimeFactor': this.flatFactor,\n\
      'optimize': 'TRIANGLE'\n\
    })\n\
  },\n\
\n\
  moveCursor: function (x, y) {\n\
    this.cursor.attr({\n\
      cx: x,\n\
      cy: y\n\
    })\n\
    this.cursorVert.attr({\n\
      x: x - 0.5,\n\
      y: y - this.cursor_size / 2 - 2\n\
    })\n\
    this.cursorHoriz.attr({\n\
      x: x - this.cursor_size / 2 - 2,\n\
      y: y - 0.5\n\
    })\n\
  },\n\
\n\
  enable: function () {\n\
    /* if (this.container.findById('trip-bike-triangle') === null) {\n\
      this.container.add(this.panel)\n\
    }\n\
    this.panel.show()\n\
    this.container.doLayout()*/\n\
  },\n\
\n\
  disable: function () {\n\
    if (!this.panel.hidden) {\n\
      this.panel.hide()\n\
    }\n\
  },\n\
\n\
  distance: function (x1, y1, x2, y2) {\n\
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))\n\
  },\n\
\n\
  distToSegment: function (px, py, x1, y1, x2, y2) {\n\
    var r, dx, dy\n\
    dx = x2 - x1\n\
    dy = y2 - y1\n\
    r = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)\n\
    return this.distance(px, py, (1 - r) * x1 + r * x2, (1 - r) * y1 + r * y2)\n\
  },\n\
\n\
  setValues: function (quick, flat, safe) {\n\
    this.quickFactor = quick\n\
    this.flatFactor = flat\n\
    this.safeFactor = safe\n\
\n\
    this.quickBar.attr({\n\
      width: this.barWidth * quick\n\
    })\n\
    this.flatBar.attr({\n\
      width: this.barWidth * flat\n\
    })\n\
    this.safeBar.attr({\n\
      width: this.barWidth * safe\n\
    })\n\
    this.quickLabel.attr('text', this.quickName + ': ' + Math.round(quick * 100) + '%')\n\
    this.flatLabel.attr('text', this.flatName + ': ' + Math.round(flat * 100) + '%')\n\
    this.safeLabel.attr('text', this.safeName + ': ' + Math.round(safe * 100) + '%')\n\
\n\
    var margin = this.cursor_size / 2\n\
\n\
    var x = margin + this.tri_side / 2\n\
    var y = margin + this.tri_side / Math.sqrt(3)\n\
\n\
    var qx = 0\n\
    var qy = -this.tri_side / Math.sqrt(3)\n\
    var fx = -this.tri_side / 2\n\
    var fy = (this.tri_side / 2) / Math.sqrt(3)\n\
    var sx = this.tri_side / 2\n\
    var sy = (this.tri_side / 2) / Math.sqrt(3)\n\
\n\
    x = x + quick * qx + flat * fx + safe * sx\n\
    y = y + quick * qy + flat * fy + safe * sy\n\
\n\
    this.moveCursor(x, y)\n\
  }\n\
})\n\
\n\
module.exports = BikeTriangleControl\n\
\n\
//# sourceURL=lib/bike-triangle-control.js"
));

require.register("otpjs/lib/geocoder.js", Function("exports, module",
"var $ = window.$\n\
\n\
var EsriGeocoder = {\n\
  reverse: function (place, callback) {\n\
    // esri takes lon/lat\n\
    var parts = place.split(',')\n\
    var lonlat = parts[1] + ',' + parts[0]\n\
\n\
    $.ajax({\n\
      url: window.OTP_config.esriApi + 'reverseGeocode?location=' +\n\
        encodeURIComponent(lonlat) + '&f=json',\n\
      type: 'GET',\n\
      dataType: 'jsonp',\n\
      error: callback,\n\
      success: function (res) {\n\
        if (!res.address) {\n\
          return callback('No address found for ' + lonlat, {\n\
            text: 'No address found for location',\n\
            id: place\n\
          })\n\
        }\n\
\n\
        var address = res.address\n\
        var location = res.location\n\
        callback(null, {\n\
          address: address.Address,\n\
          city: address.City,\n\
          state: address.Region,\n\
          id: location.y + ',' + location.x\n\
        })\n\
      }\n\
    })\n\
  },\n\
\n\
  lookup: function (query, callback) {\n\
    if (!query.length) return callback()\n\
\n\
    $.ajax({\n\
      url: window.OTP_config.esriApi + 'suggest?text=' + encodeURIComponent(\n\
          query) + '&outFields=City,Region&f=json&location=',\n\
      type: 'GET',\n\
      dataType: 'jsonp',\n\
      error: callback,\n\
      success: function (res) {\n\
        var data = []\n\
        for (var itemPos in res.locations.slice(0, 10)) {\n\
          var item = {\n\
            text: res.locations[itemPos].name.split(',')[0],\n\
            id: itemPos + 1\n\
          }\n\
\n\
          data.push(item)\n\
        }\n\
\n\
        callback(data)\n\
      }\n\
    })\n\
  }\n\
\n\
}\n\
\n\
var SimplecoderGeocoder = {\n\
  lookup: function (query, callback) {\n\
    if (!query.length) return callback()\n\
\n\
    $.ajax({\n\
      url: '',\n\
      type: 'GET',\n\
      dataType: 'jsonp',\n\
\n\
      error: function () {\n\
        callback()\n\
      },\n\
      success: function (res) {\n\
        var data = []\n\
        for (var item in res.slice(0, 10)) {\n\
          var itemData = {}\n\
          itemData.id = res[item].lat + ',' + res[item].lon\n\
          itemData.text = res[item].address\n\
          data.push(itemData)\n\
        }\n\
\n\
        callback(data)\n\
      }\n\
\n\
    })\n\
  },\n\
\n\
  reverse: function (place, error, success) {\n\
    $.ajax({\n\
      url: window.OTP_config.simplecoderApi + '/r/' + encodeURIComponent(\n\
          place),\n\
      type: 'GET',\n\
      error: function () {\n\
        error()\n\
      },\n\
      success: function (res) {\n\
        res.latlon = res.lat + ',' + res.lon\n\
      }\n\
    })\n\
  }\n\
}\n\
\n\
module.exports = {\n\
  EsriGeocoder: EsriGeocoder,\n\
  lookup: EsriGeocoder.lookup,\n\
  reverse: EsriGeocoder.reverse,\n\
  SimplecoderGeocoder: SimplecoderGeocoder\n\
}\n\
\n\
//# sourceURL=lib/geocoder.js"
));

require.register("otpjs/lib/helpers.js", Function("exports, module",
"var Handlebars = require('components~handlebars.js@v3.0.3')\n\
\n\
var utils = require('otpjs/lib/utils.js')\n\
\n\
Handlebars.registerHelper('formatTime', function (time, offset, options) {\n\
  if (time) {\n\
    return utils.formatTime(time, options.hash.format, offset)\n\
  } else {\n\
    return ''\n\
  }\n\
})\n\
\n\
Handlebars.registerHelper('formatDuration', function (duration) {\n\
  if (duration) {\n\
    return utils.secToHrMin(duration)\n\
  } else {\n\
    return ''\n\
  }\n\
})\n\
\n\
//# sourceURL=lib/helpers.js"
));

require.register("otpjs", Function("exports, module",
"require('./local/leaflet.label') // load leaflet.label\n\
require('otpjs/lib/helpers.js') // register handlebars helpers\n\
module.exports.localization = require('otpjs/lib/localization.js') // register localization\n\
\n\
module.exports.BikeTriangleControl = require('otpjs/lib/bike-triangle-control.js')\n\
module.exports.Itineraries = require('otpjs/lib/itineraries.js')\n\
module.exports.ItineraryLeg = require('otpjs/lib/itinerary-leg.js')\n\
module.exports.ItineraryLegs = require('otpjs/lib/itinerary-legs.js')\n\
module.exports.ItineraryMapView = require('otpjs/lib/itinerary-map-view.js')\n\
module.exports.ItineraryNarrativeView = require('otpjs/lib/itinerary-narrative-view.js')\n\
module.exports.ItineraryStop = require('otpjs/lib/itinerary-stop.js')\n\
module.exports.ItineraryTopoView = require('otpjs/lib/itinerary-topo-view.js')\n\
module.exports.ItineraryWalkStep = require('otpjs/lib/itinerary-walk-step.js')\n\
module.exports.ItineraryWalkSteps = require('otpjs/lib/itinerary-walk-steps.js')\n\
module.exports.Itinerary = require('otpjs/lib/itinerary.js')\n\
module.exports.LeafletTopoGraphControl = require('otpjs/lib/leaflet-topo-graph-control.js')\n\
module.exports.LegNarrativeView = require('otpjs/lib/leg-narrative-view.js')\n\
module.exports.log = require('otpjs/lib/log.js')\n\
module.exports.PlanRequest = require('otpjs/lib/plan-request.js')\n\
module.exports.PlanResponseView = require('otpjs/lib/plan-response-view.js')\n\
module.exports.PlanResponse = require('otpjs/lib/plan-response.js')\n\
module.exports.RequestForm = require('otpjs/lib/request-form.js')\n\
module.exports.RequestMapView = require('otpjs/lib/request-map-view.js')\n\
module.exports.Stop = require('otpjs/lib/stop.js')\n\
module.exports.StopsInRectangleRequest = require('otpjs/lib/stops-in-rectangle-request.js')\n\
module.exports.StopsRequestMapView = require('otpjs/lib/stops-request-map-view.js')\n\
module.exports.StopsResponseMapView = require('otpjs/lib/stops-response-map-view.js')\n\
module.exports.StopsResponse = require('otpjs/lib/stops-response.js')\n\
module.exports.Stops = require('otpjs/lib/stops.js')\n\
module.exports.utils = require('otpjs/lib/utils.js')\n\
\n\
//# sourceURL=lib/index.js"
));

require.register("otpjs/lib/itineraries.js", Function("exports, module",
"var Itinerary = require('otpjs/lib/itinerary.js')\n\
\n\
var Backbone = window.Backbone\n\
\n\
var Itineraries = Backbone.Collection.extend({\n\
  model: Itinerary,\n\
\n\
  initialize: function () {\n\
    var self = this\n\
\n\
    // for any itin added to this collection..\n\
    this.on('add', function (itin) {\n\
      self.handleActivate(itin)\n\
    })\n\
  },\n\
\n\
  handleActivate: function (itin) {\n\
    var self = this\n\
    this.listenTo(itin, 'activate', function () {\n\
      if (self.activeItinerary && itin !== self.activeItinerary) {\n\
        self.activeItinerary.trigger('deactivate')\n\
      }\n\
\n\
      self.activeItinerary = itin\n\
    })\n\
  }\n\
})\n\
\n\
module.exports = Itineraries\n\
\n\
//# sourceURL=lib/itineraries.js"
));

require.register("otpjs/lib/itinerary-leg.js", Function("exports, module",
"var ItineraryWalkSteps = require('otpjs/lib/itinerary-walk-steps.js')\n\
\n\
var Backbone = window.Backbone\n\
var $ = window.$\n\
\n\
var OTPURL = window.OTP_config.otpApi + window.OTP_config.routerId\n\
\n\
var ItineraryLeg = Backbone.Model.extend({\n\
  initialize: function () {\n\
    this.set('steps', new ItineraryWalkSteps(this.get('steps')))\n\
  },\n\
\n\
  defaults: {\n\
    mode: null,\n\
    route: null,\n\
    agencyName: null,\n\
    agencyUrl: null,\n\
    agencyTimeZoneOffset: null,\n\
    routeColor: null,\n\
    routeType: null,\n\
    routeId: null,\n\
    routeTextColor: null,\n\
    interlineWithPreviousLeg: null,\n\
    tripShortName: null,\n\
    headsign: null,\n\
    agencyId: null,\n\
    tripId: null,\n\
    routeShortName: null,\n\
    routeLongName: null,\n\
    boardRule: null,\n\
    alightRule: null,\n\
    rentedBike: null,\n\
\n\
    startTime: null,\n\
    endTime: null,\n\
    distance: null,\n\
\n\
    toStop: null,\n\
    fromStop: null,\n\
\n\
    legGeometry: null,\n\
\n\
    intermediateStops: [],\n\
\n\
    steps: [],\n\
\n\
    notes: [],\n\
\n\
    alerts: []\n\
  },\n\
\n\
  isTransit: function (mode) {\n\
    mode = mode || this.get('mode')\n\
    return mode === 'TRANSIT' || mode === 'SUBWAY' || mode === 'FERRY' || mode === 'RAIL' ||\n\
      mode === 'BUS' || mode === 'TRAM' || mode === 'GONDOLA' || mode ===\n\
      'TRAINISH' || mode === 'BUSISH'\n\
  },\n\
\n\
  isWalk: function (mode) {\n\
    mode = mode || this.get('mode')\n\
    return mode === 'WALK'\n\
  },\n\
\n\
  isBicycle: function (mode) {\n\
    mode = mode || this.get('mode')\n\
    return mode === 'BICYCLE'\n\
  },\n\
\n\
  isCar: function (mode) {\n\
    mode = mode || this.get('mode')\n\
    return mode === 'CAR'\n\
  },\n\
\n\
  getMapColor: function (mode) {\n\
    mode = mode || this.get('mode')\n\
    if (mode === 'WALK') return '#444'\n\
    if (mode === 'BICYCLE') return '#0073e5'\n\
    if (mode === 'SUBWAY') return '#f00'\n\
    if (mode === 'RAIL') return '#b00'\n\
    if (mode === 'BUS') return '#080'\n\
    if (mode === 'TRAM') return '#800'\n\
    if (mode === 'FERRY') return '#008'\n\
    if (mode === 'CAR') return '#444'\n\
    return '#aaa'\n\
  },\n\
\n\
  getStopTimes: function (callback) {\n\
    console.log(this.toJSON())\n\
  },\n\
\n\
  getSurroundingStopTimes: function (callback) {\n\
    var from = this.get('from')\n\
    var serviceDate = this.get('serviceDate')\n\
    var qs = OTPURL + '/index/stops/' + from.stopId + '/stoptimes/' + serviceDate\n\
    $.get(qs, callback)\n\
  }\n\
})\n\
\n\
module.exports = ItineraryLeg\n\
\n\
//# sourceURL=lib/itinerary-leg.js"
));

require.register("otpjs/lib/itinerary-legs.js", Function("exports, module",
"var ItineraryLeg = require('otpjs/lib/itinerary-leg.js')\n\
\n\
var Backbone = window.Backbone\n\
\n\
var ItineraryLegs = Backbone.Collection.extend({\n\
  model: ItineraryLeg\n\
})\n\
\n\
module.exports = ItineraryLegs\n\
\n\
//# sourceURL=lib/itinerary-legs.js"
));

require.register("otpjs/lib/itinerary-map-view.js", Function("exports, module",
"var log = require('otpjs/lib/log.js')('itinerary-map-view')\n\
var utils = require('otpjs/lib/utils.js')\n\
\n\
var Backbone = window.Backbone\n\
var L = window.L\n\
\n\
var ItineraryMapView = Backbone.View.extend({\n\
  initialize: function (options) {\n\
    var self = this\n\
\n\
    this.options = options || {}\n\
\n\
    this.attachedToMap = false\n\
    this.pathLayer = new L.LayerGroup()\n\
    this.pathMarkerLayer = new L.LayerGroup()\n\
    this.highlightLayer = new L.LayerGroup()\n\
\n\
    this.listenTo(this.model, 'activate', function () {\n\
      self.preview = false\n\
      self.render()\n\
    })\n\
\n\
    this.listenTo(this.model, 'mouseenter', function () {\n\
      self.preview = true\n\
      self.render()\n\
    })\n\
\n\
    this.listenTo(this.model, 'deactivate', function () {\n\
      self.clearLayers()\n\
    })\n\
\n\
    this.listenTo(this.model, 'mouseleave', function () {\n\
      self.clearLayers()\n\
    })\n\
\n\
    this.model.get('legs').each(function (leg) {\n\
      self.initializeLeg(leg)\n\
    })\n\
  },\n\
\n\
  initializeLeg: function (leg) {\n\
    var self = this\n\
\n\
    this.listenTo(leg, 'mouseenter', function () {\n\
      self.highlightLeg = leg\n\
      self.render()\n\
    })\n\
\n\
    this.listenTo(leg, 'mouseleave', function () {\n\
      self.highlightLeg = null\n\
      self.render()\n\
    })\n\
\n\
    this.listenTo(leg, 'fromclick', function () {\n\
      var from = leg.get('from')\n\
      self.options.map.panTo([from.lat, from.lon])\n\
    })\n\
\n\
    this.listenTo(leg, 'toclick', function () {\n\
      var to = leg.get('to')\n\
      self.options.map.panTo([to.lat, to.lon])\n\
    })\n\
\n\
    var steps = leg.get('steps')\n\
    if (!steps || !steps.length) return\n\
\n\
    steps.forEach(function (step) {\n\
      self.initializeStep(step)\n\
    })\n\
  },\n\
\n\
  initializeStep: function (step) {\n\
    var self = this\n\
    this.listenTo(step, 'click', function () {\n\
      self.options.map.panTo([step.get('lat'), step.get('lon')])\n\
    })\n\
\n\
    this.listenTo(step, 'mouseleave', function () {\n\
      self.options.map.closePopup()\n\
    })\n\
  },\n\
\n\
  attachToMap: function () {\n\
    this.options.map.addLayer(this.highlightLayer)\n\
    this.options.map.addLayer(this.pathLayer)\n\
    this.options.map.addLayer(this.pathMarkerLayer)\n\
    this.attachedToMap = true\n\
  },\n\
\n\
  detachFromMap: function () {\n\
    this.options.map.removeLayer(this.highlightLayer)\n\
    this.options.map.removeLayer(this.pathLayer)\n\
    this.options.map.removeLayer(this.pathMarkerLayer)\n\
    this.attachedToMap = false\n\
  },\n\
\n\
  render: function () {\n\
    if (!this.attachedToMap) this.attachToMap()\n\
    this.clearLayers()\n\
\n\
    this.mapBounds = new L.LatLngBounds()\n\
\n\
    var self = this\n\
    this.model.get('legs').forEach(function (leg) {\n\
      self.renderLeg(leg)\n\
    })\n\
\n\
    this.options.map.fitBounds(this.mapBounds)\n\
  },\n\
\n\
  renderLeg: function (leg) {\n\
    var popupContent, minutes\n\
    var points = utils.decodePolyline(leg.get('legGeometry').points)\n\
    var weight = 8\n\
\n\
    // draw highlight, if applicable\n\
    if (this.highlightLeg === leg) {\n\
      var highlight = new L.Polyline(points)\n\
      highlight.setStyle({\n\
        color: '#ffff00',\n\
        weight: weight * 2,\n\
        opacity: this.preview ? 0.75 : 0.75\n\
      })\n\
      this.highlightLayer.addLayer(highlight)\n\
    }\n\
\n\
    // draw the polyline\n\
    var polyline = new L.Polyline(points)\n\
    polyline.setStyle({\n\
      color: this.options.legColor || leg.getMapColor(),\n\
      weight: weight,\n\
      opacity: this.preview ? 0.75 : 0.75\n\
    })\n\
    this.pathLayer.addLayer(polyline)\n\
    polyline.leg = leg\n\
\n\
    this.mapBounds.extend(polyline.getBounds())\n\
\n\
    if (leg.isWalk() || leg.isBicycle()) {\n\
      popupContent = '<div class=\"otp-legMode-icon otp-legMode-icon-' + leg.get('mode') + '\"></div> <div class=\"otp-legMode-icon otp-legMode-icon-arrow-right\"></div> ' + leg.get('to').name\n\
\n\
      popupContent += '<br/>'\n\
\n\
      minutes = utils.secToHrMin(leg.get('duration'))\n\
      popupContent += ' (' + minutes + ')'\n\
\n\
      var distance = utils.distanceString(leg.get('distance'), this.options\n\
        .metric)\n\
      popupContent += distance\n\
\n\
      polyline.bindLabel(popupContent)\n\
\n\
      for (var step in leg.get('steps').models) {\n\
        this.pathMarkerLayer.addLayer(this.getStepBubbleMarker(leg, leg.get(\n\
          'steps').models[step]))\n\
      }\n\
    } else if (leg.isTransit()) {\n\
      popupContent = '<div class=\"otp-legMode-icon otp-legMode-icon-' + leg\n\
          .get('mode') + '\"></div> '\n\
\n\
      if (leg.get('routeShortName')) {\n\
        popupContent += leg.get('routeShortName')\n\
      }\n\
\n\
      if (leg.get('routeLongName')) {\n\
        if (popupContent !== '') {\n\
          popupContent += ' '\n\
        }\n\
\n\
        popupContent += leg.get('routeLongName') + '<br/> '\n\
      }\n\
\n\
      popupContent += ' <div class=\"otp-legMode-icon otp-legMode-icon-arrow-right\"></div> ' + leg.get('to').name\n\
\n\
      minutes = utils.secToHrMin(leg.get('duration'))\n\
      popupContent += ' (' + minutes + ')'\n\
\n\
      polyline.bindLabel(popupContent)\n\
    }\n\
\n\
    var marker = this.getLegFromBubbleMarker(leg, this.highlightLeg === leg)\n\
    this.pathMarkerLayer.addLayer(marker)\n\
  },\n\
\n\
  getStepBubbleMarker: function (leg, step) {\n\
    var marker = new L.CircleMarker([step.get('lat'), step.get('lon')], {\n\
      color: '#666',\n\
      stroke: 3,\n\
      radius: 5,\n\
      fillColor: '#aaa',\n\
      opacity: 1.0,\n\
      fillOpacity: 1.0\n\
    })\n\
\n\
    if (step.get('relativeDirection')) {\n\
      var popupContent =\n\
      '<span class=\"otp-legStepLabel-icon otp-legStep-icon-' + step.get(\n\
          'relativeDirection') + '\"></span>' +\n\
        ' <div class=\"otp-legMode-icon otp-legMode-icon-' + leg.get('mode') +\n\
        '\"></div> ' + step.get('streetName')\n\
\n\
      popupContent += ' ('\n\
\n\
      var distance = utils.distanceString(step.get('distance'), this.options.metric)\n\
\n\
      popupContent += distance + ' )'\n\
\n\
      marker.bindLabel(popupContent)\n\
    }\n\
\n\
    return marker\n\
  },\n\
\n\
  getLegFromBubbleMarker: function (leg, highlight) {\n\
    var popupContent =\n\
    '<div class=\"otp-legMode-icon otp-legMode-icon-arrow-right\"></div>  <div class=\"otp-legMode-icon otp-legMode-icon-' +\n\
      leg.get('mode') + '\"></div> '\n\
\n\
    if (leg.get('routeShortName')) {\n\
      popupContent += leg.get('routeShortName')\n\
    }\n\
\n\
    if (leg.get('routeLongName')) {\n\
      if (popupContent !== '') {\n\
        popupContent += ' '\n\
      }\n\
\n\
      popupContent += leg.get('routeLongName')\n\
    }\n\
\n\
    popupContent += ' ' + utils.formatTime(leg.get('startTime'), null, this.options.planView.model.getTimeOffset()) + ' '\n\
\n\
    var marker = new L.CircleMarker([leg.get('from').lat, leg.get('from').lon], {\n\
      color: '#000',\n\
      stroke: 10,\n\
      radius: 5,\n\
      fillColor: '#fff',\n\
      opacity: 1.0,\n\
      fillOpacity: 1.0\n\
    })\n\
\n\
    marker.bindLabel(popupContent)\n\
\n\
    return marker\n\
  },\n\
\n\
  getLegBubbleAnchor: function (quadrant) {\n\
    if (quadrant === 'nw') return [32, 44]\n\
    if (quadrant === 'ne') return [0, 44]\n\
    if (quadrant === 'sw') return [32, 0]\n\
    if (quadrant === 'se') return [0, 0]\n\
  },\n\
\n\
  clearLayers: function () {\n\
    log('clearing itinerary layers')\n\
\n\
    this.pathLayer.clearLayers()\n\
    this.pathMarkerLayer.clearLayers()\n\
    this.highlightLayer.clearLayers()\n\
  }\n\
})\n\
\n\
module.exports = ItineraryMapView\n\
\n\
//# sourceURL=lib/itinerary-map-view.js"
));

require.register("otpjs/lib/itinerary-narrative-view.js", Function("exports, module",
"var Handlebars = require('components~handlebars.js@v3.0.3')\n\
\n\
var LegNarrativeView = require('otpjs/lib/leg-narrative-view.js')\n\
\n\
var itinNarrativeTemplate = Handlebars.compile(require('otpjs/lib/templates/narrative-itinerary.html'))\n\
\n\
var Backbone = window.Backbone\n\
var _ = window._\n\
\n\
var ItineraryNarrativeView = Backbone.View.extend({\n\
  className: 'PlanResponseNarrativeView',\n\
\n\
  events: {\n\
    'click .otp-itinHeader': 'headerClicked',\n\
    'mouseenter .otp-itinHeader': 'headerMouseenter',\n\
    'mouseleave .otp-itinHeader': 'headerMouseleave',\n\
    'click .print': 'print'\n\
  },\n\
\n\
  initialize: function (options) {\n\
    this.options = options || {}\n\
\n\
    _.bindAll(this, 'headerClicked', 'headerMouseenter', 'headerMouseleave')\n\
\n\
    this.listenTo(this.model, 'activate', this.expand)\n\
    this.listenTo(this.model, 'deactivate', this.collapse)\n\
  },\n\
\n\
  print: function (e) {\n\
    e.preventDefault()\n\
    if (!this.isActive) this.model.trigger('activate')\n\
    if (this.legs) this.legs.forEach(function (leg) { leg.print() })\n\
\n\
    setTimeout(function () {\n\
      window.print()\n\
    }, 500)\n\
  },\n\
\n\
  render: function () {\n\
    var legs = this.model.get('legs')\n\
    var timeOffset = this.options.planView.model.getTimeOffset()\n\
    var duration = this.options.planView.options.showFullDuration ?\n\
      this.model.getFullDuration(this.options.planView.model.get('request'),\n\
        timeOffset) :\n\
      this.model.get('duration')\n\
\n\
    var context = _.clone(this.model.attributes)\n\
    context.index = this.options.index + 1\n\
    context.legs = legs.models\n\
    context.duration = duration\n\
    context.timeOffset = timeOffset\n\
    this.$el.html(itinNarrativeTemplate(context))\n\
\n\
    this.legs = []\n\
    _.each(legs.models, this.processLeg, this)\n\
\n\
    this.$el.find('.otp-itinBody').hide()\n\
  },\n\
\n\
  processLeg: function (leg) {\n\
    var legView = new LegNarrativeView({\n\
      itinView: this,\n\
      model: leg\n\
    })\n\
    legView.render()\n\
    this.legs.push(legView)\n\
    this.$el.find('.otp-itinBody').append(legView.el)\n\
  },\n\
\n\
  collapse: function () {\n\
    this.$el.find('.otp-itinBody').slideUp('fast')\n\
    this.$el.removeClass('activated')\n\
  },\n\
\n\
  expand: function () {\n\
    this.$el.find('.otp-itinBody').slideDown('fast')\n\
    this.$el.addClass('activated')\n\
  },\n\
\n\
  headerClicked: function (e) {\n\
    if (!this.isActive()) {\n\
      this.model.trigger('activate')\n\
    }\n\
  },\n\
\n\
  headerMouseenter: function (e) {\n\
    if (!this.isActive()) {\n\
      this.model.trigger('mouseenter')\n\
\n\
      // clear the active itinerary while this one is being previewed\n\
      var active = this.options.planView.model.get('itineraries').activeItinerary\n\
      if (active) active.trigger('mouseleave')\n\
    }\n\
  },\n\
\n\
  headerMouseleave: function (e) {\n\
    if (!this.isActive()) {\n\
      this.model.trigger('mouseleave')\n\
\n\
      // restore the active itinerary\n\
      var active = this.options.planView.model.get('itineraries').activeItinerary\n\
      if (active) active.trigger('mouseenter')\n\
    }\n\
  },\n\
\n\
  isActive: function () {\n\
    return this.options.planView.model.get('itineraries').activeItinerary ===\n\
      this.model\n\
  }\n\
})\n\
\n\
module.exports = ItineraryNarrativeView\n\
\n\
//# sourceURL=lib/itinerary-narrative-view.js"
));

require.register("otpjs/lib/itinerary-stop.js", Function("exports, module",
"var Backbone = window.Backbone\n\
\n\
var ItineraryStop = Backbone.Model.extend({\n\
  defaults: {\n\
    name: null,\n\
    stopId: null,\n\
    agencyId: null,\n\
    stopCode: null,\n\
    lat: null,\n\
    lon: null,\n\
    arrival: null,\n\
    departure: null\n\
  }\n\
})\n\
\n\
module.exports = ItineraryStop\n\
\n\
//# sourceURL=lib/itinerary-stop.js"
));

require.register("otpjs/lib/itinerary-topo-view.js", Function("exports, module",
"var utils = require('otpjs/lib/utils.js')\n\
\n\
var Backbone = window.Backbone\n\
var L = window.L\n\
var Raphael = window.Raphael\n\
var _ = window._\n\
var $ = window.$\n\
\n\
function getElevation (elevCoord) {\n\
  return elevCoord.second * 3.28084\n\
}\n\
\n\
var ItineraryTopoView = Backbone.View.extend({\n\
  initialize: function (options) {\n\
    this.options = options || {}\n\
    _.bindAll(this, 'refresh', 'mousemove', 'mouseleave', 'click')\n\
    this.refresh()\n\
\n\
    this.$el.resize(this.refresh)\n\
\n\
    this.listenTo(this.model, 'activate', this.render)\n\
    this.listenTo(this.model, 'deactivate', this.clear)\n\
  },\n\
\n\
  render: function () {\n\
    this.$el.empty()\n\
    this.$el.append(this._graph)\n\
  },\n\
\n\
  refresh: function () {\n\
    this.$el.css({\n\
      width: '100%',\n\
      height: '100%'\n\
    })\n\
    var w = this.$el.width()\n\
    var h = this.$el.height()\n\
    if (w === 0 || h === 0 || (w === this._renderedW && h === this._renderedH)) {\n\
      return\n\
    }\n\
    var legs = this.model.get('legs')\n\
\n\
    var elevInterval = 100\n\
    var axisWidth = 30\n\
    var graphHeight = h\n\
    var graphWidth = w - axisWidth\n\
\n\
    this._graph = $('<div>')\n\
\n\
    // apply mouse listeners for map interactivity, if map reference provided\n\
    if (this.options.map) {\n\
      this._graph.mousemove(this.mousemove)\n\
        .mouseleave(this.mouseleave)\n\
        .click(this.click)\n\
    }\n\
\n\
    var paper = Raphael(this._graph[0], w, h)\n\
\n\
    // initial pass through legs to calculate total distance covered, elevation range\n\
    var totalWalkBikeDist = 0\n\
    var minElev = 999999\n\
    var maxElev = -999999\n\
    _.each(legs.models, function (leg) {\n\
      if (leg.isWalk() || leg.isBicycle()) {\n\
        totalWalkBikeDist += leg.get('distance')\n\
        _.each(leg.get('steps').models, function (step, index) {\n\
          _.each(step.get('elevation'), function (elev, index) {\n\
            // console.log(elev.second)\n\
            minElev = Math.min(minElev, getElevation(elev))\n\
            maxElev = Math.max(maxElev, getElevation(elev))\n\
          }, this)\n\
        }, this)\n\
      }\n\
    }, this)\n\
\n\
    // expand the min/max elevation range to align with interval multiples\n\
    minElev = elevInterval * Math.floor(minElev / elevInterval)\n\
    maxElev = elevInterval * Math.ceil(maxElev / elevInterval)\n\
\n\
    for (var e = minElev; e <= maxElev; e += elevInterval) {\n\
      // console.log(e)\n\
      var y = graphHeight - (e - minElev) / (maxElev - minElev) *\n\
        graphHeight\n\
      if (e > minElev && e < maxElev) {\n\
        paper.rect(0, y, w, 1).attr({\n\
          'fill': '#bbb',\n\
          'stroke': null\n\
        })\n\
      }\n\
      if (e < maxElev) y -= 15\n\
\n\
      $('<div>').html(e + \"'\").css({\n\
        position: 'absolute',\n\
        top: y,\n\
        left: 0,\n\
        width: 25,\n\
        'text-align': 'right'\n\
      }).appendTo(this._graph[0])\n\
\n\
    }\n\
\n\
    var walkBikeDist = 0\n\
\n\
    this._legXCoords = [axisWidth]\n\
    this._legLatLngs = []\n\
    this._legDistances = []\n\
\n\
    _.each(legs.models, function (leg, index) {\n\
      if (leg.isWalk() || leg.isBicycle()) {\n\
        var legDistance = leg.get('distance')\n\
        var legDistanceCovered = 0\n\
        var graphArray = []\n\
\n\
        var latLngs = utils.decodePolyline(leg.get('legGeometry').points)\n\
        this._legLatLngs.push(latLngs)\n\
\n\
        var legDistDeg = 0\n\
        for (var i = 0; i < latLngs.length - 1; i++) {\n\
          var from = latLngs[i]\n\
          var to = latLngs[i + 1]\n\
          legDistDeg += Math.sqrt(Math.pow(to.lat - from.lat, 2) + Math.pow(to.lng - from.lng, 2))\n\
        }\n\
        this._legDistances.push(legDistDeg)\n\
\n\
        _.each(leg.get('steps').models, function (step, index) {\n\
          var stepDistance = step.get('distance')\n\
\n\
          var elevArray\n\
\n\
          // check for old style strings -- covert to array of pairs\n\
          if (_.isArray(step.get('elevation'))) {\n\
            elevArray = step.get('elevation')\n\
          } else {\n\
            var pairs = _([])\n\
            elevArray = _.reduce(step.get('elevation').split(','),\n\
              function (m, v) {\n\
                if (m.last() && m.last().size() === 1) {\n\
                  var p = m.last()\n\
                  p.push(v)\n\
                  m[m.length] = p\n\
                } else {\n\
                  m.push(_([v]))\n\
                }\n\
\n\
                return m\n\
              }, pairs)\n\
          }\n\
\n\
          elevArray.sort(function (a, b) {\n\
            if (a.first < b.first) return -1\n\
            if (a.first > b.first) return 1\n\
            return 0\n\
          })\n\
          _.each(elevArray, function (elev, index) {\n\
            // var d = legDistanceCovered + elev.first\n\
            var first = elev.first\n\
            var second = getElevation(elev)\n\
\n\
            // if x-coord exceeds step distance, truncate at step distance, interpolating y\n\
            if (first > stepDistance) {\n\
              if (index > 0) {\n\
                var prevElevCoord = elevArray[index - 1]\n\
                var dx = first - prevElevCoord.first\n\
                var dy = second - getElevation(prevElevCoord)\n\
\n\
                var pct = (stepDistance - prevElevCoord.first) / dx\n\
\n\
                first = stepDistance\n\
                second = getElevation(prevElevCoord) + pct * dy\n\
              } else return\n\
            }\n\
\n\
            var x = axisWidth + ((walkBikeDist + (legDistanceCovered +\n\
              first)) / totalWalkBikeDist) * graphWidth\n\
            var y = (1 - (second - minElev) / (maxElev - minElev)) *\n\
              graphHeight\n\
\n\
            graphArray.push([x, y])\n\
          }, this)\n\
          legDistanceCovered += step.get('distance')\n\
        }, this)\n\
\n\
        if (graphArray.length > 0) {\n\
          var pathStr = ''\n\
          _.each(graphArray, function (coord, index) {\n\
            if (index === 0) pathStr += 'M' + coord[0] + ' ' + coord[1]\n\
            else pathStr += ' L' + coord[0] + ' ' + coord[1]\n\
          })\n\
\n\
          var fillStr = pathStr + ' L' + graphArray[graphArray.length - 1][0] + ' ' + graphHeight\n\
          fillStr += ' L' + graphArray[0][0] + ' ' + graphHeight\n\
          path = paper.path(fillStr)\n\
          path.attr({\n\
            fill: '#aaa',\n\
            stroke: null,\n\
            opacity: 0.5\n\
          })\n\
\n\
          var path = paper.path(pathStr)\n\
          path.attr({\n\
            stroke: '#888',\n\
            'stroke-width': 3\n\
          })\n\
\n\
        }\n\
\n\
        walkBikeDist += legDistance\n\
        var t = walkBikeDist / totalWalkBikeDist\n\
        if (t < 1) {\n\
          var x = axisWidth + Math.round(t * graphWidth)\n\
          paper.rect(x, 0, 1, graphHeight).attr({\n\
            'fill': '#aaa',\n\
            'stroke': null\n\
          })\n\
          this._legXCoords.push(x)\n\
        }\n\
      }\n\
    }, this)\n\
\n\
    this._legXCoords.push(axisWidth + graphWidth)\n\
\n\
    this._renderedH = h\n\
    this._renderedW = w\n\
\n\
    if (this.options.planView.model.get('itineraries').activeItinerary ===\n\
      this.model) {\n\
      this.render()\n\
    }\n\
  },\n\
\n\
  mousemove: function (evt) {\n\
    if (!this._legXCoords || !this.options.map) return\n\
    var x = evt.offsetX\n\
\n\
    if (x === undefined) { // Firefox\n\
      x = evt.pageX - this._graph.offset().left\n\
    }\n\
\n\
    for (var i = 0; i < this._legXCoords.length - 1; i++) {\n\
      if (x >= this._legXCoords[i] && x < this._legXCoords[i + 1]) {\n\
        // create/update the vertical cursor in the topo graph:\n\
        if (!this._xCursor) {\n\
          this._xCursor = $('<div/>').css({\n\
            position: 'absolute',\n\
            left: x,\n\
            top: 0,\n\
            height: this._graph.height(),\n\
            width: 1,\n\
            background: 'black'\n\
          }).appendTo(this._graph)\n\
        } else {\n\
          this._xCursor.css({\n\
            left: x\n\
          })\n\
        }\n\
\n\
        // create/update the map marker\n\
        var t = (x - this._legXCoords[i]) / (this._legXCoords[i + 1] - this\n\
            ._legXCoords[i])\n\
        var d = t * this._legDistances[i]\n\
        var ll = this.pointAlongPath(this._legLatLngs[i], d)\n\
        if (!this._marker) {\n\
          this._marker = new L.Marker(ll, {\n\
            icon: new L.DivIcon({\n\
              className: 'otp-crosshairIcon',\n\
              iconSize: null,\n\
              iconAnchor: null\n\
            })\n\
          }).addTo(this.options.map)\n\
        } else {\n\
          this._marker.setLatLng(ll)\n\
        }\n\
        this._lastLatLng = ll\n\
      }\n\
    }\n\
  },\n\
\n\
  mouseleave: function (evt) {\n\
    if (this._xCursor) {\n\
      this._xCursor.remove()\n\
      this._xCursor = null\n\
    }\n\
    if (this._marker && this.options.map) {\n\
      this.options.map.removeLayer(this._marker)\n\
      this._marker = this._lastLatLng = null\n\
    }\n\
  },\n\
\n\
  click: function (evt) {\n\
    if (this._lastLatLng && this.options.map) {\n\
      this.options.map.panTo(this._lastLatLng)\n\
    }\n\
  },\n\
\n\
  pointAlongPath: function (latLngs, d) {\n\
    if (d <= 0) return latLngs[0]\n\
    for (var i = 0; i < latLngs.length - 1; i++) {\n\
      var from = latLngs[i]\n\
      var to = latLngs[i + 1]\n\
      var segLen = Math.sqrt(Math.pow(to.lat - from.lat, 2) + Math.pow(to.lng -\n\
          from.lng, 2))\n\
      if (d <= segLen) { // this segment contains the point at distance d\n\
        var lat = latLngs[i].lat + (d / segLen * (latLngs[i + 1].lat -\n\
          latLngs[i].lat))\n\
        var lng = latLngs[i].lng + (d / segLen * (latLngs[i + 1].lng -\n\
          latLngs[i].lng))\n\
        return new L.LatLng(lat, lng)\n\
      }\n\
      d -= segLen\n\
    }\n\
\n\
    return latLngs[latLngs.length - 1]\n\
  }\n\
})\n\
\n\
module.exports = ItineraryTopoView\n\
\n\
//# sourceURL=lib/itinerary-topo-view.js"
));

require.register("otpjs/lib/itinerary-walk-step.js", Function("exports, module",
"var Backbone = window.Backbone\n\
\n\
var ItineraryWalkStep = Backbone.Model.extend({\n\
  defaults: {\n\
    distance: null,\n\
    relativeDirection: null,\n\
    absoluteDirection: null,\n\
    streetName: null,\n\
    exit: null,\n\
    stayOn: null,\n\
    bogusName: null,\n\
    lon: null,\n\
    lat: null\n\
  }\n\
})\n\
\n\
module.exports = ItineraryWalkStep\n\
\n\
//# sourceURL=lib/itinerary-walk-step.js"
));

require.register("otpjs/lib/itinerary-walk-steps.js", Function("exports, module",
"var ItineraryWalkStep = require('otpjs/lib/itinerary-walk-step.js')\n\
\n\
var Backbone = window.Backbone\n\
\n\
var ItineraryWalkSteps = Backbone.Collection.extend({\n\
  model: ItineraryWalkStep\n\
})\n\
\n\
module.exports = ItineraryWalkSteps\n\
\n\
//# sourceURL=lib/itinerary-walk-steps.js"
));

require.register("otpjs/lib/itinerary.js", Function("exports, module",
"var ItineraryLegs = require('otpjs/lib/itinerary-legs.js')\n\
\n\
var Backbone = window.Backbone\n\
var moment = window.moment\n\
\n\
var Itinerary = Backbone.Model.extend({\n\
  initialize: function (opts) {\n\
    this.set('legs', new ItineraryLegs(this.get('legs')))\n\
  },\n\
\n\
  defaults: {\n\
    duration: null,\n\
    startTime: null,\n\
    endTime: null,\n\
    walkTime: null,\n\
    transitTime: null,\n\
    elevationLost: null,\n\
    locationLon: null,\n\
    elevationGained: null,\n\
    transfers: null,\n\
    fare: [],\n\
    legs: []\n\
  },\n\
\n\
  /* returns [[south, west], [north, east]] */\n\
\n\
  getBoundsArray: function () {\n\
    var legs = this.get('legs')\n\
    var start = legs.at(0).get('from')\n\
    var end = legs.at(legs.length - 1).get('to')\n\
    return [\n\
      [Math.min(start.lat, end.lat), Math.min(start.lon, end.lon)],\n\
      [Math.max(start.lat, end.lat), Math.max(start.lon, end.lon)]\n\
    ]\n\
  },\n\
\n\
  /* returns the 'full' duration of a trip, including the duration of the\n\
   * trip itself plus any time between the trip and the requested departure/\n\
   * arrival time. Requires the request model as a parameter.\n\
   */\n\
\n\
  getFullDuration: function (request, offset) {\n\
    var queryDateTime = moment(request.get('date') + ' ' + request.get('time'), 'MM-DD-YYYY h:mma')\n\
    var startTime = moment(this.get('startTime'))\n\
    var endTime = moment(this.get('endTime'))\n\
\n\
    if (offset) {\n\
      startTime = startTime.add('hours', offset)\n\
      endTime = endTime.add('hours', offset)\n\
    }\n\
\n\
    if (request.get('arriveBy') === 'true' || request.get('arriveBy') ===\n\
      true) {\n\
      return queryDateTime - startTime\n\
    }\n\
    return endTime - queryDateTime\n\
  }\n\
\n\
})\n\
\n\
module.exports = Itinerary\n\
\n\
//# sourceURL=lib/itinerary.js"
));

require.register("otpjs/lib/leaflet-topo-graph-control.js", Function("exports, module",
"var L = window.L\n\
var $ = window.$\n\
\n\
var LeafletTopoGraphControl = L.Control.extend({\n\
  options: {\n\
    collapsed: true,\n\
    position: 'bottomright',\n\
    autoZIndex: true\n\
  },\n\
\n\
  initialize: function (options) {\n\
    L.setOptions(this, options)\n\
  },\n\
\n\
  onAdd: function (map) {\n\
    this._map = map\n\
\n\
    var className = 'leaflet-control-topo'\n\
    var container = this._container = L.DomUtil.create('div', className)\n\
    L.DomUtil.addClass(this._container, 'leaflet-control-topo-collapsed')\n\
\n\
    this._graphContainer = $('<div>').addClass('leaflet-control-topo-graph')\n\
      .appendTo(this._container)\n\
    this._graphDiv = $('<div>').appendTo(this._graphContainer)\n\
\n\
    var link = this._layersLink = L.DomUtil.create('div', className +\n\
      '-toggle', container)\n\
    L.DomEvent.on(link, 'click', this._toggle, this)\n\
\n\
    return this._container\n\
  },\n\
\n\
  getGraphElement: function () {\n\
    return this._graphDiv\n\
  },\n\
\n\
  _toggle: function () {\n\
    if (this._expanded) this._collapse()\n\
    else this._expand()\n\
  },\n\
\n\
  _expand: function () {\n\
    L.DomUtil.addClass(this._container, 'leaflet-control-topo-expanded')\n\
    $(this._container).width($(this._map._container).width() * 0.8)\n\
    this._graphDiv.trigger($.Event('resize'))\n\
    this._expanded = true\n\
  },\n\
\n\
  _collapse: function () {\n\
    this._container.className = this._container.className.replace(\n\
      ' leaflet-control-topo-expanded', '')\n\
    $(this._container).width('36px')\n\
    this._expanded = false\n\
  }\n\
})\n\
\n\
module.exports = LeafletTopoGraphControl\n\
\n\
//# sourceURL=lib/leaflet-topo-graph-control.js"
));

require.register("otpjs/lib/leg-narrative-view.js", Function("exports, module",
"var Handlebars = require('components~handlebars.js@v3.0.3')\n\
\n\
var StepNarrativeView = require('otpjs/lib/step-narrative-view.js')\n\
\n\
var Backbone = window.Backbone\n\
var _ = window._\n\
\n\
var accessLegTemplate = Handlebars.compile(require('otpjs/lib/templates/access-leg.html'))\n\
var transitLegTemplate = Handlebars.compile(require('otpjs/lib/templates/transit-leg.html'))\n\
var genericLegTemplate = Handlebars.compile(require('otpjs/lib/templates/generic-leg.html'))\n\
\n\
var LegNarrativeView = Backbone.View.extend({\n\
  events: {\n\
    'click .otp-legHeader': 'headerClicked',\n\
    'mouseenter .otp-legHeader': 'headerMouseenter',\n\
    'mouseleave .otp-legHeader': 'headerMouseleave',\n\
    'click .otp-from': 'fromClicked',\n\
    'click .otp-to': 'toClicked',\n\
    'click .showTimes': 'showTimes'\n\
  },\n\
\n\
  initialize: function (options) {\n\
    this.options = options || {}\n\
  },\n\
\n\
  render: function () {\n\
    if (this.model.isWalk() || this.model.isBicycle() || this.model.isCar()) {\n\
      this.$el.html(accessLegTemplate(this.model.attributes))\n\
\n\
      this.steps = []\n\
      _.each(this.model.get('steps').models, this.processStep, this)\n\
    } else if (this.model.isTransit()) {\n\
      var context = _.clone(this.model.attributes)\n\
      context.timeOffset = this.options.itinView.options.planView.model.getTimeOffset()\n\
      context.agencyLogoUrl = window.OTP_config.brandingUrl + encodeURIComponent(context.agencyId) + '/logo.png'\n\
      this.$el.html(transitLegTemplate(context))\n\
    } else {\n\
      this.$el.html(genericLegTemplate(this.model.attributes))\n\
    }\n\
\n\
    if (!this.model.isTransit()) this.$el.find('.otp-legBody').hide()\n\
  },\n\
\n\
  print: function () {\n\
    this.$el.find('.otp-legBody').slideDown()\n\
    if (this.steps) this.steps.forEach(function (step) { step.print() })\n\
  },\n\
\n\
  processStep: function (step, index) {\n\
    var stepView = new StepNarrativeView({\n\
      legView: this,\n\
      model: step,\n\
      index: index\n\
    })\n\
    stepView.render()\n\
    this.steps.push(stepView)\n\
    this.$el.find('.otp-legBody').append(stepView.el)\n\
  },\n\
\n\
  headerClicked: function (e) {\n\
    var body = this.$el.find('.otp-legBody')\n\
    if (body.is(':visible')) body.slideUp('fast')\n\
    else body.slideDown('fast')\n\
  },\n\
\n\
  headerMouseenter: function (e) {\n\
    this.model.trigger('mouseenter')\n\
  },\n\
\n\
  headerMouseleave: function (e) {\n\
    this.model.trigger('mouseleave')\n\
  },\n\
\n\
  fromClicked: function (e) {\n\
    this.model.trigger('fromclick')\n\
  },\n\
\n\
  toClicked: function (e) {\n\
    this.model.trigger('toclick')\n\
  },\n\
\n\
  showTimes: function (e) {\n\
    e.preventDefault()\n\
    this.model.getSurroundingStopTimes(function (err, times) {\n\
      console.log(err, times)\n\
      this.$('.OTPLeg-times').html('7:00pm<br>8:00pm<br>11:55pm')\n\
    })\n\
  }\n\
})\n\
\n\
module.exports = LegNarrativeView\n\
\n\
//# sourceURL=lib/leg-narrative-view.js"
));

require.register("otpjs/lib/log.js", Function("exports, module",
"var debug = require('visionmedia~debug@2.2.0')\n\
\n\
module.exports = function (namespace) {\n\
  return debug('otp.js:' + namespace)\n\
}\n\
\n\
//# sourceURL=lib/log.js"
));

require.register("otpjs/lib/localization.js", Function("exports, module",
"'use strict'\n\
\n\
var qs = require('component~querystring@1.3.3')\n\
/*var log = require('./log')('localization');*/\n\
var jed = require('./local/jed')\n\
var Handlebars = require('components~handlebars.js@v3.0.3')\n\
    \n\
// Cookies functions from http://www.quirksmode.org/js/cookies.html\n\
var createCookie = function (name, value, days) {\n\
  var expires = ''\n\
  if (days) {\n\
    var date = new Date()\n\
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))\n\
    expires = '; expires=' + date.toGMTString()\n\
  }\n\
  document.cookie = name + '=' + value + expires + '; path=/'\n\
}\n\
\n\
var readCookie = function (name) {\n\
  var nameEQ = name + '='\n\
  var ca = document.cookie.split(';')\n\
  for (var i = 0;i < ca.length;i++) {\n\
    var c = ca[i]\n\
    while (c.charAt(0) == ' ') c = c.substring(1, c.length)\n\
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length)\n\
  }\n\
return null\n\
}\n\
\n\
var eraseCookie = function (name) {\n\
  createCookie(name, '', -1)\n\
}\n\
\n\
var detectLanguage = function () {\n\
  var detectedLanguage = undefined\n\
\n\
  if (typeof window !== 'undefined') {\n\
    var qsParams = qs.parse(window.location.search)\n\
    console.log('Reading language from params:', window.location.search, qsParams)\n\
    if (qsParams[window.OTP_config.langQS]) {\n\
      detectedLanguage = qsParams[window.OTP_config.langQS]\n\
      console.log('Param language:', detectedLanguage)\n\
    }\n\
  }\n\
\n\
  // User wanted language isn't among languages we support\n\
  if (!_.has(window.OTP_config.availible_languages, detectedLanguage)) {\n\
    detectedLanguage = undefined\n\
  }\n\
\n\
  if (!detectedLanguage && typeof document !== 'undefined') {\n\
    console.log('Reading language from cookie')\n\
    var cookieValue = readCookie(window.OTP_config.cookieName)\n\
    if (cookieValue) {\n\
      console.log('Got cookie: ', cookieValue)\n\
      detectedLanguage = cookieValue\n\
      // User wanted language isn't among languages we support\n\
      if (!_.has(window.OTP_config.availible_languages, detectedLanguage)) {\n\
        detectedLanguage = undefined\n\
        eraseCookie(window.OTP_config.cookieName)\n\
      }\n\
    }\n\
  }\n\
\n\
  if (!detectedLanguage && typeof navigator !== 'undefined') {\n\
    // Chooses among the wanted user language according to user preferences\n\
    if (navigator.languages) {\n\
      console.log('Navigator languages:', navigator.languages)\n\
      // returns first language that user wants that is availible\n\
      detectedLanguage = _.find(navigator.languages, function getLang (ilang) {\n\
        console.log('currentLang', ilang, window.OTP_config.availible_languages)\n\
        return _.has(window.OTP_config.availible_languages, ilang)\n\
      })\n\
    } else {\n\
      detectedLanguage = (navigator.language || navigator.userLanguage)\n\
    }\n\
  }\n\
  console.log('detectededLanguage:', detectedLanguage)\n\
  // Language wasn't found by any means - usually shouldn't happen\n\
  if (detectedLanguage === undefined) {\n\
    console.log('Setting default language')\n\
    return 'en'\n\
    // Language was found but we don't necessary have the translation\n\
  } else {\n\
    // User wanted language isn't among languages we support\n\
    if (!_.has(window.OTP_config.availible_languages, detectedLanguage)) {\n\
      console.log(\"Wanted language isn't found:\", detectedLanguage)\n\
      detectedLanguage = 'en'\n\
      return detectedLanguage\n\
    }\n\
    console.log('Saving wanted language in a cookie:', detectedLanguage)\n\
    // Save wanted language in a cookie for 30 days\n\
    createCookie(window.OTP_config.cookieName, detectedLanguage, 30)\n\
  }\n\
  return detectedLanguage\n\
}\n\
\n\
var language = detectLanguage()\n\
\n\
var loadLanguage = function (language) {\n\
  var wanted = 'otpjs/lib/locale/' + language + '.json'\n\
  console.log('Detected language: %s', language)\n\
  console.log('Loading: %s', wanted)\n\
\n\
  var jedOptions\n\
  if (language == 'en') {\n\
    jedOptions = {}\n\
  } else {\n\
    jedOptions = require(wanted)\n\
    jedOptions.debug = true\n\
  }\n\
  return jedOptions\n\
}\n\
var jedOptions = loadLanguage(language)\n\
var info = new jed.Jed(jedOptions)\n\
\n\
//Sets metric to true/false based on country settings\n\
info.current_metric = window.OTP_config.availible_languages[language].metric\n\
\n\
info.locale_format = window.OTP_config.availible_languages[language].format\n\
\n\
// This is now handled by localization framework\n\
// TODO: check how it works during language switching\n\
function getOrdinalNumber (n) {\n\
  // TODO: translator comments\n\
  var exits = [\n\
    'empty',\n\
    info.gettext('first'),\n\
    info.gettext('second'),\n\
    info.gettext('third'),\n\
    info.gettext('fourth'),\n\
    info.gettext('fifth'),\n\
    info.gettext('sixth'),\n\
    info.gettext('seventh'),\n\
    info.gettext('eight'),\n\
    info.gettext('ninth'),\n\
    info.gettext('tenth')\n\
  ]\n\
\n\
  // return number. for large roundabouts with large number of exits\n\
  if (n > 10 && n < 14) return n + '.'\n\
  // otherwise returns localized exit number\n\
  return exits[n]\n\
}\n\
\n\
var absoluteDirectionStrings = {\n\
  // note: keep these lower case (and uppercase via template / code if needed)\n\
  // TRANSLATORS: Start on [street name] heading [Absolute direction] used in travel plan generation\n\
  'NORTH': info.gettext('north'),\n\
  // TRANSLATORS: Start on [street name] heading [Absolute direction] used in travel plan generation\n\
  'NORTHEAST': info.gettext('northeast'),\n\
  // TRANSLATORS: Start on [street name] heading [Absolute direction] used in travel plan generation\n\
  'EAST': info.gettext('east'),\n\
  // TRANSLATORS: Start on [street name] heading [Absolute direction] used in travel plan generation\n\
  'SOUTHEAST': info.gettext('southeast'),\n\
  // TRANSLATORS: Start on [street name] heading [Absolute direction] used in travel plan generation\n\
  'SOUTH': info.gettext('south'),\n\
  // TRANSLATORS: Start on [street name] heading [Absolute direction] used in travel plan generation\n\
  'SOUTHWEST': info.gettext('southwest'),\n\
  // TRANSLATORS: Start on [street name] heading [Absolute direction] used in travel plan generation\n\
  'WEST': info.gettext('west'),\n\
  // TRANSLATORS: Start on [street name] heading [Absolute direction] used in travel plan generation\n\
  'NORTHWEST': info.gettext('northwest'),\n\
}\n\
\n\
var relativeDirectionStrings = {\n\
  // note: keep these lower case (and uppercase via template / code if needed)\n\
  // TRANSLATORS: Take roundabout [clockwise] to [ordinal exit number] on\n\
  // streetname...\n\
  'CIRCLE_CLOCKWISE': info.gettext('clockwise'),\n\
  // TRANSLATORS: Take roundabout [counter clockwise] to [ordinal exit number] on streetname...\n\
  'CIRCLE_COUNTERCLOCKWISE': info.gettext('counter clockwise'),\n\
  // TRANSLATORS: depart at street name/corner of x y etc. (First instruction in\n\
  // itinerary)\n\
  'DEPART': info.pgettext('itinerary', 'depart'),\n\
  // TRANSLATORS: [Relative direction (Hard/Slightly Left/Right...)] to continue\n\
  // on /on to [streetname]\n\
  'HARD_LEFT': info.gettext('hard left'),\n\
  'LEFT': info.gettext('left'),\n\
  'SLIGHTLY_LEFT': info.gettext('slight left'),\n\
  'CONTINUE': info.gettext('continue'),\n\
  'SLIGHTLY_RIGHT': info.gettext('slight right'),\n\
  'RIGHT': info.gettext('right'),\n\
  'HARD_RIGHT': info.gettext('hard right'),\n\
  // rather than just being a direction, this should be\n\
  // full-fledged to take just the exit name at the end\n\
  'ELEVATOR': info.gettext('elevator'),\n\
  'UTURN_LEFT': info.gettext('U-turn left'),\n\
  'UTURN_RIGHT': info.gettext('U-turn right')\n\
}\n\
\n\
// Localizes relativeDirection, absoluteDirection\n\
// And exit if current step is roundabout\n\
info.localizeStep = function (step) {\n\
  var absoluteDir = step.absoluteDirection\n\
  if (absoluteDir in absoluteDirectionStrings) {\n\
    step.localAbsoluteDirection = absoluteDirectionStrings[absoluteDir].toUpperCase()\n\
  } else {\n\
    step.localAbsoluteDirection = absoluteDir\n\
    console.error('Missing translation for absolute direction:', absoluteDir)\n\
  }\n\
  var relativeDir = step.relativeDirection\n\
  if (relativeDir in relativeDirectionStrings) {\n\
    step.localRelativeDirection = relativeDirectionStrings[relativeDir].toUpperCase()\n\
  } else {\n\
    step.localRelativeDirection = relativeDir\n\
    console.error('Missing translation for relative direction:', relativeDir)\n\
  }\n\
  var exit = step.exit\n\
  // If exit exists and current step is roundabout\n\
  if ((exit !== null && exit !== undefined) && (relativeDir == 'CIRCLE_COUNTERCLOCKWISE' ||\n\
    relativeDir == 'CIRCLE_CLOCKWISE')) {\n\
    step.localExit = getOrdinalNumber(Number(exit))\n\
  }\n\
  return step\n\
}\n\
\n\
module.exports = info\n\
\n\
// TODO: this probably doesn't work if language wasn't found\n\
// Gets currently loaded language from Jed options\n\
module.exports.current_language = info.options.locale_data.messages[''].lang\n\
\n\
/*console.log(\"Info:\", info);*/\n\
\n\
Handlebars.registerHelper('_', function (key, options) {\n\
  console.debug('Entering nls/_', key, options)\n\
  var out = info.translate(key).fetch(options.hash)\n\
  /*console.debug('translation:', out);*/\n\
  return out\n\
})\n\
\n\
Handlebars.registerHelper('__pgettext', function (context, key) {\n\
  console.debug('Entering nls/_pg', context, key)\n\
  var out = info.translate(key).withContext(context).fetch()\n\
  // console.debug('translation:', out)\n\
  return out\n\
})\n\
\n\
//# sourceURL=lib/localization.js"
));

require.register("otpjs/lib/plan-request.js", Function("exports, module",
"var qs = require('component~querystring@1.3.3')\n\
\n\
var Itineraries = require('otpjs/lib/itineraries.js')\n\
var ItineraryStop = require('otpjs/lib/itinerary-stop.js')\n\
var log = require('otpjs/lib/log.js')('plan-request')\n\
var PlanResponse = require('otpjs/lib/plan-response.js')\n\
var utils = require('otpjs/lib/utils.js')\n\
var locale = require('otpjs/lib/localization.js')\n\
\n\
var Backbone = window.Backbone\n\
var $ = window.$\n\
\n\
var PlanRequest = Backbone.Model.extend({\n\
  initialize: function (opts) {\n\
    var self = this\n\
    this.on('change', function () {\n\
      self.request()\n\
    })\n\
  },\n\
\n\
  defaults: {\n\
    fromPlace: null,\n\
    toPlace: null,\n\
    intermediatePlaces: null,\n\
    intermediatePlacesOrdered: null,\n\
    date: null,\n\
    time: null,\n\
    routerId: null,\n\
    arriveBy: null,\n\
    wheelchair: null,\n\
    maxWalkDistance: 8046,\n\
    walkSpeed: null,\n\
    bikeSpeed: null,\n\
    triangleSafetyFactor: null,\n\
    triangleSlopeFactor: null,\n\
    triangleTimeFactor: null,\n\
    optimize: null,\n\
    mode: 'TRANSIT,WALK',\n\
    minTransferTime: null,\n\
    preferredRoutes: null,\n\
    preferredAgencies: null,\n\
    unpreferredRoutes: null,\n\
    unpreferredAgencies: null,\n\
    showIntermediateStops: null,\n\
    bannedRoutes: null,\n\
    bannedAgencies: null,\n\
    bannedTrips: null,\n\
    transferPenalty: null,\n\
    maxTransfers: null,\n\
    numItineraries: 3,\n\
    wheelchairAccessible: false,\n\
    locale: 'en'\n\
  },\n\
\n\
  request: function () {\n\
    if (!this.attributes.fromPlace) {\n\
      this.trigger('failure', locale.gettext('Click the map or enter an address to select a start location'))\n\
    } else if (!this.attributes.toPlace) {\n\
      this.trigger('failure', locale.gettext('Click the map or enter an address to select an end location'))\n\
    } else {\n\
      // Sets current locale\n\
      this.set('locale', locale.current_language)\n\
      log('requesting plan %s', this.urlRoot + this.toQueryString())\n\
      this.trigger('requesting', this)\n\
\n\
      var m = this\n\
\n\
      $.ajax(this.urlRoot, {\n\
        dataType: 'json',\n\
        data: utils.filterParams(this.attributes)\n\
      })\n\
        .done(function (data) {\n\
          log('processing results')\n\
          if (data.error) {\n\
            m.trigger('failure',\n\
              locale.gettext('No transit trips found within 5 miles of your search, try adjusting your start or end locations. Only major metropolitan areas are currently covered. Please check back for expanded data coverage.')\n\
            )\n\
          } else if (data && data.plan) {\n\
            if (data.plan.from && data.plan.to) {\n\
              if (data.plan.itineraries && data.plan.itineraries.length > 0) {\n\
                m.trigger('success', m.processRequest(data.plan))\n\
              } else {\n\
                m.trigger('failure',\n\
                  locale.gettext('No transit trips found within 5 miles of your search, try adjusting your start or end locations. Only major metropolitan areas are currently covered. Please check back for expanded data coverage.')\n\
                )\n\
              }\n\
            } else {\n\
              m.trigger('failure',\n\
                locale.gettext('Problem finding results for those locations. Please enter a valid start and end location.'))\n\
            }\n\
          } else {\n\
            m.trigger('failure',\n\
              locale.gettext('Problem finding results for those locations. Please enter a valid start and end location.'))\n\
          }\n\
        })\n\
        .fail(function (xhr, status) {\n\
          log('error: %s', status)\n\
          m.trigger('failure', locale.gettext('Unable to plan trip.'))\n\
        })\n\
    }\n\
  },\n\
\n\
  processRequest: function (plan) {\n\
    var itins = new Itineraries(plan.itineraries)\n\
\n\
    // For each itin\n\
    itins.each(function (itin) {\n\
      itins.handleActivate(itin)\n\
    })\n\
\n\
    return new PlanResponse({\n\
      request: this,\n\
      from: new ItineraryStop(plan.from),\n\
      to: new ItineraryStop(plan.to),\n\
      date: plan.date,\n\
      itineraries: itins\n\
    })\n\
  },\n\
\n\
  getFromLatLng: function () {\n\
    if (!this.get('fromPlace')) {\n\
      return null\n\
    }\n\
\n\
    var llStr = this.get('fromPlace').split('::')[0].split(',')\n\
    return [parseFloat(llStr[0]), parseFloat(llStr[1])]\n\
  },\n\
\n\
  getToLatLng: function () {\n\
    if (!this.get('toPlace')) {\n\
      return null\n\
    }\n\
\n\
    var llStr = this.get('toPlace').split('::')[0].split(',')\n\
    return [parseFloat(llStr[0]), parseFloat(llStr[1])]\n\
  },\n\
\n\
  toQueryString: function () {\n\
    return '?' + qs.stringify(utils.filterParams(this.attributes))\n\
  },\n\
\n\
  fromQueryString: function (queryString) {\n\
    this.set(qs.parse(queryString))\n\
  }\n\
})\n\
\n\
module.exports = PlanRequest\n\
\n\
//# sourceURL=lib/plan-request.js"
));

require.register("otpjs/lib/plan-response-narrative-view.js", Function("exports, module",
"var Handlebars = require('components~handlebars.js@v3.0.3')\n\
\n\
var log = require('otpjs/lib/log.js')('plan-response-narrative-view')\n\
var ItineraryNarrativeView = require('otpjs/lib/itinerary-narrative-view.js')\n\
\n\
var Backbone = window.Backbone\n\
var _ = window._\n\
\n\
var narrativeNewTemplate = Handlebars.compile(require('otpjs/lib/templates/narrative-new.html'))\n\
var narrativeAdjustTemplate = Handlebars.compile(require('otpjs/lib/templates/narrative-adjust.html'))\n\
var narrativeErrorTemplate = Handlebars.compile(require('otpjs/lib/templates/narrative-error.html'))\n\
\n\
var PlanResponseNarrativeView = Backbone.View.extend({\n\
  initialize: function (options) {\n\
    this.options = options || {}\n\
  },\n\
\n\
  render: function () {\n\
    log('rendering model: %s, error: %s', !!this.model, !!this.error)\n\
\n\
    if (this.error) {\n\
      return this.$el.html(narrativeErrorTemplate({\n\
        message: this.error\n\
      }))\n\
    }\n\
\n\
    if (this.model) {\n\
      if (!this.error) this.$el.html(narrativeAdjustTemplate())\n\
\n\
      var itins = this.model.get('itineraries')\n\
      _.each(itins.models, this.processItinerary, this)\n\
    } else {\n\
      this.$el.html(narrativeNewTemplate())\n\
    }\n\
  },\n\
\n\
  processItinerary: function (itin, index) {\n\
    var itinView = new ItineraryNarrativeView({\n\
      model: itin,\n\
      planView: this,\n\
      index: index\n\
    })\n\
\n\
    itinView.render()\n\
    this.$el.find('.itineraries').append(itinView.el)\n\
  }\n\
})\n\
\n\
module.exports = PlanResponseNarrativeView\n\
\n\
//# sourceURL=lib/plan-response-narrative-view.js"
));

require.register("otpjs/lib/plan-response-view.js", Function("exports, module",
"var ItineraryMapView = require('otpjs/lib/itinerary-map-view.js')\n\
var ItineraryTopoView = require('otpjs/lib/itinerary-topo-view.js')\n\
var log = require('otpjs/lib/log.js')('plan-response-view')\n\
var locale = require('otpjs/lib/localization.js')\n\
var PlanResponseNarrativeView = require('otpjs/lib/plan-response-narrative-view.js')\n\
\n\
var Backbone = window.Backbone\n\
var _ = window._\n\
\n\
module.exports = Backbone.View.extend({\n\
  initialize: function (options) {\n\
    this.options = options || {}\n\
    if (typeof this.options.autoResize === 'undefined') {\n\
      this.options.autoResize = true\n\
    }\n\
    //Sets metric setting from locale\n\
    this.options.metric = locale.current_metric\n\
\n\
    this.render()\n\
  },\n\
\n\
  render: function () {\n\
    if (this.options.narrative) {\n\
      this.narrativeView = new PlanResponseNarrativeView({\n\
        el: this.options.narrative,\n\
        model: this.model,\n\
        autoResize: this.options.autoResize,\n\
        metric: this.options.metric,\n\
        showFullDuration: this.options.showFullDuration\n\
      })\n\
      this.narrativeView.error = this.error\n\
      this.narrativeView.render()\n\
    }\n\
\n\
    if (this.model) {\n\
      this.model.getTimeOffset()\n\
      var itins = this.model.get('itineraries')\n\
\n\
      if (_.size(itins) > 0) {\n\
        _.each(itins.models, this.processItinerary, this)\n\
\n\
        itins.at(0).trigger('activate')\n\
      }\n\
    }\n\
  },\n\
\n\
  processItinerary: function (itin, index) {\n\
    if (this.options.map) {\n\
      var mapViewOptions = {\n\
        map: this.options.map,\n\
        model: itin,\n\
        planView: this,\n\
        metric: this.options.metric\n\
      }\n\
      if (this.options.legColor) {\n\
        mapViewOptions.legColor = this.options.legColor\n\
      }\n\
\n\
      new ItineraryMapView(mapViewOptions) // eslint-disable-line no-new\n\
    }\n\
\n\
    if (this.options.topo) {\n\
      new ItineraryTopoView({ // eslint-disable-line no-new\n\
        map: this.options.map,\n\
        el: this.options.topo,\n\
        model: itin,\n\
        planView: this\n\
      })\n\
    }\n\
  },\n\
\n\
  newResponse: function (error, response) {\n\
    log('new response')\n\
\n\
    this.deactivateOldItinerary()\n\
    this.error = error\n\
    this.model = response\n\
    this.render()\n\
  },\n\
\n\
  deactivateOldItinerary: function () {\n\
    if (this.model && this.model.get('itineraries')) {\n\
      log('deactivating itineraries')\n\
      this.model.get('itineraries').each(function (i) {\n\
        i.trigger('deactivate')\n\
      })\n\
    }\n\
  }\n\
})\n\
\n\
//# sourceURL=lib/plan-response-view.js"
));

require.register("otpjs/lib/plan-response.js", Function("exports, module",
"var Backbone = window.Backbone\n\
var moment = window.moment\n\
\n\
var PlanResponse = Backbone.Model.extend({\n\
  defaults: {\n\
    request: null,\n\
    to: null,\n\
    from: null,\n\
    date: null,\n\
    itineraries: []\n\
  },\n\
\n\
  getTimeOffset: function () {\n\
    var queryDate = moment(this.get('request').get('date') + ' ' + this.get('request').get('time'), 'MM-DD-YYYY h:mm a')\n\
    var responseDate = moment(this.get('date'))\n\
    var offset = (queryDate - responseDate) / 3600000\n\
    return offset\n\
  }\n\
})\n\
\n\
module.exports = PlanResponse\n\
\n\
//# sourceURL=lib/plan-response.js"
));

require.register("otpjs/lib/request-form.js", Function("exports, module",
"var Handlebars = require('components~handlebars.js@v3.0.3')\n\
var haversine = require('trevorgerhardt~haversine@master')\n\
require('kpwebb~select2@3.4.8')\n\
\n\
var BikeTriangleControl = require('otpjs/lib/bike-triangle-control.js')\n\
var geocoder = require('otpjs/lib/geocoder.js')\n\
var log = require('otpjs/lib/log.js')('request-form')\n\
\n\
var Backbone = window.Backbone\n\
var locale = require('otpjs/lib/localization.js')\n\
var moment = window.moment\n\
var $ = window.$\n\
var _ = window._\n\
\n\
var requestFormTemplate = Handlebars.compile(require('otpjs/lib/templates/request-form.html'))\n\
\n\
var RequestView = Backbone.View.extend({\n\
  events: {\n\
    'change .apiParam': 'changeForm',\n\
    'click .reverse-direction': 'reverseDirection',\n\
    'click .search-button': 'changeForm',\n\
    'change #mode': 'updateModeControls',\n\
    'click .toggleSettings': 'toggleSettings',\n\
    'click .first': 'first',\n\
    'click .previous': 'previous',\n\
    'click .next': 'next',\n\
    'click .last': 'last',\n\
    'change #languageSelect': 'updateLanguage'\n\
  },\n\
\n\
  first: function () {\n\
    this.model.set({\n\
      arriveBy: false,\n\
      time: '12:01 am'\n\
    })\n\
  },\n\
\n\
  previous: function () {\n\
    var active = this.itineraries.activeItinerary\n\
    var endTime = moment(active.get('endTime'))\n\
    var date = endTime.add(this.timeOffset, 'hours').subtract(1, 'minute')\n\
\n\
    this.model.set({\n\
      arriveBy: true,\n\
      date: date.format('MM-DD-YYYY'),\n\
      time: date.format('hh:mm a')\n\
    })\n\
  },\n\
\n\
  next: function () {\n\
    var active = this.itineraries.activeItinerary\n\
    var startTime = moment(active.get('startTime'))\n\
    var date = startTime.add(this.timeOffset, 'hours').add(1, 'minute')\n\
\n\
    this.model.set({\n\
      arriveBy: false,\n\
      date: date.format('MM-DD-YYYY'),\n\
      time: date.format('hh:mm a')\n\
    })\n\
  },\n\
\n\
  last: function () {\n\
    this.model.set({\n\
      arriveBy: false,\n\
      time: '11:59 pm'\n\
    })\n\
  },\n\
\n\
  setNextPreviousLastHidden: function (hidden) {\n\
    if (hidden) {\n\
      this.$('.nextPreviousLast').addClass('hidden')\n\
    } else {\n\
      this.$('.nextPreviousLast').removeClass('hidden')\n\
    }\n\
  },\n\
\n\
  initialize: function (options) {\n\
    this.options = options || {}\n\
    //sets metric setting from locale\n\
    this.options.metric = locale.current_metric\n\
    _.bindAll(this, 'changeForm')\n\
\n\
    var view = this\n\
\n\
    this.updatingForm = false\n\
\n\
    this.geocodeItem = Handlebars.compile([\n\
      '<span class=\"title\">{{text}}</span>',\n\
      '<span class=\"description\">{{#if city}}{{city}}, {{/if}}{{state}}</span>'\n\
    ].join('\\n\
'))\n\
\n\
    this.selectedGeocodeItem = Handlebars.compile([\n\
      '{{text}}{{#if city}}, {{city}}{{/if}}{{#if state}}, {{state}}{{/if}}'\n\
    ].join('\\n\
'))\n\
\n\
    this.listenTo(this.model, 'change', function (data) {\n\
      log('updating form with model changes')\n\
\n\
      if (_.has(data.changed, 'fromPlace') && data.attributes.fromPlace && view.selectFrom) {\n\
        // TRANSLATORS: \"[From] marker location/address\" in geocoding input field\n\
        view.updateReverseGeocoder(locale.gettext('From'), data.attributes.fromPlace, view.selectFrom)\n\
      }\n\
\n\
      if (_.has(data.changed, 'toPlace') && data.attributes.toPlace && view.selectTo) {\n\
        // TRANSLATORS: \"[To] marker location/address\" in geocoding input field\n\
        view.updateReverseGeocoder(locale.gettext('To'), data.attributes.toPlace, view.selectTo)\n\
      }\n\
\n\
      if (data.attributes.arriveBy !== undefined) {\n\
        view.$('#arriveBy').val(data.attributes.arriveBy + '')\n\
      }\n\
\n\
      if (data.attributes.mode) view.$('#mode').val(data.attributes.mode)\n\
      if (data.attributes.maxWalkDistance) view.$('#maxWalkDistance').val(data.attributes.maxWalkDistance)\n\
      if (data.attributes.optimize) view.$('#optimize').val(data.attributes.optimize)\n\
\n\
      if (data.attributes.date) {\n\
        var date = moment(data.attributes.date, 'MM-DD-YYYY').toDate()\n\
        view.datepicker.setDate(date)\n\
      }\n\
\n\
      if (data.attributes.time) {\n\
        var time = moment(data.attributes.time, 'hh:mm a').toDate()\n\
        view.timepicker.setDate(time)\n\
      }\n\
\n\
      if (data.attributes.wheelchairAccessible) {\n\
        view.$('#wheelchairAccessible').prop('checked', true)\n\
      }\n\
\n\
      view.updateModeControls()\n\
    })\n\
\n\
    this.listenTo(this.model, 'requesting', function () {\n\
      view.deactivateSearchButton()\n\
      view.setNextPreviousLastHidden(true)\n\
    })\n\
\n\
    this.listenTo(this.model, 'success', function (response) {\n\
      view.activateSearchButton()\n\
      view.setNextPreviousLastHidden(false)\n\
      view.timeOffset = response.getTimeOffset()\n\
      view.itineraries = response.get('itineraries')\n\
    })\n\
\n\
    this.listenTo(this.model, 'failure', function () {\n\
      view.activateSearchButton()\n\
      view.setNextPreviousLastHidden(true)\n\
    })\n\
  },\n\
\n\
  updateReverseGeocoder: function (field, latlon, select) {\n\
    log('updating %s with %s', field, latlon)\n\
    var view = this\n\
\n\
    if (window.OTP_config.reverseGeocode) {\n\
      view.updatingForm = true\n\
      geocoder.reverse(latlon, function (err, results) {\n\
        if (err) {\n\
          select.select2('data', [])\n\
          select.select2('data', {\n\
            text: field + ' ' + locale.gettext('marker location'),\n\
            id: latlon\n\
          })\n\
        } else {\n\
          select.select2('data', null)\n\
          results.text = field + ' ' + results.address\n\
          select.select2('data', results)\n\
        }\n\
        view.updatingForm = false\n\
      })\n\
    } else {\n\
      // this isn't great but appears to be neccesary as selectize triggers a change event even when programatically updated\n\
      view.updatingForm = true\n\
\n\
      var item = {\n\
        // TRANSLATORS: \"From/To marker location\" in geocoding input fields. Marker is flag on a map\n\
        text: field + ' ' + locale.gettext('marker location'),\n\
        id: latlon\n\
      }\n\
\n\
      select.select2('data', item)\n\
\n\
      view.updatingForm = false\n\
    }\n\
  },\n\
\n\
  render: function () {\n\
    log('rendering request form view')\n\
    var view = this\n\
    view.updatingForm = true\n\
\n\
    var html = requestFormTemplate({\n\
      metric: this.options.metric || false\n\
    })\n\
\n\
    this.lastResults = []\n\
\n\
    this.$el.html(html)\n\
\n\
    var langSelect = this.$('#languageSelect');\n\
\n\
    //FIXME: this should probably be improved\n\
    $.each(window.OTP_config.availible_languages, function() {\n\
        langSelect.append($(\"<option />\").val(this.locale_short).text(this.name));\n\
    });\n\
\n\
    //Set current language\n\
    langSelect.val(locale.current_language);\n\
\n\
    this.$('#hideSettings').hide()\n\
    this.$('#hidableSettings').hide()\n\
    this.$('#date').datetimepicker({\n\
      pickTime: false,\n\
      language: locale.current_language\n\
    })\n\
\n\
    this.datepicker = this.$('#date').data('DateTimePicker')\n\
    this.datepicker.setDate(new Date())\n\
    this.$('#date').on('dp.change', function () {\n\
      view.changeForm()\n\
    })\n\
\n\
    this.$('#time').datetimepicker({\n\
      pickSeconds: false,\n\
      pickDate: false,\n\
      language: locale.current_language\n\
    })\n\
\n\
    this.timepicker = this.$('#time').data('DateTimePicker')\n\
    this.timepicker.setDate(new Date())\n\
    this.$('#time').on('dp.change', function () {\n\
      view.changeForm()\n\
    })\n\
\n\
    var data = {\n\
      date: this.datepicker.getDate().format('MM-DD-YYYY'),\n\
      time: this.timepicker.getDate().format('hh:mm a'),\n\
      maxWalkDistance: 8046\n\
    }\n\
\n\
    this.model.set(data)\n\
\n\
    this.bikeTriangle = new BikeTriangleControl({\n\
      model: this.model,\n\
      el: this.$('#bikeTriangle')\n\
    })\n\
\n\
    this.selectFrom = this.initializeSelectFor('from')\n\
    this.selectTo = this.initializeSelectFor('to')\n\
\n\
    this.updateModeControls()\n\
\n\
    view.updatingForm = false\n\
  },\n\
\n\
  changeForm: function (evt) {\n\
    // skip duplicate change events caused by selectize form inputs\n\
    if (this.updatingForm) return\n\
    this.timepicker = this.$('#time').data('DateTimePicker')\n\
    this.datepicker = this.$('#date').data('DateTimePicker')\n\
\n\
    this.updatingForm = true\n\
    log('form changed')\n\
\n\
    var maxDistance = $('#mode').val().indexOf('WALK') !== -1 ?\n\
      $('#maxWalkDistance').val() : $('#maxBikeDistance').val()\n\
\n\
    var data = {\n\
      fromPlace: this.$('#fromPlace').select2('val'),\n\
      toPlace: this.$('#toPlace').select2('val'),\n\
      date: this.datepicker.getDate().format('MM-DD-YYYY'),\n\
      time: this.timepicker.getDate().format('hh:mm a'),\n\
      arriveBy: this.$('#arriveBy').val(),\n\
      maxWalkDistance: maxDistance,\n\
      optimize: this.$('#optimize').val(),\n\
      mode: this.$('#mode').val(),\n\
      wheelchairAccessible: this.$('#wheelchairAccessible').prop('checked')\n\
    }\n\
\n\
    // skip if either to/from fields are unset\n\
    if (this.$('#fromPlace').select2('val') === 'not found') {\n\
      data.fromPlace = false\n\
    }\n\
    if (this.$('#toPlace').select2('val') === 'not found') {\n\
      data.toPlace = false\n\
    }\n\
\n\
    var mode = $('#mode').val()\n\
    if (mode.indexOf('BICYCLE') !== -1) {\n\
      data.triangleSafetyFactor = $('#').val()\n\
      data.triangleSlopeFactor = $('#').val()\n\
      data.triangleTimeFactor = $('#').val()\n\
    } else {\n\
      this.model.unset('triangleSafetyFactor', {\n\
        silent: true\n\
      })\n\
      this.model.unset('triangleSlopeFactor', {\n\
        silent: true\n\
      })\n\
      this.model.unset('triangleTimeFactor', {\n\
        silent: true\n\
      })\n\
    }\n\
\n\
    this.model.set(data)\n\
    this.updatingForm = false\n\
  },\n\
\n\
  deactivateSearchButton: function () {\n\
    log('deactivating search button')\n\
\n\
    this.$('.search-button').addClass('hidden')\n\
    this.$('.searching-button').removeClass('hidden')\n\
  },\n\
\n\
  activateSearchButton: function () {\n\
    log('activating search button')\n\
\n\
    this.$('.search-button').removeClass('hidden')\n\
    this.$('.searching-button').addClass('hidden')\n\
  },\n\
\n\
  updateModeControls: function () {\n\
    var mode = this.$('#mode').val()\n\
    if (!mode) {\n\
      this.$('#mode').val('TRANSIT,WALK')\n\
      mode = 'TRANSIT,WALK'\n\
    }\n\
\n\
    // disabling maxWalkControl as we switch to soft walk dist limiting\n\
    this.$el.find('.maxWalkControl').hide()\n\
\n\
    if (mode.indexOf('BICYCLE') !== -1 && mode.indexOf('TRANSIT') !== -1) {\n\
      this.$el.find('.maxBikeControl').show()\n\
    } else {\n\
      this.$el.find('.maxBikeControl').hide()\n\
    }\n\
\n\
    if (mode.indexOf('TRANSIT') !== -1 && mode.indexOf('BICYCLE') === -1) {\n\
      this.$el.find('.optimizeControl').show()\n\
    } else {\n\
      this.$el.find('.optimizeControl').hide()\n\
    }\n\
\n\
    if (mode.indexOf('BICYCLE') !== -1) {\n\
      this.$el.find('.bikeTriangleControl').show()\n\
    } else {\n\
      this.$el.find('.bikeTriangleControl').hide()\n\
    }\n\
  },\n\
\n\
  updateLanguage: function() {\n\
      console.log(\"Updating language\")\n\
      var language = this.$('#languageSelect').val()\n\
      console.log(\"Wanted language:\", language)\n\
      //FIXME: check cross browser support for this\n\
      //Opens browser and sets language to wanted language\n\
      window.location.search=window.OTP_config.langQS+\"=\"+language\n\
  },\n\
\n\
  toggleSettings: function () {\n\
    if ($('#hidableSettings').is(':visible')) {\n\
      $('#hidableSettings').slideUp('fast', function () {\n\
        $('#itineraries').height($(window).height() - ($('#request').height() +\n\
          $('#messageWell').height() + 80))\n\
      })\n\
      $('#showSettings').show()\n\
      $('#hideSettings').hide()\n\
      this.bikeTriangle.disable()\n\
    } else {\n\
      $('#hidableSettings').slideDown('fast', function () {\n\
        $('#itineraries').height($(window).height() - ($('#request').height() +\n\
          $('#messageWell').height() + 80))\n\
      })\n\
      $('#showSettings').hide()\n\
      $('#hideSettings').show()\n\
      if (!this.bikeTriangle.rendered) {\n\
        this.bikeTriangle.render()\n\
      }\n\
      this.bikeTriangle.enable()\n\
    }\n\
  },\n\
\n\
  reverse: function (place, error, success) {\n\
    // esri takes lon/lat\n\
    var parts = place.split(',')\n\
    var lonlat = parts[1] + ',' + parts[0]\n\
\n\
    $.ajax({\n\
      url: window.OTP_config.esriApi + 'reverseGeocode?location=' +\n\
        encodeURIComponent(lonlat) + '&f=pjson',\n\
      type: 'GET',\n\
      dataType: 'jsonp',\n\
      error: function () {\n\
        error()\n\
      },\n\
      success: function (res) {\n\
        var data = {\n\
          address: res.address.Address,\n\
          city: res.address.City,\n\
          state: res.address.Region,\n\
          latlon: place\n\
        }\n\
\n\
        success(data)\n\
      }\n\
    })\n\
  },\n\
\n\
  initializeSelectFor: function (term) {\n\
    var $id = '#' + term + 'Place'\n\
    var placeholder = term === 'from' ? 'Start' : 'End'\n\
    var url = window.OTP_config.esriApi + 'findAddressCandidates'\n\
    var view = this\n\
\n\
    return this.$($id).select2({\n\
      placeholder: placeholder + ' Address',\n\
      minimumInputLength: 5,\n\
      allowClear: true,\n\
      selectOnBlur: true,\n\
      createSearchChoice: function (term) {\n\
        if (view.lastResults.length === 0) {\n\
          var text = term + ' (not found)'\n\
          return {\n\
            id: 'not found',\n\
            text: text\n\
          }\n\
        } else {\n\
          console.log('last results', view.lastResults)\n\
        }\n\
      },\n\
      formatResult: function (object, container) {\n\
        return view.geocodeItem(object)\n\
      },\n\
      formatSelection: function (object, container) {\n\
        return view.selectedGeocodeItem({\n\
          text: object.text,\n\
          city: object.city,\n\
          state: object.state,\n\
          id: object.id\n\
        })\n\
      },\n\
      ajax: {\n\
        url: url,\n\
        dataType: 'jsonp',\n\
        quietMillis: 20,\n\
        data: function (term, page) {\n\
          view.lastResults = []\n\
\n\
          var query = {\n\
            countryCode: 'USA',\n\
            f: 'json',\n\
            distance: 5000, // 5km\n\
            singleLine: term,\n\
            outFields: 'City,Region',\n\
            location: '-73.7562271,42.6525795', // TODO: Should be from config\n\
            maxLocations: 5\n\
          }\n\
\n\
          if (view.options.map) {\n\
            var latlng = view.options.map.getCenter()\n\
            query.location = latlng.lng + ',' + latlng.lat\n\
\n\
            var bounds = view.options.map.getBounds()\n\
            var nw = bounds.getNorthWest()\n\
            var se = bounds.getSouthEast()\n\
            query.distance = haversine(nw.lat, nw.lng, se.lat, se.lng) * 1000\n\
          }\n\
\n\
          return query\n\
        },\n\
        results: function (res, page) {\n\
          var results = []\n\
          if (res.candidates) {\n\
            for (var i in res.candidates) {\n\
              var candidate = res.candidates[i]\n\
              var location = candidate.location\n\
\n\
              results.push({\n\
                text: candidate.address.split(',')[0],\n\
                city: candidate.attributes.City,\n\
                state: candidate.attributes.Region,\n\
                id: location.y + ',' + location.x\n\
              })\n\
            }\n\
          }\n\
\n\
          view.skipReverseGeocode = true\n\
          view.lastResults = results\n\
\n\
          if (results.length > 0) {\n\
            view.$($id).select2('data', {\n\
              text: term + ' ' + results[0].text,\n\
              city: results[0].city,\n\
              state: results[0].state,\n\
              id: results[0].id\n\
            })\n\
\n\
            view.changeForm()\n\
          }\n\
\n\
          return {\n\
            results: results\n\
          }\n\
        }\n\
      }\n\
    })\n\
  },\n\
\n\
  reverseDirection: function (e) {\n\
    e.preventDefault()\n\
    this.model.set({\n\
      toPlace: this.model.get('fromPlace'),\n\
      fromPlace: this.model.get('toPlace')\n\
    })\n\
  }\n\
})\n\
\n\
module.exports = RequestView\n\
\n\
//# sourceURL=lib/request-form.js"
));

require.register("otpjs/lib/request-map-view.js", Function("exports, module",
"var Handlebars = require('components~handlebars.js@v3.0.3')\n\
\n\
var log = require('otpjs/lib/log.js')('map-views')\n\
\n\
var locale = require('otpjs/lib/localization.js')\n\
var Backbone = window.Backbone\n\
var L = window.L\n\
var $ = window.$\n\
var _ = window._\n\
\n\
var mapContextMenuTemplate = Handlebars.compile(require('otpjs/lib/templates/map-context-menu.html'))\n\
\n\
var RequestMapView = Backbone.View.extend({\n\
  initialize: function (options) {\n\
    _.bindAll(this, 'markerMove', 'mapClick')\n\
    this.options = options || {}\n\
\n\
    this.model.on('change', this.render, this)\n\
\n\
    var view = this\n\
    this.options.map.on('click', function (evt) {\n\
      view.mapClick(evt.latlng)\n\
    })\n\
\n\
    this.options.map.on('contextmenu', _.bind(function (evt) {\n\
      var mouseEvent = evt.originalEvent\n\
      mouseEvent.preventDefault()\n\
      if (mouseEvent.which === 3) {\n\
        if (!this.contextMenu) {\n\
          this.contextMenu = $(mapContextMenuTemplate()).appendTo('body')\n\
        }\n\
\n\
        this.contextMenu.find('.setStartLocation').click(_.bind(function () {\n\
          this.model.set({\n\
            fromPlace: evt.latlng.lat + ',' + evt.latlng.lng\n\
          })\n\
        }, this))\n\
\n\
        this.contextMenu.find('.setEndLocation').click(_.bind(function () {\n\
          this.model.set({\n\
            toPlace: evt.latlng.lat + ',' + evt.latlng.lng\n\
          })\n\
        }, this))\n\
\n\
        this.contextMenu.show()\n\
          .css({\n\
            top: mouseEvent.pageY + 'px',\n\
            left: mouseEvent.pageX + 'px'\n\
          })\n\
      }\n\
      return false\n\
    }, this))\n\
\n\
    $(document).bind('click', _.bind(function (event) {\n\
      if (this.contextMenu) this.contextMenu.hide()\n\
    }, this))\n\
\n\
    this.attachedToMap = false\n\
\n\
    this.markerLayer = new L.LayerGroup()\n\
  },\n\
\n\
  attachToMap: function () {\n\
    this.options.map.addLayer(this.markerLayer)\n\
    this.attachedToMap = true\n\
  },\n\
\n\
  detachFromMap: function () {\n\
    this.options.map.removeLayer(this.markerLayer)\n\
    this.attachedToMap = false\n\
  },\n\
\n\
  render: function () {\n\
    log('rendering request map view')\n\
\n\
    if (!this.attachedToMap) this.attachToMap()\n\
    this.clearLayers()\n\
\n\
    var from = this.model.getFromLatLng()\n\
    var to = this.model.getToLatLng()\n\
\n\
    if (from || to) {\n\
      if (from) {\n\
        this.startMarker = new L.Marker(from, {\n\
          icon: new L.DivIcon({\n\
            className: 'otp-startFlagIcon',\n\
            iconSize: null,\n\
            iconAnchor: null\n\
          }),\n\
          draggable: true\n\
        })\n\
        // TRANSLATORS: Label for map Start flag which is shown on hover\n\
        this.startMarker.bindLabel('<strong>' + locale.gettext('Start') + '</strong>')\n\
        this.startMarker.on('dragend', $.proxy(function () {\n\
          this.markerMove(this.startMarker.getLatLng(), null)\n\
        }, this))\n\
        this.markerLayer.addLayer(this.startMarker)\n\
      }\n\
\n\
      if (to) {\n\
        this.endMarker = new L.Marker(to, {\n\
          icon: new L.DivIcon({\n\
            className: 'otp-endFlagIcon',\n\
            iconSize: null,\n\
            iconAnchor: null\n\
          }),\n\
          draggable: true\n\
        })\n\
        // TRANSLATORS: Label for map End flag which is shown on hover\n\
        this.endMarker.bindLabel('<strong>' + locale.gettext('End') + '</strong>')\n\
        this.endMarker.on('dragend', $.proxy(function () {\n\
          this.markerMove(null, this.endMarker.getLatLng())\n\
        }, this))\n\
        this.markerLayer.addLayer(this.endMarker)\n\
      }\n\
    }\n\
  },\n\
\n\
  mapClick: function (latlng) {\n\
    if (!this.model.attributes.fromPlace) {\n\
      this.model.set({\n\
        fromPlace: latlng.lat + ',' + latlng.lng\n\
      })\n\
    } else if (!this.model.attributes.toPlace) {\n\
      this.model.set({\n\
        toPlace: latlng.lat + ',' + latlng.lng\n\
      })\n\
    }\n\
  },\n\
\n\
  markerMove: function (start, end) {\n\
    if (start) {\n\
      this.model.set({\n\
        fromPlace: start.lat + ',' + start.lng\n\
      })\n\
    }\n\
\n\
    if (end) {\n\
      this.model.set({\n\
        toPlace: end.lat + ',' + end.lng\n\
      })\n\
    }\n\
  },\n\
\n\
  clearLayers: function () {\n\
    this.markerLayer.clearLayers()\n\
  }\n\
})\n\
\n\
module.exports = RequestMapView\n\
\n\
//# sourceURL=lib/request-map-view.js"
));

require.register("otpjs/lib/step-narrative-view.js", Function("exports, module",
"var Handlebars = require('components~handlebars.js@v3.0.3')\n\
\n\
var utils = require('otpjs/lib/utils.js')\n\
var locale = require('otpjs/lib/localization.js')\n\
\n\
var Backbone = window.Backbone\n\
var _ = window._\n\
\n\
var stepTemplate = Handlebars.compile(require('otpjs/lib/templates/step.html'))\n\
\n\
var StepNarrativeView = Backbone.View.extend({\n\
  events: {\n\
    'click .otp-legStep-row': 'rowClicked',\n\
    'mouseenter .otp-legStep-row': 'rowMouseenter',\n\
    'mouseleave .otp-legStep-row': 'rowMouseleave'\n\
  },\n\
\n\
  initialize: function (options) {\n\
    this.options = options || {}\n\
  },\n\
\n\
  print: function () {\n\
    // this.rowClicked()\n\
  },\n\
\n\
  render: function () {\n\
    var context = _.clone(this.model.attributes)\n\
    var relDir = this.model.get('relativeDirection')\n\
\n\
    // set a flag if this is the first step of the leg\n\
    context.isFirst = (this.options.index === 0)\n\
\n\
    // handle the special case of roundabout / traffic circle steps\n\
    if (relDir === 'CIRCLE_COUNTERCLOCKWISE' || relDir ===\n\
      'CIRCLE_CLOCKWISE') {\n\
      context.isRoundabout = true\n\
      context.roundaboutDirection = (relDir === 'CIRCLE_CLOCKWISE') ?\n\
        'clockwise' : 'counterclockwise' // TODO: i18n\n\
    }\n\
\n\
    // Adds localized absolute/relative direction and ordinal exits\n\
    context = locale.localizeStep(context)\n\
\n\
    // format the leg distance\n\
    var metric = this.options.legView.options.itinView.options.planView.options\n\
      .metric\n\
    var distStr = utils.distanceString(this.model.get('distance'), metric)\n\
    context.distanceValue = distStr.split(' ')[0]\n\
    context.distanceUnit = distStr.split(' ')[1]\n\
\n\
    this.$el.html(stepTemplate(context))\n\
  },\n\
\n\
  rowClicked: function (e) {\n\
    this.model.trigger('click')\n\
  },\n\
\n\
  rowMouseenter: function (e) {\n\
    this.model.trigger('mouseenter')\n\
  },\n\
\n\
  rowMouseleave: function (e) {\n\
    this.model.trigger('mouseleave')\n\
  }\n\
})\n\
\n\
module.exports = StepNarrativeView\n\
\n\
//# sourceURL=lib/step-narrative-view.js"
));

require.register("otpjs/lib/stop.js", Function("exports, module",
"var Backbone = window.Backbone\n\
\n\
var Stop = Backbone.Model.extend({\n\
  initialize: function () {},\n\
\n\
  defaults: {\n\
    stopId: null,\n\
    name: null,\n\
    lon: null,\n\
    lat: null,\n\
    // Only availible if non null Stop code\n\
    code: null,\n\
    // Parent station if non null\n\
    cluster: null,\n\
    // Distance to the stop when requested from a location based query\n\
    dist: null\n\
  }\n\
})\n\
\n\
module.exports = Stop\n\
\n\
//# sourceURL=lib/stop.js"
));

require.register("otpjs/lib/stops-in-rectangle-request.js", Function("exports, module",
"var StopsResponse = require('otpjs/lib/stops-response.js')\n\
var utils = require('otpjs/lib/utils.js')\n\
\n\
var Backbone = window.Backbone\n\
var $ = window.$\n\
\n\
var StopsInRectangleRequest = Backbone.Model.extend({\n\
  initialize: function (opts) {\n\
    var self = this\n\
    this.on('change', function () {\n\
      self.request()\n\
    })\n\
  },\n\
\n\
  defaults: {\n\
    routerId: null,\n\
    maxLat: null,\n\
    maxLon: null,\n\
    minLat: null,\n\
    minLon: null\n\
  },\n\
\n\
  request: function () {\n\
    var m = this\n\
\n\
    // don't make incomplete requests\n\
    if (!this.attributes.maxLat || !this.attributes.maxLon || !this.attributes.minLat || !this.attributes.minLon) {\n\
      return false\n\
    }\n\
\n\
    $.ajax(this.urlRoot, {\n\
      data: utils.filterParams(this.attributes)\n\
    })\n\
      .done(function (data) {\n\
        m.trigger('success', m.processRequest(data))\n\
      })\n\
      .fail(function (data) {\n\
        m.trigger('failure', data)\n\
      })\n\
  },\n\
\n\
  processRequest: function (data) {\n\
    var response = new StopsResponse(data)\n\
    response.set('request', this)\n\
    return response\n\
  }\n\
})\n\
\n\
module.exports = StopsInRectangleRequest\n\
\n\
//# sourceURL=lib/stops-in-rectangle-request.js"
));

require.register("otpjs/lib/stops-request-map-view.js", Function("exports, module",
"var Backbone = window.Backbone\n\
var _ = window._\n\
\n\
var StopsRequestMapView = Backbone.View.extend({\n\
  initialize: function (options) {\n\
    _.bindAll(this, 'mapViewChanged')\n\
    this.options = options || {}\n\
\n\
    if (!this.options.minimumZoom) this.options.minimumZoom = 15\n\
\n\
    this.options.map.on('viewreset dragend', this.mapViewChanged)\n\
  },\n\
\n\
  mapViewChanged: function (e) {\n\
    if (this.options.map.getZoom() < this.options.minimumZoom) return\n\
\n\
    var data = {\n\
      maxLat: this.options.map.getBounds().getNorth(),\n\
      minLon: this.options.map.getBounds().getWest(),\n\
      minLat: this.options.map.getBounds().getSouth(),\n\
      maxLon: this.options.map.getBounds().getEast()\n\
    }\n\
\n\
    this.model.set(data)\n\
  }\n\
})\n\
\n\
module.exports = StopsRequestMapView\n\
\n\
//# sourceURL=lib/stops-request-map-view.js"
));

require.register("otpjs/lib/stops-response-map-view.js", Function("exports, module",
"var Backbone = window.Backbone\n\
var L = window.L\n\
var _ = window._\n\
\n\
var StopsResponseMapView = Backbone.View.extend({\n\
  initialize: function (options) {\n\
    _.bindAll(this, 'mapViewChanged')\n\
    this.options = options || {}\n\
\n\
    this.markerLayer = new L.LayerGroup()\n\
    this.options.map.addLayer(this.markerLayer)\n\
    this.options.map.on('viewreset dragend', this.mapViewChanged)\n\
  },\n\
\n\
  render: function () {\n\
    this.markerLayer.clearLayers()\n\
    _.each(this.model.get('stops').models, function (stop) {\n\
      var stopMarker = new L.CircleMarker([stop.get('lat'), stop.get(\n\
        'lon')], {\n\
        color: '#666',\n\
        stroke: 2,\n\
        radius: 4,\n\
        fillColor: '#eee',\n\
        opacity: 1.0,\n\
        fillOpacity: 1.0\n\
      })\n\
      stopMarker.bindLabel(stop.get('name'))\n\
\n\
      this.markerLayer.addLayer(stopMarker)\n\
\n\
    }, this)\n\
\n\
  },\n\
\n\
  newResponse: function (response) {\n\
    this.model = response\n\
    this.render()\n\
  },\n\
\n\
  mapViewChanged: function (e) {\n\
    this.markerLayer.clearLayers()\n\
  }\n\
})\n\
\n\
module.exports = StopsResponseMapView\n\
\n\
//# sourceURL=lib/stops-response-map-view.js"
));

require.register("otpjs/lib/stops-response.js", Function("exports, module",
"var Stops = require('otpjs/lib/stops.js')\n\
\n\
var Backbone = window.Backbone\n\
var _ = window._\n\
\n\
var StopsResponse = Backbone.Model.extend({\n\
  initialize: function () {\n\
    var rawAttributes = arguments[0]\n\
    var processedAttributes = _.omit(rawAttributes, ['stops'])\n\
\n\
    // re-map the stop's 'id' object to 'stopId'; otherwise the backbone collection doesn't properly initialize\n\
    _.each(rawAttributes, function (stop) {\n\
      stop.stopId = stop.id\n\
      delete stop.id\n\
    })\n\
\n\
    processedAttributes.stops = new Stops()\n\
    processedAttributes.stops.add(rawAttributes)\n\
\n\
    this.set(processedAttributes)\n\
  },\n\
\n\
  defaults: {\n\
    request: null,\n\
    stops: []\n\
  }\n\
})\n\
\n\
module.exports = StopsResponse\n\
\n\
//# sourceURL=lib/stops-response.js"
));

require.register("otpjs/lib/stops.js", Function("exports, module",
"var Stop = require('otpjs/lib/stop.js')\n\
\n\
var Backbone = window.Backbone\n\
\n\
var Stops = Backbone.Collection.extend({\n\
  model: Stop\n\
})\n\
\n\
module.exports = Stops\n\
\n\
//# sourceURL=lib/stops.js"
));

require.register("otpjs/lib/utils.js", Function("exports, module",
"'use strict'\n\
\n\
var locale = require('otpjs/lib/localization.js')\n\
\n\
var L = window.L\n\
var moment = window.moment\n\
\n\
module.exports.filterParams = function filterParams (data) {\n\
  var filtered = {}\n\
  for (var k in data) {\n\
    var val = data[k]\n\
    if (val !== null && val !== undefined) filtered[k] = val\n\
  }\n\
  return filtered\n\
}\n\
\n\
function decodePolyline (polyline) {\n\
  var currentPosition = 0\n\
\n\
  var currentLat = 0\n\
  var currentLng = 0\n\
\n\
  var dataLength = polyline.length\n\
\n\
  var polylineLatLngs = []\n\
\n\
  while (currentPosition < dataLength) {\n\
    var shift = 0\n\
    var result = 0\n\
\n\
    var byte\n\
\n\
    do {\n\
      byte = polyline.charCodeAt(currentPosition++) - 63\n\
      result |= (byte & 0x1f) << shift\n\
      shift += 5\n\
    } while (byte >= 0x20)\n\
\n\
      var deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1))\n\
      currentLat += deltaLat\n\
\n\
      shift = 0\n\
      result = 0\n\
\n\
      do {\n\
        byte = polyline.charCodeAt(currentPosition++) - 63\n\
        result |= (byte & 0x1f) << shift\n\
        shift += 5\n\
      } while (byte >= 0x20)\n\
\n\
        var deltLng = ((result & 1) ? ~(result >> 1) : (result >> 1))\n\
\n\
        currentLng += deltLng\n\
\n\
        polylineLatLngs.push(new L.LatLng(currentLat * 0.00001, currentLng * 0.00001))\n\
      }\n\
\n\
      return polylineLatLngs\n\
    }\n\
\n\
    module.exports.decodePolyline = decodePolyline\n\
\n\
    var formatTime = function (time, format, offsetHrs) {\n\
      // LT is locale default hour:time\n\
      format = format || 'LT'\n\
      var m = moment(time)\n\
      if (offsetHrs) m = m.add('hours', offsetHrs)\n\
      // Is locale format with locale aware day month and LT It is set based on\n\
      // selected language\n\
      if (!today(m)) format = locale.locale_format\n\
      return m.format(format)\n\
    }\n\
\n\
    function today (m) {\n\
      var n = moment()\n\
      return n.date() === m.date() && n.month() === m.month() && n.year() === m.year()\n\
    }\n\
\n\
    module.exports.formatTime = formatTime\n\
\n\
    var secToHrMin = function (sec) {\n\
      var duration = moment.duration(sec, 'seconds')\n\
      // This returns localized human time durations 1 minut one hour, 5 minutes\n\
      // etc.\n\
      return duration.humanize()\n\
    }\n\
\n\
    module.exports.secToHrMin = secToHrMin\n\
\n\
    var msToHrMin = function (ms) {\n\
      var hrs = Math.floor(ms / 3600000)\n\
      var mins = Math.floor(ms / 60000) % 60\n\
\n\
      var str\n\
\n\
      // TODO: localization\n\
      if (hrs === 0 && mins < 1) {\n\
        str = '<1 min'\n\
      } else {\n\
        str = (hrs > 0 ? (hrs + ' hr, ') : '') + mins + ' min'\n\
      }\n\
\n\
      return str\n\
    }\n\
\n\
    module.exports.msToHrMin = msToHrMin\n\
\n\
    var distanceStringImperial = function (m) {\n\
      var ft = m * 3.28084\n\
      if (ft < 528) return Math.round(ft) + ' feet'\n\
      return Math.round(ft / 528) / 10 + ' miles'\n\
    }\n\
\n\
    var distanceStringMetric = function (m) {\n\
      var km = m / 1000\n\
      if (km > 100) {\n\
        // 100 km => 999999999 km\n\
        km = km.toFixed(0)\n\
        return km + ' km'\n\
      } else if (km > 1) {\n\
        // 1.1 km => 99.9 km\n\
        km = km.toFixed(1)\n\
        return km + ' km'\n\
      } else {\n\
        // 1m => 999m\n\
        m = m.toFixed(0)\n\
        return m + ' m'\n\
      }\n\
    }\n\
\n\
    var distanceString = function (m, metric) {\n\
      return (metric === true) ? distanceStringMetric(m) : distanceStringImperial(m)\n\
    }\n\
\n\
    module.exports.distanceString = distanceString\n\
\n\
//# sourceURL=lib/utils.js"
));

require.define("otpjs/lib/locale/fr.json", {"domain":"messages","locale_data":{"messages":{"":{"domain":"messages","plural_forms":"nplurals=2; plural=(n > 1);","lang":"fr"},"Take roundabout %(relativeDirection)s to %(ordinal_exit_number)s exit on %(streetName)s":["Prendre le rond-point %(relativeDirection)s jusqu'à la %(ordinal_exit_number)s sortie sur %(streetName)s"],"Start on <b>%(streetName)s</b> heading %(absoluteDirection)s":[""],"<b>%(relativeDirection)s</b> to continue on <b>%(streetName)s</b>":[""],"<b>%(relativeDirection)s</b> on to <b>%(streetName)s</b>":[""],"Print Itinerary":[""],"Option":["Paramètres de l'itinéraire"],"Time in transit":["Temps de correspondance"],"Alight":["Descendre"],"Drag start and end location pins on the map or use the form above to adjust trip settings.":[""],"<strong>To plan a trip:</strong> select a start and end location by clicking the map or by entering an address above.":[""],"Start Address":[""],"End Address":[""],"Hide Settings":[""],"Show Settings":[""],"Arrive at":["Arrivée"],"Depart by":["Départ"],"Travel by":["Voyager par"],"Transit":["Transports en commun"],"Rail Only":["Ferré uniquement"],"Bus Only":["Bus uniquement"],"Walk Only":["Marche seulement"],"Bicycle Only":["Vélo uniquement"],"Find":[""],"Quickest trip":[""],"Fewest transfers":[""],"Wheelchair accessible trip":["Accessible aux fauteuils roulants:"],"Maximum walk":["Marcher au maximum"],"Maximum bike":["Parcours à vélo maximum"],"Select language":[""],"Submit":[""],"Searching":["Recherche"],"First":["Premier"],"Previous":["Précédent"],"Next":["Suivant"],"Last":["Dernier"],"Set as Start Location":["Définir comme point de départ"],"Set as End Location":["Définir comme point d'arrivée"],"From":[""],"To":[""],"marker location":[""],"Start":[""],"End":[""],"Click the map or enter an address to select a start location":[""],"Click the map or enter an address to select an end location":[""],"No transit trips found within 5 miles of your search, try adjusting your start or end locations. Only major metropolitan areas are currently covered. Please check back for expanded data coverage.":[""],"Problem finding results for those locations. Please enter a valid start and end location.":[""],"Unable to plan trip.":[""],"Quick":["Le plus Rapide"],"Flat":["Le plus Plat"],"Bike Friendly":["Adapté au vélo"],"B":["A"],"F":["P"],"Q":["R"],"first":["première"],"second":["seconde"],"third":["troisième"],"fourth":["quatrième"],"fifth":["cinquième"],"sixth":["sixième"],"seventh":["septième"],"eight":["huitième"],"ninth":["neuvième"],"tenth":["dixième"],"north":["nord"],"northeast":["nord-est"],"east":["est"],"southeast":["sud-est"],"south":["sud"],"southwest":["sud-ouest"],"west":["ouest"],"northwest":["nord-ouest"],"clockwise":["dans le sens des aiguilles d'une montre"],"counter clockwise":["dans le sens contraire des aiguilles d'une montre"],"hard left":["complètement à gauche"],"left":["à gauche"],"slight left":["légèrement à gauche"],"continue":["continuer"],"slight right":["légèrement à droite"],"right":["à droite"],"hard right":["complètement à droite"],"elevator":["ascenseur"],"U-turn left":["virage en U à gauche"],"U-turn right":["virage en U à droite"],"bus_direction\u0004 to ":[" vers "],"direction\u0004 to ":[" jusqu'à "],"itinerary\u0004Depart":["Départ"],"itinerary\u0004depart":["Départ"]}}});

require.define("otpjs/lib/locale/it.json", {"domain":"messages","locale_data":{"messages":{"":{"domain":"messages","plural_forms":"nplurals=2; plural=(n != 1);","lang":"it"},"Take roundabout %(relativeDirection)s to %(ordinal_exit_number)s exit on %(streetName)s":["Prendere la rotonda in senso %(relativeDirection)s, %(ordinal_exit_number)s uscita,  %(streetName)s"],"Start on <b>%(streetName)s</b> heading %(absoluteDirection)s":["Partenza su <b>%(streetName)s</b> in direzione %(absoluteDirection)s"],"<b>%(relativeDirection)s</b> to continue on <b>%(streetName)s</b>":["<b>%(relativeDirection)s</b> continua su <b>%(streetName)s</b>"],"<b>%(relativeDirection)s</b> on to <b>%(streetName)s</b>":["<b>%(relativeDirection)s</b> su <b>%(streetName)s</b>"],"Print Itinerary":[""],"Option":["Opzioni di viaggio"],"Time in transit":["Tempo a bordo"],"Alight":["Scendi"],"Drag start and end location pins on the map or use the form above to adjust trip settings.":[""],"<strong>To plan a trip:</strong> select a start and end location by clicking the map or by entering an address above.":[""],"Start Address":[""],"End Address":[""],"Hide Settings":[""],"Show Settings":[""],"Arrive at":["Arrivo"],"Depart by":["Partenza"],"Travel by":["Modalità"],"Transit":["Mezzi pubblici"],"Rail Only":["Solo Treno"],"Bus Only":["Solo Bus"],"Walk Only":["A piedi"],"Bicycle Only":["In bici"],"Find":[""],"Quickest trip":[""],"Fewest transfers":["Cambi"],"Wheelchair accessible trip":["Percorso accessibile"],"Maximum walk":["Max dist a piedi"],"Maximum bike":["Max dist in bici"],"Select language":[""],"Submit":[""],"Searching":["Cerca"],"First":["Primo"],"Previous":["Precedente"],"Next":["Successivo"],"Last":["Ultimo"],"Set as Start Location":["Imposta Partenza"],"Set as End Location":["Imposta Arrivo"],"From":[""],"To":[""],"marker location":[""],"Start":[""],"End":[""],"Click the map or enter an address to select a start location":[""],"Click the map or enter an address to select an end location":[""],"No transit trips found within 5 miles of your search, try adjusting your start or end locations. Only major metropolitan areas are currently covered. Please check back for expanded data coverage.":[""],"Problem finding results for those locations. Please enter a valid start and end location.":[""],"Unable to plan trip.":[""],"Quick":["Veloce"],"Flat":["Pianeggiante"],"Bike Friendly":["Sicuro"],"B":["S"],"F":["P"],"Q":["V"],"first":["prima"],"second":["seconda"],"third":["terza"],"fourth":["quarta"],"fifth":["quinta"],"sixth":["sesta"],"seventh":["settima"],"eight":["ottava"],"ninth":["nona"],"tenth":["decima"],"north":["nord"],"northeast":["nord-est"],"east":["est"],"southeast":["sud-est"],"south":["sud"],"southwest":["sud-ovest"],"west":["ovest"],"northwest":["nod-ovest"],"clockwise":["orario"],"counter clockwise":["antiorario"],"hard left":["a sinistra"],"left":["a sinistra"],"slight left":["tenere la sinistra"],"continue":["continuare"],"slight right":["tenere la destra"],"right":["a destra"],"hard right":["a destra"],"elevator":["ascensore"],"U-turn left":["inversione di marcia"],"U-turn right":["inversione di marcia"],"bus_direction\u0004 to ":[" in direzione "],"direction\u0004 to ":[" fino a "],"itinerary\u0004Depart":["Parti da"],"itinerary\u0004depart":["Partenza"]}}});

require.define("otpjs/lib/locale/sl.json", {"domain":"messages","locale_data":{"messages":{"":{"domain":"messages","plural_forms":"nplurals=4; plural=(n%100==1 ? 1 : n%100==2 ? 2 : n%100==3 || n%100==4 ? 3 : 0);","lang":"sl"},"Take roundabout %(relativeDirection)s to %(ordinal_exit_number)s exit on %(streetName)s":["V krožišču vozite %(relativeDirection)s in pri %(ordinal_exit_number)s izvozu zavijte na %(streetName)s"],"Start on <b>%(streetName)s</b> heading %(absoluteDirection)s":["Začnite na <b>%(streetName)s</b> v smeri %(absoluteDirection)s"],"<b>%(relativeDirection)s</b> to continue on <b>%(streetName)s</b>":["<b>%(relativeDirection)s</b> nadaljujte na <b>%(streetName)s</b>"],"<b>%(relativeDirection)s</b> on to <b>%(streetName)s</b>":["<b>%(relativeDirection)s</b> na <b>%(streetName)s</b>"],"Print Itinerary":["Natisni načrt poti"],"Option":["Različica"],"Time in transit":["Časa na vožnji"],"Alight":["Izstop"],"Drag start and end location pins on the map or use the form above to adjust trip settings.":[""],"<strong>To plan a trip:</strong> select a start and end location by clicking the map or by entering an address above.":[""],"Start Address":["Naslov začetka"],"End Address":["Naslov cilja"],"Hide Settings":["Skrij nastavitve"],"Show Settings":["Pokaži nastavitve"],"Arrive at":["Prihod do"],"Depart by":["Odhod od"],"Travel by":["Način potovanja "],"Transit":["Javni prevoz"],"Rail Only":["Vlak"],"Bus Only":["Avtobus"],"Walk Only":["Pešačenje"],"Bicycle Only":["Kolo"],"Find":["Poišči"],"Quickest trip":["Najhitrejšo pot"],"Fewest transfers":["čim manj prestopov"],"Wheelchair accessible trip":["Primerno za invalidske vozičke"],"Maximum walk":["Največja razdalja peš"],"Maximum bike":["Največja razdalja kolesarjenja"],"Select language":[""],"Submit":["Pošlji"],"Searching":["Iskanje"],"First":["Prva"],"Previous":["Prejšnja"],"Next":["Naslednja"],"Last":["Zadnja"],"Set as Start Location":["Začetek poti"],"Set as End Location":["Konec poti"],"From":["Od"],"To":["Do"],"marker location":["točke na zemljevidu"],"Start":["Izhodišče"],"End":["Cilj"],"Click the map or enter an address to select a start location":[""],"Click the map or enter an address to select an end location":[""],"No transit trips found within 5 miles of your search, try adjusting your start or end locations. Only major metropolitan areas are currently covered. Please check back for expanded data coverage.":[""],"Problem finding results for those locations. Please enter a valid start and end location.":[""],"Unable to plan trip.":[""],"Quick":["Hitro"],"Flat":["Položno"],"Bike Friendly":["Kolesarju prijazno"],"B":["K"],"F":["P"],"Q":["H"],"first":["prvem"],"second":["drugem"],"third":["tretjem"],"fourth":["četrtem"],"fifth":["petem"],"sixth":["šestem"],"seventh":["sedmem"],"eight":["osmem"],"ninth":["devetem"],"tenth":["desetem"],"north":["sever"],"northeast":["severovzhod"],"east":["vzhod"],"southeast":["jugovzhod"],"south":["jug"],"southwest":["jugozahod"],"west":["zahod"],"northwest":["severozahod"],"clockwise":["v smeri urinega kazalca"],"counter clockwise":["v nasprotni smeri urinega kazalca"],"hard left":["ostro levo"],"left":["levo"],"slight left":["rahlo levo"],"continue":["nadaljujte"],"slight right":["rahlo desno"],"right":["desno"],"hard right":["ostro desno"],"elevator":["pojdite z dvigalom"],"U-turn left":["Polkrožno obrnite v levo"],"U-turn right":["Polkrožno obrnite v desno"],"bus_direction\u0004 to ":[" smer "],"direction\u0004 to ":[" do "],"itinerary\u0004Depart":["Odhod"],"itinerary\u0004depart":["začni pot"]}}});

require.define("otpjs/lib/locale/de.json", {"domain":"messages","locale_data":{"messages":{"":{"domain":"messages","plural_forms":"nplurals=2; plural=(n != 1);","lang":"de"},"Take roundabout %(relativeDirection)s to %(ordinal_exit_number)s exit on %(streetName)s":[""],"Start on <b>%(streetName)s</b> heading %(absoluteDirection)s":[""],"<b>%(relativeDirection)s</b> to continue on <b>%(streetName)s</b>":["<b>%(relativeDirection)s</b> weiter auf <b>%(streetName)s</b>"],"<b>%(relativeDirection)s</b> on to <b>%(streetName)s</b>":[""],"Print Itinerary":[""],"Option":["Einstellungen für Routensuche"],"Time in transit":[""],"Alight":[""],"Drag start and end location pins on the map or use the form above to adjust trip settings.":[""],"<strong>To plan a trip:</strong> select a start and end location by clicking the map or by entering an address above.":[""],"Start Address":[""],"End Address":[""],"Hide Settings":[""],"Show Settings":[""],"Arrive at":["Ankunft"],"Depart by":["Abfahrt"],"Travel by":["Fortbewegungsart/Verkehrsmittel"],"Transit":["ÖPNV"],"Rail Only":["nur Bahn"],"Bus Only":["nur Bus"],"Walk Only":["zu Fuß"],"Bicycle Only":["Fahrrad"],"Find":[""],"Quickest trip":[""],"Fewest transfers":["Umsteigepunkt"],"Wheelchair accessible trip":["barrierefreie Route"],"Maximum walk":["maximale Gehstrecke"],"Maximum bike":["maximale Fahrradstrecke"],"Select language":[""],"Submit":[""],"Searching":[""],"First":["Erster"],"Previous":["Vorheriger"],"Next":["Nächster"],"Last":["Letzter"],"Set as Start Location":[""],"Set as End Location":[""],"From":[""],"To":[""],"marker location":[""],"Start":[""],"End":[""],"Click the map or enter an address to select a start location":[""],"Click the map or enter an address to select an end location":[""],"No transit trips found within 5 miles of your search, try adjusting your start or end locations. Only major metropolitan areas are currently covered. Please check back for expanded data coverage.":[""],"Problem finding results for those locations. Please enter a valid start and end location.":[""],"Unable to plan trip.":[""],"Quick":["Schnellste"],"Flat":["Flach"],"Bike Friendly":["Fahrradgeeignet"],"B":["F"],"F":["Fl"],"Q":["S"],"first":["Erster"],"second":[""],"third":[""],"fourth":[""],"fifth":[""],"sixth":[""],"seventh":[""],"eight":["Gewichtung"],"ninth":[""],"tenth":[""],"north":["nord"],"northeast":["nordost"],"east":["ost"],"southeast":["südost"],"south":["süd"],"southwest":["südwest"],"west":["west"],"northwest":["nordwest"],"clockwise":[""],"counter clockwise":[""],"hard left":["scharf links"],"left":["links"],"slight left":["links halten"],"continue":["weiter auf"],"slight right":["rechts halten"],"right":["rechts"],"hard right":["scharf rechts"],"elevator":[""],"U-turn left":["scharf links"],"U-turn right":["scharf rechts"],"bus_direction\u0004 to ":[""],"direction\u0004 to ":[""],"itinerary\u0004Depart":["Abfahrt"],"itinerary\u0004depart":["Abfahrt"]}}});

require.define("otpjs/lib/locale/ca_ES.json", {"domain":"messages","locale_data":{"messages":{"":{"domain":"messages","plural_forms":"nplurals=2; plural=(n != 1);","lang":"ca_ES"},"Take roundabout %(relativeDirection)s to %(ordinal_exit_number)s exit on %(streetName)s":[""],"Start on <b>%(streetName)s</b> heading %(absoluteDirection)s":[""],"<b>%(relativeDirection)s</b> to continue on <b>%(streetName)s</b>":["<b>%(relativeDirection)s</b> per a continuar a <b>%(streetName)s</b>"],"<b>%(relativeDirection)s</b> on to <b>%(streetName)s</b>":[""],"Print Itinerary":[""],"Option":[""],"Time in transit":[""],"Alight":[""],"Drag start and end location pins on the map or use the form above to adjust trip settings.":[""],"<strong>To plan a trip:</strong> select a start and end location by clicking the map or by entering an address above.":[""],"Start Address":[""],"End Address":[""],"Hide Settings":[""],"Show Settings":[""],"Arrive at":["Arribada a"],"Depart by":["Sortida des de"],"Travel by":["Mode de viatge"],"Transit":["Transport públic"],"Rail Only":["Només tren"],"Bus Only":["Només bus"],"Walk Only":["Només a peu"],"Bicycle Only":["Bicicleta"],"Find":[""],"Quickest trip":[""],"Fewest transfers":["transbords"],"Wheelchair accessible trip":["Viatge amb accessibilitat"],"Maximum walk":["Màxima distància fins la parada"],"Maximum bike":["Màxima distància anb bicicleta"],"Select language":[""],"Submit":[""],"Searching":[""],"First":[""],"Previous":[""],"Next":[""],"Last":[""],"Set as Start Location":[""],"Set as End Location":[""],"From":[""],"To":[""],"marker location":[""],"Start":[""],"End":[""],"Click the map or enter an address to select a start location":[""],"Click the map or enter an address to select an end location":[""],"No transit trips found within 5 miles of your search, try adjusting your start or end locations. Only major metropolitan areas are currently covered. Please check back for expanded data coverage.":[""],"Problem finding results for those locations. Please enter a valid start and end location.":[""],"Unable to plan trip.":[""],"Quick":[""],"Flat":[""],"Bike Friendly":[""],"B":[""],"F":[""],"Q":[""],"first":[""],"second":[""],"third":[""],"fourth":[""],"fifth":[""],"sixth":[""],"seventh":[""],"eight":["gira a la dreta"],"ninth":[""],"tenth":[""],"north":["nord"],"northeast":["nord-est"],"east":["est"],"southeast":["sud-est"],"south":["sud"],"southwest":["sud-oest"],"west":["oest"],"northwest":["nord-oest"],"clockwise":[""],"counter clockwise":[""],"hard left":["gira completament a la esquerra"],"left":["gira a la esquerra"],"slight left":["gira lleugerament a la esquerra"],"continue":["per a continuar a"],"slight right":["gira lleugerament a la dreta"],"right":["gira a la dreta"],"hard right":["gira completament a la dreta"],"elevator":[""],"U-turn left":["gira completament a la esquerra"],"U-turn right":["gira completament a la dreta"],"bus_direction\u0004 to ":[""],"direction\u0004 to ":[""],"itinerary\u0004Depart":["Sortida des de"],"itinerary\u0004depart":["Sortida des de"]}}});

require.define("otpjs/lib/templates/access-leg.html", "<div class=\"otp-leg\">\n  <div class=\"otp-legHeader\">\n    <span style=\"float:right;\">{{formatDuration duration}}</span>\n    <b><div class=\"otp-legMode-icon otp-legMode-icon-{{ mode }}\"></div><span class=\"otp-legMode-title\">{{mode}}</span></b>{{! TRANSLATORS: Used in narrative \"to\" target place name in cycling, walking, driving }}\n\t{{__pgettext \"direction\" \" to \"}}{{to.name}}\n  </div>\n  <div class=\"otp-legBody\"></div>\n</div>\n");

require.define("otpjs/lib/templates/generic-leg.html", "<div class=\"otp-leg\">\n  <div class=\"otp-legHeader\">\n    <span style=\"float:right;\">{{formatDuration duration}}</span>\n    <b><div class=\"otp-legMode-icon otp-legMode-icon-{{ mode }}\"></div><span class=\"otp-legMode-title\">{{mode}}</span></b>{{__pgettext \"direction\" \" to \"}}{{to.name}}\n  </div>\n</div>\n");

require.define("otpjs/lib/templates/leg-from-bubble.html", "<div class=\"otp-legBubble-icon-topRow-{{orientation}}\">\n  <div class=\"otp-legBubble-arrow-right\" style=\"float: left; margin-left:4px;\"></div>\n  <div style=\"width: 16px; height: 16px; margin-left: 12px;\">\n    <div class=\"otp-modeIcon-{{mode}}\" style=\"margin: auto auto;\"></div>\n    <div class=\"otp-routeShortName\">{{routeShortName}}</div>\n  </div>\n</div>\n{{{formatTime from.departure format=\"h:mm\"}}}");

require.define("otpjs/lib/templates/map-context-menu.html", "<div class=\"otp-mapContextMenu\">\n\t{{! TRANSLATORS: Context menu }}\n  <div class=\"otp-mapContextMenuItem setStartLocation\">{{_ \"Set as Start Location\"}}</div>\n\t{{! TRANSLATORS: Context menu }}\n  <div class=\"otp-mapContextMenuItem setEndLocation\">{{_ \"Set as End Location\"}}</div>\n</div>\n");

require.define("otpjs/lib/templates/narrative-adjust.html", "<div class=\"messageWell well\">\n  <span class=\"text-info\">{{_ \"Drag start and end location pins on the map or use the form above to adjust trip settings.\"}}</span>\n</div>\n<div class=\"itineraries\"></div>\n");

require.define("otpjs/lib/templates/narrative-error.html", "<div class=\"messageWell well\">\n  <span class=\"text-danger\">{{message}}</span>\n</div>\n<div class=\"itineraries\"></div>");

require.define("otpjs/lib/templates/narrative-new.html", "<div class=\"messageWell well\">\n  <span class=\"text-info\">\n    {{{_ \"<strong>To plan a trip:</strong> select a start and end location by clicking the map or by entering an address above.\"}}}\n  </span>\n</div>\n<div class=\"itineraries\"></div>\n");

require.define("otpjs/lib/templates/narrative-itinerary.html", "<div class=\"well\">\n  <div class=\"otp-itinHeader\">\n    <span class=\"pull-right\">\n      {{formatDuration duration}}<br>\n\t  <a href=\"#\" class=\"print\" title=\"{{_ \"Print Itinerary\"}}\"><span class=\"glyphicon glyphicon-print\"></span></a>\n    </span>\n\t{{!-- TRANSLATORS: One returned itinerary in narrative (Option 1, Option 2) You can choose among different ones--}}\n    {{_ \"Option\"}} {{index}}:\n    {{#each legs}}\n    <nobr {{#if attributes.routeColor }}style=\"background-color:#{{attributes.routeColor}};color:#{{attributes.routeTextColor}};\"{{/if}}>\n      <div class=\"otp-legMode-icon otp-legMode-icon-{{ attributes.mode }}\"></div>\n      {{#if attributes.routeShortName }}{{attributes.routeShortName}}{{/if}}\n      {{#unless @last}}\n      <div class=\"otp-legMode-icon otp-legMode-icon-arrow-right\"></div>\n      {{/unless}}\n    </nobr>\n    {{/each}}\n    <br>\n    <span>{{formatTime startTime timeOffset}} - {{formatTime endTime timeOffset}}</span>\n  </div>\n  <div class=\"otp-itinBody\"></div>\n</div>\n");

require.define("otpjs/lib/templates/request-form.html", "<div class=\"form-horizontal\">\n  <div class=\"visibleSettings\">\n    <div class=\"form-group fromPlaceControl\">\n      <div class=\"col-sm-12\">\n        <input id=\"fromPlace\" class=\"form-control apiParam\" placeholder=\"{{_ \"Start Address\"}}\">\n      </div>\n    </div>\n\n    <div class=\"form-group toPlaceControl\">\n      <div class=\"col-sm-12\">\n        <input id=\"toPlace\" class=\"form-control apiParam\" placeholder=\"{{_ \"End Address\"}}\">\n      </div>\n    </div>\n  </div>\n\n  <div class=\"form-group request-form-buttons\">\n    <div class=\"col-sm-3\">\n      <button class=\"btn btn-default btn-block reverse-direction\" title=\"Reverse direction\"><span class=\"glyphicon glyphicon-retweet\"></span></button>\n    </div>\n    <div class=\"col-sm-9\">\n      <button id=\"hideSettings\" class=\"btn toggleSettings btn-default btn-block\">{{_ \"Hide Settings\"}} <span class=\"glyphicon glyphicon-chevron-up\"></span></button>\n      <button id=\"showSettings\" class=\"btn toggleSettings btn-default btn-block\">{{_ \"Show Settings\"}} <span class=\"glyphicon glyphicon-chevron-down\"></span></button>\n    </div>\n  </div>\n\n  <div id=\"hidableSettings\">\n    <div class=\"form-group arriveByControl\">\n      <div class=\"col-sm-12\">\n        <select id=\"arriveBy\" class=\"apiParam form-control\" placeholder=\"Arrive\">\n\t\t\t{{! TRANSLATORS: Arrive at [time dropdown] [date dropdown]. Used in dropdown as a label to choose wanted time/date of arrival. }}\n          <option value=\"true\">{{_ \"Arrive at\"}}</option>\n\t\t  {{! TRANSLATORS:  Depart by [time dropdown] [date dropdown]. Used in dropdown as a label to choose wanted time/date of departure }}\n          <option value=\"false\" selected>{{_ \"Depart by\"}}</option>\n        </select>\n      </div>\n    </div>\n\n    <div class=\"form-group timeControl\">\n      <div class=\"col-sm-12\">\n        <div class=\"input-group date\" id=\"time\">\n          <input type=\"text\" class=\"form-control apiParam\" data-format=\"HH:mm PP\">\n          <span class=\"input-group-addon\">\n            <span class=\"glyphicon glyphicon-time\"></span>\n          </span>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"form-group dateControl\">\n      <div class=\"col-sm-12\">\n        <div class=\"input-group date\" id=\"date\">\n          <input type=\"text\" class=\"form-control apiParam\">\n          <span class=\"input-group-addon\">\n            <span class=\"glyphicon glyphicon-time\"></span>\n          </span>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"form-group travelByControl\">\n\t\t{{! TRANSLATORS: Label for dropdown Travel by: [mode of transport] }}\n      <label for=\"mode\" class=\"col-sm-4 control-label\">{{_ \"Travel by\"}}</label>\n      <div class=\"col-sm-8\">\n        <select id=\"mode\" class=\"apiParam form-control\" placeholder=\"Arrive\">\n\t\t\t{{! TRANSLATORS: Public transit transport mode. (Used in selection in Travel Options widgets)}}\n          <option value=\"TRANSIT,WALK\" selected>{{_ \"Transit\"}}</option>\n\t\t  {{! TRANSLATORS: Rail like transport mode (train, subway, tram etc.}}\n          <option value=\"TRAINISH,WALK\">{{_ \"Rail Only\"}}</option>\n\t\t  {{! TRANSLATORS: Bus travel mode (Used in selection in Travel Options widgets) }}\n          <option value=\"BUS,WALK\">{{_ \"Bus Only\"}}</option>\n\t\t  {{! TRANSLATORS: Walking travel mode (Used in selection in Travel Options widgets) }}\n          <option value=\"WALK\">{{_ \"Walk Only\"}}</option>\n\t\t  {{! TRANSLATORS: Cycling travel mode (Used in selection in Travel Options widgets) }}\n          <option value=\"BICYCLE\">{{_ \"Bicycle Only\"}}</option>\n\t\t  {{! TRANSLATORS: Cycling and public transit travel mode (Used in selection in Travel Options widgets) }}\n          <option value=\"TRANSIT,BICYCLE\">Transit &amp; Bike</option>\n        </select>\n      </div>\n    </div>\n\n    <div class=\"form-group optimizeControl\">\n\t\t{{! TRANSLATORS: How to optimize transit options: Find (Quickest trip| Fewest transfers) }}\n      <label for=\"type\" class=\"col-sm-4 control-label\">{{_ \"Find\"}}</label>\n      <div class=\"col-sm-8\">\n        <select id=\"optimize\" class=\"apiParam form-control\" placeholder=\"Arrive\">\n\t\t{{! TRANSLATORS: How to optimize transit options: Find (Quickest trip| Fewest transfers) optimize for shortest trip according tot ime }}\n          <option value=\"QUICK\" selected>{{_ \"Quickest trip\"}}</option>\n\t\t{{! TRANSLATORS: How to optimize transit options: Find (Quickest trip| Fewest transfers) optimize for smallest number of transfers }}\n          <option value=\"TRANSFERS\">{{_ \"Fewest transfers\"}}</option>\n        </select>\n      </div>\n    </div>\n\n    <div class=\"form-group\">\n      <div class=\"col-sm-offset-4 col-sm-8\">\n        <div class=\"checkbox\">\n          <label>\n\t\t\t  {{! TRANSLATORS: Checkbox label }}\n            <input type=\"checkbox\" name=\"wheelchairAccessible\" id=\"wheelchairAccessible\"> {{_ \"Wheelchair accessible trip\"}}\n          </label>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"form-group maxWalkControl\">\n\t\t{{! TRANSLATORS: label for choosing how much should person's trip on foot be }}\n      <label for=\"maxWalkDist\" class=\"col-sm-4 control-label\">{{_ \"Maximum walk\"}}</label>\n      {{#metric}}\n      <div class=\"col-sm-8\">\n        <select id=\"maxWalkDistance\" class=\"apiParam form-control\" placeholder=\"Arrive\">\n          <option value=\"250\">1/4 km</option>\n          <option value=\"500\">1/2 km</option>\n          <option value=\"1000\" selected>1 km</option>\n          <option value=\"2500\">2.5 km</option>\n          <option value=\"5000\">5 km</option>\n        </select>\n      </div>\n      {{/metric}}\n\n      {{^metric}}\n      <div class=\"col-sm-8\">\n        <select id=\"maxWalkDistance\" class=\"apiParam form-control\" placeholder=\"Arrive\">\n          <option value=\"402\">1/4 mile</option>\n          <option value=\"804\">1/2 mile</option>\n          <option value=\"1223\">3/4 mile</option>\n          <option value=\"1609\">1 mile</option>\n          <option value=\"3218\">2 miles</option>\n          <option value=\"4828\">3 miles</option>\n          <option value=\"8047\" selected>5 miles</option>\n        </select>\n      </div>\n      {{/metric}}\n    </div>\n\n    <div class=\"form-group maxBikeControl\">\n      <label class=\"col-sm-4 control-label\" for=\"maxWalkDist\">{{_ \"Maximum bike\"}}</label>\n\n      {{#metric}}\n      <div class=\"col-sm-8\">\n\t\t  {{! TRANSLATORS: label for choosing how much should person's trip on bicycle be }}\n        <select id=\"maxBikeDistance\" class=\"apiParam form-control\" placeholder=\"Arrive\">\n          <option value=\"1000\">1 km</option>\n          <option value=\"2500\">2.5 km</option>\n          <option value=\"5000\" selected>5 km</option>\n          <option value=\"10000\">10 km</option>\n          <option value=\"15000\">15 km</option>\n        </select>\n      </div>\n      {{/metric}}\n\n      {{^metric}}\n      <div class=\"col-sm-8\">\n        <select id=\"maxBikeDistance\" class=\"apiParam form-control\" placeholder=\"Arrive\">\n          <option value=\"804\">1/2 mile</option>\n          <option value=\"1609\">1 mile</option>\n          <option value=\"4026\" selected>2.5 miles</option>\n          <option value=\"8047\">5 miles</option>\n          <option value=\"16093\">10 miles</option>\n        </select>\n      </div>\n      {{/metric}}\n    </div>\n\n    <div class=\"bikeTriangleControl\">\n      <div id=\"bikeTriangle\" style=\"height: 110px; cursor: pointer;\"></div>\n    </div>\n  </div>\n\n  <div class=\"form-group languageSelectionControl\">\n\t{{! TRANSLATORS: label for choosing wanted language }}\n\t<label for=\"languageSelect\" class=\"col-sm-4 control-label\">{{_ \"Select language\"}}</label>\n\t<div class=\"col-sm-8\">\n\t  <select id=\"languageSelect\" class=\"apiParam form-control\" placeholder=\"Select Language\">\n\t  </select>\n\t</div>\n\n  <div class=\"form-group request-form-search-buttons\">\n    <div class=\"col-sm-12\">\n\t\t{{! TRANSLATORS: send query to the server (button label) }}\n      <button class=\"search-button btn btn-primary btn-block\">{{_ \"Submit\"}} <span class=\"glyphicon glyphicon-search\"></span></button>\n      <div class=\"searching-button hidden\">\n\t\t  {{! TRANSLATORS: button label when query is being processed by a server }}\n        <button class=\"btn btn-primary btn-block disabled\" diabled>{{_ \"Searching\"}} <span class=\"glyphicon glyphicon-refresh spin\"></span></button>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"nextPreviousLast hidden\">\n    <div class=\"btn-group btn-group-justified\">\n\t\t{{! TRANSLATORS: button to first itinerary }}\n      <a class=\"btn btn-sm btn-default first\"><i class=\"glyphicon glyphicon-fast-backward\"></i> {{_ \"First\"}}</a>\n\t\t{{! TRANSLATORS: button to previous itinerary }}\n      <a class=\"btn btn-sm btn-default previous\"><i class=\"glyphicon glyphicon-backward\"></i> {{_ \"Previous\"}}</a>\n\t\t{{! TRANSLATORS: button to next itinerary }}\n      <a class=\"btn btn-sm btn-default next\">{{_ \"Next\"}} <i class=\"glyphicon glyphicon-forward\"></i></a>\n\t\t{{! TRANSLATORS: button to last itinerary }}\n      <a class=\"btn btn-sm btn-default last\">{{_ \"Last\"}} <i class=\"glyphicon glyphicon-fast-forward\"></i></a>\n    </div>\n  </div>\n</div>\n");

require.define("otpjs/lib/templates/step.html", "<div class=\"otp-legStep-row\">\n  <div class=\"otp-legStep-icon otp-legStep-icon-{{relativeDirection}}\"></div>\n  <div class=\"otp-legStep-dist\">\n    <span style=\"font-weight:bold; font-size: 1.2em;\">{{distanceValue}}</span><br>{{distanceUnit}}\n  </div>\n  <div class=\"otp-legStep-text\">\n  {{#if isRoundabout}}\n    {{!-- relativeDirection can be clock wise or counter clockwise --}}\n    {{_ \"Take roundabout %(relativeDirection)s to %(ordinal_exit_number)s exit on %(streetName)s\" relativeDirection=localRelativeDirection ordinal_exit_number=localExit streetName=streetName }}\n  {{else}}\n    {{#if isFirst}}\n\t  {{{_ \"Start on <b>%(streetName)s</b> heading %(absoluteDirection)s\" streetName=streetName absoluteDirection=localAbsoluteDirection}}}\n    {{else}}\n      {{#if stayOn}}\n\t    {{{_ \"<b>%(relativeDirection)s</b> to continue on <b>%(streetName)s</b>\" relativeDirection=localRelativeDirection streetName=streetName }}}\n      {{else}}\n\t    {{{_ \"<b>%(relativeDirection)s</b> on to <b>%(streetName)s</b>\" relativeDirection=localRelativeDirection streetName=streetName }}}\n      {{/if}}\n    {{/if}}\n  {{/if}}\n  </div>\n  <div style=\"clear:both;\"></div>\n</div>\n");

require.define("otpjs/lib/templates/transit-leg.html", "<div class=\"otp-leg\">\n  <div class=\"otp-legHeader\" {{#if routeColor }}style=\"background-color:#{{routeColor}};color:#{{routeTextColor}};\"{{/if}}>\n    <div class=\"agencyBranding\" style=\"background-image: url({{agencyLogoUrl}});\"></div>\n    <span><b><a target=\"_blank\" href=\"{{agencyUrl}}\">{{agencyName}}</a></b></span>\n\t<b><div class=\"otp-legMode-icon otp-legMode-icon-{{ mode }}\"></div>\n\t\t{{routeShortName}}</b> {{routeLongName}}{{#if headsign}}{{! TRANSLATORS: used in sentence like: <Long name of public transport route> \"to\" <Public transport headsign>. Used in showing itinerary }}{{__pgettext \"bus_direction\" \" to \"}}{{headsign}}{{else}}{{! TRANSLATORS: used in a sentence like: Long name of public transport \"to\" alight station }}{{__pgettext \"direction\" \" to \"}}{{to.name}}{{/if}}\n  </div>\n  {{#each alerts}}\n    <div class=\"alert alert-warning\">{{alertDescriptionText.someTranslation}}</div>\n  {{/each}}\n  <div class=\"otp-legBody\">\n    <div class=\"otp-transitLeg-leftCol\">{{formatTime startTime timeOffset}}\n      <div class=\"OTPLeg-showTimes hidden\">\n        <a href=\"#\" class=\"showTimes\">times...</a>\n        <div class=\"OTPLeg-times\"></div>\n      </div>\n    </div>\n\t{{! TRANSLATORS: Depart station/ Board at station in itinerary }}\n    <div class=\"otp-transitLeg-endpointDesc otp-from\"><b>{{__pgettext \"itinerary\" \"Depart\"}}</b>: {{from.name}}</div>\n    {{#if from.stopId.id}}<div class=\"otp-transitLeg-endpointDescSub\">Stop #{{from.stopId.id}}</div>{{/if}}\n    <div class=\"otp-transitLeg-buffer\"></div>\n    <div class=\"otp-transitLeg-elapsedDesc clearfix\"><i>{{_ \"Time in transit\"}}: {{formatDuration duration}}</i></div>\n    <div class=\"otp-transitLeg-buffer\"></div>\n    <div class=\"otp-transitLeg-leftCol\">{{formatTime endTime timeOffset}}</div>\n\t{{! TRANSLATORS: Alight transit stop name (stop where user needs to leave the vehicle }}\n    <div class=\"otp-transitLeg-endpointDesc otp-to\"><b>{{_ \"Alight\"}}</b>: {{to.name}}</div>\n  </div>\n</div>\n");

require.modules["otpjs"] = require.modules["otpjs"];


require("otpjs");

/**
 * consoleMemory
 *
 * This global function lets you retrieve previous `console.log` and
 * `console.error` outputs in a stringified format.
 *
 * This is achieved by installing proxy functions that replace the original
 * console methods. The proxy functions stringify and push the received
 * arguments to a private variable and pass the original arguments to the
 * real console method (so your console keeps working just the way it used to).
 *
 * Signature:
 *     consoleMemory(outputName[, from[, howMany]][, breakDownLines])
 *
 * Examples:
 * 1. Output all memorized `console.log` actions:
 *     consoleMemory('log');
 * 2. Output all memorized `console.error` actions and break down each output
 * line:
 *     consoleMemory('error', true);
 * 3. Output last 3 memorized `console.error` actions:
 *     consoleMemory('error', -3);
 * 4. Output every memorized `console.error` actions from the 5th:
 *     consoleMemory('error', 5);
 * 5. Output 3 memorized `console.error` actions from the 5th
 *     consoleMemory('error', 5, 3);
 * 6. Output 3 memorized `console.error` actions starting from the action that
 * was 5th from the last and break down each output line:
 *     consoleMemory('error', -5, 3, true);
 */
(function () {
  var DEPTH_LIMIT         = 3,
      ELEMENT_COUNT_LIMIT = 20,
      STRING_SIZE_LIMIT   = 500;


  var memory = {};


  function stingifyArray(list, level) {
    var i, len, left,
        res = [];

    for (i = 0, len = list.length; i < len && i < ELEMENT_COUNT_LIMIT; i += 1) {
      res.push(stingifyValue(list[i], level));
    }

    left = list.length - ELEMENT_COUNT_LIMIT;
    if (left > 0) {
      res.push(' + ' + left + ' more element' + (left > 1 ? 's' : ''));
    }

    if (level > 0) {
      return res.join(', ');
    }

    res.unshift(timeStamp());
    return res;
  }

  function stingifyObject(obj, level) {
    var i, key, left,
        str = '';

    i = 0;
    if (obj instanceof Error && !Object.hasOwnProperty(obj, 'message')) {
      str += 'message: ' + stingifyValue(obj.message, level);
      i += 1;
    }
    for (key in obj) {
      if (i < ELEMENT_COUNT_LIMIT) {
        if (i) {
          str += ', ';
        }
        str += key + ': ' + stingifyValue(obj[key], level);
      }
      i += 1;
    }

    left = i - ELEMENT_COUNT_LIMIT;
    if (left > 0) {
      return str + ' + ' + left + ' more propert' + (left > 1 ? 'ies' : 'y');
    }
    return str;
  }

  function placeholder(count) {
    if (!count) {
      return '';
    }
    return ' (' + count + ' element' + (count > 1 ? 's' : '') + ') ';
  }

  function stingifyValue(value, level) {
    var count, key, name;

    if (Array.isArray(value)) {
      if (level >= DEPTH_LIMIT) {
        return '[' + placeholder(value.length) + ']';
      }
      return '[' + stingifyArray(value, (level || 0) + 1) + ']';
    } else if (value && typeof value === 'object') {
      name = (value && value.constructor && value.constructor.name || '');
      name = (name === 'Object' ? '' : name);
      if (level >= DEPTH_LIMIT) {
        count = 0;
        for (key in value) {
          count += 1;
        }
        return '{' + placeholder(count) + '}';
      }
      return name + '{' + stingifyObject(value, (level || 0) + 1) + '}';
    } else if (typeof value === 'string') {
      if (value.length > STRING_SIZE_LIMIT) {
        return '\'' + value.substr(0, STRING_SIZE_LIMIT) +
               '\'... (length: ' + value.length + ')';
      }
      return '\'' + value + '\'';
    }
    return String(value);
  }

  function multiDigit(n, size) {
    n = String(n);
    while (n.length < (size || 2)) {
      n = '0' + n;
    }
    return n;
  }

  function timeStamp() {
    var d = new Date();
    return d.getFullYear() + '-' + multiDigit(d.getMonth() + 1) + '-' +
           multiDigit(d.getDate()) + ' ' + multiDigit(d.getHours()) + ':' +
           multiDigit(d.getMinutes()) + ':' + multiDigit(d.getSeconds()) + '.' +
           multiDigit(d.getMilliseconds(), 3);
  }


  function consoleTakeover(output) {
    var swap = window.console[output];
    memory[output] = [];
    window.console[output] = function consoleOutput() {
      var args = Array.prototype.slice.call(arguments);
      memory[output].push(stingifyArray(args));
      swap.apply(console, args);
    };
  }

  function consoleMemory(outputName, from, howMany, lineWrap) {
    var i, memlen,
        len = arguments.length,
        mem = memory[outputName],
        str = '';

    if (!(mem instanceof Array)) {
      throw new Error('Argument `outputName` must be \'log\' or \'error\'');
    }

    memlen = mem.length;

    if (typeof arguments[len - 1] === 'boolean') {
      lineWrap = arguments[len - 1];
      len -= 1;
    } else {
      lineWrap = false;
    }

    if (len < 2) {
      from = 0;
    }
    if (typeof from !== 'number' || from !== Math.floor(from)) {
      throw new Error('Argument `from` must be number type and integer');
    }
    if (from < 0)  {
      from = Math.max(0, memlen + from);
    }

    if (len < 3) {
      howMany = memlen;
    }
    if (typeof howMany !== 'number' || howMany < 0 ||
        howMany !== Math.floor(howMany)) {
      throw new Error('Argument `howMany` must be number type and ' +
                      'a positive integer');
    }
    howMany += from;

    for (i = from; i < memlen && i < howMany; i += 1) {
      if (i > from) {
        str += '\n';
      }
      str += mem[i][0] + ' [#' + (i + 1) + ']';
      if (lineWrap) {
        str += '\n  ' + mem[i].slice(1).join('\n  ');
      } else {
        str += ' ' + mem[i].slice(1).join(', ');
      }
    }

    return str;
  }


  consoleTakeover('error');
  consoleTakeover('log');

  window.consoleMemory = consoleMemory;
})();

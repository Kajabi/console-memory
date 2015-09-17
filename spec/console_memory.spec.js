
before(function() {
  function TestClass() {
    this.x = 1;
  }
  TestClass.prototype.y = 2;

  var i,
      offlimit = 'im-off-limit',
      size450  = '',
      size50   = '*you-will-find-me-within-the-500-characters-limit*';

  for (i = 0; i < 9; i += 1) {
    size450 += '01234567890123456789012345678901234567890123456789';
  }


  console.log('hello', 243726);
  console.error('hello', 243726);
  console.log('something1');
  console.log('something2');
  console.log('something3', new Error('erRoRtest'),
              [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
               19, 'last-visible', 'first-invisible', 'xx'],
              {
                level0: {
                  level1: {
                    level2: {
                      level3: 'im-invivible'
                    },
                    visibleKey: ['invisible-xxx', 'elements', 'here'],
                    emptyInvisibleLevelArray: [],
                    msg: 'im-visible'
                  }
                },
                x1: 1, x2: 2, x3: 3, x4: 4, x5: 5, x6: 6, x7: 7, x8: 8, x9: 9,
                y1: 1, y2: 2, y3: 3, y4: 4, y5: 5, y6: 6, y7: 7, y8: 8, y9: 9,
                last: 'im-okay', extra: 'not-okay'
              });
  console.log('something4');
  console.log('something5', new TestClass(), {aa: 1, bb: 2});
  console.log('something6', size450 + size50 + offlimit);
});


describe('consoleMemory', function() {

  it('is available as a global function', function() {
    consoleMemory.should.be.a('function');
  });

  it('stores console.log arguments', function() {
    consoleMemory('log').indexOf('hello').should.be.gt(-1);
    consoleMemory('log').indexOf('243726').should.be.gt(-1);
  });

  it('stores console.error arguments', function() {
    consoleMemory('error').indexOf('hello').should.be.gt(-1);
    consoleMemory('error').indexOf('243726').should.be.gt(-1);
  });

  it('breaks down output lines optionally', function() {
    consoleMemory('log', 3, 1).split('\n').length.should.eq(1);
    consoleMemory('log', 3, 1, true).split('\n').length.should.eq(5);
  });

  it('adds constructor name to object (if available and not \'Object\')',
     function() {
    consoleMemory('log', 5, 1).indexOf('TestClass{').should.be.gt(-1);
    consoleMemory('log', 5, 1).indexOf('x: 1').should.be.gt(-1);
    consoleMemory('log', 5, 1).indexOf('y: 2').should.be.gt(-1);
    consoleMemory('log', 5, 1).indexOf('Object{').should.eq(-1);
    consoleMemory('log', 5, 1).indexOf('aa: 1').should.be.gt(-1);
    consoleMemory('log', 5, 1).indexOf('bb: 2').should.be.gt(-1);
  });

  it('adds message to error object descriptions as property', function() {
    consoleMemory('log', 3, 1).indexOf('Error{message:').should.be.gt(-1);
    consoleMemory('log', 3, 1).indexOf('erRoRtest').should.be.gt(-1);
  });

  it('adds date', function() {
    log_t = (new Date(consoleMemory('log', 0, 1).split(' [')[0])).getTime();
    (log_t - Date.now()).should.be.lt(5000); // < 5 seconds ago
  });

  it('adds line numbers', function() {
    consoleMemory('log', 0, 1).indexOf(' [#1]').should.be.gt(-1);
    consoleMemory('log', 1, 1).indexOf(' [#2]').should.be.gt(-1);
    consoleMemory('log', 2, 1).indexOf(' [#3]').should.be.gt(-1);
    consoleMemory('log', 3, 1).indexOf(' [#4]').should.be.gt(-1);
    consoleMemory('log', 4, 1).indexOf(' [#5]').should.be.gt(-1);
    consoleMemory('log', 5, 1).indexOf(' [#6]').should.be.gt(-1);
    consoleMemory('log', 6, 1).indexOf(' [#7]').should.be.gt(-1);
  });


  describe('size sanity measures', function() {

    it('cuts off arrays with too many elements', function() {
      consoleMemory('log', 3, 1).indexOf('last-visible').should.be.gt(-1);
      consoleMemory('log', 3, 1).indexOf('first-invisible').should.eq(-1);
      consoleMemory('log', 3, 1).indexOf('+ 2 more elements').should.be.gt(-1);
    });

    it('cuts off objects with too many properties', function() {
      consoleMemory('log', 3, 1).indexOf('im-okay').should.be.gt(-1);
      consoleMemory('log', 3, 1).indexOf('not-okay').should.eq(-1);
      consoleMemory('log', 3, 1).indexOf('+ 1 more property').should.be.gt(-1);
    });

    it('cuts off nested objects when they go too deep', function() {
      consoleMemory('log', 3, 1).indexOf('im-visible').should.be.gt(-1);
      consoleMemory('log', 3, 1).indexOf('im-invivible').should.eq(-1);
      consoleMemory('log', 3, 1).indexOf('invisible-xxx').should.eq(-1);
      consoleMemory('log', 3, 1).indexOf('[ (3 elements) ]').should.be.gt(-1);
    });

  });


  describe('signiture check', function() {

    it('requires `log` or `error` as `outputName`', function() {
      (function () { consoleMemory(); }).should.throw();
      (function () { consoleMemory('x'); }).should.throw();
      (function () { consoleMemory('err'); }).should.throw();
      (function () { consoleMemory(true); }).should.throw();
      (function () { consoleMemory(null); }).should.throw();
      (function () { consoleMemory('log'); }).should.not.throw();
      (function () { consoleMemory('error'); }).should.not.throw();
    });

    it('requires number type and integer for `from`', function() {
      (function () { consoleMemory('log', null); }).should.throw();
      (function () { consoleMemory('log', '1'); }).should.throw();
      (function () { consoleMemory('log', 1.1); }).should.throw();
      (function () { consoleMemory('log', 1); }).should.not.throw();
    });

    it('requires number type and positive integer for `howMany`', function() {
      (function () { consoleMemory('log', 1, -1); }).should.throw();
      (function () { consoleMemory('log', 1, 1.1); }).should.throw();
      (function () { consoleMemory('log', 1, '1'); }).should.throw();
      (function () { consoleMemory('log', 1, 1); }).should.not.throw();
    });

  });


  describe('appropriate slicing', function() {

    it('returns everything from record 3', function() {
      consoleMemory('log', 3).indexOf('something2').should.eq(-1);
      consoleMemory('log', 3).indexOf('something3').should.be.gt(-1);
      consoleMemory('log', 3).indexOf('something6').should.be.gt(-1);
    });

    it('returns 2 records from record 3', function() {
      consoleMemory('log', 3, 2).indexOf('something2').should.eq(-1);
      consoleMemory('log', 3, 2).indexOf('something3').should.be.gt(-1);
      consoleMemory('log', 3, 2).indexOf('something4').should.be.gt(-1);
      consoleMemory('log', 3, 2).indexOf('something5').should.eq(-1);
    });

    it('returns last 3 records', function() {
      consoleMemory('log', -3).indexOf('something3').should.eq(-1);
      consoleMemory('log', -3).indexOf('something4').should.be.gt(-1);
      consoleMemory('log', -3).indexOf('something5').should.be.gt(-1);
      consoleMemory('log', -3).indexOf('something6').should.be.gt(-1);
    });

    it('returns first 2 records of the last 3 records', function() {
      consoleMemory('log', -3, 2).indexOf('something3').should.eq(-1);
      consoleMemory('log', -3, 2).indexOf('something4').should.be.gt(-1);
      consoleMemory('log', -3, 2).indexOf('something5').should.be.gt(-1);
      consoleMemory('log', -3, 2).indexOf('something6').should.eq(-1);
    });

    it('is tolerant when exceeding boundary limits', function() {
      consoleMemory('log').split('\n').length.should.eq(7);
      consoleMemory('log', -100).split('\n').length.should.eq(7);
      consoleMemory('log', 1, 100).split('\n').length.should.eq(6);
      consoleMemory('log', -1, 100).split('\n').length.should.eq(1);
    });

  });
});

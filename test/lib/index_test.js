/*jshint expr: true*/
var Urly = require(LIB_DIR);
var querystring = require('querystring');

describe('Urly', function() {
    it('exists', function() {
        Urly.should.exist;
    });

    it('is a constructor', function() {
        Urly.should.be.a('function');
        var urly = new Urly();
        urly.should.be.instanceOf(Urly);
    });

    describe('.map()', function() {
        beforeEach(function() {
            this.urly = new Urly();
        });

        it('returns associated url by exact match', function() {
            this.urly.register('/foo1', function() { return '/bar1'; });
            this.urly.register('/foo2', function() { return '/bar2'; });
            this.urly.register('/foo3', function() { return '/bar3'; });

            this.urly.map('/foo1').should.equal('/bar1');
            this.urly.map('/foo2').should.equal('/bar2');
            this.urly.map('/foo3').should.equal('/bar3');
        });

        it('returns associated url by pattern', function() {
            this.urly.register('/foo/:fooId', function(request) {
                return '/?foo=' + request.params.fooId;
            });
            this.urly.register('/bar/:barId', function(request) {
                return '/?bar=' + request.params.barId;
            });
            this.urly.register('/foo/:fooId/bar/:barId', function(request) {
                return '/?foo=' + request.params.fooId + '&bar=' + request.params.barId;
            });

            this.urly.map('/foo/123').should.equal('/?foo=123');
            this.urly.map('/bar/456').should.equal('/?bar=456');
            this.urly.map('/foo/123/bar/456').should.equal('/?foo=123&bar=456');
        });

        it('returns associated url by query string requirements', function() {
            this.urly.register('/foo?bar&derp', function(request) {
                return '/foo/bar/' + request.query.bar + '/derp/' + request.query.derp;
            });
            this.urly.register('/foo?bar', function(request) {
                return '/foo/bar/' + request.query.bar;
            });
            this.urly.register('/foo?derp', function(request) {
                return '/foo/derp/' + request.query.derp;
            });

            this.urly.map('/foo?bar=123&derp=456').should.equal('/foo/bar/123/derp/456');
            this.urly.map('/foo?bar=123').should.equal('/foo/bar/123');
            this.urly.map('/foo?derp=456').should.equal('/foo/derp/456');
        });

        it('returns associated url by query string requirements while ignoring extra params', function() {
            this.urly.register('/foo?bar', function(request) {
                return '/bar?' + querystring.stringify(request.query);
            });

            this.urly.map('/foo?bar=123&flerp=789').should.equal('/bar?bar=123&flerp=789');
        });

        it('accepts a string to as a pattern target', function() {
            this.urly.register('/foo/:fooId', '/bar/baz/:fooId');
            this.urly.register('/bar/:barId', '/?bar=:barId');
            this.urly.register('/derp/:a?b&c', '/?aa=:a&bb=:b&cc=:c');
            this.urly.register('/users.html?userId', '/users/:userId');

            this.urly.map('/foo/123').should.equal('/bar/baz/123');
            this.urly.map('/bar/123').should.equal('/?bar=123');
            this.urly.map('/derp/123?b=456&c=789').should.equal('/?aa=123&bb=456&cc=789');
            this.urly.map('/users.html?userId=123').should.equal('/users/123');
        });

        it('returns `false` when no match', function() {
            this.urly.register('/foo', function() { return '/bar'; });
            this.urly.map('/unknown').should.be.false;
        });
    });
});

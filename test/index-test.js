import jsdom from 'jsdom';
import { assert } from 'chai';
import sinon from 'sinon';
import ReactDOM from 'react-dom';
import ifReact from 'enzyme-adapter-react-helper/build/ifReact';

import AphroditeComponent from './components/AphroditeComponent';
import {
  renderReactWithAphrodite,
  renderReactWithAphroditeStatic,
} from '..';

describe('renderReactWithAphrodite aphrodite css rendering', () => {
  let originalWindow;
  let originalDocument;
  let result;

  beforeEach(() => {
    originalWindow = global.window;
    originalDocument = global.document;
    result = renderReactWithAphrodite('AC', AphroditeComponent)({
      children: ['Zack'],
      onPress() { console.log('Clicked'); },
    });
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
  });

  it('the markup looks good', () => {
    assert.isString(result);

    assert.ok(/style data-aphrodite/.test(result));
    assert.ok(/Zack/.test(result));
    assert.ok(/data-aphrodite-css/.test(result));
  });

  ifReact('>= 16', it, it.skip)('blows up when calling renderReactWithAphrodite on the client', (done) => {
    jsdom.env(result, (err, window) => {
      if (err) {
        done(err);
        return;
      }

      global.window = window;
      global.document = window.document;


      assert.throws(() => renderReactWithAphrodite('AC', AphroditeComponent));

      delete global.window;
      delete global.document;

      done();
    });
  });

  it('blows up when calling renderReactWithAphrodite on the client (render method)', (done) => {
    jsdom.env(result, (err, window) => {
      if (err) {
        done(err);
        return;
      }

      global.window = window;
      global.document = window.document;

      const sandbox = sinon.createSandbox();
      if (ReactDOM.hydrate) {
        sandbox.stub(ReactDOM, 'hydrate').value(undefined);
      }

      assert.throws(() => renderReactWithAphrodite('AC', AphroditeComponent));

      sandbox.restore();

      delete global.window;
      delete global.document;

      done();
    });
  });
});

describe('renderReactWithAphroditeStatic static aphrodite css rendering', () => {
  let originalWindow;
  let originalDocument;
  let result;

  beforeEach(() => {
    originalWindow = global.window;
    originalDocument = global.document;
    result = renderReactWithAphroditeStatic('AC', AphroditeComponent)({
      children: ['Steven'],
      onPress() {},
    });
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
  });

  describe('on the server', () => {
    it('the output contains styles and component content', () => {
      assert.isString(result);

      assert.ok(/style data-aphrodite/.test(result));
      assert.ok(/Steven/.test(result));
    });

    it('the markup does not contain aphrodite-css info for the client', () => {
      assert.isFalse(/data-aphrodite-css/.test(result));
    });
  });

  describe('on the client', () => {
    it('throws', (done) => {
      jsdom.env(result, (err, window) => {
        if (err) {
          done(err);
          return;
        }

        global.window = window;
        global.document = window.document;

        assert.throws(() => renderReactWithAphroditeStatic('AC', AphroditeComponent), 'functionality does not work');

        done();
      });
    });
  });
});

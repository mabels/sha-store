import * as uuid from 'uuid';
import { assert } from 'chai';
import { FragmentWrite, FragmentType } from '../src/msgs/fragment-write';
import { FragmentWritten } from '../src/msgs/fragment-written';
import { Write } from '../src/msgs/write';
import { Written } from '../src/msgs/written';
import { MsgBus } from '../src/msg-bus';
import { WriteProcessor } from '../src/write-processor';
import { FragmentProcessor } from '../src/fragment-processor';
import { Msg } from '../src/msgs/msg';
import { PouchConnect } from '../src/msgs/pouch-connect';

const pouchConnect: PouchConnect = {
  path: './dist/test/pdb'
};

describe('fragment-write and fragment-written', () => {

  it('fragment-write', () => {
    const fw = new FragmentWrite({
      pouchConnect: pouchConnect,
      tid: 'tid',
      seq: 1,
      size: 4711,
      mimeBlock: 'jojo',
      fragmentType: FragmentType.COMMON | FragmentType.FIRST
    });
    assert.equal(fw.pouchConnect.path, './dist/test/pdb');
    assert.equal(fw.tid, 'tid');
    assert.equal(fw.seq, 1);
    assert.equal(fw.size, 4711);
    assert.equal(fw.mimeBlock, 'jojo');
    assert.equal(fw.fragmentType, FragmentType.COMMON | FragmentType.FIRST);
  });

  it('fragment-written', () => {
    const fw = new FragmentWrite({
      pouchConnect: pouchConnect,
      tid: 'tid',
      seq: 1,
      size: 4711,
      mimeBlock: 'jojo',
      fragmentType: FragmentType.COMMON | FragmentType.FIRST
    });
    const fwn = new FragmentWritten('sha', fw);
    assert.equal(fw.pouchConnect.path, './dist/test/pdb');
    assert.equal(fwn.sha, 'sha');
    assert.equal(fwn.tid, 'tid');
    assert.equal(fwn.seq, 1);
    assert.equal(fwn.size, 4711);
    assert.equal(fwn.fragmentType, FragmentType.COMMON | FragmentType.FIRST);
  });

});

describe('write and written', () => {

  it('Write.string', () => {
    const str = Buffer.from('meno', 'utf8');
    const fw = Write.string(pouchConnect, str.toString(), 'tid');
    assert.equal(fw.pouchConnect.path, './dist/test/pdb');
    assert.equal(fw.tid, 'tid');
    assert.equal(fw.mimeBlock, str.toString('base64'));
  });

  it('Write.base64', () => {
    const str = Buffer.from('meno', 'utf8');
    const fw = Write.base64(pouchConnect, str.toString('base64'), 'tid');
    assert.equal(fw.pouchConnect.path, './dist/test/pdb');
    assert.equal(fw.tid, 'tid');
    assert.equal(fw.mimeBlock, str.toString('base64'));
  });

  it('Write.buffer', () => {
    const str = Buffer.from('meno', 'utf8');
    const fw = Write.buffer(pouchConnect, str, 'tid');
    assert.equal(fw.pouchConnect.path, './dist/test/pdb');
    assert.equal(fw.tid, 'tid');
    assert.equal(fw.mimeBlock, str.toString('base64'));
  });

  it('written', () => {
    const fw = new Written();
    assert.deepEqual(fw.blocks, []);
    assert.equal(fw.isOk(), true);
    assert.deepEqual(fw.errors(), []);
  });

});

describe('write and fragment and complete', () => {
  function writeAction(str: string, bus: MsgBus, tid: string, done: (a?: Error) => void): void {
    const msgBuf: Msg[] = [];
    bus.subscribe(msg => {
      msgBuf.push(msg);
      Written.is(msg).match(wrt => {
        try {
          console.log('xxx', msgBuf);
          assert.ownInclude(msgBuf, [new Written(tid)]);
          done();
        } catch (e) {
          console.log(e);
          done(e);
        }
      });
    });
    bus.next(new Write(pouchConnect, '', tid));
  }

  it('empty write', (done) => {
    const tid = uuid.v4();
    const bus = new MsgBus();
    WriteProcessor.create(bus);
    FragmentProcessor.create(bus);
    let count = 1;
    let action = (e?: Error) => {
      if (e) { done(e); }
      if (--count > 0) {
        writeAction('', bus, tid, action);
      } else {
        done();
      }
    };
    writeAction('', bus, tid, action);
  });

  it('small-block', async () => {
    const tid = uuid.v4();
    const bus = new MsgBus();
    WriteProcessor.create(bus);
    FragmentProcessor.create(bus);
    const msgBuf: Msg[] = [];
    bus.subscribe(msg => {
      msgBuf.push(msg);
      Written.is(msg).match(wrt => {
        assert.deepEqual(msgBuf, []);
      });
    });
    bus.next(new Write(pouchConnect, '', tid));
  });

  it('huge-block', async () => {
    // const tid = uuid.v4();
    const bus = new MsgBus();
    WriteProcessor.create(bus);
    FragmentProcessor.create(bus);

  });
});

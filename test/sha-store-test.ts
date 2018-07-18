import * as uuid from 'uuid';
import { assert } from 'chai';
import {
  MsgBus,
  Processor,
  PouchConnect,
  StringBlock,
  Base64Block,
  BufferBlock,
  Msg,
  WriteRes,
  WriteReq,
  ReadRes,
  ReadReq,
  FragmentType
} from '../src/index';

// import { WriteReq } from '../src/msgs/write-req';
// import { WriteRes } from '../src/msgs/write-res';
// import { WriteReq } from '../src/msgs/write-req';
// import { WriteRes } from '../src/msgs/write-res';
// import { MsgBus } from '../src/msg-bus';
// import { WriteProcessor } from '../src/write-processor';
// import { Processor } from '../src/processor';
// import { Msg } from '../src/msgs/msg';
// import { PouchConnect } from '../src/types/pouch-connect';
// import { StringBlock } from '../src/types/string-block';
// import { Base64Block } from '../src/types/base64-block';
// import { BufferBlock } from '../src/types/buffer-block';
// import { ReadReq } from '../src/msgs/read-req';
// import { ReadRes } from '../src/msgs/read-res';
// import { FragmentType } from '../src/types/fragment-type';

const pouchConnect: PouchConnect = new PouchConnect({
  path: './dist/test/pdb'
});

describe('blocks', () => {
  it('string-block', () => {
    const block = new StringBlock('meno');
    assert.equal(block.asBuffer().toString(), 'meno');
    assert.equal(block.asSha(), '4847f03587f0844ffdea757fd8cbf21da58f21ec7d5440d160cc60a9d0e981ad');
  });

  it('base64-block', () => {
    const block = new Base64Block(Buffer.from('meno', 'utf8').toString('base64'));
    assert.equal(block.asBuffer().toString(), 'meno');
    assert.equal(block.asSha(), '4847f03587f0844ffdea757fd8cbf21da58f21ec7d5440d160cc60a9d0e981ad');
  });

  it('buffer-block', () => {
    const block = new BufferBlock(Buffer.from('meno', 'utf8'));
    assert.equal(block.asBuffer().toString(), 'meno');
    assert.equal(block.asSha(), '4847f03587f0844ffdea757fd8cbf21da58f21ec7d5440d160cc60a9d0e981ad');
  });

});

describe('fragment-write and fragment-written', () => {

  it('fragment-write', () => {
    const fw = new WriteReq({
      pouchConnect: pouchConnect,
      tid: 'tid',
      seq: 1,
      block: new StringBlock('jojo'),
      fragmentType: FragmentType.COMMON | FragmentType.FIRST
    });
    assert.equal(fw.pouchConnect.path, './dist/test/pdb');
    assert.equal(fw.tid, 'tid');
    assert.equal(fw.seq, 1);
    assert.equal(fw.block.asString(), 'jojo');
    assert.equal(fw.fragmentType, FragmentType.COMMON | FragmentType.FIRST);
  });

  it('fragment-written', () => {
    const fw = new WriteReq({
      pouchConnect: pouchConnect,
      tid: 'tid',
      seq: 1,
      block: new StringBlock('jojo'),
      fragmentType: FragmentType.COMMON | FragmentType.FIRST
    });
    const fwn = new WriteRes({
      _id: '_id',
      created: 'DateMe',
      tid: 'tid',
      sha: 'sha',
      seq: 1,
      fragmentType: fw.fragmentType
    });
    assert.equal(fw.pouchConnect.path, './dist/test/pdb');
    assert.equal(fwn._id, '_id');
    assert.equal(fwn.created, 'DateMe');
    assert.equal(fwn.sha, 'sha');
    assert.equal(fwn.tid, 'tid');
    assert.equal(fwn.seq, 1);
    assert.equal(fwn.fragmentType, FragmentType.COMMON | FragmentType.FIRST);
  });

});

// describe('write and written', () => {

//   it('Write.string', () => {
//     const str = Buffer.from('meno', 'utf8');
//     const fw = WriteReq.string(pouchConnect, str.toString(), 'tid');
//     assert.equal(fw.pouchConnect.path, './dist/test/pdb');
//     assert.equal(fw.tid, 'tid');
//     assert.equal(fw.block.asBase64(), str.toString('base64'));
//   });

//   it('Write.base64', () => {
//     const str = Buffer.from('meno', 'utf8');
//     const fw = WriteReq.base64(pouchConnect, str.toString('base64'), 'tid');
//     assert.equal(fw.pouchConnect.path, './dist/test/pdb');
//     assert.equal(fw.tid, 'tid');
//     assert.equal(fw.block.asBase64(), str.toString('base64'));
//   });

//   it('Write.buffer', () => {
//     const str = Buffer.from('meno', 'utf8');
//     const fw = WriteReq.buffer(pouchConnect, str, 'tid');
//     assert.equal(fw.pouchConnect.path, './dist/test/pdb');
//     assert.equal(fw.tid, 'tid');
//     assert.equal(fw.block.asBase64(), str.toString('base64'));
//   });

//   it('written', () => {
//     const fw = new WriteRes();
//     assert.deepEqual(fw.blocks, []);
//     assert.equal(fw.isOk(), true);
//     assert.deepEqual(fw.errors(), []);
//   });

// });

describe('read', () => {
  it('unknown sha read', (done) => {
    const tid = uuid.v4();
    const bus = new MsgBus();
    // WriteProcessor.create(bus);
    Processor.create(bus);
    const msgBuf: Msg[] = [];
    bus.subscribe(msg => {
      msgBuf.push(msg);
      ReadRes.is(msg).match(frq => {
        try {
          assert.deepEqual([
            new ReadRes({
              pouchConnect: pouchConnect,
              ids: frq.ids,
              sha: 'murks',
              tid: tid,
              seq: 4711,
              block: new StringBlock(''),
              fragmentType: FragmentType.NOTFOUND
            }).asObj()
          ], msgBuf
            .filter(m => ReadRes.is(m).matched)
            .map(m => m.asObj()));
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    bus.next(new ReadReq({
      pouchConnect: pouchConnect,
      tid: tid,
      sha: 'murks',
      seq: 4711,
      ofs: 96,
      size: 69,
      fragmentType: FragmentType.COMMON,
    }));
  });

  // it('known sha read', (done) => {
  //   // const tid = uuid.v4();
  //   const bus = new MsgBus();
  //   WriteProcessor.create(bus);
  //   FragmentProcessor.create(bus);
  // });

  it('empty read', (done) => {
    const tid = uuid.v4();
    const bus = new MsgBus();
    // WriteProcessor.create(bus);
    Processor.create(bus);
    const msgBuf: Msg[] = [];
    bus.subscribe(msg => {
      msgBuf.push(msg);
      ReadRes.is(msg).match(frq => {
        try {
          assert.deepEqual([
            new ReadRes({
              pouchConnect: pouchConnect,
              ids: frq.ids,
              sha: 'murks',
              tid: tid,
              seq: 4711,
              block: new StringBlock(''),
              fragmentType: FragmentType.NOTFOUND
            }).asObj()
          ], msgBuf
            .filter(m => ReadRes.is(m).matched)
            .map(m => m.asObj()));
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    bus.next(new ReadReq({
      pouchConnect: pouchConnect,
      tid: tid,
      sha: 'murks',
      seq: 4711,
      size: 0,
      ofs: 22,
      fragmentType: FragmentType.COMMON,
    }));
  });

});

describe('fragment write', () => {
  function writeAction(str: string, bus: MsgBus, tid: string, done: (a?: Error) => void): void {
    const msgBuf: Msg[] = [];
    const block = new StringBlock(str);
    const fws = new WriteReq({
      pouchConnect: pouchConnect,
      tid: tid,
      seq: 4711,
      block: block,
      fragmentType: FragmentType.COMMON
    });
    const my = bus.subscribe(msg => {
      msgBuf.push(msg);
      WriteRes.is(msg).match(wrt => {
        try {
          assert.deepEqual([
            new WriteRes({
              _id: wrt._id,
              created: wrt.created,
              tid: tid,
              sha: block.asSha(),
              seq: fws.seq,
              fragmentType: fws.fragmentType
            }).asObj()
          ], msgBuf.filter(m => WriteRes.is(m).matched).map(m => m.asObj()));
          my.unsubscribe();
          done();
        } catch (e) {
          console.log(e);
          done(e);
        }
      });
    });
    bus.next(fws);
  }

  function loopWriteAction(bus: MsgBus, count: number, str: string, tid: string,
    done: (a?: Error) => void): (e?: Error) => void {
    return (e?: Error) => {
      // console.log(`action:`, count);
      if (e) {
        done(e);
      } else if (--count > 0) {
        writeAction('', bus, tid, loopWriteAction(bus, count, str, tid, done));
      } else {
        done();
      }
    };
  }

  it('empty write', (done) => {
    const tid = uuid.v4();
    const bus = new MsgBus();
    // WriteProcessor.create(bus);
    Processor.create(bus);
    writeAction('', bus, tid, loopWriteAction(bus, 10, '', tid, done));
  });

  it('small-block', (done) => {
    const tid = uuid.v4();
    const bus = new MsgBus();
    const block = new StringBlock('Hello World');
    // WriteProcessor.create(bus);
    Processor.create(bus);
    writeAction(block.asString(), bus, tid, loopWriteAction(bus, 10, block.asString(), tid, (err?) => {
      if (err) {
        done(err);
        return;
      }
      bus.subscribe(msg => {
        ReadRes.is(msg).match(frs => {
          try {
            // console.log(`what:`, frs);
            assert.deepEqual(frs.asObj(), {
              block: {
                mime: 'SGVsbG8gV29ybGQ=',
                sha: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'
              },
              error: undefined,
              fragmentType: FragmentType.FIRST,
              ids: frs.ids,
              pouchConnect: {
                dbConfig: undefined,
                path: './dist/test/pdb'
              },
              seq: 4711,
              sha: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
              tid: tid
            });
            done();
          } catch (e) {
            done(e);
          }
        });
      });
      // console.log(`FragmentReadReq:`, block);
      bus.next(new ReadReq({
        tid: tid,
        sha: block.asSha(),
        pouchConnect: pouchConnect,
        seq: 4711,
        fragmentType: FragmentType.FIRST
      }));
    }));
  });

});

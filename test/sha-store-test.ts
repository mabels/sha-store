import { assert } from 'chai';
import { FragmentWrite, FragmentType } from '../src/msgs/fragment-write';
import { FragmentWritten } from '../src/msgs/fragment-written';
import { Write } from '../src/msgs/write';
import { Written } from '../src/msgs/written';

describe('fragment-write and fragment-written', () => {
  it('fragment-write', () => {
    const fw = new FragmentWrite({
      tid: 'tid',
      seq: 1,
      size: 4711,
      mimeBlock: 'jojo',
      fragmentType: FragmentType.COMMON | FragmentType.FIRST
    });
    assert.equal(fw.tid, 'tid');
    assert.equal(fw.seq, 1);
    assert.equal(fw.size, 4711);
    assert.equal(fw.mimeBlock, 'jojo');
    assert.equal(fw.fragmentType, FragmentType.COMMON | FragmentType.FIRST);
  });

  it('fragment-written', () => {
    const fw = new FragmentWrite({
      tid: 'tid',
      seq: 1,
      size: 4711,
      mimeBlock: 'jojo',
      fragmentType: FragmentType.COMMON | FragmentType.FIRST
    });
    const fwn = new FragmentWritten('sha', fw);
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
    const fw = Write.string(str.toString(), 'tid');
    assert.equal(fw.tid, 'tid');
    assert.equal(fw.mimeblock, str.toString('base64'));
  });

  it('Write.base64', () => {
    const str = Buffer.from('meno', 'utf8');
    const fw = Write.base64(str.toString('base64'), 'tid');
    assert.equal(fw.tid, 'tid');
    assert.equal(fw.mimeblock, str.toString('base64'));
  });

  it('Write.buffer', () => {
    const str = Buffer.from('meno', 'utf8');
    const fw = Write.buffer(str, 'tid');
    assert.equal(fw.tid, 'tid');
    assert.equal(fw.mimeblock, str.toString('base64'));
  });

  it('written', () => {
    const fw = new Written();
    assert.deepEqual(fw.blocks, []);
    assert.equal(fw.isOk(), true);
    assert.deepEqual(fw.errors(), []);
  });

});

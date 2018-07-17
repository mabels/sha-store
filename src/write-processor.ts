import { MsgBus } from './msg-bus';
import { WriteReq } from './msgs/write-req';
import { WriteRes } from './msgs/write-res';
import { FragmentWriteReq } from './msgs/fragment-write-req';
import { BufferBlock } from './types/buffer-block';
import { FragmentType } from './types/fragment-type';

export class WriteProcessor {

  public static readonly FRAGMENTSIZE: number = 32768;

  public static create(msgBus: MsgBus): WriteProcessor {
    return new WriteProcessor(msgBus);
  }

  private constructor(msgBus: MsgBus) {
    msgBus.subscribe(msg => {
      WriteReq.is(msg).match(wmsg => {
        const buf = wmsg.block.asBuffer();
        if (buf.length == 0) {
          msgBus.next(new WriteRes(wmsg.tid));
        } else {
          let wrote = 0;
          for (let i = 0; i < buf.length; i += WriteProcessor.FRAGMENTSIZE) {
            const rest = (buf.length - wrote);
            const size = rest > WriteProcessor.FRAGMENTSIZE ? WriteProcessor.FRAGMENTSIZE : rest;
            const slice = buf.slice(wrote, wrote + size);
            wrote += size;
            let ftype = FragmentType.COMMON;
            if (i == 0) {
              ftype |= FragmentType.FIRST;
            }
            if (buf.length == wrote) {
              ftype |= FragmentType.LAST;
            }
            msgBus.next(new FragmentWriteReq({
              pouchConnect: wmsg.pouchConnect,
              tid: wmsg.tid,
              seq: i,
              block: new BufferBlock(slice),
              fragmentType: ftype
            }));
          }
        }
      });
    });
  }

}

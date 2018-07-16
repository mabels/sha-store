import { MsgBus } from './msg-bus';
import { Write } from './msgs/write';
import { Written } from './msgs/written';
import { FragmentWrite, FragmentType } from './msgs/fragment-write';

export class WriteProcessor {

  public static readonly FRAGMENTSIZE: number = 32768;

  public static create(msgBus: MsgBus): WriteProcessor {
    return new WriteProcessor(msgBus);
  }

  private constructor(msgBus: MsgBus) {
    msgBus.subscribe(msg => {
      Write.is(msg).match(wmsg => {
        const buf = wmsg.asBuffer();
        if (buf.length == 0) {
          msgBus.next(new Written(wmsg.tid));
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
            msgBus.next(new FragmentWrite({
              pouchConnect: wmsg.pouchConnect,
              tid: wmsg.tid,
              seq: i,
              size: size,
              mimeBlock: slice.toString('base64'),
              fragmentType: ftype
            }));
          }
        }
      });
    });
  }

}

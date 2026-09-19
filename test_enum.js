import koffi from 'koffi';
const user32 = koffi.load('user32.dll');
// pass buffer directly as void*
const EnumDisplayDevicesA = user32.func('bool EnumDisplayDevicesA(str lpDevice, uint32 iDevNum, void* lpDisplayDevice, uint32 dwFlags)');

const buf = Buffer.alloc(424);
buf.writeUInt32LE(424, 0);

const res = EnumDisplayDevicesA(null, 0, buf, 0);
console.log("res:", res);

let name = buf.toString('ascii', 4, 36).replace(/\0/g, '');
console.log("DeviceName:", name);
let flags = buf.readUInt32LE(164);
console.log("Flags:", flags.toString(16));

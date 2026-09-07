// Browser stubs for Node's net/tls builtins, which electrum-cash v3 imports
// for its raw TCP transports. The app connects over wss, so these are never
// called — they only need to exist for the module to bundle.
export class TLSSocket {}
export const connect = () => undefined;
export const isIP = () => 0;

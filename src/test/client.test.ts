import { Peer } from "peerjs";

function createPeer(id: string, token: string) {
  return new Peer(id, {
    host: 'localhost',
    path: '/myapp',
    token,
  })
}

async function start() {
  const peer = createPeer('client1', 'token');
  console.log(peer.id);
}

start();
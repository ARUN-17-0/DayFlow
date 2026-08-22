const net = require('net');

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'ap-northeast-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'sa-east-1',
  'ca-central-1',
];

// StartupMessage packet: length (4 bytes) + version (0x00030000) + user\0postgres.kvqgdqrbtuznvvmacedl\0database\0postgres\0\0
function buildStartupPacket(user, database) {
  const userBuf = Buffer.from(`user\0${user}\0database\0${database}\0\0`);
  const lengthBuf = Buffer.alloc(4);
  const versionBuf = Buffer.from([0x00, 0x03, 0x00, 0x00]);
  const length = 4 + 4 + userBuf.length;
  lengthBuf.writeInt32BE(length, 0);
  return Buffer.concat([lengthBuf, versionBuf, userBuf]);
}

const packet = buildStartupPacket('postgres.kvqgdqrbtuznvvmacedl', 'postgres');

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2500);
    socket.on('data', (data) => {
      const response = data.toString('utf8');
      if (!response.includes('tenant/user postgres.kvqgdqrbtuznvvmacedl not found')) {
        console.log(`🎉 SUCCESS IN REGION ${region}! Response:`, response.substring(0, 100));
      }
      socket.destroy();
      resolve();
    });
    socket.on('error', () => resolve());
    socket.on('timeout', () => { socket.destroy(); resolve(); });
    socket.connect(6543, host, () => {
      socket.write(packet);
    });
  });
}

async function run() {
  console.log('Testing tenant postgres.kvqgdqrbtuznvvmacedl across Supabase poolers...');
  for (const r of regions) {
    await testRegion(r);
  }
}

run();

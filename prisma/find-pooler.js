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

async function checkRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);
    socket.on('connect', () => {
      console.log(`Port 6543 open on ${region}: ${host}`);
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(6543, host);
  });
}

async function run() {
  for (const r of regions) {
    await checkRegion(r);
  }
}

run();

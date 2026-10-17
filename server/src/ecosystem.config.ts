// PM2 configuration file
export const apps = [
  {
    script: 'dist/index.js',
    // Node sizes its heap from the host's RAM (~63 GB on Heroku), not the 512 MB dyno, so without a
    // cap it collects garbage far too late and the dyno swaps (R14). Old space 256 MB plus a 16 MB
    // semi-space (Node 24 would grow the young generation to 192 MB) caps the heap at ~304 MB,
    // leaving room for pm2 itself and for Chrome during PDF renders.
    node_args: '--max-old-space-size=256 --max-semi-space-size=16',
    env: {NODE_ENV: 'development'},
    env_production: {NODE_ENV: 'production', NODE_PATH: 'dist/'},
  },
];

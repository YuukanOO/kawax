#!/usr/bin/env node
const program = require('commander');

program
  .option('-t, --theme <dir>', 'Custom theme base directory')
  .option('-p, --plugins <dir>', 'Custom plugins directory')
  .option('-o, --output <dir>', 'Custom output directory')
  .action((dir) => {
    console.log('serving', dir);
  })
  .parse(process.argv);

if (program.args.length < 1) {
  program.help();
}

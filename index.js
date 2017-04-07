#!/usr/bin/env node
const pkg = require('./package.json');
const program = require('commander');
const kawax = require('./lib/kawax');
const log = require('./lib/log');

process.title = pkg.name;
program._name = pkg.name;
program
  .version(pkg.version)
  .description(pkg.description)
  .arguments('<div>')
  .option('-t, --theme <dir>', 'Custom theme base directory')
  .option('-p, --plugins <dir>', 'Custom plugins directory')
  .option('-o, --output <dir>', 'Custom output directory')
  .action(dir => kawax({
    working: dir,
    theme: program.theme,
    output: program.output,
    plugins: program.plugins,
  }, (err) => {
    if (err) {
      log.error(err);
    }
  }))
  .parse(process.argv);

if (program.args.length < 1) {
  program.help();
}

#!/usr/bin/env node
const program = require('commander');
const kawax = require('./lib/kawax');

program
  .option('-t, --theme <dir>', 'Custom theme base directory')
  .option('-p, --plugins <dir>', 'Custom plugins directory')
  .option('-o, --output <dir>', 'Custom output directory')
  .action((dir) => {
    kawax({
      workingDir: dir,
      themeDir: program.theme,
      pluginsDir: program.plugins,
      outputDir: program.output,
    }, (err) => {
      if (err) {
        console.error(err);
      }
    });
  })
  .parse(process.argv);

if (program.args.length < 1) {
  program.help();
}

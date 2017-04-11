#!/usr/bin/env node
const pkg = require('./package.json');
const program = require('commander');

process.title = pkg.name;
program._name = pkg.name;
program
  .version(pkg.version)
  .description(pkg.description)
  .command('serve [dir]', 'Serves a site, during development')
  .command('build [dir]', 'Builds a site', { isDefault: true })
  .parse(process.argv);

const fs = require('fs-extra');
const fm = require('front-matter');
const ejs = require('ejs');
const markdown = require('markdown').markdown;
const path = require('path');
const async = require('async');
const glob = require('glob');

/**
 * Program constants
 */

const BUILD_REL_PATH = '_build';
const THEME_REL_PATH = '_theme';
const GLOB_IGNORE_OPTS = { ignore: ['**/_*', '**/_*/**'] };

/**
 * Variables initialized in the generate function.
 */

let workingDir = null;
let buildDir = null;
let themeDir = null;
let siteData = null;
let cachedTemplates = null;

/**
 * Transform a single file.
 *
 * @param {Object} file File to process from src to dest
 * @param {Function} cb Callback to call when done
 */
function transformFile(file, cb) {
  fs.readFile(file.src, 'utf-8', (err, data) => {
    if (err) {
      return cb(err);
    }

    // Parse meta with frontmatter
    const meta = fm(data);
    // Parse the tree to retrieve the title if no one is defined in attributes
    const tree = markdown.parse(meta.body);
    // Render the markdown
    const content = markdown.renderJsonML(markdown.toHTMLTree(tree));

    // Determine the template to use when rendering
    let templatePath = path.join(themeDir, meta.attributes.template || 'index.ejs');

    if (!path.extname(templatePath)) {
      templatePath += '.ejs';
    }

    // Check if it was already compiled, else compile it
    let template = cachedTemplates[templatePath];

    if (!template) {
      template = ejs.compile(fs.readFileSync(templatePath, 'utf-8'), {
        filename: templatePath, // Use for includes
      });
      cachedTemplates[templatePath] = template;
    }

    // Represents all data pass to the template. They will be accessible "as it".
    // Here, I accumulate the site data, page data and page attributes into one object.
    const templateData = Object.assign({}, siteData, {
      page: Object.assign({}, {
        title: (tree.length > 1 ? tree[1][2] : undefined),
        path: file.path,
        content,
      }, meta.attributes),
    });

    // And now, write the file!
    return fs.outputFile(file.dest, template(templateData), cb);
  });
}

/**
 * Process content files.
 *
 * @param {Function} finalCb Final callback to call
 */
function processFiles(finalCb) {
  glob(`${workingDir}/**/*.md`, GLOB_IGNORE_OPTS, (err, matches) => {
    if (err) {
      return finalCb(err);
    }

    // Computes destination path for all content files
    const filesToProcess = matches.map((o) => {
      const relativeFilepath = path.relative(workingDir, o);
      const relativeDir = relativeFilepath.replace(path.basename(relativeFilepath), '');
      const pagePath = path.join(relativeDir, path.basename(o, path.extname(o)));
      const relativeOutputFilepath = path.join(pagePath, 'index.html');

      console.info(relativeFilepath, '->', relativeOutputFilepath);

      return {
        src: o,
        path: path.join('/', pagePath).replace(/\\/g, '/'),
        dest: path.join(buildDir, relativeOutputFilepath),
      };
    });

    return async.each(filesToProcess, transformFile, finalCb);
  });
}

/**
 * Load data (ie. all .json files).
 *
 * @param {Error} err Error thrown by the process before this one
 * @param {Function} finalCb Final callback to call
 */
function loadData(err, finalCb) {
  if (err) {
    return finalCb(err);
  }

  return glob(`${workingDir}/**/*.json`, GLOB_IGNORE_OPTS, (e, matches) => {
    if (e) {
      return finalCb(e);
    }

    matches.forEach((o) => {
      const relativeFilepath = path.relative(workingDir, o);
      const completePath = relativeFilepath.replace(path.extname(relativeFilepath), '');
      const parts = completePath.split(path.sep);
      let curData = siteData;

      for (let i = 0; i < parts.length; i += 1) {
        if (i === parts.length - 1) {
          curData[parts[i]] = fs.readJsonSync(o);
        } else {
          curData[parts[i]] = {};
        }

        curData = curData[parts[i]];
      }
    });

    console.info(`Loaded data from ${matches.length} file(s)`);
    return processFiles(finalCb);
  });
}

/**
 * Generates an absolute path if the one provided is not already one.
 *
 * @param {string} str Path to check
 * @returns {string} Absolute path
 */
function generateAbsoluteDir(str) {
  return path.isAbsolute(str) ? str : path.join(process.cwd(), str);
}

/**
 * Generates a static site given a working directory.
 *
 * @param {string|Object} dir Working directory to use or an object with working, theme, output.
 * @param {Function} finalCb Callback to call once done
 */
module.exports = function generate(dir, finalCb) {
  let dirObj = dir;

  if (typeof dir !== 'object') {
    dirObj = { working: dir };
  }

  workingDir = generateAbsoluteDir(dirObj.working);
  buildDir = generateAbsoluteDir(dirObj.output || path.join(workingDir, BUILD_REL_PATH));
  themeDir = generateAbsoluteDir(dirObj.theme || path.join(workingDir, THEME_REL_PATH));

  cachedTemplates = {};
  siteData = {};

  fs.exists(workingDir, (exists) => {
    if (!exists) {
      return finalCb('Directory does not exists');
    }

    console.info(`Processing folder: ${workingDir}
Output will be put to: ${buildDir}
Templates will be searched in: ${themeDir}`);

    return fs.emptyDir(buildDir, err => loadData(err, finalCb));
  });
};

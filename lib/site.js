/**
 * Represents the site we are building right now.
 */
class Site {

  /**
   * Instantiates a new empty site.
   */
  constructor() {
    this.pages = [];
    this.data = {};
    this.assets = [];
  }

  /**
   * Add a page to this site.
   * @param {Object} meta Meta object for the page
   * @param {String} content HTML content of the page
   */
  addPage(meta, content) {
    this.pages.push({
      meta,
      content,
    });
  }

  /**
   * Add data to this site instance.
   * @param {Array} path Path where the data should be store
   * @param {Object} content Content to set at the given path
   */
  addData(path, content) {
    let data = this.data;

    path.forEach((d, i) => {
      if (!data[d]) {
        data[d] = {};
      }

      // If last segment, merge file content
      if (i === path.length - 1) {
        data[d] = Object.assign({}, data[d], content);
      }

      data = data[d];
    });
  }

}

module.exports = Site;

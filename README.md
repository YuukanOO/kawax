# kawax - An easy static site generator

Yeah, I know, You 've already use more than 10 static site generators and you're happy with them until you start thinking why does it do *x* or *y* that way and things are going strange. That's why I made **kawax**! I can't figure how to make this one more simple. 

## Main goals

- Load data in **JSON** files
- No configuration, just use json files as with any other data
- Transform **Markdown** files to **HTML**
- Apply templates using **EJS**
- **Keep** the directory structure!!

## Installation & Usage

`npm install -g kawax && kawax -h`

## Theme data

When processing a page, in your `.ejs` file, you will have access to the following **properties**:

- `page`: Represents the current page
  - `title`: Title of the page
  - `path`: Path of the page
  - `content`: Content of the page
  - And any other meta added via front matter
- `pages`: All pages of your site as an array of `page`
- All data read from your json files

And the following **commands**:

- `copy(src, dest)`: Will copy the file `src` (relative to the theme directory) to  `dest` (relative to the build directory). You must provide the filename too. Mostly use to copy assets such as css `<link href="<%= copy('style.css', '/public/main.css') %>" rel="stylesheet">`.

Please note that each markdown file will be generated in its own folder to generates pretty urls.

Don't hesitate to look in the `example` folder ;)
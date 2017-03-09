# kawax - An easy static site generator in approximatively 200 lines of code

Yeah, I know, You 've already use more than 10 static site generators and you're happy with them until you start thinking why does it do *x* or *y* that way and things are going strange.

## Main goals

- Load data in **JSON** files
- Transform **Markdown** files to **HTML**
- Apply templates using **EJS**
- **Keep** the directory structure!!

## Installation & Usage

`npm install -g kawax && kawax -h`

## Build process

That's why I made **kawax**! I can't figure how to make this one more simple. The generating process is easy:

- First, all folders starting with an underscore are ignored,
- Load all `.json` files in the working directory and keep the structure, so if you put a json file in `my/data/are/here/sample.json`, it will be accessible in your `ejs` templates as `<%= my.data.are.here.sample %>`
- Load all `.md` files, extract the front matter attributes and render them using ejs templates in the `_theme` folder (by default, it will use a template name `_theme/index.ejs` but you can provide your own in front matter by defining the key `template`), please not that it preserves the structure of your data,
- Your `.ejs` files will receive all loaded data and a special property `page` which contains all front matter attributes + `path`, `title`, `content`.

Please note that each markdown file will be generated in its own folder to generates pretty urls.
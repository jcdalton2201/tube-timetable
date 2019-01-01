import fs from 'fs';
import replaceStream from 'replacestream';
import { buildSassFile, buildHtmlFile, buildOutputFile, nodeSass, mkDir } from './fileUtils';

export default function templateRollupPlugin() {
  return {
    name: 'template-rollup-plugin',
    transform(content, filePath) {
      mkDir('dist');
      const srcPath = filePath.substring(filePath.indexOf('src/'));
      const sassFile = buildSassFile(srcPath);
      const htmlFile = buildHtmlFile(srcPath);
      const outputFile = buildOutputFile(srcPath);
      let modifiedContent = content;
      if (fs.existsSync(htmlFile)) {
        const htmlData = fs.readFileSync(htmlFile, 'utf-8');

        let temp = '';

        if (fs.existsSync(sassFile)) {
          let render = nodeSass(sassFile);

          if (render && render.css) {
            temp = '<style>' + render.css.toString('utf8') + '</style>';
          }
        }

        const writeStream = fs.createWriteStream(outputFile);
        const tempHtml = temp + htmlData.replace(/\r?\n|\r|\t|\s\s+/g, '');
        fs.createReadStream(srcPath)
          .pipe(replaceStream('tempHtml;', '\`' + tempHtml + '\`;'))
          .pipe(replaceStream('this.html(tempHtml);', `this.html\`${tempHtml}\`;`))
          .pipe(writeStream);

        modifiedContent = modifiedContent
          .replace('tempHtml;', '\`' + tempHtml + '\`;')
          .replace('this.html(tempHtml);', `this.html\`${tempHtml}\``);
      } else {
        const writeStream = fs.createWriteStream(outputFile);
        fs.createReadStream(srcPath)
          .pipe(writeStream);
      }

      return modifiedContent;
    }
  };
}

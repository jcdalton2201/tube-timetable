import sass from 'node-sass';
import mkdirp from 'mkdirp';

export function buildSassFile(fileName) {
  const srcIndex = fileName.indexOf('src');
  const partFile = fileName.substring(srcIndex);
  return partFile.replace('.js', '.scss');
}

export function buildHtmlFile(fileName) {
  const srcIndex = fileName.indexOf('src');
  const partFile = fileName.substring(srcIndex);
  return partFile.replace('.js', '.html');
}

export function buildOutputFile(fileName) {
  const srcIndex = fileName.lastIndexOf('/');
  const partFile = fileName.substring(srcIndex);
  const directory = fileName.substring(fileName.indexOf('/')).replace(partFile, '');
  mkDir(`dist${directory}`);
  return `dist${directory}${partFile}`;
}

export function nodeSass(file) {
  return sass.renderSync({
    file,
    outputStyle: 'compressed',
    quiet: true
  });
}

export function mkDir(dir) {
  return mkdirp.sync(dir);
}

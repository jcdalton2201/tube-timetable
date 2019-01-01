import templateRollupPlugin from './scripts/templateRollupPlugin.js';
import uglify from 'rollup-plugin-uglify-es';
const isProduction = process.env.BUILD === 'production';
console.log(process.env.BUILD);
export default {
  input: 'src/routes/tube-app/tube-app.js',
  output: [
    {
      file: 'dist/tube-app-web.js',
      format: 'es'
    }
  ],
  plugins: [
    templateRollupPlugin(),
    isProduction && uglify()
  ]
};

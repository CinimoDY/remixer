import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  source: [
    // Use local token files as source of truth
    "src/tokens/**/*.json"
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/styles/',
      files: [{
        destination: '_variables.css',
        format: 'css/variables',
        options: {
          showFileHeader: false
        }
      }]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'src/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6'
      }]
    }
  }
} 
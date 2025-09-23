// Create this file as SearchBlot.js in your project

import Quill from 'quill';
const Inline = Quill.import('blots/inline');

class SearchedStringBlot extends Inline {}

SearchedStringBlot.blotName = 'SearchedString';
SearchedStringBlot.className = 'ql-searched-string';
SearchedStringBlot.tagName = 'span';

export default SearchedStringBlot;
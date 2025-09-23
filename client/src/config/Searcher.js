import Quill from 'quill';

class Searcher {
  constructor(quill, options) {
    this.quill = quill;
    this.options = options || {};
    
    // Initialize the search state
    this.occurrencesIndices = [];
    this.currentIndex = 0;
    this.searchedStringLength = 0;
    this.searchedString = "";
  }

  search(searchText) {
    // Remove any previous search styling
    this.removeStyle();
    
    // Set the search string
    this.searchedString = searchText || '';
    
    if (this.searchedString) {
      // Get all content operations from Quill
      const delta = this.quill.getContents();
      const ops = delta.ops;
      
      // Prepare to track positions considering page breaks
      let textPosition = 0;
      let indices = [];
      
      // Analyze all operations to handle text and embeds correctly
      for (let i = 0; i < ops.length; i++) {
        const op = ops[i];
        
        // Handle text operations
        if (typeof op.insert === 'string') {
          const text = op.insert;
          const lowerText = text.toLowerCase();
          const lowerSearchText = this.searchedString.toLowerCase();
          
          // Find all matches in this text block
          let matchIndex = 0;
          while ((matchIndex = lowerText.indexOf(lowerSearchText, matchIndex)) !== -1) {
            // Found a match in this text segment, add its absolute position in the document
            indices.push(textPosition + matchIndex);
            matchIndex += this.searchedString.length;
          }
          
          // Update text position for next operation
          textPosition += text.length;
        } 
        // Handle page breaks and other embeds
        else if (typeof op.insert === 'object') {
          // Increment position by 1 for embeds (including page breaks)
          textPosition += 1;
        }
      }
      
      // Store the results
      this.occurrencesIndices = indices;
      this.searchedStringLength = this.searchedString.length;
      
      // Apply formatting to all occurrences
      indices.forEach(index =>
        this.quill.formatText(index, this.searchedStringLength, "SearchedString", true)
      );
      
      // Reset current index to the first occurrence
      this.currentIndex = 0;
      
      // Select the first occurrence if any found
      if (indices.length > 0) {
        this.quill.setSelection(indices[0], this.searchedStringLength);
      }
      
      return indices.length; // Return number of matches
    } else {
      this.removeStyle();
      return 0;
    }
  }

  goToNextMatch() {
    if (!this.occurrencesIndices || this.occurrencesIndices.length === 0) return false;
    
    // Calculate next index with wrap-around
    this.currentIndex = (this.currentIndex + 1) % this.occurrencesIndices.length;
    
    // Select the next occurrence
    this.quill.setSelection(
      this.occurrencesIndices[this.currentIndex], 
      this.searchedStringLength
    );
    
    return true;
  }
  
  goToPrevMatch() {
    if (!this.occurrencesIndices || this.occurrencesIndices.length === 0) return false;
    
    // Calculate previous index with wrap-around
    this.currentIndex = (this.currentIndex - 1 + this.occurrencesIndices.length) % 
      this.occurrencesIndices.length;
    
    // Select the previous occurrence
    this.quill.setSelection(
      this.occurrencesIndices[this.currentIndex], 
      this.searchedStringLength
    );
    
    return true;
  }

  replace(newText) {
    if (!this.searchedString || this.occurrencesIndices.length === 0) return false;
    
    const position = this.occurrencesIndices[this.currentIndex];
    const USER = Quill.sources.USER || 'user'; // Fallback to string if not defined
    
    // Perform the replacement
    this.quill.deleteText(position, this.searchedStringLength, USER);
    this.quill.insertText(position, newText, {}, USER);
    
    // Re-search to update indices after the replacement
    return this.search(this.searchedString) > 0;
  }

  replaceAll(newText) {
    if (!this.searchedString || this.occurrencesIndices.length === 0) return 0;
    
    const USER = Quill.sources.USER || 'user'; // Fallback to string if not defined
    
    // We need to use a copy because we'll be modifying the array
    const indices = [...this.occurrencesIndices].sort((a, b) => b - a); // Replace from end to beginning
    
    // Start a change batch to group operations for undo history
    if (this.quill.history) {
      this.quill.history.cutoff();
    }
    
    // Replace all occurrences from end to beginning to maintain correct indices
    let replacedCount = 0;
    for (const index of indices) {
      this.quill.deleteText(index, this.searchedStringLength, USER);
      this.quill.insertText(index, newText, {}, USER);
      replacedCount++;
    }
    
    // Clear all search formatting
    this.removeStyle();
    
    // Reset search state
    this.occurrencesIndices = [];
    this.currentIndex = 0;
    
    return replacedCount;
  }

  removeStyle() {
    this.quill.formatText(0, this.quill.getText().length, 'SearchedString', false);
  }

  static removeStyle(quill) {
    if (!quill) return;
    quill.formatText(0, quill.getText().length, 'SearchedString', false);
  }
  
  // Helper method for finding indices - not used in the new implementation
  // but kept for backward compatibility
  getIndicesOf(text, searchStr) {
    let searchStrLen = searchStr.length;
    let startIndex = 0,
      index,
      indices = [];
    
    const sourceText = text.toLowerCase();
    const searchText = searchStr.toLowerCase();
    
    while ((index = sourceText.indexOf(searchText, startIndex)) > -1) {
      indices.push(index);
      startIndex = index + searchStrLen;
    }
    return indices;
  }
}

export default Searcher;
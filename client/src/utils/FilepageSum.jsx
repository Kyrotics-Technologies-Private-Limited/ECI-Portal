export const FilePageSum = (data) => {
    const totals = {};
  
    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key.endsWith("Files") || key.endsWith("Pages")) {
          if (!totals[key]) {
            totals[key] = 0;
          }
          totals[key] += item[key];
        }
      });
    });
  
    return totals;
  };
  
// var csv is the CSV file with headers
export const csvJSON = (csv: string): string => {
  const lines = csv.split('\n');
  const result = [];

  const headers = lines[0].split(',').map(i => i.toLowerCase());

  for (let i = 1; i < lines.length; i++){

    const obj = {};
    const currentline = lines[i].split(',');

    for(let j = 0 ;j < headers.length; j++){
      obj[headers[j]] = currentline[j];
    }

    result.push(obj);

  }
  return JSON.stringify(result);
}



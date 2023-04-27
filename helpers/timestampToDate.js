function generateDatabaseDateTime(date) {
    const p = new Intl.DateTimeFormat('en', {
      year:'numeric',
      month:'2-digit',
      day:'2-digit',
      hour:'2-digit',
      minute:'2-digit',
      second:'2-digit',
      hour12: false,
    }).formatToParts(date).reduce((acc, part) => {
      acc[part.type] = part.value;
        return acc;
    }, {});
  
    return `${p.year}/${p.month}/${p.day} ${p.hour}:${p.minute}:${p.second}`;
  }

  export default generateDatabaseDateTime;
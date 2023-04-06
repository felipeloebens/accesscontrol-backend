function oracleFormat(camDateStr) {
  const year = camDateStr.slice(6, 10);
  const month = camDateStr.slice(3, 5);
  const day = camDateStr.slice(0, 2);
  const time = camDateStr.slice(11)
  return `${year}/${month}/${day} ${time}`;
}

export default oracleFormat;

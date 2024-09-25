export const shortenString = (str: string, start = 6, end = 6) => {
  return str.substring(0, start) + "..." + str.substring(str.length - end);
};

export const formatDate = function (timestamp: number) {
  // Create a date object from the timestamp
  var date = new Date(timestamp * 1000);

  // return a formatted date
  const tz = (date.getTimezoneOffset() / 60) * -1;
  return (
    date.getDate() +
    "." +
    (date.getMonth() + 1) +
    "." +
    date.getFullYear() +
    " - " +
    date.getHours() +
    ":" +
    (date.getMinutes() < 10 ? "0" : "") +
    date.getMinutes() +
    " GMT" +
    (tz >= 0 ? "+" : "") +
    tz
  );
};

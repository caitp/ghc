function GHC$$pad$$right(str, width) {
  if (str.length < width) {
    return str + ' '.repeat(width - str.length);
  } else if (str.length > width - 5) {
    str = str.substr(0, width - 5);
    return str + ' ... ';
  }
  return str;
}

function GHC$$pad$$left(str, width) {
  if (str.length < width) {
    return ' '.repeat(width - str.length) + str;
  } else if (str.length > width - 5) {
    str = str.substr(0, width - 5);
    return str + ' ... ';
  }
  return str;
}

module.exports = {
  left: GHC$$pad$$left,
  right: GHC$$pad$$right
};

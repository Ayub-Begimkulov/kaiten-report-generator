function getTodayFromMidnight() {
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0
  );

  return today;
}

const mapReducer = mapper => combiner => (acc, c) => {
  return combiner(acc, mapper(c));
};

const filterReducer = predicate => combiner => (acc, c) => {
  if (predicate(c)) {
    return combiner(acc, c);
  }
  return acc;
};

const compose = (...fns) => fns.reduce((a, b) => (...args) => a(b(...args)));

module.exports.compose = compose;
module.exports.mapReducer = mapReducer;
module.exports.filterReducer = filterReducer;
module.exports.getTodayFromMidnight = getTodayFromMidnight;

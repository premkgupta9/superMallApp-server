export const asyncHandeler = (func) => {
  return (req, res, next) => {
      Promise.resolve(func(req, res, next)).catch((err) => next(err));
};
};
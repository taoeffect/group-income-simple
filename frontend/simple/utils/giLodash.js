// manually implemented lodash functions are better than even:
// https://github.com/lodash/babel-plugin-lodash
// additional tiny versions of lodash functions are available in VueScript2

export function mapValues (obj: Object, fn: Function, o: Object = {}) {
  for (let key in obj) { o[key] = fn(obj[key]) }
  return o
}

export function cloneDeep (obj: Object) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Deeply compares two objects to determine if they are equal.
 * @param {Object} obj1 - First object to compare.
 * @param {Object} obj2 - Second object to compare.
 * @returns {boolean} - Returns true if objects are deeply equal, else false.
 */


export const deepEqual = (obj1, obj2) => {
  // If both are identical (including primitives), return true
  if (obj1 === obj2) return true;

  // If either is not an object or is null, return false
  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false;
  }

  // Get the keys of both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // If the number of keys is different, objects are not equal
  if (keys1.length !== keys2.length) return false;

  // Check each key recursively
  for (let key of keys1) {
    // If obj2 doesn't have the key, return false
    if (!keys2.includes(key)) return false;

    // If the value is an object, recurse
    if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      if (!deepEqual(obj1[key], obj2[key])) return false;
    } else {
      // For primitive values, check equality
      if (obj1[key] !== obj2[key]) return false;
    }
  }

  return true;
};
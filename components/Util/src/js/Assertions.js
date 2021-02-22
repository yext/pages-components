const Type = {
  UNDEFINED: 'undefined',
  NULL: 'object', // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#null
  BOOLEAN: 'boolean',
  NUMBER: 'number',
  BIGINT: 'bigint',
  STRING: 'string',
  SYMBOL: 'symbol',
  FUNCTION: 'function',
  OBJECT: 'object'
}

function assertType(object, type) {
  if (typeof type != 'string') {
    throw new Error('Assertion error: \'type\' must be a string');
  }

  if (typeof object !== type) {
    throw new Error(`Expected an object of type '${type}' but received '${typeof object}'`)
  }
}

function assertInstance(object, instanceClass) {
  let isInstance;

  try {
    isInstance = object instanceof instanceClass;
  } catch(err) {
    throw new Error('Assertion error: \'instanceClass\' is not a valid constructor');
  }

  if (!isInstance) {
    throw new Error(`Expected an instance of '${instanceClass.name}' but received '${object.constructor.name}'`);
  }
}

export {
  Type,
  assertType,
  assertInstance
}

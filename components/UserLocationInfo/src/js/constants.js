const UserLocationInfoType = Object.freeze({
  Any: Symbol('UserLocationTypeAny'),
  IPAddressOnly: Symbol('UserLocationTypeIPAddressOnly'),
  HTML5Only: Symbol('UserLocationTypeHTML5Only'),
  HTML5IfNoPrompt: Symbol('UserLocationTypeHTML5IfNoPrompt'),
});

const UserLocationInfoSource = Object.freeze({
  HTML5Geo: Symbol('HTML5'),
  IPAddress: Symbol('ip'),
});

export {
  UserLocationInfoSource,
  UserLocationInfoType
};

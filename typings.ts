/* eslint-disable */
export type Schema = {
  'maps': {
    plain: {
      'id': number;
    };
    nested: {};
    flat: {};
  };
  'snippets': {
    plain: {
      'id': number;
      'title': string;
      'content': string;
      'created': string;
      'expires': string;
      'user_id': number;
    };
    nested: {
      'user': Schema['users']['plain'] & Schema['users']['nested'];
    };
    flat: {
      'user:id': number;
      'user:name': string;
      'user:email': string;
      'user:password': string;
      'user:created': string;
    };
  };
  'users': {
    plain: {
      'id': number;
      'name': string;
      'email': string;
      'password': string;
      'created': string;
    };
    nested: {};
    flat: {};
  };
};

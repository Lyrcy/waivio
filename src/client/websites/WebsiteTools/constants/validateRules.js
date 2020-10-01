export default {
  domain: [
    {
      required: true,
      message: 'Field is required',
    },
    {
      pattern: /[a-z,0-9]+$/,
      // message:
    },
    {
      validator: (rule, value) =>
        value !== 'www'
          ? Promise.resolve()
          : Promise.reject('You can`t use only www in domain name'),
    },
  ],
  politics: [
    {
      required: true,
      message: 'Should accept agreement',
    },
  ],
  autocomplete: [
    {
      required: true,
      message: 'Field is required',
    },
  ],
};

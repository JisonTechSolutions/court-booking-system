import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Booking: a
    .model({
      playerName: a.string().required(),
      date:       a.string().required(),
      time:       a.string().required(),
    })
    .authorization((allow) => [allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
  },
});

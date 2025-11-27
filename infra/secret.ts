export const secret = {
  CdnPrivateKey: new sst.Secret("CdnPrivateKey"),
  CdnPublicKey: new sst.Secret("CdnPublicKey"),
};

export const allSecrets = [...Object.values(secret)];

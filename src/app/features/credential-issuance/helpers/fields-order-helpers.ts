import { CommonMandator } from "src/app/core/models/entity/lear-credential";

export const mandatorFieldsOrder: Array<keyof CommonMandator> = [
  "commonName",
  "country",
  "emailAddress",
  "serialNumber",
  "organization",
  "organizationIdentifier"
];

export function convertToOrderedArray<T extends object, K extends keyof T>(
  obj: T,
  keysOrder: K[]
): Array<{ key: K; value: T[K] }> {
  return keysOrder
    .filter((key): key is K => key in obj)
    .map(key => ({
      key,
      value: obj[key],
    }));
}

import { ValidatorEntryUnion } from "./all-validators";

const baseNameValidatorEntries: ValidatorEntryUnion[] = [
    { name: 'required' },
    { name: 'minLength', args: [2] },
    { name: 'maxLength', args: [50] }
];

export const nameValidatorEntries: ValidatorEntryUnion[] = [
    ...baseNameValidatorEntries,
    { name: 'unicode' }
];

export const orgNameValidatorEntries: ValidatorEntryUnion[] = [
  ...baseNameValidatorEntries,
  { name:'orgName' }
]

export const emailValidatorEntries: ValidatorEntryUnion[] = [
    { name: 'required' },
    { name: 'customEmail' }
];

export const orgIdValidatorEntries: ValidatorEntryUnion[] = [
  { name: 'required' },
  { name:'minLength', args:[7] },
  { name:'maxLength', args:[15] },
  { name:'orgIdentifier'}
];

export const serialNumberValidatorEntries: ValidatorEntryUnion[] = [
  { name: 'minLength', args: [7] },
  { name: 'maxLength', args: [15] },
  { name: 'pattern', args: ["^[a-zA-Z0-9-]+$"] }
]
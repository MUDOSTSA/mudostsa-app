export type UserPosition =
  | "member"
  | "committee_member"
  | "officer"
  | "executive";

export enum SortOrder {
  ascending,
  descending,
}
export enum Endpoint {
  external,
  inventory,
  event,
}

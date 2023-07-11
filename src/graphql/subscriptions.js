/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateEntry = /* GraphQL */ `
  subscription OnCreateEntry(
    $filter: ModelSubscriptionEntryFilterInput
    $owner: String
  ) {
    onCreateEntry(filter: $filter, owner: $owner) {
      date
      type
      contentType
      mediaLink {
        bucket
        region
        key
      }
      text
      titleText
      songName
      artists
      albumLink
      songID
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onUpdateEntry = /* GraphQL */ `
  subscription OnUpdateEntry(
    $filter: ModelSubscriptionEntryFilterInput
    $owner: String
  ) {
    onUpdateEntry(filter: $filter, owner: $owner) {
      date
      type
      contentType
      mediaLink {
        bucket
        region
        key
      }
      text
      titleText
      songName
      artists
      albumLink
      songID
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onDeleteEntry = /* GraphQL */ `
  subscription OnDeleteEntry(
    $filter: ModelSubscriptionEntryFilterInput
    $owner: String
  ) {
    onDeleteEntry(filter: $filter, owner: $owner) {
      date
      type
      contentType
      mediaLink {
        bucket
        region
        key
      }
      text
      titleText
      songName
      artists
      albumLink
      songID
      createdAt
      updatedAt
      owner
    }
  }
`;

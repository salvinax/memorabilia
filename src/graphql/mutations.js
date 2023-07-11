/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createEntry = /* GraphQL */ `
  mutation CreateEntry(
    $input: CreateEntryInput!
    $condition: ModelEntryConditionInput
  ) {
    createEntry(input: $input, condition: $condition) {
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
export const updateEntry = /* GraphQL */ `
  mutation UpdateEntry(
    $input: UpdateEntryInput!
    $condition: ModelEntryConditionInput
  ) {
    updateEntry(input: $input, condition: $condition) {
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
export const deleteEntry = /* GraphQL */ `
  mutation DeleteEntry(
    $input: DeleteEntryInput!
    $condition: ModelEntryConditionInput
  ) {
    deleteEntry(input: $input, condition: $condition) {
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

/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getEntry = /* GraphQL */ `
  query GetEntry($date: AWSDate!) {
    getEntry(date: $date) {
      date
      type
      contentType
      mediaLink
      text
      titleText
      name
      artists
      albumLink
      songLink
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listEntries = /* GraphQL */ `
  query ListEntries(
    $date: AWSDate
    $filter: ModelEntryFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listEntries(
      date: $date
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        date
        type
        contentType
        mediaLink
        text
        titleText
        name
        artists
        albumLink
        songLink
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const entryByDate = /* GraphQL */ `
  query EntryByDate(
    $type: String!
    $date: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelEntryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    entryByDate(
      type: $type
      date: $date
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        date
        type
        contentType
        mediaLink
        text
        titleText
        name
        artists
        albumLink
        songLink
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;

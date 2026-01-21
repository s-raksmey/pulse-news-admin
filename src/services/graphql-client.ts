// src/services/graphql-client.ts
import { GraphQLClient } from "graphql-request"

export function getGqlClient() {
  return new GraphQLClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql"
  )
}

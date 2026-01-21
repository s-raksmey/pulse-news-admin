// src/services/graphql-client.ts
import { GraphQLClient } from "graphql-request"

export function getGqlClient() {
  return new GraphQLClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql"
  )
}

export function getAuthenticatedGqlClient(token?: string) {
  const client = new GraphQLClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql"
  );
  
  // Get token from localStorage if not provided
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('pulse_news_admin_token') : null);
  
  if (authToken) {
    client.setHeader('Authorization', `Bearer ${authToken}`);
  }
  
  return client;
}

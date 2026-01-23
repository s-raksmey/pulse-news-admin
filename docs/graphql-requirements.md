# GraphQL Backend Requirements

## Missing getUserStats Resolver

### Issue Description
The frontend is calling a `getUserStats` GraphQL query that is not implemented on the backend server. This results in an "Unexpected error" with "INTERNAL_SERVER_ERROR" status.

### Required Implementation

#### GraphQL Query Schema
```graphql
type Query {
  getUserStats: UserStats!
}

type UserStats {
  totalUsers: Int!
  activeUsers: Int!
  inactiveUsers: Int!
  usersByRole: UsersByRole!
  recentRegistrations: Int!
}

type UsersByRole {
  admin: Int!
  editor: Int!
  author: Int!
}
```

#### Expected Behavior
The `getUserStats` resolver should:

1. **Calculate Total Users**: Count all users in the system
2. **Calculate Active Users**: Count users where `isActive = true`
3. **Calculate Inactive Users**: Count users where `isActive = false`
4. **Calculate Users by Role**: Count users grouped by their role (ADMIN, EDITOR, AUTHOR)
5. **Calculate Recent Registrations**: Count users created in the last 30 days

#### Sample Response
```json
{
  "data": {
    "getUserStats": {
      "totalUsers": 150,
      "activeUsers": 142,
      "inactiveUsers": 8,
      "usersByRole": {
        "admin": 5,
        "editor": 25,
        "author": 120
      },
      "recentRegistrations": 12
    }
  }
}
```

#### Error Handling
The resolver should handle:
- Database connection errors
- Permission checks (ensure user has admin privileges)
- Return appropriate GraphQL errors for unauthorized access

#### Performance Considerations
- Consider caching the results for a few minutes since user statistics don't change frequently
- Use efficient database queries (COUNT operations)
- Consider using database views or materialized views for better performance

### Frontend Fallback Implementation
The frontend has been updated with fallback mechanisms:
- If `getUserStats` fails, it attempts to calculate basic statistics from the `listUsers` query
- Graceful error handling with user-friendly messages
- Retry functionality for temporary failures

### Testing
Once implemented, test with:
```graphql
query GetUserStats {
  getUserStats {
    totalUsers
    activeUsers
    inactiveUsers
    usersByRole {
      admin
      editor
      author
    }
    recentRegistrations
  }
}
```

### Priority
**High** - This affects the user management dashboard and overall admin experience.


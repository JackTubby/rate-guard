# NPM Package Documentation

## Publishing The Package
- npm init
- npm search <your-package-name> - Confirm the package name is not taken
- npm login - username + password + email
- npm publish --access-public - If package name is scoped / decide if it should be public
- npm publish - Publish if successful should see something similar to + your-package-name@1.0.0

## Updating The Package
- npm version patch - Minor or Major updates
- npm publish

## Common Errors
- “You do not have permission to publish” - The package name is already taken.
- ❌ “Cannot publish over existing version” - Version hasn’t changed — bump it with npm version patch.
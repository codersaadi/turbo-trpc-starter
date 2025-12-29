export * from './r2.module';
export * from './r2.schema';
// This module provides enterprise-grade file storage that scales with your application while maintaining type safety and security best practices.

// Insights:
// Class-based service with dependency injection
// Comprehensive error handling with tRPC-compatible errors
// Async/await throughout with proper error propagation
// Memory-efficient buffer handling

// Advanced File Management
// Pre-signed URL generation for secure uploads
// Batch upload/delete operations
// File metadata management with custom tags
// Automatic key generation with proper structure
// Public/private file support

// Integration Features
// tRPC-ready: Works directly with existing middleware
// Database-aware: Uses  user authentication context
// WebSocket compatible: Can notify users of upload progress
// Subscription-aware: Can check user limits before upload

// The service is designed to work with your existing database tables:
// users.id for user attribution
// recipes.imageUrl for recipe images
// ingredients.imageUrl for ingredient photos
// users.image for profile pictures

# DIAS Services

This directory contains the TypeScript service wrappers that integrate SuperClaude and TaskMaster into the Vibe Lab DIAS (Dynamic Intelligence & Adaptation System).

## Structure

- **ai-orchestrator/** - SuperClaude service wrapper and AI routing
- **task-master/** - TaskMaster CLI integration service
- **context-manager/** - Context preparation and LRU caching
- **mcp-servers/** - MCP server interface wrappers
- **intelligence/** - Intelligence module services
- **memory/** - Multi-layered memory system
- **types/** - TypeScript interfaces and types

## Architecture

These services act as TypeScript wrappers around the external `task-master` CLI, implementing resilience patterns and providing programmatic access to SuperClaude capabilities within the Vibe Lab system.

## Usage

Services implement the standard Vibe Lab service pattern with proper error handling, logging, and monitoring integration.
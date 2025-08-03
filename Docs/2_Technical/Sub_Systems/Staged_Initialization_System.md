# Sub-System: Staged Initialization System

## 1. Overview

The Staged Initialization System is the permanent solution for API performance and responsiveness. It guarantees fast API response times while preserving the full intelligence of the AVCA/DIAS by loading services progressively and routing requests intelligently based on service availability.

## 2. Core Components

*   **`ServiceManager` (`lib/core/service-manager.ts`)**: Manages the lifecycle of all services with circuit breaker protection. It uses a lazy proxy pattern for on-demand loading and handles background retries for failed services, all with a 5-second timeout to prevent API hanging.
*   **`HealthAwareRouter` (`lib/core/health-aware-router.ts`)**: An intelligent router that makes real-time decisions based on service health. It routes requests to the best available primary or fallback service, ensuring graceful degradation of functionality instead of errors.
*   **`VibeLabServices` (`lib/core/vibe-lab-services.ts`)**: The central orchestrator that manages the three-stage progressive enhancement strategy, service dependencies, and provides comprehensive system health reporting.

## 3. Service Loading Stages

1.  **Stage 1: Immediate (0-1s)**
    *   **Services**: EventBus
    *   **Capability**: Basic system connectivity and immediate API response.
2.  **Stage 2: Fast Enhancement (1-5s)**
    *   **Services**: AI Client, Blueprint Service
    *   **Capability**: Core AVCA functionality, including intelligent chat and basic project analysis.
3.  **Stage 3: Background Intelligence (5-30s)**
    *   **Services**: Pattern Recognition, Learning System, Migration Service
    *   **Capability**: Full DIAS intelligence, including advanced learning from interactions.

## 4. API Architecture & Performance Guarantees

*   **Enhanced Chat Route (`/api/onboarding/chat-staged`)**:
    *   **Services**: DIAS (primary), AI Client (fallback).
    *   **Guarantee**: <5 second response time, with graceful fallback to basic chat if DIAS is not ready.
*   **Health Status Route (`/api/health/staged-status`)**:
    *   **Purpose**: Provides real-time monitoring of service status, route readiness, and a matrix of available capabilities.
*   **Performance Commitment**:
    *   A hard 5-second circuit breaker on all service initializations prevents API hanging.
    *   Basic chat functionality is 100% available.
    *   The system provides clear user-facing messages about which capabilities are initializing.

## 5. Key Strategies

*   **Error Handling**: Service initialization failures trigger a circuit breaker and background retries with exponential backoff. Runtime failures result in automatic failover to backup services.
*   **Security**: The system is designed with internal-only service communication. Error messages do not expose sensitive system details, and resource protection is handled via timeouts and circuit breakers.
*   **Monitoring**: Real-time health metrics, including initialization times, failure rates, and routing decisions, are available at the `/dev/monitor` dashboard and the health endpoint.

## 6. Future Enhancements

*   Dynamic timeout adjustment based on service performance.
*   Predictive service pre-loading based on historical usage patterns.
*   Advanced health scoring for more nuanced routing decisions.
*   Distributed service management for multi-instance deployments.

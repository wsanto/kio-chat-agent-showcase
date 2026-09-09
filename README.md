# Kio Chat Agent (showcase excerpt)

An excerpt from a full-stack conversational-agent product: a Next.js frontend and a FastAPI
microservice backend. This repo shows the **auth, chat transport, and service infrastructure on
both sides of the stack** — streaming chat, session management, Supabase auth, and the multi-backend
data layer — as a demonstration of full-stack product engineering, not the agent's cognitive
architecture.

This is a curated excerpt, not the full product: several modules import internals that live in the
private codebase, so this repo is for reading, not running.

## What's included here

**Backend (`backend/app/`, a FastAPI microservice):**
- `api/v1/endpoints/{auth,chat,chat_stream,diagnostics,profile}.py` — the auth, chat, streaming
  chat, health/diagnostics, and profile endpoints
- `core/{config,database}.py`, `api/{dependencies,rate_limiter}.py` — app configuration, DB wiring,
  dependency injection, and rate limiting
- `db/{neo4j_client,postgres,redis_cache}.py` — clients for the three backing stores
- `models/{auth,chat,profile}.py`, `services/{auth,llm,profile}.py` — the generic data models and
  services (auth, LLM client wrapper, profile)

**Frontend (`frontend/`, Next.js):**
- `app/auth/*`, `app/api/auth/*`, `lib/contexts/AuthContext.tsx`, `lib/components/ProtectedRoute.tsx`,
  `lib/supabase/*`, `middleware.ts` — full auth flow (Supabase-backed)
- `app/chat/*`, `app/api/chat/*`, `lib/hooks/{useChat,useStreamingChat}.ts` — chat UI and streaming
  transport
- `components/chain-of-thought-drawer.tsx` — a UI panel for showing agent reasoning steps
- Generic app pages (FAQ, pricing, privacy, trust & safety, onboarding, profile), navigation
  components, and UI primitives

## What was built but isn't shown here

- **Beliefs and goals** — both the backend services/models/endpoints and the frontend hooks/pages
  that track a user's beliefs and goals through conversation.
- **Emotion analysis** — the service that analyzes conversational emotion and the endpoints/hooks
  exposing it.
- **Speech pattern modeling and the core agent orchestration service** — how the agent actually
  composes its personality and responses.

I'm happy to walk through the design of any of these in conversation — they're just not published
as code.

## Stack

Next.js (App Router) + Supabase auth on the frontend; FastAPI + PostgreSQL + Neo4j + Redis on the
backend; streaming chat transport between them.

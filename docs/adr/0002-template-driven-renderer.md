# ADR 0002 — Template-driven renderer

Status: Accepted

## Decision

Paulinha, Emerson Stein and combined artwork use the same image engine. Identity and format differences are represented by template data.

## Why

Candidate-specific rendering components cause duplication and make new formats expensive. A template contract makes new artwork primarily a content/configuration change.

## Consequence

The image engine must not branch on candidate/identity names.

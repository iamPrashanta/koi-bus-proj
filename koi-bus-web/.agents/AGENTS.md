# Container Tooling
- Always use `podman` instead of `docker`.
- When bringing up containers, use `podman compose up -d` instead of `docker compose up -d`.

# Port Mapping
- Always map container ports to host ports prefixed with a 1 (e.g. use 15432 for 5432, 16379 for 6379).

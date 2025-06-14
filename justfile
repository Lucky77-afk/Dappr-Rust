# Default target when `just` is run without arguments
default:
    just --list

# Install dependencies
install:
    #!/usr/bin/env bash
    set -euxo pipefail
    yarn install
    cd app && yarn install

# Start development environment
dev:
    #!/usr/bin/env bash
    set -euxo pipefail
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Build for production
build:
    #!/usr/bin/env bash
    set -euxo pipefail
    docker-compose build

# Run tests
test:
    #!/usr/bin/env bash
    set -euxo pipefail
    docker-compose -f docker-compose.test.yml up --build --exit-code-from test

# Run linter
lint:
    #!/usr/bin/env bash
    set -euxo pipefail
    yarn lint
    cd app && yarn lint

# Format code
format:
    #!/usr/bin/env bash
    set -euxo pipefail
    yarn format
    cd app && yarn format

# Clean build artifacts
clean:
    #!/usr/bin/env bash
    set -euxo pipefail
    rm -rf node_modules
    cd app && rm -rf node_modules
    docker-compose down -v
    docker system prune -f

# Show help
help:
    @echo "Available commands:"
    @echo "  just install    - Install dependencies"
    @echo "  just dev        - Start development environment"
    @echo "  just build      - Build for production"
    @echo "  just test       - Run tests"
    @echo "  just lint       - Run linter"
    @echo "  just format     - Format code"
    @echo "  just clean      - Clean build artifacts"
    @echo "  just help       - Show this help"

# Server Monitoring Suite

A server monitoring system made of three parts: a C++ agent that runs on Linux machines, a Python (FastAPI) backend, and a React frontend. The project is a work in progress. This README describes what is implemented in the repository today.

## Repository layout

```
agent/     C++17 agent: config loading, Ed25519 authentication with the server, /proc metric readers
server/    FastAPI account service (app.py) and agent authentication routes (system/)
server/ingestion/   FastAPI ingestion service that publishes telemetry to Kafka, plus Kafka consumer groups
client/    React + TypeScript frontend (Vite)
```

## Current data flow

```
test_ingestion.sh
      |
      |  POST /v1/ingestion/record  (JSON telemetry batch)
      v
FastAPI ingestion service  --(aiokafka producer)-->  Kafka topic "test.raw"
                                                          |
                                     +--------------------+--------------------+
                                     |                                         |
                          consumer group "storage_writer"          consumer group "spike_checker"
```

## Agent (C++17)

- Reads a JSON config file. Default path: `/usr/local/share/telemetry/config.json`. Override with `--config-file <path>`.
- On first run, the agent authenticates with the server using a challenge-response flow:
  1. Generates an Ed25519 key pair with libsodium.
  2. Sends its public key to the server and receives a nonce.
  3. Signs the nonce with its private key and sends the signature back for verification.
  4. On success, saves the private key to its home directory and marks itself as authenticated in the config file.
- HTTP requests are made with libcurl. JSON is handled with nlohmann/json.
- Metric readers:
  - Memory and swap usage from `/proc/meminfo`
  - Aggregate CPU time counters from `/proc/stat`
- Tests in `agent/tests/` cover config loading, config JSON serialization, and nonce signing.
- Linux only, since metrics are read from `/proc`.

## Server (Python, FastAPI)

### Account service (`server/app.py`)

| Method | Route | Description |
|---|---|---|
| POST | `/app/account/signup` | Checks for duplicate email or username, hashes the password with Argon2id (argon2-cffi) plus a server-side pepper, and stores the account in PostgreSQL |
| POST | `/app/account/signin` | Verifies the password against the stored Argon2id hash |

- The pepper is read from the `ACCOUNT_AUTH_PEPPER` environment variable.
- PostgreSQL access uses an async psycopg connection pool.
- Table definitions are in `server/sql_queries/create_tables.sql`.

### Agent authentication routes (`server/system/agent.py`)

| Method | Route | Description |
|---|---|---|
| GET | `/app/agent/generate` | Creates a new resource ID for an agent |
| POST | `/app/agent/initialize` | Stores the agent's public key and returns a nonce |
| POST | `/app/agent/authenticate` | Verifies the agent's Ed25519 signature of the nonce with PyNaCl. Nonces expire after 2 hours |

These routes are implemented but not yet mounted in `server/app.py`.

### Ingestion service (`server/ingestion/`)

- `POST /v1/ingestion/record` accepts a telemetry batch, validates it with Pydantic, and publishes it to the Kafka topic `test.raw`. Returns `202 Accepted`.
- Batch format: `host_id`, `tenant_id`, and a list of samples. Each sample has a timestamp, per-core CPU usage, average CPU usage, and disk usage.
- Producer: aiokafka with `acks="all"`, idempotence enabled, and `linger_ms=20`. Messages are keyed by `host_id + tenant_id`.
- On startup, the service starts two Kafka consumer groups, `storage_writer` and `spike_checker`. Each runs in its own thread using confluent-kafka and polls up to 500 messages at a time. Both handlers currently print the messages they receive.
- On shutdown, the producer is stopped and the consumer threads are signalled to stop and joined.
- `test_ingestion.sh` sends fake telemetry batches to the service. Settings such as `HOSTS`, `BATCHES`, `SAMPLES`, and `URL` can be overridden with environment variables. `SPIKE=1` makes `host_1` report CPU usage of 95% or higher.

## Client (React 19, TypeScript, Vite)

- Routes: landing page (`/`), sign in (`/signin`), sign up (`/signup`), using react-router.
- The landing page charts are drawn with Chart.js using sample data. They are not connected to the server yet.
- The sign in and sign up forms send requests to the FastAPI server at `http://localhost:8000`.

## Running locally

### Requirements

- Linux
- g++ with C++17, libcurl, libsodium, nlohmann/json
- Python 3 with the packages in `server/requirements.txt`
- PostgreSQL
- Kafka on `localhost:9092`
- Node.js and npm

### Agent

```bash
cd agent
make
./agent --config-file /path/to/config.json
```

### Account service

```bash
cd server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
echo "ACCOUNT_AUTH_PEPPER=<your-random-secret>" > .env
uvicorn app:app --port 8000
```

The PostgreSQL connection string is set in `server/system/utils.py`.

### Ingestion service

```bash
cd server/ingestion
uvicorn app:app --port 8001
./test_ingestion.sh
```

### Client

```bash
cd client
npm install
npm run dev
```

## Not implemented yet

- The agent's metric collection loop is written but not yet called from `main`, so the agent does not send metrics yet.
- The agent authentication routes are not mounted on the server.
- The Kafka consumers print messages. Storage and spike detection logic are not written yet.
- The frontend charts use sample data.

## Tech stack

| Component | Technology |
|---|---|
| Agent | C++17, libcurl, libsodium, nlohmann/json |
| Account service | Python, FastAPI, PostgreSQL (psycopg), argon2-cffi, PyNaCl |
| Ingestion service | Python, FastAPI, Kafka (aiokafka, confluent-kafka), Pydantic |
| Client | React 19, TypeScript, Vite, Chart.js, react-router |

## Author

**Ritesh Tiwari**
LinkedIn: https://www.linkedin.com/in/ritesh-tiwari-67871124a

## License

MIT. See [LICENSE](LICENSE).

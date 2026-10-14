# Lunch-Hour Traffic Spike Report

> Fill this with measured results after running the scenario. Do not fabricate results.

## Run metadata

- Date/time:
- Commit SHA / release:
- Environment (local cluster/cloud):
- Cluster/node limits:
- Load generator/version:
- Test operator:

## Scenario

- Baseline duration and request rate:
- Ramp-up:
- Peak duration:
- Peak target:
- Ramp-down:
- Request mix:
- Failure injection, if any:

## Results

| Metric | Baseline | Peak | Recovery |
|---|---:|---:|---:|
| Request rate | | | |
| Orders created/min | | | |
| p50 latency | | | |
| p95 latency | | | |
| Error rate | | | |
| Order Service replicas | | | |
| Pod restarts | | | |

## Observations

- Did HPA scale up? How long did it take?
- Did the application remain ready?
- What happened to latency and error rate?
- Did Grafana alert fire when expected?
- How quickly did the system recover?
- Were there bottlenecks (CPU, DB connections, downstream service)?
- What are the limitations of this test?

## Evidence

- Grafana dashboard screenshot:
- HPA/pod output:
- Load generator summary:
- CI/release reference:
- Alert event:

## Conclusion

Summarize what worked, what did not, and the next concrete improvement.

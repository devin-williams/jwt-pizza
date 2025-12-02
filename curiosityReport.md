# Curiosity Report: GitHub Actions Caching and Building Scalable CI Pipelines

## 1. Why I Chose This Topic

During my internship as an AI Engineer at Pattern, I worked heavily on improving internal developer tooling, automation, and CI pipelines for multiple services. A recurring challenge we faced was slow and redundant work inside GitHub Actions: large dependency graphs, repeated installation steps, container builds, and multi-service workflows all compounded into long pipeline times. Our team used GitHub Actions as our primary CI/CD system, but caching was only lightly touched on in this course. Because caching had a major impact on performance and scalability during my internship, I wanted to dive deeper into how GitHub Actions caching actually works and how it enables efficient pipelines.

## 2. What I Wanted to Learn

Going into this deep dive, I had several questions based on my real experience:

- How does GitHub Actions caching store and retrieve data between runs?
- What file paths and directories benefit the most from caching?
- How do cache keys control when caches are reused or invalidated?
- How do organizations with many services design consistent caching strategies?
- How can lessons from my internship improve simple workflows like the one in jwt-pizza?

## 3. Background Research

GitHub Actions caching lets you persist files between workflow runs so that expensive steps don't need to be repeated. Common examples include:

- Node.js `node_modules`, npm and pnpm stores
- Internal package caches
- Docker build layers
- Compiled assets or TypeScript build output
- Large package dependency graphs

The caching system is built around a **key**, which identifies each stored cache. When a workflow runs:

1. GitHub checks for an exact key match.
2. If none, it attempts a partial match using restore keys.
3. If still none, the workflow generates a new cache at the end.

All caches are **immutable**, so updating a dependency requires generating a new key. This ensures consistency and prevents stale state from silently leaking into builds.

### Why caching matters in real engineering environments

Without caching, each pipeline run must reinstall dependencies, rebuild Docker layers, and re-fetch all packages from scratch. For a single project this is inconvenient but at Pattern we had:

- multiple services
- shared internal packages
- large dependency trees
- frequent PRs across teams
- nightly workflows
- container-based deployments

When multiplied across dozens of runs, the wasted compute time added up quickly. Caching turned many of these repeated tasks into near-instant operations.

## 4. Real Scenarios From My Internship at Pattern

The following examples reflect the actual problems we encountered and how caching made our CI pipelines more scalable.

### A. Large JavaScript/TypeScript Dependency Graphs

Many internal projects had substantial dependency trees, including dozens of internal shared packages. A fresh `npm ci` without caching routinely took 30-60 seconds, especially when installing:

- internal workspace packages
- packages that rebuilt on install (e.g., native modules)
- TypeScript tooling and dev dependencies

By caching the npm directory:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-${{ hashFiles('package-lock.json') }}
    restore-keys: npm-
```

we brought install times down to 5-10 seconds on warm runs.

### B. Docker Layer Caching for Container-Based Services

Several services deployed as Docker containers and had:

- many build steps
- OS package installs
- internal libraries
- Node/Bun/TypeScript builds
- common base images

A full Docker build on a fresh GitHub runner could take 4-8 minutes.
With GitHub's built-in BuildKit cache:

```bash
docker build \
  --cache-from type=gha \
  --cache-to type=gha,mode=max .
```

warm builds often dropped to 30-45 seconds.

This was one of the most meaningful improvements for team velocity because container rebuilds happened constantly.

### C. Shared Internal Packages Across Multiple Repos

Pattern maintains internal packages that multiple services depend on. Without caching, every single service had to reinstall shared libraries on every run.

Once caching was consistent across repos:

- Shared packages came from cache instead of npm
- Dependency graphs resolved more quickly
- CI became more predictable
- PR feedback loops became noticeably faster

### D. Choosing Effective Cache Keys

We also learned some important lessons around cache key strategies:

**Use the lockfile, never package.json**

Hashing `package-lock.json` ensured caches only invalidated when dependencies actually changed.

**Avoid static cache keys**

Something like:
```yaml
key: "deps"
```
will cause stale and incorrect builds because it never invalidates.

**Use restore-keys for flexibility**

This allows partial matches when only internal versions change.

**Don't cache huge directories**

Too-large caches slow down uploads and restores.
Targeted caches (npm store, specific build folders) were much faster.

## 5. What I Learned

This deep dive helped me connect GitHub's caching mechanism with the real challenges we solved at Pattern. I learned that:

- Dependency installs and Docker builds are the biggest time sinks in CI.
- Proper caching can cut pipeline times by more than half.
- Cache key strategy is critical a good key accelerates builds, a bad one creates subtle bugs.
- Caching works best when it's consistent across repos and services.
- Immutability (new key = new cache) helps maintain reliability at scale.
- Even small improvements compound when many pipelines run per day.
- Caching isn't just an optimization it's essential for scalable CI/CD systems.

## 6. How This Applies to QA / DevOps

Caching supports DevOps principles by:

- **Shortening feedback loops**: Developers get test results faster.
- **Increasing release speed**: Faster CI encourages more frequent merges.
- **Improving reliability**: Cached layers reduce variability between runs.
- **Encouraging thorough testing**: Engineers are more willing to run tests when pipelines are fast.
- **Reducing cost**: Less compute time is used on redundant tasks.

For QA teams, fast and stable pipelines allow tests to run more often and catch regressions earlier.

## 7. References

- [GitHub Actions Caching Docs](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [Docker Buildx Cache Docs](https://docs.docker.com/build/cache/)
- [npm Configuration and Cache Docs](https://docs.npmjs.com/cli/configuring-npm)
- Personal experience from Pattern Engineering
